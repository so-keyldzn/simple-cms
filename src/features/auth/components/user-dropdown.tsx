"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { LogOut, User, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserDropdown() {
	const { data: session, isPending } = useSession();
	const router = useRouter();

	if (isPending) {
		return (
			<Avatar>
				<AvatarFallback>...</AvatarFallback>
			</Avatar>
		);
	}

	if (!session) {
		return (
			<div className="flex gap-2">
				<Button variant="ghost" asChild>
					<Link href="/sign-in">Sign In</Link>
				</Button>
				<Button asChild>
					<Link href="/sign-up">Sign Up</Link>
				</Button>
			</div>
		);
	}

	const initials = session.user.name
		?.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase() || "U";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-10 w-10 rounded-full">
					<Avatar>
						<AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">{session.user.name}</p>
						<p className="text-xs leading-none text-muted-foreground">
							{session.user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/profile" className="cursor-pointer">
						<User className="mr-2 h-4 w-4" />
						<span>Profile</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/settings" className="cursor-pointer">
						<Settings className="mr-2 h-4 w-4" />
						<span>Settings</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="cursor-pointer text-red-600"
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
					<span>Log out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
