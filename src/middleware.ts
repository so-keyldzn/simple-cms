import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import { ROLES, hasRole, hasPermission } from "@/lib/roles";

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

	// Skip middleware for API routes (already handled by matcher, but double-check)
	if (pathname.startsWith("/api")) {
		return NextResponse.next();
	}

	// Define route types
	const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
	const isAdminRoute = pathname.startsWith("/admin");
	const isDashboardRoute = pathname.startsWith("/dashboard");
	const isProtectedRoute = isDashboardRoute ||
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

	// Check admin access with granular permissions
	if (isAdminRoute) {
		if (!session) {
			const signInUrl = new URL("/sign-in", request.url);
			signInUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(signInUrl);
		}

		const userRole = session.user.role;

		// Route-specific permission checks
		if (pathname.startsWith("/admin/users")) {
			if (!hasPermission(userRole, "canManageUsers")) {
				return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
			}
		} else if (pathname.startsWith("/admin/posts")) {
			if (!hasPermission(userRole, "canManagePosts") && !hasPermission(userRole, "canEditAnyPost")) {
				return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
			}
		} else if (pathname.startsWith("/admin/categories")) {
			if (!hasPermission(userRole, "canManageCategories")) {
				return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
			}
		} else if (pathname.startsWith("/admin/tags")) {
			if (!hasPermission(userRole, "canManageTags")) {
				return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
			}
		} else if (pathname.startsWith("/admin/comments")) {
			if (!hasPermission(userRole, "canManageComments")) {
				return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
			}
		} else if (pathname.startsWith("/admin/appearance")) {
			if (!hasPermission(userRole, "canManageAppearance")) {
				return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
			}
		} else if (pathname.startsWith("/admin/settings")) {
			if (!hasPermission(userRole, "canManageSettings")) {
				return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
			}
		} else if (pathname.startsWith("/admin/analytics")) {
			if (!hasPermission(userRole, "canViewAnalytics")) {
				return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
			}
		} else {
			// For /admin root or other admin routes, require at least admin role
			const isAdmin = hasRole(userRole, [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR]);
			if (!isAdmin) {
				return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
			}
		}
	}

	// Check dashboard access - require at least USER role
	if (isDashboardRoute) {
		if (!session) {
			const signInUrl = new URL("/sign-in", request.url);
			signInUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(signInUrl);
		}

		const userRole = session.user.role;
		const hasAccess = hasRole(userRole, [
			ROLES.SUPER_ADMIN,
			ROLES.ADMIN,
			ROLES.EDITOR,
			ROLES.AUTHOR,
			ROLES.MODERATOR,
			ROLES.USER
		]);

		if (!hasAccess) {
			return NextResponse.redirect(new URL("/sign-in?error=insufficient-role", request.url));
		}
	}

	// Redirect unauthenticated users from other protected routes
	if (isProtectedRoute && !isDashboardRoute && !session) {
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
