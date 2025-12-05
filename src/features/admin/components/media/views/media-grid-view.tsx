"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { renameMedia } from "@/features/admin/lib/media-actions";
import { moveMediaToFolder, getAllFolders, createFolder, type MediaFolderWithChildren } from "@/features/admin/lib/folder-actions";
import { Loader2, Folder, FolderPlus } from "lucide-react";
import { MediaCard, type MediaItem } from "../items/media-card";
import { FolderCard, type FolderItem } from "../items/folder-card";
import { useFilteredMedia } from "../hooks/use-filtered-media";
import { deleteFolder } from "@/features/admin/lib/folder-actions";
import { FolderEditDialog } from "@/features/admin/components/folder-edit-dialog";
import { useDeleteMedia } from "@/features/data/hooks/use-media";

type MediaGridViewProps = {
	media: MediaItem[];
	folders?: FolderItem[];
	currentFolderId?: string | null;
	onNavigateToFolder?: (folderId: string | null) => void;
	onRefresh?: () => void;
};

export function MediaGridView({ media, folders = [], currentFolderId, onNavigateToFolder, onRefresh }: MediaGridViewProps) {
	// Apply search and filters
	const filteredMedia = useFilteredMedia(media);
	const t = useTranslations();
	const [editFolder, setEditFolder] = useState<{ id: string; name: string; description?: string | null } | null>(null);
	const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);
	const [isDeletingFolder, setIsDeletingFolder] = useState(false);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [renameId, setRenameId] = useState<string | null>(null);
	const [newName, setNewName] = useState("");
	const [isPending, startTransition] = useTransition();
	const [isRenaming, setIsRenaming] = useState(false);
	const [moveDialogOpen, setMoveDialogOpen] = useState(false);
	const [mediaToMove, setMediaToMove] = useState<string | null>(null);
	const [moveFolders, setMoveFolders] = useState<MediaFolderWithChildren[]>([]);
	const [isLoadingFolders, setIsLoadingFolders] = useState(false);
	const [isMoving, setIsMoving] = useState(false);
	const [showNewFolderInput, setShowNewFolderInput] = useState(false);
	const [newFolderName, setNewFolderName] = useState("");
	const [isCreatingFolder, setIsCreatingFolder] = useState(false);
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

	const deleteMediaMutation = useDeleteMedia();

	const handleDelete = async () => {
		if (!deleteId) return;

		startTransition(async () => {
			try {
				await deleteMediaMutation.mutateAsync(deleteId);
				setDeleteId(null);
			} catch {
				// Error already handled by mutation
			}
		});
	};

	const handleRename = async () => {
		if (!renameId || !newName.trim()) return;

		setIsRenaming(true);
		const result = await renameMedia(renameId, newName);

		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success(t("admin.media.renamedSuccess"));
			setRenameId(null);
			setNewName("");
			onRefresh?.();
		}
		setIsRenaming(false);
	};

	const openRenameDialog = (item: MediaItem) => {
		setRenameId(item.id);
		setNewName(item.originalName);
	};

	const openMoveDialog = async (mediaId: string) => {
		setMediaToMove(mediaId);
		setMoveDialogOpen(true);
		setShowNewFolderInput(false);
		setNewFolderName("");
		setSelectedFolderId(null);
		setIsLoadingFolders(true);
		const result = await getAllFolders();
		if (result.data) {
			setMoveFolders(result.data);
		}
		setIsLoadingFolders(false);
	};

	const handleMove = async (folderId: string | null) => {
		if (!mediaToMove) return;

		setIsMoving(true);
		const result = await moveMediaToFolder([mediaToMove], folderId);

		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success(t("admin.media.movedSuccess"));
			setMoveDialogOpen(false);
			setMediaToMove(null);
			setSelectedFolderId(null);
			onRefresh?.();
		}
		setIsMoving(false);
	};

	const handleCreateAndMove = async () => {
		if (!newFolderName.trim() || !mediaToMove) return;

		setIsCreatingFolder(true);
		const result = await createFolder({
			name: newFolderName.trim(),
		});

		if (result.error) {
			toast.error(result.error);
			setIsCreatingFolder(false);
		} else if (result.data) {
			await handleMove(result.data.id);
			setShowNewFolderInput(false);
			setNewFolderName("");
		}
		setIsCreatingFolder(false);
	};

	const handleDeleteFolder = async () => {
		if (!deleteFolderId) return;

		setIsDeletingFolder(true);
		const result = await deleteFolder(deleteFolderId, false);

		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success(t("admin.folders.deletedSuccess"));
			setDeleteFolderId(null);
			onRefresh?.();
		}
		setIsDeletingFolder(false);
	};

	const handleNavigateToFolder = (folderId: string) => {
		onNavigateToFolder?.(folderId);
	};

	const renderFolderOptions = (folders: MediaFolderWithChildren[], level: number = 0): React.ReactElement[] => {
		return folders.flatMap((folder) => {
			const isSelected = selectedFolderId === folder.id;
			return [
				<button
					key={folder.id}
					onClick={() => {
						setSelectedFolderId(folder.id);
						handleMove(folder.id);
					}}
					disabled={isMoving || isCreatingFolder}
					className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors disabled:opacity-50 flex items-center gap-2 ${
						isSelected ? "bg-accent" : "hover:bg-accent"
					}`}
					style={{ paddingLeft: `${level * 16 + 16}px` }}
				>
					<Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
					<span className="flex-1 truncate">{folder.name}</span>
					{folder._count && folder._count.media > 0 && (
						<span className="text-xs text-muted-foreground">({folder._count.media})</span>
					)}
				</button>,
				...renderFolderOptions(folder.children, level + 1),
			];
		});
	};

	// Show empty state only if there are no folders and no media
	if (media.length === 0 && folders.length === 0) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-12">
					<p className="text-muted-foreground">{t("admin.media.noMediaYet")}</p>
					<p className="text-sm text-muted-foreground mt-2">
						{t("admin.media.addFirstMedia")}
					</p>
				</CardContent>
			</Card>
		);
	}

	// Show no results only if filters are applied and nothing matches
	if (filteredMedia.length === 0 && folders.length === 0) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-12">
					<p className="text-muted-foreground">{t("admin.media.noResultsFound")}</p>
					<p className="text-sm text-muted-foreground mt-2">
						{t("admin.media.tryDifferentSearch")}
					</p>
				</CardContent>
			</Card>
		);
	}

	// Only show folders in root (when currentFolderId is null)
	const displayFolders = currentFolderId === null ? folders : [];

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{/* Render folders first */}
				{displayFolders.map((folder) => (
					<FolderCard
						key={folder.id}
						folder={folder}
						onNavigate={handleNavigateToFolder}
						onEdit={setEditFolder}
						onDelete={setDeleteFolderId}
					/>
				))}

				{/* Then render media */}
				{filteredMedia.map((item) => (
					<MediaCard
						key={item.id}
						media={item}
						onDelete={setDeleteId}
						onRename={openRenameDialog}
						onMove={openMoveDialog}
					/>
				))}
			</div>

			{/* Rename Dialog */}
			<Dialog open={!!renameId} onOpenChange={() => setRenameId(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("admin.media.renameFile")}</DialogTitle>
						<DialogDescription>
							{t("admin.media.renameDescription")}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="media-name">{t("admin.media.fileName")}</Label>
							<Input
								id="media-name"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								placeholder={t("admin.media.fileNamePlaceholder")}
								disabled={isRenaming}
							/>
							<p className="text-xs text-muted-foreground">
								{t("admin.media.specialCharsWarning")}
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setRenameId(null);
								setNewName("");
							}}
							disabled={isRenaming}
						>
							{t("common.cancel")}
						</Button>
						<Button
							onClick={handleRename}
							disabled={isRenaming || !newName.trim()}
						>
							{isRenaming ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{t("admin.media.renaming")}
								</>
							) : (
								t("admin.media.rename")
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("admin.media.deleteMedia")}</AlertDialogTitle>
						<AlertDialogDescription>
							{t("admin.media.deleteConfirmation")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>{t("common.cancel")}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{t("common.delete")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Move to Folder Dialog */}
			<Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>{t("admin.media.moveToFolderTitle")}</DialogTitle>
						<DialogDescription>
							{t("admin.media.moveDescription")}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{showNewFolderInput ? (
							<div className="space-y-3 p-4 border rounded-lg bg-muted/50">
								<div className="flex items-center justify-between">
									<Label htmlFor="new-folder-name" className="text-sm font-medium">
										{t("admin.folders.newFolder")}
									</Label>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											setShowNewFolderInput(false);
											setNewFolderName("");
										}}
										disabled={isCreatingFolder}
									>
										{t("common.cancel")}
									</Button>
								</div>
								<div className="flex gap-2">
									<Input
										id="new-folder-name"
										placeholder={t("admin.folders.folderNamePlaceholder")}
										value={newFolderName}
										onChange={(e) => setNewFolderName(e.target.value)}
										disabled={isCreatingFolder}
										onKeyDown={(e) => {
											if (e.key === "Enter" && newFolderName.trim()) {
												handleCreateAndMove();
											}
										}}
										autoFocus
									/>
									<Button
										onClick={handleCreateAndMove}
										disabled={isCreatingFolder || !newFolderName.trim()}
										size="sm"
									>
										{isCreatingFolder ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											t("admin.media.createAndMove")
										)}
									</Button>
								</div>
							</div>
						) : (
							<Button
								variant="outline"
								className="w-full"
								onClick={() => setShowNewFolderInput(true)}
								disabled={isMoving || isLoadingFolders}
							>
								<FolderPlus className="mr-2 h-4 w-4" />
								{t("admin.media.createNewFolder")}
							</Button>
						)}

						<div className="space-y-2">
							<Label className="text-sm font-medium">{t("admin.media.existingFolders")}</Label>
							<div className="max-h-[300px] overflow-y-auto border rounded-lg">
								{isLoadingFolders ? (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
									</div>
								) : (
									<div className="space-y-1 p-2">
										<button
											onClick={() => {
												setSelectedFolderId(null);
												handleMove(null);
											}}
											disabled={isMoving || isCreatingFolder}
											className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors disabled:opacity-50 flex items-center gap-2 ${
												selectedFolderId === null ? "bg-accent" : "hover:bg-accent"
											}`}
										>
											<Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
											<span className="flex-1">{t("admin.media.root")}</span>
										</button>
										{moveFolders.length > 0 ? (
											renderFolderOptions(moveFolders)
										) : (
											<p className="text-sm text-muted-foreground text-center py-4">
												{t("admin.media.noFoldersAvailable")}
											</p>
										)}
									</div>
								)}
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setMoveDialogOpen(false);
								setMediaToMove(null);
								setShowNewFolderInput(false);
								setNewFolderName("");
								setSelectedFolderId(null);
							}}
							disabled={isMoving || isCreatingFolder}
						>
							{t("common.cancel")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Folder Edit Dialog */}
			<FolderEditDialog
				folder={editFolder}
				open={!!editFolder}
				onOpenChange={(open) => {
					if (!open) setEditFolder(null);
				}}
				onSuccess={onRefresh}
			/>

			{/* Folder Delete Confirmation Dialog */}
			<AlertDialog open={!!deleteFolderId} onOpenChange={() => setDeleteFolderId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("admin.folders.deleteFolder")}</AlertDialogTitle>
						<AlertDialogDescription>
							{t("admin.folders.deleteConfirmation", { name: folders.find(f => f.id === deleteFolderId)?.name || "" })}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeletingFolder}>{t("common.cancel")}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteFolder}
							disabled={isDeletingFolder}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeletingFolder ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{t("admin.folders.deleting")}
								</>
							) : (
								t("common.delete")
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
