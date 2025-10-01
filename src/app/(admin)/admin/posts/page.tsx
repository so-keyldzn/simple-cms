"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { fr } from "date-fns/locale";

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
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [selectedPost, setSelectedPost] = useState<Post | null>(null);

	const loadPosts = async () => {
		setLoading(true);
		const result = await listPostsAction({ search: searchQuery || undefined });
		if (result.data) {
			setPosts(result.data.posts as Post[]);
		} else {
			toast.error(result.error || "Erreur lors du chargement");
		}
		setLoading(false);
	};

	useEffect(() => {
		loadPosts();
	}, [searchQuery]);

	const handleDelete = async (id: string) => {
		if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

		const result = await deletePostAction(id);
		if (result.data) {
			toast.success("Article supprimé");
			loadPosts();
		} else {
			toast.error(result.error || "Erreur lors de la suppression");
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
					<h1 className="text-3xl font-bold">Articles</h1>
					<p className="text-muted-foreground">
						Gérez les articles de votre blog
					</p>
				</div>
				<Button onClick={() => router.push("/admin/posts/new")}>
					<Plus className="mr-2 h-4 w-4" />
					Nouvel article
				</Button>
			</div>

			<div className="flex items-center gap-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Rechercher..."
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
								<TableHead>Titre</TableHead>
								<TableHead>Auteur</TableHead>
								<TableHead>Catégorie</TableHead>
								<TableHead>Tags</TableHead>
								<TableHead>Statut</TableHead>
								<TableHead>Date</TableHead>
								<TableHead className="w-[70px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{posts.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="text-center text-muted-foreground">
										Aucun article trouvé
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
												<Badge className="bg-green-500">Publié</Badge>
											) : (
												<Badge variant="secondary">Brouillon</Badge>
											)}
										</TableCell>
										<TableCell>
											{format(new Date(post.createdAt), "dd MMM yyyy", { locale: fr })}
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuLabel>Actions</DropdownMenuLabel>
													<DropdownMenuSeparator />
													<DropdownMenuItem onClick={() => router.push(`/admin/posts/${post.id}/edit`)}>
														<Edit className="mr-2 h-4 w-4" />
														Modifier
													</DropdownMenuItem>
													<DropdownMenuItem>
														<Eye className="mr-2 h-4 w-4" />
														Voir
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-red-600"
														onClick={() => handleDelete(post.id)}
													>
														<Trash className="mr-2 h-4 w-4" />
														Supprimer
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
