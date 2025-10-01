"use client";

import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPostAction, listCategoriesAction, listTagsAction } from "../lib/post-actions";
import { MultiSelect } from "@/components/ui/multi-select";

interface CreatePostDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function CreatePostDialog({
	open,
	onOpenChange,
	onSuccess,
}: CreatePostDialogProps) {
	const [loading, setLoading] = useState(false);
	const [title, setTitle] = useState("");
	const [excerpt, setExcerpt] = useState("");
	const [content, setContent] = useState("");
	const [coverImage, setCoverImage] = useState("");
	const [published, setPublished] = useState(false);
	const [categoryId, setCategoryId] = useState<string>("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	const [categories, setCategories] = useState<
		{ id: string; name: string }[]
	>([]);
	const [tags, setTags] = useState<{ id: string; name: string }[]>([]);

	useEffect(() => {
		if (open) {
			loadCategoriesAndTags();
		}
	}, [open]);

	const loadCategoriesAndTags = async () => {
		const [categoriesResult, tagsResult] = await Promise.all([
			listCategoriesAction(),
			listTagsAction(),
		]);

		if (categoriesResult.data) {
			setCategories(categoriesResult.data);
		}
		if (tagsResult.data) {
			setTags(tagsResult.data);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const result = await createPostAction({
			title,
			excerpt: excerpt || undefined,
			content,
			coverImage: coverImage || undefined,
			published,
			categoryId: categoryId || undefined,
			tags: selectedTags.length > 0 ? selectedTags : undefined,
		});

		if (result.data) {
			toast.success("Article créé avec succès");
			onOpenChange(false);
			resetForm();
			onSuccess();
		} else {
			toast.error(result.error || "Erreur lors de la création");
		}

		setLoading(false);
	};

	const resetForm = () => {
		setTitle("");
		setExcerpt("");
		setContent("");
		setCoverImage("");
		setPublished(false);
		setCategoryId("");
		setSelectedTags([]);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Créer un article</DialogTitle>
					<DialogDescription>
						Ajoutez un nouvel article à votre blog
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">Titre *</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Mon super article"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="excerpt">Extrait</Label>
						<Textarea
							id="excerpt"
							value={excerpt}
							onChange={(e) => setExcerpt(e.target.value)}
							placeholder="Résumé de l'article..."
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="content">Contenu *</Label>
						<Textarea
							id="content"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="Contenu de l'article..."
							rows={10}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="coverImage">Image de couverture (URL)</Label>
						<Input
							id="coverImage"
							type="url"
							value={coverImage}
							onChange={(e) => setCoverImage(e.target.value)}
							placeholder="https://..."
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="category">Catégorie</Label>
							<Select value={categoryId} onValueChange={setCategoryId}>
								<SelectTrigger>
									<SelectValue placeholder="Sélectionner..." />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem key={category.id} value={category.id}>
											{category.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Tags</Label>
							<MultiSelect
								options={tags.map((tag) => ({
									label: tag.name,
									value: tag.id,
								}))}
								selected={selectedTags}
								onChange={setSelectedTags}
								placeholder="Sélectionner..."
							/>
						</div>
					</div>

					<div className="flex items-center space-x-2">
						<Switch
							id="published"
							checked={published}
							onCheckedChange={setPublished}
						/>
						<Label htmlFor="published" className="cursor-pointer">
							Publier immédiatement
						</Label>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={loading}
						>
							Annuler
						</Button>
						<Button type="submit" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Créer l'article
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
