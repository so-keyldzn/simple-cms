"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty } from "@/components/ui/empty";
import { Item } from "@/components/ui/item";
import { ButtonGroup } from "@/components/ui/button-group";
import { InputGroup } from "@/components/ui/input-group";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	NODE_HANDLES_SELECTED_STYLE_CLASSNAME,
	cn,
	isValidUrl,
} from "@/lib/utils";
import {
	type CommandProps,
	type Editor,
	Node,
	type NodeViewProps,
	NodeViewWrapper,
	ReactNodeViewRenderer,
	mergeAttributes,
} from "@tiptap/react";
import { Image, Link, Upload, Library, Loader2 } from "lucide-react";
import { type FormEvent, useState, useEffect } from "react";
import { getAllMedia, type Media } from "@/features/admin/lib/media-actions";
import { toast } from "sonner";

export interface ImagePlaceholderEnhancedOptions {
	HTMLAttributes: Record<string, any>;
	onDrop: (files: File[], editor: Editor) => void;
	onDropRejected?: (files: File[], editor: Editor) => void;
	onEmbed: (url: string, editor: Editor) => void;
	allowedMimeTypes?: Record<string, string[]>;
	maxFiles?: number;
	maxSize?: number;
}

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		imagePlaceholderEnhanced: {
			insertImagePlaceholderEnhanced: () => ReturnType;
		};
	}
}

export const ImagePlaceholderEnhanced = Node.create<ImagePlaceholderEnhancedOptions>({
	name: "image-placeholder-enhanced",

	addOptions() {
		return {
			HTMLAttributes: {},
			onDrop: () => {},
			onDropRejected: () => {},
			onEmbed: () => {},
		};
	},

	group: "block",

	parseHTML() {
		return [{ tag: `div[data-type="${this.name}"]` }];
	},

	renderHTML({ HTMLAttributes }) {
		return ["div", mergeAttributes(HTMLAttributes)];
	},

	addNodeView() {
		return ReactNodeViewRenderer(ImagePlaceholderEnhancedComponent, {
			className: NODE_HANDLES_SELECTED_STYLE_CLASSNAME,
		});
	},

	addCommands() {
		return {
			insertImagePlaceholderEnhanced: () => (props: CommandProps) => {
				return props.commands.insertContent({
					type: "image-placeholder-enhanced",
				});
			},
		};
	},
});

