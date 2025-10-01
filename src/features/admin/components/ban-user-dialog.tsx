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
import { Input } from "@/components/ui/input";
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

const BAN_DURATIONS = [
	{ label: "1 Hour", value: 60 * 60 },
	{ label: "24 Hours", value: 60 * 60 * 24 },
	{ label: "7 Days", value: 60 * 60 * 24 * 7 },
	{ label: "30 Days", value: 60 * 60 * 24 * 30 },
	{ label: "Permanent", value: undefined },
];

export function BanUserDialog({
	open,
	onOpenChange,
	user,
	onSuccess,
}: BanUserDialogProps) {
	const [banReason, setBanReason] = useState("");
	const [banDuration, setBanDuration] = useState<number | undefined>(
		60 * 60 * 24 * 7
	);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const { error } = await banUserAction(
				user.id,
				banReason || "Violation of terms of service",
				banDuration
			);

			if (error) {
				toast.error(error);
				return;
			}

			toast.success("User banned successfully");
			setBanReason("");
			setBanDuration(60 * 60 * 24 * 7);
			onOpenChange(false);
			onSuccess();
		} catch (error) {
			toast.error("An error occurred while banning user");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Ban User</DialogTitle>
						<DialogDescription>
							Suspend {user.name} ({user.email}) from the platform
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="duration">Ban Duration</Label>
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
							<Label htmlFor="reason">Reason</Label>
							<Textarea
								id="reason"
								value={banReason}
								onChange={(e) => setBanReason(e.target.value)}
								placeholder="Explain why this user is being banned..."
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
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={loading}
							variant="destructive"
						>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Ban User
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
