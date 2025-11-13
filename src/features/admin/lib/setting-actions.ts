"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

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
	const t = await getTranslations("errors");

	try {
		const settings = await prisma.setting.findMany({
			orderBy: [{ category: "asc" }, { key: "asc" }],
		});

		return { data: settings, error: null };
	} catch (error) {
		console.error("Error fetching settings:", error);
		return { data: null, error: t("fetchSettingsFailed") };
	}
}

// Get settings by category
export async function getSettingsByCategory(category: SettingCategory) {
	const t = await getTranslations("errors");

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: t("unauthorized") };
	}

	try {
		const settings = await prisma.setting.findMany({
			where: { category },
			orderBy: { key: "asc" },
		});

		return { data: settings, error: null };
	} catch (error) {
		console.error("Error fetching settings by category:", error);
		return { data: null, error: t("fetchSettingsFailed") };
	}
}

// Get a single setting by key
export async function getSetting(key: string) {
	const t = await getTranslations("errors");

	try {
		const setting = await prisma.setting.findUnique({
			where: { key },
		});

		return { data: setting, error: null };
	} catch (error) {
		console.error("Error fetching setting:", error);
		return { data: null, error: t("fetchSettingFailed") };
	}
}

// Update or create a setting
export async function upsertSetting(
	key: string,
	value: string,
	category: SettingCategory = "general"
) {
	const t = await getTranslations("errors");

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: t("unauthorized") };
	}

	const userRoles = session.user.role?.split(",") || [];
	const isAdmin = userRoles.includes("admin") || userRoles.includes("super-admin");

	if (!isAdmin) {
		return { data: null, error: t("accessDeniedAdmin") };
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
		return { data: null, error: t("updateSettingFailed") };
	}
}

// Update multiple settings at once
export async function updateSettings(settings: Array<{ key: string; value: string; category: SettingCategory }>) {
	const t = await getTranslations("errors");

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: t("unauthorized") };
	}

	const userRoles = session.user.role?.split(",") || [];
	const isAdmin = userRoles.includes("admin") || userRoles.includes("super-admin");

	if (!isAdmin) {
		return { data: null, error: t("accessDeniedAdmin") };
	}

	try {
		const results = await Promise.all(
			settings.map((setting) =>
				prisma.setting.upsert({
					where: { key: setting.key },
					update: { value: setting.value, category: setting.category },
					create: { key: setting.key, value: setting.value, category: setting.category },
				})
			)
		);

		revalidatePath("/admin/settings");
		revalidatePath("/", "layout");
		return { data: results, error: null };
	} catch (error) {
		console.error("Error updating settings:", error);
		return { data: null, error: t("updateSettingsFailed") };
	}
}

// Delete a setting
export async function deleteSetting(id: string) {
	const t = await getTranslations("errors");

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: t("unauthorized") };
	}

	const userRoles = session.user.role?.split(",") || [];
	const isAdmin = userRoles.includes("admin") || userRoles.includes("super-admin");

	if (!isAdmin) {
		return { data: null, error: t("accessDeniedAdmin") };
	}

	try {
		await prisma.setting.delete({
			where: { id },
		});

		revalidatePath("/admin/settings");
		return { data: true, error: null };
	} catch (error) {
		console.error("Error deleting setting:", error);
		return { data: null, error: t("deleteSettingFailed") };
	}
}
