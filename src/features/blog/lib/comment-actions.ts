"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";
import { revalidatePath } from "next/cache";
import { hasPermission } from "@/lib/roles";
import { getTranslations } from "next-intl/server";

// Types pour les réponses
type ActionResult<T> = {
	data: T | null;
	error: string | null;
};

// Type pour un commentaire avec relations
export type CommentWithRelations = {
	id: string;
	content: string;
	status: "PENDING" | "APPROVED" | "REJECTED";
	createdAt: Date;
	author: {
		id: string;
		name: string;
		email: string;
		image: string | null;
	};
	post: {
		id: string;
		title: string;
		slug: string;
	};
	_count: {
		replies: number;
	};
};

/**
 * Créer un nouveau commentaire (ACTION PUBLIQUE)
 * Vérifie que l'utilisateur est connecté et que les commentaires sont activés
 */
export async function createCommentAction(data: {
	postId: string;
	content: string;
	parentId?: string;
}): Promise<ActionResult<unknown>> {
	const t = await getTranslations("errors");

	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("mustBeAuthenticatedToComment") };
		}

		// Validation et sanitization du contenu
		const trimmedContent = data.content.trim();
		if (trimmedContent.length < 3) {
			return {
				data: null,
				error: t("commentMinLength"),
			};
		}

		if (trimmedContent.length > 5000) {
			return {
				data: null,
				error: t("commentMaxLength"),
			};
		}

		// Sanitization basique contre XSS (enlever les balises HTML)
		const sanitizedContent = trimmedContent
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
			.replace(/<[^>]+>/g, "");

		// Rate limiting : vérifier qu'un utilisateur ne poste pas trop de commentaires
		const recentComments = await prisma.comment.count({
			where: {
				authorId: session.user.id,
				createdAt: {
					gte: new Date(Date.now() - 60 * 1000), // Dernière minute
				},
			},
		});

		if (recentComments >= 5) {
			return {
				data: null,
				error: t("commentRateLimit"),
			};
		}

		// Vérifier que le post existe et que les commentaires sont activés
		const post = await prisma.post.findUnique({
			where: { id: data.postId },
			select: { id: true, commentsEnabled: true, published: true },
		});

		if (!post) {
			return { data: null, error: t("articleNotFound") };
		}

		if (!post.published) {
			return { data: null, error: t("cannotCommentOnDraft") };
		}

		if (!post.commentsEnabled) {
			return {
				data: null,
				error: t("commentsDisabledOnPost"),
			};
		}

		// Si c'est une réponse, vérifier que le commentaire parent existe
		if (data.parentId) {
			const parentComment = await prisma.comment.findUnique({
				where: { id: data.parentId },
				select: { id: true, postId: true },
			});

			if (!parentComment) {
				return { data: null, error: t("parentCommentNotFound") };
			}

			if (parentComment.postId !== data.postId) {
				return {
					data: null,
					error: t("parentCommentNotBelongToPost"),
				};
			}
		}

		// Récupérer les métadonnées de la requête
		const headersList = await headers();
		const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
		const userAgent = headersList.get("user-agent") || "unknown";

		// Créer le commentaire
		const comment = await prisma.comment.create({
			data: {
				content: sanitizedContent,
				postId: data.postId,
				authorId: session.user.id,
				parentId: data.parentId || null,
				ipAddress,
				userAgent,
				status: "PENDING", // Par défaut en attente de modération
			},
			include: {
				author: {
					select: {
						id: true,
						name: true,
						email: true,
						image: true,
					},
				},
			},
		});

		revalidatePath(`/blog/[slug]`, "page");

		return {
			data: comment,
			error: null,
		};
	} catch (error: unknown) {
		console.error("Error creating comment:", error);
		return {
			data: null,
			error: t("createCommentFailed"),
		};
	}
}

/**
 * Lister les commentaires APPROUVÉS d'un post (ACTION PUBLIQUE)
 * Retourne une structure hiérarchique (commentaires + réponses)
 * Optimisé pour éviter les requêtes N+1
 */
export async function listPostCommentsAction(
	postId: string
): Promise<ActionResult<unknown[]>> {
	const t = await getTranslations("errors");

	try {
		// Récupérer TOUS les commentaires approuvés du post en une seule requête
		const allComments = await prisma.comment.findMany({
			where: {
				postId,
				status: "APPROVED",
			},
			include: {
				author: {
					select: {
						id: true,
						name: true,
						email: true,
						image: true,
					},
				},
			},
			orderBy: {
				createdAt: "asc",
			},
		});

		// Construire la hiérarchie manuellement (évite N+1)
		const commentMap = new Map();
		const topLevelComments: unknown[] = [];

		// Première passe : créer la map
		allComments.forEach((comment) => {
			commentMap.set(comment.id, { ...comment, replies: [] });
		});

		// Deuxième passe : construire la hiérarchie
		allComments.forEach((comment) => {
			const commentWithReplies = commentMap.get(comment.id);
			if (comment.parentId) {
				const parent = commentMap.get(comment.parentId);
				if (parent) {
					parent.replies.push(commentWithReplies);
				}
			} else {
				topLevelComments.push(commentWithReplies);
			}
		});

		// Inverser l'ordre des top-level pour afficher les plus récents en premier
		topLevelComments.reverse();

		return { data: topLevelComments, error: null };
	} catch (error: unknown) {
		console.error("Error listing comments:", error);
		return { data: null, error: t("fetchCommentsFailed") };
	}
}