function ImagePlaceholderEnhancedComponent(props: NodeViewProps) {
	const { editor, extension, selected } = props;

	const [open, setOpen] = useState(false);
	const [url, setUrl] = useState("");
	const [urlError, setUrlError] = useState(false);
	const [isDragActive, setIsDragActive] = useState(false);
	const [isDragReject, setIsDragReject] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [mediaLibrary, setMediaLibrary] = useState<(Media & { user: { id: string; name: string | null; email: string } })[]>([]);
	const [loadingLibrary, setLoadingLibrary] = useState(false);

	// Load media library when library tab is opened
	useEffect(() => {
		if (open) {
			loadMediaLibrary();
		}
	}, [open]);

	const loadMediaLibrary = async () => {
		setLoadingLibrary(true);
		try {
			const result = await getAllMedia();
			if (result.data) {
				setMediaLibrary(result.data);
			} else if (result.error) {
				toast.error(result.error);
			}
		} catch (error) {
			console.error("Error loading media library:", error);
			toast.error("Erreur lors du chargement de la bibliothèque");
		} finally {
			setLoadingLibrary(false);
		}
	};

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragActive(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragActive(false);
		setIsDragReject(false);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragActive(false);
		setIsDragReject(false);

		const { files } = e.dataTransfer;
		const acceptedFiles: File[] = [];
		const rejectedFiles: File[] = [];

		Array.from(files).map((file) => {
			if (
				extension.options.allowedMimeTypes &&
				!Object.keys(extension.options.allowedMimeTypes).some((type) =>
					file.type.match(type),
				)
			) {
				rejectedFiles.push(file);
			} else if (
				extension.options.maxSize &&
				file.size > extension.options.maxSize
			) {
				rejectedFiles.push(file);
			} else {
				acceptedFiles.push(file);
			}
		});

		if (rejectedFiles.length > 0) {
			setIsDragReject(true);
			extension.options.onDropRejected?.(rejectedFiles, editor);
			toast.error("Certains fichiers ont été rejetés");
		}

		if (acceptedFiles.length > 0) {
			handleAcceptedFiles(acceptedFiles);
		}
	};

	const handleAcceptedFiles = async (acceptedFiles: File[]) => {
		setIsUploading(true);

		try {
			for (const file of acceptedFiles) {
				const formData = new FormData();
				formData.append("file", file);

				const response = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});

				const result = await response.json();

				if (!response.ok || result.error) {
					toast.error(result.error || "Erreur lors de l'upload");
					continue;
				}

				// Insert image with the MinIO URL
				if (result.data?.url) {
					editor.chain().focus().setImage({ src: result.data.url }).run();
					toast.success(`${file.name} uploadé avec succès`);
				}
			}

			// Reload media library
			await loadMediaLibrary();
			setOpen(false);
		} catch (error) {
			console.error("Upload error:", error);
			toast.error("Erreur lors de l'upload");
		} finally {
			setIsUploading(false);
		}
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		handleAcceptedFiles(files);
	};

	const handleInsertEmbed = (e: FormEvent) => {
		e.preventDefault();
		const valid = isValidUrl(url);
		if (!valid) {
			setUrlError(true);
			return;
		}
		if (url !== "") {
			editor.chain().focus().setImage({ src: url }).run();
			extension.options.onEmbed(url, editor);
			setOpen(false);
		}
	};

	const handleSelectFromLibrary = (media: Media) => {
		editor.chain().focus().setImage({ src: media.url }).run();
		toast.success("Image insérée");
		setOpen(false);
	};

	return (
		<NodeViewWrapper className="w-full">
			<Popover modal open={open}>
				<PopoverTrigger
					onClick={() => {
						setOpen(true);
					}}
					asChild
					className="w-full"
				>
					<div
						className={cn(
							"flex cursor-pointer items-center gap-3 rounded-md bg-accent p-2 py-3 text-sm text-accent-foreground transition-colors hover:bg-secondary",
							selected && "bg-primary/10 hover:bg-primary/20",
						)}
					>
						<Image className="h-6 w-6" />
						Ajouter une image
					</div>
				</PopoverTrigger>
				<PopoverContent
					className="w-[600px] px-0 py-2"
					onPointerDownOutside={() => {
						setOpen(false);
					}}
					onEscapeKeyDown={() => {
						setOpen(false);
					}}
				>
					<Tabs defaultValue="library" className="px-3">
						<TabsList>
							<ButtonGroup>
								<TabsTrigger className="px-2 py-1 text-sm" value="library">
									<Library className="mr-2 h-4 w-4" />
									Bibliothèque
								</TabsTrigger>
								<TabsTrigger className="px-2 py-1 text-sm" value="upload">
									<Upload className="mr-2 h-4 w-4" />
									Upload
								</TabsTrigger>
								<TabsTrigger className="px-2 py-1 text-sm" value="url">
									<Link className="mr-2 h-4 w-4" />
									URL
								</TabsTrigger>
							</ButtonGroup>
						</TabsList>

						<TabsContent value="library">
							<ScrollArea className="h-[400px] w-full pr-3">
								{loadingLibrary ? (
									<div className="flex items-center justify-center h-40">
										<Loader2 className="h-6 w-6 animate-spin" />
									</div>
								) : mediaLibrary.length === 0 ? (
									<div className="flex flex-col items-center justify-center h-40 text-center">
										<Library className="h-12 w-12 text-muted-foreground mb-4" />
										<h3 className="text-lg font-medium">Aucune image dans la bibliothèque</h3>
										<p className="text-sm text-muted-foreground">Commencez par uploader des images</p>
									</div>
								) : (
									<div className="grid grid-cols-3 gap-2 mt-2">
										{mediaLibrary
											.filter(m => m.mimeType.startsWith("image/"))
											.map((media) => (
												<Item
													key={media.id}
													onClick={() => handleSelectFromLibrary(media)}
													className="relative aspect-square rounded-md overflow-hidden border hover:border-primary transition-colors group cursor-pointer"
												>
													<img
														src={media.url}
														alt={media.alt || media.originalName}
														className="w-full h-full object-cover"
													/>
													<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
														<span className="text-white text-xs text-center px-2">
															{media.originalName}
														</span>
													</div>
												</Item>
											))}
									</div>
								)}
							</ScrollArea>
						</TabsContent>

						<TabsContent value="upload">
							<div
								onDragEnter={handleDragEnter}
								onDragLeave={handleDragLeave}
								onDragOver={handleDragOver}
								onDrop={handleDrop}
								className={cn(
									"my-2 rounded-md border border-dashed text-sm transition-colors",
									isDragActive && "border-primary bg-secondary",
									isDragReject && "border-destructive bg-destructive/10",
									"hover:bg-secondary",
								)}
							>
								<input
									type="file"
									accept="image/*"
									multiple
									onChange={handleFileInputChange}
									className="hidden"
									id="file-input-enhanced"
									disabled={isUploading}
								/>
								<label
									htmlFor="file-input-enhanced"
									className="flex h-28 w-full cursor-pointer flex-col items-center justify-center text-center"
								>
									{isUploading ? (
										<>
											<Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
											Upload en cours...
										</>
									) : (
										<>
											<Upload className="mx-auto mb-2 h-6 w-6" />
											Glissez-déposez ou cliquez pour uploader
										</>
									)}
								</label>
							</div>
							<p className="text-xs text-muted-foreground text-center">
								Les images seront stockées sur MinIO et sauvegardées dans la bibliothèque
							</p>
						</TabsContent>

						<TabsContent value="url">
							<form onSubmit={handleInsertEmbed}>
								<InputGroup>
									<Input
										value={url}
										onChange={(e) => {
											setUrl(e.target.value);
											if (urlError) {
												setUrlError(false);
											}
										}}
										placeholder="Collez l'URL de l'image..."
										className={cn(urlError && "border-destructive")}
									/>
									{urlError && (
										<p className="py-1.5 text-xs text-destructive">
											Veuillez entrer une URL valide
										</p>
									)}
								</InputGroup>
								<Button
									onClick={handleInsertEmbed}
									type="button"
									size="sm"
									className="my-2 h-8 w-full p-2 text-xs"
								>
									Insérer l'image
								</Button>
								<p className="text-center text-xs text-muted-foreground">
									Fonctionne avec n'importe quelle image du web
								</p>
							</form>
						</TabsContent>
					</Tabs>
				</PopoverContent>
			</Popover>
		</NodeViewWrapper>
	);
}
