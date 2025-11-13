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

export async function listCategoriesAction() {
	try {
		const categories = await prisma.category.findMany({
			orderBy: { name: "asc" },
			include: { _count: { select: { posts: true } } },
		});

		return { data: categories, error: null };
	} catch (error: unknown) {
		console.error("Error listing categories:", error);
		return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
	}
}

export async function createCategoryAction(data: {
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

		const category = await prisma.category.create({
			data: {
				name: data.name,
				slug,
				description: data.description,
			},
		});

		revalidatePath("/admin/categories");

		return { data: category, error: null };
	} catch (error: unknown) {
		console.error("Error creating category:", error);
		return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
	}
}

export async function updateCategoryAction(
	id: string,
	data: {
		name?: string;
		description?: string;
	}
) {
	try {
		const t = await getTranslations("errors");
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		const updateData: Record<string, unknown> = {
			...(data.name && { name: data.name, slug: generateSlug(data.name) }),
			...(data.description !== undefined && { description: data.description }),
		};

		const category = await prisma.category.update({
			where: { id },
			data: updateData,
		});

		revalidatePath("/admin/categories");

		return { data: category, error: null };
	} catch (error: unknown) {
		console.error("Error updating category:", error);
		return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
	}
}

export async function deleteCategoryAction(id: string) {
	try {
		const t = await getTranslations("errors");
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: t("unauthorized") };
		}

		// Retirer la catégorie de tous les articles avant de la supprimer
		await prisma.post.updateMany({
			where: { categoryId: id },
			data: { categoryId: null },
		});

		await prisma.category.delete({ where: { id } });

		revalidatePath("/admin/categories");

		return { data: true, error: null };
	} catch (error: unknown) {
		console.error("Error deleting category:", error);
		return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
	}
}
