"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export async function listPostsAction(options?: {
	limit?: number;
	offset?: number;
	search?: string;
	published?: boolean;
}) {
	try {
		const t = await getTranslations("errors");
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		const where = {
			...(options?.search && {
				OR: [
					{ title: { contains: options.search, mode: "insensitive" as const } },
					{ excerpt: { contains: options.search, mode: "insensitive" as const } },
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
					category: { select: { id: true, name: true } },
					tags: { include: { tag: true } },
				},
				orderBy: { createdAt: "desc" },
				take: options?.limit || 50,
				skip: options?.offset || 0,
			}),
			prisma.post.count({ where }),
		]);

		return { data: { posts, total }, error: null };
	} catch (error: unknown) {
		console.error("Error listing posts:", error);
		return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
	}
}

export async function createPostAction(data: {
	title: string;
	excerpt?: string;
	content: string;
	coverImage?: string;
	published?: boolean;
	commentsEnabled?: boolean;
	categoryId?: string;
	tags?: string[];
}) {
	try {
		const t = await getTranslations("errors");
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		const slug = generateSlug(data.title);

		const post = await prisma.post.create({
			data: {
				title: data.title,
				slug,
				excerpt: data.excerpt,
				content: data.content,
				coverImage: data.coverImage,
				published: data.published || false,
				commentsEnabled: data.commentsEnabled !== undefined ? data.commentsEnabled : true,
				publishedAt: data.published ? new Date() : null,
				authorId: session.user.id,
				categoryId: data.categoryId,
				tags: data.tags
					? {
							create: data.tags.map((tagId) => ({
								tag: { connect: { id: tagId } },
							})),
					  }
					: undefined,
			},
			include: {
				author: { select: { name: true, email: true } },
				category: true,
				tags: { include: { tag: true } },
			},
		});

		revalidatePath("/admin/posts");
		revalidatePath("/blog");

		return { data: post, error: null };
	} catch (error: unknown) {
		console.error("Error creating post:", error);
		return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
	}
}

export async function updatePostAction(
	id: string,
	data: {
		title?: string;
		excerpt?: string;
		content?: string;
		coverImage?: string;
		published?: boolean;
		commentsEnabled?: boolean;
		categoryId?: string | null;
		tags?: string[];
	}
) {
	try {
		const t = await getTranslations("errors");
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		const updateData: Record<string, unknown> = {
			...(data.title && { title: data.title, slug: generateSlug(data.title) }),
			...(data.excerpt !== undefined && { excerpt: data.excerpt }),
			...(data.content !== undefined && { content: data.content }),
			...(data.coverImage !== undefined && { coverImage: data.coverImage }),
			...(data.published !== undefined && {
				published: data.published,
				publishedAt: data.published ? new Date() : null,
			}),
			...(data.commentsEnabled !== undefined && { commentsEnabled: data.commentsEnabled }),
			...(data.categoryId !== undefined && { categoryId: data.categoryId }),
		};

		if (data.tags) {
			await prisma.postTag.deleteMany({ where: { postId: id } });
			updateData.tags = {
				create: data.tags.map((tagId) => ({
					tag: { connect: { id: tagId } },
				})),
			};
		}

		const post = await prisma.post.update({
			where: { id },
			data: updateData,
			include: {
				author: { select: { name: true, email: true } },
				category: true,
				tags: { include: { tag: true } },
			},
		});

		revalidatePath("/admin/posts");
		revalidatePath("/blog");

		return { data: post, error: null };
	} catch (error: unknown) {
		console.error("Error updating post:", error);
		return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
	}
}

export async function deletePostAction(id: string) {
	try {
		const t = await getTranslations("errors");
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		await prisma.post.delete({ where: { id } });

		revalidatePath("/admin/posts");
		revalidatePath("/blog");

		return { data: true, error: null };
	} catch (error: unknown) {
		console.error("Error deleting post:", error);
		return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
	}
}

export async function listCategoriesAction() {
	try {
		const categories = await prisma.category.findMany({
			orderBy: { name: "asc" },
			include: { _count: { select: { posts: true } } },
		});

		return { data: categories, error: null };
	} catch (error: unknown) {
		console.error("Error listing categories:", error);
		return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
	}
}

export async function listTagsAction() {
	try {
		const tags = await prisma.tag.findMany({
			orderBy: { name: "asc" },
			include: { _count: { select: { posts: true } } },
		});

		return { data: tags, error: null };
	} catch (error: unknown) {
		console.error("Error listing tags:", error);
		return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
	}
}
