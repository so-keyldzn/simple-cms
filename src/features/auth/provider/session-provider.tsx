"use client";

export function SessionProvider({ children }: { children: React.ReactNode }) {
	// Better Auth's useSession hook already handles session updates reactively
	// No need to wrap with additional logic or force router refreshes
	// Components using useSession() will automatically re-render on session changes
	return <>{children}</>;
}
