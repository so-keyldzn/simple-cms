"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMediaLibraryData, useDeleteMedia } from "@/features/data/hooks/use-media";
import { Separator } from "@/components/ui/separator";
import dynamic from "next/dynamic";
import { FolderTree } from "@/features/admin/components/folder-tree";
import { FolderBreadcrumb } from "@/features/admin/components/folder-breadcrumb";
import { Loader2 } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { MediaLibraryProvider, useMediaLibrary } from "@/features/admin/components/media/context/media-library-context";
import type { MediaItem } from "@/features/admin/components/media/items/media-card";
import { MediaUploadZone } from "@/features/admin/components/media/upload/media-upload-zone";
import { useMediaKeyboardShortcuts } from "@/features/admin/components/media/hooks/use-media-keyboard-shortcuts";
import { toast } from "sonner";

// Charger les composants avec dialogs/dropdowns/context-menus uniquement côté client pour éviter les erreurs d'hydratation avec Radix UI
const MediaUploadDialog = dynamic(
	() => import("@/features/admin/components/media-upload-dialog").then(mod => ({ default: mod.MediaUploadDialog })),
	{ ssr: false }
);
const FolderCreateDialog = dynamic(
	() => import("@/features/admin/components/folder-create-dialog").then(mod => ({ default: mod.FolderCreateDialog })),
	{ ssr: false }
);
const MediaToolbar = dynamic(
	() => import("@/features/admin/components/media/toolbar/media-toolbar").then(mod => ({ default: mod.MediaToolbar })),
	{ ssr: false }
);
const MediaGridView = dynamic(
	() => import("@/features/admin/components/media/views/media-grid-view").then(mod => ({ default: mod.MediaGridView })),
	{ ssr: false }
);
const MediaListView = dynamic(
	() => import("@/features/admin/components/media/views/media-list-view").then(mod => ({ default: mod.MediaListView })),
	{ ssr: false }
);

function MediaContent() {
	const t = useTranslations();
	const { view, selectedMedia, clearSelection } = useMediaLibrary();
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

	// Hook combiné pour récupérer médias, dossiers et breadcrumb
	const {
		media,
		folders: folderContents,
		allFolders,
		breadcrumb,
		isLoading,
		refetch,
	} = useMediaLibraryData(selectedFolderId);

	// Transformer les dossiers au format FolderItem attendu par les composants
	const folders = folderContents.map((folder) => ({
		id: folder.id,
		name: folder.name,
		slug: folder.slug,
		description: folder.description,
		_count: {
			media: folder._count?.media ?? 0,
			children: folder.children?.length ?? 0,
		},
	}));

	const handleFolderSelect = (folderId: string | null) => {
		setSelectedFolderId(folderId);
	};

	const handleRefresh = async () => {
		await refetch();
	};

	const handleFilesUploaded = () => {
		handleRefresh();
	};

	const deleteMediaMutation = useDeleteMedia({ silent: true });

	const handleDeleteSelected = async () => {
		if (selectedMedia.size === 0) return;

		const confirmed = window.confirm(
			t("admin.media.deleteMultipleConfirmation", { count: selectedMedia.size })
		);

		if (!confirmed) return;

		const mediaIds = Array.from(selectedMedia);
		let successCount = 0;
		let errorCount = 0;

		for (const mediaId of mediaIds) {
			try {
				await deleteMediaMutation.mutateAsync(mediaId);
				successCount++;
			} catch {
				errorCount++;
			}
		}

		if (successCount > 0) {
			toast.success(t("admin.media.bulkDeletedSuccess", { count: successCount }));
			clearSelection();
		}

		if (errorCount > 0) {
			toast.error(t("admin.media.bulkDeletedError", { count: errorCount }));
		}
	};

	// Keyboard shortcuts
	useMediaKeyboardShortcuts({
		media: media as MediaItem[],
		onDeleteSelected: handleDeleteSelected,
	});

	return (
		<MediaUploadZone
			currentFolderId={selectedFolderId}
			onFilesSelected={handleFilesUploaded}
		>
			<div className="space-y-6 w-full h-screen">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">{t("admin.media.title")}</h1>
						<p className="text-muted-foreground">
							{t("admin.media.description")}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<ButtonGroup>
							<FolderCreateDialog parentId={selectedFolderId || undefined}  />
							<MediaUploadDialog currentFolderId={selectedFolderId} onSuccess={handleFilesUploaded} />
						</ButtonGroup>
					</div>
				</div>

				<Separator />

				<MediaToolbar />

				<div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
					{/* Sidebar with folder tree */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-sm font-semibold">{t("admin.media.folders")}</h2>
						</div>
						{isLoading ? (
							<div className="flex items-center justify-center py-8">
								<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							</div>
						) : (
							<FolderTree
								folders={allFolders}
								selectedFolderId={selectedFolderId}
								onFolderSelect={handleFolderSelect}
							/>
						)}
					</div>

					{/* Main content area */}
					<div className="space-y-4">
						{breadcrumb.length > 0 && (
							<FolderBreadcrumb
								breadcrumb={breadcrumb}
								onNavigate={(folderId) => handleFolderSelect(folderId || null)}
							/>
						)}

						{isLoading ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
							</div>
						) : view === "grid" ? (
							<MediaGridView
								media={media as MediaItem[]}
								folders={folders}
								currentFolderId={selectedFolderId}
								onNavigateToFolder={handleFolderSelect}
								onRefresh={handleRefresh}
							/>
						) : (
							<MediaListView
								media={media as MediaItem[]}
								folders={folders}
								currentFolderId={selectedFolderId}
								onNavigateToFolder={handleFolderSelect}
								onRefresh={handleRefresh}
							/>
						)}
					</div>
				</div>
			</div>
		</MediaUploadZone>
	);
}

export default function MediaPage() {
	return (
		<MediaLibraryProvider>
			<MediaContent />
		</MediaLibraryProvider>
	);
}
