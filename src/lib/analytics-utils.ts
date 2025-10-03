/**
 * Utility functions for analytics calculations and formatting
 */

// Analytics configuration constants
export const ANALYTICS_LIMITS = {
	TOP_CATEGORIES: 5,
	TOP_AUTHORS: 5,
	RECENT_ACTIVITY: 10,
	TOP_UPLOADERS: 5,
	MOST_COMMENTED_POSTS: 5,
	MOST_USED_TAGS: 5,
	ACTIVE_AUTHORS: 10,
} as const;

export const DEFAULT_DAYS_RANGE = {
	POSTS_PER_DAY: 30,
	USER_GROWTH: 30,
	COMMENTS_TRENDS: 30,
	PUBLISHING_FREQUENCY: 90,
} as const;

/**
 * Format bytes to human-readable size
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Format date to French locale
 * @param date - Date object or ISO string
 * @param options - Formatting options (short, long, full)
 * @returns Formatted date string
 */
export function formatDate(
	date: Date | string,
	options: "short" | "long" | "full" = "short"
): string {
	const dateObj = typeof date === "string" ? new Date(date) : date;

	if (options === "short") {
		return dateObj.toLocaleDateString("fr-FR", {
			day: "2-digit",
			month: "short",
		});
	}

	if (options === "long") {
		return dateObj.toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	}

	// full
	return dateObj.toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

/**
 * Calculate percentage safely (avoids division by zero)
 * @param partial - Numerator value
 * @param total - Denominator value
 * @returns Percentage rounded to nearest integer
 */
export function calculatePercentage(partial: number, total: number): number {
	if (total === 0) return 0;
	return Math.round((partial / total) * 100);
}

/**
 * Get start of week (Monday) for French locale
 * @param date - Date object
 * @returns Date object representing Monday of the week
 */
export function getWeekStart(date: Date): Date {
	const weekStart = new Date(date);
	const day = weekStart.getDay();
	// Convert Sunday (0) to 7, then subtract to get Monday
	const diff = day === 0 ? -6 : 1 - day;
	weekStart.setDate(weekStart.getDate() + diff);
	weekStart.setHours(0, 0, 0, 0);
	return weekStart;
}

/**
 * Convert bytes to megabytes
 * @param bytes - Size in bytes
 * @returns Size in MB rounded to 2 decimals
 */
export function bytesToMB(bytes: number): number {
	return Math.round((bytes / (1024 * 1024)) * 100) / 100;
}
