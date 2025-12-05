"use client";

import { useTranslations } from "next-intl";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Folder, MoreVertical, Edit, Trash2, FolderOpen } from "lucide-react";

export type FolderItem = {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	_count?: {
		media: number;
		children: number;
	};
};

type FolderCardProps = {
	folder: FolderItem;
	onNavigate: (folderId: string) => void;
	onEdit: (folder: FolderItem) => void;
	onDelete: (folderId: string) => void;
};

export function FolderCard({ folder, onNavigate, onEdit, onDelete }: FolderCardProps) {
	const t = useTranslations();

	const mediaCount = folder._count?.media || 0;
	const subFoldersCount = folder._count?.children || 0;

	return (
		<Card
			className="overflow-hidden group relative transition-all duration-200 hover:shadow-lg cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-300"
			onClick={() => onNavigate(folder.id)}
		>
			{/* Folder Icon Background */}
			<div className="aspect-video relative bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
				<Folder className="h-20 w-20 text-primary/40" />
			</div>

			<CardHeader className="pb-3">
				<div className="flex items-start gap-2">
					<div className="flex-1 min-w-0">
						<CardTitle className="text-sm truncate flex items-center gap-2" title={folder.name}>
							<FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
							{folder.name}
						</CardTitle>
						<CardDescription className="text-xs truncate">
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
						</CardDescription>
					</div>
					<div className="flex-shrink-0">
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
			</CardHeader>

			{folder.description && (
				<CardContent className="pt-0">
					<p className="text-xs text-muted-foreground line-clamp-2">
						{folder.description}
					</p>
				</CardContent>
			)}
		</Card>
	);
}
