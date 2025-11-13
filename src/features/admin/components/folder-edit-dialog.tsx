"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
	InputGroupInput,
	InputGroupTextarea,
} from "@/components/ui/input-group";
import { toast } from "sonner";
import { updateFolder } from "@/features/admin/lib/folder-actions";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

type FolderEditDialogProps = {
	folder: {
		id: string;
		name: string;
		description?: string | null;
	} | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
};

type FormData = {
	name: string;
	description: string;
};

export function FolderEditDialog({
	folder,
	open,
	onOpenChange,
	onSuccess,
}: FolderEditDialogProps) {
	const [isPending, startTransition] = useTransition();
	const t = useTranslations();

	const form = useForm<FormData>({
		defaultValues: {
			name: "",
			description: "",
		},
	});

	useEffect(() => {
		if (folder) {
			form.reset({
				name: folder.name,
				description: folder.description || "",
			});
		}
	}, [folder, form]);

	const handleSubmit = (data: FormData) => {
		if (!folder) return;

		startTransition(async () => {
			const result = await updateFolder(folder.id, {
				name: data.name.trim(),
				description: data.description.trim() || undefined,
			});

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success(t("admin.folders.updatedSuccess"));
				onOpenChange(false);
				onSuccess?.();
			}
		});
	};

	if (!folder) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)}>
						<DialogHeader>
							<DialogTitle>{t("admin.folders.editFolder")}</DialogTitle>
							<DialogDescription>
								{t("admin.folders.editDescription")}
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<FormField
								control={form.control}
								name="name"
								rules={{
									required: t("admin.folders.requiredError"),
									validate: (value) => value.trim().length > 0 || t("admin.folders.requiredError"),
								}}
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin.folders.folderName")} *</FormLabel>
										<FormControl>
											<InputGroup>
												<InputGroupInput
													{...field}
													placeholder={t("admin.folders.folderNamePlaceholder")}
													disabled={isPending}
													autoFocus
												/>
											</InputGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin.folders.description")}</FormLabel>
										<FormControl>
											<InputGroup>
												<InputGroupTextarea
													{...field}
													placeholder={t("admin.folders.descriptionPlaceholder")}
													disabled={isPending}
													rows={3}
												/>
											</InputGroup>
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
									onClick={() => onOpenChange(false)}
									disabled={isPending}
								>
									{t("common.cancel")}
								</Button>
								<Button type="submit" disabled={isPending || !form.watch("name")?.trim()}>
									{isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											{t("admin.folders.saving")}
										</>
									) : (
										t("common.save")
									)}
								</Button>
							</ButtonGroup>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
