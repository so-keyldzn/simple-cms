"use client";

import { ListTodo } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "@/components/toolbars/toolbar-provider";

const TaskListToolbar = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Button>
>(({ className, onClick, children, ...props }, ref) => {
	const { editor } = useToolbar();
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={cn(
						"h-8 w-8",
						editor?.isActive("taskList") && "bg-accent",
						className,
					)}
					onClick={(e) => {
						editor?.chain().focus().toggleTaskList().run();
						onClick?.(e);
					}}
					disabled={!editor?.can().chain().focus().toggleTaskList().run()}
					ref={ref}
					{...props}
				>
					{children || <ListTodo className="h-4 w-4" />}
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				<span>Liste de tâches</span>
			</TooltipContent>
		</Tooltip>
	);
});

TaskListToolbar.displayName = "TaskListToolbar";

export { TaskListToolbar };
