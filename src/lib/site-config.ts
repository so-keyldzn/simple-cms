/**
 * Site configuration utilities
 * Reads site settings from environment variables
 *
 * All site configuration is stored in NEXT_PUBLIC_* environment variables
 * so they are accessible both server-side and client-side
 */

export interface SiteConfig {
	name: string;
	description: string;
	logo: string | null;
	favicon: string | null;
}

/**
 * Get site configuration from environment variables
 * Provides sensible defaults if variables are not set
 */
export function getSiteConfig(): SiteConfig {
	return {
		name: process.env.NEXT_PUBLIC_SITE_NAME || "CMS",
		description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "A modern content management system",
		logo: process.env.NEXT_PUBLIC_SITE_LOGO || null,
		favicon: process.env.NEXT_PUBLIC_SITE_FAVICON || null,
	};
}

/**
 * Get site name
 */
export function getSiteName(): string {
	return process.env.NEXT_PUBLIC_SITE_NAME || "CMS";
}

/**
 * Get site description
 */
export function getSiteDescription(): string {
	return process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "A modern content management system";
}

/**
 * Get site logo URL
 */
export function getSiteLogo(): string | null {
	return process.env.NEXT_PUBLIC_SITE_LOGO || null;
}

/**
 * Get site favicon URL
 */
export function getSiteFavicon(): string | null {
	return process.env.NEXT_PUBLIC_SITE_FAVICON || null;
}
