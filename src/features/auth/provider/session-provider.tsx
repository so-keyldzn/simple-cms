"use client";

import { useSession } from "@/features/auth/lib/auth-clients";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
	const { data: session } = useSession();
	const router = useRouter();

	// Forcer le rechargement quand la session change
	useEffect(() => {
		if (session) {
			router.refresh();
		}
	}, [session?.user?.id, router]);

	return <>{children}</>;
}
