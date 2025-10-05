"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { locales, localeNames, localeFlags, type Locale } from "../lib/i18n-config";
import { Badge } from "@/components/ui/badge";

type TranslationTabsProps = {
	defaultLocale?: Locale;
	completedLocales?: Locale[];
	children: (locale: Locale) => React.ReactNode;
};

export function TranslationTabs({
	defaultLocale = "fr",
	completedLocales = [],
	children,
}: TranslationTabsProps) {
	return (
		<Tabs defaultValue={defaultLocale} className="w-full">
			<TabsList className="grid w-full grid-cols-2">
				{locales.map((locale) => {
					const isCompleted = completedLocales.includes(locale);
					const isDefault = locale === defaultLocale;

					return (
						<TabsTrigger key={locale} value={locale} className="relative">
							<span className="flex items-center gap-2">
								<span>{localeFlags[locale]}</span>
								<span>{localeNames[locale]}</span>
								{isDefault && (
									<Badge variant="secondary" className="ml-1 text-xs">
										Défaut
									</Badge>
								)}
								{isCompleted && !isDefault && (
									<span className="ml-1 text-green-500">✓</span>
								)}
							</span>
						</TabsTrigger>
					);
				})}
			</TabsList>

			{locales.map((locale) => (
				<TabsContent key={locale} value={locale}>
					{children(locale)}
				</TabsContent>
			))}
		</Tabs>
	);
}
