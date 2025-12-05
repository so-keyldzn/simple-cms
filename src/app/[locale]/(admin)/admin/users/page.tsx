"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  useUsers,
  useDeleteUser,
  useUnbanUser,
  useImpersonateUser,
  type User,
} from "@/features/data/hooks/use-users";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
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

export default function UsersManagementPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const pageSize = 10;

  // TanStack Query hooks
  const { data, isLoading } = useUsers({
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    searchValue: searchQuery || undefined,
    searchField: "name",
    searchOperator: "contains",
  });

  const users = data?.users || [];
  const totalUsers = data?.total || 0;

  const deleteUserMutation = useDeleteUser();
  const unbanUserMutation = useUnbanUser();
  const impersonateUserMutation = useImpersonateUser();

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUserMutation.mutate(selectedUser.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
      },
    });
  };

  const handleUnbanUser = (userId: string) => {
    unbanUserMutation.mutate(userId);
  };

  const handleImpersonateUser = (userId: string) => {
    impersonateUserMutation.mutate(userId);
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  const getRoleBadgeVariant = (role?: string) => {
    if (!role) return "secondary";
    if (role.includes("super-admin")) return "destructive";
    if (role.includes("admin")) return "default";
    if (role.includes("editor")) return "outline";
    return "secondary";
  };

  const filteredUsers = users.filter((user) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return !user.banned;
    if (statusFilter === "banned") return user.banned;
    return true;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("admin.users.title")}</CardTitle>
              <CardDescription>{t("admin.users.description")}</CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              {t("admin.users.createUser")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-4">
            <InputGroup>
              <InputGroupInput
                placeholder={t("admin.users.searchUsers")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <InputGroupAddon>
                <Search className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>

            <ToggleGroup
              type="single"
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value || "all")}
              className="justify-start"
            >
              <ToggleGroupItem value="all" aria-label="All users">
                <Users className="mr-2 h-4 w-4" />
                {t("admin.users.all")}
              </ToggleGroupItem>
              <ToggleGroupItem value="active" aria-label="Active users">
                <UserCheck className="mr-2 h-4 w-4" />
                {t("admin.active")}
              </ToggleGroupItem>
              <ToggleGroupItem value="banned" aria-label="Banned users">
                <UserX className="mr-2 h-4 w-4" />
                {t("admin.banned")}
              </ToggleGroupItem>
            </ToggleGroup>
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
                  <TableHead className="text-right">
                    {t("common.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      {t("common.loading")}
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      {t("admin.users.noUsersFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getRoleBadgeVariant(user.role || undefined)}
                        >
                          {user.role || "user"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.banned ? (
                          <Badge variant="destructive">
                            {t("admin.banned")}
                          </Badge>
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
                            <DropdownMenuLabel>
                              {t("common.actions")}
                            </DropdownMenuLabel>
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
                total: totalUsers,
              })}
            </p>
            <ButtonGroup>
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                {t("common.next")}
              </Button>
            </ButtonGroup>
          </div>
        </CardContent>
      </Card>

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedUser && (
        <>
          <SetRoleDialog
            open={roleDialogOpen}
            onOpenChange={setRoleDialogOpen}
            user={selectedUser}
          />

          <BanUserDialog
            open={banDialogOpen}
            onOpenChange={setBanDialogOpen}
            user={selectedUser}
          />

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("admin.deleteDialog.title")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("admin.deleteDialog.userDescription", {
                    name: selectedUser.name || "Unknown",
                  })}
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
