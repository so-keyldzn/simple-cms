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
} from "@/components/ui/sidebar";
import {
	LayoutDashboard,
	Users,
	FileText,
	Settings,
	LogOut,
	Home,
	Shield,
	UserCog,
	Image,
	FolderTree,
	MessageSquare,
	Tags,
	Eye,
	BarChart,
	Palette,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "@/features/auth/lib/auth-clients";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type MenuItem = {
	title: string;
	url: string;
	icon: any;
	roles?: string[]; // Si défini, seuls ces rôles peuvent voir l'élément
	badge?: string;
};

const menuItems: MenuItem[] = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: LayoutDashboard,
		// Accessible à tous les utilisateurs connectés
	},
	{
		title: "Posts",
		url: "/admin/posts",
		icon: FileText,
		roles: ["admin", "super-admin", "editor", "author"], // Gestion de contenu
	},
	{
		title: "Media Library",
		url: "/admin/media",
		icon: Image,
		roles: ["admin", "super-admin", "editor", "author"], // Gestion des médias
	},
	{
		title: "Categories",
		url: "/admin/categories",
		icon: FolderTree,
		roles: ["admin", "super-admin", "editor"], // Organisation du contenu
	},
	{
		title: "Tags",
		url: "/admin/tags",
		icon: Tags,
		roles: ["admin", "super-admin", "editor"], // Taxonomie
	},
	{
		title: "Comments",
		url: "/admin/comments",
		icon: MessageSquare,
		roles: ["admin", "super-admin", "editor", "moderator"], // Modération
	},
	{
		title: "Users Management",
		url: "/admin/users",
		icon: Users,
		roles: ["admin", "super-admin"], // Gestion des utilisateurs
		badge: "Admin"
	},
	{
		title: "Analytics",
		url: "/admin/analytics",
		icon: BarChart,
		roles: ["admin", "super-admin", "editor"], // Statistiques
	},
	{
		title: "Appearance",
		url: "/admin/appearance",
		icon: Palette,
		roles: ["admin", "super-admin"], // Thèmes et design
	},
	{
		title: "Preview Site",
		url: "/",
		icon: Eye,
		// Accessible à tous - lien vers le site public
	},
	{
		title: "My Profile",
		url: "/profile",
		icon: UserCog,
		// Accessible à tous
	},
	{
		title: "Settings",
		url: "/admin/settings",
		icon: Settings,
		roles: ["admin", "super-admin"], // Configuration système
		badge: "Admin"
	},
];

export function AdminSidebar() {
	const pathname = usePathname();
	const { data: session } = useSession();
	const router = useRouter();

	const initials = session?.user.name
		?.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase() || "U";

	// Obtenir les rôles de l'utilisateur
	const userRoles = session?.user.role?.split(",") || ["user"];

	// Fonction pour vérifier si l'utilisateur a accès à un élément
	const hasAccess = (item: MenuItem) => {
		// Si aucun rôle requis, accessible à tous
		if (!item.roles || item.roles.length === 0) return true;
		// Vérifier si l'utilisateur a au moins un des rôles requis
		return item.roles.some((role) => userRoles.includes(role));
	};

	// Filtrer les éléments du menu selon les permissions
	const visibleMenuItems = menuItems.filter(hasAccess);

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center gap-2 px-4 py-2">
					<Home className="h-6 w-6" />
					<span className="font-semibold text-lg">Admin CMS</span>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{visibleMenuItems.map((item) => {
								const isActive = pathname === item.url;
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild isActive={isActive}>
											<Link href={item.url}>
												<item.icon className="h-4 w-4" />
												<span>{item.title}</span>
												{item.badge && (
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
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<div className="flex items-center gap-2 px-4 py-2">
							<Avatar className="h-8 w-8">
								<AvatarImage
									src={session?.user.image || undefined}
									alt={session?.user.name || "User"}
								/>
								<AvatarFallback>{initials}</AvatarFallback>
							</Avatar>
							<div className="flex flex-col flex-1 min-w-0">
								<span className="text-sm font-medium truncate">
									{session?.user.name}
								</span>
								<span className="text-xs text-muted-foreground truncate">
									{session?.user.email}
								</span>
							</div>
						</div>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton
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
							<LogOut className="h-4 w-4" />
							<span>Logout</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
