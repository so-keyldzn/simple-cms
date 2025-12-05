"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

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
	const t = await getTranslations("errors");
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { session: null, error: t("unauthorized") };
	}

	const userRoles = session.user.role?.split(",") || [];
	const hasAccess = ["admin", "super-admin", "editor", "author"].some((role) =>
		userRoles.includes(role)
	);

	if (!hasAccess) {
		return { session: null, error: t("accessDenied") };
	}

	return { session, error: null };
}

// Get all folders with hierarchy
export async function getAllFolders() {
	const t = await getTranslations("errors");
	const { error } = await checkMediaAccess();
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
		return { data: null, error: t("fetchFoldersFailed") };
	}
}

// Get folder by ID
export async function getFolderById(id: string) {
	const t = await getTranslations("errors");
	const { error } = await checkMediaAccess();
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
			return { data: null, error: t("folderNotFound") };
		}

		return { data: folder, error: null };
	} catch (error) {
		console.error("Error fetching folder:", error);
		return { data: null, error: t("fetchFolderFailed") };
	}
}

// Create folder
export async function createFolder(data: {
	name: string;
	description?: string;
	parentId?: string;
}) {
	const t = await getTranslations("errors");
	const { session, error } = await checkMediaAccess();
	if (error || !session) {
		return { data: null, error: error || t("unauthorized") };
	}

	// Validate name
	if (!data.name || data.name.trim() === "") {
		return { data: null, error: t("emptyFolderName") };
	}

	try {
		// Check depth limit if parent exists
		if (data.parentId) {
			let depth = 0;
			let currentId: string | null = data.parentId;
			const MAX_DEPTH = 10;

			while (currentId && depth < MAX_DEPTH) {
				const parent: { parentId: string | null } | null = await prisma.mediaFolder.findUnique({
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
					error: t("maxFolderDepthReached"),
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
				error: t("duplicateFolderName"),
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
				userId: session.user.id,
			},
		});

		revalidatePath("/admin/media");
		return { data: folder, error: null };
	} catch (error) {
		console.error("Error creating folder:", error);
		return { data: null, error: t("createFolderFailed") };
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
	const t = await getTranslations("errors");
	const { error } = await checkMediaAccess();
	if (error) {
		return { data: null, error };
	}

	try {
		const folder = await prisma.mediaFolder.findUnique({
			where: { id },
		});

		if (!folder) {
			return { data: null, error: t("folderNotFound") };
		}

		// Check for circular reference if changing parent
		if (data.parentId !== undefined && data.parentId !== folder.parentId) {
			if (data.parentId === id) {
				return {
					data: null,
					error: t("cannotBeOwnParent"),
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
							error: t("cannotMoveToSubfolder"),
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
					error: t("duplicateFolderName"),
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
		return { data: null, error: t("updateFolderFailed") };
	}
}

// Delete folder
export async function deleteFolder(id: string, deleteMedia: boolean = false) {
	const t = await getTranslations("errors");
	const { error } = await checkMediaAccess();
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
			return { data: null, error: t("folderNotFound") };
		}

		// Check if folder has children
		if (folder._count.children > 0) {
			return {
				data: null,
				error: t("cannotDeleteFolderWithSubfolders"),
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
		return { data: null, error: t("deleteFolderFailed") };
	}
}

// Move media to folder
export async function moveMediaToFolder(
	mediaIds: string[],
	folderId: string | null
) {
	const t = await getTranslations("errors");
	const { error } = await checkMediaAccess();
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
				return { data: null, error: t("folderNotFound") };
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
		return { data: null, error: t("moveMediaFailed") };
	}
}

// Reorder folders
export async function reorderFolders(
	updates: Array<{ id: string; order: number }>
) {
	const t = await getTranslations("errors");
	const { error } = await checkMediaAccess();
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
		return { data: null, error: t("reorderFoldersFailed") };
	}
}

// Get breadcrumb path for a folder (optimized with single query)
export async function getFolderBreadcrumb(folderId: string) {
	const t = await getTranslations("errors");
	const { error } = await checkMediaAccess();
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
		return { data: null, error: t("fetchBreadcrumbFailed") };
	}
}
