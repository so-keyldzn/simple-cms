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
import { banUserAction } from "@/features/admin/lib/user-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

type User = {
	id: string;
	name: string;
	email: string;
};

type BanUserDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User;
	onSuccess: () => void;
};

export function BanUserDialog({
	open,
	onOpenChange,
	user,
	onSuccess,
}: BanUserDialogProps) {
	const t = useTranslations();
	const [banReason, setBanReason] = useState("");
	const [banDuration, setBanDuration] = useState<number | undefined>(
		60 * 60 * 24 * 7
	);
	const [loading, setLoading] = useState(false);

	const BAN_DURATIONS = [
		{ label: t("admin.userDialogs.durations.1Hour"), value: 60 * 60 },
		{ label: t("admin.userDialogs.durations.24Hours"), value: 60 * 60 * 24 },
		{ label: t("admin.userDialogs.durations.7Days"), value: 60 * 60 * 24 * 7 },
		{ label: t("admin.userDialogs.durations.30Days"), value: 60 * 60 * 24 * 30 },
		{ label: t("admin.userDialogs.durations.permanent"), value: undefined },
	];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const { error } = await banUserAction(
				user.id,
				banReason || t("admin.userDialogs.defaultReason"),
				banDuration
			);

			if (error) {
				toast.error(error);
				return;
			}

			toast.success(t("admin.userDialogs.userBannedSuccess"));
			setBanReason("");
			setBanDuration(60 * 60 * 24 * 7);
			onOpenChange(false);
			onSuccess();
		} catch (error) {
			toast.error(t("admin.userDialogs.banUserError"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{t("admin.userDialogs.banUser")}</DialogTitle>
						<DialogDescription>
							{t("admin.userDialogs.banUserDescription", { name: user.name, email: user.email })}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="duration">{t("admin.userDialogs.banDuration")}</Label>
							<Select
								value={banDuration?.toString() || "permanent"}
								onValueChange={(value) =>
									setBanDuration(value === "permanent" ? undefined : Number(value))
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{BAN_DURATIONS.map((duration) => (
										<SelectItem
											key={duration.label}
											value={duration.value?.toString() || "permanent"}
										>
											{duration.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="reason">{t("admin.userDialogs.reason")}</Label>
							<Textarea
								id="reason"
								value={banReason}
								onChange={(e) => setBanReason(e.target.value)}
								placeholder={t("admin.userDialogs.reasonPlaceholder")}
								rows={4}
							/>
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
						<Button
							type="submit"
							disabled={loading}
							variant="destructive"
						>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{t("admin.userDialogs.banUser")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
