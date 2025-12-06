import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import { ROLES, hasRole } from "@/lib/roles";
import { hasRouteAccess } from "@/lib/route-permissions";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

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

// Créer le middleware i18n
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	// Skip middleware for API routes (already handled by matcher, but double-check)
	if (pathname.startsWith("/api")) {
		return NextResponse.next();
	}

	// Gérer l'internationalisation d'abord
	const response = intlMiddleware(request);

	// Extraire la locale du pathname
	const pathnameLocale = routing.locales.find(
		(locale) =>
			pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
	);

	// Enlever le préfixe de locale pour vérifier les routes protégées
	const pathnameWithoutLocale = pathnameLocale
		? pathname.slice(`/${pathnameLocale}`.length) || "/"
		: pathname;


	// Define route types (utiliser pathnameWithoutLocale)
	const isAuthPage = pathnameWithoutLocale.startsWith("/sign-in") || pathnameWithoutLocale.startsWith("/sign-up");
	const isAdminRoute = pathnameWithoutLocale.startsWith("/admin");
	const isDashboardRoute = pathnameWithoutLocale.startsWith("/dashboard");
	const isProtectedRoute = isDashboardRoute ||
	                         pathnameWithoutLocale.startsWith("/profile") ||
	                         pathnameWithoutLocale.startsWith("/settings");

	// Check session using Better Auth API
	let session: Session = null;
	try {
		const result = await betterFetch<Session>(
			"/api/auth/get-session",
			{
				baseURL: request.nextUrl.origin,
				headers: {
					cookie: request.headers.get("cookie") || "",
				},
			}
		);
		session = result.data;
	} catch (error) {
		console.error("Error fetching session in middleware:", error);
		// Continue without session - will be treated as unauthenticated
	}

	// Check if user is banned
	if (session?.user?.banned && !isAuthPage) {
		const signInUrl = pathnameLocale ? `/${pathnameLocale}/sign-in` : "/sign-in";
		return NextResponse.redirect(new URL(`${signInUrl}?error=banned`, request.url));
	}

	// Redirect authenticated users away from auth pages
	if (isAuthPage && session) {
		const dashboardUrl = pathnameLocale ? `/${pathnameLocale}/dashboard` : "/dashboard";
		return NextResponse.redirect(new URL(dashboardUrl, request.url));
	}

	// Check admin access with granular permissions
	if (isAdminRoute) {
		if (!session) {
			const signInUrl = new URL(pathnameLocale ? `/${pathnameLocale}/sign-in` : "/sign-in", request.url);
			signInUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(signInUrl);
		}

		const userRole = session.user.role;

		// Vérifier les permissions spécifiques à la route (utiliser pathnameWithoutLocale)
		if (!hasRouteAccess(userRole, pathnameWithoutLocale)) {
			// Si la route n'est pas dans la config (ex: /admin root), vérifier le rôle admin
			if (pathnameWithoutLocale === "/admin" || pathnameWithoutLocale === "/admin/") {
				const isAdmin = hasRole(userRole, [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR]);
				if (!isAdmin) {
					const dashboardUrl = pathnameLocale ? `/${pathnameLocale}/dashboard` : "/dashboard";
					return NextResponse.redirect(new URL(`${dashboardUrl}?error=unauthorized`, request.url));
				}
			} else {
				const dashboardUrl = pathnameLocale ? `/${pathnameLocale}/dashboard` : "/dashboard";
				return NextResponse.redirect(new URL(`${dashboardUrl}?error=unauthorized`, request.url));
			}
		}
	}

	// Check dashboard access - require at least USER role
	if (isDashboardRoute) {
		if (!session) {
			const signInUrl = new URL(pathnameLocale ? `/${pathnameLocale}/sign-in` : "/sign-in", request.url);
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
			const signInUrl = pathnameLocale ? `/${pathnameLocale}/sign-in` : "/sign-in";
			return NextResponse.redirect(new URL(`${signInUrl}?error=insufficient-role`, request.url));
		}
	}

	// Redirect unauthenticated users from other protected routes
	if (isProtectedRoute && !isDashboardRoute && !session) {
		const signInUrl = new URL(pathnameLocale ? `/${pathnameLocale}/sign-in` : "/sign-in", request.url);
		signInUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(signInUrl);
	}

	return response;
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
