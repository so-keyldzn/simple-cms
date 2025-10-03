/**
 * Roles disponibles dans le CMS
 * Les rôles peuvent être combinés (séparés par virgule)
 */

export const ROLES = {
	// Super administrateur - Accès total
	SUPER_ADMIN: "super-admin",

	// Administrateur - Gestion complète sauf config système critique
	ADMIN: "admin",

	// Éditeur - Gestion du contenu et modération
	EDITOR: "editor",

	// Auteur - Création et édition de ses propres contenus
	AUTHOR: "author",

	// Modérateur - Modération des commentaires et contenus
	MODERATOR: "moderator",

	// Utilisateur standard - Accès lecture seule
	USER: "user",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Permissions par rôle
 * Basées sur les pages existantes :
 * - Dashboard (/dashboard) - Tous les rôles
 * - Analytics (/admin/analytics) - Super-admin, Admin, Editor
 * - Posts (/admin/posts) - Super-admin, Admin, Editor, Author
 * - Categories (/admin/categories) - Super-admin, Admin, Editor
 * - Tags (/admin/tags) - Super-admin, Admin, Editor
 * - Media (/admin/media) - Super-admin, Admin, Editor, Author
 * - Comments (/admin/comments) - Super-admin, Admin, Editor, Moderator
 * - Users (/admin/users) - Super-admin, Admin
 * - Appearance (/admin/appearance) - Super-admin, Admin
 * - Settings (/admin/settings) - Super-admin, Admin
 */
export const ROLE_PERMISSIONS = {
	[ROLES.SUPER_ADMIN]: {
		canAccessDashboard: true,
		canViewAnalytics: true,
		canManagePosts: true,
		canCreatePosts: true,
		canEditAnyPost: true,
		canDeleteAnyPost: true,
		canManageCategories: true,
		canManageTags: true,
		canManageMedia: true,
		canManageComments: true,
		canManageUsers: true,
		canManageAppearance: true,
		canManageSettings: true,
	},
	[ROLES.ADMIN]: {
		canAccessDashboard: true,
		canViewAnalytics: true,
		canManagePosts: true,
		canCreatePosts: true,
		canEditAnyPost: true,
		canDeleteAnyPost: true,
		canManageCategories: true,
		canManageTags: true,
		canManageMedia: true,
		canManageComments: true,
		canManageUsers: true,
		canManageAppearance: true,
		canManageSettings: true,
	},
	[ROLES.EDITOR]: {
		canAccessDashboard: true,
		canViewAnalytics: true,
		canManagePosts: true,
		canCreatePosts: true,
		canEditAnyPost: true,
		canDeleteAnyPost: true,
		canManageCategories: true,
		canManageTags: true,
		canManageMedia: true,
		canManageComments: true,
		canManageUsers: false,
		canManageAppearance: false,
		canManageSettings: false,
	},
	[ROLES.AUTHOR]: {
		canAccessDashboard: true,
		canViewAnalytics: false,
		canManagePosts: false, // Uniquement ses propres posts
		canCreatePosts: true,
		canEditAnyPost: false, // Uniquement ses propres posts
		canDeleteAnyPost: false,
		canManageCategories: false,
		canManageTags: false,
		canManageMedia: true,
		canManageComments: false,
		canManageUsers: false,
		canManageAppearance: false,
		canManageSettings: false,
	},
	[ROLES.MODERATOR]: {
		canAccessDashboard: true,
		canViewAnalytics: false,
		canManagePosts: false,
		canCreatePosts: false,
		canEditAnyPost: false,
		canDeleteAnyPost: false,
		canManageCategories: false,
		canManageTags: false,
		canManageMedia: false,
		canManageComments: true,
		canManageUsers: false,
		canManageAppearance: false,
		canManageSettings: false,
	},
	[ROLES.USER]: {
		canAccessDashboard: true,
		canViewAnalytics: false,
		canManagePosts: false,
		canCreatePosts: false,
		canEditAnyPost: false,
		canDeleteAnyPost: false,
		canManageCategories: false,
		canManageTags: false,
		canManageMedia: false,
		canManageComments: false,
		canManageUsers: false,
		canManageAppearance: false,
		canManageSettings: false,
	},
} as const;

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export function hasPermission(
	userRoles: string | undefined,
	permission: keyof typeof ROLE_PERMISSIONS[typeof ROLES.SUPER_ADMIN]
): boolean {
	if (!userRoles) return false;

	const roles = userRoles.split(",");

	return roles.some((role) => {
		const rolePermissions = ROLE_PERMISSIONS[role as Role];
		return rolePermissions?.[permission] === true;
	});
}

/**
 * Vérifie si un utilisateur a au moins un des rôles spécifiés
 */
export function hasRole(userRoles: string | undefined, allowedRoles: string[]): boolean {
	if (!userRoles) return false;

	const roles = userRoles.split(",");
	return roles.some((role) => allowedRoles.includes(role));
}
