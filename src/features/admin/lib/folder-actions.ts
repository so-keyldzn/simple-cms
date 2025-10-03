"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";
import { revalidatePath } from "next/cache";

export type MediaFolder = {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	parentId?: string | null;
	order: number;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
};

export type MediaFolderWithChildren = MediaFolder & {
	children: MediaFolderWithChildren[];
	_count?: {
		media: number;
	};
};

// Helper function to generate unique slug
function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // Remove accents
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

// Helper function to check access permissions
async function checkMediaAccess() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { session: null, error: "Non autorisé" };
	}

	const userRoles = session.user.role?.split(",") || [];
	const hasAccess = ["admin", "super-admin", "editor", "author"].some((role) =>
		userRoles.includes(role)
	);

	if (!hasAccess) {
		return { session: null, error: "Accès refusé" };
	}

	return { session, error: null };
}

// Get all folders with hierarchy
export async function getAllFolders() {
	const { session, error } = await checkMediaAccess();
	if (error) {
		return { data: null, error };
	}

	try {
		const folders = await prisma.mediaFolder.findMany({
			orderBy: [{ order: "asc" }, { createdAt: "desc" }],
			include: {
				_count: {
					select: { media: true },
				},
			},
		});

		// Build hierarchy
		const folderMap = new Map<string, MediaFolderWithChildren>();
		const rootFolders: MediaFolderWithChildren[] = [];

		// First pass: create map of all folders
		folders.forEach((folder) => {
			folderMap.set(folder.id, { ...folder, children: [] });
		});

		// Second pass: build hierarchy
		folders.forEach((folder) => {
			const folderWithChildren = folderMap.get(folder.id)!;
			if (folder.parentId) {
				const parent = folderMap.get(folder.parentId);
				if (parent) {
					parent.children.push(folderWithChildren);
				}
			} else {
				rootFolders.push(folderWithChildren);
			}
		});

		return { data: rootFolders, error: null };
	} catch (error) {
		console.error("Error fetching folders:", error);
		return { data: null, error: "Erreur lors de la récupération des dossiers" };
	}
}

