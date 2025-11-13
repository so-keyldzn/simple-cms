"use server";

import { auth } from "@/features/auth/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import type { Prisma } from "@/generated/prisma";

export async function listUsersAction(options?: {
	limit?: number;
	offset?: number;
	searchValue?: string;
	searchField?: "name" | "email";
	searchOperator?: "contains" | "starts_with" | "ends_with";
}) {
	try {
		const t = await getTranslations("errors");

		// Check if user is authenticated and has admin access
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		const userRoles = session.user.role?.split(",") || [];
		const hasAccess = ["admin", "super-admin"].some((role) =>
			userRoles.includes(role)
		);

		if (!hasAccess) {
			return { data: null, error: t("accessDenied") };
		}

		const isSuperAdmin = userRoles.includes("super-admin");

		// Build search filter
		const where: Prisma.UserWhereInput = {};
		if (options?.searchValue) {
			const field = options.searchField || "name";
			const operator = options.searchOperator || "contains";

			if (operator === "contains") {
				where[field] = { contains: options.searchValue, mode: "insensitive" };
			} else if (operator === "starts_with") {
				where[field] = { startsWith: options.searchValue, mode: "insensitive" };
			} else if (operator === "ends_with") {
				where[field] = { endsWith: options.searchValue, mode: "insensitive" };
			}
		}

		// Get users from database
		const users = await prisma.user.findMany({
			where,
			take: options?.limit || 50,
			skip: options?.offset || 0,
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				name: true,
				email: true,
				emailVerified: true,
				image: true,
				role: true,
				banned: true,
				banReason: true,
				banExpires: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		// Filter out super-admins if current user is not a super-admin
		const filteredUsers = isSuperAdmin
			? users
			: users.filter((user) => {
					const roles = user.role?.split(",") || [];
					return !roles.includes("super-admin");
			  });

		// Get total count (accounting for super-admin filter)
		let total = await prisma.user.count({ where });
		if (!isSuperAdmin) {
			// Subtract super-admins from total count
			const superAdminCount = await prisma.user.count({
				where: {
					...where,
					role: { contains: "super-admin" },
				},
			});
			total = total - superAdminCount;
		}

		return {
			data: {
				users: filteredUsers,
				total,
			},
			error: null,
		};
	} catch (error: unknown) {
		console.error("Error listing users:", error);
		const t = await getTranslations("errors");
		return { data: null, error: error instanceof Error ? error.message : t("fetchUsersFailed") };
	}
}

export async function createUserAction(data: {
	name: string;
	email: string;
	password: string;
	role: string;
}) {
	try {
		const t = await getTranslations("errors");

		// Check if user is authenticated and has super-admin access
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		const userRoles = session.user.role?.split(",") || [];
		const isSuperAdmin = userRoles.includes("super-admin");
		const isAdmin = userRoles.includes("admin");

		// Only super-admins and admins can create users
		if (!isSuperAdmin && !isAdmin) {
			return { data: null, error: t("onlyAdminsCanCreateUsers") };
		}

		// Hash password using Better Auth's crypto module
		const { hashPassword } = await import("better-auth/crypto");
		const hashedPassword = await hashPassword(data.password);

		// Generate a unique user ID
		const { generateId } = await import("better-auth");
		const userId = generateId();

		// Create user directly in database
		const user = await prisma.user.create({
			data: {
				id: userId,
				email: data.email,
				name: data.name,
				role: data.role,
				emailVerified: true, // Auto-verify admin-created users
				image: null,
			},
		});

		// Create account record with password
		await prisma.account.create({
			data: {
				id: generateId(),
				userId: user.id,
				accountId: user.id,
				providerId: "credential",
				password: hashedPassword,
			},
		});

		// Role is automatically managed by Better Auth adminRoles configuration
		return { data: user, error: null };
	} catch (error: unknown) {
		console.error("Error creating user:", error);
		const t = await getTranslations("errors");
		return { data: null, error: error instanceof Error ? error.message : t("createUserFailed") };
	}
}

export async function setRoleAction(userId: string, role: string) {
	try {
		const t = await getTranslations("errors");

		// Check current user's session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		const currentUserRoles = session.user.role?.split(",") || [];
		const isSuperAdmin = currentUserRoles.includes("super-admin");

		// Get target user to check their current role
		const targetUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});

		if (!targetUser) {
			return { data: null, error: t("userNotFound") };
		}

		const targetUserRoles = targetUser.role?.split(",") || [];
		const targetIsSuperAdmin = targetUserRoles.includes("super-admin");

		// Only super-admins can modify super-admin roles
		if (targetIsSuperAdmin && !isSuperAdmin) {
			return {
				data: null,
				error: t("onlySuperAdminCanModifySuperAdmin"),
			};
		}

		const result = await auth.api.setRole({
			body: { userId, role },
			headers: await headers(),
		});

		// Role is automatically managed by Better Auth adminRoles configuration
		return { data: result, error: null };
	} catch (error: unknown) {
		console.error("Error setting role:", error);
		const t = await getTranslations("errors");
		return { data: null, error: error instanceof Error ? error.message : t("setRoleFailed") };
	}
}

