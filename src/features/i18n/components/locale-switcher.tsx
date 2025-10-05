"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { locales, localeNames, localeFlags, type Locale } from "../lib/i18n-config";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useLocale } from "next-intl";
import { useTransition } from "react";

export function LocaleSwitcher() {
	const router = useRouter();
	const pathname = usePathname();
	const currentLocale = useLocale() as Locale;
	const [isPending, startTransition] = useTransition();

	const handleLocaleChange = (newLocale: string) => {
		startTransition(() => {
			router.replace(pathname, { locale: newLocale as Locale });
		});
	};

	return (
		<Select value={currentLocale} onValueChange={handleLocaleChange} disabled={isPending}>
			<SelectTrigger className="w-[140px]">
				<SelectValue>
					<span className="flex items-center gap-2">
						<span>{localeFlags[currentLocale]}</span>
						<span>{localeNames[currentLocale]}</span>
					</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{locales.map((locale) => (
					<SelectItem key={locale} value={locale}>
						<span className="flex items-center gap-2">
							<span>{localeFlags[locale]}</span>
							<span>{localeNames[locale]}</span>
						</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
