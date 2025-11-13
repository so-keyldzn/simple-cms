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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ButtonGroup } from "@/components/ui/button-group";
import { setRoleAction } from "@/features/admin/lib/user-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ROLES } from "@/lib/roles";
import { useTranslations } from "next-intl";

type User = {
	id: string;
	name: string;
	email: string;
	role?: string;
};

type SetRoleDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User;
	onSuccess: () => void;
};

export function SetRoleDialog({
	open,
	onOpenChange,
	user,
	onSuccess,
}: SetRoleDialogProps) {
	const t = useTranslations();
	const [role, setRole] = useState(user.role || ROLES.USER);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const { error } = await setRoleAction(
				user.id,
				role
			);

			if (error) {
				toast.error(error);
				return;
			}

			toast.success(t("admin.userDialogs.roleUpdatedSuccess"));
			onOpenChange(false);
			onSuccess();
		} catch {
			toast.error(t("admin.userDialogs.updateRoleError"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{t("admin.userDialogs.setRole")}</DialogTitle>
						<DialogDescription>
							{t("admin.userDialogs.setRoleDescription", { name: user.name, email: user.email })}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
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
								{t("admin.userDialogs.updateRole")}
							</Button>
						</ButtonGroup>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
