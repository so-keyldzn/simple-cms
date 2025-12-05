import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	listCategoriesAction,
	createCategoryAction,
	updateCategoryAction,
	deleteCategoryAction,
} from "@/features/blog/lib/category-actions";
import { queryKeys } from "../utils/query-keys";
import { toast } from "sonner";

// Types
type Category = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	_count: {
		posts: number;
	};
};

type CreateCategoryInput = {
	name: string;
	description?: string;
};

type UpdateCategoryInput = {
	name?: string;
	description?: string;
};

/**
 * Hook pour récupérer la liste de toutes les catégories
 */
export function useCategories() {
	return useQuery({
		queryKey: queryKeys.categories.lists(),
		queryFn: async () => {
			const result = await listCategoriesAction();
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data as Category[];
		},
	});
}

/**
 * Hook pour créer une nouvelle catégorie
 */
export function useCreateCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateCategoryInput) => {
			const result = await createCategoryAction(data);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			// Invalider toutes les queries de catégories pour forcer le refetch
			queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
			toast.success("Catégorie créée avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la création de la catégorie");
		},
	});
}

/**
 * Hook pour mettre à jour une catégorie existante
 */
export function useUpdateCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryInput }) => {
			const result = await updateCategoryAction(id, data);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			// Invalider toutes les queries de catégories
			queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
			toast.success("Catégorie mise à jour avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la mise à jour de la catégorie");
		},
	});
}

/**
 * Hook pour supprimer une catégorie
 */
export function useDeleteCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const result = await deleteCategoryAction(id);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			// Invalider toutes les queries de catégories
			queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
			// Aussi invalider les posts car ils peuvent être affectés
			queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
			toast.success("Catégorie supprimée avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la suppression de la catégorie");
		},
	});
}
