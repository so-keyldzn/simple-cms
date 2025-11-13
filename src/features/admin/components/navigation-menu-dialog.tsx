"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { Plus, Loader2, Hash } from "lucide-react";
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

type FormData = {
	name: string;
	label: string;
	description: string;
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

	const form = useForm<FormData>({
		defaultValues: {
			name: menu?.name || "",
			label: menu?.label || "",
			description: menu?.description || "",
		},
	});

	const handleSubmit = async (data: FormData) => {
		setIsLoading(true);

		try {
			const result = menu
				? await updateNavigationMenu(menu.id, data)
				: await createNavigationMenu(data);

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success(menu ? t("admin.navigation.menuUpdated") : t("admin.navigation.menuCreated"));
				handleOpenChange(false);
				if (!menu) {
					form.reset();
				}
			}
		} catch {
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
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)}>
						<DialogHeader>
							<DialogTitle>{menu ? t("admin.navigation.editMenu") : t("admin.navigation.createMenu")}</DialogTitle>
							<DialogDescription>
								{menu
									? t("admin.navigation.editDescription")
									: t("admin.navigation.createDescription")}
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("admin.navigation.identifier")} <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<InputGroup>
												<InputGroupAddon>
													<Hash className="h-4 w-4" />
												</InputGroupAddon>
												<InputGroupInput
													placeholder={t("admin.navigation.identifierPlaceholder")}
													{...field}
													disabled={isLoading || !!menu}
												/>
											</InputGroup>
										</FormControl>
										{!menu && (
											<div className="flex flex-wrap gap-1.5 mt-1">
												<span className="text-xs text-muted-foreground">{t("admin.navigation.suggestions")}</span>
												{COMMON_MENU_IDENTIFIERS.map((item) => (
													<Badge
														key={item.id}
														variant="outline"
														className="cursor-pointer hover:bg-accent"
														onClick={() => {
															form.setValue("name", item.id);
															if (!form.getValues("label")) {
																form.setValue("label", item.label);
															}
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
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="label"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("admin.navigation.label")} <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<InputGroup>
												<InputGroupInput
													placeholder={t("admin.navigation.labelPlaceholder")}
													{...field}
													disabled={isLoading}
												/>
											</InputGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin.navigation.description")}</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t("admin.navigation.descriptionPlaceholder")}
												{...field}
												rows={3}
												disabled={isLoading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<DialogFooter>
							<ButtonGroup>
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
							</ButtonGroup>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
