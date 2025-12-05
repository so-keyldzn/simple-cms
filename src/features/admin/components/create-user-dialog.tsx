"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
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
import { createUserAction } from "@/features/admin/lib/user-actions";
import { toast } from "sonner";
import { Loader2, User, Mail, Lock } from "lucide-react";
import { ROLES } from "@/lib/roles";
import { useTranslations } from "next-intl";

const createUserSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	role: z.string(),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

type CreateUserDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
};

export function CreateUserDialog({
	open,
	onOpenChange,
	onSuccess,
}: CreateUserDialogProps) {
	const t = useTranslations();
	const [loading, setLoading] = useState(false);

	const form = useForm<CreateUserForm>({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			role: ROLES.USER,
		},
	});

	const handleSubmit = async (data: CreateUserForm) => {
		setLoading(true);

		try {
			const { error } = await createUserAction(data);

			if (error) {
				toast.error(error);
				return;
			}

			toast.success(t("admin.userDialogs.userCreatedSuccess"));
			form.reset();
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error(t("admin.userDialogs.createUserError"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)}>
						<DialogHeader>
							<DialogTitle>{t("admin.userDialogs.createUser")}</DialogTitle>
							<DialogDescription>
								{t("admin.userDialogs.createUserDescription")}
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("auth.name")}</FormLabel>
										<FormControl>
											<InputGroup>
												<InputGroupInput
													{...field}
													placeholder={t("admin.userDialogs.namePlaceholder")}
												/>
												<InputGroupAddon>
													<User className="h-4 w-4" />
												</InputGroupAddon>
											</InputGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("auth.email")}</FormLabel>
										<FormControl>
											<InputGroup>
												<InputGroupInput
													{...field}
													type="email"
													placeholder={t("admin.userDialogs.emailPlaceholder")}
												/>
												<InputGroupAddon>
													<Mail className="h-4 w-4" />
												</InputGroupAddon>
											</InputGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("auth.password")}</FormLabel>
										<FormControl>
											<InputGroup>
												<InputGroupInput
													{...field}
													type="password"
													placeholder={t("admin.userDialogs.passwordPlaceholder")}
												/>
												<InputGroupAddon>
													<Lock className="h-4 w-4" />
												</InputGroupAddon>
											</InputGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="role"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("admin.role")}</FormLabel>
										<FormControl>
											<Select value={field.value} onValueChange={field.onChange}>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value={ROLES.USER}>{t("admin.userDialogs.roles.user")}</SelectItem>
													<SelectItem value={ROLES.AUTHOR}>{t("admin.userDialogs.roles.author")}</SelectItem>
													<SelectItem value={ROLES.MODERATOR}>{t("admin.userDialogs.roles.moderator")}</SelectItem>
													<SelectItem value={ROLES.EDITOR}>{t("admin.userDialogs.roles.editor")}</SelectItem>
													<SelectItem value={ROLES.ADMIN}>{t("admin.userDialogs.roles.admin")}</SelectItem>
													<SelectItem value={ROLES.SUPER_ADMIN}>{t("admin.userDialogs.roles.superAdmin")}</SelectItem>
												</SelectContent>
											</Select>
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
									onClick={() => onOpenChange(false)}
								>
									{t("common.cancel")}
								</Button>
								<Button type="submit" disabled={loading}>
									{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									{t("admin.users.createUser")}
								</Button>
							</ButtonGroup>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
