import { useMemo } from "react";
import { useMediaLibrary } from "../context/media-library-context";
import type { MediaItem } from "../items/media-card";

export function useFilteredMedia(media: MediaItem[]): MediaItem[] {
	const { searchQuery, filters } = useMediaLibrary();

	return useMemo(() => {
		let filtered = [...media];

		// Search filter (search in filename, originalName, alt, caption)
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((item) => {
				return (
					item.filename.toLowerCase().includes(query) ||
					item.originalName.toLowerCase().includes(query) ||
					item.alt?.toLowerCase().includes(query) ||
					item.caption?.toLowerCase().includes(query)
				);
			});
		}

		// Type filter
		if (filters.type) {
			filtered = filtered.filter((item) => {
				if (filters.type === "image") {
					return item.mimeType.startsWith("image/");
				}
				if (filters.type === "video") {
					return item.mimeType.startsWith("video/");
				}
				if (filters.type === "document") {
					return (
						item.mimeType.includes("pdf") ||
						item.mimeType.includes("document") ||
						item.mimeType.includes("text")
					);
				}
				return true;
			});
		}

		// Date range filter
		if (filters.dateRange && filters.dateRange !== "all") {
			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
			const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

			filtered = filtered.filter((item) => {
				const createdAt = new Date(item.createdAt);

				if (filters.dateRange === "today") {
					return createdAt >= today;
				}
				if (filters.dateRange === "week") {
					return createdAt >= weekAgo;
				}
				if (filters.dateRange === "month") {
					return createdAt >= monthAgo;
				}
				return true;
			});
		}

		return filtered;
	}, [media, searchQuery, filters]);
}
