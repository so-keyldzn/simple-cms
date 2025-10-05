"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
	Plus,
	MoreHorizontal,
	Eye,
	Edit,
	Trash,
	Search,
	Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { listPostsAction, deletePostAction } from "@/features/blog/lib/post-actions";
import { CreatePostDialog } from "@/features/blog/components/create-post-dialog";
import { EditPostDialog } from "@/features/blog/components/edit-post-dialog";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";

type Post = {
	id: string;
	title: string;
	slug: string;
	excerpt: string | null;
	content: string;
	coverImage: string | null;
	published: boolean;
	publishedAt: Date | null;
	createdAt: Date;
	author: { name: string | null; email: string };
	category: { id: string; name: string } | null;
	tags: { tag: { id: string; name: string } }[];
};

export default function PostsPage() {
	const router = useRouter();
	const t = useTranslations();
	const locale = useLocale();
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [selectedPost, setSelectedPost] = useState<Post | null>(null);

	const dateLocale = locale === "fr" ? fr : enUS;

	const loadPosts = async () => {
		setLoading(true);
		const result = await listPostsAction({ search: searchQuery || undefined });
		if (result.data) {
			setPosts(result.data.posts as Post[]);
		} else {
			toast.error(result.error || t("common.error"));
		}
		setLoading(false);
	};

	useEffect(() => {
		loadPosts();
	}, [searchQuery]);

	const handleDelete = async (id: string) => {
		if (!confirm(t("admin.deletePost") + " ?")) return;

		const result = await deletePostAction(id);
		if (result.data) {
			toast.success(t("blog.posts") + " " + t("common.delete").toLowerCase());
			loadPosts();
		} else {
			toast.error(result.error || t("common.error"));
		}
	};

	const handleEdit = (post: Post) => {
		setSelectedPost(post);
		setEditDialogOpen(true);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">{t("blog.posts")}</h1>
					<p className="text-muted-foreground">
						{t("blog.searchPosts")}
					</p>
				</div>
				<Button onClick={() => router.push("/admin/posts/new")}>
					<Plus className="mr-2 h-4 w-4" />
					{t("admin.newPost")}
				</Button>
			</div>

			<div className="flex items-center gap-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder={t("common.search") + "..."}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
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
								<TableHead>{t("post.title")}</TableHead>
								<TableHead>{t("post.author")}</TableHead>
								<TableHead>{t("post.category")}</TableHead>
								<TableHead>{t("post.tags")}</TableHead>
								<TableHead>{t("post.status")}</TableHead>
								<TableHead>{t("post.createdAt")}</TableHead>
								<TableHead className="w-[70px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{posts.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="text-center text-muted-foreground">
										{t("blog.noPostsFound")}
									</TableCell>
								</TableRow>
							) : (
								posts.map((post) => (
									<TableRow key={post.id}>
										<TableCell className="font-medium">
											{post.title}
										</TableCell>
										<TableCell>{post.author.name || post.author.email}</TableCell>
										<TableCell>
											{post.category ? (
												<Badge variant="outline">{post.category.name}</Badge>
											) : (
												<span className="text-muted-foreground text-sm">-</span>
											)}
										</TableCell>
										<TableCell>
											<div className="flex gap-1 flex-wrap">
												{post.tags.slice(0, 2).map((pt) => (
													<Badge key={pt.tag.id} variant="secondary" className="text-xs">
														{pt.tag.name}
													</Badge>
												))}
												{post.tags.length > 2 && (
													<Badge variant="secondary" className="text-xs">
														+{post.tags.length - 2}
													</Badge>
												)}
											</div>
										</TableCell>
										<TableCell>
											{post.published ? (
												<Badge className="bg-green-500">{t("admin.published")}</Badge>
											) : (
												<Badge variant="secondary">{t("admin.draft")}</Badge>
											)}
										</TableCell>
										<TableCell>
											{format(new Date(post.createdAt), "dd MMM yyyy", { locale: dateLocale })}
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
													<DropdownMenuItem onClick={() => router.push(`/admin/posts/${post.id}/edit`)}>
														<Edit className="mr-2 h-4 w-4" />
														{t("common.edit")}
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
														<Eye className="mr-2 h-4 w-4" />
														{t("admin.viewAll")}
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-red-600"
														onClick={() => handleDelete(post.id)}
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

			<CreatePostDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				onSuccess={loadPosts}
			/>

			{selectedPost && (
				<EditPostDialog
					open={editDialogOpen}
					onOpenChange={setEditDialogOpen}
					post={selectedPost}
					onSuccess={loadPosts}
				/>
			)}
		</div>
	);
}
