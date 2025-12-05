import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	listPostsAction,
	createPostAction,
	updatePostAction,
	deletePostAction,
} from "@/features/blog/lib/post-actions";
import { queryKeys } from "../utils/query-keys";
import { toast } from "sonner";

// Types
type Post = {
	id: string;
	title: string;
	slug: string;
	excerpt: string | null;
	content: string;
	coverImage: string | null;
	published: boolean;
	publishedAt: Date | null;
	commentsEnabled: boolean;
	author: {
		name: string | null;
		email: string;
	};
	category: {
		id: string;
		name: string;
	} | null;
	tags: {
		tag: {
			id: string;
			name: string;
			slug: string;
		};
	}[];
};

type ListPostsOptions = {
	limit?: number;
	offset?: number;
	search?: string;
	published?: boolean;
};

type CreatePostInput = {
	title: string;
	excerpt?: string;
	content: string;
	coverImage?: string;
	published?: boolean;
	commentsEnabled?: boolean;
	categoryId?: string;
	tags?: string[];
};

type UpdatePostInput = {
	title?: string;
	excerpt?: string;
	content?: string;
	coverImage?: string;
	published?: boolean;
	commentsEnabled?: boolean;
	categoryId?: string | null;
	tags?: string[];
};

/**
 * Hook pour récupérer la liste des posts avec pagination et filtres
 */
export function usePosts(options?: ListPostsOptions) {
	return useQuery({
		queryKey: queryKeys.posts.list(options || {}),
		queryFn: async () => {
			const result = await listPostsAction(options);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data as { posts: Post[]; total: number };
		},
	});
}

/**
 * Hook pour créer un nouveau post
 */
export function useCreatePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreatePostInput) => {
			const result = await createPostAction(data);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
			toast.success("Post créé avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la création du post");
		},
	});
}

/**
 * Hook pour mettre à jour un post existant
 */
export function useUpdatePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: UpdatePostInput }) => {
			const result = await updatePostAction(id, data);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
			toast.success("Post mis à jour avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la mise à jour du post");
		},
	});
}

/**
 * Hook pour supprimer un post
 */
export function useDeletePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const result = await deletePostAction(id);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
			toast.success("Post supprimé avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la suppression du post");
		},
	});
}
