"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
	useEffect,
	type ReactNode,
} from "react";

// Types
export type MediaView = "grid" | "list";

export type MediaSortBy = "name" | "date" | "size" | "type";
export type MediaSortOrder = "asc" | "desc";

export type MediaFilters = {
	type?: "image" | "video" | "document" | null;
	dateRange?: "today" | "week" | "month" | "all";
};

type MediaLibraryContextType = {
	// Vue
	view: MediaView;
	setView: (view: MediaView) => void;

	// Sélection
	selectedMedia: Set<string>;
	setSelectedMedia: (ids: Set<string>) => void;
	toggleSelection: (id: string) => void;
	selectAll: (ids: string[]) => void;
	clearSelection: () => void;
	isSelected: (id: string) => boolean;

	// Recherche
	searchQuery: string;
	setSearchQuery: (query: string) => void;

	// Filtres
	filters: MediaFilters;
	setFilters: (filters: MediaFilters) => void;
	resetFilters: () => void;

	// Tri
	sortBy: MediaSortBy;
	sortOrder: MediaSortOrder;
	setSorting: (sortBy: MediaSortBy, sortOrder: MediaSortOrder) => void;
};

const MediaLibraryContext = createContext<MediaLibraryContextType | undefined>(
	undefined
);

// Provider
type MediaLibraryProviderProps = {
	children: ReactNode;
	defaultView?: MediaView;
};

export function MediaLibraryProvider({
	children,
	defaultView = "grid",
}: MediaLibraryProviderProps) {
	// Vue (avec persistance localStorage)
	// Initialize with default to avoid hydration mismatch
	const [view, setViewState] = useState<MediaView>(defaultView);

	// Load from localStorage after hydration
	useEffect(() => {
		const saved = localStorage.getItem("media-library-view");
		if (saved) {
			setViewState(saved as MediaView);
		}
	}, []);

	const setView = useCallback((newView: MediaView) => {
		setViewState(newView);
		if (typeof window !== "undefined") {
			localStorage.setItem("media-library-view", newView);
		}
	}, []);

	// Sélection
	const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());

	const toggleSelection = useCallback((id: string) => {
		setSelectedMedia((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}, []);

	const selectAll = useCallback((ids: string[]) => {
		setSelectedMedia(new Set(ids));
	}, []);

	const clearSelection = useCallback(() => {
		setSelectedMedia(new Set());
	}, []);

	const isSelected = useCallback(
		(id: string) => {
			return selectedMedia.has(id);
		},
		[selectedMedia]
	);

	// Recherche
	const [searchQuery, setSearchQuery] = useState("");

	// Filtres
	const [filters, setFilters] = useState<MediaFilters>({
		type: null,
		dateRange: "all",
	});

	const resetFilters = useCallback(() => {
		setFilters({
			type: null,
			dateRange: "all",
		});
		setSearchQuery("");
	}, []);

	// Tri
	const [sortBy, setSortBy] = useState<MediaSortBy>("date");
	const [sortOrder, setSortOrder] = useState<MediaSortOrder>("desc");

	const setSorting = useCallback(
		(newSortBy: MediaSortBy, newSortOrder: MediaSortOrder) => {
			setSortBy(newSortBy);
			setSortOrder(newSortOrder);
		},
		[]
	);

	// Valeur du contexte
	const value = useMemo(
		() => ({
			view,
			setView,
			selectedMedia,
			setSelectedMedia,
			toggleSelection,
			selectAll,
			clearSelection,
			isSelected,
			searchQuery,
			setSearchQuery,
			filters,
			setFilters,
			resetFilters,
			sortBy,
			sortOrder,
			setSorting,
		}),
		[
			view,
			setView,
			selectedMedia,
			toggleSelection,
			selectAll,
			clearSelection,
			isSelected,
			searchQuery,
			filters,
			resetFilters,
			sortBy,
			sortOrder,
			setSorting,
		]
	);

	return (
		<MediaLibraryContext.Provider value={value}>
			{children}
		</MediaLibraryContext.Provider>
	);
}

// Hook personnalisé
export function useMediaLibrary() {
	const context = useContext(MediaLibraryContext);
	if (context === undefined) {
		throw new Error(
			"useMediaLibrary must be used within a MediaLibraryProvider"
		);
	}
	return context;
}
