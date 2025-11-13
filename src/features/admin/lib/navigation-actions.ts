"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

export type NavigationMenu = {
	id: string;
	name: string;
	label: string;
	description: string | null;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export type NavigationItem = {
	id: string;
	title: string;
	href: string | null;
	description: string | null;
	order: number;
	isExternal: boolean;
	menuId: string;
	parentId: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export type NavigationItemWithChildren = NavigationItem & {
	children?: NavigationItemWithChildren[];
};

// Get all navigation menus
export async function getNavigationMenus() {
	const t = await getTranslations("errors");
	try {
		const menus = await prisma.navigationMenu.findMany({
			orderBy: { name: "asc" },
			include: {
				_count: {
					select: { items: true },
				},
			},
		});

		return { data: menus, error: null };
	} catch (error) {
		console.error("Error fetching navigation menus:", error);
		return { data: null, error: t("fetchMenusFailed") };
	}
}

// Get a single navigation menu with items
export async function getNavigationMenu(menuId: string) {
	const t = await getTranslations("errors");
	try {
		const menu = await prisma.navigationMenu.findUnique({
			where: { id: menuId },
			include: {
				items: {
					orderBy: { order: "asc" },
					include: {
						children: {
							orderBy: { order: "asc" },
						},
					},
				},
			},
		});

		return { data: menu, error: null };
	} catch (error) {
		console.error("Error fetching navigation menu:", error);
		return { data: null, error: t("fetchMenuFailed") };
	}
}

// Get navigation menu by name (for public display)
export async function getNavigationMenuByName(name: string) {
	const t = await getTranslations("errors");
	try {
		const menu = await prisma.navigationMenu.findUnique({
			where: { name, isActive: true },
			include: {
				items: {
					where: { parentId: null },
					orderBy: { order: "asc" },
					include: {
						children: {
							orderBy: { order: "asc" },
							include: {
								children: {
									orderBy: { order: "asc" },
								},
							},
						},
					},
				},
			},
		});

		return { data: menu, error: null };
	} catch (error) {
		console.error("Error fetching navigation menu by name:", error);
		return { data: null, error: t("fetchMenuFailed") };
	}
}

// Create a navigation menu
export async function createNavigationMenu(data: {
	name: string;
	label: string;
	description?: string;
}) {
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
		const menu = await prisma.navigationMenu.create({
			data: {
				name: data.name,
				label: data.label,
				description: data.description,
			},
		});

		revalidatePath("/admin/navigation");
		return { data: menu, error: null };
	} catch (error) {
		console.error("Error creating navigation menu:", error);
		return { data: null, error: t("createMenuFailed") };
	}
}

// Update a navigation menu
export async function updateNavigationMenu(
	menuId: string,
	data: {
		name?: string;
		label?: string;
		description?: string;
		isActive?: boolean;
	}
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
		const menu = await prisma.navigationMenu.update({
			where: { id: menuId },
			data,
		});

		revalidatePath("/admin/navigation");
		revalidatePath("/", "layout");
		return { data: menu, error: null };
	} catch (error) {
		console.error("Error updating navigation menu:", error);
		return { data: null, error: t("updateMenuFailed") };
	}
}

// Delete a navigation menu
export async function deleteNavigationMenu(menuId: string) {
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
		await prisma.navigationMenu.delete({
			where: { id: menuId },
		});

		revalidatePath("/admin/navigation");
		revalidatePath("/", "layout");
		return { data: true, error: null };
	} catch (error) {
		console.error("Error deleting navigation menu:", error);
		return { data: null, error: t("deleteMenuFailed") };
	}
}

// Create a navigation item
export async function createNavigationItem(data: {
	menuId: string;
	title: string;
	href?: string;
	description?: string;
	order?: number;
	isExternal?: boolean;
	parentId?: string;
}) {
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
		const item = await prisma.navigationItem.create({
			data: {
				menuId: data.menuId,
				title: data.title,
				href: data.href,
				description: data.description,
				order: data.order ?? 0,
				isExternal: data.isExternal ?? false,
				parentId: data.parentId,
			},
		});

		revalidatePath("/admin/navigation");
		revalidatePath("/", "layout");
		return { data: item, error: null };
	} catch (error) {
		console.error("Error creating navigation item:", error);
		return { data: null, error: t("createMenuItemFailed") };
	}
}

// Update a navigation item
export async function updateNavigationItem(
	itemId: string,
	data: {
		title?: string;
		href?: string;
		description?: string;
		order?: number;
		isExternal?: boolean;
		parentId?: string;
	}
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
		const item = await prisma.navigationItem.update({
			where: { id: itemId },
			data,
		});

		revalidatePath("/admin/navigation");
		revalidatePath("/", "layout");
		return { data: item, error: null };
	} catch (error) {
		console.error("Error updating navigation item:", error);
		return { data: null, error: t("updateMenuItemFailed") };
	}
}

// Delete a navigation item
export async function deleteNavigationItem(itemId: string) {
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
		await prisma.navigationItem.delete({
			where: { id: itemId },
		});

		revalidatePath("/admin/navigation");
		revalidatePath("/", "layout");
		return { data: true, error: null };
	} catch (error) {
		console.error("Error deleting navigation item:", error);
		return { data: null, error: t("deleteMenuItemFailed") };
	}
}

// Reorder navigation items
export async function reorderNavigationItems(items: { id: string; order: number }[]) {
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
		await Promise.all(
			items.map((item) =>
				prisma.navigationItem.update({
					where: { id: item.id },
					data: { order: item.order },
				})
			)
		);

		revalidatePath("/admin/navigation");
		revalidatePath("/", "layout");
		return { data: true, error: null };
	} catch (error) {
		console.error("Error reordering navigation items:", error);
		return { data: null, error: t("reorderMenuItemsFailed") };
	}
}
