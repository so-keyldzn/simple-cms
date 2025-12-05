"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Copy, ExternalLink, Edit, FolderInput, File } from "lucide-react";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useMediaLibrary } from "../context/media-library-context";
import { MediaContextMenu } from "../context/media-context-menu";
import type { MediaItem } from "./media-card";

type MediaListItemProps = {
	media: MediaItem;
	onDelete: (id: string) => void;
	onRename: (media: MediaItem) => void;
	onMove: (id: string) => void;
};

export function MediaListItem({ media, onDelete, onRename, onMove }: MediaListItemProps) {
	const t = useTranslations();
	const locale = useLocale();
	const { isSelected, toggleSelection } = useMediaLibrary();

	const selected = isSelected(media.id);

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "Unknown";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
	};

	const isImage = (mimeType: string) => mimeType.startsWith("image/");

	const copyUrl = (url: string) => {
		navigator.clipboard.writeText(url);
		toast.success(t("admin.media.urlCopied"));
	};

	const handleCheckboxChange = () => {
		toggleSelection(media.id);
	};

	return (
		<MediaContextMenu
			mediaId={media.id}
			mediaUrl={media.url}
			onRename={() => onRename(media)}
			onMove={() => onMove(media.id)}
			onDelete={() => onDelete(media.id)}
		>
			<div
				className={`flex items-center gap-4 px-4 py-3 rounded-md hover:bg-accent transition-all duration-200 group ${
					selected ? "bg-accent/50" : ""
				} animate-in fade-in slide-in-from-left-2 duration-200`}
			>
			{/* Checkbox */}
			<div className={`transition-opacity ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
				<Checkbox
					checked={selected}
					onCheckedChange={handleCheckboxChange}
				/>
			</div>

			{/* Thumbnail */}
			<div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
				{isImage(media.mimeType) ? (
					<Image
						src={media.url}
						alt={media.alt || media.originalName}
						width={48}
						height={48}
						className="object-cover w-full h-full"
						unoptimized
					/>
				) : (
					<div className="flex items-center justify-center h-full">
						<File className="h-6 w-6 text-muted-foreground" />
					</div>
				)}
			</div>

			{/* Name */}
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium truncate" title={media.originalName}>
					{media.originalName}
				</p>
				<p className="text-xs text-muted-foreground">
					{formatFileSize(media.size)}
					{media.width && media.height && (
						<> · {media.width}x{media.height}</>
					)}
				</p>
			</div>

			{/* Type */}
			<div className="hidden md:block w-24 flex-shrink-0">
				<p className="text-xs text-muted-foreground truncate">
					{media.mimeType.split("/")[0]}
				</p>
			</div>

			{/* Date */}
			<div className="hidden lg:block w-32 flex-shrink-0">
				<p className="text-xs text-muted-foreground">
					{formatDistance(new Date(media.createdAt), new Date(), {
						addSuffix: true,
						locale: locale === "fr" ? fr : undefined,
					})}
				</p>
			</div>

			{/* Uploaded by */}
			<div className="hidden xl:block w-32 flex-shrink-0">
				<p className="text-xs text-muted-foreground truncate" title={media.user.name}>
					{media.user.name}
				</p>
			</div>

			{/* Actions */}
			<div className="flex-shrink-0">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => copyUrl(media.url)}>
							<Copy className="mr-2 h-4 w-4" />
							{t("admin.media.copyUrl")}
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => window.open(media.url, "_blank")}
						>
							<ExternalLink className="mr-2 h-4 w-4" />
							{t("admin.media.openNewTab")}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onRename(media)}>
							<Edit className="mr-2 h-4 w-4" />
							{t("admin.media.rename")}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onMove(media.id)}>
							<FolderInput className="mr-2 h-4 w-4" />
							{t("admin.media.moveToFolder")}
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => onDelete(media.id)}
							className="text-destructive"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							{t("admin.media.delete")}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
		</MediaContextMenu>
	);
}
