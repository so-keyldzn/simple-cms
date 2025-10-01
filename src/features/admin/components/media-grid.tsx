"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
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
import { deleteMedia } from "@/features/admin/lib/media-actions";
import { MoreVertical, Trash2, Copy, ExternalLink } from "lucide-react";
import { formatDistance } from "date-fns";

type MediaGridProps = {
	media: Array<{
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
	}>;
	onDelete?: () => void;
};

export function MediaGrid({ media, onDelete }: MediaGridProps) {
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const handleDelete = () => {
		if (!deleteId) return;

		startTransition(async () => {
			const result = await deleteMedia(deleteId);

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Média supprimé avec succès");
				setDeleteId(null);
				onDelete?.();
			}
		});
	};

	const copyUrl = (url: string) => {
		navigator.clipboard.writeText(url);
		toast.success("URL copiée dans le presse-papier");
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "Unknown";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
	};

	const isImage = (mimeType: string) => mimeType.startsWith("image/");

	if (media.length === 0) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-12">
					<p className="text-muted-foreground">No media files yet</p>
					<p className="text-sm text-muted-foreground mt-2">
						Add your first media file to get started
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{media.map((item) => (
					<Card key={item.id} className="overflow-hidden">
						<div className="aspect-video relative bg-muted">
							{isImage(item.mimeType) ? (
								<Image
									src={item.url}
									alt={item.alt || item.originalName}
									fill
									className="object-cover"
									unoptimized
								/>
							) : (
								<div className="flex items-center justify-center h-full">
									<p className="text-sm text-muted-foreground">
										{item.mimeType}
									</p>
								</div>
							)}
						</div>
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between">
								<div className="flex-1 min-w-0">
									<CardTitle className="text-sm truncate">
										{item.originalName}
									</CardTitle>
									<CardDescription className="text-xs">
										{formatFileSize(item.size)}
										{item.width && item.height && (
											<> · {item.width}x{item.height}</>
										)}
									</CardDescription>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="h-8 w-8">
											<MoreVertical className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => copyUrl(item.url)}>
											<Copy className="mr-2 h-4 w-4" />
											Copy URL
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => window.open(item.url, "_blank")}
										>
											<ExternalLink className="mr-2 h-4 w-4" />
											Open in new tab
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setDeleteId(item.id)}
											className="text-destructive"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</CardHeader>
						<CardContent className="pt-0">
							{item.alt && (
								<p className="text-xs text-muted-foreground line-clamp-2 mb-2">
									Alt: {item.alt}
								</p>
							)}
							<p className="text-xs text-muted-foreground">
								Uploaded by {item.user.name}
							</p>
							<p className="text-xs text-muted-foreground">
								{formatDistance(new Date(item.createdAt), new Date(), {
									addSuffix: true,
								})}
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Media</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this media file? This action
							cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
