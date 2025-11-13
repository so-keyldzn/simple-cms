"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export async function listTagsAction() {
	try {
		const tags = await prisma.tag.findMany({
			orderBy: { name: "asc" },
			include: { _count: { select: { posts: true } } },
		});

		return { data: tags, error: null };
	} catch (error: unknown) {
		console.error("Error listing tags:", error);
		return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
	}
}

export async function createTagAction(data: { name: string }) {
	try {
		const t = await getTranslations("errors");
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		const slug = generateSlug(data.name);

		const tag = await prisma.tag.create({
			data: {
				name: data.name,
				slug,
			},
		});

		revalidatePath("/admin/tags");

		return { data: tag, error: null };
	} catch (error: unknown) {
		console.error("Error creating tag:", error);
		return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
	}
}

export async function updateTagAction(id: string, data: { name: string }) {
	try {
		const t = await getTranslations("errors");
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		const tag = await prisma.tag.update({
			where: { id },
			data: {
				name: data.name,
				slug: generateSlug(data.name),
			},
		});

		revalidatePath("/admin/tags");

		return { data: tag, error: null };
	} catch (error: unknown) {
		console.error("Error updating tag:", error);
		return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
	}
}

export async function deleteTagAction(id: string) {
	try {
		const t = await getTranslations("errors");
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		// Retirer le tag de tous les articles avant de le supprimer
		await prisma.postTag.deleteMany({
			where: { tagId: id },
		});

		await prisma.tag.delete({ where: { id } });

		revalidatePath("/admin/tags");

		return { data: true, error: null };
	} catch (error: unknown) {
		console.error("Error deleting tag:", error);
		return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
	}
}
