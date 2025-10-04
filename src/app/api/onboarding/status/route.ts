import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		// Vérifier s'il y a au moins un utilisateur dans la base
		const userCount = await prisma.user.count();
		const needsOnboarding = userCount === 0;

		return NextResponse.json({
			needsOnboarding,
			userCount,
		});
	} catch (error) {
		console.error("Error checking onboarding status:", error);
		return NextResponse.json(
			{ error: "Failed to check onboarding status" },
			{ status: 500 }
		);
	}
}
