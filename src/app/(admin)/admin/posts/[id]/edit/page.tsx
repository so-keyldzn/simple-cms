"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { updatePostAction, listCategoriesAction, listTagsAction, listPostsAction } from "@/features/blog/lib/post-actions";
import { createCategoryAction, deleteCategoryAction } from "@/features/blog/lib/category-actions";
import { createTagAction, deleteTagAction } from "@/features/blog/lib/tag-actions";
import { ComboboxCreatable } from "@/components/ui/combobox-creatable";
import { MultiSelectCreatable } from "@/components/ui/multi-select-creatable";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

export default function EditPostPage() {
	const router = useRouter();
	const params = useParams();
	const postId = params.id as string;

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
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
		loadPost();
		loadCategoriesAndTags();
	}, [postId]);

	const loadPost = async () => {
		const result = await listPostsAction();
		if (result.data) {
			const post = result.data.posts.find((p: any) => p.id === postId);
			if (post) {
				setTitle(post.title);
				setExcerpt(post.excerpt || "");
				setContent(post.content);
				setCoverImage(post.coverImage || "");
				setPublished(post.published);
				setCategoryId(post.category?.id || "");
				setSelectedTags(post.tags.map((pt: any) => pt.tag.id));
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
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
			toast.success("Article modifié avec succès");
			router.push("/admin/posts");
		} else {
			toast.error(result.error || "Erreur lors de la modification");
		}

		setSaving(false);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-96">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6 max-w-5xl">
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
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
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
							<TiptapEditor
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
							<Label htmlFor="coverImage">Image de couverture (URL)</Label>
							<Input
								id="coverImage"
								type="url"
								value={coverImage}
								onChange={(e) => setCoverImage(e.target.value)}
								placeholder="https://images.unsplash.com/..."
							/>
							{coverImage && (
								<div className="mt-2">
									<img
										src={coverImage}
										alt="Preview"
										className="w-full h-48 object-cover rounded-lg border"
									/>
								</div>
							)}
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

				<div className="flex items-center gap-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push("/admin/posts")}
						disabled={saving}
					>
						Annuler
					</Button>
					<Button type="submit" disabled={saving}>
						{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						<Save className="mr-2 h-4 w-4" />
						Enregistrer
					</Button>
				</div>
			</form>
		</div>
	);
}
