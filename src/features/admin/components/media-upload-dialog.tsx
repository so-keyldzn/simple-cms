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
	InputGroupText,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { toast } from "sonner";
import { Upload, Loader2, FileUp, File } from "lucide-react";
import { useTranslations } from "next-intl";

type MediaUploadDialogProps = {
	onSuccess?: () => void;
};

type FormData = {
	file: FileList | null;
	alt: string;
	caption: string;
};

export function MediaUploadDialog({ onSuccess }: MediaUploadDialogProps) {
	const [open, setOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const t = useTranslations();

	const form = useForm<FormData>({
		defaultValues: {
			file: null,
			alt: "",
			caption: "",
		},
	});

	const selectedFile = form.watch("file")?.[0];

	const handleSubmit = async (data: FormData) => {
		const file = data.file?.[0];
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
			if (result.data && (data.alt || data.caption)) {
				const updateResponse = await fetch("/api/media/update", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						id: result.data.id,
						alt: data.alt.trim() || undefined,
						caption: data.caption.trim() || undefined,
					}),
				});

				if (!updateResponse.ok) {
					console.error("Failed to update alt/caption");
				}
			}

			toast.success(t("admin.media.uploadSuccess"));
			setOpen(false);
			form.reset();
			onSuccess?.();
		} catch {
			console.error("Upload error:", error);
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
								render={({ field: { onChange, ...field } }) => (
									<FormItem>
										<FormLabel>{t("admin.media.file")} *</FormLabel>
										<FormControl>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<File className="h-4 w-4" />
												</InputGroupAddon>
												<Input
													type="file"
													onChange={(e) => onChange(e.target.files)}
													disabled={isPending}
													accept="image/*,video/*,.pdf"
													className="flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
													{...field}
												/>
											</InputGroup>
										</FormControl>
										{selectedFile && (
											<InputGroupText>
												{t("admin.media.selected", {
													name: selectedFile.name,
													size: (selectedFile.size / 1024 / 1024).toFixed(2),
												})}
											</InputGroupText>
										)}
										<FormMessage />
									</FormItem>
								)}
							/>

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
						</div>
						<DialogFooter>
							<ButtonGroup>
								<Button
									type="button"
									variant="outline"
									onClick={() => setOpen(false)}
									disabled={isPending}
								>
									{t("common.cancel")}
								</Button>
								<Button type="submit" disabled={isPending || !selectedFile}>
									{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									{!isPending && <FileUp className="mr-2 h-4 w-4" />}
									{t("admin.media.upload")}
								</Button>
							</ButtonGroup>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
