"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { MediaUploadDialog } from "@/features/admin/components/media-upload-dialog";
import { MediaGrid } from "@/features/admin/components/media-grid";
import { FolderTree } from "@/features/admin/components/folder-tree";
import { FolderCreateDialog } from "@/features/admin/components/folder-create-dialog";
import { FolderBreadcrumb } from "@/features/admin/components/folder-breadcrumb";
import { getAllMedia } from "@/features/admin/lib/media-actions";
import { getAllFolders, getFolderBreadcrumb, type MediaFolderWithChildren } from "@/features/admin/lib/folder-actions";
import { Loader2 } from "lucide-react";

type MediaItem = {
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

export default function MediaPage() {
	const t = useTranslations();
	const [media, setMedia] = useState<MediaItem[]>([]);
	const [folders, setFolders] = useState<MediaFolderWithChildren[]>([]);
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
	const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string; name: string; slug: string }>>([]);
	const [loading, setLoading] = useState(true);
	const [loadingFolders, setLoadingFolders] = useState(true);

	const loadMedia = async (folderId?: string | null) => {
		setLoading(true);
		const result = await getAllMedia(folderId);
		if (result.data) {
			setMedia(result.data as MediaItem[]);
		}
		setLoading(false);
	};

	const loadFolders = async () => {
		setLoadingFolders(true);
		const result = await getAllFolders();
		if (result.data) {
			setFolders(result.data);
		}
		setLoadingFolders(false);
	};

	const loadBreadcrumb = async (folderId: string) => {
		const result = await getFolderBreadcrumb(folderId);
		if (result.data) {
			setBreadcrumb(result.data);
		}
	};

	const handleFolderSelect = (folderId: string | null) => {
		setSelectedFolderId(folderId);
		if (folderId) {
			loadBreadcrumb(folderId);
		} else {
			setBreadcrumb([]);
		}
		loadMedia(folderId);
	};

	const handleRefresh = () => {
		loadFolders();
		loadMedia(selectedFolderId);
	};

	useEffect(() => {
		loadMedia();
		loadFolders();
	}, []);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">{t("admin.media.title")}</h1>
					<p className="text-muted-foreground">
						{t("admin.media.description")}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<FolderCreateDialog parentId={selectedFolderId || undefined} onSuccess={handleRefresh} />
					<MediaUploadDialog onSuccess={handleRefresh} />
				</div>
			</div>

			<Separator />

			<div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
				{/* Sidebar with folder tree */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold">{t("admin.media.folders")}</h2>
					</div>
					{loadingFolders ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : (
						<FolderTree
							folders={folders}
							selectedFolderId={selectedFolderId}
							onFolderSelect={handleFolderSelect}
							onRefresh={handleRefresh}
						/>
					)}
				</div>

				{/* Main content area */}
				<div className="space-y-4">
					{breadcrumb.length > 0 && (
						<FolderBreadcrumb
							breadcrumb={breadcrumb}
							onNavigate={(folderId) => handleFolderSelect(folderId || null)}
						/>
					)}

					{loading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : (
						<MediaGrid media={media} onDelete={handleRefresh} />
					)}
				</div>
			</div>
		</div>
	);
}
