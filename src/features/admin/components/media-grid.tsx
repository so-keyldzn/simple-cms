"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { deleteMedia, renameMedia } from "@/features/admin/lib/media-actions";
import { moveMediaToFolder, getAllFolders, createFolder, type MediaFolderWithChildren } from "@/features/admin/lib/folder-actions";
import { MoreVertical, Trash2, Copy, ExternalLink, Edit, Loader2, FolderInput, Folder, FolderPlus } from "lucide-react";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";

type MediaGridProps = {
	media: Array<{
		id: string;
		filename: string;
		originalName: string;
		url: string;
		mimeType: string;
		size: number;
		width?: number | null;
		height?: number | null;
		alt?: string | null;
		caption?: string | null;
		userId: string;
		createdAt: Date;
		updatedAt: Date;
		user: {
			id: string;
			name: string;
			email: string;
		};
	}>;
	onDelete?: () => void;
};

export function MediaGrid({ media, onDelete }: MediaGridProps) {
	const t = useTranslations();
	const locale = useLocale();
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [renameId, setRenameId] = useState<string | null>(null);
	const [newName, setNewName] = useState("");
	const [isPending, startTransition] = useTransition();
	const [isRenaming, setIsRenaming] = useState(false);
	const [moveDialogOpen, setMoveDialogOpen] = useState(false);
	const [mediaToMove, setMediaToMove] = useState<string | null>(null);
	const [folders, setFolders] = useState<MediaFolderWithChildren[]>([]);
	const [isLoadingFolders, setIsLoadingFolders] = useState(false);
	const [isMoving, setIsMoving] = useState(false);
	const [showNewFolderInput, setShowNewFolderInput] = useState(false);
	const [newFolderName, setNewFolderName] = useState("");
	const [isCreatingFolder, setIsCreatingFolder] = useState(false);
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

	const handleDelete = () => {
		if (!deleteId) return;

		startTransition(async () => {
			const result = await deleteMedia(deleteId);

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success(t("admin.media.deletedSuccess"));
				setDeleteId(null);
				onDelete?.();
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
			onDelete?.(); // Refresh the list
		}
		setIsRenaming(false);
	};

	const openRenameDialog = (item: typeof media[0]) => {
		setRenameId(item.id);
		setNewName(item.originalName);
	};

	const copyUrl = (url: string) => {
		navigator.clipboard.writeText(url);
		toast.success(t("admin.media.urlCopied"));
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
			setFolders(result.data);
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
			onDelete?.(); // Refresh the list
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
			// Move to the newly created folder
			await handleMove(result.data.id);
			setShowNewFolderInput(false);
			setNewFolderName("");
		}
		setIsCreatingFolder(false);
	};

	const renderFolderOptions = (folders: MediaFolderWithChildren[], level: number = 0): JSX.Element[] => {
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

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "Unknown";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
	};

	const isImage = (mimeType: string) => mimeType.startsWith("image/");

	if (media.length === 0) {
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

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{media.map((item) => (
					<Card key={item.id} className="overflow-hidden">
						<div className="aspect-video relative bg-muted">
							{isImage(item.mimeType) ? (
								<Image
									src={item.url}
									alt={item.alt || item.originalName}
									fill
									className="object-cover"
									unoptimized
								/>
							) : (
								<div className="flex items-center justify-center h-full">
									<p className="text-sm text-muted-foreground">
										{item.mimeType}
									</p>
								</div>
							)}
						</div>
						<CardHeader className="pb-3">
							<div className="flex items-start gap-2">
								<div className="flex-1 min-w-0">
									<CardTitle className="text-sm truncate max-w-[200px]" title={item.originalName}>
										{item.originalName}
									</CardTitle>
									<CardDescription className="text-xs truncate">
										{formatFileSize(item.size)}
										{item.width && item.height && (
											<> · {item.width}x{item.height}</>
										)}
									</CardDescription>
								</div>
								<div className="flex-shrink-0">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="h-8 w-8">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => copyUrl(item.url)}>
											<Copy className="mr-2 h-4 w-4" />
											{t("admin.media.copyUrl")}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => window.open(item.url, "_blank")}
										>
											<ExternalLink className="mr-2 h-4 w-4" />
											{t("admin.media.openNewTab")}
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => openRenameDialog(item)}>
											<Edit className="mr-2 h-4 w-4" />
											{t("admin.media.rename")}
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => openMoveDialog(item.id)}>
											<FolderInput className="mr-2 h-4 w-4" />
											{t("admin.media.moveToFolder")}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setDeleteId(item.id)}
											className="text-destructive"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											{t("admin.media.delete")}
										</DropdownMenuItem>
									</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						</CardHeader>
						<CardContent className="pt-0">
							{item.alt && (
								<p className="text-xs text-muted-foreground line-clamp-2 mb-2">
									Alt: {item.alt}
								</p>
							)}
							<p className="text-xs text-muted-foreground">
								{t("admin.media.uploadedBy")} {item.user.name}
							</p>
							<p className="text-xs text-muted-foreground">
								{formatDistance(new Date(item.createdAt), new Date(), {
									addSuffix: true,
									locale: locale === "fr" ? fr : undefined,
								})}
							</p>
						</CardContent>
					</Card>
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
						{/* Create new folder section */}
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

						{/* Folder list */}
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
		</>
	);
}
