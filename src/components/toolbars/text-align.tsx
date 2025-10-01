"use client";

import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "@/components/toolbars/toolbar-provider";

const TextAlignToolbar = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
	const { editor } = useToolbar();

	const alignments = [
		{ value: "left", icon: AlignLeft, label: "Aligner à gauche" },
		{ value: "center", icon: AlignCenter, label: "Centrer" },
		{ value: "right", icon: AlignRight, label: "Aligner à droite" },
		{ value: "justify", icon: AlignJustify, label: "Justifier" },
	] as const;

	return (
		<div className={cn("flex items-center gap-0.5", className)} ref={ref} {...props}>
			{alignments.map(({ value, icon: Icon, label }) => (
				<Tooltip key={value}>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className={cn(
								"h-8 w-8",
								editor?.isActive({ textAlign: value }) && "bg-accent",
							)}
							onClick={() => {
								editor?.chain().focus().setTextAlign(value).run();
							}}
							disabled={!editor?.can().chain().focus().setTextAlign(value).run()}
						>
							<Icon className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<span>{label}</span>
					</TooltipContent>
				</Tooltip>
			))}
		</div>
	);
});

TextAlignToolbar.displayName = "TextAlignToolbar";

export { TextAlignToolbar };
