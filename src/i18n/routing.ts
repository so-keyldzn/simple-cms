import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
	locales: ["fr", "en"],
	defaultLocale: "fr",
	localePrefix: "as-needed",
	localeDetection: false, // Désactiver la détection automatique
});

export const { Link, redirect, usePathname, useRouter } =
	createNavigation(routing);
