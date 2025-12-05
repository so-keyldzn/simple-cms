/**
 * Factory centralisée pour les query keys de TanStack Query
 *
 * Convention de nommage :
 * - ['entity'] : toutes les entités
 * - ['entity', filters] : entités avec filtres
 * - ['entity', id] : entité spécifique
 * - ['entity', id, 'sub'] : sous-ressource d'une entité
 */

export const queryKeys = {
	// Users
	users: {
		all: ['users'] as const,
		lists: () => [...queryKeys.users.all, 'list'] as const,
		list: (filters: Record<string, unknown>) => [...queryKeys.users.lists(), filters] as const,
		details: () => [...queryKeys.users.all, 'detail'] as const,
		detail: (id: string) => [...queryKeys.users.details(), id] as const,
	},

	// Posts
	posts: {
		all: ['posts'] as const,
		lists: () => [...queryKeys.posts.all, 'list'] as const,
		list: (filters: Record<string, unknown>) => [...queryKeys.posts.lists(), filters] as const,
		details: () => [...queryKeys.posts.all, 'detail'] as const,
		detail: (id: string) => [...queryKeys.posts.details(), id] as const,
	},

	// Comments
	comments: {
		all: ['comments'] as const,
		lists: () => [...queryKeys.comments.all, 'list'] as const,
		list: (filters: Record<string, unknown>) => [...queryKeys.comments.lists(), filters] as const,
		stats: () => [...queryKeys.comments.all, 'stats'] as const,
		postComments: (postId: string) => [...queryKeys.comments.all, 'post', postId] as const,
	},

	// Categories
	categories: {
		all: ['categories'] as const,
		lists: () => [...queryKeys.categories.all, 'list'] as const,
		list: (filters?: Record<string, unknown>) =>
			filters ? [...queryKeys.categories.lists(), filters] as const : queryKeys.categories.lists(),
		details: () => [...queryKeys.categories.all, 'detail'] as const,
		detail: (id: string) => [...queryKeys.categories.details(), id] as const,
	},

	// Tags
	tags: {
		all: ['tags'] as const,
		lists: () => [...queryKeys.tags.all, 'list'] as const,
		list: (filters?: Record<string, unknown>) =>
			filters ? [...queryKeys.tags.lists(), filters] as const : queryKeys.tags.lists(),
		details: () => [...queryKeys.tags.all, 'detail'] as const,
		detail: (id: string) => [...queryKeys.tags.details(), id] as const,
	},

	// Media
	media: {
		all: ['media'] as const,
		lists: () => [...queryKeys.media.all, 'list'] as const,
		list: (filters: Record<string, unknown>) => [...queryKeys.media.lists(), filters] as const,
		folders: () => [...queryKeys.media.all, 'folders'] as const,
		folder: (folderId: string | null) => [...queryKeys.media.folders(), folderId] as const,
		breadcrumb: (folderId: string | null) => [...queryKeys.media.all, 'breadcrumb', folderId] as const,
	},

	// Navigation
	navigation: {
		all: ['navigation'] as const,
		menus: () => [...queryKeys.navigation.all, 'menus'] as const,
		menu: (menuId: string) => [...queryKeys.navigation.menus(), menuId] as const,
		items: (menuId: string) => [...queryKeys.navigation.menu(menuId), 'items'] as const,
	},

	// Appearance
	appearance: {
		all: ['appearance'] as const,
		settings: () => [...queryKeys.appearance.all, 'settings'] as const,
	},
} as const;
