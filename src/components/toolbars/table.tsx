"use client";

import {
	Table as TableIcon,
	Rows,
	Columns,
	Plus,
	Minus,
	Trash2,
} from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "@/components/toolbars/toolbar-provider";

const TableToolbar = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Button>
>(({ className, children, ...props }, ref) => {
	const { editor } = useToolbar();

	const isInTable = editor?.isActive("table");

	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button
						type="button"
							variant="ghost"
							size="icon"
							className={cn("h-8 w-8", isInTable && "bg-accent", className)}
							ref={ref}
							{...props}
						>
							{children || <TableIcon className="h-4 w-4" />}
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent>
					<span>Tableau</span>
				</TooltipContent>
			</Tooltip>

			<DropdownMenuContent align="start">
				{!isInTable ? (
					<DropdownMenuItem
						onClick={() => {
							editor
								?.chain()
								.focus()
								.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
								.run();
						}}
					>
						<TableIcon className="mr-2 h-4 w-4" />
						<span>Insérer un tableau</span>
					</DropdownMenuItem>
				) : (
					<>
						<DropdownMenuItem
							onClick={() => editor?.chain().focus().addRowBefore().run()}
							disabled={!editor?.can().addRowBefore()}
						>
							<Plus className="mr-2 h-4 w-4" />
							<span>Ajouter une ligne avant</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => editor?.chain().focus().addRowAfter().run()}
							disabled={!editor?.can().addRowAfter()}
						>
							<Plus className="mr-2 h-4 w-4" />
							<span>Ajouter une ligne après</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => editor?.chain().focus().deleteRow().run()}
							disabled={!editor?.can().deleteRow()}
						>
							<Minus className="mr-2 h-4 w-4" />
							<span>Supprimer la ligne</span>
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							onClick={() => editor?.chain().focus().addColumnBefore().run()}
							disabled={!editor?.can().addColumnBefore()}
						>
							<Plus className="mr-2 h-4 w-4" />
							<span>Ajouter une colonne avant</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => editor?.chain().focus().addColumnAfter().run()}
							disabled={!editor?.can().addColumnAfter()}
						>
							<Plus className="mr-2 h-4 w-4" />
							<span>Ajouter une colonne après</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => editor?.chain().focus().deleteColumn().run()}
							disabled={!editor?.can().deleteColumn()}
						>
							<Minus className="mr-2 h-4 w-4" />
							<span>Supprimer la colonne</span>
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							onClick={() => editor?.chain().focus().toggleHeaderRow().run()}
							disabled={!editor?.can().toggleHeaderRow()}
						>
							<Rows className="mr-2 h-4 w-4" />
							<span>Basculer ligne d&apos;en-tête</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => editor?.chain().focus().toggleHeaderColumn().run()}
							disabled={!editor?.can().toggleHeaderColumn()}
						>
							<Columns className="mr-2 h-4 w-4" />
							<span>Basculer colonne d&apos;en-tête</span>
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							onClick={() => editor?.chain().focus().deleteTable().run()}
							disabled={!editor?.can().deleteTable()}
							className="text-destructive focus:text-destructive"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							<span>Supprimer le tableau</span>
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
});

TableToolbar.displayName = "TableToolbar";

export { TableToolbar };
