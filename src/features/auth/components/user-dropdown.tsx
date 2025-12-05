"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "@/features/auth/lib/auth-clients";
import { LogOut, UserCog, ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { UserAvatar } from "@/components/user-avatar";
import { ModeToggle } from "@/features/theme/components/toogle-theme";
import { LocaleSwitcher } from "@/features/i18n/components/locale-switcher";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export default function UserDropdown() {
	const { data: session, isPending } = useSession();
	const router = useRouter();
	const t = useTranslations();
	const [isSigningOut, setIsSigningOut] = useState(false);

	const handleSignOut = async () => {
		setIsSigningOut(true);
		try {
			await signOut();
			router.push("/sign-in");
		} catch (error) {
			console.error("Sign out error:", error);
		} finally {
			setIsSigningOut(false);
		}
	};

	if (isPending) {
		return (
			<div className="flex items-center justify-center p-2">
				<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!session) {
		return (
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/sign-in">{t("auth.signIn")}</Link>
				</Button>
				<Button size="sm" asChild>
					<Link href="/sign-up">{t("auth.signUp")}</Link>
				</Button>
			</div>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
			

						<UserAvatar
							user={{
								name: session.user.name,
								image: session.user.image,
							}}
							className="h-8 w-8 ring-2 ring-transparent hover:ring-accent transition-all"
						/>
						<div className="hidden sm:grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium max-w-[120px]">
								{session.user.name || t("common.user")}
							</span>
							<span className="truncate text-xs text-muted-foreground max-w-[120px]">
								{session.user.email || ""}
							</span>
						</div>
						<ChevronDown className="ml-auto h-3 w-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 " />
				
				</SidebarMenuButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-64 rounded-xl shadow-lg border-border/50"
				side="bottom"
				align="end"
				sideOffset={8}
			>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">
							{session.user.name || t("common.user")}
						</p>
						<p className="text-xs leading-none text-muted-foreground">
							{session.user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link 
						href="/profile" 
						className="cursor-pointer flex items-center gap-2 px-2 py-1.5 hover:bg-accent/50 transition-colors"
					>
						<UserCog className="h-4 w-4" />
						<span>{t("admin.profile")}</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<div className="px-2 py-1">
					<div className="text-xs font-medium text-muted-foreground mb-2">
						{t("common.preferences")}
					</div>
					<div className="space-y-1">
						<div className="flex items-center justify-between">
							<span className="text-sm">{t("theme.theme")}</span>
							<ModeToggle />
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm">{t("i18n.language")}</span>
							<LocaleSwitcher />
						</div>
					</div>
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 transition-colors"
					onClick={handleSignOut}
					disabled={isSigningOut}
				>
					{isSigningOut ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<LogOut className="mr-2 h-4 w-4" />
					)}
					<span>{isSigningOut ? t("auth.signingOut") : t("admin.logout")}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
