"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
	Link2,
	ImageIcon,
	Minus,
	CodeSquare,
	Pilcrow,
	Unlink,
	Upload,
	Loader2,
	Underline as UnderlineIcon,
	Highlighter,
	Palette,
	AlignLeft,
	AlignCenter,
	AlignRight,
	AlignJustify,
	ListTodo,
	Table as TableIcon,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
	TEXT_COLORS,
	HIGHLIGHT_COLORS,
	EDITOR_CONFIG,
	isValidUrl,
	getErrorMessage,
} from "@/lib/editor-constants";

interface TiptapEditorProps {
	content: string;
	onChange: (content: string) => void;
	placeholder?: string;
	editable?: boolean;
	className?: string;
	minHeight?: number;
}

export function TiptapEditor({
	content,
	onChange,
	placeholder = "Commencez à écrire...",
	editable = true,
	className = "",
	minHeight = EDITOR_CONFIG.MIN_HEIGHT,
}: TiptapEditorProps) {
	const [linkDialogOpen, setLinkDialogOpen] = useState(false);
	const [imageDialogOpen, setImageDialogOpen] = useState(false);
	const [linkUrl, setLinkUrl] = useState("");
	const [linkText, setLinkText] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [imageAlt, setImageAlt] = useState("");
	const [imageFileName, setImageFileName] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const isInternalUpdate = useRef(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const editor = useEditor({
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class: `prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert focus:outline-none max-w-none p-4 ${className}`,
				style: `min-height: ${minHeight}px`,
			},
		},
		extensions: [
			StarterKit.configure({
				hardBreak: {
					keepMarks: true,
					HTMLAttributes: {
						class: "hard-break",
					},
				},
				orderedList: {
					HTMLAttributes: {
						class: "list-decimal ml-6 my-4",
					},
				},
				bulletList: {
					HTMLAttributes: {
						class: "list-disc ml-6 my-4",
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
						class: "font-bold tracking-tight mt-6 mb-2",
					},
				},
				paragraph: {
					HTMLAttributes: {
						class: "mb-2",
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
					class: "text-primary underline underline-offset-4 hover:text-primary/80 cursor-pointer",
				},
			}),
			Image.configure({
				HTMLAttributes: {
					class: "rounded-lg max-w-full h-auto my-4",
				},
			}),
			Underline,
			TextStyle,
			Color,
			Highlight.configure({
				multicolor: true,
				HTMLAttributes: {
					class: "bg-yellow-200 dark:bg-yellow-900/50",
				},
			}),
			TextAlign.configure({
				types: ["heading", "paragraph"],
				alignments: ["left", "center", "right", "justify"],
			}),
			TaskList.configure({
				HTMLAttributes: {
					class: "not-prose pl-2 my-2",
				},
			}),
			TaskItem.configure({
				nested: true,
				HTMLAttributes: {
					class: "flex items-start gap-2 my-1",
				},
			}),
			Table.configure({
				resizable: true,
				HTMLAttributes: {
					class: "border-collapse table-auto w-full my-4",
				},
			}),
			TableRow.configure({
				HTMLAttributes: {
					class: "border border-border",
				},
			}),
			TableHeader.configure({
				HTMLAttributes: {
					class: "border border-border bg-muted font-bold p-2 text-left",
				},
			}),
			TableCell.configure({
				HTMLAttributes: {
					class: "border border-border p-2",
				},
			}),
		],
		content,
		editable,
		onUpdate: ({ editor }) => {
			isInternalUpdate.current = true;
			onChange(editor.getHTML());
			setTimeout(() => {
				isInternalUpdate.current = false;
			}, 0);
		},
	});

	useEffect(() => {
		if (editor && content !== editor.getHTML() && !isInternalUpdate.current) {
			editor.commands.setContent(content);
		}
	}, [content, editor]);

	const handleOpenLinkDialog = useCallback(() => {
		if (!editor) return;
		const previousUrl = editor.getAttributes("link").href || "";
		const { from, to } = editor.state.selection;
		const selectedText = editor.state.doc.textBetween(from, to, " ");

		setLinkUrl(previousUrl);
		setLinkText(selectedText);
		setLinkDialogOpen(true);
	}, [editor]);

	const handleSetLink = useCallback(() => {
		if (!linkUrl) {
			editor?.chain().focus().unsetLink().run();
			setLinkDialogOpen(false);
			return;
		}

		// Validate URL
		if (!isValidUrl(linkUrl)) {
			toast.error("URL invalide. Utilisez http:// ou https://");
			return;
		}

		if (linkText && !editor?.state.selection.empty) {
			editor
				?.chain()
				.focus()
				.insertContent({
					type: "text",
					text: linkText,
					marks: [{ type: "link", attrs: { href: linkUrl } }],
				})
				.run();
		} else if (linkText) {
			editor
				?.chain()
				.focus()
				.insertContent({
					type: "text",
					text: linkText,
					marks: [{ type: "link", attrs: { href: linkUrl } }],
				})
				.run();
		} else {
			editor?.chain().focus().setLink({ href: linkUrl }).run();
		}

		setLinkDialogOpen(false);
		setLinkUrl("");
		setLinkText("");
	}, [editor, linkUrl, linkText]);

	const handleOpenImageDialog = useCallback(() => {
		setImageUrl("");
		setImageAlt("");
		setImageFileName("");
		setSelectedFile(null);
		setImageDialogOpen(true);
	}, []);

	const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Veuillez sélectionner une image");
			return;
		}

		if (file.size > EDITOR_CONFIG.MAX_IMAGE_SIZE) {
			toast.error(`L'image ne doit pas dépasser ${EDITOR_CONFIG.MAX_IMAGE_SIZE / 1024 / 1024}MB`);
			return;
		}

		setSelectedFile(file);
		setImageFileName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
		setImageAlt(file.name);
	}, []);

	const handleUploadImage = useCallback(async () => {
		if (!selectedFile) return;

		setIsUploading(true);

		try {
			// Create a new file with the custom name if changed
			let fileToUpload = selectedFile;
			if (imageFileName && imageFileName !== selectedFile.name.replace(/\.[^/.]+$/, "")) {
				const extension = selectedFile.name.split(".").pop();
				const newFileName = `${imageFileName}.${extension}`;
				fileToUpload = new File([selectedFile], newFileName, {
					type: selectedFile.type,
				});
			}

			const formData = new FormData();
			formData.append("file", fileToUpload);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			const result = await response.json();

			if (!response.ok || result.error) {
				toast.error(result.error || "Erreur lors de l'upload");
				return;
			}

			if (result.data?.url) {
				setImageUrl(result.data.url);
				toast.success("Image uploadée avec succès");
				setSelectedFile(null);
			}
		} catch (error) {
			console.error("Upload error:", error);
			toast.error(getErrorMessage(error, "Erreur lors de l'upload"));
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	}, [selectedFile, imageFileName]);

	const handleSetImage = useCallback(() => {
		if (!imageUrl) {
			toast.error("Veuillez fournir une URL d'image");
			return;
		}

		// Validate image URL
		if (!isValidUrl(imageUrl)) {
			toast.error("URL d'image invalide. Utilisez http:// ou https://");
			return;
		}

		editor
			?.chain()
			.focus()
			.setImage({ src: imageUrl, alt: imageAlt || undefined })
			.run();

		setImageDialogOpen(false);
		setImageUrl("");
		setImageAlt("");
	}, [editor, imageUrl, imageAlt]);

	if (!editor) {
		return null;
	}

	return (
		<>
			<div className="border rounded-lg overflow-hidden">
				<div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
					{/* Text Formatting */}
					<div className="flex gap-1">
						<Toggle
							size="sm"
							pressed={editor.isActive("bold")}
							onPressedChange={() => editor.chain().focus().toggleBold().run()}
							aria-label="Gras"
						>
							<Bold className="h-4 w-4" />
						</Toggle>
						<Toggle
							size="sm"
							pressed={editor.isActive("italic")}
							onPressedChange={() => editor.chain().focus().toggleItalic().run()}
							aria-label="Italique"
						>
							<Italic className="h-4 w-4" />
						</Toggle>
						<Toggle
							size="sm"
							pressed={editor.isActive("underline")}
							onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
							aria-label="Souligner"
						>
							<UnderlineIcon className="h-4 w-4" />
						</Toggle>
						<Toggle
							size="sm"
							pressed={editor.isActive("strike")}
							onPressedChange={() => editor.chain().focus().toggleStrike().run()}
							aria-label="Barrer"
						>
							<Strikethrough className="h-4 w-4" />
						</Toggle>
						<Toggle
							size="sm"
							pressed={editor.isActive("code")}
							onPressedChange={() => editor.chain().focus().toggleCode().run()}
							aria-label="Code"
						>
							<Code className="h-4 w-4" />
						</Toggle>
					</div>

					<Separator orientation="vertical" className="h-8" />

					{/* Text & Highlight Color */}
					<div className="flex gap-1">
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="ghost" size="sm" aria-label="Couleur du texte">
									<Palette className="h-4 w-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-48 p-2" align="start">
								<div className="space-y-2">
									<div>
										<p className="text-xs font-medium mb-2">Couleur du texte</p>
										<div className="grid grid-cols-3 gap-1">
											{TEXT_COLORS.map((color) => (
												<button
													key={color.value}
													type="button"
													className="h-6 w-full rounded border border-border hover:scale-110 transition-transform"
													style={{ backgroundColor: color.value || "transparent" }}
													onClick={() => {
														if (color.value) {
															editor.chain().focus().setColor(color.value).run();
														} else {
															editor.chain().focus().unsetColor().run();
														}
													}}
													aria-label={`Appliquer la couleur ${color.name}`}
													title={color.name}
												/>
											))}
										</div>
									</div>
								</div>
							</PopoverContent>
						</Popover>
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="ghost" size="sm" aria-label="Surlignage">
									<Highlighter className="h-4 w-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-48 p-2" align="start">
								<div className="space-y-2">
									<div>
										<p className="text-xs font-medium mb-2">Surlignage</p>
										<div className="grid grid-cols-3 gap-1">
											{HIGHLIGHT_COLORS.map((color) => (
												<button
													key={color.value}
													type="button"
													className="h-6 w-full rounded border border-border hover:scale-110 transition-transform"
													style={{ backgroundColor: color.value || "transparent" }}
													onClick={() => {
														if (color.value) {
															editor
																.chain()
																.focus()
																.toggleHighlight({ color: color.value })
																.run();
														} else {
															editor.chain().focus().unsetHighlight().run();
														}
													}}
													aria-label={`Appliquer le surlignage ${color.name}`}
													title={color.name}
												/>
											))}
										</div>
									</div>
								</div>
							</PopoverContent>
						</Popover>
					</div>

					<Separator orientation="vertical" className="h-8" />

					{/* Headings */}
					<div className="flex gap-1">
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="ghost" size="sm">
									{editor.isActive("heading", { level: 1 }) && <Heading1 className="h-4 w-4" />}
									{editor.isActive("heading", { level: 2 }) && <Heading2 className="h-4 w-4" />}
									{editor.isActive("heading", { level: 3 }) && <Heading3 className="h-4 w-4" />}
									{!editor.isActive("heading") && <Pilcrow className="h-4 w-4" />}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-48 p-2" align="start">
								<div className="space-y-1">
									<Button
										variant="ghost"
										size="sm"
										className="w-full justify-start"
										onClick={() =>
											editor.chain().focus().toggleHeading({ level: 1 }).run()
										}
									>
										<Heading1 className="h-4 w-4 mr-2" />
										Titre 1
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="w-full justify-start"
										onClick={() =>
											editor.chain().focus().toggleHeading({ level: 2 }).run()
										}
									>
										<Heading2 className="h-4 w-4 mr-2" />
										Titre 2
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="w-full justify-start"
										onClick={() =>
											editor.chain().focus().toggleHeading({ level: 3 }).run()
										}
									>
										<Heading3 className="h-4 w-4 mr-2" />
										Titre 3
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="w-full justify-start"
										onClick={() => editor.chain().focus().setParagraph().run()}
									>
										<Pilcrow className="h-4 w-4 mr-2" />
										Paragraphe
									</Button>
								</div>
							</PopoverContent>
						</Popover>
					</div>

					<Separator orientation="vertical" className="h-8" />

					{/* Lists */}
					<div className="flex gap-1">
						<Toggle
							size="sm"
							pressed={editor.isActive("bulletList")}
							onPressedChange={() =>
								editor.chain().focus().toggleBulletList().run()
							}
							aria-label="Liste à puces"
						>
							<List className="h-4 w-4" />
						</Toggle>
						<Toggle
							size="sm"
							pressed={editor.isActive("orderedList")}
							onPressedChange={() =>
								editor.chain().focus().toggleOrderedList().run()
							}
							aria-label="Liste numérotée"
						>
							<ListOrdered className="h-4 w-4" />
						</Toggle>
						<Toggle
							size="sm"
							pressed={editor.isActive("taskList")}
							onPressedChange={() =>
								editor.chain().focus().toggleTaskList().run()
							}
							aria-label="Liste de tâches"
						>
							<ListTodo className="h-4 w-4" />
						</Toggle>
						<Toggle
							size="sm"
							pressed={editor.isActive("blockquote")}
							onPressedChange={() =>
								editor.chain().focus().toggleBlockquote().run()
							}
							aria-label="Citation"
						>
							<Quote className="h-4 w-4" />
						</Toggle>
						<Toggle
							size="sm"
							pressed={editor.isActive("codeBlock")}
							onPressedChange={() =>
								editor.chain().focus().toggleCodeBlock().run()
							}
							aria-label="Bloc de code"
						>
							<CodeSquare className="h-4 w-4" />
						</Toggle>
					</div>

					<Separator orientation="vertical" className="h-8" />

					{/* Alignment */}
					<div className="flex gap-1">
						<ToggleGroup type="single" size="sm">
							<ToggleGroupItem
								value="left"
								aria-label="Align left"
								onClick={() => editor.chain().focus().setTextAlign("left").run()}
								data-state={editor.isActive({ textAlign: "left" }) ? "on" : "off"}
							>
								<AlignLeft className="h-4 w-4" />
							</ToggleGroupItem>
							<ToggleGroupItem
								value="center"
								aria-label="Align center"
								onClick={() => editor.chain().focus().setTextAlign("center").run()}
								data-state={editor.isActive({ textAlign: "center" }) ? "on" : "off"}
							>
								<AlignCenter className="h-4 w-4" />
							</ToggleGroupItem>
							<ToggleGroupItem
								value="right"
								aria-label="Align right"
								onClick={() => editor.chain().focus().setTextAlign("right").run()}
								data-state={editor.isActive({ textAlign: "right" }) ? "on" : "off"}
							>
								<AlignRight className="h-4 w-4" />
							</ToggleGroupItem>
							<ToggleGroupItem
								value="justify"
								aria-label="Justify"
								onClick={() =>
									editor.chain().focus().setTextAlign("justify").run()
								}
								data-state={editor.isActive({ textAlign: "justify" }) ? "on" : "off"}
							>
								<AlignJustify className="h-4 w-4" />
							</ToggleGroupItem>
						</ToggleGroup>
					</div>

					<Separator orientation="vertical" className="h-8" />

					{/* Insert */}
					<div className="flex gap-1">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() =>
								editor.chain().focus().setHorizontalRule().run()
							}
							aria-label="Ligne horizontale"
						>
							<Minus className="h-4 w-4" />
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleOpenLinkDialog}
							aria-label="Insérer un lien"
						>
							<Link2 className="h-4 w-4" />
						</Button>
						{editor.isActive("link") && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => editor.chain().focus().unsetLink().run()}
								aria-label="Retirer le lien"
							>
								<Unlink className="h-4 w-4" />
							</Button>
						)}
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleOpenImageDialog}
							aria-label="Insérer une image"
						>
							<ImageIcon className="h-4 w-4" />
						</Button>
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="ghost" size="sm" aria-label="Insérer un tableau">
									<TableIcon className="h-4 w-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-64 p-3" align="start">
								<div className="space-y-2">
									<p className="text-xs font-medium mb-2">Insérer un tableau</p>
									<div className="grid grid-cols-2 gap-2">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() =>
												editor
													.chain()
													.focus()
													.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
													.run()
											}
										>
											3x3
										</Button>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() =>
												editor
													.chain()
													.focus()
													.insertTable({ rows: 5, cols: 5, withHeaderRow: true })
													.run()
											}
										>
											5x5
										</Button>
									</div>
									{editor.isActive("table") && (
										<>
											<Separator className="my-2" />
											<p className="text-xs font-medium mb-2">Modifier le tableau</p>
											<div className="grid grid-cols-2 gap-1">
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => editor.chain().focus().addColumnBefore().run()}
												>
													Col avant
												</Button>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => editor.chain().focus().addColumnAfter().run()}
												>
													Col après
												</Button>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => editor.chain().focus().addRowBefore().run()}
												>
													Ligne avant
												</Button>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => editor.chain().focus().addRowAfter().run()}
												>
													Ligne après
												</Button>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => editor.chain().focus().deleteColumn().run()}
												>
													Suppr. col
												</Button>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => editor.chain().focus().deleteRow().run()}
												>
													Suppr. ligne
												</Button>
											</div>
											<Button
												type="button"
												variant="destructive"
												size="sm"
												className="w-full mt-2"
												onClick={() => editor.chain().focus().deleteTable().run()}
											>
												Supprimer le tableau
											</Button>
										</>
									)}
								</div>
							</PopoverContent>
						</Popover>
					</div>

					<Separator orientation="vertical" className="h-8" />

					{/* History */}
					<div className="flex gap-1">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => editor.chain().focus().undo().run()}
							disabled={!editor.can().undo()}
							aria-label="Annuler"
						>
							<Undo className="h-4 w-4" />
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => editor.chain().focus().redo().run()}
							disabled={!editor.can().redo()}
							aria-label="Refaire"
						>
							<Redo className="h-4 w-4" />
						</Button>
					</div>
				</div>

				<EditorContent editor={editor} className="bg-background whitespace-pre-wrap" />
			</div>

			{/* Link Dialog */}
			<Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Insérer un lien</DialogTitle>
						<DialogDescription>
							Ajoutez un lien hypertexte à votre texte
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="link-text">Texte du lien</Label>
							<Input
								id="link-text"
								placeholder="Texte à afficher"
								value={linkText}
								onChange={(e) => setLinkText(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="link-url">URL</Label>
							<Input
								id="link-url"
								placeholder="https://example.com"
								value={linkUrl}
								onChange={(e) => setLinkUrl(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setLinkDialogOpen(false)}
						>
							Annuler
						</Button>
						<Button onClick={handleSetLink}>Insérer</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Image Dialog */}
			<Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Insérer une image</DialogTitle>
						<DialogDescription>
							Uploadez ou ajoutez une image par URL
						</DialogDescription>
					</DialogHeader>
					<Tabs defaultValue="upload" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="upload">Upload</TabsTrigger>
							<TabsTrigger value="url">URL</TabsTrigger>
						</TabsList>
						<TabsContent value="upload" className="space-y-4">
							<div className="space-y-4">
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleFileSelect}
									className="hidden"
								/>
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={() => fileInputRef.current?.click()}
									disabled={isUploading || !!imageUrl}
								>
									<Upload className="mr-2 h-4 w-4" />
									Choisir une image
								</Button>

								{selectedFile && !imageUrl && (
									<div className="space-y-3">
										<div className="p-3 bg-muted rounded-lg">
											<p className="text-sm font-medium">Fichier sélectionné</p>
											<p className="text-xs text-muted-foreground mt-1">
												{selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
											</p>
										</div>

										<div className="space-y-2">
											<Label htmlFor="image-filename">Nom du fichier</Label>
											<Input
												id="image-filename"
												placeholder="Nom du fichier (sans extension)"
												value={imageFileName}
												onChange={(e) => setImageFileName(e.target.value)}
											/>
											<p className="text-xs text-muted-foreground">
												L'extension sera conservée automatiquement
											</p>
										</div>

										<Button
											type="button"
											className="w-full"
											onClick={handleUploadImage}
											disabled={isUploading || !imageFileName.trim()}
										>
											{isUploading ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Upload en cours...
												</>
											) : (
												<>
													<Upload className="mr-2 h-4 w-4" />
													Uploader l'image
												</>
											)}
										</Button>
									</div>
								)}

								{imageUrl && (
									<div className="space-y-2">
										<img
											src={imageUrl}
											alt="Preview"
											className="w-full rounded-lg border"
										/>
										<div className="space-y-2">
											<Label htmlFor="image-alt">Texte alternatif</Label>
											<Input
												id="image-alt"
												placeholder="Description de l'image"
												value={imageAlt}
												onChange={(e) => setImageAlt(e.target.value)}
											/>
										</div>
									</div>
								)}
							</div>
						</TabsContent>
						<TabsContent value="url" className="space-y-4">
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="image-url">URL de l'image</Label>
									<Input
										id="image-url"
										placeholder="https://example.com/image.jpg"
										value={imageUrl}
										onChange={(e) => setImageUrl(e.target.value)}
									/>
								</div>
								{imageUrl && (
									<div className="space-y-2">
										<img
											src={imageUrl}
											alt="Preview"
											className="w-full rounded-lg border"
											onError={(e) => {
												(e.target as HTMLImageElement).style.display = "none";
											}}
										/>
										<div className="space-y-2">
											<Label htmlFor="image-alt-url">Texte alternatif</Label>
											<Input
												id="image-alt-url"
												placeholder="Description de l'image"
												value={imageAlt}
												onChange={(e) => setImageAlt(e.target.value)}
											/>
										</div>
									</div>
								)}
							</div>
						</TabsContent>
					</Tabs>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setImageDialogOpen(false)}
						>
							Annuler
						</Button>
						<Button onClick={handleSetImage} disabled={!imageUrl}>
							Insérer
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
