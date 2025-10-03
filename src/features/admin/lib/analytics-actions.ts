"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";

export type AnalyticsStats = {
	totalPosts: number;
	publishedPosts: number;
	draftPosts: number;
	totalCategories: number;
	totalTags: number;
	totalComments: number;
	pendingComments: number;
	approvedComments: number;
	rejectedComments: number;
	totalUsers: number;
	totalMedia: number;
};

export type PostStats = {
	date: string;
	count: number;
};

export type TopCategory = {
	id: string;
	name: string;
	_count: {
		posts: number;
	};
};

export type TopAuthor = {
	id: string;
	name: string | null;
	email: string;
	_count: {
		posts: number;
	};
};

// Get global analytics stats
export async function getAnalyticsStats() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: "Non autorisé" };
	}

	try {
		const [
			totalPosts,
			publishedPosts,
			totalCategories,
			totalTags,
			totalComments,
			pendingComments,
			approvedComments,
			rejectedComments,
			totalUsers,
			totalMedia,
		] = await Promise.all([
			prisma.post.count(),
			prisma.post.count({ where: { published: true } }),
			prisma.category.count(),
			prisma.tag.count(),
			prisma.comment.count(),
			prisma.comment.count({ where: { status: "PENDING" } }),
			prisma.comment.count({ where: { status: "APPROVED" } }),
			prisma.comment.count({ where: { status: "REJECTED" } }),
			prisma.user.count(),
			prisma.media.count(),
		]);

		const stats: AnalyticsStats = {
			totalPosts,
			publishedPosts,
			draftPosts: totalPosts - publishedPosts,
			totalCategories,
			totalTags,
			totalComments,
			pendingComments,
			approvedComments,
			rejectedComments,
			totalUsers,
			totalMedia,
		};

		return { data: stats, error: null };
	} catch (error) {
		console.error("Error fetching analytics stats:", error);
		return { data: null, error: "Erreur lors de la récupération des statistiques" };
	}
}

// Get posts per day for the last 30 days
export async function getPostsPerDay(days: number = 30) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: "Non autorisé" };
	}

	try {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const posts = await prisma.post.findMany({
			where: {
				createdAt: {
					gte: startDate,
				},
			},
			select: {
				createdAt: true,
			},
			orderBy: {
				createdAt: "asc",
			},
		});

		// Group by day
		const postsByDay = new Map<string, number>();

		posts.forEach((post) => {
			const date = post.createdAt.toISOString().split("T")[0];
			postsByDay.set(date, (postsByDay.get(date) || 0) + 1);
		});

		const stats: PostStats[] = Array.from(postsByDay.entries()).map(
			([date, count]) => ({
				date,
				count,
			})
		);

		return { data: stats, error: null };
	} catch (error) {
		console.error("Error fetching posts per day:", error);
		return { data: null, error: "Erreur lors de la récupération des statistiques" };
	}
}

// Get top categories by post count
export async function getTopCategories(limit: number = 5) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: "Non autorisé" };
	}

	try {
		const categories = await prisma.category.findMany({
			select: {
				id: true,
				name: true,
				_count: {
					select: { posts: true },
				},
			},
			orderBy: {
				posts: {
					_count: "desc",
				},
			},
			take: limit,
		});

		return { data: categories, error: null };
	} catch (error) {
		console.error("Error fetching top categories:", error);
		return { data: null, error: "Erreur lors de la récupération des catégories" };
	}
}

// Get top authors by post count
export async function getTopAuthors(limit: number = 5) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: "Non autorisé" };
	}

	try {
		const authors = await prisma.user.findMany({
			where: {
				posts: {
					some: {},
				},
			},
			select: {
				id: true,
				name: true,
				email: true,
				_count: {
					select: { posts: true },
				},
			},
			orderBy: {
				posts: {
					_count: "desc",
				},
			},
			take: limit,
		});

		return { data: authors, error: null };
	} catch (error) {
		console.error("Error fetching top authors:", error);
		return { data: null, error: "Erreur lors de la récupération des auteurs" };
	}
}

// Get recent activity (posts, comments)
export async function getRecentActivity(limit: number = 10) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: "Non autorisé" };
	}

	try {
		const [recentPosts, recentComments] = await Promise.all([
			prisma.post.findMany({
				take: limit,
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					title: true,
					published: true,
					createdAt: true,
					author: {
						select: {
							name: true,
						},
					},
				},
			}),
			prisma.comment.findMany({
				take: limit,
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					content: true,
					status: true,
					createdAt: true,
					author: {
						select: {
							name: true,
						},
					},
					post: {
						select: {
							title: true,
						},
					},
				},
			}),
		]);

		const activity = [
			...recentPosts.map((post) => ({
				id: post.id,
				type: "post" as const,
				title: post.title,
				subtitle: `Par ${post.author?.name || "Inconnu"}`,
				status: post.published ? "published" : "draft",
				createdAt: post.createdAt,
			})),
			...recentComments.map((comment) => ({
				id: comment.id,
				type: "comment" as const,
				title: comment.content.substring(0, 50) + (comment.content.length > 50 ? "..." : ""),
				subtitle: `Sur "${comment.post.title}" par ${comment.author?.name || "Inconnu"}`,
				status: comment.status.toLowerCase(),
				createdAt: comment.createdAt,
			})),
		].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);

		return { data: activity, error: null };
	} catch (error) {
		console.error("Error fetching recent activity:", error);
		return { data: null, error: "Erreur lors de la récupération de l'activité récente" };
	}
}
