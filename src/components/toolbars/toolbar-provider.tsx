"use client";

import type { Editor } from "@tiptap/react";
import React, { useEffect, useState } from "react";

export interface ToolbarContextProps {
	editor: Editor;
}

export const ToolbarContext = React.createContext<ToolbarContextProps | null>(
	null,
);

interface ToolbarProviderProps {
	editor: Editor;
	children: React.ReactNode;
}

export const ToolbarProvider = ({ editor, children }: ToolbarProviderProps) => {
	return (
		<ToolbarContext.Provider value={{ editor }}>
			{children}
		</ToolbarContext.Provider>
	);
};

export const useToolbar = () => {
	const context = React.useContext(ToolbarContext);

	if (!context) {
		throw new Error("useToolbar must be used within a ToolbarProvider");
	}

	return context;
};

/**
 * Hook to force re-render when editor selection/state changes
 * Useful for toolbar buttons that need to reflect active state
 */
export const useEditorState = (editor: Editor | null) => {
	const [, forceUpdate] = useState({});

	useEffect(() => {
		if (!editor) return;

		const update = () => forceUpdate({});

		// Update on selection change and content updates
		editor.on("selectionUpdate", update);
		editor.on("update", update);
		editor.on("transaction", update);

		return () => {
			editor.off("selectionUpdate", update);
			editor.off("update", update);
			editor.off("transaction", update);
		};
	}, [editor]);
};
