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
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createNavigationItem, updateNavigationItem } from "@/features/admin/lib/navigation-actions";
import { useTranslations } from "next-intl";

type NavigationItemDialogProps = {
	menuId: string;
	item?: {
		id: string;
		title: string;
		href: string | null;
		description: string | null;
		order: number;
		isExternal: boolean;
		parentId: string | null;
	};
	parentItems?: Array<{ id: string; title: string }>;
	trigger?: React.ReactNode;
};

export function NavigationItemDialog({
	menuId,
	item,
	parentItems = [],
	trigger,
}: NavigationItemDialogProps) {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const t = useTranslations();
	const [formData, setFormData] = useState({
		title: item?.title || "",
		href: item?.href || "",
		description: item?.description || "",
		order: item?.order?.toString() || "0",
		isExternal: item?.isExternal || false,
		parentId: item?.parentId || "none",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const data = {
				menuId,
				title: formData.title,
				href: formData.href || undefined,
				description: formData.description || undefined,
				order: parseInt(formData.order),
				isExternal: formData.isExternal,
				parentId: formData.parentId === "none" ? undefined : formData.parentId,
			};

			const result = item
				? await updateNavigationItem(item.id, data)
				: await createNavigationItem(data);

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success(item ? t("admin.navigation.itemUpdated") : t("admin.navigation.itemCreated"));
				setOpen(false);
				if (!item) {
					setFormData({
						title: "",
						href: "",
						description: "",
						order: "0",
						isExternal: false,
						parentId: "none",
					});
				}
			}
		} catch (error) {
			toast.error(t("admin.navigation.errorOccurred"));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						{t("admin.navigation.newItem")}
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>
							{item ? t("admin.navigation.editItem") : t("admin.navigation.createItem")}
						</DialogTitle>
						<DialogDescription>
							{item
								? t("admin.navigation.editItemDescription")
								: t("admin.navigation.createItemDescription")}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="title">
								{t("admin.navigation.title")} <span className="text-destructive">*</span>
							</Label>
							<Input
								id="title"
								placeholder={t("admin.navigation.titlePlaceholder")}
								value={formData.title}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
								required
								disabled={isLoading}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="href">{t("admin.navigation.url")}</Label>
							<Input
								id="href"
								type="text"
								placeholder={t("admin.navigation.urlPlaceholder")}
								value={formData.href}
								onChange={(e) =>
									setFormData({ ...formData, href: e.target.value })
								}
								disabled={isLoading}
							/>
							<p className="text-xs text-muted-foreground">
								{t("admin.navigation.urlHelp")}
							</p>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">{t("admin.navigation.itemDescription")}</Label>
							<Textarea
								id="description"
								placeholder={t("admin.navigation.itemDescriptionPlaceholder")}
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								rows={2}
								disabled={isLoading}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="order">{t("admin.navigation.order")}</Label>
								<Input
									id="order"
									type="number"
									min="0"
									value={formData.order}
									onChange={(e) =>
										setFormData({ ...formData, order: e.target.value })
									}
									disabled={isLoading}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="parent">{t("admin.navigation.parentItem")}</Label>
								<Select
									value={formData.parentId}
									onValueChange={(value) =>
										setFormData({ ...formData, parentId: value })
									}
									disabled={isLoading}
								>
									<SelectTrigger id="parent">
										<SelectValue placeholder={t("admin.navigation.parentPlaceholder")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">{t("admin.navigation.noParent")}</SelectItem>
										{parentItems
											.filter((p) => p.id !== item?.id)
											.map((parent) => (
												<SelectItem key={parent.id} value={parent.id}>
													{parent.title}
												</SelectItem>
											))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<Switch
								id="external"
								checked={formData.isExternal}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, isExternal: checked })
								}
								disabled={isLoading}
							/>
							<Label htmlFor="external" className="cursor-pointer">
								{t("admin.navigation.externalLink")}
							</Label>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isLoading}
						>
							{t("common.cancel")}
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{item ? t("admin.navigation.update") : t("common.create")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
