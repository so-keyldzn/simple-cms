"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaLibrary } from "../context/media-library-context";

export function MediaSearchBar() {
	const t = useTranslations();
	const { searchQuery, setSearchQuery } = useMediaLibrary();
	const [localValue, setLocalValue] = useState(searchQuery);

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setSearchQuery(localValue);
		}, 300);

		return () => clearTimeout(timer);
	}, [localValue, setSearchQuery]);

	// Sync with context when cleared externally
	useEffect(() => {
		if (searchQuery === "") {
			setLocalValue("");
		}
	}, [searchQuery]);

	const handleClear = () => {
		setLocalValue("");
		setSearchQuery("");
	};

	return (
		<div className="relative flex-1 max-w-sm">
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<Input
				type="text"
				placeholder={t("admin.media.searchPlaceholder")}
				value={localValue}
				onChange={(e) => setLocalValue(e.target.value)}
				className="pl-9 pr-9"
			/>
			{localValue && (
				<Button
					variant="ghost"
					size="icon"
					onClick={handleClear}
					className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
				>
					<X className="h-4 w-4" />
				</Button>
			)}
		</div>
	);
}
