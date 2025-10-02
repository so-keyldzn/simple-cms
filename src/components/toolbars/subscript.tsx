"use client";

import { SubscriptIcon } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar, useEditorState } from "@/components/toolbars/toolbar-provider";

const SubscriptToolbar = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Button>
>(({ className, onClick, children, ...props }, ref) => {
		const { editor } = useToolbar();
		useEditorState(editor);
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className={cn(
							"h-8 w-8",
							editor?.isActive("subscript") && "bg-accent",
							className,
						)}
						onClick={(e) => {
							editor?.chain().focus().toggleSubscript().run();
							onClick?.(e);
						}}
						disabled={!editor?.can().chain().focus().toggleSubscript().run()}
						ref={ref}
						{...props}
					>
						{children || <SubscriptIcon className="h-4 w-4" />}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<span>Subscript</span>
					<span className="ml-1 text-xs text-gray-11">(cmd + ,)</span>
				</TooltipContent>
			</Tooltip>
		);
	},
);

SubscriptToolbar.displayName = "SubscriptToolbar";

export { SubscriptToolbar };
