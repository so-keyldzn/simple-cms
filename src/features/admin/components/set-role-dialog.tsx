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
import { setRoleAction } from "@/app/(admin)/admin/users/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ROLES } from "@/lib/roles";

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

			toast.success("User role updated successfully");
			onOpenChange(false);
			onSuccess();
		} catch (error) {
			toast.error("An error occurred while updating role");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Set User Role</DialogTitle>
						<DialogDescription>
							Change the role for {user.name} ({user.email})
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="role">Role</Label>
							<Select value={role} onValueChange={setRole}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={ROLES.USER}>User</SelectItem>
									<SelectItem value={ROLES.AUTHOR}>Author</SelectItem>
									<SelectItem value={ROLES.MODERATOR}>Moderator</SelectItem>
									<SelectItem value={ROLES.EDITOR}>Editor</SelectItem>
									<SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
									<SelectItem value={ROLES.SUPER_ADMIN}>Super Admin</SelectItem>
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
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Update Role
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
