"use client";

import { Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Type } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "@/components/toolbars/toolbar-provider";

const HeadingToolbar = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Button>
>(({ className, onClick, children, ...props }, ref) => {
	const { editor } = useToolbar();

	const setHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
		editor?.chain().focus().toggleHeading({ level }).run();
	};

	const setParagraph = () => {
		editor?.chain().focus().setParagraph().run();
	};

	const getCurrentLevel = () => {
		if (editor?.isActive("heading", { level: 1 })) return "H1";
		if (editor?.isActive("heading", { level: 2 })) return "H2";
		if (editor?.isActive("heading", { level: 3 })) return "H3";
		if (editor?.isActive("heading", { level: 4 })) return "H4";
		if (editor?.isActive("heading", { level: 5 })) return "H5";
		if (editor?.isActive("heading", { level: 6 })) return "H6";
		return "P";
	};

	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className={cn("h-8 min-w-[60px] justify-start", className)}
							ref={ref}
							{...props}
						>
							{children || (
								<span className="text-xs font-medium">{getCurrentLevel()}</span>
							)}
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent>
					<span>Niveau de titre</span>
				</TooltipContent>
			</Tooltip>

			<DropdownMenuContent align="start">
				<DropdownMenuItem
					onClick={setParagraph}
					className={cn(
						"flex items-center gap-2",
						!editor?.isActive("heading") && "bg-accent",
					)}
				>
					<Type className="h-4 w-4" />
					<span>Paragraphe</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setHeading(1)}
					className={cn(
						"flex items-center gap-2",
						editor?.isActive("heading", { level: 1 }) && "bg-accent",
					)}
				>
					<Heading1 className="h-4 w-4" />
					<span>Titre 1</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setHeading(2)}
					className={cn(
						"flex items-center gap-2",
						editor?.isActive("heading", { level: 2 }) && "bg-accent",
					)}
				>
					<Heading2 className="h-4 w-4" />
					<span>Titre 2</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setHeading(3)}
					className={cn(
						"flex items-center gap-2",
						editor?.isActive("heading", { level: 3 }) && "bg-accent",
					)}
				>
					<Heading3 className="h-4 w-4" />
					<span>Titre 3</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setHeading(4)}
					className={cn(
						"flex items-center gap-2",
						editor?.isActive("heading", { level: 4 }) && "bg-accent",
					)}
				>
					<Heading4 className="h-4 w-4" />
					<span>Titre 4</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setHeading(5)}
					className={cn(
						"flex items-center gap-2",
						editor?.isActive("heading", { level: 5 }) && "bg-accent",
					)}
				>
					<Heading5 className="h-4 w-4" />
					<span>Titre 5</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setHeading(6)}
					className={cn(
						"flex items-center gap-2",
						editor?.isActive("heading", { level: 6 }) && "bg-accent",
					)}
				>
					<Heading6 className="h-4 w-4" />
					<span>Titre 6</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
});

HeadingToolbar.displayName = "HeadingToolbar";

export { HeadingToolbar };
