import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getNavigationMenus,
	getNavigationMenu,
	getNavigationMenuByName,
	createNavigationMenu,
	updateNavigationMenu,
	deleteNavigationMenu,
	createNavigationItem,
	updateNavigationItem,
	deleteNavigationItem,
	reorderNavigationItems,
	type NavigationMenuWithCount,
} from "@/features/admin/lib/navigation-actions";
import { queryKeys } from "../utils/query-keys";
import { toast } from "sonner";

// === MENU HOOKS ===

/**
 * Hook pour récupérer tous les menus de navigation
 */
export function useNavigationMenus() {
	return useQuery({
		queryKey: queryKeys.navigation.menus(),
		queryFn: async () => {
			const result = await getNavigationMenus();
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data as NavigationMenuWithCount[];
		},
	});
}

/**
 * Hook pour récupérer un menu spécifique avec ses items
 */
export function useNavigationMenu(menuId: string) {
	return useQuery({
		queryKey: queryKeys.navigation.menu(menuId),
		queryFn: async () => {
			const result = await getNavigationMenu(menuId);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		enabled: !!menuId,
	});
}

/**
 * Hook pour récupérer un menu par nom (pour affichage public)
 */
export function useNavigationMenuByName(name: string) {
	return useQuery({
		queryKey: ["navigation", "by-name", name],
		queryFn: async () => {
			const result = await getNavigationMenuByName(name);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		enabled: !!name,
	});
}

/**
 * Hook pour créer un nouveau menu de navigation
 */
export function useCreateNavigationMenu() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: { name: string; label: string; description?: string }) => {
			const result = await createNavigationMenu(data);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.navigation.all });
			toast.success("Menu créé avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la création du menu");
		},
	});
}

/**
 * Hook pour mettre à jour un menu de navigation
 */
export function useUpdateNavigationMenu() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			menuId,
			data,
		}: {
			menuId: string;
			data: {
				name?: string;
				label?: string;
				description?: string;
				isActive?: boolean;
			};
		}) => {
			const result = await updateNavigationMenu(menuId, data);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.navigation.all });
			toast.success("Menu mis à jour avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la mise à jour du menu");
		},
	});
}

/**
 * Hook pour supprimer un menu de navigation
 */
export function useDeleteNavigationMenu() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (menuId: string) => {
			const result = await deleteNavigationMenu(menuId);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.navigation.all });
			toast.success("Menu supprimé avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la suppression du menu");
		},
	});
}

// === ITEM HOOKS ===

/**
 * Hook pour créer un nouvel item de menu
 */
export function useCreateNavigationItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			menuId: string;
			title: string;
			href?: string;
			description?: string;
			order?: number;
			isExternal?: boolean;
			parentId?: string;
		}) => {
			const result = await createNavigationItem(data);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.navigation.all });
			toast.success("Item de menu créé avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la création de l'item");
		},
	});
}

/**
 * Hook pour mettre à jour un item de menu
 */
export function useUpdateNavigationItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			itemId,
			data,
		}: {
			itemId: string;
			data: {
				title?: string;
				href?: string;
				description?: string;
				order?: number;
				isExternal?: boolean;
				parentId?: string;
			};
		}) => {
			const result = await updateNavigationItem(itemId, data);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.navigation.all });
			toast.success("Item de menu mis à jour avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la mise à jour de l'item");
		},
	});
}

/**
 * Hook pour supprimer un item de menu
 */
export function useDeleteNavigationItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (itemId: string) => {
			const result = await deleteNavigationItem(itemId);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.navigation.all });
			toast.success("Item de menu supprimé avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la suppression de l'item");
		},
	});
}

/**
 * Hook pour réorganiser les items de menu
 */
export function useReorderNavigationItems() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (items: { id: string; order: number }[]) => {
			const result = await reorderNavigationItems(items);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.navigation.all });
			toast.success("Items réorganisés avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la réorganisation des items");
		},
	});
}
