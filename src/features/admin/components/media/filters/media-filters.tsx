"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMediaLibrary } from "../context/media-library-context";

export function MediaFilters() {
	const t = useTranslations();
	const { filters, setFilters, resetFilters } = useMediaLibrary();

	const hasActiveFilters = filters.type || filters.dateRange !== "all";

	const handleTypeChange = (value: string) => {
		setFilters({
			...filters,
			type: value === "all" ? null : (value as "image" | "video" | "document"),
		});
	};

	const handleDateChange = (value: string) => {
		setFilters({
			...filters,
			dateRange: value as "today" | "week" | "month" | "all",
		});
	};

	return (
		<div className="flex items-center gap-2">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="sm" className="gap-2">
						<Filter className="h-4 w-4" />
						{t("admin.filter")}
						{hasActiveFilters && (
							<Badge variant="secondary" className="ml-1 rounded-sm px-1 font-normal">
								{(filters.type ? 1 : 0) + (filters.dateRange !== "all" ? 1 : 0)}
							</Badge>
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel>{t("admin.media.filterByType")}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuRadioGroup
						value={filters.type || "all"}
						onValueChange={handleTypeChange}
					>
						<DropdownMenuRadioItem value="all">
							{t("admin.media.allTypes")}
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="image">
							{t("admin.media.images")}
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="video">
							{t("admin.media.videos")}
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="document">
							{t("admin.media.documents")}
						</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>

					<DropdownMenuSeparator />
					<DropdownMenuLabel>{t("admin.media.filterByDate")}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuRadioGroup
						value={filters.dateRange}
						onValueChange={handleDateChange}
					>
						<DropdownMenuRadioItem value="all">
							{t("admin.media.allTime")}
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="today">
							{t("admin.media.today")}
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="week">
							{t("admin.media.thisWeek")}
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="month">
							{t("admin.media.thisMonth")}
						</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			{hasActiveFilters && (
				<Button
					variant="ghost"
					size="sm"
					onClick={resetFilters}
					className="gap-2"
				>
					<X className="h-4 w-4" />
					{t("admin.media.resetFilters")}
				</Button>
			)}
		</div>
	);
}
