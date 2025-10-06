"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InputGroup, InputGroupInput, InputGroupTextarea } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { createCategoryAction, updateCategoryAction } from "@/features/blog/lib/category-actions";

type Category = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	_count: { posts: number };
};

export default function CategoriesPage() {
	const t = useTranslations();
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [formLoading, setFormLoading] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string; postsCount: number } | null>(null);

	const loadCategories = async () => {
		setLoading(true);
		const result = await listCategoriesAction();
		if (result.data) {
			setCategories(result.data as Category[]);
		} else {
			toast.error(result.error || t("admin.categories.loadError"));
		}
		setLoading(false);
	};

	useEffect(() => {
		loadCategories();
	}, []);

	const handleDelete = (category: Category) => {
		setCategoryToDelete({ id: category.id, name: category.name, postsCount: category._count.posts });
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!categoryToDelete) return;

		const result = await deleteCategoryAction(categoryToDelete.id);
		if (result.data) {
			toast.success(t("admin.categories.deletedSuccess"));
			loadCategories();
		} else {
			toast.error(result.error || t("admin.categories.deleteError"));
		}
		setDeleteDialogOpen(false);
		setCategoryToDelete(null);
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
					? t("admin.categories.updatedSuccess")
					: t("admin.categories.createdSuccess")
			);
			setDialogOpen(false);
			loadCategories();
		} else {
			toast.error(result.error || t("common.error"));
		}

		setFormLoading(false);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">{t("admin.categories.title")}</h1>
					<p className="text-muted-foreground">
						{t("admin.categories.description")}
					</p>
				</div>
				<Button onClick={handleCreate}>
					<Plus className="mr-2 h-4 w-4" />
					{t("admin.categories.newCategory")}
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
								<TableHead>{t("admin.categories.name")}</TableHead>
								<TableHead>{t("admin.categories.slug")}</TableHead>
								<TableHead>{t("admin.categories.description")}</TableHead>
								<TableHead>{t("admin.categories.posts")}</TableHead>
								<TableHead className="w-[70px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{categories.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center text-muted-foreground">
										{t("admin.categories.noCategories")}
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
													<DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
													<DropdownMenuSeparator />
													<DropdownMenuItem onClick={() => handleEdit(category)}>
														<Edit className="mr-2 h-4 w-4" />
														{t("common.edit")}
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-red-600"
														onClick={() => handleDelete(category)}
													>
														<Trash className="mr-2 h-4 w-4" />
														{t("common.delete")}
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
							{editingCategory ? t("admin.categories.editCategory") : t("admin.categories.createCategory")}
						</DialogTitle>
						<DialogDescription>
							{editingCategory
								? t("admin.categories.editDescription")
								: t("admin.categories.createDescription")}
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">{t("admin.categories.name")} *</Label>
							<InputGroup>
								<InputGroupInput
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder={t("admin.categories.namePlaceholder")}
									required
								/>
							</InputGroup>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">{t("admin.categories.description")}</Label>
							<InputGroup>
								<InputGroupTextarea
									id="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder={t("admin.categories.descriptionPlaceholder")}
									rows={3}
								/>
							</InputGroup>
						</div>

						<DialogFooter>
							<ButtonGroup>
								<Button
									type="button"
									variant="outline"
									onClick={() => setDialogOpen(false)}
									disabled={formLoading}
								>
									{t("common.cancel")}
								</Button>
								<Button type="submit" disabled={formLoading}>
									{formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									{editingCategory ? t("common.save") : t("common.create")}
								</Button>
							</ButtonGroup>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("admin.deleteDialog.title")}</AlertDialogTitle>
						<AlertDialogDescription>
							{categoryToDelete && categoryToDelete.postsCount > 0
								? t("admin.deleteDialog.categoryDescription", { name: categoryToDelete.name, count: categoryToDelete.postsCount })
								: t("admin.deleteDialog.categorySingleDescription", { name: categoryToDelete?.name || "" })}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
							{t("common.delete")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
