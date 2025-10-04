"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createNavigationMenu, updateNavigationMenu } from "@/features/admin/lib/navigation-actions";
import { Badge } from "@/components/ui/badge";

type NavigationMenuDialogProps = {
	menu?: {
		id: string;
		name: string;
		label: string;
		description: string | null;
	};
	trigger?: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

const COMMON_MENU_IDENTIFIERS = [
	{ id: "main", label: "Menu principal" },
	{ id: "footer", label: "Pied de page" },
	{ id: "mobile", label: "Menu mobile" },
	{ id: "secondary", label: "Menu secondaire" },
	{ id: "social", label: "Réseaux sociaux" },
];

export function NavigationMenuDialog({ menu, trigger, open: controlledOpen, onOpenChange }: NavigationMenuDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

	const handleOpenChange = (newOpen: boolean) => {
		if (controlledOpen === undefined) {
			setInternalOpen(newOpen);
		}
		onOpenChange?.(newOpen);
	};
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: menu?.name || "",
		label: menu?.label || "",
		description: menu?.description || "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const result = menu
				? await updateNavigationMenu(menu.id, formData)
				: await createNavigationMenu(formData);

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success(menu ? "Menu mis à jour" : "Menu créé avec succès");
				handleOpenChange(false);
				if (!menu) {
					setFormData({ name: "", label: "", description: "" });
				}
			}
		} catch (error) {
			toast.error("Une erreur est survenue");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{trigger || (
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Nouveau menu
					</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{menu ? "Modifier le menu" : "Créer un menu"}</DialogTitle>
						<DialogDescription>
							{menu
								? "Modifiez les informations du menu de navigation"
								: "Créez un nouveau menu de navigation pour votre site"}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">
								Identifiant <span className="text-destructive">*</span>
							</Label>
							<Input
								id="name"
								placeholder="main, footer, mobile..."
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								required
								disabled={isLoading || !!menu}
							/>
							{!menu && (
								<div className="flex flex-wrap gap-1.5 mt-1">
									<span className="text-xs text-muted-foreground">Suggestions:</span>
									{COMMON_MENU_IDENTIFIERS.map((item) => (
										<Badge
											key={item.id}
											variant="outline"
											className="cursor-pointer hover:bg-accent"
											onClick={() => {
												setFormData({
													...formData,
													name: item.id,
													label: formData.label || item.label,
												});
											}}
										>
											{item.id}
										</Badge>
									))}
								</div>
							)}
							<p className="text-xs text-muted-foreground">
								Identifiant unique du menu (ne peut pas être modifié)
							</p>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="label">
								Libellé <span className="text-destructive">*</span>
							</Label>
							<Input
								id="label"
								placeholder="Menu principal"
								value={formData.label}
								onChange={(e) =>
									setFormData({ ...formData, label: e.target.value })
								}
								required
								disabled={isLoading}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								placeholder="Description du menu..."
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								rows={3}
								disabled={isLoading}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={isLoading}
						>
							Annuler
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{menu ? "Mettre à jour" : "Créer"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
