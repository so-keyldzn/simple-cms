/**
 * Instrumentation file for Next.js 15
 * This runs once when the Node.js server starts
 *
 * Used for:
 * - Auto-seeding the first super-admin from environment variables
 * - Server startup initialization tasks
 *
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
	// Only run in Node.js runtime (not in Edge runtime)
	if (process.env.NEXT_RUNTIME === "nodejs") {
		// Auto-seed admin user if environment variables are set
		const { autoSeedAdmin } = await import("./src/lib/auto-seed");
		await autoSeedAdmin();
	}
}
