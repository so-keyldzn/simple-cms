"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/features/auth/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
	createAdminSchema,
	siteSettingsSchema,
	completeOnboardingSchema,
	ERROR_MESSAGES,
	type CreateAdminInput,
	type SiteSettingsInput,
	type CompleteOnboardingInput,
} from "./validation";
import { ZodError } from "zod";

// Rate limiting map (in-memory - consider Redis for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

/**
 * Check if onboarding is needed (no users in database)
 */
export async function checkOnboardingStatus() {
	try {
		const userCount = await prisma.user.count();
		return { data: { needsOnboarding: userCount === 0 }, error: null };
	} catch (error) {
		console.error("Error checking onboarding status:", error);
		return { data: null, error: ERROR_MESSAGES.INTERNAL_ERROR };
	}
}

/**
 * Rate limiting check
 */
function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const record = rateLimitMap.get(ip);

	if (!record || now > record.resetTime) {
		rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
		return true;
	}

	if (record.count >= RATE_LIMIT_MAX) {
		return false;
	}

	record.count++;
	return true;
}

/**
 * Sanitize input to prevent XSS
 */
function sanitizeInput(input: string): string {
	return input
		.trim()
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#x27;")
		.replace(/\//g, "&#x2F;");
}

/**
 * Create first super admin user
 */
export async function createFirstAdmin(input: CreateAdminInput) {
	try {
		// Get client IP for rate limiting
		const headersList = await headers();
		const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";

		// Rate limiting
		if (!checkRateLimit(ip)) {
			console.warn(`Rate limit exceeded for IP: ${ip}`);
			return { data: null, error: ERROR_MESSAGES.RATE_LIMIT };
		}

		// Validate input
		const validatedData = createAdminSchema.parse(input);

		// Check if onboarding is still needed
		const { data: status } = await checkOnboardingStatus();
		if (!status?.needsOnboarding) {
			return { data: null, error: ERROR_MESSAGES.ONBOARDING_COMPLETE };
		}

		// Sanitize inputs
		const sanitizedEmail = sanitizeInput(validatedData.email.toLowerCase());
		const sanitizedName = sanitizeInput(validatedData.name);

		// Hash password using Better Auth's crypto module
		const { hashPassword } = await import("better-auth/crypto");
		const hashedPassword = await hashPassword(validatedData.password);

		// Generate a unique user ID
		const { generateId } = await import("better-auth");
		const userId = generateId();

		// Create user directly in database (bypassing Better Auth API restrictions)
		const user = await prisma.user.create({
			data: {
				id: userId,
				email: sanitizedEmail,
				name: sanitizedName,
				role: "super-admin",
				emailVerified: true, // Auto-verify first admin
				image: null,
			},
		});

		// Create account record with password
		await prisma.account.create({
			data: {
				id: generateId(),
				userId: user.id,
				accountId: user.id,
				providerId: "credential",
				password: hashedPassword,
			},
		});

		// Log admin creation
		console.log(`First super admin created: ${sanitizedEmail} (ID: ${user.id})`);

		revalidatePath("/");
		return { data: { userId: user.id }, error: null };
	} catch (error) {
		if (error instanceof ZodError) {
			// Return the first validation error message
			const issues = error.issues;
			if (issues && issues.length > 0) {
				return { data: null, error: issues[0].message };
			}
			return { data: null, error: ERROR_MESSAGES.INVALID_INPUT };
		}

		console.error("Error creating first admin:", error);
		return { data: null, error: ERROR_MESSAGES.INTERNAL_ERROR };
	}
}

/**
 * Complete onboarding by saving site settings
 */
export async function completeOnboarding(input: SiteSettingsInput) {
	try {
		// Check if user is authenticated
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { data: null, error: ERROR_MESSAGES.UNAUTHORIZED };
		}

		// Validate input
		const validatedData = siteSettingsSchema.parse(input);

		// Save settings in transaction
		await prisma.$transaction(async (tx) => {
			// Site name
			await tx.setting.upsert({
				where: { key: "site_name" },
				update: { value: sanitizeInput(validatedData.siteName) },
				create: {
					key: "site_name",
					value: sanitizeInput(validatedData.siteName),
					category: "general",
				},
			});

			// Site description
			if (validatedData.siteDescription) {
				await tx.setting.upsert({
					where: { key: "site_description" },
					update: { value: sanitizeInput(validatedData.siteDescription) },
					create: {
						key: "site_description",
						value: sanitizeInput(validatedData.siteDescription),
						category: "general",
					},
				});
			}

			// Site logo
			if (validatedData.siteLogo) {
				await tx.setting.upsert({
					where: { key: "site_logo" },
					update: { value: validatedData.siteLogo },
					create: {
						key: "site_logo",
						value: validatedData.siteLogo,
						category: "general",
					},
				});
			}

			// Site favicon
			if (validatedData.siteFavicon) {
				await tx.setting.upsert({
					where: { key: "site_favicon" },
					update: { value: validatedData.siteFavicon },
					create: {
						key: "site_favicon",
						value: validatedData.siteFavicon,
						category: "general",
					},
				});
			}
		});

		revalidatePath("/");
		return { data: { success: true }, error: null };
	} catch (error) {
		if (error instanceof ZodError) {
			// Return the first validation error message
			const issues = error.issues;
			if (issues && issues.length > 0) {
				return { data: null, error: issues[0].message };
			}
			return { data: null, error: ERROR_MESSAGES.INVALID_INPUT };
		}

		console.error("Error completing onboarding:", error);
		return { data: null, error: ERROR_MESSAGES.INTERNAL_ERROR };
	}
}

