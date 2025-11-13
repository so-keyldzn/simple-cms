"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
import { Loader2, Upload, X } from "lucide-react";
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
	const [isUploading, setIsUploading] = useState(false);
	const [title, setTitle] = useState(post.title);
	const [excerpt, setExcerpt] = useState(post.excerpt || "");
	const [content, setContent] = useState(post.content);
	const [coverImage, setCoverImage] = useState(post.coverImage || "");
	const [published, setPublished] = useState(post.published);
	const [categoryId, setCategoryId] = useState(post.category?.id || "");
	const [selectedTags, setSelectedTags] = useState<string[]>(
		post.tags.map((pt) => pt.tag.id)
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

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

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Veuillez sélectionner une image");
			return;
		}

		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			toast.error("L'image ne doit pas dépasser 5MB");
			return;
		}

		setIsUploading(true);

		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			const result = await response.json();

			if (!response.ok || result.error) {
				toast.error(result.error || "Erreur lors de l'upload");
				return;
			}

			if (result.data?.url) {
				setCoverImage(result.data.url);
				toast.success("Image uploadée avec succès");
			}
		} catch (error) {
			console.error("Upload error:", error);
			toast.error("Erreur lors de l'upload");
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
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
					<DialogTitle>Modifier l&apos;article</DialogTitle>
					<DialogDescription>
						Modifiez les informations de l&apos;article
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
						<Label htmlFor="coverImage">Image de couverture</Label>
						{coverImage && (
							<div className="relative w-full h-48 border rounded-lg overflow-hidden mb-2">
								<Image
									src={coverImage}
									alt="Preview"
									fill
									className="object-cover"
								/>
								<Button
									type="button"
									variant="destructive"
									size="icon"
									className="absolute top-2 right-2"
									onClick={() => setCoverImage("")}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						)}
						<div className="flex gap-2">
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleImageUpload}
								className="hidden"
							/>
							<Button
								type="button"
								variant="outline"
								onClick={() => fileInputRef.current?.click()}
								disabled={isUploading || loading}
							>
								{isUploading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Uploading...
									</>
								) : (
									<>
										<Upload className="mr-2 h-4 w-4" />
										Upload Image
									</>
								)}
							</Button>
							<Input
								id="coverImage"
								type="url"
								value={coverImage}
								onChange={(e) => setCoverImage(e.target.value)}
								placeholder="Ou entrez une URL..."
								className="flex-1"
								disabled={isUploading || loading}
							/>
						</div>
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
