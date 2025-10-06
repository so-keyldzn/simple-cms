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
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import { Plus, Loader2, Link, Hash, FileText } from "lucide-react";
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

type FormData = {
	title: string;
	href: string;
	description: string;
	order: string;
	isExternal: boolean;
	parentId: string;
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

	const form = useForm<FormData>({
		defaultValues: {
			title: item?.title || "",
			href: item?.href || "",
			description: item?.description || "",
			order: item?.order?.toString() || "0",
			isExternal: item?.isExternal || false,
			parentId: item?.parentId || "none",
		},
	});

	const handleSubmit = async (data: FormData) => {
		setIsLoading(true);

		try {
			const submitData = {
				menuId,
				title: data.title,
				href: data.href || undefined,
				description: data.description || undefined,
				order: parseInt(data.order),
				isExternal: data.isExternal,
				parentId: data.parentId === "none" ? undefined : data.parentId,
			};

			const result = item
				? await updateNavigationItem(item.id, submitData)
				: await createNavigationItem(submitData);

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success(item ? t("admin.navigation.itemUpdated") : t("admin.navigation.itemCreated"));
				setOpen(false);
				if (!item) {
					form.reset();
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
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<div className="grid gap-4 py-4">
							<FormField
								control={form.control}
								name="title"
								rules={{ required: t("admin.navigation.titleRequired") }}
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("admin.navigation.title")} <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<FileText className="h-4 w-4" />
												</InputGroupAddon>
												<InputGroupInput
													placeholder={t("admin.navigation.titlePlaceholder")}
													disabled={isLoading}
													{...field}
												/>
											</InputGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="href"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin.navigation.url")}</FormLabel>
										<FormControl>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<Link className="h-4 w-4" />
												</InputGroupAddon>
												<InputGroupInput
													placeholder={t("admin.navigation.urlPlaceholder")}
													disabled={isLoading}
													{...field}
												/>
											</InputGroup>
										</FormControl>
										<p className="text-xs text-muted-foreground">
											{t("admin.navigation.urlHelp")}
										</p>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin.navigation.itemDescription")}</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t("admin.navigation.itemDescriptionPlaceholder")}
												rows={2}
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="order"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("admin.navigation.order")}</FormLabel>
											<FormControl>
												<InputGroup>
													<InputGroupAddon align="inline-start">
														<Hash className="h-4 w-4" />
													</InputGroupAddon>
													<InputGroupInput
														type="number"
														min="0"
														disabled={isLoading}
														{...field}
													/>
												</InputGroup>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="parentId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("admin.navigation.parentItem")}</FormLabel>
											<FormControl>
												<Select
													value={field.value}
													onValueChange={field.onChange}
													disabled={isLoading}
												>
													<SelectTrigger>
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
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="isExternal"
								render={({ field }) => (
									<FormItem className="flex items-center space-x-2">
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
												disabled={isLoading}
											/>
										</FormControl>
										<FormLabel className="cursor-pointer">
											{t("admin.navigation.externalLink")}
										</FormLabel>
									</FormItem>
								)}
							/>
						</div>
						<DialogFooter>
							<ButtonGroup>
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
							</ButtonGroup>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
