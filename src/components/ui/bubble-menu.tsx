"use client";

import { useEffect, useRef, ReactNode } from "react";
import { Editor } from "@tiptap/core";
import { computePosition, flip, shift, offset } from "@floating-ui/dom";

interface BubbleMenuProps {
	editor: Editor;
	children: ReactNode;
	tippyOptions?: {
		duration?: number;
	};
}

export function BubbleMenu({ editor, children }: BubbleMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const menu = menuRef.current;
		if (!menu) return;

		const updatePosition = () => {
			const { state } = editor;
			const { selection } = state;
			const { from, to, empty } = selection;

			if (empty) {
				menu.style.display = "none";
				return;
			}

			const start = editor.view.coordsAtPos(from);
			const end = editor.view.coordsAtPos(to);

			const virtualEl = {
				getBoundingClientRect: () => ({
					width: end.right - start.left,
					height: end.bottom - start.top,
					x: start.left,
					y: start.top,
					top: start.top,
					right: end.right,
					bottom: end.bottom,
					left: start.left,
				}),
			};

			computePosition(virtualEl, menu, {
				placement: "top",
				middleware: [offset(10), flip(), shift({ padding: 8 })],
			}).then(({ x, y }) => {
				Object.assign(menu.style, {
					left: `${x}px`,
					top: `${y}px`,
					display: "block",
				});
			});
		};

		editor.on("selectionUpdate", updatePosition);
		editor.on("transaction", updatePosition);

		return () => {
			editor.off("selectionUpdate", updatePosition);
			editor.off("transaction", updatePosition);
		};
	}, [editor]);

	return (
		<div
			ref={menuRef}
			style={{
				position: "fixed",
				display: "none",
				zIndex: 50,
			}}
		>
			{children}
		</div>
	);
}
