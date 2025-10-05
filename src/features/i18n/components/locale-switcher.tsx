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
import { useParams } from "next/navigation";

export function LocaleSwitcher() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams();
	const currentLocale = (params.locale as Locale) || "fr";

	const handleLocaleChange = (newLocale: string) => {
		router.replace(pathname, { locale: newLocale as Locale });
	};

	return (
		<Select value={currentLocale} onValueChange={handleLocaleChange}>
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
