import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	listAllCommentsAction,
	updateCommentStatusAction,
	deleteCommentAction,
	getCommentsStatsAction,
	type CommentWithRelations,
} from "@/features/blog/lib/comment-actions";
import { queryKeys } from "../utils/query-keys";
import { toast } from "sonner";

// Types
type ListCommentsOptions = {
	status?: "PENDING" | "APPROVED" | "REJECTED";
	search?: string;
	limit?: number;
	offset?: number;
};

type CommentStatus = "PENDING" | "APPROVED" | "REJECTED";

type CommentsData = {
	comments: CommentWithRelations[];
	total: number;
};

type CommentsStats = {
	total: number;
	pending: number;
	approved: number;
	rejected: number;
};

/**
 * Hook pour récupérer la liste de tous les commentaires (admin)
 */
export function useComments(options?: ListCommentsOptions) {
	return useQuery({
		queryKey: queryKeys.comments.list(options || {}),
		queryFn: async () => {
			const result = await listAllCommentsAction(options);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data as CommentsData;
		},
	});
}

/**
 * Hook pour récupérer les statistiques des commentaires
 */
export function useCommentsStats() {
	return useQuery({
		queryKey: queryKeys.comments.stats(),
		queryFn: async () => {
			const result = await getCommentsStatsAction();
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data as CommentsStats;
		},
	});
}

/**
 * Hook pour mettre à jour le statut d'un commentaire avec optimistic updates
 */
export function useUpdateCommentStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			commentId,
			status,
		}: {
			commentId: string;
			status: CommentStatus;
		}) => {
			const result = await updateCommentStatusAction(commentId, status);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		// Optimistic update - mettre à jour le cache avant la réponse serveur
		onMutate: async ({ commentId, status }) => {
			// Annuler les requêtes en cours pour éviter les conflits
			await queryClient.cancelQueries({ queryKey: queryKeys.comments.all });

			// Sauvegarder les données précédentes pour rollback
			const previousData = queryClient.getQueryData<CommentsData>(
				queryKeys.comments.lists()
			);

			// Optimistically update the cache
			queryClient.setQueriesData<CommentsData>(
				{ queryKey: queryKeys.comments.all },
				(old) => {
					if (!old) return old;
					return {
						...old,
						comments: old.comments.map((comment) =>
							comment.id === commentId ? { ...comment, status } : comment
						),
					};
				}
			);

			// Retourner le contexte avec les anciennes données pour rollback
			return { previousData };
		},
		// Si la mutation échoue, rollback
		onError: (error, _variables, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(queryKeys.comments.lists(), context.previousData);
			}
			toast.error(error.message || "Erreur lors de la mise à jour du statut");
		},
		// Toujours refetch après la mutation (succès ou échec)
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
			toast.success("Statut du commentaire mis à jour");
		},
	});
}

/**
 * Hook pour supprimer un commentaire
 */
export function useDeleteComment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (commentId: string) => {
			const result = await deleteCommentAction(commentId);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
			toast.success("Commentaire supprimé avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la suppression du commentaire");
		},
	});
}
