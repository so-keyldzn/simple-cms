import { prisma } from "@/lib/prisma";
import { generateId } from "better-auth";
import { hashPassword } from "better-auth/crypto";

/**
 * Auto-seed the first super-admin user from environment variables
 * This function is called by instrumentation.ts on server startup
 *
 * Environment variables required:
 * - SEED_ADMIN_EMAIL: Email for the first admin
 * - SEED_ADMIN_PASSWORD: Password for the first admin
 * - SEED_ADMIN_NAME: Name for the first admin (optional, defaults to "Super Admin")
 */
export async function autoSeedAdmin() {
	try {
		// Check if environment variables are set
		const email = process.env.SEED_ADMIN_EMAIL;
		const password = process.env.SEED_ADMIN_PASSWORD;
		const name = process.env.SEED_ADMIN_NAME || "Super Admin";

		// Skip if environment variables are not configured
		if (!email || !password) {
			console.log("[Auto-Seed] Skipping admin seed - SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD not set");
			return;
		}

		// Check if any user already exists (avoid duplicate seeds)
		const existingUserCount = await prisma.user.count();

		if (existingUserCount > 0) {
			console.log("[Auto-Seed] Skipping admin seed - users already exist");
			return;
		}

		// Validate password strength (same as onboarding)
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
		if (!passwordRegex.test(password)) {
			console.error("[Auto-Seed] SEED_ADMIN_PASSWORD must be at least 8 characters with uppercase, lowercase, and number");
			return;
		}

		console.log("[Auto-Seed] Creating first super-admin user...");

		// Generate secure ID and hash password using Better Auth utilities
		const userId = generateId();
		const hashedPassword = await hashPassword(password);

		// Create the first super-admin user directly in database
		const user = await prisma.user.create({
			data: {
				id: userId,
				email,
				name,
				emailVerified: true, // Auto-verify first admin
				role: "super-admin",
				image: null,
				banned: false,
				banReason: null,
				banExpires: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});

		// Create password record in Better Auth's account table
		await prisma.account.create({
			data: {
				id: generateId(),
				userId: user.id,
				accountId: user.id,
				providerId: "credential",
				password: hashedPassword,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});

		console.log(`[Auto-Seed] ✅ Super-admin created successfully: ${email}`);
		console.log(`[Auto-Seed] You can now sign in with the credentials from your environment variables`);

	} catch (error) {
		console.error("[Auto-Seed] Error creating super-admin:", error);
		// Don't throw - let the application start even if seed fails
	}
}
