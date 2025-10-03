"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { deleteFolder, type MediaFolderWithChildren } from "@/features/admin/lib/folder-actions";
import { Folder, FolderOpen, ChevronRight, ChevronDown, MoreVertical, Edit, Trash2, FolderPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { FolderEditDialog } from "./folder-edit-dialog";
import { FolderCreateDialog } from "./folder-create-dialog";

type FolderTreeProps = {
	folders: MediaFolderWithChildren[];
	selectedFolderId?: string | null;
	onFolderSelect: (folderId: string | null) => void;
	onRefresh: () => void;
};

export function FolderTree({ folders, selectedFolderId, onFolderSelect, onRefresh }: FolderTreeProps) {
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [folderToDelete, setFolderToDelete] = useState<{ id: string; name: string; mediaCount: number } | null>(null);
	const [editFolder, setEditFolder] = useState<{ id: string; name: string; description?: string | null } | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const toggleFolder = (folderId: string) => {
		setExpandedFolders((prev) => {
			const next = new Set(prev);
			if (next.has(folderId)) {
				next.delete(folderId);
			} else {
				next.add(folderId);
			}
			return next;
		});
	};

	const handleDeleteClick = (folder: MediaFolderWithChildren) => {
		setFolderToDelete({
			id: folder.id,
			name: folder.name,
			mediaCount: folder._count?.media || 0,
		});
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!folderToDelete) return;

		setIsDeleting(true);
		const result = await deleteFolder(folderToDelete.id, false);

		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success("Dossier supprimé avec succès");
			setDeleteDialogOpen(false);
			setFolderToDelete(null);
			if (selectedFolderId === folderToDelete.id) {
				onFolderSelect(null);
			}
			onRefresh();
		}
		setIsDeleting(false);
	};

	const renderFolder = (folder: MediaFolderWithChildren, level: number = 0) => {
		const isExpanded = expandedFolders.has(folder.id);
		const isSelected = selectedFolderId === folder.id;
		const hasChildren = folder.children && folder.children.length > 0;
		const mediaCount = folder._count?.media || 0;

		return (
			<div key={folder.id}>
				<div
					className={cn(
						"flex items-center gap-1 py-1 px-2 rounded-md hover:bg-accent transition-colors group",
						isSelected && "bg-accent"
					)}
					style={{ paddingLeft: `${level * 16 + 8}px` }}
				>
					{hasChildren ? (
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 p-0"
							onClick={() => toggleFolder(folder.id)}
						>
							{isExpanded ? (
								<ChevronDown className="h-4 w-4" />
							) : (
								<ChevronRight className="h-4 w-4" />
							)}
						</Button>
					) : (
						<div className="h-6 w-6" />
					)}

					<button
						className="flex items-center gap-2 flex-1 text-left min-w-0"
						onClick={() => onFolderSelect(folder.id)}
					>
						{isExpanded && hasChildren ? (
							<FolderOpen className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
						) : (
							<Folder className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
						)}
						<span className="text-sm truncate">{folder.name}</span>
						{mediaCount > 0 && (
							<span className="text-xs text-muted-foreground">({mediaCount})</span>
						)}
					</button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() => setEditFolder({
									id: folder.id,
									name: folder.name,
									description: folder.description,
								})}
							>
								<Edit className="mr-2 h-4 w-4" />
								Modifier
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => handleDeleteClick(folder)}
								className="text-destructive"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Supprimer
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{isExpanded && hasChildren && (
					<div>
						{folder.children.map((child) => renderFolder(child, level + 1))}
					</div>
				)}
			</div>
		);
	};

	return (
		<>
			<div className="space-y-1">
				<div
					className={cn(
						"flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent transition-colors cursor-pointer",
						selectedFolderId === null && "bg-accent"
					)}
					onClick={() => onFolderSelect(null)}
				>
					<Folder className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm font-medium">Tous les médias</span>
				</div>

				{folders.map((folder) => renderFolder(folder))}
			</div>

			<FolderEditDialog
				folder={editFolder}
				open={!!editFolder}
				onOpenChange={(open) => {
					if (!open) setEditFolder(null);
				}}
				onSuccess={onRefresh}
			/>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Supprimer le dossier</AlertDialogTitle>
						<AlertDialogDescription>
							Êtes-vous sûr de vouloir supprimer le dossier "{folderToDelete?.name}" ?
							{folderToDelete && folderToDelete.mediaCount > 0 && (
								<>
									<br />
									<br />
									<strong>Ce dossier contient {folderToDelete.mediaCount} fichier(s).</strong> Les médias seront déplacés vers la racine.
								</>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? "Suppression..." : "Supprimer"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
