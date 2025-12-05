"use client";

import type { ReactNode } from "react";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
	Copy,
	ExternalLink,
	Edit,
	FolderInput,
	Trash2,
	CheckSquare,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMediaLibrary } from "../context/media-library-context";

type MediaContextMenuProps = {
	children: ReactNode;
	mediaId: string;
	mediaUrl: string;
	onRename: () => void;
	onMove: () => void;
	onDelete: () => void;
};

export function MediaContextMenu({
	children,
	mediaId,
	mediaUrl,
	onRename,
	onMove,
	onDelete,
}: MediaContextMenuProps) {
	const t = useTranslations();
	const { isSelected, toggleSelection } = useMediaLibrary();
	const selected = isSelected(mediaId);

	const handleCopyUrl = () => {
		navigator.clipboard.writeText(mediaUrl);
	};

	const handleOpenNewTab = () => {
		window.open(mediaUrl, "_blank");
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
			<ContextMenuContent className="w-48">
				<ContextMenuItem onClick={handleCopyUrl}>
					<Copy className="mr-2 h-4 w-4" />
					{t("admin.media.copyUrl")}
				</ContextMenuItem>
				<ContextMenuItem onClick={handleOpenNewTab}>
					<ExternalLink className="mr-2 h-4 w-4" />
					{t("admin.media.openNewTab")}
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem onClick={() => toggleSelection(mediaId)}>
					<CheckSquare className="mr-2 h-4 w-4" />
					{selected ? t("common.unselect") : t("common.select")}
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem onClick={onRename}>
					<Edit className="mr-2 h-4 w-4" />
					{t("admin.media.rename")}
				</ContextMenuItem>
				<ContextMenuItem onClick={onMove}>
					<FolderInput className="mr-2 h-4 w-4" />
					{t("admin.media.moveToFolder")}
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
					<Trash2 className="mr-2 h-4 w-4" />
					{t("admin.media.delete")}
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
