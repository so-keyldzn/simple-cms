"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { toast } from "sonner";
import { Upload, Loader2, FileUp, File, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Progress } from "@/components/ui/progress";

type MediaUploadDialogProps = {
	onSuccess?: () => void;
	currentFolderId?: string | null;
};

type FormData = {
	file: FileList | null;
	alt: string;
	caption: string;
};

export function MediaUploadDialog({ onSuccess, currentFolderId }: MediaUploadDialogProps) {
	const [open, setOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
	const t = useTranslations();

	const form = useForm<FormData>({
		defaultValues: {
			file: null,
			alt: "",
			caption: "",
		},
	});

	const handleFilesChange = (files: FileList | null) => {
		if (files) {
			setSelectedFiles(Array.from(files));
		}
	};

	const removeFile = (index: number) => {
		setSelectedFiles(prev => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async (data: FormData) => {
		if (selectedFiles.length === 0) {
			toast.error(t("admin.media.selectFileError"));
			return;
		}

		setIsPending(true);
		let successCount = 0;
		let errorCount = 0;

		try {
			// Upload files one by one
			for (let i = 0; i < selectedFiles.length; i++) {
				const file = selectedFiles[i];
				const fileId = `${file.name}-${i}`;

				try {
					// Initialize progress
					setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

					const formData = new FormData();
					formData.append("file", file);

					if (currentFolderId) {
						formData.append("folderId", currentFolderId);
					}

					// Simulate progress (in real scenario, use XMLHttpRequest)
					const progressInterval = setInterval(() => {
						setUploadProgress(prev => ({
							...prev,
							[fileId]: Math.min((prev[fileId] || 0) + 10, 90)
						}));
					}, 200);

					const response = await fetch("/api/upload", {
						method: "POST",
						body: formData,
					});

					clearInterval(progressInterval);

					const result = await response.json();

					if (!response.ok || result.error) {
						console.error("Upload failed:", {
							status: response.status,
							statusText: response.statusText,
							error: result.error,
							file: file.name,
							fileSize: file.size,
						});
						toast.error(`${file.name}: ${result.error || "Upload failed"}`);
						errorCount++;
						setUploadProgress(prev => ({ ...prev, [fileId]: -1 })); // -1 indicates error
						continue;
					}

					// For single file, update alt and caption
					if (selectedFiles.length === 1 && result.data && (data.alt || data.caption)) {
						await fetch("/api/media/update", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								id: result.data.id,
								alt: data.alt.trim() || undefined,
								caption: data.caption.trim() || undefined,
							}),
						});
					}

					successCount++;
					setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
				} catch (err) {
					console.error(`Upload error for ${file.name}:`, err);
					errorCount++;
					setUploadProgress(prev => ({ ...prev, [fileId]: -1 }));
				}
			}

			// Show results
			if (successCount > 0 && errorCount === 0) {
				toast.success(
					selectedFiles.length === 1
						? t("admin.media.uploadSuccess")
						: `${successCount} ${t("admin.media.files")} ${t("admin.media.uploadSuccess").toLowerCase()}`
				);
			} else if (successCount > 0 && errorCount > 0) {
				toast.warning(`${successCount} ${t("common.success")}, ${errorCount} ${t("common.error")}(s)`);
			} else {
				toast.error(t("admin.media.uploadError"));
			}

			if (successCount > 0) {
				setTimeout(() => {
					setOpen(false);
					form.reset();
					setSelectedFiles([]);
					setUploadProgress({});
					onSuccess?.();
				}, 1000);
			}
		} catch (err) {
			console.error("Upload error:", err);
			toast.error(t("admin.media.uploadError"));
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Upload className="mr-2 h-4 w-4" />
					{t("admin.media.uploadMedia")}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>{t("admin.media.uploadTitle")}</DialogTitle>
					<DialogDescription>
						{t("admin.media.uploadDescription")}
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<div className="grid gap-4 py-4">
							<FormField
								control={form.control}
								name="file"
								rules={{ required: t("admin.media.selectFileError") }}
								// eslint-disable-next-line @typescript-eslint/no-unused-vars
								render={({ field: { onChange, value: _value, ...field } }) => (
									<FormItem>
										<FormLabel>{t("admin.media.file")} *</FormLabel>
										<FormControl>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<File className="h-4 w-4" />
												</InputGroupAddon>
												<Input
													type="file"
													multiple
													onChange={(e) => {
														onChange(e.target.files);
														handleFilesChange(e.target.files);
													}}
													disabled={isPending}
													accept="image/*,video/*,.pdf"
													className="flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
													{...field}
												/>
											</InputGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Selected Files List */}
							{selectedFiles.length > 0 && (
								<div className="space-y-2">
									<p className="text-sm font-medium">
										{selectedFiles.length} {t("admin.media.files")} {t("admin.media.selected")}
									</p>
									<div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
										{selectedFiles.map((file, index) => {
											const fileId = `${file.name}-${index}`;
											const progress = uploadProgress[fileId];
											const isUploading = isPending && progress !== undefined;
											const hasError = progress === -1;

											return (
												<div
													key={fileId}
													className="flex items-center justify-between gap-2 rounded-md bg-muted/50 p-2"
												>
													<div className="flex-1 truncate">
														<p className="truncate text-sm">{file.name}</p>
														<p className="text-xs text-muted-foreground">
															{(file.size / 1024 / 1024).toFixed(2)} MB
														</p>
														{isUploading && (
															<Progress
																value={progress >= 0 ? progress : 0}
																className="mt-1 h-1"
															/>
														)}
													</div>
													{!isPending && (
														<Button
															type="button"
															variant="ghost"
															size="icon"
															className="h-6 w-6 shrink-0"
															onClick={() => removeFile(index)}
														>
															<X className="h-3 w-3" />
														</Button>
													)}
													{hasError && (
														<span className="text-xs text-destructive">Error</span>
													)}
												</div>
											);
										})}
									</div>
								</div>
							)}

							{/* Only show alt/caption for single file */}
							{selectedFiles.length === 1 && (
								<>
									<FormField
										control={form.control}
										name="alt"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("admin.media.altText")}</FormLabel>
												<FormControl>
													<InputGroupInput
														placeholder={t("admin.media.altPlaceholder")}
														disabled={isPending}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="caption"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("admin.media.caption")}</FormLabel>
												<FormControl>
													<Textarea
														placeholder={t("admin.media.captionPlaceholder")}
														disabled={isPending}
														rows={3}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</>
							)}
						</div>
						<DialogFooter>
							<ButtonGroup>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setOpen(false);
										setSelectedFiles([]);
										setUploadProgress({});
									}}
									disabled={isPending}
								>
									{t("common.cancel")}
								</Button>
								<Button type="submit" disabled={isPending || selectedFiles.length === 0}>
									{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									{!isPending && <FileUp className="mr-2 h-4 w-4" />}
									{t("admin.media.upload")}
									{selectedFiles.length > 1 && ` (${selectedFiles.length})`}
								</Button>
							</ButtonGroup>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
