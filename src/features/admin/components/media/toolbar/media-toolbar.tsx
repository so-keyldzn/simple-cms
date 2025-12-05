"use client";

import { MediaSearchBar } from "./media-search-bar";
import { MediaFilters } from "../filters/media-filters";
import { MediaBulkActions } from "./media-bulk-actions";
import { ViewSwitcher } from "./view-switcher";

type MediaToolbarProps = {
	onRefresh?: () => void;
};

export function MediaToolbar({ onRefresh }: MediaToolbarProps) {
	return (
		<div className="space-y-4">
			{/* Bulk Actions - only shown when media is selected */}
			<MediaBulkActions onRefresh={onRefresh} />

			{/* Search, Filters, and View */}
			<div className="flex items-center gap-4">
				<MediaSearchBar />
				<MediaFilters />
				<ViewSwitcher />
			</div>
		</div>
	);
}
