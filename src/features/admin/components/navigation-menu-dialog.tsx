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
import { useTranslations } from "next-intl";

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


export function NavigationMenuDialog({ menu, trigger, open: controlledOpen, onOpenChange }: NavigationMenuDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
	const t = useTranslations();

	const COMMON_MENU_IDENTIFIERS = [
		{ id: "main", label: t("admin.navigation.commonMenus.main") },
		{ id: "footer", label: t("admin.navigation.commonMenus.footer") },
		{ id: "mobile", label: t("admin.navigation.commonMenus.mobile") },
		{ id: "secondary", label: t("admin.navigation.commonMenus.secondary") },
		{ id: "social", label: t("admin.navigation.commonMenus.social") },
	];

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
				toast.success(menu ? t("admin.navigation.menuUpdated") : t("admin.navigation.menuCreated"));
				handleOpenChange(false);
				if (!menu) {
					setFormData({ name: "", label: "", description: "" });
				}
			}
		} catch (error) {
			toast.error(t("admin.navigation.errorOccurred"));
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
						{t("admin.navigation.newMenu")}
					</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{menu ? t("admin.navigation.editMenu") : t("admin.navigation.createMenu")}</DialogTitle>
						<DialogDescription>
							{menu
								? t("admin.navigation.editDescription")
								: t("admin.navigation.createDescription")}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">
								{t("admin.navigation.identifier")} <span className="text-destructive">*</span>
							</Label>
							<Input
								id="name"
								placeholder={t("admin.navigation.identifierPlaceholder")}
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								required
								disabled={isLoading || !!menu}
							/>
							{!menu && (
								<div className="flex flex-wrap gap-1.5 mt-1">
									<span className="text-xs text-muted-foreground">{t("admin.navigation.suggestions")}</span>
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
								{t("admin.navigation.identifierHelp")}
							</p>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="label">
								{t("admin.navigation.label")} <span className="text-destructive">*</span>
							</Label>
							<Input
								id="label"
								placeholder={t("admin.navigation.labelPlaceholder")}
								value={formData.label}
								onChange={(e) =>
									setFormData({ ...formData, label: e.target.value })
								}
								required
								disabled={isLoading}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">{t("admin.navigation.description")}</Label>
							<Textarea
								id="description"
								placeholder={t("admin.navigation.descriptionPlaceholder")}
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
							{t("common.cancel")}
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{menu ? t("admin.navigation.update") : t("common.create")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
