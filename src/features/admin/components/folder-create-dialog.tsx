"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupTextarea,
} from "@/components/ui/input-group";
import { toast } from "sonner";
import { createFolder } from "@/features/admin/lib/folder-actions";
import { FolderPlus, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

type FolderCreateDialogProps = {
	parentId?: string;
	onSuccess?: () => void;
};

export function FolderCreateDialog({
	parentId,
	onSuccess,
}: FolderCreateDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [isPending, startTransition] = useTransition();
	const t = useTranslations();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			toast.error(t("admin.folders.requiredError"));
			return;
		}

		startTransition(async () => {
			const result = await createFolder({
				name: name.trim(),
				description: description.trim() || undefined,
				parentId,
			});

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success(t("admin.folders.createdSuccess"));
				setOpen(false);
				setName("");
				setDescription("");
				onSuccess?.();
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<FolderPlus className="mr-2 h-4 w-4" />
					{t("admin.folders.newFolder")}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{t("admin.folders.createFolder")}</DialogTitle>
						<DialogDescription>
							{t("admin.folders.createDescription")}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="folder-name">{t("admin.folders.folderName")} *</Label>
							<InputGroup>
								<InputGroupInput
									id="folder-name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder={t("admin.folders.folderNamePlaceholder")}
									disabled={isPending}
									autoFocus
								/>
								<InputGroupAddon align="inline-end">
									<FolderPlus className="h-4 w-4 text-muted-foreground" />
								</InputGroupAddon>
							</InputGroup>
						</div>
						<div className="space-y-2">
							<Label htmlFor="folder-description">{t("admin.folders.description")}</Label>
							<InputGroup>
								<InputGroupTextarea
									id="folder-description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder={t("admin.folders.descriptionPlaceholder")}
									disabled={isPending}
									rows={3}
								/>
							</InputGroup>
						</div>
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
							<Button type="submit" disabled={isPending || !name.trim()}>
								{isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{t("admin.folders.creating")}
									</>
								) : (
									t("common.create")
								)}
							</Button>
						</ButtonGroup>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
