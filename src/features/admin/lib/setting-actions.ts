"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";
import { revalidatePath } from "next/cache";

type SettingCategory = "general" | "seo" | "email" | "advanced";

export type Setting = {
	id: string;
	key: string;
	value: string;
	category: string;
	createdAt: Date;
	updatedAt: Date;
};

// Get all settings
export async function getSettings() {
	try {
		const settings = await prisma.setting.findMany({
			orderBy: [{ category: "asc" }, { key: "asc" }],
		});

		return { data: settings, error: null };
	} catch (error) {
		console.error("Error fetching settings:", error);
		return { data: null, error: "Erreur lors de la récupération des paramètres" };
	}
}

// Get settings by category
export async function getSettingsByCategory(category: SettingCategory) {
	try {
		const settings = await prisma.setting.findMany({
			where: { category },
			orderBy: { key: "asc" },
		});

		return { data: settings, error: null };
	} catch (error) {
		console.error("Error fetching settings by category:", error);
		return { data: null, error: "Erreur lors de la récupération des paramètres" };
	}
}

// Get a single setting by key
export async function getSetting(key: string) {
	try {
		const setting = await prisma.setting.findUnique({
			where: { key },
		});

		return { data: setting, error: null };
	} catch (error) {
		console.error("Error fetching setting:", error);
		return { data: null, error: "Erreur lors de la récupération du paramètre" };
	}
}

// Update or create a setting
export async function upsertSetting(
	key: string,
	value: string,
	category: SettingCategory = "general"
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: "Non autorisé" };
	}

	const userRoles = session.user.role?.split(",") || [];
	const isAdmin = userRoles.includes("admin") || userRoles.includes("super-admin");

	if (!isAdmin) {
		return { data: null, error: "Accès refusé. Réservé aux administrateurs." };
	}

	try {
		const setting = await prisma.setting.upsert({
			where: { key },
			update: { value },
			create: { key, value, category },
		});

		revalidatePath("/admin/settings");
		return { data: setting, error: null };
	} catch (error) {
		console.error("Error upserting setting:", error);
		return { data: null, error: "Erreur lors de la mise à jour du paramètre" };
	}
}

// Update multiple settings at once
export async function updateSettings(settings: Array<{ key: string; value: string; category: SettingCategory }>) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: "Non autorisé" };
	}

	const userRoles = session.user.role?.split(",") || [];
	const isAdmin = userRoles.includes("admin") || userRoles.includes("super-admin");

	if (!isAdmin) {
		return { data: null, error: "Accès refusé. Réservé aux administrateurs." };
	}

	try {
		const results = await Promise.all(
			settings.map((setting) =>
				prisma.setting.upsert({
					where: { key: setting.key },
					update: { value: setting.value },
					create: { key: setting.key, value: setting.value, category: setting.category },
				})
			)
		);

		revalidatePath("/admin/settings");
		return { data: results, error: null };
	} catch (error) {
		console.error("Error updating settings:", error);
		return { data: null, error: "Erreur lors de la mise à jour des paramètres" };
	}
}

// Delete a setting
export async function deleteSetting(id: string) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: "Non autorisé" };
	}

	const userRoles = session.user.role?.split(",") || [];
	const isAdmin = userRoles.includes("admin") || userRoles.includes("super-admin");

	if (!isAdmin) {
		return { data: null, error: "Accès refusé. Réservé aux administrateurs." };
	}

	try {
		await prisma.setting.delete({
			where: { id },
		});

		revalidatePath("/admin/settings");
		return { data: true, error: null };
	} catch (error) {
		console.error("Error deleting setting:", error);
		return { data: null, error: "Erreur lors de la suppression du paramètre" };
	}
}
