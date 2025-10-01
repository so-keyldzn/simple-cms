"use server";

import { auth } from "@/features/auth/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

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

		// Get total count
		const total = await prisma.user.count({ where });

		return {
			data: {
				users,
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
		const result = await auth.api.createUser({
			body: {
				email: data.email,
				password: data.password,
				name: data.name,
				role: data.role as any, // Force type to accept custom roles
				data: {},
			},
			headers: await headers(),
		});

		return { data: result, error: null };
	} catch (error: any) {
		console.error("Error creating user:", error);
		return { data: null, error: error.message || "Failed to create user" };
	}
}

export async function setRoleAction(userId: string, role: string) {
	try {
		const result = await auth.api.setRole({
			body: { userId, role: role as any }, // Force type to accept custom roles
			headers: await headers(),
		});

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
		const result = await auth.api.impersonateUser({
			body: { userId },
			headers: await headers(),
		});

		return { data: result, error: null };
	} catch (error: any) {
		console.error("Error impersonating user:", error);
		return { data: null, error: error.message || "Failed to impersonate user" };
	}
}
