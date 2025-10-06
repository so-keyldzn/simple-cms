"use client";

import { TextQuote } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar, useEditorState } from "@/components/toolbars/toolbar-provider";

interface BlockquoteToolbarProps extends React.ComponentProps<typeof Button> {
	className?: string;
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	children?: React.ReactNode;
}

const BlockquoteToolbar = React.forwardRef<HTMLButtonElement, BlockquoteToolbarProps>(
	({ className, onClick, children, ...props }, ref) => {
		const { editor } = useToolbar();
		useEditorState(editor);
		return (
			<ButtonGroup>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className={cn(
								"h-8 w-8",
								editor?.isActive("blockquote") && "bg-accent",
								className,
							)}
							onClick={(e) => {
								editor?.chain().focus().toggleBlockquote().run();
								onClick?.(e);
							}}
							disabled={!editor?.can().chain().focus().toggleBlockquote().run()}
							ref={ref}
							{...props}
						>
							{children || <TextQuote className="h-4 w-4" />}
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<span>Blockquote</span>
					</TooltipContent>
				</Tooltip>
			</ButtonGroup>
		);
	},
);

BlockquoteToolbar.displayName = "BlockquoteToolbar";

export { BlockquoteToolbar };
