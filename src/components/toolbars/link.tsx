"use client";

import { Link2, Link2Off } from "lucide-react";
import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Item } from "@/components/ui/item";
import { ButtonGroup } from "@/components/ui/button-group";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "@/components/toolbars/toolbar-provider";

const LinkToolbar = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Button>
>(({ className, onClick, children, ...props }, ref) => {
	const { editor } = useToolbar();
	const [open, setOpen] = useState(false);
	const [url, setUrl] = useState("");
	const [text, setText] = useState("");

	if (!editor) {
		return (
			<Empty>
				<EmptyMedia variant="icon">
					<Link2 />
				</EmptyMedia>
				<EmptyTitle>No Editor Available</EmptyTitle>
				<EmptyDescription>
					The editor is not initialized yet.
				</EmptyDescription>
			</Empty>
		);
	}

	useEffect(() => {
		if (open && editor) {
			const { from, to } = editor.state.selection;
			const selectedText = editor.state.doc.textBetween(from, to);
			setText(selectedText);

			const previousUrl = editor.getAttributes("link").href || "";
			setUrl(previousUrl);
		}
	}, [open, editor]);

	const handleSubmit = () => {
		if (url) {
			if (text && !editor?.state.selection.empty) {
				// Replace selected text and add link
				editor
					?.chain()
					.focus()
					.deleteSelection()
					.insertContent({
						type: "text",
						text: text,
						marks: [{ type: "link", attrs: { href: url } }],
					})
					.run();
			} else if (editor?.state.selection.empty) {
				// Insert new link with text
				editor
					?.chain()
					.focus()
					.insertContent({
						type: "text",
						text: text || url,
						marks: [{ type: "link", attrs: { href: url } }],
					})
					.run();
			} else {
				// Update existing selection with link
				editor?.chain().focus().setLink({ href: url }).run();
			}

			setUrl("");
			setText("");
			setOpen(false);
		}
	};

	const handleRemoveLink = () => {
		editor?.chain().focus().unsetLink().run();
		setOpen(false);
	};

	const isActive = editor?.isActive("link");

	return (
		<>
			<Dialog open={open} onOpenChange={setOpen}>
				<Tooltip>
					<TooltipTrigger asChild>
						<DialogTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className={cn(
									"h-8 w-8",
									isActive && "bg-accent",
									className,
								)}
								ref={ref}
								{...props}
							>
								{children || <Link2 className="h-4 w-4" />}
							</Button>
						</DialogTrigger>
					</TooltipTrigger>
					<TooltipContent>
						<span>Insérer un lien</span>
						<span className="ml-1 text-xs text-gray-11">(cmd + k)</span>
					</TooltipContent>
				</Tooltip>

				<DialogContent>
					<DialogHeader>
						<DialogTitle>Insérer un lien</DialogTitle>
						<DialogDescription>
							Ajoutez un lien hypertexte au texte sélectionné
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<Item>
							<Label htmlFor="link-text">Texte</Label>
							<InputGroup>
								<InputGroupInput
									id="link-text"
									placeholder="Texte du lien"
									value={text}
									onChange={(e) => setText(e.target.value)}
								/>
							</InputGroup>
						</Item>
						<Item>
							<Label htmlFor="link-url">URL</Label>
							<InputGroup>
								<InputGroupInput
									id="link-url"
									placeholder="https://exemple.com"
									value={url}
									onChange={(e) => setUrl(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleSubmit();
										}
									}}
								/>
							</InputGroup>
						</Item>
					</div>
					<DialogFooter>
						<ButtonGroup>
							{isActive && (
								<Button
									type="button"
									variant="destructive"
									onClick={handleRemoveLink}
								>
									<Link2Off className="mr-2 h-4 w-4" />
									Supprimer le lien
								</Button>
							)}
							<Button
								type="button" 
								variant="outline" 
								onClick={() => setOpen(false)}
							>
								Annuler
							</Button>
							<Button
								type="button" 
								onClick={handleSubmit} 
								disabled={!url}
							>
								{isActive ? "Modifier" : "Insérer"}
							</Button>
						</ButtonGroup>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
});

LinkToolbar.displayName = "LinkToolbar";

export { LinkToolbar };
