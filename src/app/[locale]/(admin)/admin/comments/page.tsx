"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Search, Loader2, CheckCircle2, XCircle, Clock, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import {
	listAllCommentsAction,
	updateCommentStatusAction,
	deleteCommentAction,
	getCommentsStatsAction,
} from "@/features/blog/lib/comment-actions";
import { hasPermission } from "@/lib/roles";
import { useSession } from "@/features/auth/lib/auth-clients";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
import Link from "next/link";

export default function CommentsPage() {
	const { data: session } = useSession();
	const router = useRouter();

	const [comments, setComments] = useState<any[]>([]);
	const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | undefined>();
	const [searchQuery, setSearchQuery] = useState("");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

	// Vérifier les permissions
	useEffect(() => {
		if (session && !hasPermission(session.user?.role, "canManageComments")) {
			router.push("/dashboard");
			toast.error("Vous n'avez pas accès à cette page");
		}
	}, [session, router]);

	const loadComments = async () => {
		setLoading(true);

		const [commentsResult, statsResult] = await Promise.all([
			listAllCommentsAction({ status: statusFilter, search: searchQuery }),
			getCommentsStatsAction(),
		]);

		if (commentsResult.error) {
			toast.error(commentsResult.error);
		} else {
			setComments(commentsResult.data?.comments || []);
		}

		if (statsResult.error) {
			toast.error(statsResult.error);
		} else {
			setStats(statsResult.data || { total: 0, pending: 0, approved: 0, rejected: 0 });
		}

		setLoading(false);
	};

	useEffect(() => {
		if (session) {
			loadComments();
		}
	}, [statusFilter, session]);

	const handleSearch = () => {
		loadComments();
	};

	const handleStatusUpdate = async (commentId: string, status: "APPROVED" | "REJECTED") => {
		const result = await updateCommentStatusAction(commentId, status);

		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success(
				status === "APPROVED" ? "Commentaire approuvé" : "Commentaire rejeté"
			);
			loadComments();
		}
	};

	const handleDelete = async () => {
		if (!commentToDelete) return;

		const result = await deleteCommentAction(commentToDelete);

		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success("Commentaire supprimé");
			loadComments();
		}

		setDeleteDialogOpen(false);
		setCommentToDelete(null);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "PENDING":
				return (
					<Badge variant="outline" className="gap-1">
						<Clock className="h-3 w-3" />
						En attente
					</Badge>
				);
			case "APPROVED":
				return (
					<Badge variant="default" className="gap-1 bg-green-500">
						<CheckCircle2 className="h-3 w-3" />
						Approuvé
					</Badge>
				);
			case "REJECTED":
				return (
					<Badge variant="destructive" className="gap-1">
						<XCircle className="h-3 w-3" />
						Rejeté
					</Badge>
				);
		}
	};

	if (!session || !hasPermission(session.user?.role, "canManageComments")) {
		return null;
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold flex items-center gap-2">
					<MessageSquare className="h-8 w-8" />
					Gestion des commentaires
				</h1>
				<p className="text-muted-foreground mt-1">
					Modérez les commentaires laissés sur vos articles
				</p>
			</div>

			{/* Statistiques */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">Total</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
					</CardContent>
				</Card>

				<Card className="border-yellow-200 dark:border-yellow-900">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<Clock className="h-4 w-4" />
							En attente
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.pending}</div>
					</CardContent>
				</Card>

				<Card className="border-green-200 dark:border-green-900">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4" />
							Approuvés
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.approved}</div>
					</CardContent>
				</Card>

				<Card className="border-red-200 dark:border-red-900">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<XCircle className="h-4 w-4" />
							Rejetés
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.rejected}</div>
					</CardContent>
				</Card>
			</div>

			{/* Filtres et recherche */}
			<Card>
				<CardHeader>
					<CardTitle>Filtres</CardTitle>
					<CardDescription>
						Filtrer et rechercher des commentaires
					</CardDescription>
				</CardHeader>
				<CardContent className="flex gap-4">
					<div className="flex-1">
						<div className="flex gap-2">
							<Input
								placeholder="Rechercher par contenu, auteur..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSearch()}
							/>
							<Button onClick={handleSearch}>
								<Search className="h-4 w-4 mr-2" />
								Rechercher
							</Button>
						</div>
					</div>

					<Select
						value={statusFilter || "all"}
						onValueChange={(value) =>
							setStatusFilter(value === "all" ? undefined : (value as any))
						}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Tous les statuts" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tous les statuts</SelectItem>
							<SelectItem value="PENDING">En attente</SelectItem>
							<SelectItem value="APPROVED">Approuvés</SelectItem>
							<SelectItem value="REJECTED">Rejetés</SelectItem>
						</SelectContent>
					</Select>
				</CardContent>
			</Card>

			{/* Tableau des commentaires */}
			<Card>
				<CardHeader>
					<CardTitle>Commentaires ({comments.length})</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin" />
							<span className="ml-2">Chargement...</span>
						</div>
					) : comments.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
							<p>Aucun commentaire trouvé</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Auteur</TableHead>
									<TableHead>Commentaire</TableHead>
									<TableHead>Article</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Statut</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{comments.map((comment) => {
									const initials = comment.author.name
										.split(" ")
										.map((n: string) => n[0])
										.join("")
										.toUpperCase();

									return (
										<TableRow key={comment.id}>
											<TableCell>
												<div className="flex items-center gap-2">
													<Avatar className="h-8 w-8">
														<AvatarImage src={comment.author.image} />
														<AvatarFallback className="text-xs">
															{initials}
														</AvatarFallback>
													</Avatar>
													<div className="min-w-0">
														<p className="text-sm font-medium truncate">
															{comment.author.name}
														</p>
														<p className="text-xs text-muted-foreground truncate">
															{comment.author.email}
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell className="max-w-md">
												<p className="text-sm line-clamp-2">
													{comment.content}
												</p>
												{comment._count?.replies > 0 && (
													<p className="text-xs text-muted-foreground mt-1">
														{comment._count.replies} réponse(s)
													</p>
												)}
											</TableCell>
											<TableCell>
												<Link
													href={`/blog/${comment.post.slug}`}
													className="text-sm text-primary hover:underline line-clamp-1"
												>
													{comment.post.title}
												</Link>
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{format(
													new Date(comment.createdAt),
													"dd MMM yyyy",
													{ locale: fr }
												)}
											</TableCell>
											<TableCell>{getStatusBadge(comment.status)}</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-1">
													{comment.status !== "APPROVED" && (
														<Button
															size="sm"
															variant="ghost"
															onClick={() =>
																handleStatusUpdate(comment.id, "APPROVED")
															}
															title="Approuver"
														>
															<CheckCircle2 className="h-4 w-4 text-green-500" />
														</Button>
													)}
													{comment.status !== "REJECTED" && (
														<Button
															size="sm"
															variant="ghost"
															onClick={() =>
																handleStatusUpdate(comment.id, "REJECTED")
															}
															title="Rejeter"
														>
															<XCircle className="h-4 w-4 text-destructive" />
														</Button>
													)}
													<Button
														size="sm"
														variant="ghost"
														onClick={() => {
															setCommentToDelete(comment.id);
															setDeleteDialogOpen(true);
														}}
														title="Supprimer"
													>
														<Trash2 className="h-4 w-4 text-destructive" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Dialog de confirmation de suppression */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
						<AlertDialogDescription>
							Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action
							est irréversible et supprimera également toutes les réponses
							associées.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Supprimer
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
