import { type Locale, defaultLocale } from "./i18n-config";

/**
 * Génère un slug à partir d'un titre
 */
export function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/**
 * Trouve la traduction pour une locale donnée ou retourne le contenu par défaut
 */
export function getTranslation<T extends { defaultLocale: string }>(
	item: T,
	translations: Array<{ locale: string } & Record<string, any>>,
	locale: Locale,
): (typeof translations)[number] | null {
	// Chercher la traduction pour la locale demandée
	const translation = translations.find((t) => t.locale === locale);

	if (translation) {
		return translation;
	}

	// Fallback sur la locale par défaut de l'item
	if (locale !== item.defaultLocale) {
		const defaultTranslation = translations.find(
			(t) => t.locale === item.defaultLocale,
		);
		if (defaultTranslation) {
			return defaultTranslation;
		}
	}

	// Fallback sur la locale par défaut du site
	if (locale !== defaultLocale && item.defaultLocale !== defaultLocale) {
		const siteDefaultTranslation = translations.find(
			(t) => t.locale === defaultLocale,
		);
		if (siteDefaultTranslation) {
			return siteDefaultTranslation;
		}
	}

	return null;
}

/**
 * Vérifie si une locale est valide
 */
export function isValidLocale(locale: string): locale is Locale {
	return ["fr", "en"].includes(locale);
}
