"use client";

import { YoutubeIcon } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "@/components/toolbars/toolbar-provider";

const YoutubeToolbar = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Button>
>(({ className, onClick, children, ...props }, ref) => {
	const { editor } = useToolbar();
	const [open, setOpen] = useState(false);
	const [url, setUrl] = useState("");

	const handleSubmit = () => {
		if (url) {
			editor?.commands.setYoutubeVideo({
				src: url,
				width: 640,
				height: 480,
			});
			setUrl("");
			setOpen(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<Button
						type="button"
							variant="ghost"
							size="icon"
							className={cn("h-8 w-8", className)}
							ref={ref}
							{...props}
						>
							{children || <YoutubeIcon className="h-4 w-4" />}
						</Button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>
					<span>Insérer une vidéo YouTube</span>
				</TooltipContent>
			</Tooltip>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Insérer une vidéo YouTube</DialogTitle>
					<DialogDescription>
						Entrez l'URL de la vidéo YouTube que vous souhaitez insérer
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="youtube-url">URL YouTube</Label>
						<Input
							id="youtube-url"
							placeholder="https://www.youtube.com/watch?v=..."
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									handleSubmit();
								}
							}}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						type="button" variant="outline" onClick={() => setOpen(false)}>
						Annuler
					</Button>
					<Button
						type="button" onClick={handleSubmit} disabled={!url}>
						Insérer
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
});

YoutubeToolbar.displayName = "YoutubeToolbar";

export { YoutubeToolbar };
