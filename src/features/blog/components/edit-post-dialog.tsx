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
import { updatePostAction, listCategoriesAction, listTagsAction } from "../lib/post-actions";
import { MultiSelect } from "@/components/ui/multi-select";

interface EditPostDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	post: {
		id: string;
		title: string;
		excerpt: string | null;
		content: string;
		coverImage: string | null;
		published: boolean;
		category: { id: string; name: string } | null;
		tags: { tag: { id: string; name: string } }[];
	};
	onSuccess: () => void;
}

export function EditPostDialog({
	open,
	onOpenChange,
	post,
	onSuccess,
}: EditPostDialogProps) {
	const [loading, setLoading] = useState(false);
	const [title, setTitle] = useState(post.title);
	const [excerpt, setExcerpt] = useState(post.excerpt || "");
	const [content, setContent] = useState(post.content);
	const [coverImage, setCoverImage] = useState(post.coverImage || "");
	const [published, setPublished] = useState(post.published);
	const [categoryId, setCategoryId] = useState(post.category?.id || "");
	const [selectedTags, setSelectedTags] = useState<string[]>(
		post.tags.map((pt) => pt.tag.id)
	);

	const [categories, setCategories] = useState<
		{ id: string; name: string }[]
	>([]);
	const [tags, setTags] = useState<{ id: string; name: string }[]>([]);

	useEffect(() => {
		if (open) {
			setTitle(post.title);
			setExcerpt(post.excerpt || "");
			setContent(post.content);
			setCoverImage(post.coverImage || "");
			setPublished(post.published);
			setCategoryId(post.category?.id || "");
			setSelectedTags(post.tags.map((pt) => pt.tag.id));
			loadCategoriesAndTags();
		}
	}, [open, post]);

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

		const result = await updatePostAction(post.id, {
			title,
			excerpt: excerpt || undefined,
			content,
			coverImage: coverImage || undefined,
			published,
			categoryId: categoryId || null,
			tags: selectedTags,
		});

		if (result.data) {
			toast.success("Article modifié avec succès");
			onOpenChange(false);
			onSuccess();
		} else {
			toast.error(result.error || "Erreur lors de la modification");
		}

		setLoading(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Modifier l'article</DialogTitle>
					<DialogDescription>
						Modifiez les informations de l'article
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
									<SelectItem value="">Aucune</SelectItem>
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
							Publier cet article
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
							Enregistrer
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
