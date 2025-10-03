import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		// Check if any user exists (no cache to avoid issues during onboarding)
		const userCount = await prisma.user.count();
		const needsOnboarding = userCount === 0;

		return NextResponse.json({ needsOnboarding });
	} catch (error) {
		console.error("Error checking onboarding status:", error);
		return NextResponse.json(
			{ needsOnboarding: false },
			{ status: 500 }
		);
	}
}
