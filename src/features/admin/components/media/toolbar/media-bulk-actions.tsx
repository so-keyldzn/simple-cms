"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Trash2, FolderInput, X, Loader2, Folder, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { useMediaLibrary } from "../context/media-library-context";
import { deleteMedia } from "@/features/admin/lib/media-actions";
import { moveMediaToFolder, getAllFolders, createFolder, type MediaFolderWithChildren } from "@/features/admin/lib/folder-actions";

type MediaBulkActionsProps = {
	onRefresh?: () => void;
};

export function MediaBulkActions({ onRefresh }: MediaBulkActionsProps) {
	const t = useTranslations();
	const { selectedMedia, clearSelection } = useMediaLibrary();
	const [isPending, startTransition] = useTransition();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [moveDialogOpen, setMoveDialogOpen] = useState(false);
	const [folders, setFolders] = useState<MediaFolderWithChildren[]>([]);
	const [isLoadingFolders, setIsLoadingFolders] = useState(false);
	const [isMoving, setIsMoving] = useState(false);
	const [showNewFolderInput, setShowNewFolderInput] = useState(false);
	const [newFolderName, setNewFolderName] = useState("");
	const [isCreatingFolder, setIsCreatingFolder] = useState(false);
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

	const selectedCount = selectedMedia.size;

	const handleBulkDelete = () => {
		startTransition(async () => {
			const idsToDelete = Array.from(selectedMedia);
			let deletedCount = 0;
			let errorCount = 0;

			for (const id of idsToDelete) {
				const result = await deleteMedia(id);
				if (result.error) {
					errorCount++;
				} else {
					deletedCount++;
				}
			}

			if (deletedCount > 0) {
				toast.success(t("admin.media.bulkDeletedSuccess", { count: deletedCount }));
			}
			if (errorCount > 0) {
				toast.error(t("admin.media.bulkDeletedError", { count: errorCount }));
			}

			setDeleteDialogOpen(false);
			clearSelection();
			onRefresh?.();
		});
	};

	const openMoveDialog = async () => {
		setMoveDialogOpen(true);
		setShowNewFolderInput(false);
		setNewFolderName("");
		setSelectedFolderId(null);
		setIsLoadingFolders(true);
		const result = await getAllFolders();
		if (result.data) {
			setFolders(result.data);
		}
		setIsLoadingFolders(false);
	};

	const handleMove = async (folderId: string | null) => {
		const idsToMove = Array.from(selectedMedia);

		setIsMoving(true);
		const result = await moveMediaToFolder(idsToMove, folderId);

		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success(t("admin.media.bulkMovedSuccess", { count: idsToMove.length }));
			setMoveDialogOpen(false);
			setSelectedFolderId(null);
			clearSelection();
			onRefresh?.();
		}
		setIsMoving(false);
	};

	const handleCreateAndMove = async () => {
		if (!newFolderName.trim()) return;

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

	if (selectedCount === 0) {
		return null;
	}

	return (
		<>
			<div className="flex items-center gap-2 px-4 py-2 bg-accent rounded-md">
				<Badge variant="secondary" className="font-normal">
					{selectedCount} {selectedCount === 1 ? t("admin.media.selected") : t("admin.media.selectedPlural")}
				</Badge>

				<Button
					variant="ghost"
					size="sm"
					onClick={() => clearSelection()}
				>
					<X className="mr-2 h-4 w-4" />
					{t("admin.media.clearSelection")}
				</Button>

				<div className="border-l h-6 mx-2" />

				<Button
					variant="ghost"
					size="sm"
					onClick={openMoveDialog}
				>
					<FolderInput className="mr-2 h-4 w-4" />
					{t("admin.media.moveSelected")}
				</Button>

				<Button
					variant="ghost"
					size="sm"
					onClick={() => setDeleteDialogOpen(true)}
					className="text-destructive hover:text-destructive"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					{t("admin.media.deleteSelected")}
				</Button>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("admin.media.deleteMultipleMedia")}</AlertDialogTitle>
						<AlertDialogDescription>
							{t("admin.media.deleteMultipleConfirmation", { count: selectedCount })}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>{t("common.cancel")}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleBulkDelete}
							disabled={isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{t("admin.media.deleting")}
								</>
							) : (
								t("common.delete")
							)}
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
							{t("admin.media.moveMultipleDescription", { count: selectedCount })}
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
										{folders.length > 0 ? (
											renderFolderOptions(folders)
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
		</>
	);
}
