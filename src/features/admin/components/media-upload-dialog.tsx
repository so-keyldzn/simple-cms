"use client";

import { useState, useRef } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Loader2, FileUp } from "lucide-react";
import { useTranslations } from "next-intl";

type MediaUploadDialogProps = {
	onSuccess?: () => void;
};

export function MediaUploadDialog({ onSuccess }: MediaUploadDialogProps) {
	const [open, setOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [alt, setAlt] = useState("");
	const [caption, setCaption] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const t = useTranslations();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			setFile(selectedFile);
		}
	};

	const handleSubmit = async () => {
		if (!file) {
			toast.error(t("admin.media.selectFileError"));
			return;
		}

		setIsPending(true);

		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			const result = await response.json();

			if (!response.ok || result.error) {
				toast.error(result.error || t("admin.media.uploadError"));
				return;
			}

			// Update alt and caption if provided
			if (result.data && (alt || caption)) {
				const updateResponse = await fetch("/api/media/update", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						id: result.data.id,
						alt: alt.trim() || undefined,
						caption: caption.trim() || undefined,
					}),
				});

				if (!updateResponse.ok) {
					console.error("Failed to update alt/caption");
				}
			}

			toast.success(t("admin.media.uploadSuccess"));
			setOpen(false);
			resetForm();
			onSuccess?.();
		} catch (error) {
			console.error("Upload error:", error);
			toast.error(t("admin.media.uploadError"));
		} finally {
			setIsPending(false);
		}
	};

	const resetForm = () => {
		setFile(null);
		setAlt("");
		setCaption("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
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
				<div className="grid gap-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="file">{t("admin.media.file")} *</Label>
						<div className="flex items-center gap-2">
							<Input
								id="file"
								type="file"
								ref={fileInputRef}
								onChange={handleFileChange}
								disabled={isPending}
								accept="image/*,video/*,.pdf"
							/>
						</div>
						{file && (
							<p className="text-sm text-muted-foreground">
								{t("admin.media.selected", {
									name: file.name,
									size: (file.size / 1024 / 1024).toFixed(2),
								})}
							</p>
						)}
					</div>
					<div className="space-y-2">
						<Label htmlFor="alt">{t("admin.media.altText")}</Label>
						<Input
							id="alt"
							placeholder={t("admin.media.altPlaceholder")}
							value={alt}
							onChange={(e) => setAlt(e.target.value)}
							disabled={isPending}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="caption">{t("admin.media.caption")}</Label>
						<Textarea
							id="caption"
							placeholder={t("admin.media.captionPlaceholder")}
							value={caption}
							onChange={(e) => setCaption(e.target.value)}
							disabled={isPending}
							rows={3}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isPending}
					>
						{t("common.cancel")}
					</Button>
					<Button onClick={handleSubmit} disabled={isPending || !file}>
						{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{!isPending && <FileUp className="mr-2 h-4 w-4" />}
						{t("admin.media.upload")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
