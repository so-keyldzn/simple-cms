"use server";

import { auth } from "@/features/auth/lib/auth";
import { headers } from "next/headers";

export async function listUsersAction(options?: {
	limit?: number;
	offset?: number;
	searchValue?: string;
	searchField?: "name" | "email";
	searchOperator?: "contains" | "starts_with" | "ends_with";
}) {
	try {
		const result = await auth.api.listUsers({
			query: {
				limit: options?.limit?.toString(),
				offset: options?.offset?.toString(),
				searchValue: options?.searchValue,
				searchField: options?.searchField || "name",
				searchOperator: options?.searchOperator || "contains",
			},
			headers: await headers(),
		});

		return { data: result, error: null };
	} catch (error: any) {
		console.error("Error listing users:", error);
		return { data: null, error: error.message || "Failed to list users" };
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