// Get folder by ID
export async function getFolderById(id: string) {
	const { session, error } = await checkMediaAccess();
	if (error) {
		return { data: null, error };
	}

	try {
		const folder = await prisma.mediaFolder.findUnique({
			where: { id },
			include: {
				_count: {
					select: { media: true, children: true },
				},
				parent: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
		});

		if (!folder) {
			return { data: null, error: "Dossier non trouvé" };
		}

		return { data: folder, error: null };
	} catch (error) {
		console.error("Error fetching folder:", error);
		return { data: null, error: "Erreur lors de la récupération du dossier" };
	}
}

// Create folder
export async function createFolder(data: {
	name: string;
	description?: string;
	parentId?: string;
}) {
	const { session, error } = await checkMediaAccess();
	if (error) {
		return { data: null, error };
	}

	// Validate name
	if (!data.name || data.name.trim() === "") {
		return { data: null, error: "Le nom du dossier ne peut pas être vide" };
	}

	try {
		// Check depth limit if parent exists
		if (data.parentId) {
			let depth = 0;
			let currentId: string | null = data.parentId;
			const MAX_DEPTH = 10;

			while (currentId && depth < MAX_DEPTH) {
				const parent = await prisma.mediaFolder.findUnique({
					where: { id: currentId },
					select: { parentId: true },
				});
				if (!parent) break;
				currentId = parent.parentId;
				depth++;
			}

			if (depth >= MAX_DEPTH) {
				return {
					data: null,
					error: "Profondeur maximale de dossiers atteinte (max 10 niveaux)",
				};
			}
		}

		// Generate slug
		const slug = generateSlug(data.name);

		// Check if slug already exists in the same parent
		const existing = await prisma.mediaFolder.findFirst({
			where: {
				slug,
				parentId: data.parentId || null,
			},
		});

		if (existing) {
			return {
				data: null,
				error: "Un dossier avec ce nom existe déjà dans ce dossier parent",
			};
		}

		// Get next order number
		const lastFolder = await prisma.mediaFolder.findFirst({
			where: { parentId: data.parentId || null },
			orderBy: { order: "desc" },
		});

		const order = lastFolder ? lastFolder.order + 1 : 0;

		// Create folder
		const folder = await prisma.mediaFolder.create({
			data: {
				name: data.name.trim(),
				slug,
				description: data.description?.trim() || null,
				parentId: data.parentId || null,
				order,
				userId: session!.user.id,
			},
		});

		revalidatePath("/admin/media");
		return { data: folder, error: null };
	} catch (error) {
		console.error("Error creating folder:", error);
		return { data: null, error: "Erreur lors de la création du dossier" };
	}
}

// Update folder
export async function updateFolder(
	id: string,
	data: {
		name?: string;
		description?: string;
		parentId?: string | null;
	}
) {
	const { session, error } = await checkMediaAccess();
	if (error) {
		return { data: null, error };
	}

	try {
		const folder = await prisma.mediaFolder.findUnique({
			where: { id },
		});

		if (!folder) {
			return { data: null, error: "Dossier non trouvé" };
		}

		// Check for circular reference if changing parent
		if (data.parentId !== undefined && data.parentId !== folder.parentId) {
			if (data.parentId === id) {
				return {
					data: null,
					error: "Un dossier ne peut pas être son propre parent",
				};
			}

			// Check if new parent is a descendant of current folder
			if (data.parentId) {
				let current = await prisma.mediaFolder.findUnique({
					where: { id: data.parentId },
				});

				while (current) {
					if (current.id === id) {
						return {
							data: null,
							error:
								"Impossible de déplacer un dossier dans l'un de ses sous-dossiers",
						};
					}
					if (!current.parentId) break;
					current = await prisma.mediaFolder.findUnique({
						where: { id: current.parentId },
					});
				}
			}
		}

		const updateData: {
			name?: string;
			slug?: string;
			description?: string | null;
			parentId?: string | null;
		} = {};

		if (data.name !== undefined) {
			updateData.name = data.name.trim();
			updateData.slug = generateSlug(data.name);

			// Check if new slug conflicts
			const existing = await prisma.mediaFolder.findFirst({
				where: {
					slug: updateData.slug,
					parentId: data.parentId !== undefined ? data.parentId : folder.parentId,
					id: { not: id },
				},
			});

			if (existing) {
				return {
					data: null,
					error: "Un dossier avec ce nom existe déjà dans ce dossier parent",
				};
			}
		}

		if (data.description !== undefined) {
			updateData.description = data.description?.trim() || null;
		}

		if (data.parentId !== undefined) {
			updateData.parentId = data.parentId;
		}

		const updated = await prisma.mediaFolder.update({
			where: { id },
			data: updateData,
		});

		revalidatePath("/admin/media");
		return { data: updated, error: null };
	} catch (error) {
		console.error("Error updating folder:", error);
		return { data: null, error: "Erreur lors de la mise à jour du dossier" };
	}
}

// Delete folder
export async function deleteFolder(id: string, deleteMedia: boolean = false) {
	const { session, error } = await checkMediaAccess();
	if (error) {
		return { data: null, error };
	}

	try {
		const folder = await prisma.mediaFolder.findUnique({
			where: { id },
			include: {
				_count: {
					select: { media: true, children: true },
				},
			},
		});

		if (!folder) {
			return { data: null, error: "Dossier non trouvé" };
		}

		// Check if folder has children
		if (folder._count.children > 0) {
			return {
				data: null,
				error: "Impossible de supprimer un dossier contenant des sous-dossiers",
			};
		}

		// Handle media files
		if (folder._count.media > 0) {
			if (deleteMedia) {
				// Delete all media in folder
				await prisma.media.deleteMany({
					where: { folderId: id },
				});
			} else {
				// Move media to root (no folder)
				await prisma.media.updateMany({
					where: { folderId: id },
					data: { folderId: null },
				});
			}
		}

		// Delete folder
		await prisma.mediaFolder.delete({
			where: { id },
		});

		revalidatePath("/admin/media");
		return { data: true, error: null };
	} catch (error) {
		console.error("Error deleting folder:", error);
		return { data: null, error: "Erreur lors de la suppression du dossier" };
	}
}

// Move media to folder
export async function moveMediaToFolder(
	mediaIds: string[],
	folderId: string | null
) {
	const { session, error } = await checkMediaAccess();
	if (error) {
		return { data: null, error };
	}

	try {
		// Verify folder exists if folderId is provided
		if (folderId) {
			const folder = await prisma.mediaFolder.findUnique({
				where: { id: folderId },
			});

			if (!folder) {
				return { data: null, error: "Dossier non trouvé" };
			}
		}

		// Move media files
		await prisma.media.updateMany({
			where: { id: { in: mediaIds } },
			data: { folderId },
		});

		revalidatePath("/admin/media");
		return { data: true, error: null };
	} catch (error) {
		console.error("Error moving media:", error);
		return { data: null, error: "Erreur lors du déplacement des médias" };
	}
}

// Reorder folders
export async function reorderFolders(
	updates: Array<{ id: string; order: number }>
) {
	const { session, error } = await checkMediaAccess();
	if (error) {
		return { data: null, error };
	}

	try {
		// Update all folders in a transaction
		await prisma.$transaction(
			updates.map((update) =>
				prisma.mediaFolder.update({
					where: { id: update.id },
					data: { order: update.order },
				})
			)
		);

		revalidatePath("/admin/media");
		return { data: true, error: null };
	} catch (error) {
		console.error("Error reordering folders:", error);
		return { data: null, error: "Erreur lors du réordonnancement des dossiers" };
	}
}

// Get breadcrumb path for a folder (optimized with single query)
export async function getFolderBreadcrumb(folderId: string) {
	const { session, error } = await checkMediaAccess();
	if (error) {
		return { data: null, error };
	}

	try {
		// Fetch all folders at once for better performance
		const allFolders = await prisma.mediaFolder.findMany({
			select: {
				id: true,
				name: true,
				slug: true,
				parentId: true,
			},
		});

		const folderMap = new Map(allFolders.map((f) => [f.id, f]));
		const breadcrumb: Array<{ id: string; name: string; slug: string }> = [];
		let currentId: string | null = folderId;
		let depth = 0;
		const MAX_DEPTH = 10; // Prevent infinite loops

		while (currentId && depth < MAX_DEPTH) {
			const folder = folderMap.get(currentId);
			if (!folder) break;

			breadcrumb.unshift({
				id: folder.id,
				name: folder.name,
				slug: folder.slug,
			});

			currentId = folder.parentId;
			depth++;
		}

		return { data: breadcrumb, error: null };
	} catch (error) {
		console.error("Error fetching breadcrumb:", error);
		return { data: null, error: "Erreur lors de la récupération du fil d'Ariane" };
	}
}
