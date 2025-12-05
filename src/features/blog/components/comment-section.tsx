"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, AlertCircle, Lock, Loader2 } from "lucide-react";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";
import { listPostCommentsAction } from "@/features/blog/lib/comment-actions";
import { useSession } from "@/features/auth/lib/auth-clients";

interface CommentSectionProps {
	postId: string;
	commentsEnabled: boolean;
}

type Comment = {
	id: string;
	content: string;
	createdAt: Date;
	author: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
	replies?: Comment[];
};

export function CommentSection({ postId, commentsEnabled }: CommentSectionProps) {
	const { data: session } = useSession();
	const [comments, setComments] = useState<Comment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadComments = async () => {
		setLoading(true);
		setError(null);

		const result = await listPostCommentsAction(postId);

		if (result.error) {
			setError(result.error);
		} else {
			setComments((result.data as Comment[]) || []);
		}

		setLoading(false);
	};

	useEffect(() => {
		loadComments();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postId]);

	const handleCommentSuccess = () => {
		loadComments(); // Recharger les commentaires après ajout
	};

	return (

		<Card className="border-0 shadow-sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					{commentsEnabled ? (
						<>
							<MessageSquare className="h-5 w-5" />
							Commentaires ({comments.length})
						</>
					) : (
						<>
							<Lock className="h-5 w-5" />
							Commentaires désactivés
						</>
					)}
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Message si commentaires désactivés */}
				{!commentsEnabled && (
					<>
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Les nouveaux commentaires sont désactivés pour cet article.
								{comments.length > 0 && " Vous pouvez consulter les commentaires existants ci-dessous."}
							</AlertDescription>
						</Alert>
						{comments.length > 0 && <Separator />}
					</>
				)}

				{/* Formulaire de nouveau commentaire - seulement si activé */}
				{commentsEnabled && (
					<>
						{session?.user ? (
							<div>
								<h3 className="text-sm font-semibold mb-3">
									Laisser un commentaire
								</h3>
								<CommentForm postId={postId} onSuccess={handleCommentSuccess} />
								<p className="text-xs text-muted-foreground mt-2">
									Votre commentaire sera visible après modération.
								</p>
							</div>
						) : (
							<Alert>
								<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Vous devez être{" "}
								<Link
									href="/sign-in"
									className="font-medium underline underline-offset-4 hover:text-primary"
								>
									connecté
								</Link>{" "}
									pour laisser un commentaire.
								</AlertDescription>
							</Alert>
						)}
						<Separator />
					</>
				)}

				{/* Liste des commentaires */}
				<div>
					<h3 className="text-sm font-semibold mb-4">
						{comments.length > 0
							? `${comments.length} ${comments.length === 1 ? "commentaire" : "commentaires"}`
							: "Aucun commentaire"}
					</h3>

					{loading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							<span className="ml-2 text-sm text-muted-foreground">
								Chargement des commentaires...
							</span>
						</div>
					) : error ? (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					) : comments.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
							<p className="text-sm">
								Soyez le premier à commenter cet article !
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{commentsEnabled &&
							comments.map((comment) => (
								<CommentItem
									key={comment.id}
									comment={comment}
									postId={postId}
									currentUserId={session?.user?.id}
									onReplySuccess={handleCommentSuccess}
								/>
							))}
							
							{!commentsEnabled && (
								<div className="text-center py-8 text-muted-foreground">
									<p className="text-sm">
										Les commentaires sont désactivés pour cet article.
									</p>
								</div>
							)}
						</div>
					)}	
				</div>
			</CardContent>
		</Card>
	);
}
