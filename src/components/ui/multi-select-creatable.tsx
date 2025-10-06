"use client";

import * as React from "react";
import { X, Plus, Trash2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";

interface MultiSelectCreatableProps {
	options: { label: string; value: string }[];
	selected: string[];
	onChange: (selected: string[]) => void;
	onCreate: (name: string) => Promise<{ id: string; name: string } | null>;
	onDelete?: (id: string) => Promise<boolean>;
	placeholder?: string;
}

export function MultiSelectCreatable({
	options,
	selected,
	onChange,
	onCreate,
	onDelete,
	placeholder = "Sélectionner...",
}: MultiSelectCreatableProps) {
	const [open, setOpen] = React.useState(false);
	const [searchValue, setSearchValue] = React.useState("");
	const [deleteLoading, setDeleteLoading] = React.useState<string | null>(null);

	const handleSelect = (value: string) => {
		if (selected.includes(value)) {
			onChange(selected.filter((item) => item !== value));
		} else {
			onChange([...selected, value]);
		}
	};

	const handleRemove = (value: string) => {
		onChange(selected.filter((item) => item !== value));
	};

	const handleCreate = async () => {
		if (!searchValue.trim()) return;

		const newTag = await onCreate(searchValue.trim());
		if (newTag) {
			onChange([...selected, newTag.id]);
			setSearchValue("");
		}
	};

	const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		if (!onDelete) return;

		setDeleteLoading(id);
		const success = await onDelete(id);
		setDeleteLoading(null);

		if (success) {
			onChange(selected.filter((item) => item !== id));
		}
	};

	const filteredOptions = options.filter((option) =>
		option.label.toLowerCase().includes(searchValue.toLowerCase())
	);

	const exactMatch = filteredOptions.some(
		(option) => option.label.toLowerCase() === searchValue.toLowerCase()
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className="w-full justify-start h-auto min-h-10"
				>
					{selected.length > 0 ? (
						<div className="flex gap-1 flex-wrap">
							{selected.map((value) => {
								const option = options.find((opt) => opt.value === value);
								return (
									<Badge
										key={value}
										variant="secondary"
										className="gap-1"
										onClick={(e) => {
											e.stopPropagation();
											handleRemove(value);
										}}
									>
										{option?.label}
										<X className="h-3 w-3 cursor-pointer" />
									</Badge>
								);
							})}
						</div>
					) : (
						<span className="text-muted-foreground">{placeholder}</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0" align="start">
				<Command shouldFilter={false}>
					<div className="p-2">
						<InputGroup>
							<InputGroupInput
								placeholder="Rechercher ou créer..."
								value={searchValue}
								onChange={(e) => setSearchValue(e.target.value)}
							/>
							{searchValue && !exactMatch && (
								<InputGroupAddon align="inline-end">
									<InputGroupButton
										onClick={handleCreate}
										size="icon-xs"
									>
										<Plus className="h-3 w-3" />
									</InputGroupButton>
								</InputGroupAddon>
							)}
						</InputGroup>
					</div>
					<CommandList>
						<CommandEmpty>
							{searchValue && !exactMatch ? (
								<div className="flex flex-col items-center gap-2 py-6">
									<p className="text-sm text-muted-foreground">
										"{searchValue}" n'existe pas
									</p>
									<Button
										size="sm"
										variant="secondary"
										onClick={handleCreate}
										className="gap-2"
									>
										<Plus className="h-4 w-4" />
										Créer "{searchValue}"
									</Button>
								</div>
							) : (
								<p className="py-6 text-center text-sm">Aucun résultat</p>
							)}
						</CommandEmpty>
						<CommandGroup className="max-h-64 overflow-auto">
							{filteredOptions.map((option) => (
								<CommandItem
									key={option.value}
									onSelect={() => handleSelect(option.value)}
									className="group"
								>
									<div className="flex items-center gap-2 flex-1">
										<div
											className={`w-4 h-4 border rounded flex items-center justify-center ${
												selected.includes(option.value)
													? "bg-primary border-primary"
													: "border-input"
											}`}
										>
											{selected.includes(option.value) && (
												<Check className="w-2 h-2 text-primary-foreground" />
											)}
										</div>
										<span className="flex-1">{option.label}</span>
									</div>
									{onDelete && (
										<ButtonGroup>
											<ButtonGroupSeparator />
											<Button
												size="sm"
												variant="ghost"
												className="opacity-0 group-hover:opacity-100 transition-opacity"
												onClick={(e) => handleDeleteItem(option.value, e)}
												disabled={deleteLoading === option.value}
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</ButtonGroup>
									)}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
