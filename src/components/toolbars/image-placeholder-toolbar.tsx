"use client";

import { Image } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "@/components/toolbars/toolbar-provider";

const ImagePlaceholderToolbar = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Button>
>(({ className, onClick, children, ...props }, ref) => {
	const { editor } = useToolbar();
	
	if (!editor) {
		return (
			<Empty>
				<EmptyMedia variant="icon">
					<Image />
				</EmptyMedia>
				<EmptyTitle>No Editor Available</EmptyTitle>
				<EmptyDescription>
					The editor is not initialized yet.
				</EmptyDescription>
			</Empty>
		);
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					className={cn(
						editor?.isActive("image-placeholder-enhanced") && "bg-accent",
						className,
					)}
					onClick={(e) => {
						editor?.chain().focus().insertImagePlaceholderEnhanced().run();
						onClick?.(e);
					}}
					ref={ref}
					{...props}
				>
					{children || <Image className="h-4 w-4" />}
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				<span>Image</span>
			</TooltipContent>
		</Tooltip>
	);
});

ImagePlaceholderToolbar.displayName = "ImagePlaceholderToolbar";

export { ImagePlaceholderToolbar };
