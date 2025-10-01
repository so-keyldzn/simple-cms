/**
 * Constants for the Tiptap editor
 */

export const TEXT_COLORS = [
	{ name: "Défaut", value: "" },
	{ name: "Gris", value: "#6B7280" },
	{ name: "Rouge", value: "#EF4444" },
	{ name: "Orange", value: "#F97316" },
	{ name: "Jaune", value: "#EAB308" },
	{ name: "Vert", value: "#22C55E" },
	{ name: "Bleu", value: "#3B82F6" },
	{ name: "Violet", value: "#A855F7" },
	{ name: "Rose", value: "#EC4899" },
] as const;

export const HIGHLIGHT_COLORS = [
	{ name: "Défaut", value: "" },
	{ name: "Gris", value: "#E5E7EB" },
	{ name: "Rouge", value: "#FEE2E2" },
	{ name: "Orange", value: "#FED7AA" },
	{ name: "Jaune", value: "#FEF3C7" },
	{ name: "Vert", value: "#D1FAE5" },
	{ name: "Bleu", value: "#DBEAFE" },
	{ name: "Violet", value: "#EDE9FE" },
	{ name: "Rose", value: "#FCE7F3" },
] as const;

export const EDITOR_CONFIG = {
	MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
	MIN_HEIGHT: 300,
	ALLOWED_URL_PROTOCOLS: ["http:", "https:"],
} as const;

/**
 * Validates if a URL is safe to use in the editor
 * @param url - The URL to validate
 * @returns true if the URL is valid and safe
 */
export function isValidUrl(url: string): boolean {
	if (!url || url.trim() === "") return false;

	try {
		const parsed = new URL(url);
		return EDITOR_CONFIG.ALLOWED_URL_PROTOCOLS.includes(parsed.protocol);
	} catch {
		return false;
	}
}

/**
 * Gets a user-friendly error message from an error object
 * @param error - The error object
 * @param fallback - Fallback message if error doesn't have a message
 * @returns A user-friendly error message
 */
export function getErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	return fallback;
}
