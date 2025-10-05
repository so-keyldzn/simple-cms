"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export function OnboardingGuard() {
	const router = useRouter();
	const pathname = usePathname();
	const isCheckingRef = useRef(false);

	useEffect(() => {
		// Skip check if already on onboarding page
		if (pathname.includes("/onboard")) {
			return;
		}

		// Skip check if already checking (prevent multiple calls)
		if (isCheckingRef.current) {
			return;
		}

		isCheckingRef.current = true;

		// Add a small delay to ensure database has been updated after onboarding
		const timer = setTimeout(async () => {
			try {
				const res = await fetch("/api/onboarding/status");
				const data = await res.json();
				
				if (data.needsOnboarding) {
					// Extract locale from current pathname if present
					const localeMatch = pathname.match(/^\/(fr|en)\//);
					const onboardPath = localeMatch ? `/${localeMatch[1]}/onboard` : "/onboard";
					router.push(onboardPath);
				}
			} catch (error) {
				console.error("Error checking onboarding status:", error);
			} finally {
				isCheckingRef.current = false;
			}
		}, 100); // Small delay to ensure DB transaction has completed

		return () => {
			clearTimeout(timer);
			isCheckingRef.current = false;
		};
	}, [pathname, router]);

	return null;
}
