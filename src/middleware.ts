import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

type Session = {
	user: {
		id: string;
		name: string;
		email: string;
		role?: string;
		banned?: boolean;
	};
	session: {
		token: string;
		expiresAt: string;
	};
} | null;

export async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	// Define route types
	const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
	const isAdminRoute = pathname.startsWith("/admin");
	const isProtectedRoute = pathname.startsWith("/dashboard") ||
	                         pathname.startsWith("/profile") ||
	                         pathname.startsWith("/settings");

	// Check session using Better Auth API
	const { data: session } = await betterFetch<Session>(
		"/api/auth/get-session",
		{
			baseURL: request.nextUrl.origin,
			headers: {
				cookie: request.headers.get("cookie") || "",
			},
		}
	);

	// Check if user is banned
	if (session?.user?.banned && !isAuthPage) {
		return NextResponse.redirect(new URL("/sign-in?error=banned", request.url));
	}

	// Redirect authenticated users away from auth pages
	if (isAuthPage && session) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// Check admin access
	if (isAdminRoute) {
		if (!session) {
			const signInUrl = new URL("/sign-in", request.url);
			signInUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(signInUrl);
		}

		const userRole = session.user.role || "user";
		const isAdmin = userRole.split(",").includes("admin");

		if (!isAdmin) {
			return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
		}
	}

	// Redirect unauthenticated users from protected routes
	if (isProtectedRoute && !session) {
		const signInUrl = new URL("/sign-in", request.url);
		signInUrl.searchParams.set("callbackUrl", pathname);
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
