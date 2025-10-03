"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft, Save, Upload, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { createPostAction, listCategoriesAction, listTagsAction } from "@/features/blog/lib/post-actions";
import { createCategoryAction, deleteCategoryAction } from "@/features/blog/lib/category-actions";
import { createTagAction, deleteTagAction } from "@/features/blog/lib/tag-actions";
import { ComboboxCreatable } from "@/components/ui/combobox-creatable";
import { MultiSelectCreatable } from "@/components/ui/multi-select-creatable";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { TiptapRenderer } from "@/components/ui/tiptap-renderer";	

export default function NewPostPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [title, setTitle] = useState("");
	const [excerpt, setExcerpt] = useState("");
	const [content, setContent] = useState("");
	const [coverImage, setCoverImage] = useState("");
	const [published, setPublished] = useState(false);
	const [categoryId, setCategoryId] = useState<string>("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [showPreview, setShowPreview] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [categories, setCategories] = useState<
		{ id: string; name: string }[]
	>([]);
	const [tags, setTags] = useState<{ id: string; name: string }[]>([]);

	useEffect(() => {
		loadCategoriesAndTags();
	}, []);

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
			router.push("/admin/posts");
		} else {
			toast.error(result.error || "Erreur lors de la création");
		}

		setLoading(false);
	};

	return (
		<div className="space-y-6 ">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.push("/admin/posts")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-3xl font-bold">Nouvel article</h1>
						<p className="text-muted-foreground">
							Créez un nouvel article pour votre blog
						</p>
					</div>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowPreview(!showPreview)}
				>
					<Eye className="mr-2 h-4 w-4" />
					{showPreview ? "Édition" : "Aperçu"}
				</Button>
			</div>

			<div className={showPreview ? "grid grid-cols-2 gap-6" : ""}>
				<form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
				<Card>
					<CardHeader>
						<CardTitle>Informations principales</CardTitle>
						<CardDescription>
							Titre, extrait et contenu de l'article
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Titre *</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Mon super article"
								required
								className="text-lg"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="excerpt">Extrait</Label>
							<Textarea
								id="excerpt"
								value={excerpt}
								onChange={(e) => setExcerpt(e.target.value)}
								placeholder="Résumé de l'article qui apparaîtra dans les listes..."
								rows={3}
							/>
							<p className="text-xs text-muted-foreground">
								Un court résumé qui apparaîtra sur la page d'accueil du blog
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="content">Contenu *</Label>
							<RichTextEditor
								content={content}
								onChange={setContent}
								placeholder="Commencez à écrire votre article..."
							/>
							<p className="text-xs text-muted-foreground">
								Utilisez la barre d'outils pour formater votre texte
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Médias et catégorisation</CardTitle>
						<CardDescription>
							Image de couverture, catégorie et tags
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="coverImage">Image de couverture</Label>
							{coverImage && (
								<div className="relative w-full h-64 border rounded-lg overflow-hidden mb-2">
									<img
										src={coverImage}
										alt="Preview"
										className="w-full h-full object-cover"
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
							<p className="text-xs text-muted-foreground">
								Recommandé : 1200x630px pour un affichage optimal
							</p>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="category">Catégorie</Label>
								<ComboboxCreatable
									options={categories.map((cat) => ({
										label: cat.name,
										value: cat.id,
									}))}
									value={categoryId}
									onValueChange={setCategoryId}
									onCreate={async (name) => {
										const result = await createCategoryAction({ name });
										if (result.data) {
											const newCategory = { id: result.data.id, name: result.data.name };
											setCategories([...categories, newCategory]);
											toast.success("Catégorie créée");
											return newCategory;
										}
										toast.error(result.error || "Erreur");
										return null;
									}}
									onDelete={async (id) => {
										const result = await deleteCategoryAction(id);
										if (result.data) {
											setCategories(categories.filter((c) => c.id !== id));
											toast.success("Catégorie supprimée");
											return true;
										}
										toast.error(result.error || "Erreur");
										return false;
									}}
									placeholder="Sélectionner une catégorie..."
								/>
							</div>

							<div className="space-y-2">
								<Label>Tags</Label>
								<MultiSelectCreatable
									options={tags.map((tag) => ({
										label: tag.name,
										value: tag.id,
									}))}
									selected={selectedTags}
									onChange={setSelectedTags}
									onCreate={async (name) => {
										const result = await createTagAction({ name });
										if (result.data) {
											const newTag = { id: result.data.id, name: result.data.name };
											setTags([...tags, newTag]);
											toast.success("Tag créé");
											return newTag;
										}
										toast.error(result.error || "Erreur");
										return null;
									}}
									onDelete={async (id) => {
										const result = await deleteTagAction(id);
										if (result.data) {
											setTags(tags.filter((t) => t.id !== id));
											toast.success("Tag supprimé");
											return true;
										}
										toast.error(result.error || "Erreur");
										return false;
									}}
									placeholder="Sélectionner des tags..."
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Publication</CardTitle>
						<CardDescription>
							Contrôlez la visibilité de votre article
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center space-x-2">
							<Switch
								id="published"
								checked={published}
								onCheckedChange={setPublished}
							/>
							<div className="flex-1">
								<Label htmlFor="published" className="cursor-pointer">
									Publier immédiatement
								</Label>
								<p className="text-xs text-muted-foreground">
									{published
										? "L'article sera visible sur le blog"
										: "L'article sera enregistré comme brouillon"}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="flex items-center gap-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push("/admin/posts")}
						disabled={loading}
					>
						Annuler
					</Button>
					<Button type="submit" disabled={loading}>
						{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						<Save className="mr-2 h-4 w-4" />
						Créer l'article
					</Button>
				</div>
			</form>

			{showPreview && (
				<div className="sticky top-6 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Aperçu de l'article</CardTitle>
							<CardDescription>
								Prévisualisation en temps réel
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{coverImage && (
								<div className="relative w-full h-64 rounded-lg overflow-hidden">
									<img
										src={coverImage}
										alt={title}
										className="w-full h-full object-cover"
									/>
								</div>
							)}
							<div>
								<h1 className="text-4xl font-bold mb-4">{title || "Titre de l'article"}</h1>
								{excerpt && (
									<p className="text-lg text-muted-foreground mb-6">
										{excerpt}
									</p>
								)}
								{content ? (
							
								<TiptapRenderer content={content} />
								) : (
									<p className="text-muted-foreground italic">
										Le contenu apparaîtra ici...
									</p>
								)}
							</div>
							<div className="flex items-center gap-2 pt-4 border-t">
								{categoryId && (
									<span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
										{categories.find(c => c.id === categoryId)?.name}
									</span>
								)}
								{selectedTags.map(tagId => {
									const tag = tags.find(t => t.id === tagId);
									return tag ? (
										<span key={tagId} className="px-2 py-1 text-xs rounded-full bg-muted">
											{tag.name}
										</span>
									) : null;
								})}
							</div>
						</CardContent>
					</Card>
				</div>
			)}
			</div>
		</div>
	);
}
