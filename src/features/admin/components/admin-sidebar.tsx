"use client";

import * as React from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
	useSidebar,
} from "@/components/ui/sidebar";
import {
	LayoutDashboard,
	Users,
	FileText,
	Settings,
	LogOut,
	Home,
	UserCog,
	Image,
	FolderTree,
	MessageSquare,
	Tags,
	Eye,
	BarChart,
	Palette,
	ChevronUp,
	ChevronRight,
	Menu,
} from "lucide-react";
import { signOut, useSession } from "@/features/auth/lib/auth-clients";
import { UserAvatar } from "@/components/user-avatar";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ModeToggle } from "@/features/theme/components/toogle-theme";
import { useTranslations } from "next-intl";

type MenuItem = {
	titleKey: string;
	url: string;
	icon: any;
	roles?: string[];
	badgeKey?: string;
};

type MenuGroup = {
	labelKey: string;
	items: MenuItem[];
	collapsible?: boolean;
};

export function AdminSidebar() {
	const t = useTranslations();
	const pathname = usePathname();
	const { data: session } = useSession();
	const router = useRouter();
	const { state } = useSidebar();
	const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({
		Taxonomies: false,
	});

	const menuGroups: MenuGroup[] = [
		{
			labelKey: "admin.overview",
			items: [
				{
					titleKey: "admin.dashboard",
					url: "/dashboard",
					icon: LayoutDashboard,
				},
				{
					titleKey: "admin.analytics",
					url: "/admin/analytics",
					icon: BarChart,
					roles: ["admin", "super-admin", "editor"],
				},
			],
		},
		{
			labelKey: "admin.manageContent",
			items: [
				{
					titleKey: "admin.posts",
					url: "/admin/posts",
					icon: FileText,
					roles: ["admin", "super-admin", "editor", "author"],
				},
				{
					titleKey: "media.title",
					url: "/admin/media",
					icon: Image,
					roles: ["admin", "super-admin", "editor", "author"],
				},
			],
		},
		{
			labelKey: "blog.categories",
			collapsible: true,
			items: [
				{
					titleKey: "blog.categories",
					url: "/admin/categories",
					icon: FolderTree,
					roles: ["admin", "super-admin", "editor"],
				},
				{
					titleKey: "blog.tags",
					url: "/admin/tags",
					icon: Tags,
					roles: ["admin", "super-admin", "editor"],
				},
			],
		},
		{
			labelKey: "blog.comments",
			items: [
				{
					titleKey: "blog.comments",
					url: "/admin/comments",
					icon: MessageSquare,
					roles: ["admin", "super-admin", "editor", "moderator"],
				},
			],
		},
		{
			labelKey: "settings.general",
			items: [
				{
					titleKey: "admin.users",
					url: "/admin/users",
					icon: Users,
					roles: ["admin", "super-admin"],
				},
				{
					titleKey: "admin.navigation",
					url: "/admin/navigation",
					icon: Menu,
					roles: ["admin", "super-admin"],
				},
				{
					titleKey: "admin.appearance",
					url: "/admin/appearance",
					icon: Palette,
					roles: ["admin", "super-admin"],
				},
				{
					titleKey: "admin.settings",
					url: "/admin/settings",
					icon: Settings,
					roles: ["admin", "super-admin"],
				},
			],
		},
	];

	const generalItems: MenuItem[] = [
		{
			titleKey: "admin.viewAll",
			url: "/",
			icon: Eye,
		},
		{
			titleKey: "admin.profile",
			url: "/profile",
			icon: UserCog,
		},
	];

	const userRoles = session?.user.role?.split(",") || ["user"];

	const hasAccess = (item: MenuItem) => {
		if (!item.roles || item.roles.length === 0) return true;
		return item.roles.some((role) => userRoles.includes(role));
	};

	const visibleGroups = menuGroups
		.map((group) => ({
			...group,
			items: group.items.filter(hasAccess),
		}))
		.filter((group) => group.items.length > 0);

	const visibleGeneralItems = generalItems.filter(hasAccess);

	return (
		<Sidebar variant="floating" collapsible="icon">
			<SidebarHeader>
				<div className="flex items-center gap-2 px-4 py-2">
					<Home className="h-6 w-6" />
					{state === "expanded" && (
						<span className="font-semibold text-lg">Simple CMS</span>
					)}
				</div>
			</SidebarHeader>

			<SidebarContent>
				{visibleGroups.map((group) => {
					if (group.collapsible) {
						return (
							<SidebarGroup key={group.labelKey}>
								<SidebarGroupContent>
									<SidebarMenu>
										<Collapsible
											open={openGroups[group.labelKey]}
											onOpenChange={(open) =>
												setOpenGroups((prev) => ({ ...prev, [group.labelKey]: open }))
											}
										>
											<SidebarMenuItem>
												<CollapsibleTrigger asChild>
													<SidebarMenuButton>
														<Tags className="h-4 w-4" />
														<span>{t(group.labelKey)}</span>
														<ChevronRight
															className="ml-auto h-4 w-4 transition-transform"
															style={{ transform: openGroups[group.labelKey] ? 'rotate(90deg)' : 'rotate(0deg)' }}
														/>
													</SidebarMenuButton>
												</CollapsibleTrigger>
												<CollapsibleContent>
													<SidebarMenuSub>
														{group.items.map((item) => {
															const isActive = pathname === item.url;
															return (
																<SidebarMenuSubItem key={item.titleKey}>
																	<SidebarMenuSubButton asChild isActive={isActive}>
																		<Link href={item.url}>
																			<item.icon className="h-4 w-4" />
																			<span>{t(item.titleKey)}</span>
																		</Link>
																	</SidebarMenuSubButton>
																</SidebarMenuSubItem>
															);
														})}
													</SidebarMenuSub>
												</CollapsibleContent>
											</SidebarMenuItem>
										</Collapsible>
									</SidebarMenu>
								</SidebarGroupContent>
							</SidebarGroup>
						);
					}

					return (
						<SidebarGroup key={group.labelKey}>
							<SidebarGroupLabel>{t(group.labelKey)}</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{group.items.map((item) => {
										const isActive = pathname === item.url;
										return (
											<SidebarMenuItem key={item.titleKey}>
												<SidebarMenuButton asChild isActive={isActive}>
													<Link href={item.url}>
														<item.icon className="h-4 w-4" />
														<span>{t(item.titleKey)}</span>
														{item.badgeKey && state === "expanded" && (
															<Badge variant="secondary" className="ml-auto">
																{t(item.badgeKey)}
															</Badge>
														)}
													</Link>
												</SidebarMenuButton>
											</SidebarMenuItem>
										);
									})}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					);
				})}

				{visibleGeneralItems.length > 0 && (
					<SidebarGroup>
						<SidebarGroupLabel>{t("settings.general")}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{visibleGeneralItems.map((item) => {
									const isActive = pathname === item.url;
									return (
										<SidebarMenuItem key={item.titleKey}>
											<SidebarMenuButton asChild isActive={isActive}>
												<Link href={item.url}>
													<item.icon className="h-4 w-4" />
													<span>{t(item.titleKey)}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<UserAvatar
										name={session?.user.name}
										email={session?.user.email}
										image={session?.user.image}
										className="h-8 w-8"
									/>
									{state === "expanded" && (
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">
												{session?.user.name || "User"}
											</span>
											<span className="truncate text-xs">
												{session?.user.email || ""}
											</span>
										</div>
									)}
									<ChevronUp className="ml-auto size-4" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
								side="top"
								align="end"
								sideOffset={4}
							>
								<DropdownMenuItem asChild>
									<Link href="/profile" className="cursor-pointer">
										<UserCog className="mr-2 h-4 w-4" />
										<span>{t("admin.profile")}</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem className="gap-2">
									<ModeToggle />
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={async () => {
										await signOut();
										router.push("/sign-in");
									}}
								>
									<LogOut className="mr-2 h-4 w-4" />
									<span>{t("admin.logout")}</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
