"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TiptapRenderer } from "@/components/ui/tiptap-renderer";	
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft, Save, Upload, X, RefreshCw, Eye } from "lucide-react";
import { toast } from "sonner";
import { updatePostAction, listCategoriesAction, listTagsAction, listPostsAction } from "@/features/blog/lib/post-actions";
import { createCategoryAction, deleteCategoryAction } from "@/features/blog/lib/category-actions";
import { createTagAction, deleteTagAction } from "@/features/blog/lib/tag-actions";
import { ComboboxCreatable } from "@/components/ui/combobox-creatable";
import { MultiSelectCreatable } from "@/components/ui/multi-select-creatable";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

export default function EditPostPage() {
	const router = useRouter();
	const params = useParams();
	const postId = params.id as string;

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);

	const [title, setTitle] = useState("");
	const [excerpt, setExcerpt] = useState("");
	const [content, setContent] = useState("");
	const [coverImage, setCoverImage] = useState("");
	const [published, setPublished] = useState(false);
	const [categoryId, setCategoryId] = useState<string>("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [showPreview, setShowPreview] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Initial values for change detection
	const [initialValues, setInitialValues] = useState({
		title: "",
		excerpt: "",
		content: "",
		coverImage: "",
		published: false,
		categoryId: "",
		selectedTags: [] as string[],
	});

	const [categories, setCategories] = useState<
		{ id: string; name: string }[]
	>([]);
	const [tags, setTags] = useState<{ id: string; name: string }[]>([]);

	useEffect(() => {
		loadPost();
		loadCategoriesAndTags();
	}, [postId]);

	const loadPost = async () => {
		const result = await listPostsAction();
		if (result.data) {
			const post = result.data.posts.find((p: any) => p.id === postId);
			if (post) {
				const postData = {
					title: post.title,
					excerpt: post.excerpt || "",
					content: post.content,
					coverImage: post.coverImage || "",
					published: post.published,
					categoryId: post.category?.id || "",
					selectedTags: post.tags.map((pt: any) => pt.tag.id),
				};

				setTitle(postData.title);
				setExcerpt(postData.excerpt);
				setContent(postData.content);
				setCoverImage(postData.coverImage);
				setPublished(postData.published);
				setCategoryId(postData.categoryId);
				setSelectedTags(postData.selectedTags);

				// Save initial values for change detection
				setInitialValues(postData);
			}
		}
		setLoading(false);
	};

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

	// Detect changes
	useEffect(() => {
		const currentValues = {
			title,
			excerpt,
			content,
			coverImage,
			published,
			categoryId,
			selectedTags,
		};

		const changed =
			JSON.stringify(currentValues) !== JSON.stringify(initialValues);
		setHasChanges(changed);
	}, [title, excerpt, content, coverImage, published, categoryId, selectedTags, initialValues]);

	// Warn before leaving with unsaved changes
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasChanges) {
				e.preventDefault();
				e.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [hasChanges]);

	const handleSave = async (shouldRedirect: boolean = false) => {
		setSaving(true);

		const result = await updatePostAction(postId, {
			title,
			excerpt: excerpt || undefined,
			content,
			coverImage: coverImage || undefined,
			published,
			categoryId: categoryId || null,
			tags: selectedTags,
		});

		if (result.data) {
			toast.success(shouldRedirect ? "Article mis à jour avec succès" : "Modifications enregistrées");
			setHasChanges(false);
			// Update initial values after successful save
			setInitialValues({
				title,
				excerpt,
				content,
				coverImage,
				published,
				categoryId,
				selectedTags,
			});

			if (shouldRedirect) {
				router.push("/admin/posts");
			}
		} else {
			toast.error(result.error || "Erreur lors de la modification");
		}

		setSaving(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await handleSave(false); // Save but stay on page
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-96">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
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
						<h1 className="text-3xl font-bold">Modifier l'article</h1>
						<p className="text-muted-foreground">
							Modifiez les informations de l'article
						</p>
					</div>
				</div>
				<div className="flex items-center gap-4">
					{hasChanges && (
						<div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
							<div className="h-2 w-2 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse" />
							Modifications non sauvegardées
						</div>
					)}
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowPreview(!showPreview)}
					>
						<Eye className="mr-2 h-4 w-4" />
						{showPreview ? "Édition" : "Aperçu"}
					</Button>
				</div>
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
									disabled={isUploading || saving}
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
									disabled={isUploading || saving}
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
									Publier cet article
								</Label>
								<p className="text-xs text-muted-foreground">
									{published
										? "L'article est visible sur le blog"
										: "L'article est enregistré comme brouillon"}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="flex items-center justify-between">
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							if (hasChanges) {
								const confirm = window.confirm(
									"Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?"
								);
								if (confirm) {
									router.push("/admin/posts");
								}
							} else {
								router.push("/admin/posts");
							}
						}}
						disabled={saving}
					>
						Annuler
					</Button>

					<div className="flex items-center gap-2">
						<Button
							type="submit"
							variant="outline"
							disabled={saving || !hasChanges}
						>
							{saving ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Enregistrement...
								</>
							) : (
								<>
									<Save className="mr-2 h-4 w-4" />
									Enregistrer
								</>
							)}
						</Button>

						<Button
							type="button"
							onClick={() => handleSave(true)}
							disabled={saving || !hasChanges}
						>
							{saving ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Mise à jour...
								</>
							) : (
								<>
									<RefreshCw className="mr-2 h-4 w-4" />
									Mettre à jour et quitter
								</>
							)}
						</Button>
					</div>
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
