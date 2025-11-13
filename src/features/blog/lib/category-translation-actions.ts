"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/features/i18n/lib/helpers";
import type { Locale } from "@/features/i18n/lib/i18n-config";
import { getTranslations } from "next-intl/server";

/**
 * Créer ou mettre à jour une traduction de catégorie
 */
export async function upsertCategoryTranslationAction(data: {
	categoryId: string;
	locale: Locale;
	name: string;
	description?: string;
}) {
	try {
		const t = await getTranslations("errors");
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		const slug = generateSlug(data.name);

		const translation = await prisma.categoryTranslation.upsert({
			where: {
				categoryId_locale: {
					categoryId: data.categoryId,
					locale: data.locale,
				},
			},
			create: {
				categoryId: data.categoryId,
				locale: data.locale,
				name: data.name,
				slug,
				description: data.description,
			},
			update: {
				name: data.name,
				slug,
				description: data.description,
			},
		});

		revalidatePath("/admin/categories");
		revalidatePath(`/${data.locale}/blog`);

		return { data: translation, error: null };
	} catch (error: unknown) {
		console.error("Error upserting category translation:", error);
		return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
	}
}

/**
 * Lister les catégories pour une locale donnée
 */
export async function listCategoriesByLocaleAction(locale: Locale) {
	try {
		const categories = await prisma.category.findMany({
			include: {
				translations: {
					where: { locale },
				},
				_count: {
					select: { posts: true },
				},
			},
			orderBy: { name: "asc" },
		});

		// Mapper avec traductions
		const translatedCategories = categories.map((category) => {
			const translation = category.translations[0];
			return {
				...category,
				...(translation && {
					name: translation.name,
					slug: translation.slug,
					description: translation.description,
				}),
			};
		});

		return { data: translatedCategories, error: null };
	} catch (error: unknown) {
		console.error("Error listing categories by locale:", error);
		return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
	}
}
