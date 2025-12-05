"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Copy, ExternalLink, Edit, FolderInput } from "lucide-react";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useMediaLibrary } from "../context/media-library-context";
import { MediaContextMenu } from "../context/media-context-menu";

export type MediaItem = {
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
	folder?: {
		id: string;
		name: string;
		slug: string;
	} | null;
};

type MediaCardProps = {
	media: MediaItem;
	onDelete: (id: string) => void;
	onRename: (media: MediaItem) => void;
	onMove: (id: string) => void;
};

export function MediaCard({ media, onDelete, onRename, onMove }: MediaCardProps) {
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
			<Card className={`overflow-hidden group relative transition-all duration-200 hover:shadow-lg ${selected ? 'ring-2 ring-primary' : ''} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
				{/* Checkbox - visible on hover or when selected */}
				<div className={`absolute top-2 left-2 z-10 transition-opacity ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
					<Checkbox
						checked={selected}
						onCheckedChange={handleCheckboxChange}
						className="bg-background shadow-md"
					/>
				</div>

			<div className="aspect-video relative bg-muted">
				{isImage(media.mimeType) ? (
					<Image
						src={media.url}
						alt={media.alt || media.originalName}
						fill
						className="object-cover"
						unoptimized
					/>
				) : (
					<div className="flex items-center justify-center h-full">
						<p className="text-sm text-muted-foreground">
							{media.mimeType}
						</p>
					</div>
				)}
			</div>
			<CardHeader className="pb-3">
				<div className="flex items-start gap-2">
					<div className="flex-1 min-w-0">
						<CardTitle className="text-sm truncate max-w-[200px]" title={media.originalName}>
							{media.originalName}
						</CardTitle>
						<CardDescription className="text-xs truncate">
							{formatFileSize(media.size)}
							{media.width && media.height && (
								<> · {media.width}x{media.height}</>
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
			</CardHeader>
			<CardContent className="pt-0">
				{media.alt && (
					<p className="text-xs text-muted-foreground line-clamp-2 mb-2">
						Alt: {media.alt}
					</p>
				)}
				<p className="text-xs text-muted-foreground">
					{t("admin.media.uploadedBy")} {media.user.name}
				</p>
				<p className="text-xs text-muted-foreground">
					{formatDistance(new Date(media.createdAt), new Date(), {
						addSuffix: true,
						locale: locale === "fr" ? fr : undefined,
					})}
				</p>
			</CardContent>
		</Card>
		</MediaContextMenu>
	);
}
