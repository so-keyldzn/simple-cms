"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface MultiSelectProps {
	options: { label: string; value: string }[];
	selected: string[];
	onChange: (selected: string[]) => void;
	placeholder?: string;
}

export function MultiSelect({
	options,
	selected,
	onChange,
	placeholder = "Sélectionner...",
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);

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
				<Command>
					<CommandInput placeholder="Rechercher..." />
					<CommandEmpty>Aucun résultat</CommandEmpty>
					<CommandGroup className="max-h-64 overflow-auto">
						{options.map((option) => (
							<CommandItem
								key={option.value}
								onSelect={() => handleSelect(option.value)}
							>
								<div className="flex items-center gap-2">
									<div
										className={`w-4 h-4 border rounded flex items-center justify-center ${
											selected.includes(option.value)
												? "bg-primary border-primary"
												: "border-input"
										}`}
									>
										{selected.includes(option.value) && (
											<div className="w-2 h-2 bg-white rounded-sm" />
										)}
									</div>
									{option.label}
								</div>
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
