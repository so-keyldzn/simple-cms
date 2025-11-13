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
import { ButtonGroup } from "@/components/ui/button-group";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { NavigationMenuDialog } from "@/features/admin/components/navigation-menu-dialog";
import { deleteNavigationMenu } from "@/features/admin/lib/navigation-actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type NavigationMenuActionsProps = {
	menu: {
		id: string;
		name: string;
		label: string;
		description: string | null;
	};
};

export function NavigationMenuActions({ menu }: NavigationMenuActionsProps) {
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const t = useTranslations();

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const result = await deleteNavigationMenu(menu.id);
			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success(t("admin.navigation.menuDeleted"));
				setShowDeleteDialog(false);
			}
		} catch {
			toast.error(t("common.error"));
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="h-8 w-8">
						<MoreVertical className="h-4 w-4" />
						<span className="sr-only">{t("common.actions")}</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => setShowEditDialog(true)}>
						<Pencil className="mr-2 h-4 w-4" />
						{t("common.edit")}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => setShowDeleteDialog(true)}
						className="text-destructive"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						{t("common.delete")}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<NavigationMenuDialog
				menu={menu}
				trigger={<div className="hidden" />}
				open={showEditDialog}
				onOpenChange={setShowEditDialog}
			/>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("common.confirmDelete")}</AlertDialogTitle>
						<AlertDialogDescription>
							{t("admin.navigation.deleteMenuConfirm", { label: menu.label })}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<ButtonGroup>
							<AlertDialogCancel disabled={isDeleting}>
								{t("common.cancel")}
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDelete}
								disabled={isDeleting}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								{isDeleting ? t("common.deleting") : t("common.delete")}
							</AlertDialogAction>
						</ButtonGroup>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
