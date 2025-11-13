"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/features/i18n/lib/helpers";
import type { Locale } from "@/features/i18n/lib/i18n-config";
import { getTranslations } from "next-intl/server";

/**
 * Créer ou mettre à jour une traduction de tag
 */
export async function upsertTagTranslationAction(data: {
	tagId: string;
	locale: Locale;
	name: string;
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

		const translation = await prisma.tagTranslation.upsert({
			where: {
				tagId_locale: {
					tagId: data.tagId,
					locale: data.locale,
				},
			},
			create: {
				tagId: data.tagId,
				locale: data.locale,
				name: data.name,
				slug,
			},
			update: {
				name: data.name,
				slug,
			},
		});

		revalidatePath("/admin/tags");
		revalidatePath(`/${data.locale}/blog`);

		return { data: translation, error: null };
	} catch (error) {
		console.error("Error upserting tag translation:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		return { data: null, error: errorMessage };
	}
}

/**
 * Lister les tags pour une locale donnée
 */
export async function listTagsByLocaleAction(locale: Locale) {
	try {
		const tags = await prisma.tag.findMany({
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
		const translatedTags = tags.map((tag) => {
			const translation = tag.translations[0];
			return {
				...tag,
				...(translation && {
					name: translation.name,
					slug: translation.slug,
				}),
			};
		});

		return { data: translatedTags, error: null };
	} catch (error) {
		console.error("Error listing tags by locale:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		return { data: null, error: errorMessage };
	}
}
