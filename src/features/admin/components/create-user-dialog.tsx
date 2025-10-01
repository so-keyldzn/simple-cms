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

			toast.success("User created successfully");
			setName("");
			setEmail("");
			setPassword("");
			setRole(ROLES.USER);
			onOpenChange(false);
			onSuccess();
		} catch (error) {
			toast.error("An error occurred while creating user");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Create New User</DialogTitle>
						<DialogDescription>
							Add a new user to the system with specified role.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="John Doe"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="john@example.com"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								required
								minLength={8}
							/>
						</div>
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
							Create User
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
