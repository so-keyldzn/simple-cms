import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

export async function middleware(request: NextRequest) {
	const isAuthPage = request.nextUrl.pathname.startsWith("/sign-in") ||
	                   request.nextUrl.pathname.startsWith("/sign-up");
	const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard") ||
	                         request.nextUrl.pathname.startsWith("/admin") ||
	                         request.nextUrl.pathname.startsWith("/profile") ||
	                         request.nextUrl.pathname.startsWith("/settings");

	// Check session using Better Auth API
	const { data: session } = await betterFetch<{ user: any } | null>(
		"/api/auth/get-session",
		{
			baseURL: request.nextUrl.origin,
			headers: {
				cookie: request.headers.get("cookie") || "",
			},
		}
	);

	// Redirect authenticated users away from auth pages
	if (isAuthPage && session) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// Redirect unauthenticated users to sign-in
	if (isProtectedRoute && !session) {
		const signInUrl = new URL("/sign-in", request.url);
		signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
		return NextResponse.redirect(signInUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (public folder)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
	],
};
