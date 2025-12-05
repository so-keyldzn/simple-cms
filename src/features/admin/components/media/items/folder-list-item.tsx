"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Folder, MoreVertical, Edit, Trash2, ChevronRight } from "lucide-react";
import type { FolderItem } from "./folder-card";

type FolderListItemProps = {
	folder: FolderItem;
	onNavigate: (folderId: string) => void;
	onEdit: (folder: FolderItem) => void;
	onDelete: (folderId: string) => void;
};

export function FolderListItem({ folder, onNavigate, onEdit, onDelete }: FolderListItemProps) {
	const t = useTranslations();

	const mediaCount = folder._count?.media || 0;
	const subFoldersCount = folder._count?.children || 0;

	return (
		<div
			className="flex items-center gap-4 px-4 py-3 rounded-md hover:bg-accent transition-colors cursor-pointer group"
			onClick={() => onNavigate(folder.id)}
		>
			{/* Icon */}
			<div className="w-12 h-12 rounded overflow-hidden bg-primary/10 flex-shrink-0 flex items-center justify-center">
				<Folder className="h-6 w-6 text-primary" />
			</div>

			{/* Name */}
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium truncate flex items-center gap-2" title={folder.name}>
					{folder.name}
				</p>
				<p className="text-xs text-muted-foreground">
					{mediaCount > 0 && (
						<span>{mediaCount} {mediaCount === 1 ? t("admin.media.file") : t("admin.media.files")}</span>
					)}
					{mediaCount > 0 && subFoldersCount > 0 && <span className="mx-1">•</span>}
					{subFoldersCount > 0 && (
						<span>{subFoldersCount} {subFoldersCount === 1 ? t("admin.folders.subfolder") : t("admin.folders.subfolders")}</span>
					)}
					{mediaCount === 0 && subFoldersCount === 0 && (
						<span className="text-muted-foreground">{t("admin.folders.empty")}</span>
					)}
				</p>
			</div>

			{/* Type */}
			<div className="hidden md:block w-24 flex-shrink-0">
				<p className="text-xs text-muted-foreground">
					{t("admin.media.folder")}
				</p>
			</div>

			{/* Placeholder for date column */}
			<div className="hidden lg:block w-32 flex-shrink-0"></div>

			{/* Placeholder for user column */}
			<div className="hidden xl:block w-32 flex-shrink-0"></div>

			{/* Actions */}
			<div className="flex-shrink-0 flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 opacity-0 group-hover:opacity-100"
					onClick={(e) => {
						e.stopPropagation();
						onNavigate(folder.id);
					}}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
						<DropdownMenuItem onClick={(e) => {
							e.stopPropagation();
							onEdit(folder);
						}}>
							<Edit className="mr-2 h-4 w-4" />
							{t("common.edit")}
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation();
								onDelete(folder.id);
							}}
							className="text-destructive"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							{t("common.delete")}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
