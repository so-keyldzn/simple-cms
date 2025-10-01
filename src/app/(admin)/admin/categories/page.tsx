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
import { Plus, MoreHorizontal, Edit, Trash, Loader2, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { listCategoriesAction, deleteCategoryAction } from "@/features/blog/lib/category-actions";
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
import { createCategoryAction, updateCategoryAction } from "@/features/blog/lib/category-actions";

type Category = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	_count: { posts: number };
};

export default function CategoriesPage() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [formLoading, setFormLoading] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	const loadCategories = async () => {
		setLoading(true);
		const result = await listCategoriesAction();
		if (result.data) {
			setCategories(result.data as Category[]);
		} else {
			toast.error(result.error || "Erreur lors du chargement");
		}
		setLoading(false);
	};

	useEffect(() => {
		loadCategories();
	}, []);

	const handleDelete = async (id: string, postsCount: number) => {
		if (postsCount > 0) {
			toast.error(`Impossible de supprimer : ${postsCount} article(s) utilisent cette catégorie`);
			return;
		}

		if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?"))
			return;

		const result = await deleteCategoryAction(id);
		if (result.data) {
			toast.success("Catégorie supprimée");
			loadCategories();
		} else {
			toast.error(result.error || "Erreur lors de la suppression");
		}
	};

	const handleEdit = (category: Category) => {
		setEditingCategory(category);
		setName(category.name);
		setDescription(category.description || "");
		setDialogOpen(true);
	};

	const handleCreate = () => {
		setEditingCategory(null);
		setName("");
		setDescription("");
		setDialogOpen(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormLoading(true);

		const result = editingCategory
			? await updateCategoryAction(editingCategory.id, {
					name,
					description: description || undefined,
			  })
			: await createCategoryAction({
					name,
					description: description || undefined,
			  });

		if (result.data) {
			toast.success(
				editingCategory
					? "Catégorie modifiée avec succès"
					: "Catégorie créée avec succès"
			);
			setDialogOpen(false);
			loadCategories();
		} else {
			toast.error(result.error || "Erreur");
		}

		setFormLoading(false);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Catégories</h1>
					<p className="text-muted-foreground">
						Gérez les catégories de votre blog
					</p>
				</div>
				<Button onClick={handleCreate}>
					<Plus className="mr-2 h-4 w-4" />
					Nouvelle catégorie
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
								<TableHead>Description</TableHead>
								<TableHead>Articles</TableHead>
								<TableHead className="w-[70px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{categories.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center text-muted-foreground">
										Aucune catégorie trouvée
									</TableCell>
								</TableRow>
							) : (
								categories.map((category) => (
									<TableRow key={category.id}>
										<TableCell className="font-medium flex items-center gap-2">
											<FolderOpen className="h-4 w-4 text-muted-foreground" />
											{category.name}
										</TableCell>
										<TableCell className="font-mono text-sm text-muted-foreground">
											{category.slug}
										</TableCell>
										<TableCell>
											{category.description || (
												<span className="text-muted-foreground text-sm">-</span>
											)}
										</TableCell>
										<TableCell>
											<Badge variant="secondary">{category._count.posts}</Badge>
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
													<DropdownMenuItem onClick={() => handleEdit(category)}>
														<Edit className="mr-2 h-4 w-4" />
														Modifier
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-red-600"
														onClick={() => handleDelete(category.id, category._count.posts)}
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
							{editingCategory ? "Modifier la catégorie" : "Créer une catégorie"}
						</DialogTitle>
						<DialogDescription>
							{editingCategory
								? "Modifiez les informations de la catégorie"
								: "Ajoutez une nouvelle catégorie à votre blog"}
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Nom *</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Technologie"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Description de la catégorie..."
								rows={3}
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
								{editingCategory ? "Enregistrer" : "Créer"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
