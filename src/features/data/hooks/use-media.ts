import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getAllMedia,
	getMediaById,
	createMedia,
	updateMedia,
	renameMedia,
	deleteMedia,
	type Media,
} from "@/features/admin/lib/media-actions";
import {
	getAllFolders,
	getFolderById,
	createFolder,
	updateFolder,
	deleteFolder,
	moveMediaToFolder,
	reorderFolders,
	getFolderBreadcrumb,
	type MediaFolder,
	type MediaFolderWithChildren,
} from "@/features/admin/lib/folder-actions";
import { queryKeys } from "../utils/query-keys";
import { toast } from "sonner";

/**
 * Hook combiné pour récupérer la liste des médias ET la liste des dossiers dans un dossier parent donné
 * (pour une UI type "content browser")
 * Utilise les query keys standardisées pour une meilleure intégration avec le cache
 */
export function useFolderContents(folderId?: string | null) {
	const normalizedFolderId = folderId || "root";
	
	return useQuery({
		queryKey: [...queryKeys.media.all, "contents", normalizedFolderId],
		queryFn: async () => {
			const [mediaResult, foldersResult] = await Promise.all([
				getAllMedia(folderId),
				getAllFolders(),
			]);
			if (mediaResult.error) {
				throw new Error(mediaResult.error);
			}
			if (foldersResult.error) {
				throw new Error(foldersResult.error);
			}
			const folders = (foldersResult.data as MediaFolderWithChildren[]).filter(
				(folder) => (folder.parentId ?? "root") === normalizedFolderId
			) as MediaFolderWithChildren[];
			return {
				media: mediaResult.data as Media[],
				folders,
			};
		},
	});
}

/**
 * Hook combiné complet pour la gestion des médias et dossiers
 * Inclut les médias, dossiers, breadcrumb et structure complète des dossiers
 */
export function useMediaLibraryData(folderId?: string | null) {
	const normalizedFolderId = folderId || null;
	
	const contents = useFolderContents(normalizedFolderId);
	const allFolders = useFolders();
	const breadcrumb = useFolderBreadcrumb(normalizedFolderId);
	
	return {
		media: contents.data?.media ?? [],
		folders: contents.data?.folders ?? [],
		allFolders: allFolders.data ?? [],
		breadcrumb: breadcrumb.data ?? [],
		isLoading: contents.isLoading || allFolders.isLoading || breadcrumb.isLoading,
		isError: contents.isError || allFolders.isError || breadcrumb.isError,
		error: contents.error || allFolders.error || breadcrumb.error,
		refetch: async () => {
			await Promise.all([
				contents.refetch(),
				allFolders.refetch(),
				breadcrumb.refetch(),
			]);
		},
	};
}

/** =============== MEDIA HOOKS =============== */

export function useMedia(folderId?: string | null) {
	return useQuery({
		queryKey: queryKeys.media.list({ folderId: folderId || "root" }),
		queryFn: async () => {
			const result = await getAllMedia(folderId);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data as Media[];
		},
	});
}

export function useMediaById(id: string) {
	return useQuery({
		queryKey: ["media", id],
		queryFn: async () => {
			const result = await getMediaById(id);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data as Media;
		},
		enabled: !!id,
	});
}

export function useCreateMedia() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			filename: string;
			originalName: string;
			url: string;
			mimeType: string;
			size: number;
			width?: number;
			height?: number;
			alt?: string;
			caption?: string;
			folderId?: string | null;
		}) => {
			const result = await createMedia(data);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
			toast.success("Média créé avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la création du média");
		},
	});
}

export function useUpdateMedia() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: {
				originalName?: string;
				alt?: string;
				caption?: string;
			};
		}) => {
			const result = await updateMedia(id, data);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
			toast.success("Média mis à jour avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la mise à jour du média");
		},
	});
}

export function useRenameMedia() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, newName }: { id: string; newName: string }) => {
			const result = await renameMedia(id, newName);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
			toast.success("Média renommé avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors du renommage du média");
		},
	});
}

export function useDeleteMedia(options?: { silent?: boolean }) {
	const queryClient = useQueryClient();
	const silent = options?.silent ?? false;

	return useMutation({
		mutationFn: async (id: string) => {
			const result = await deleteMedia(id);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ 
				queryKey: queryKeys.media.all 
			});
			if (!silent) {
				toast.success("Média supprimé avec succès");
			}
		},
		onError: (error) => {
			if (!silent) {
				toast.error(error.message || "Erreur lors de la suppression du média");
			}
		},
	});
}

/** =============== FOLDER HOOKS =============== */

export function useFolders() {
	return useQuery({
		queryKey: queryKeys.media.folders(),
		queryFn: async () => {
			const result = await getAllFolders();
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data as MediaFolderWithChildren[];
		},
	});
}

export function useFolderById(id: string) {
	return useQuery({
		queryKey: queryKeys.media.folder(id),
		queryFn: async () => {
			const result = await getFolderById(id);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data as MediaFolder;
		},
		enabled: !!id,
	});
}

export function useFolderBreadcrumb(folderId: string | null) {
	return useQuery({
		queryKey: queryKeys.media.breadcrumb(folderId),
		queryFn: async () => {
			if (!folderId) return [];
			const result = await getFolderBreadcrumb(folderId);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data as Array<{ id: string; name: string; slug: string }>;
		},
		enabled: !!folderId,
	});
}

export function useCreateFolder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			name: string;
			description?: string;
			parentId?: string;
		}) => {
			const result = await createFolder(data);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
			toast.success("Dossier créé avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la création du dossier");
		},
	});
}

export function useUpdateFolder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: {
				name?: string;
				description?: string;
				parentId?: string | null;
			};
		}) => {
			const result = await updateFolder(id, data);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
			toast.success("Dossier mis à jour avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la mise à jour du dossier");
		},
	});
}

export function useDeleteFolder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, deleteMedia }: { id: string; deleteMedia?: boolean }) => {
			const result = await deleteFolder(id, deleteMedia);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
			toast.success("Dossier supprimé avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la suppression du dossier");
		},
	});
}

export function useMoveMediaToFolder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			mediaIds,
			folderId,
		}: {
			mediaIds: string[];
			folderId: string | null;
		}) => {
			const result = await moveMediaToFolder(mediaIds, folderId);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
			toast.success("Médias déplacés avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors du déplacement des médias");
		},
	});
}

export function useReorderFolders() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (updates: Array<{ id: string; order: number }>) => {
			const result = await reorderFolders(updates);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.media.folders() });
			toast.success("Dossiers réorganisés avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la réorganisation des dossiers");
		},
	});
}