/**
 * Complete full onboarding: create first admin + save site settings (all in one transaction)
 */
export async function completeFullOnboarding(input: CompleteOnboardingInput) {
	try {
		// Get client IP for rate limiting
		const headersList = await headers();
		const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";

		// Rate limiting
		if (!checkRateLimit(ip)) {
			console.warn(`Rate limit exceeded for IP: ${ip}`);
			return { data: null, error: ERROR_MESSAGES.RATE_LIMIT };
		}

		// Validate input
		const validatedData = completeOnboardingSchema.parse(input);

		// Check if onboarding is still needed
		const { data: status } = await checkOnboardingStatus();
		if (!status?.needsOnboarding) {
			return { data: null, error: ERROR_MESSAGES.ONBOARDING_COMPLETE };
		}

		// Sanitize inputs
		const sanitizedEmail = sanitizeInput(validatedData.email.toLowerCase());
		const sanitizedName = sanitizeInput(validatedData.name);

		// Hash password using Better Auth's crypto module
		const { hashPassword } = await import("better-auth/crypto");
		const hashedPassword = await hashPassword(validatedData.password);

		// Generate a unique user ID
		const { generateId } = await import("better-auth");
		const userId = generateId();

		// Execute all operations in a transaction
		await prisma.$transaction(async (tx) => {
			// 1. Create user
			await tx.user.create({
				data: {
					id: userId,
					email: sanitizedEmail,
					name: sanitizedName,
					role: "super-admin",
					emailVerified: true, // Auto-verify first admin
					image: null,
				},
			});

			// 2. Create account record with password
			await tx.account.create({
				data: {
					id: generateId(),
					userId: userId,
					accountId: userId,
					providerId: "credential",
					password: hashedPassword,
				},
			});

			// 3. Save site settings
			// Site name
			await tx.setting.upsert({
				where: { key: "site_name" },
				update: { value: sanitizeInput(validatedData.siteName) },
				create: {
					key: "site_name",
					value: sanitizeInput(validatedData.siteName),
					category: "general",
				},
			});

			// Site description
			if (validatedData.siteDescription) {
				await tx.setting.upsert({
					where: { key: "site_description" },
					update: { value: sanitizeInput(validatedData.siteDescription) },
					create: {
						key: "site_description",
						value: sanitizeInput(validatedData.siteDescription),
						category: "general",
					},
				});
			}

			// Site logo
			if (validatedData.siteLogo && validatedData.siteLogo !== "") {
				await tx.setting.upsert({
					where: { key: "site_logo" },
					update: { value: sanitizeInput(validatedData.siteLogo) },
					create: {
						key: "site_logo",
						value: sanitizeInput(validatedData.siteLogo),
						category: "general",
					},
				});
			}

			// Site favicon
			if (validatedData.siteFavicon && validatedData.siteFavicon !== "") {
				await tx.setting.upsert({
					where: { key: "site_favicon" },
					update: { value: sanitizeInput(validatedData.siteFavicon) },
					create: {
						key: "site_favicon",
						value: sanitizeInput(validatedData.siteFavicon),
						category: "general",
					},
				});
			}
		});

		// Log admin creation
		console.log(`First super admin created: ${sanitizedEmail} (ID: ${userId})`);
		console.log(`Site configured: ${validatedData.siteName}`);

		revalidatePath("/");
		return { data: { userId }, error: null };
	} catch (error) {
		if (error instanceof ZodError) {
			// Return the first validation error message
			const issues = error.issues;
			if (issues && issues.length > 0) {
				return { data: null, error: issues[0].message };
			}
			return { data: null, error: ERROR_MESSAGES.INVALID_INPUT };
		}

		console.error("Error completing full onboarding:", error);
		return { data: null, error: ERROR_MESSAGES.INTERNAL_ERROR };
	}
}
