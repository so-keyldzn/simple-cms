"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";
import {
	ANALYTICS_LIMITS,
	DEFAULT_DAYS_RANGE,
} from "@/lib/analytics-utils";
import { getTranslations } from "next-intl/server";

// User Growth Analytics
export async function getUserGrowth(days: number = DEFAULT_DAYS_RANGE.USER_GROWTH) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		const t = await getTranslations("errors");
		return { data: null, error: t("unauthorized") };
	}

	const t = await getTranslations("errors");

	try {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const users = await prisma.user.findMany({
			where: { createdAt: { gte: startDate } },
			select: { createdAt: true },
			orderBy: { createdAt: "asc" },
		});

		const usersByDay = new Map<string, number>();
		users.forEach((user) => {
			const date = user.createdAt.toISOString().split("T")[0];
			usersByDay.set(date, (usersByDay.get(date) || 0) + 1);
		});

		const data = Array.from(usersByDay.entries()).map(([date, count]) => ({
			date,
			count,
		}));

		return { data, error: null };
	} catch (error) {
		console.error("Error fetching user growth:", error);
		return { data: null, error: t("fetchFailed") };
	}
}

// Comments Trends
export async function getCommentsTrends(days: number = DEFAULT_DAYS_RANGE.COMMENTS_TRENDS) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		const t = await getTranslations("errors");
		return { data: null, error: t("unauthorized") };
	}

	const t = await getTranslations("errors");

	try {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const comments = await prisma.comment.findMany({
			where: { createdAt: { gte: startDate } },
			select: { createdAt: true, status: true },
			orderBy: { createdAt: "asc" },
		});

		const commentsByDay = new Map<string, { approved: number; pending: number; rejected: number }>();

		comments.forEach((comment) => {
			const date = comment.createdAt.toISOString().split("T")[0];
			const current = commentsByDay.get(date) || { approved: 0, pending: 0, rejected: 0 };

			if (comment.status === "APPROVED") current.approved++;
			else if (comment.status === "PENDING") current.pending++;
			else if (comment.status === "REJECTED") current.rejected++;

			commentsByDay.set(date, current);
		});

		const data = Array.from(commentsByDay.entries()).map(([date, stats]) => ({
			date,
			...stats,
		}));

		return { data, error: null };
	} catch (error) {
		console.error("Error fetching comments trends:", error);
		return { data: null, error: t("fetchFailed") };
	}
}

// Media Storage Analytics
export async function getMediaStorageStats() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		const t = await getTranslations("errors");
		return { data: null, error: t("unauthorized") };
	}

	const t = await getTranslations("errors");

	try {
		const [totalSize, mediaByType, topUploadersRaw] = await Promise.all([
			prisma.media.aggregate({ _sum: { size: true } }),
			prisma.media.groupBy({
				by: ["mimeType"],
				_count: true,
				_sum: { size: true },
			}),
			// Optimized: Use aggregation instead of fetching all media
			prisma.media.groupBy({
				by: ["userId"],
				_count: true,
				_sum: { size: true },
				orderBy: { _sum: { size: "desc" } },
				take: ANALYTICS_LIMITS.TOP_UPLOADERS,
			}),
		]);

		// Fetch user details for top uploaders
		const uploaderIds = topUploadersRaw.map((u) => u.userId);
		const users = await prisma.user.findMany({
			where: { id: { in: uploaderIds } },
			select: { id: true, name: true, email: true },
		});

		const userMap = new Map(users.map((u) => [u.id, u]));

		const topUploadersData = topUploadersRaw.map((u) => {
			const user = userMap.get(u.userId);
			return {
				id: u.userId,
				name: user?.name || null,
				email: user?.email || "",
				count: u._count,
				totalSize: u._sum.size || 0,
			};
		});

		const mediaTypes = mediaByType.map((type) => ({
			mimeType: type.mimeType,
			count: type._count,
			size: type._sum.size || 0,
		}));

		return {
			data: {
				totalSize: totalSize._sum.size || 0,
				mediaTypes,
				topUploaders: topUploadersData,
			},
			error: null,
		};
	} catch (error) {
		console.error("Error fetching media storage stats:", error);
		return { data: null, error: t("fetchFailed") };
	}
}

