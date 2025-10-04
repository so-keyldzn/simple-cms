"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function OnboardingGuard() {
	const router = useRouter();
	const pathname = usePathname();
	const [isChecking, setIsChecking] = useState(false);

	useEffect(() => {
		// Skip check if already on onboarding page
		if (pathname === "/onboard") {
			return;
		}

		// Skip check if already checking (prevent multiple calls)
		if (isChecking) {
			return;
		}

		setIsChecking(true);

		// Add a small delay to ensure database has been updated after onboarding
		const timer = setTimeout(() => {
			// Check if onboarding is needed
			fetch("/api/onboarding/status")
				.then((res) => res.json())
				.then((data) => {
					if (data.needsOnboarding) {
						// Redirect to onboarding page
						router.push("/onboard");
					}
				})
				.catch((error) => {
					console.error("Error checking onboarding status:", error);
				})
				.finally(() => {
					setIsChecking(false);
				});
		}, 100); // Small delay to ensure DB transaction has completed

		return () => clearTimeout(timer);
	}, [pathname, router, isChecking]);

	return null;
}
