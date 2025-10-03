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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createFolder } from "@/features/admin/lib/folder-actions";
import { FolderPlus, Loader2 } from "lucide-react";

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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			toast.error("Le nom du dossier est requis");
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
				toast.success("Dossier créé avec succès");
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
				<Button size="sm" variant="outline">
					<FolderPlus className="mr-2 h-4 w-4" />
					Nouveau dossier
				</Button>
			</DialogTrigger>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Créer un nouveau dossier</DialogTitle>
						<DialogDescription>
							Organisez vos médias en créant des dossiers.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="folder-name">Nom du dossier *</Label>
							<Input
								id="folder-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Mon dossier"
								disabled={isPending}
								autoFocus
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="folder-description">Description</Label>
							<Textarea
								id="folder-description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Description du dossier (optionnel)"
								disabled={isPending}
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isPending}
						>
							Annuler
						</Button>
						<Button type="submit" disabled={isPending || !name.trim()}>
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Création...
								</>
							) : (
								"Créer"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