export async function banUserAction(
	userId: string,
	banReason?: string,
	banExpiresIn?: number
) {
	try {
		await auth.api.banUser({
			body: { userId, banReason, banExpiresIn },
			headers: await headers(),
		});

		return { error: null };
	} catch (error: unknown) {
		console.error("Error banning user:", error);
		const t = await getTranslations("errors");
		return { error: error instanceof Error ? error.message : t("banUserFailed") };
	}
}

export async function unbanUserAction(userId: string) {
	try {
		await auth.api.unbanUser({
			body: { userId },
			headers: await headers(),
		});

		return { error: null };
	} catch (error: unknown) {
		console.error("Error unbanning user:", error);
		const t = await getTranslations("errors");
		return { error: error instanceof Error ? error.message : t("unbanUserFailed") };
	}
}

export async function deleteUserAction(userId: string) {
	try {
		await auth.api.removeUser({
			body: { userId },
			headers: await headers(),
		});

		return { error: null };
	} catch (error: unknown) {
		console.error("Error deleting user:", error);
		const t = await getTranslations("errors");
		return { error: error instanceof Error ? error.message : t("deleteUserFailed") };
	}
}

export async function impersonateUserAction(userId: string) {
	try {
		const t = await getTranslations("errors");

		// Check current user's session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		// Check if user is currently impersonating (has impersonatedBy field)
		const isCurrentlyImpersonating = !!(session as { user: { impersonatedBy?: string } }).user.impersonatedBy;

		// If de-impersonating (going back to original account), allow it regardless of roles
		if (isCurrentlyImpersonating) {
			const result = await auth.api.impersonateUser({
				body: { userId },
				headers: await headers(),
			});
			return { data: result, error: null };
		}

		// For starting impersonation, check permissions
		const currentUserRoles = session.user.role?.split(",") || [];
		const isSuperAdmin = currentUserRoles.includes("super-admin");

		// Get target user to check their role
		const targetUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});

		if (!targetUser) {
			return { data: null, error: t("userNotFound") };
		}

		const targetUserRoles = targetUser.role?.split(",") || [];
		const targetIsSuperAdmin = targetUserRoles.includes("super-admin");

		// Only super-admins can impersonate super-admins
		if (targetIsSuperAdmin && !isSuperAdmin) {
			return {
				data: null,
				error: t("onlySuperAdminCanImpersonateSuperAdmin"),
			};
		}

		const result = await auth.api.impersonateUser({
			body: { userId },
			headers: await headers(),
		});

		return { data: result, error: null };
	} catch (error: unknown) {
		console.error("❌ Error impersonating user:", error);
		const t = await getTranslations("errors");
		return { data: null, error: error instanceof Error ? error.message : t("impersonateUserFailed") };
	}
}
