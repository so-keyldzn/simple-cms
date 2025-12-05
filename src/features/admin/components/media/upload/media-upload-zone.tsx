"use client";

import { useState, useRef, type DragEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

type MediaUploadZoneProps = {
	children: ReactNode;
	onFilesSelected?: (files: File[]) => void;
	currentFolderId?: string | null;
};

export function MediaUploadZone({ children, onFilesSelected, currentFolderId }: MediaUploadZoneProps) {
	const t = useTranslations();
	const [isDragging, setIsDragging] = useState(false);
	const [uploadQueue, setUploadQueue] = useState<Array<{ file: File; progress: number; id: string }>>([]);
	const dragCounter = useRef(0);

	const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current++;

		if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
			setIsDragging(true);
		}
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current--;

		if (dragCounter.current === 0) {
			setIsDragging(false);
		}
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
		dragCounter.current = 0;

		const files = Array.from(e.dataTransfer.files);

		if (files.length === 0) {
			return;
		}

		// Filter valid file types
		const validFiles = files.filter(file => {
			const isValid = file.type.startsWith("image/") ||
				file.type.startsWith("video/") ||
				file.type === "application/pdf";

			if (!isValid) {
				toast.error(t("admin.media.invalidFileType", { name: file.name }));
			}

			return isValid;
		});

		if (validFiles.length === 0) {
			return;
		}

		// Start uploading files
		await uploadFiles(validFiles);

		// Notify parent
		onFilesSelected?.(validFiles);
	};

	const uploadFiles = async (files: File[]) => {
		const uploads = files.map(file => ({
			file,
			progress: 0,
			id: Math.random().toString(36).substring(7),
		}));

		setUploadQueue(uploads);

		// Upload files one by one
		for (const upload of uploads) {
			try {
				await uploadFile(upload.file, upload.id);
			} catch (error) {
				console.error("Upload error:", error);
				toast.error(t("admin.media.uploadError"));
			}
		}

		// Clear queue after all uploads
		setTimeout(() => {
			setUploadQueue([]);
		}, 2000);
	};

	const uploadFile = async (file: File, uploadId: string) => {
		const formData = new FormData();
		formData.append("file", file);

		if (currentFolderId) {
			formData.append("folderId", currentFolderId);
		}

		// Simulate progress (in real scenario, use XMLHttpRequest for progress tracking)
		const progressInterval = setInterval(() => {
			setUploadQueue(prev =>
				prev.map(u => u.id === uploadId ? { ...u, progress: Math.min(u.progress + 10, 90) } : u)
			);
		}, 200);

		try {
			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			clearInterval(progressInterval);

			const result = await response.json();

			if (!response.ok || result.error) {
				throw new Error(result.error || "Upload failed");
			}

			// Set to 100%
			setUploadQueue(prev =>
				prev.map(u => u.id === uploadId ? { ...u, progress: 100 } : u)
			);

			toast.success(t("admin.media.uploadSuccess"));
		} catch (error) {
			clearInterval(progressInterval);
			throw error;
		}
	};

	const removeFromQueue = (id: string) => {
		setUploadQueue(prev => prev.filter(u => u.id !== id));
	};

	return (
		<div
			className="relative w-full h-full"
			onDragEnter={handleDragEnter}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			{/* Drop Overlay */}
			{isDragging && (
				<div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary rounded-lg flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
					<div className="text-center animate-in slide-in-from-bottom-4 duration-300">
						<Upload className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
						<p className="text-lg font-semibold text-primary">
							{t("admin.media.dropFilesHere")}
						</p>
						<p className="text-sm text-muted-foreground mt-2">
							{t("admin.media.supportedFormats")}
						</p>
					</div>
				</div>
			)}

			{/* Upload Progress Queue */}
			{uploadQueue.length > 0 && (
				<div className="fixed bottom-4 right-4 z-50 w-80 space-y-2">
					{uploadQueue.map(upload => (
						<div
							key={upload.id}
							className="bg-background border rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-4 fade-in duration-300"
						>
							<div className="flex items-center justify-between mb-2">
								<p className="text-sm font-medium truncate flex-1 mr-2">
									{upload.file.name}
								</p>
								{upload.progress === 100 && (
									<button
										onClick={() => removeFromQueue(upload.id)}
										className="text-muted-foreground hover:text-foreground"
									>
										<X className="h-4 w-4" />
									</button>
								)}
							</div>
							<div className="space-y-1">
								<div className="flex items-center justify-between text-xs text-muted-foreground">
									<span>{(upload.file.size / 1024 / 1024).toFixed(2)} MB</span>
									<span>{upload.progress}%</span>
								</div>
								<div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
									<div
										className="bg-primary h-full transition-all duration-300 ease-out"
										style={{ width: `${upload.progress}%` }}
									/>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Content */}
			{children}
		</div>
	);
}
