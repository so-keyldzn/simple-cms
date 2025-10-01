"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface ComboboxCreatableProps {
	options: { label: string; value: string }[];
	value?: string;
	onValueChange: (value: string) => void;
	onCreate: (name: string) => Promise<{ id: string; name: string } | null>;
	onDelete?: (id: string) => Promise<boolean>;
	placeholder?: string;
	emptyText?: string;
	createText?: string;
	deleteText?: string;
}

export function ComboboxCreatable({
	options,
	value,
	onValueChange,
	onCreate,
	onDelete,
	placeholder = "Sélectionner...",
	emptyText = "Aucun résultat.",
	createText = "Créer",
	deleteText = "Supprimer",
}: ComboboxCreatableProps) {
	const [open, setOpen] = React.useState(false);
	const [searchValue, setSearchValue] = React.useState("");
	const [deleteLoading, setDeleteLoading] = React.useState<string | null>(null);

	const selectedOption = options.find((option) => option.value === value);

	const handleCreate = async () => {
		if (!searchValue.trim()) return;

		const newItem = await onCreate(searchValue.trim());
		if (newItem) {
			onValueChange(newItem.id);
			setOpen(false);
			setSearchValue("");
		}
	};

	const handleDelete = async (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		if (!onDelete) return;

		setDeleteLoading(id);
		const success = await onDelete(id);
		setDeleteLoading(null);

		if (success && value === id) {
			onValueChange("");
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
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between"
				>
					{selectedOption ? selectedOption.label : placeholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0" align="start">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder="Rechercher ou créer..."
						value={searchValue}
						onValueChange={setSearchValue}
					/>
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
										{createText} "{searchValue}"
									</Button>
								</div>
							) : (
								<p className="py-6 text-center text-sm">{emptyText}</p>
							)}
						</CommandEmpty>
						<CommandGroup>
							{filteredOptions.map((option) => (
								<CommandItem
									key={option.value}
									value={option.value}
									onSelect={(currentValue) => {
										onValueChange(currentValue === value ? "" : currentValue);
										setOpen(false);
										setSearchValue("");
									}}
									className="group"
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === option.value ? "opacity-100" : "opacity-0"
										)}
									/>
									<span className="flex-1">{option.label}</span>
									{onDelete && (
										<Button
											size="icon"
											variant="ghost"
											className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
											onClick={(e) => handleDelete(option.value, e)}
											disabled={deleteLoading === option.value}
										>
											<X className="h-3 w-3" />
										</Button>
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
