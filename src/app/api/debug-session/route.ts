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
	} catch (error: any) {
		return Response.json(
			{
				error: error.message,
				stack: error.stack,
			},
			{ status: 500 }
		);
	}
}
