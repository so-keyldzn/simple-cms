import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	listTagsAction,
	createTagAction,
	updateTagAction,
	deleteTagAction,
} from "@/features/blog/lib/tag-actions";
import { queryKeys } from "../utils/query-keys";
import { toast } from "sonner";

// Types
type Tag = {
	id: string;
	name: string;
	slug: string;
	_count: {
		posts: number;
	};
};

type CreateTagInput = {
	name: string;
};

type UpdateTagInput = {
	name?: string;
};

/**
 * Hook pour récupérer la liste de tous les tags
 */
export function useTags() {
	return useQuery({
		queryKey: queryKeys.tags.lists(),
		queryFn: async () => {
			const result = await listTagsAction();
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data as Tag[];
		},
	});
}

/**
 * Hook pour créer un nouveau tag
 */
export function useCreateTag() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateTagInput) => {
			const result = await createTagAction(data);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
			toast.success("Tag créé avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la création du tag");
		},
	});
}

/**
 * Hook pour mettre à jour un tag existant
 */
export function useUpdateTag() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: UpdateTagInput }) => {
			const result = await updateTagAction(id, data);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
			toast.success("Tag mis à jour avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la mise à jour du tag");
		},
	});
}

/**
 * Hook pour supprimer un tag
 */
export function useDeleteTag() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const result = await deleteTagAction(id);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
			// Aussi invalider les posts car ils peuvent être affectés
			queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
			toast.success("Tag supprimé avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la suppression du tag");
		},
	});
}
