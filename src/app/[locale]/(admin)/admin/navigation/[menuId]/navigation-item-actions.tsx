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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { NavigationItemDialog } from "@/features/admin/components/navigation-item-dialog";
import { deleteNavigationItem } from "@/features/admin/lib/navigation-actions";
import { toast } from "sonner";

type NavigationItemActionsProps = {
	item: {
		id: string;
		title: string;
		href: string | null;
		description: string | null;
		order: number;
		isExternal: boolean;
		parentId: string | null;
	};
	menuId: string;
	parentItems: Array<{ id: string; title: string }>;
};

export function NavigationItemActions({
	item,
	menuId,
	parentItems,
}: NavigationItemActionsProps) {
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const result = await deleteNavigationItem(item.id);
			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Élément supprimé");
				setShowDeleteDialog(false);
			}
		} catch {
			toast.error("Une erreur est survenue");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="h-8 w-8">
						<MoreHorizontal className="h-4 w-4" />
						<span className="sr-only">Actions</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => setShowEditDialog(true)}>
						<Pencil className="mr-2 h-4 w-4" />
						Modifier
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => setShowDeleteDialog(true)}
						className="text-destructive"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Supprimer
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{showEditDialog && (
				<NavigationItemDialog
					menuId={menuId}
					item={item}
					parentItems={parentItems}
					trigger={<div />}
				/>
			)}

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
						<AlertDialogDescription>
							Cette action est irréversible. L&apos;élément &quot;{item.title}&quot; sera
							définitivement supprimé.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
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
