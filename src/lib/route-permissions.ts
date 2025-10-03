import { ROLE_PERMISSIONS } from "@/lib/roles";

/**
 * Configuration des permissions par route
 * Chaque route admin est associée à une ou plusieurs permissions requises
 */
export const ROUTE_PERMISSIONS = {
	"/admin/users": ["canManageUsers"],
	"/admin/posts": ["canManagePosts", "canCreatePosts"], // OR logic
	"/admin/categories": ["canManageCategories"],
	"/admin/tags": ["canManageTags"],
	"/admin/comments": ["canManageComments"],
	"/admin/navigation": ["canManageNavigation"],
	"/admin/appearance": ["canManageAppearance"],
	"/admin/settings": ["canManageSettings"],
	"/admin/analytics": ["canViewAnalytics"],
	"/admin/media": ["canManageMedia"],
} as const;

export type RoutePermission = keyof typeof ROUTE_PERMISSIONS;
export type Permission = keyof typeof ROLE_PERMISSIONS[keyof typeof ROLE_PERMISSIONS];

/**
 * Vérifie si un utilisateur a accès à une route
 * @param userRole - Le(s) rôle(s) de l'utilisateur (peut être une chaîne avec des rôles séparés par des virgules)
 * @param pathname - Le chemin de la route à vérifier
 * @returns true si l'utilisateur a au moins une des permissions requises
 */
export function hasRouteAccess(
	userRole: string | undefined,
	pathname: string
): boolean {
	if (!userRole) return false;

	// Trouver la configuration de route correspondante
	const routeConfig = Object.entries(ROUTE_PERMISSIONS).find(([route]) =>
		pathname.startsWith(route)
	);

	if (!routeConfig) return false;

	const [, requiredPermissions] = routeConfig;
	const roles = userRole.split(",");

	// Vérifier si l'utilisateur a au moins une des permissions requises (OR logic)
	return requiredPermissions.some((permission) =>
		roles.some((role) => {
			const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
			return rolePermissions?.[permission as Permission] === true;
		})
	);
}
