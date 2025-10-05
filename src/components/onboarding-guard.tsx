"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export function OnboardingGuard() {
	const router = useRouter();
	const pathname = usePathname();
	const hasCheckedRef = useRef(false);

	useEffect(() => {
		// Skip check if already on onboarding page
		if (pathname.includes("/onboard")) {
			return;
		}

		// Only check once per mount
		if (hasCheckedRef.current) {
			return;
		}

		hasCheckedRef.current = true;

		// Check if onboarding is needed
		fetch("/api/onboarding/status")
			.then((res) => res.json())
			.then((data) => {
				if (data.needsOnboarding) {
					// Simply redirect to /onboard - it will handle locale redirection
					router.push("/onboard");
				}
			})
			.catch((error) => {
				console.error("Error checking onboarding status:", error);
				hasCheckedRef.current = false; // Allow retry on error
			});
	}, [pathname, router]);

	return null;
}
