"use server";

import { auth } from "@/features/auth/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { forceRefreshAdminIds } from "@/features/auth/lib/admin-ids";

export async function listUsersAction(options?: {
	limit?: number;
	offset?: number;
	searchValue?: string;
	searchField?: "name" | "email";
	searchOperator?: "contains" | "starts_with" | "ends_with";
}) {
	try {
		// Check if user is authenticated and has admin access
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: "Non autorisé" };
		}

		const userRoles = session.user.role?.split(",") || [];
		const hasAccess = ["admin", "super-admin"].some((role) =>
			userRoles.includes(role)
		);

		if (!hasAccess) {
			return { data: null, error: "Accès refusé" };
		}

		const isSuperAdmin = userRoles.includes("super-admin");

		// Build search filter
		const where: any = {};
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
	} catch (error: any) {
		console.error("Error listing users:", error);
		return { data: null, error: error.message || "Échec de la récupération des utilisateurs" };
	}
}

export async function createUserAction(data: {
	name: string;
	email: string;
	password: string;
	role: string;
}) {
	try {
		// Check if user is authenticated and has super-admin access
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: "Non autorisé" };
		}

		const userRoles = session.user.role?.split(",") || [];
		const isSuperAdmin = userRoles.includes("super-admin");
		const isAdmin = userRoles.includes("admin");

		// Only super-admins and admins can create users
		if (!isSuperAdmin && !isAdmin) {
			return { data: null, error: "Seuls les administrateurs peuvent créer des utilisateurs" };
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

		// If created user is admin or super-admin, refresh the admin IDs cache
		if (data.role === "admin" || data.role === "super-admin") {
			await forceRefreshAdminIds();
			console.log("✅ Cache des IDs admin rafraîchi automatiquement");
		}

		return { data: user, error: null };
	} catch (error: any) {
		console.error("Error creating user:", error);
		return { data: null, error: error.message || "Erreur lors de la création de l'utilisateur" };
	}
}

export async function setRoleAction(userId: string, role: string) {
	try {
		// Check current user's session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: "Non autorisé" };
		}

		const currentUserRoles = session.user.role?.split(",") || [];
		const isSuperAdmin = currentUserRoles.includes("super-admin");

		// Get target user to check their current role
		const targetUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});

		if (!targetUser) {
			return { data: null, error: "Utilisateur non trouvé" };
		}

		const targetUserRoles = targetUser.role?.split(",") || [];
		const targetIsSuperAdmin = targetUserRoles.includes("super-admin");

		// Only super-admins can modify super-admin roles
		if (targetIsSuperAdmin && !isSuperAdmin) {
			return {
				data: null,
				error: "Seul un super-admin peut modifier le rôle d'un super-admin",
			};
		}

		const result = await auth.api.setRole({
			body: { userId, role: role as any }, // Force type to accept custom roles
			headers: await headers(),
		});

		// If setting admin or super-admin role, refresh the admin IDs cache
		if (role === "admin" || role === "super-admin") {
			await forceRefreshAdminIds();
			console.log("✅ Cache des IDs admin rafraîchi automatiquement");
		}

		return { data: result, error: null };
	} catch (error: any) {
		console.error("Error setting role:", error);
		return { data: null, error: error.message || "Failed to set role" };
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
	} catch (error: any) {
		console.error("Error banning user:", error);
		return { error: error.message || "Failed to ban user" };
	}
}

export async function unbanUserAction(userId: string) {
	try {
		await auth.api.unbanUser({
			body: { userId },
			headers: await headers(),
		});

		return { error: null };
	} catch (error: any) {
		console.error("Error unbanning user:", error);
		return { error: error.message || "Failed to unban user" };
	}
}

export async function deleteUserAction(userId: string) {
	try {
		await auth.api.removeUser({
			body: { userId },
			headers: await headers(),
		});

		return { error: null };
	} catch (error: any) {
		console.error("Error deleting user:", error);
		return { error: error.message || "Failed to delete user" };
	}
}

export async function impersonateUserAction(userId: string) {
	try {
		// Check current user's session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: "Non autorisé" };
		}

		// Check if user is currently impersonating (has impersonatedBy field)
		const isCurrentlyImpersonating = !!(session as any).user.impersonatedBy;

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
			return { data: null, error: "Utilisateur non trouvé" };
		}

		const targetUserRoles = targetUser.role?.split(",") || [];
		const targetIsSuperAdmin = targetUserRoles.includes("super-admin");

		// Only super-admins can impersonate super-admins
		if (targetIsSuperAdmin && !isSuperAdmin) {
			return {
				data: null,
				error: "Seul un super-admin peut se faire passer pour un super-admin",
			};
		}

		const result = await auth.api.impersonateUser({
			body: { userId },
			headers: await headers(),
		});

		return { data: result, error: null };
	} catch (error: any) {
		console.error("❌ Error impersonating user:", error);
		return { data: null, error: error.message || "Failed to impersonate user" };
	}
}
