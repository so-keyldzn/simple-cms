"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";
import { revalidatePath } from "next/cache";

export type Media = {
	id: string;
	filename: string;
	originalName: string;
	url: string;
	mimeType: string;
	size: number;
	width?: number | null;
	height?: number | null;
	alt?: string | null;
	caption?: string | null;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
};

// Get all media files with optional folder filter
export async function getAllMedia(folderId?: string | null) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: "Non autorisé" };
	}

	const userRoles = session.user.role?.split(",") || [];
	const hasAccess = ["admin", "super-admin", "editor", "author"].some((role) =>
		userRoles.includes(role)
	);

	if (!hasAccess) {
		return { data: null, error: "Accès refusé" };
	}

	try {
		const where = folderId !== undefined ? { folderId } : {};

		const media = await prisma.media.findMany({
			where,
			orderBy: { createdAt: "desc" },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				folder: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
		});

		return { data: media, error: null };
	} catch (error) {
		console.error("Error fetching media:", error);
		return { data: null, error: "Erreur lors de la récupération des médias" };
	}
}

// Get media by ID
export async function getMediaById(id: string) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: "Non autorisé" };
	}

	try {
		const media = await prisma.media.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		if (!media) {
			return { data: null, error: "Média non trouvé" };
		}

		return { data: media, error: null };
	} catch (error) {
		console.error("Error fetching media:", error);
		return { data: null, error: "Erreur lors de la récupération du média" };
	}
}

// Create media entry
export async function createMedia(data: {
	filename: string;
	originalName: string;
	url: string;
	mimeType: string;
	size: number;
	width?: number;
	height?: number;
	alt?: string;
	caption?: string;
	folderId?: string | null;
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: "Non autorisé" };
	}

	const userRoles = session.user.role?.split(",") || [];
	const hasAccess = ["admin", "super-admin", "editor", "author"].some((role) =>
		userRoles.includes(role)
	);

	if (!hasAccess) {
		return { data: null, error: "Accès refusé" };
	}

	try {
		const media = await prisma.media.create({
			data: {
				...data,
				userId: session.user.id,
			},
		});

		revalidatePath("/admin/media");
		return { data: media, error: null };
	} catch (error) {
		console.error("Error creating media:", error);
		return { data: null, error: "Erreur lors de la création du média" };
	}
}

// Update media
export async function updateMedia(
	id: string,
	data: {
		originalName?: string;
		alt?: string;
		caption?: string;
	}
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: "Non autorisé" };
	}

	const userRoles = session.user.role?.split(",") || [];
	const hasAccess = ["admin", "super-admin", "editor", "author"].some((role) =>
		userRoles.includes(role)
	);

	if (!hasAccess) {
		return { data: null, error: "Accès refusé" };
	}

	try {
		const media = await prisma.media.update({
			where: { id },
			data,
		});

		revalidatePath("/admin/media");
		return { data: media, error: null };
	} catch (error) {
		console.error("Error updating media:", error);
		return { data: null, error: "Erreur lors de la mise à jour du média" };
	}
}

// Rename media file
export async function renameMedia(id: string, newName: string) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: "Non autorisé" };
	}

	const userRoles = session.user.role?.split(",") || [];
	const hasAccess = ["admin", "super-admin", "editor", "author"].some((role) =>
		userRoles.includes(role)
	);

	if (!hasAccess) {
		return { data: null, error: "Accès refusé" };
	}

	// Validate filename
	if (!newName || newName.trim() === "") {
		return { data: null, error: "Le nom du fichier ne peut pas être vide" };
	}

	// Sanitize filename
	const sanitizedName = newName.replace(/[^a-zA-Z0-9.-_]/g, "-");

	try {
		const media = await prisma.media.update({
			where: { id },
			data: {
				originalName: sanitizedName,
			},
		});

		revalidatePath("/admin/media");
		return { data: media, error: null };
	} catch (error) {
		console.error("Error renaming media:", error);
		return { data: null, error: "Erreur lors du renommage du média" };
	}
}

// Delete media
export async function deleteMedia(id: string) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: "Non autorisé" };
	}

	const userRoles = session.user.role?.split(",") || [];
	const hasAccess = ["admin", "super-admin", "editor", "author"].some((role) =>
		userRoles.includes(role)
	);

	if (!hasAccess) {
		return { data: null, error: "Accès refusé" };
	}

	try {
		await prisma.media.delete({
			where: { id },
		});

		revalidatePath("/admin/media");
		return { data: true, error: null };
	} catch (error) {
		console.error("Error deleting media:", error);
		return { data: null, error: "Erreur lors de la suppression du média" };
	}
}
