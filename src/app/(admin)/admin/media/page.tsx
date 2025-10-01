"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { MediaUploadDialog } from "@/features/admin/components/media-upload-dialog";
import { MediaGrid } from "@/features/admin/components/media-grid";
import { getAllMedia } from "@/features/admin/lib/media-actions";
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
};

export default function MediaPage() {
	const [media, setMedia] = useState<MediaItem[]>([]);
	const [loading, setLoading] = useState(true);

	const loadMedia = async () => {
		setLoading(true);
		const result = await getAllMedia();
		if (result.data) {
			setMedia(result.data as MediaItem[]);
		}
		setLoading(false);
	};

	useEffect(() => {
		loadMedia();
	}, []);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
					<p className="text-muted-foreground">
						Manage your media files and assets
					</p>
				</div>
				<MediaUploadDialog onSuccess={loadMedia} />
			</div>

			<Separator />

			{loading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : (
				<MediaGrid media={media} onDelete={loadMedia} />
			)}
		</div>
	);
}
