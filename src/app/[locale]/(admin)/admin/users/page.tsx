"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { listUsersAction, deleteUserAction, unbanUserAction } from "@/features/admin/lib/user-actions";
import { authClient } from "@/features/auth/lib/auth-clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
	MoreHorizontal,
	Search,
	UserPlus,
	Shield,
	Ban,
	Trash2,
	UserCog,
	Eye,
} from "lucide-react";
import { toast } from "sonner";
import { CreateUserDialog } from "@/features/admin/components/create-user-dialog";
import { SetRoleDialog } from "@/features/admin/components/set-role-dialog";
import { BanUserDialog } from "@/features/admin/components/ban-user-dialog";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

type User = {
	id: string;
	name: string;
	email: string;
	role?: string;
	banned?: boolean;
	banReason?: string;
	banExpires?: Date;
	createdAt: Date;
};

export default function UsersManagementPage() {
	const t = useTranslations();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalUsers, setTotalUsers] = useState(0);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [roleDialogOpen, setRoleDialogOpen] = useState(false);
	const [banDialogOpen, setBanDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const router = useRouter();

	const pageSize = 10;

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const { data, error } = await listUsersAction({
				limit: pageSize,
				offset: (currentPage - 1) * pageSize,
				searchValue: searchQuery || undefined,
				searchField: "name",
				searchOperator: "contains",
			});

			if (error) {
				toast.error(error);
				return;
			}

			if (data) {
				setUsers(data.users as User[]);
				setTotalUsers(data.total);
			}
		} catch (error) {
			toast.error(t("admin.users.loadError"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, [currentPage, searchQuery]);

	const handleDeleteUser = async () => {
		if (!selectedUser) return;

		try {
			const { error } = await deleteUserAction(selectedUser.id);

			if (error) {
				toast.error(error);
				return;
			}

			toast.success(t("admin.users.deletedSuccess"));
			setDeleteDialogOpen(false);
			fetchUsers();
		} catch (error) {
			toast.error(t("admin.users.deleteError"));
		}
	};

	const handleUnbanUser = async (userId: string) => {
		try {
			const { error } = await unbanUserAction(userId);

			if (error) {
				toast.error(error);
				return;
			}

			toast.success(t("admin.users.unbannedSuccess"));
			fetchUsers();
		} catch (error) {
			toast.error(t("admin.users.unbanError"));
		}
	};

	const handleImpersonateUser = async (userId: string) => {
		try {
			const { error } = await authClient.admin.impersonateUser({
				userId,
			});

			if (error) {
				toast.error(error.message || t("admin.impersonation.startError"));
				return;
			}

			toast.success(t("admin.impersonation.startedSuccess"));
			// Force un rechargement complet pour charger la nouvelle session
			setTimeout(() => {
				window.location.href = "/dashboard";
			}, 500);
		} catch (error) {
			toast.error(t("admin.impersonation.startError"));
		}
	};

	const totalPages = Math.ceil(totalUsers / pageSize);

	const getRoleBadgeVariant = (role?: string) => {
		if (!role) return "secondary";
		if (role.includes("super-admin")) return "destructive";
		if (role.includes("admin")) return "default";
		if (role.includes("editor")) return "outline";
		return "secondary";
	};

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>{t("admin.users.title")}</CardTitle>
							<CardDescription>
								{t("admin.users.description")}
							</CardDescription>
						</div>
						<Button onClick={() => setCreateDialogOpen(true)}>
							<UserPlus className="mr-2 h-4 w-4" />
							{t("admin.users.createUser")}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<div className="flex items-center gap-2">
							<div className="relative flex-1">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder={t("admin.users.searchUsers")}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-8"
								/>
							</div>
						</div>
					</div>

					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t("admin.users.name")}</TableHead>
									<TableHead>{t("admin.users.email")}</TableHead>
									<TableHead>{t("admin.role")}</TableHead>
									<TableHead>{t("admin.users.status")}</TableHead>
									<TableHead>{t("admin.users.created")}</TableHead>
									<TableHead className="text-right">{t("common.actions")}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center">
											{t("common.loading")}
										</TableCell>
									</TableRow>
								) : users.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center">
											{t("admin.users.noUsersFound")}
										</TableCell>
									</TableRow>
								) : (
									users.map((user) => (
										<TableRow key={user.id}>
											<TableCell className="font-medium">{user.name}</TableCell>
											<TableCell>{user.email}</TableCell>
											<TableCell>
												<Badge variant={getRoleBadgeVariant(user.role)}>
													{user.role || "user"}
												</Badge>
											</TableCell>
											<TableCell>
												{user.banned ? (
													<Badge variant="destructive">{t("admin.banned")}</Badge>
												) : (
													<Badge variant="outline">{t("admin.active")}</Badge>
												)}
											</TableCell>
											<TableCell>
												{new Date(user.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell className="text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() => {
																setSelectedUser(user);
																setRoleDialogOpen(true);
															}}
														>
															<Shield className="mr-2 h-4 w-4" />
															{t("admin.users.setRole")}
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleImpersonateUser(user.id)}
														>
															<Eye className="mr-2 h-4 w-4" />
															{t("admin.users.impersonate")}
														</DropdownMenuItem>
														{user.banned ? (
															<DropdownMenuItem
																onClick={() => handleUnbanUser(user.id)}
															>
																<UserCog className="mr-2 h-4 w-4" />
																{t("admin.users.unbanUser")}
															</DropdownMenuItem>
														) : (
															<DropdownMenuItem
																onClick={() => {
																	setSelectedUser(user);
																	setBanDialogOpen(true);
																}}
															>
																<Ban className="mr-2 h-4 w-4" />
																{t("admin.users.banUser")}
															</DropdownMenuItem>
														)}
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-destructive"
															onClick={() => {
																setSelectedUser(user);
																setDeleteDialogOpen(true);
															}}
														>
															<Trash2 className="mr-2 h-4 w-4" />
															{t("admin.users.deleteUser")}
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					<div className="mt-4 flex items-center justify-between">
						<p className="text-sm text-muted-foreground">
							{t("admin.users.showingUsers", {
								start: (currentPage - 1) * pageSize + 1,
								end: Math.min(currentPage * pageSize, totalUsers),
								total: totalUsers
							})}
						</p>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
								disabled={currentPage === 1}
							>
								{t("common.previous")}
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
								disabled={currentPage === totalPages}
							>
								{t("common.next")}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<CreateUserDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				onSuccess={fetchUsers}
			/>

			{selectedUser && (
				<>
					<SetRoleDialog
						open={roleDialogOpen}
						onOpenChange={setRoleDialogOpen}
						user={selectedUser}
						onSuccess={fetchUsers}
					/>

					<BanUserDialog
						open={banDialogOpen}
						onOpenChange={setBanDialogOpen}
						user={selectedUser}
						onSuccess={fetchUsers}
					/>

					<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>{t("admin.deleteDialog.title")}</AlertDialogTitle>
								<AlertDialogDescription>
									{t("admin.deleteDialog.userDescription", { name: selectedUser.name })}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleDeleteUser}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									{t("common.delete")}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</>
			)}
		</div>
	);
}
