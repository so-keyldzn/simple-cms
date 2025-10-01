import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Editor } from "@tiptap/react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function duplicateContent(editor: Editor) {
  const { state } = editor;
  const { from, to } = state.selection;
  const content = state.doc.slice(from, to).content;
  const tr = state.tr.insert(to, content);
  editor.view.dispatch(tr);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export const NODE_HANDLES_SELECTED_STYLE_CLASSNAME = "node-handles-selected";
