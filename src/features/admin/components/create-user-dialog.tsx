"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createUserAction } from "@/features/admin/lib/user-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ROLES } from "@/lib/roles";
import { useTranslations } from "next-intl";

type CreateUserDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
};

export function CreateUserDialog({
	open,
	onOpenChange,
	onSuccess,
}: CreateUserDialogProps) {
	const t = useTranslations();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState<string>(ROLES.USER);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const { error } = await createUserAction({
				name,
				email,
				password,
				role,
			});

			if (error) {
				toast.error(error);
				return;
			}

			toast.success(t("admin.userDialogs.userCreatedSuccess"));
			setName("");
			setEmail("");
			setPassword("");
			setRole(ROLES.USER);
			onOpenChange(false);
			onSuccess();
		} catch (error) {
			toast.error(t("admin.userDialogs.createUserError"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{t("admin.userDialogs.createUser")}</DialogTitle>
						<DialogDescription>
							{t("admin.userDialogs.createUserDescription")}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">{t("auth.name")}</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={t("admin.userDialogs.namePlaceholder")}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">{t("auth.email")}</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder={t("admin.userDialogs.emailPlaceholder")}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">{t("auth.password")}</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder={t("admin.userDialogs.passwordPlaceholder")}
								required
								minLength={8}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="role">{t("admin.role")}</Label>
							<Select value={role} onValueChange={setRole}>
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
						</div>
					</div>
					<DialogFooter>
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
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
