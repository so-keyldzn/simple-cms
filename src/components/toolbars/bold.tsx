"use client";

import { BoldIcon } from "lucide-react";
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

interface BoldToolbarProps extends React.ComponentProps<typeof Button> {
	className?: string;
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	children?: React.ReactNode;
}

const BoldToolbar = React.forwardRef<HTMLButtonElement, BoldToolbarProps>(
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
								editor?.isActive("bold") && "bg-accent",
								className,
							)}
							onClick={(e) => {
								editor?.chain().focus().toggleBold().run();
								onClick?.(e);
							}}
							disabled={!editor?.can().chain().focus().toggleBold().run()}
							ref={ref}
							{...props}
						>
							{children || <BoldIcon className="h-4 w-4" />}
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<span>Bold</span>
						<span className="ml-1 text-xs text-gray-11">(cmd + b)</span>
					</TooltipContent>
				</Tooltip>
			</ButtonGroup>
		);
	},
);

BoldToolbar.displayName = "BoldToolbar";

export { BoldToolbar };
