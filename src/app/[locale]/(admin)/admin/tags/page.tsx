"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type Tag = {
	id: string;
	name: string;
	slug: string;
	_count: { posts: number };
};

const tagSchema = z.object({
	name: z.string().min(1, "Name is required"),
});

type TagFormData = z.infer<typeof tagSchema>;

export default function TagsPage() {
	const t = useTranslations();
	const [tags, setTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingTag, setEditingTag] = useState<Tag | null>(null);
	const [formLoading, setFormLoading] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [tagToDelete, setTagToDelete] = useState<{ id: string; name: string; postsCount: number } | null>(null);

	const form = useForm<TagFormData>({
		resolver: zodResolver(tagSchema),
		defaultValues: {
			name: "",
		},
	});

	const loadTags = async () => {
		setLoading(true);
		const result = await listTagsAction();
		if (result.data) {
			setTags(result.data as Tag[]);
		} else {
			toast.error(result.error || t("admin.tags.loadError"));
		}
		setLoading(false);
	};

	useEffect(() => {
		loadTags();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleDelete = (tag: Tag) => {
		setTagToDelete({ id: tag.id, name: tag.name, postsCount: tag._count.posts });
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!tagToDelete) return;

		const result = await deleteTagAction(tagToDelete.id);
		if (result.data) {
			toast.success(t("admin.tags.deletedSuccess"));
			loadTags();
		} else {
			toast.error(result.error || t("admin.tags.deleteError"));
		}
		setDeleteDialogOpen(false);
		setTagToDelete(null);
	};

	const handleEdit = (tag: Tag) => {
		setEditingTag(tag);
		form.reset({ name: tag.name });
		setDialogOpen(true);
	};

	const handleCreate = () => {
		setEditingTag(null);
		form.reset({ name: "" });
		setDialogOpen(true);
	};

	const handleSubmit = async (data: TagFormData) => {
		setFormLoading(true);

		const result = editingTag
			? await updateTagAction(editingTag.id, { name: data.name })
			: await createTagAction({ name: data.name });

		if (result.data) {
			toast.success(
				editingTag ? t("admin.tags.updatedSuccess") : t("admin.tags.createdSuccess")
			);
			setDialogOpen(false);
			loadTags();
		} else {
			toast.error(result.error || t("common.error"));
		}

		setFormLoading(false);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">{t("admin.tags.title")}</h1>
					<p className="text-muted-foreground">{t("admin.tags.description")}</p>
				</div>
				<Button onClick={handleCreate}>
					<Plus className="mr-2 h-4 w-4" />
					{t("admin.tags.newTag")}
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
								<TableHead>{t("admin.tags.name")}</TableHead>
								<TableHead>{t("admin.tags.slug")}</TableHead>
								<TableHead>{t("admin.tags.posts")}</TableHead>
								<TableHead className="w-[70px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{tags.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className="text-center text-muted-foreground">
										{t("admin.tags.noTags")}
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
													<DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
													<DropdownMenuSeparator />
													<DropdownMenuItem onClick={() => handleEdit(tag)}>
														<Edit className="mr-2 h-4 w-4" />
														{t("common.edit")}
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-red-600"
														onClick={() => handleDelete(tag)}
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
							{editingTag ? t("admin.tags.editTag") : t("admin.tags.createTag")}
						</DialogTitle>
						<DialogDescription>
							{editingTag
								? t("admin.tags.editDescription")
								: t("admin.tags.createDescription")}
						</DialogDescription>
					</DialogHeader>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin.tags.name")} *</FormLabel>
										<FormControl>
											<InputGroup>
												<InputGroupInput
													{...field}
													placeholder={t("admin.tags.namePlaceholder")}
												/>
											</InputGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

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
										{editingTag ? t("common.save") : t("common.create")}
									</Button>
								</ButtonGroup>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("admin.deleteDialog.title")}</AlertDialogTitle>
						<AlertDialogDescription>
							{tagToDelete && tagToDelete.postsCount > 0
								? t("admin.deleteDialog.tagDescription", { name: tagToDelete.name, count: tagToDelete.postsCount })
								: t("admin.deleteDialog.tagSingleDescription", { name: tagToDelete?.name || "" })}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<ButtonGroup>
							<AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
							<AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
								{t("common.delete")}
							</AlertDialogAction>
						</ButtonGroup>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
