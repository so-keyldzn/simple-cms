"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";
import { createCommentAction } from "@/features/blog/lib/comment-actions";

interface CommentFormProps {
	postId: string;
	parentId?: string;
	onSuccess?: () => void;
	onCancel?: () => void;
	placeholder?: string;
	autoFocus?: boolean;
}

export function CommentForm({
	postId,
	parentId,
	onSuccess,
	onCancel,
	placeholder = "Écrivez votre commentaire...",
	autoFocus = false,
}: CommentFormProps) {
	const [content, setContent] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (content.trim().length < 3) {
			toast.error("Le commentaire doit contenir au moins 3 caractères");
			return;
		}

		setLoading(true);

		const result = await createCommentAction({
			postId,
			content,
			parentId,
		});

		setLoading(false);

		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success(
				"Votre commentaire a été envoyé et est en attente de modération"
			);
			setContent("");
			onSuccess?.();
		}
	};

	const handleCancel = () => {
		setContent("");
		onCancel?.();
	};

	return (
		<Card className="border-0 bg-muted/30">
			<CardContent className="p-4">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="comment-content" className="sr-only">
							Commentaire
						</Label>
						<Textarea
							id="comment-content"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder={placeholder}
							rows={4}
							maxLength={5000}
							disabled={loading}
							autoFocus={autoFocus}
							className="resize-none"
						/>
						<div className="flex items-center justify-between text-xs text-muted-foreground">
							<span>
								{content.length} / 5000 caractères
							</span>
							{content.trim().length > 0 && content.trim().length < 3 && (
								<span className="text-destructive">
									Minimum 3 caractères requis
								</span>
							)}
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Button
							type="submit"
							disabled={loading || content.trim().length < 3}
							size="sm"
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Envoi...
								</>
							) : (
								<>
									<Send className="mr-2 h-4 w-4" />
									{parentId ? "Répondre" : "Commenter"}
								</>
							)}
						</Button>

						{onCancel && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={handleCancel}
								disabled={loading}
							>
								<X className="mr-2 h-4 w-4" />
								Annuler
							</Button>
						)}
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
