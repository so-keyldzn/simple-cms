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
	Home,
	UserCog,
	Image,
	FolderTree,
	MessageSquare,
	Tags,
	Eye,
	BarChart,
	Palette,
	ChevronRight,
	Menu,
} from "lucide-react";
import { useSession } from "@/features/auth/lib/auth-clients";
import { Link, usePathname } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTranslations } from "next-intl";
import UserDropdown from "@/features/auth/components/user-dropdown";

type MenuItem = {
	titleKey: string;
	url: string;
	icon: React.ComponentType<{ className?: string }>;
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
					titleKey: "admin.analyticsMenu",
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
					titleKey: "admin.userManagement",
					url: "/admin/users",
					icon: Users,
					roles: ["admin", "super-admin"],
				},
				{
					titleKey: "admin.navigationMenu",
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
		<Sidebar variant="floating" collapsible="icon" className="transition-all duration-300 ease-in-out">
			<SidebarHeader className="border-b border-sidebar-border px-4 py-3">
				<div className="flex items-center justify-center gap-3 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-300 py-1 group cursor-pointer">
					<div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
						<Home className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
					</div>
					{state === "expanded" && (
						<div className="flex flex-col gap-0.5 overflow-hidden">
							<span className="font-semibold text-sm text-sidebar-foreground">Simple CMS</span>
							<span className="text-xs text-sidebar-foreground/60 group-hover:text-sidebar-foreground/80 transition-colors duration-300">Admin Panel</span>
						</div>
					)}
				</div>
			</SidebarHeader>

			<SidebarContent className="gap-3">
				{visibleGroups.map((group) => {
					if (group.collapsible) {
						return (
							<SidebarGroup key={group.labelKey} className="border-b border-sidebar-border last:border-0">
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
													<SidebarMenuButton className="transition-colors duration-200 hover:bg-sidebar-accent/80">
														<Tags className="h-4 w-4" />
														{state === "expanded" && <span>{t(group.labelKey)}</span>}
														{state === "expanded" && (
															<ChevronRight
																className="ml-auto h-4 w-4 transition-transform duration-200"
																style={{ transform: openGroups[group.labelKey] ? 'rotate(90deg)' : 'rotate(0deg)' }}
															/>
														)}
													</SidebarMenuButton>
												</CollapsibleTrigger>
												<CollapsibleContent>
													<SidebarMenuSub className="border-l border-sidebar-border ml-3">
														{group.items.map((item) => {
															const isActive = pathname === item.url;
															return (
																<SidebarMenuSubItem key={item.titleKey}>
																	<SidebarMenuSubButton asChild isActive={isActive} className="transition-colors duration-200">
																		<Link href={item.url}>
																			<item.icon className="h-4 w-4" />
																			{state === "expanded" && <span>{t(item.titleKey)}</span>}
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
						<SidebarGroup key={group.labelKey} className="border-b border-sidebar-border last:border-0">
							{state === "expanded" && (
								<SidebarGroupLabel className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/60 px-4 py-2">
									{t(group.labelKey)}
								</SidebarGroupLabel>
							)}
							<SidebarGroupContent>
								<SidebarMenu>
									{group.items.map((item) => {
										const isActive = pathname === item.url;
										return (
											<SidebarMenuItem key={item.titleKey}>
												<SidebarMenuButton asChild isActive={isActive} className="transition-colors duration-200 hover:bg-sidebar-accent/80">
													<Link href={item.url}>
														<item.icon className="h-4 w-4" />
														{state === "expanded" && <span>{t(item.titleKey)}</span>}
														{item.badgeKey && state === "expanded" && (
															<Badge variant="secondary" className="ml-auto text-xs">
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
					<SidebarGroup className="border-t border-sidebar-border pt-3">
						{state === "expanded" && (
							<SidebarGroupLabel className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/60 px-4 py-2">
								{t("settings.general")}
							</SidebarGroupLabel>
						)}
						<SidebarGroupContent>
							<SidebarMenu>
								{visibleGeneralItems.map((item) => {
									const isActive = pathname === item.url;
									return (
										<SidebarMenuItem key={item.titleKey}>
											<SidebarMenuButton asChild isActive={isActive} className="transition-all duration-200 hover:bg-sidebar-accent/80">
												<Link href={item.url}>
													<item.icon className="h-4 w-4" />
													{state === "expanded" && <span>{t(item.titleKey)}</span>}
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

			<SidebarFooter className="border-t border-sidebar-border pt-3">
				<div className="transition-all duration-300">
					<UserDropdown />
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