/**
 * Lister TOUS les commentaires avec filtres (ACTION ADMIN)
 */
export async function listAllCommentsAction(options?: {
	status?: "PENDING" | "APPROVED" | "REJECTED";
	search?: string;
	limit?: number;
	offset?: number;
}): Promise<ActionResult<{ comments: CommentWithRelations[]; total: number }>> {
	const t = await getTranslations("errors");

	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		// Vérifier les permissions
		if (!hasPermission(session.user.role, "canManageComments")) {
			return {
				data: null,
				error: t("noPermissionToManageComments"),
			};
		}

		const where: Record<string, unknown> = {
			...(options?.status && { status: options.status }),
			...(options?.search && {
				OR: [
					{ content: { contains: options.search, mode: "insensitive" as const } },
					{
						author: {
							name: { contains: options.search, mode: "insensitive" as const },
						},
					},
					{
						author: {
							email: { contains: options.search, mode: "insensitive" as const },
						},
					},
				],
			}),
		};

		const [comments, total] = await Promise.all([
			prisma.comment.findMany({
				where,
				include: {
					author: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
						},
					},
					post: {
						select: {
							id: true,
							title: true,
							slug: true,
						},
					},
					_count: {
						select: {
							replies: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				take: options?.limit || 50,
				skip: options?.offset || 0,
			}),
			prisma.comment.count({ where }),
		]);

		return { data: { comments, total }, error: null };
	} catch (error: unknown) {
		console.error("Error listing all comments:", error);
		return { data: null, error: t("fetchCommentsFailed") };
	}
}

/**
 * Mettre à jour le statut d'un commentaire (ACTION ADMIN)
 */
export async function updateCommentStatusAction(
	commentId: string,
	status: "PENDING" | "APPROVED" | "REJECTED"
): Promise<ActionResult<unknown>> {
	const t = await getTranslations("errors");

	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		if (!hasPermission(session.user.role, "canManageComments")) {
			return {
				data: null,
				error: t("noPermissionToModerateComments"),
			};
		}

		const comment = await prisma.comment.update({
			where: { id: commentId },
			data: { status },
			include: {
				author: {
					select: {
						id: true,
						name: true,
						email: true,
						image: true,
					},
				},
				post: {
					select: {
						id: true,
						title: true,
						slug: true,
					},
				},
			},
		});

		revalidatePath("/admin/comments");
		revalidatePath(`/blog/[slug]`, "page");

		return { data: comment, error: null };
	} catch (error: unknown) {
		console.error("Error updating comment status:", error);
		return {
			data: null,
			error: t("updateCommentFailed"),
		};
	}
}

/**
 * Supprimer un commentaire (ACTION ADMIN)
 * Supprime également toutes les réponses (cascade)
 */
export async function deleteCommentAction(
	commentId: string
): Promise<ActionResult<boolean>> {
	const t = await getTranslations("errors");

	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		if (!hasPermission(session.user.role, "canManageComments")) {
			return {
				data: null,
				error: t("noPermissionToDeleteComments"),
			};
		}

		await prisma.comment.delete({
			where: { id: commentId },
		});

		revalidatePath("/admin/comments");
		revalidatePath(`/blog/[slug]`, "page");

		return { data: true, error: null };
	} catch (error: unknown) {
		console.error("Error deleting comment:", error);
		return {
			data: null,
			error: t("deleteCommentFailed"),
		};
	}
}

/**
 * Activer/Désactiver les commentaires pour un post (ACTION ADMIN/AUTHOR)
 */
export async function togglePostCommentsAction(
	postId: string,
	enabled: boolean
): Promise<ActionResult<unknown>> {
	const t = await getTranslations("errors");

	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		// Vérifier que l'utilisateur peut éditer ce post
		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { authorId: true },
		});

		if (!post) {
			return { data: null, error: t("articleNotFound") };
		}

		// Soit l'auteur du post, soit un admin/editor
		const canEdit =
			post.authorId === session.user.id ||
			hasPermission(session.user.role, "canEditAnyPost");

		if (!canEdit) {
			return {
				data: null,
				error: t("noPermissionToEditPost"),
			};
		}

		const updatedPost = await prisma.post.update({
			where: { id: postId },
			data: { commentsEnabled: enabled },
		});

		revalidatePath("/admin/posts");
		revalidatePath(`/blog/[slug]`, "page");

		return { data: updatedPost, error: null };
	} catch (error: unknown) {
		console.error("Error toggling comments:", error);
		return {
			data: null,
			error: t("updateCommentSettingsFailed"),
		};
	}
}

/**
 * Obtenir les statistiques des commentaires (ACTION ADMIN)
 */
export async function getCommentsStatsAction(): Promise<
	ActionResult<{
		total: number;
		pending: number;
		approved: number;
		rejected: number;
	}>
> {
	const t = await getTranslations("errors");

	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		if (!hasPermission(session.user.role, "canManageComments")) {
			return {
				data: null,
				error: t("noPermissionToViewStats"),
			};
		}

		const [total, pending, approved, rejected] = await Promise.all([
			prisma.comment.count(),
			prisma.comment.count({ where: { status: "PENDING" } }),
			prisma.comment.count({ where: { status: "APPROVED" } }),
			prisma.comment.count({ where: { status: "REJECTED" } }),
		]);

		return {
			data: { total, pending, approved, rejected },
			error: null,
		};
	} catch (error: unknown) {
		console.error("Error getting comments stats:", error);
		return {
			data: null,
			error: t("fetchStatsFailed"),
		};
	}
}
