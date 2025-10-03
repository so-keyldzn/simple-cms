"use client";

import { useState, useTransition } from "react";
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
import { MoreVertical, Trash2, Copy, ExternalLink, Edit, Loader2, FolderInput, Folder, FolderPlus, ChevronRight } from "lucide-react";
import { formatDistance } from "date-fns";

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
				toast.success("Média supprimé avec succès");
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
			toast.success("Média renommé avec succès");
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
		toast.success("URL copiée dans le presse-papier");
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
			toast.success("Média déplacé avec succès");
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
					<p className="text-muted-foreground">No media files yet</p>
					<p className="text-sm text-muted-foreground mt-2">
						Add your first media file to get started
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
											Copier l'URL
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => window.open(item.url, "_blank")}
										>
											<ExternalLink className="mr-2 h-4 w-4" />
											Ouvrir dans un nouvel onglet
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => openRenameDialog(item)}>
											<Edit className="mr-2 h-4 w-4" />
											Renommer
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => openMoveDialog(item.id)}>
											<FolderInput className="mr-2 h-4 w-4" />
											Déplacer vers dossier
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setDeleteId(item.id)}
											className="text-destructive"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Supprimer
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
								Uploaded by {item.user.name}
							</p>
							<p className="text-xs text-muted-foreground">
								{formatDistance(new Date(item.createdAt), new Date(), {
									addSuffix: true,
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
						<DialogTitle>Renommer le fichier</DialogTitle>
						<DialogDescription>
							Modifiez le nom du fichier média. Cela ne changera pas l'URL du fichier.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="media-name">Nom du fichier</Label>
							<Input
								id="media-name"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								placeholder="Nouveau nom du fichier"
								disabled={isRenaming}
							/>
							<p className="text-xs text-muted-foreground">
								Les caractères spéciaux seront remplacés par des tirets
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
							Annuler
						</Button>
						<Button
							onClick={handleRename}
							disabled={isRenaming || !newName.trim()}
						>
							{isRenaming ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Renommage...
								</>
							) : (
								"Renommer"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Supprimer le média</AlertDialogTitle>
						<AlertDialogDescription>
							Êtes-vous sûr de vouloir supprimer ce fichier média ? Cette action
							est irréversible.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Supprimer
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Move to Folder Dialog */}
			<Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Déplacer vers un dossier</DialogTitle>
						<DialogDescription>
							Sélectionnez un dossier existant ou créez-en un nouveau.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{/* Create new folder section */}
						{showNewFolderInput ? (
							<div className="space-y-3 p-4 border rounded-lg bg-muted/50">
								<div className="flex items-center justify-between">
									<Label htmlFor="new-folder-name" className="text-sm font-medium">
										Nouveau dossier
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
										Annuler
									</Button>
								</div>
								<div className="flex gap-2">
									<Input
										id="new-folder-name"
										placeholder="Nom du dossier"
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
											"Créer et déplacer"
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
								Créer un nouveau dossier
							</Button>
						)}

						{/* Folder list */}
						<div className="space-y-2">
							<Label className="text-sm font-medium">Dossiers existants</Label>
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
											<span className="flex-1">Racine (sans dossier)</span>
										</button>
										{folders.length > 0 ? (
											renderFolderOptions(folders)
										) : (
											<p className="text-sm text-muted-foreground text-center py-4">
												Aucun dossier disponible
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
							Annuler
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
