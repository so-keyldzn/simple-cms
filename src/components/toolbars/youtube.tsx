"use client";

import { YoutubeIcon } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Item } from "@/components/ui/item";
import { ButtonGroup } from "@/components/ui/button-group";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
>(({ className, children, ...props }, ref) => {
	const { editor } = useToolbar();
	const [open, setOpen] = useState(false);
	const [url, setUrl] = useState("");

	if (!editor) {
		return (
			<Empty>
				<EmptyMedia variant="icon">
					<YoutubeIcon />
				</EmptyMedia>
				<EmptyTitle>No Editor Available</EmptyTitle>
				<EmptyDescription>
					The editor is not initialized yet.
				</EmptyDescription>
			</Empty>
		);
	}

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
							size="icon-sm"
							className={cn(
								editor?.isActive("youtube") && "bg-accent",
								className
							)}
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
					Entrez l&apos;URL de la vidéo YouTube que vous souhaitez insérer
				</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<Item>
						<Label htmlFor="youtube-url">URL YouTube</Label>
						<InputGroup>
							<InputGroupInput
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
						</InputGroup>
					</Item>
				</div>
				<DialogFooter>
					<ButtonGroup>
						<Button
							type="button" 
							variant="outline" 
							onClick={() => setOpen(false)}
						>
							Annuler
						</Button>
						<Button
							type="button" 
							onClick={handleSubmit} 
							disabled={!url}
						>
							Insérer
						</Button>
					</ButtonGroup>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
});

YoutubeToolbar.displayName = "YoutubeToolbar";

export { YoutubeToolbar };
