"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reply } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { CommentForm } from "./comment-form";

interface Comment {
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
}

interface CommentItemProps {
	comment: Comment;
	postId: string;
	currentUserId?: string;
	onReplySuccess?: () => void;
	depth?: number;
}

export function CommentItem({
	comment,
	postId,
	currentUserId,
	onReplySuccess,
	depth = 0,
}: CommentItemProps) {
	const [showReplyForm, setShowReplyForm] = useState(false);

	const initials = comment.author.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	const handleReplySuccess = () => {
		setShowReplyForm(false);
		onReplySuccess?.();
	};

	const maxDepth = 3; // Limiter la profondeur des réponses
	const canReply = depth < maxDepth && currentUserId;

	return (
		<div className="group">
			<Card className="border-l-2 border-l-primary/20 hover:border-l-primary/40 transition-colors">
				<CardContent className="p-4">
					{/* Header */}
					<div className="flex items-start gap-3 mb-3">
						<Avatar className="h-10 w-10">
							<AvatarImage
								src={comment.author.image || undefined}
								alt={comment.author.name}
							/>
							<AvatarFallback className="text-xs">
								{initials}
							</AvatarFallback>
						</Avatar>

						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 flex-wrap">
								<span className="font-semibold text-sm">
									{comment.author.name}
								</span>
								<span className="text-xs text-muted-foreground">
									{formatDistanceToNow(new Date(comment.createdAt), {
										addSuffix: true,
										locale: fr,
									})}
								</span>
							</div>
						</div>
					</div>

					{/* Content */}
					<div className="pl-12 space-y-3">
						<p className="text-sm whitespace-pre-wrap break-words">
							{comment.content}
						</p>

						{/* Actions */}
						{canReply && (
							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowReplyForm(!showReplyForm)}
									className="h-7 text-xs"
								>
									<Reply className="mr-1.5 h-3.5 w-3.5" />
									Répondre
								</Button>
							</div>
						)}

						{/* Reply Form */}
						{showReplyForm && (
							<div className="mt-3">
								<CommentForm
									postId={postId}
									parentId={comment.id}
									onSuccess={handleReplySuccess}
									onCancel={() => setShowReplyForm(false)}
									placeholder={`Répondre à ${comment.author.name}...`}
									autoFocus
								/>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Replies */}
			{comment.replies && comment.replies.length > 0 && (
				<div className="ml-6 mt-3 space-y-3 border-l-2 border-muted pl-4">
					{comment.replies.map((reply) => (
						<CommentItem
							key={reply.id}
							comment={reply}
							postId={postId}
							currentUserId={currentUserId}
							onReplySuccess={onReplySuccess}
							depth={depth + 1}
						/>
					))}
				</div>
			)}
		</div>
	);
}
