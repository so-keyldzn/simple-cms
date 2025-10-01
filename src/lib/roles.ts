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
 */
export const ROLE_PERMISSIONS = {
	[ROLES.SUPER_ADMIN]: {
		canManageUsers: true,
		canManagePosts: true,
		canManageMedia: true,
		canManageCategories: true,
		canManageTags: true,
		canManageComments: true,
		canManageSettings: true,
		canManageAppearance: true,
		canViewAnalytics: true,
		canDeleteAnyPost: true,
		canEditAnyPost: true,
	},
	[ROLES.ADMIN]: {
		canManageUsers: true,
		canManagePosts: true,
		canManageMedia: true,
		canManageCategories: true,
		canManageTags: true,
		canManageComments: true,
		canManageSettings: true,
		canManageAppearance: true,
		canViewAnalytics: true,
		canDeleteAnyPost: true,
		canEditAnyPost: true,
	},
	[ROLES.EDITOR]: {
		canManageUsers: false,
		canManagePosts: true,
		canManageMedia: true,
		canManageCategories: true,
		canManageTags: true,
		canManageComments: true,
		canManageSettings: false,
		canManageAppearance: false,
		canViewAnalytics: true,
		canDeleteAnyPost: true,
		canEditAnyPost: true,
	},
	[ROLES.AUTHOR]: {
		canManageUsers: false,
		canManagePosts: false, // Seulement ses propres posts
		canManageMedia: true,
		canManageCategories: false,
		canManageTags: false,
		canManageComments: false,
		canManageSettings: false,
		canManageAppearance: false,
		canViewAnalytics: false,
		canDeleteAnyPost: false,
		canEditAnyPost: false,
	},
	[ROLES.MODERATOR]: {
		canManageUsers: false,
		canManagePosts: false,
		canManageMedia: false,
		canManageCategories: false,
		canManageTags: false,
		canManageComments: true,
		canManageSettings: false,
		canManageAppearance: false,
		canViewAnalytics: false,
		canDeleteAnyPost: false,
		canEditAnyPost: false,
	},
	[ROLES.USER]: {
		canManageUsers: false,
		canManagePosts: false,
		canManageMedia: false,
		canManageCategories: false,
		canManageTags: false,
		canManageComments: false,
		canManageSettings: false,
		canManageAppearance: false,
		canViewAnalytics: false,
		canDeleteAnyPost: false,
		canEditAnyPost: false,
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
