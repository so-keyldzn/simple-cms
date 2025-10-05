"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export function FolderEditDialog({
	folder,
	open,
	onOpenChange,
	onSuccess,
}: FolderEditDialogProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [isPending, startTransition] = useTransition();
	const t = useTranslations();

	useEffect(() => {
		if (folder) {
			setName(folder.name);
			setDescription(folder.description || "");
		}
	}, [folder]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!folder || !name.trim()) {
			toast.error(t("admin.folders.requiredError"));
			return;
		}

		startTransition(async () => {
			const result = await updateFolder(folder.id, {
				name: name.trim(),
				description: description.trim() || undefined,
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
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{t("admin.folders.editFolder")}</DialogTitle>
						<DialogDescription>
							{t("admin.folders.editDescription")}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="edit-folder-name">{t("admin.folders.folderName")} *</Label>
							<Input
								id="edit-folder-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={t("admin.folders.folderNamePlaceholder")}
								disabled={isPending}
								autoFocus
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-folder-description">{t("admin.folders.description")}</Label>
							<Textarea
								id="edit-folder-description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder={t("admin.folders.descriptionPlaceholder")}
								disabled={isPending}
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isPending}
						>
							{t("common.cancel")}
						</Button>
						<Button type="submit" disabled={isPending || !name.trim()}>
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{t("admin.folders.saving")}
								</>
							) : (
								t("common.save")
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
