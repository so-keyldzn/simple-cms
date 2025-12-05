"use client";

import { useEffect } from "react";
import { useMediaLibrary } from "../context/media-library-context";
import type { MediaItem } from "../items/media-card";

type UseMediaKeyboardShortcutsProps = {
	media: MediaItem[];
	onDeleteSelected?: () => void;
};

export function useMediaKeyboardShortcuts({
	media,
	onDeleteSelected,
}: UseMediaKeyboardShortcutsProps) {
	const { selectedMedia, setSelectedMedia, clearSelection } = useMediaLibrary();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ignore shortcuts when typing in input fields
			const target = e.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable
			) {
				return;
			}

			// Ctrl+A / Cmd+A: Select all
			if ((e.ctrlKey || e.metaKey) && e.key === "a") {
				e.preventDefault();
				const allMediaIds = media.map((m) => m.id);
				setSelectedMedia(new Set(allMediaIds));
				return;
			}

			// Escape: Clear selection
			if (e.key === "Escape") {
				if (selectedMedia.size > 0) {
					e.preventDefault();
					clearSelection();
				}
				return;
			}

			// Delete: Delete selected items
			if (e.key === "Delete" && selectedMedia.size > 0) {
				e.preventDefault();
				onDeleteSelected?.();
				return;
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [media, selectedMedia, setSelectedMedia, clearSelection, onDeleteSelected]);
}
