"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaLibrary } from "../context/media-library-context";
import { cn } from "@/lib/utils";

export function ViewSwitcher() {
	const { view, setView } = useMediaLibrary();

	return (
		<div className="flex items-center border rounded-md">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setView("grid")}
				className={cn(
					"rounded-none rounded-l-md",
					view === "grid" && "bg-accent"
				)}
			>
				<LayoutGrid className="h-4 w-4" />
			</Button>
			<div className="w-px h-4 bg-border" />
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setView("list")}
				className={cn(
					"rounded-none rounded-r-md",
					view === "list" && "bg-accent"
				)}
			>
				<List className="h-4 w-4" />
			</Button>
		</div>
	);
}