// Content Performance
export async function getContentPerformance() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		const t = await getTranslations("errors");
		return { data: null, error: t("unauthorized") };
	}

	const t = await getTranslations("errors");

	try {
		const [mostCommentedPosts, mostUsedTags, categoryDistribution] = await Promise.all([
			prisma.post.findMany({
				where: { published: true },
				select: {
					id: true,
					title: true,
					_count: { select: { comments: true } },
				},
				orderBy: { comments: { _count: "desc" } },
				take: ANALYTICS_LIMITS.MOST_COMMENTED_POSTS,
			}),
			prisma.tag.findMany({
				select: {
					id: true,
					name: true,
					_count: { select: { posts: true } },
				},
				orderBy: { posts: { _count: "desc" } },
				take: ANALYTICS_LIMITS.MOST_USED_TAGS,
			}),
			prisma.category.findMany({
				select: {
					id: true,
					name: true,
					_count: { select: { posts: true } },
				},
				orderBy: { posts: { _count: "desc" } },
			}),
		]);

		return {
			data: {
				mostCommentedPosts,
				mostUsedTags,
				categoryDistribution,
			},
			error: null,
		};
	} catch (error) {
		console.error("Error fetching content performance:", error);
		return { data: null, error: t("fetchFailed") };
	}
}

// User Activity Stats
export async function getUserActivityStats() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		const t = await getTranslations("errors");
		return { data: null, error: t("unauthorized") };
	}

	const t = await getTranslations("errors");

	try {
		const [activeAuthors, usersByRole, bannedUsers] = await Promise.all([
			prisma.user.findMany({
				where: { posts: { some: {} } },
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					_count: {
						select: {
							posts: true,
							comments: true,
							media: true,
						},
					},
				},
				orderBy: { posts: { _count: "desc" } },
				take: ANALYTICS_LIMITS.ACTIVE_AUTHORS,
			}),
			prisma.user.groupBy({
				by: ["role"],
				_count: true,
			}),
			prisma.user.count({ where: { banned: true } }),
		]);

		const roleDistribution = usersByRole.map((role) => ({
			role: role.role || "user",
			count: role._count,
		}));

		return {
			data: {
				activeAuthors,
				roleDistribution,
				bannedUsers,
			},
			error: null,
		};
	} catch (error) {
		console.error("Error fetching user activity stats:", error);
		return { data: null, error: t("fetchFailed") };
	}
}

// Publishing Frequency
export async function getPublishingFrequency(days: number = DEFAULT_DAYS_RANGE.PUBLISHING_FREQUENCY) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		const t = await getTranslations("errors");
		return { data: null, error: t("unauthorized") };
	}

	const t = await getTranslations("errors");

	try {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const posts = await prisma.post.findMany({
			where: {
				published: true,
				publishedAt: { gte: startDate },
			},
			select: { publishedAt: true },
			orderBy: { publishedAt: "asc" },
		});

		// Group by week (French locale: Monday = start of week)
		const postsByWeek = new Map<string, number>();
		posts.forEach((post) => {
			if (post.publishedAt) {
				const date = new Date(post.publishedAt);
				const weekStart = new Date(date);
				const day = weekStart.getDay();
				// Convert Sunday (0) to 7, then subtract to get Monday
				const diff = day === 0 ? -6 : 1 - day;
				weekStart.setDate(weekStart.getDate() + diff);
				weekStart.setHours(0, 0, 0, 0);
				const weekKey = weekStart.toISOString().split("T")[0];
				postsByWeek.set(weekKey, (postsByWeek.get(weekKey) || 0) + 1);
			}
		});

		const data = Array.from(postsByWeek.entries()).map(([week, count]) => ({
			week,
			count,
		}));

		return { data, error: null };
	} catch (error) {
		console.error("Error fetching publishing frequency:", error);
		return { data: null, error: t("fetchFailed") };
	}
}

// Navigation Menu Stats
export async function getNavigationStats() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		const t = await getTranslations("errors");
		return { data: null, error: t("unauthorized") };
	}

	const t = await getTranslations("errors");

	try {
		const [menuCount, itemCount, activeMenus] = await Promise.all([
			prisma.navigationMenu.count(),
			prisma.navigationItem.count(),
			prisma.navigationMenu.findMany({
				where: { isActive: true },
				select: {
					id: true,
					name: true,
					label: true,
					_count: { select: { items: true } },
				},
			}),
		]);

		return {
			data: {
				totalMenus: menuCount,
				totalItems: itemCount,
				activeMenus,
			},
			error: null,
		};
	} catch (error) {
		console.error("Error fetching navigation stats:", error);
		return { data: null, error: t("fetchFailed") };
	}
}
