"use client";

import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/features/auth/lib/auth-clients";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
	className?: string;
	fallbackClassName?: string;
	/** Override user data (useful for showing other users' avatars) */
	user?: {
		name?: string | null;
		image?: string | null;
	} | null;
	/** Show loading state */
	showLoader?: boolean;
};

/**
 * UserAvatar component that displays the current user's avatar.
 * Automatically updates in real-time when the user's profile changes.
 *
 * @example
 * // Current user's avatar (auto-updates)
 * <UserAvatar />
 *
 * @example
 * // Custom size
 * <UserAvatar className="h-16 w-16" />
 *
 * @example
 * // Show another user's avatar
 * <UserAvatar user={{ name: "John Doe", image: "https://..." }} />
 */
export const UserAvatar = memo(function UserAvatar({
	className,
	fallbackClassName,
	user: overrideUser,
	showLoader = false,
}: UserAvatarProps) {
	const { data: session, isPending } = useSession();

	// Use override user if provided, otherwise use session user
	const user = overrideUser !== undefined ? overrideUser : session?.user;

	// Generate initials from name
	const getInitials = (name?: string | null) => {
		if (!name) return "?";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const initials = getInitials(user?.name);

	// Show loading state
	if (isPending && showLoader) {
		return (
			<Avatar className={cn("animate-pulse", className)}>
				<AvatarFallback className={fallbackClassName}>...</AvatarFallback>
			</Avatar>
		);
	}

	return (
		<Avatar className={className}>
			<AvatarImage
				src={user?.image || undefined}
				alt={user?.name || "User"}
				// Force reload when image changes
				key={user?.image || "no-image"}
			/>
			<AvatarFallback className={fallbackClassName}>
				{initials}
			</AvatarFallback>
		</Avatar>
	);
});
