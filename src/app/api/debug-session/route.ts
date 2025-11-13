import { auth } from "@/features/auth/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		return Response.json({
			session,
			cookies: request.cookies.getAll(),
			headers: Object.fromEntries(request.headers.entries()),
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		const errorStack = error instanceof Error ? error.stack : undefined;
		return Response.json(
			{
				error: errorMessage,
				stack: errorStack,
			},
			{ status: 500 }
		);
	}
}
