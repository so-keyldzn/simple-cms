"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Edit, Trash, Loader2, Tag as TagIcon } from "lucide-react";
import { toast } from "sonner";
import { listTagsAction, deleteTagAction, createTagAction, updateTagAction } from "@/features/blog/lib/tag-actions";
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

type Tag = {
	id: string;
	name: string;
	slug: string;
	_count: { posts: number };
};

export default function TagsPage() {
	const [tags, setTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingTag, setEditingTag] = useState<Tag | null>(null);
	const [formLoading, setFormLoading] = useState(false);
	const [name, setName] = useState("");

	const loadTags = async () => {
		setLoading(true);
		const result = await listTagsAction();
		if (result.data) {
			setTags(result.data as Tag[]);
		} else {
			toast.error(result.error || "Erreur lors du chargement");
		}
		setLoading(false);
	};

	useEffect(() => {
		loadTags();
	}, []);

	const handleDelete = async (id: string) => {
		if (!confirm("Êtes-vous sûr de vouloir supprimer ce tag ?")) return;

		const result = await deleteTagAction(id);
		if (result.data) {
			toast.success("Tag supprimé");
			loadTags();
		} else {
			toast.error(result.error || "Erreur lors de la suppression");
		}
	};

	const handleEdit = (tag: Tag) => {
		setEditingTag(tag);
		setName(tag.name);
		setDialogOpen(true);
	};

	const handleCreate = () => {
		setEditingTag(null);
		setName("");
		setDialogOpen(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormLoading(true);

		const result = editingTag
			? await updateTagAction(editingTag.id, { name })
			: await createTagAction({ name });

		if (result.data) {
			toast.success(
				editingTag ? "Tag modifié avec succès" : "Tag créé avec succès"
			);
			setDialogOpen(false);
			loadTags();
		} else {
			toast.error(result.error || "Erreur");
		}

		setFormLoading(false);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Tags</h1>
					<p className="text-muted-foreground">Gérez les tags de votre blog</p>
				</div>
				<Button onClick={handleCreate}>
					<Plus className="mr-2 h-4 w-4" />
					Nouveau tag
				</Button>
			</div>

			{loading ? (
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : (
				<div className="border rounded-lg">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nom</TableHead>
								<TableHead>Slug</TableHead>
								<TableHead>Articles</TableHead>
								<TableHead className="w-[70px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{tags.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className="text-center text-muted-foreground">
										Aucun tag trouvé
									</TableCell>
								</TableRow>
							) : (
								tags.map((tag) => (
									<TableRow key={tag.id}>
										<TableCell className="font-medium flex items-center gap-2">
											<TagIcon className="h-4 w-4 text-muted-foreground" />
											{tag.name}
										</TableCell>
										<TableCell className="font-mono text-sm text-muted-foreground">
											{tag.slug}
										</TableCell>
										<TableCell>
											<Badge variant="secondary">{tag._count.posts}</Badge>
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuLabel>Actions</DropdownMenuLabel>
													<DropdownMenuSeparator />
													<DropdownMenuItem onClick={() => handleEdit(tag)}>
														<Edit className="mr-2 h-4 w-4" />
														Modifier
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-red-600"
														onClick={() => handleDelete(tag.id)}
														disabled={tag._count.posts > 0}
													>
														<Trash className="mr-2 h-4 w-4" />
														Supprimer
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingTag ? "Modifier le tag" : "Créer un tag"}
						</DialogTitle>
						<DialogDescription>
							{editingTag
								? "Modifiez les informations du tag"
								: "Ajoutez un nouveau tag à votre blog"}
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Nom *</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="JavaScript"
								required
							/>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setDialogOpen(false)}
								disabled={formLoading}
							>
								Annuler
							</Button>
							<Button type="submit" disabled={formLoading}>
								{formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{editingTag ? "Enregistrer" : "Créer"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
