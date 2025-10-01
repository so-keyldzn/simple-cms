"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import {
	Bold,
	Italic,
	Strikethrough,
	Code,
	List,
	ListOrdered,
	Quote,
	Undo,
	Redo,
	Heading1,
	Heading2,
	Heading3,
	Link as LinkIcon,
	ImageIcon,
} from "lucide-react";
import { useEffect } from "react";

interface TiptapEditorProps {
	content: string;
	onChange: (content: string) => void;
	placeholder?: string;
}

export function TiptapEditor({
	content,
	onChange,
	placeholder = "Commencez à écrire...",
}: TiptapEditorProps) {
	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({
				orderedList: {
					HTMLAttributes: {
						class: "list-decimal ml-6 my-2",
					},
				},
				bulletList: {
					HTMLAttributes: {
						class: "list-disc ml-6 my-2",
					},
				},
				listItem: {
					HTMLAttributes: {
						class: "my-1",
					},
				},
				code: {
					HTMLAttributes: {
						class: "bg-accent text-accent-foreground rounded px-1.5 py-0.5 font-mono text-sm",
					},
				},
				horizontalRule: {
					HTMLAttributes: {
						class: "my-4 border-border",
					},
				},
				codeBlock: {
					HTMLAttributes: {
						class: "bg-muted text-foreground p-4 rounded-lg font-mono text-sm my-4 overflow-x-auto",
					},
				},
				heading: {
					levels: [1, 2, 3, 4, 5, 6],
					HTMLAttributes: {
						class: "font-bold tracking-tight",
					},
				},
				paragraph: {
					HTMLAttributes: {
						class: "my-2",
					},
				},
				blockquote: {
					HTMLAttributes: {
						class: "border-l-4 border-primary pl-4 italic my-4 text-muted-foreground",
					},
				},
			}),
			Placeholder.configure({
				placeholder,
			}),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: "text-primary underline underline-offset-4 hover:text-primary/80",
				},
			}),
			Image.configure({
				HTMLAttributes: {
					class: "rounded-lg max-w-full h-auto my-4",
				},
			}),
		],
		content,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		editorProps: {
			attributes: {
				class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert focus:outline-none min-h-[300px] max-w-none p-4",
			},
		},
	});

	useEffect(() => {
		if (editor && content !== editor.getHTML()) {
			editor.commands.setContent(content);
		}
	}, [content, editor]);

	if (!editor) {
		return null;
	}

	const addLink = () => {
		const url = window.prompt("URL du lien:");
		if (url) {
			editor.chain().focus().setLink({ href: url }).run();
		}
	};

	const addImage = () => {
		const url = window.prompt("URL de l'image:");
		if (url) {
			editor.chain().focus().setImage({ src: url }).run();
		}
	};

	return (
		<div className="border rounded-lg overflow-hidden">
			<div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={editor.isActive("bold") ? "bg-muted" : ""}
				>
					<Bold className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={editor.isActive("italic") ? "bg-muted" : ""}
				>
					<Italic className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleStrike().run()}
					className={editor.isActive("strike") ? "bg-muted" : ""}
				>
					<Strikethrough className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleCode().run()}
					className={editor.isActive("code") ? "bg-muted" : ""}
				>
					<Code className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-1" />

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
					className={
						editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""
					}
				>
					<Heading1 className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
					className={
						editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""
					}
				>
					<Heading2 className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 3 }).run()
					}
					className={
						editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""
					}
				>
					<Heading3 className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-1" />

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={editor.isActive("bulletList") ? "bg-muted" : ""}
				>
					<List className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className={editor.isActive("orderedList") ? "bg-muted" : ""}
				>
					<ListOrdered className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					className={editor.isActive("blockquote") ? "bg-muted" : ""}
				>
					<Quote className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-1" />

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={addLink}
					className={editor.isActive("link") ? "bg-muted" : ""}
				>
					<LinkIcon className="h-4 w-4" />
				</Button>
				<Button type="button" variant="ghost" size="sm" onClick={addImage}>
					<ImageIcon className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-1" />

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().undo().run()}
					disabled={!editor.can().undo()}
				>
					<Undo className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().redo().run()}
					disabled={!editor.can().redo()}
				>
					<Redo className="h-4 w-4" />
				</Button>
			</div>

			<EditorContent editor={editor} className="bg-background" />
		</div>
	);
}
