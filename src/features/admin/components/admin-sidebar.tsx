"use client";

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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "@/features/auth/lib/auth-clients";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MenuItem = {
	title: string;
	url: string;
	icon: any;
	roles?: string[];
	badge?: string;
};

type MenuGroup = {
	label: string;
	items: MenuItem[];
};

const menuGroups: MenuGroup[] = [
	{
		label: "Overview",
		items: [
			{
				title: "Dashboard",
				url: "/dashboard",
				icon: LayoutDashboard,
			},
			{
				title: "Analytics",
				url: "/admin/analytics",
				icon: BarChart,
				roles: ["admin", "super-admin", "editor"],
			},
		],
	},
	{
		label: "Content Management",
		items: [
			{
				title: "Posts",
				url: "/admin/posts",
				icon: FileText,
				roles: ["admin", "super-admin", "editor", "author"],
			},
			{
				title: "Categories",
				url: "/admin/categories",
				icon: FolderTree,
				roles: ["admin", "super-admin", "editor"],
			},
			{
				title: "Tags",
				url: "/admin/tags",
				icon: Tags,
				roles: ["admin", "super-admin", "editor"],
			},
			{
				title: "Media Library",
				url: "/admin/media",
				icon: Image,
				roles: ["admin", "super-admin", "editor", "author"],
			},
		],
	},
	{
		label: "Community",
		items: [
			{
				title: "Comments",
				url: "/admin/comments",
				icon: MessageSquare,
				roles: ["admin", "super-admin", "editor", "moderator"],
			},
		],
	},
	{
		label: "System",
		items: [
			{
				title: "Users",
				url: "/admin/users",
				icon: Users,
				roles: ["admin", "super-admin"],
				badge: "Admin",
			},
			{
				title: "Appearance",
				url: "/admin/appearance",
				icon: Palette,
				roles: ["admin", "super-admin"],
			},
			{
				title: "Settings",
				url: "/admin/settings",
				icon: Settings,
				roles: ["admin", "super-admin"],
				badge: "Admin",
			},
		],
	},
];

const generalItems: MenuItem[] = [
	{
		title: "Preview Site",
		url: "/",
		icon: Eye,
	},
	{
		title: "My Profile",
		url: "/profile",
		icon: UserCog,
	},
];

export function AdminSidebar() {
	const pathname = usePathname();
	const { data: session } = useSession();
	const router = useRouter();
	const { state } = useSidebar();

	const initials = session?.user.name
		?.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase() || "U";

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
						<span className="font-semibold text-lg">Admin CMS</span>
					)}
				</div>
			</SidebarHeader>

			<SidebarContent>
				{visibleGroups.map((group) => (
					<SidebarGroup key={group.label}>
						<SidebarGroupLabel>{group.label}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{group.items.map((item) => {
									const isActive = pathname === item.url;
									return (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton asChild isActive={isActive}>
												<Link href={item.url}>
													<item.icon className="h-4 w-4" />
													<span>{item.title}</span>
													{item.badge && state === "expanded" && (
														<Badge variant="secondary" className="ml-auto">
															{item.badge}
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
				))}

				{visibleGeneralItems.length > 0 && (
					<SidebarGroup>
						<SidebarGroupLabel>General</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{visibleGeneralItems.map((item) => {
									const isActive = pathname === item.url;
									return (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton asChild isActive={isActive}>
												<Link href={item.url}>
													<item.icon className="h-4 w-4" />
													<span>{item.title}</span>
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
								<SidebarMenuButton className="w-full">
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={session?.user.image || undefined}
											alt={session?.user.name || "User"}
										/>
										<AvatarFallback>{initials}</AvatarFallback>
									</Avatar>
									{state === "expanded" && (
										<>
											<div className="flex flex-col flex-1 min-w-0">
												<span className="text-sm font-medium truncate">
													{session?.user.name}
												</span>
												<span className="text-xs text-muted-foreground truncate">
													{session?.user.email}
												</span>
											</div>
											<ChevronUp className="ml-auto h-4 w-4" />
										</>
									)}
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								side="top"
								align="end"
								className="w-56"
							>
								<DropdownMenuItem asChild>
									<Link href="/profile">
										<UserCog className="mr-2 h-4 w-4" />
										My Profile
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={async () => {
										await signOut({
											fetchOptions: {
												onSuccess: () => {
													router.push("/sign-in");
												},
											},
										});
									}}
								>
									<LogOut className="mr-2 h-4 w-4" />
									Logout
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
