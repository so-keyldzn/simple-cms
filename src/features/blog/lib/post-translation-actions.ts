"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/features/i18n/lib/helpers";
import type { Locale } from "@/features/i18n/lib/i18n-config";

/**
 * Créer ou mettre à jour une traduction de post
 */
export async function upsertPostTranslationAction(data: {
	postId: string;
	locale: Locale;
	title: string;
	excerpt?: string;
	content: string;
}) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: "Non autorisé" };
		}

		const slug = generateSlug(data.title);

		const translation = await prisma.postTranslation.upsert({
			where: {
				postId_locale: {
					postId: data.postId,
					locale: data.locale,
				},
			},
			create: {
				postId: data.postId,
				locale: data.locale,
				title: data.title,
				slug,
				excerpt: data.excerpt,
				content: data.content,
			},
			update: {
				title: data.title,
				slug,
				excerpt: data.excerpt,
				content: data.content,
			},
		});

		revalidatePath("/admin/posts");
		revalidatePath(`/${data.locale}/blog`);

		return { data: translation, error: null };
	} catch (error: any) {
		console.error("Error upserting post translation:", error);
		return { data: null, error: error.message };
	}
}

/**
 * Supprimer une traduction de post
 */
export async function deletePostTranslationAction(
	postId: string,
	locale: Locale,
) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: "Non autorisé" };
		}

		await prisma.postTranslation.delete({
			where: {
				postId_locale: {
					postId,
					locale,
				},
			},
		});

		revalidatePath("/admin/posts");
		revalidatePath(`/${locale}/blog`);

		return { data: true, error: null };
	} catch (error: any) {
		console.error("Error deleting post translation:", error);
		return { data: null, error: error.message };
	}
}

/**
 * Récupérer un post avec ses traductions
 */
export async function getPostWithTranslationsAction(
	postId: string,
	locale?: Locale,
) {
	try {
		const post = await prisma.post.findUnique({
			where: { id: postId },
			include: {
				author: { select: { name: true, email: true } },
				category: {
					include: {
						translations: true,
					},
				},
				tags: {
					include: {
						tag: {
							include: {
								translations: true,
							},
						},
					},
				},
				translations: true,
			},
		});

		if (!post) {
			return { data: null, error: "Post introuvable" };
		}

		// Si une locale est spécifiée, retourner la traduction appropriée
		if (locale) {
			const translation = post.translations.find((t) => t.locale === locale);
			return {
				data: {
					...post,
					...(translation && {
						title: translation.title,
						slug: translation.slug,
						excerpt: translation.excerpt,
						content: translation.content,
					}),
					translations: post.translations,
				},
				error: null,
			};
		}

		return { data: post, error: null };
	} catch (error: any) {
		console.error("Error getting post with translations:", error);
		return { data: null, error: error.message };
	}
}

/**
 * Lister les posts pour une locale donnée
 */
export async function listPostsByLocaleAction(options?: {
	locale: Locale;
	limit?: number;
	offset?: number;
	search?: string;
	published?: boolean;
}) {
	try {
		const locale = options?.locale || "fr";

		const where = {
			...(options?.search && {
				OR: [
					{ title: { contains: options.search, mode: "insensitive" as const } },
					{
						excerpt: {
							contains: options.search,
							mode: "insensitive" as const,
						},
					},
					{
						translations: {
							some: {
								locale,
								OR: [
									{
										title: {
											contains: options.search,
											mode: "insensitive" as const,
										},
									},
									{
										excerpt: {
											contains: options.search,
											mode: "insensitive" as const,
										},
									},
								],
							},
						},
					},
				],
			}),
			...(options?.published !== undefined && {
				published: options.published,
			}),
		};

		const [posts, total] = await Promise.all([
			prisma.post.findMany({
				where,
				include: {
					author: { select: { name: true, email: true } },
					category: {
						include: {
							translations: {
								where: { locale },
							},
						},
					},
					tags: {
						include: {
							tag: {
								include: {
									translations: {
										where: { locale },
									},
								},
							},
						},
					},
					translations: {
						where: { locale },
					},
				},
				orderBy: { createdAt: "desc" },
				take: options?.limit || 50,
				skip: options?.offset || 0,
			}),
			prisma.post.count({ where }),
		]);

		// Mapper les posts avec les traductions appropriées
		const translatedPosts = posts.map((post) => {
			const translation = post.translations[0];
			return {
				...post,
				...(translation && {
					title: translation.title,
					slug: translation.slug,
					excerpt: translation.excerpt,
					content: translation.content,
				}),
				category: post.category
					? {
							...post.category,
							...(post.category.translations[0] && {
								name: post.category.translations[0].name,
								slug: post.category.translations[0].slug,
								description: post.category.translations[0].description,
							}),
					  }
					: null,
				tags: post.tags.map((postTag) => ({
					...postTag,
					tag: {
						...postTag.tag,
						...(postTag.tag.translations[0] && {
							name: postTag.tag.translations[0].name,
							slug: postTag.tag.translations[0].slug,
						}),
					},
				})),
			};
		});

		return { data: { posts: translatedPosts, total }, error: null };
	} catch (error: any) {
		console.error("Error listing posts by locale:", error);
		return { data: null, error: error.message };
	}
}

/**
 * Récupérer un post par son slug avec traduction
 */
export async function getPostBySlugAction(slug: string, locale: Locale) {
	try {
		// Chercher d'abord dans le post principal
		let post = await prisma.post.findUnique({
			where: { slug },
			include: {
				author: { select: { name: true, email: true, image: true } },
				category: {
					include: {
						translations: {
							where: { locale },
						},
					},
				},
				tags: {
					include: {
						tag: {
							include: {
								translations: {
									where: { locale },
								},
							},
						},
					},
				},
				translations: true,
			},
		});

		// Si pas trouvé, chercher dans les traductions
		if (!post) {
			const translation = await prisma.postTranslation.findFirst({
				where: { slug, locale },
				include: {
					post: {
						include: {
							author: { select: { name: true, email: true, image: true } },
							category: {
								include: {
									translations: {
										where: { locale },
									},
								},
							},
							tags: {
								include: {
									tag: {
										include: {
											translations: {
												where: { locale },
											},
										},
									},
								},
							},
							translations: true,
						},
					},
				},
			});

			if (translation) {
				post = translation.post;
			}
		}

		if (!post) {
			return { data: null, error: "Post introuvable" };
		}

		// Appliquer la traduction appropriée
		const translation = post.translations.find((t) => t.locale === locale);

		return {
			data: {
				...post,
				...(translation && {
					title: translation.title,
					slug: translation.slug,
					excerpt: translation.excerpt,
					content: translation.content,
				}),
				category: post.category
					? {
							...post.category,
							...(post.category.translations[0] && {
								name: post.category.translations[0].name,
								slug: post.category.translations[0].slug,
								description: post.category.translations[0].description,
							}),
					  }
					: null,
				tags: post.tags.map((postTag) => ({
					...postTag,
					tag: {
						...postTag.tag,
						...(postTag.tag.translations[0] && {
							name: postTag.tag.translations[0].name,
							slug: postTag.tag.translations[0].slug,
						}),
					},
				})),
			},
			error: null,
		};
	} catch (error: any) {
		console.error("Error getting post by slug:", error);
		return { data: null, error: error.message };
	}
}
