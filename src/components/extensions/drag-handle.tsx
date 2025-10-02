"use client";

import { DragHandle } from "@tiptap/extension-drag-handle";

export const DragHandleExtension = DragHandle.configure({
	// Configure positioning
	computePositionConfig: {
		placement: 'left-start',
		strategy: 'absolute',
	},

	// Render the drag handle element
	render() {
		const element = document.createElement("div");
		element.classList.add("drag-handle");
		element.setAttribute("data-drag-handle", "");
		element.setAttribute("aria-label", "Drag to reorder");
		element.setAttribute("role", "button");
		element.setAttribute("tabindex", "-1");

		// Force visibility
		element.style.opacity = "1";
		element.style.visibility = "visible";

		// Add grip icon (6 dots grip)
		element.innerHTML = `
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<circle cx="9" cy="5" r="1"/>
				<circle cx="9" cy="12" r="1"/>
				<circle cx="9" cy="19" r="1"/>
				<circle cx="15" cy="5" r="1"/>
				<circle cx="15" cy="12" r="1"/>
				<circle cx="15" cy="19" r="1"/>
			</svg>
		`;

		return element;
	},
});
