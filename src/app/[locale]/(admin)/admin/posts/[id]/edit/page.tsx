"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TiptapRenderer } from "@/components/ui/tiptap-renderer";
import { ButtonGroup } from "@/components/ui/button-group";
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
	title: z.string().min(1, "Title is required"),
	excerpt: z.string().optional(),
	content: z.string().min(1, "Content is required"),
	coverImage: z.string().optional(),
	published: z.boolean(),
	commentsEnabled: z.boolean(),
	categoryId: z.string().optional(),
	selectedTags: z.array(z.string()),
});

type FormData = z.infer<typeof formSchema>;

export default function EditPostPage() {
	const router = useRouter();
	const t = useTranslations();
	const params = useParams();
	const postId = params.id as string;

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			excerpt: "",
			content: "",
			coverImage: "",
			published: false,
			commentsEnabled: true,
			categoryId: "",
			selectedTags: [],
		},
	});

	const [categories, setCategories] = useState<
		{ id: string; name: string }[]
	>([]);
	const [tags, setTags] = useState<{ id: string; name: string }[]>([]);

	useEffect(() => {
		loadPost();
		loadCategoriesAndTags();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postId]);

	type PostWithRelations = {
		id: string;
		title: string;
		excerpt: string | null;
		content: string;
		coverImage: string | null;
		published: boolean;
		commentsEnabled: boolean;
		category: { id: string; name: string } | null;
		tags: Array<{ tag: { id: string; name: string } }>;
	};

	const loadPost = async () => {
		const result = await listPostsAction();
		if (result.data) {
			const post = result.data.posts.find((p: PostWithRelations) => p.id === postId);
			if (post) {
				const postData = {
					title: post.title,
					excerpt: post.excerpt || "",
					content: post.content,
					coverImage: post.coverImage || "",
					published: post.published,
					commentsEnabled: post.commentsEnabled !== undefined ? post.commentsEnabled : true,
					categoryId: post.category?.id || "",
					selectedTags: post.tags.map((pt) => pt.tag.id),
				};

				form.reset(postData);
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
			toast.error(t("post.selectImageError"));
			return;
		}

		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			toast.error(t("post.imageSizeError"));
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
				toast.error(result.error || t("post.uploadError"));
				return;
			}

			if (result.data?.url) {
				form.setValue("coverImage", result.data.url, { shouldDirty: true });
				toast.success(t("post.uploadSuccess"));
			}
		} catch (error) {
			console.error("Upload error:", error);
			toast.error(t("post.uploadError"));
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	// Warn before leaving with unsaved changes
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (form.formState.isDirty) {
				e.preventDefault();
				e.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [form.formState.isDirty]);

	const handleSave = async (data: FormData, shouldRedirect: boolean = false) => {
		setSaving(true);

		const result = await updatePostAction(postId, {
			title: data.title,
			excerpt: data.excerpt || undefined,
			content: data.content,
			coverImage: data.coverImage || undefined,
			published: data.published,
			commentsEnabled: data.commentsEnabled,
			categoryId: data.categoryId || null,
			tags: data.selectedTags,
		});

		if (result.data) {
			toast.success(shouldRedirect ? t("post.postUpdated") : t("common.success"));
			form.reset(data);

			if (shouldRedirect) {
				router.push("/admin/posts");
			}
		} else {
			toast.error(result.error || t("common.error"));
		}

		setSaving(false);
	};

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const validationResult = formSchema.safeParse(form.getValues());

		if (!validationResult.success) {
			const errors = validationResult.error.flatten().fieldErrors;
			Object.entries(errors).forEach(([field, messages]) => {
				if (messages?.[0]) {
					form.setError(field as keyof FormData, {
						type: "manual",
						message: messages[0],
					});
				}
			});
			return;
		}

		await handleSave(validationResult.data, false); // Save but stay on page
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-96">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const watchedValues = form.watch();
	const { errors } = form.formState;

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
						<h1 className="text-3xl font-bold">{t("post.editPost")}</h1>
						<p className="text-muted-foreground">
							{t("post.editPostDesc")}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-4">
					{form.formState.isDirty && (
						<div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
							<div className="h-2 w-2 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse" />
							{t("common.loading")}
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
				<form onSubmit={onSubmit} className="space-y-6" autoComplete="off">
					<Card>
						<CardHeader>
							<CardTitle>{t("post.mainInfo")}</CardTitle>
							<CardDescription>
								{t("post.mainInfoDesc")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="title">{t("post.title")} *</FieldLabel>
									<Input
										id="title"
										{...form.register("title")}
										placeholder={t("post.titlePlaceholder")}
										className="text-lg"
										aria-invalid={!!errors.title}
									/>
									{errors.title && <FieldError>{errors.title.message}</FieldError>}
								</Field>

								<Field>
									<FieldLabel htmlFor="excerpt">{t("post.excerpt")}</FieldLabel>
									<Textarea
										id="excerpt"
										{...form.register("excerpt")}
										placeholder={t("post.excerptPlaceholder")}
										rows={3}
										aria-invalid={!!errors.excerpt}
									/>
									<FieldDescription>
										{t("post.excerptHelp")}
									</FieldDescription>
									{errors.excerpt && <FieldError>{errors.excerpt.message}</FieldError>}
								</Field>

								<Field>
									<FieldLabel htmlFor="content">{t("post.content")} *</FieldLabel>
									<RichTextEditor
										content={watchedValues.content}
										onChange={(value) => form.setValue("content", value, { shouldDirty: true })}
										placeholder={t("post.contentPlaceholder")}
									/>
									<FieldDescription>
										{t("post.contentHelp")}
									</FieldDescription>
									{errors.content && <FieldError>{errors.content.message}</FieldError>}
								</Field>
							</FieldGroup>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{t("post.mediaAndCategorization")}</CardTitle>
							<CardDescription>
								{t("post.mediaAndCategorizationDesc")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="coverImage">{t("post.coverImage")}</FieldLabel>
									{watchedValues.coverImage && (
										<div className="relative w-full h-64 border rounded-lg overflow-hidden mb-2">
											<Image
												src={watchedValues.coverImage}
												alt="Preview"
												fill
												className="object-cover"
											/>
											<Button
												type="button"
												variant="destructive"
												size="icon"
												className="absolute top-2 right-2"
												onClick={() => form.setValue("coverImage", "", { shouldDirty: true })}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									)}
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										onChange={handleImageUpload}
										className="hidden"
									/>
									<ButtonGroup>
										<Input
											id="coverImage"
											{...form.register("coverImage")}
											type="url"
											placeholder={t("post.orEnterUrl")}
											disabled={isUploading || saving}
											aria-invalid={!!errors.coverImage}
										/>
										<Button
											type="button"
											variant="outline"
											onClick={() => fileInputRef.current?.click()}
											disabled={isUploading || saving}
											aria-label={t("post.uploadImage")}
										>
											{isUploading ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Upload className="h-4 w-4" />
											)}
										</Button>
									</ButtonGroup>
									<FieldDescription>
										{t("post.coverImageHelp")}
									</FieldDescription>
									{errors.coverImage && <FieldError>{errors.coverImage.message}</FieldError>}
								</Field>

								<div className="grid grid-cols-2 gap-4">
									<Field>
										<FieldLabel htmlFor="categoryId">{t("post.category")}</FieldLabel>
										<ComboboxCreatable
											options={categories.map((cat) => ({
												label: cat.name,
												value: cat.id,
											}))}
											value={watchedValues.categoryId}
											onValueChange={(value) => form.setValue("categoryId", value, { shouldDirty: true })}
											onCreate={async (name) => {
												const result = await createCategoryAction({ name });
												if (result.data) {
													const newCategory = { id: result.data.id, name: result.data.name };
													setCategories([...categories, newCategory]);
													toast.success(t("admin.categories.createdSuccess"));
													return newCategory;
												}
												toast.error(result.error || t("common.error"));
												return null;
											}}
											onDelete={async (id: string) => {
												const result = await deleteCategoryAction(id);
												if (result.data) {
													setCategories(categories.filter((c) => c.id !== id));
													toast.success(t("admin.categories.deletedSuccess"));
													return true;
												}
												toast.error(result.error || t("common.error"));
												return false;
											}}
											placeholder={t("post.selectCategory") + "..."}
										/>
										{errors.categoryId && <FieldError>{errors.categoryId.message}</FieldError>}
									</Field>

									<Field>
										<FieldLabel htmlFor="tags">{t("post.tags")}</FieldLabel>
										<MultiSelectCreatable
											options={tags.map((tag) => ({
												label: tag.name,
												value: tag.id,
											}))}
											selected={watchedValues.selectedTags}
											onChange={(value) => form.setValue("selectedTags", value, { shouldDirty: true })}
											onCreate={async (name) => {
												const result = await createTagAction({ name });
												if (result.data) {
													const newTag = { id: result.data.id, name: result.data.name };
													setTags([...tags, newTag]);
													toast.success(t("admin.tags.createdSuccess"));
													return newTag;
												}
												toast.error(result.error || t("common.error"));
												return null;
											}}
											onDelete={async (id: string) => {
												const result = await deleteTagAction(id);
												if (result.data) {
													setTags(tags.filter((t) => t.id !== id));
													toast.success(t("admin.tags.deletedSuccess"));
													return true;
												}
												toast.error(result.error || t("common.error"));
												return false;
											}}
											placeholder={t("post.selectTags") + "..."}
										/>
										{errors.selectedTags && <FieldError>{errors.selectedTags.message}</FieldError>}
									</Field>
								</div>
							</FieldGroup>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{t("post.publicationAndInteractions")}</CardTitle>
							<CardDescription>
								{t("post.publicationAndInteractionsDesc")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field orientation="horizontal">
									<Switch
										id="published"
										checked={watchedValues.published}
										onCheckedChange={(checked) => form.setValue("published", checked, { shouldDirty: true })}
									/>
									<div className="flex-1">
										<FieldLabel htmlFor="published" className="cursor-pointer">
											Publier cet article
										</FieldLabel>
										<FieldDescription>
											{watchedValues.published
												? "L'article est visible sur le blog"
												: "L'article est enregistré comme brouillon"}
										</FieldDescription>
									</div>
								</Field>

								<Field orientation="horizontal">
									<Switch
										id="commentsEnabled"
										checked={watchedValues.commentsEnabled}
										onCheckedChange={(checked) => form.setValue("commentsEnabled", checked, { shouldDirty: true })}
									/>
									<div className="flex-1">
										<FieldLabel htmlFor="commentsEnabled" className="cursor-pointer">
											Autoriser les commentaires
										</FieldLabel>
										<FieldDescription>
											{watchedValues.commentsEnabled
												? t("post.allowCommentsHelp")
												: t("post.disableCommentsHelp")}
										</FieldDescription>
									</div>
								</Field>
							</FieldGroup>
						</CardContent>
					</Card>

					<div className="flex items-center justify-between">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								if (form.formState.isDirty) {
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

						<ButtonGroup>
							<Button
								type="submit"
								variant="outline"
								disabled={saving || !form.formState.isDirty}
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
								onClick={async () => {
									const validationResult = formSchema.safeParse(form.getValues());
									if (validationResult.success) {
										await handleSave(validationResult.data, true);
									}
								}}
								disabled={saving || !form.formState.isDirty}
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
						</ButtonGroup>
					</div>
				</form>

				{showPreview && (
					<div className="sticky top-6 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>{t("post.previewTitle")}</CardTitle>
								<CardDescription>
									{t("post.previewDesc")}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{watchedValues.coverImage && (
									<div className="relative w-full h-64 rounded-lg overflow-hidden">
										<Image
											src={watchedValues.coverImage}
											alt={watchedValues.title}
											fill
											className="object-cover"
										/>
									</div>
								)}
								<div>
									<h1 className="text-4xl font-bold mb-4">{watchedValues.title || t("post.defaultTitle")}</h1>
									{watchedValues.excerpt && (
										<p className="text-lg text-muted-foreground mb-6">
											{watchedValues.excerpt}
										</p>
									)}
									{watchedValues.content ? (
										<TiptapRenderer content={watchedValues.content} />
									) : (
										<p className="text-muted-foreground italic">
											{t("post.contentWillAppearHere")}
										</p>
									)}
								</div>
								<div className="flex items-center gap-2 pt-4 border-t">
									{watchedValues.categoryId && (
										<span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
											{categories.find(c => c.id === watchedValues.categoryId)?.name}
										</span>
									)}
									{watchedValues.selectedTags.map(tagId => {
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
