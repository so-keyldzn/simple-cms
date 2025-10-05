import { type Locale, defaultLocale, locales } from "./i18n-config";

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
	// Créer un Map pour un accès O(1) au lieu de O(n)
	const translationMap = new Map(translations.map(t => [t.locale, t]));

	// Chercher la traduction pour la locale demandée
	const translation = translationMap.get(locale);
	if (translation) {
		return translation;
	}

	// Fallback sur la locale par défaut de l'item
	if (locale !== item.defaultLocale) {
		const defaultTranslation = translationMap.get(item.defaultLocale);
		if (defaultTranslation) {
			return defaultTranslation;
		}
	}

	// Fallback sur la locale par défaut du site
	if (locale !== defaultLocale && item.defaultLocale !== defaultLocale) {
		const siteDefaultTranslation = translationMap.get(defaultLocale);
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
	return locales.includes(locale as Locale);
}
