import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		// Get settings
		const settings = await prisma.setting.findMany({
			where: {
				key: {
					in: [
						"site_name",
						"site_logo",
						"header_signin_text",
						"header_signin_url",
						"header_cta_text",
						"header_cta_url",
					],
				},
			},
		});

		const getSettingValue = (key: string, defaultValue: string = "") => {
			const setting = settings.find((s) => s.key === key);
			return setting?.value || defaultValue;
		};

		// Get main navigation menu
		const menu = await prisma.navigationMenu.findFirst({
			where: {
				name: "main",
				isActive: true,
			},
			include: {
				items: {
					where: { parentId: null },
					orderBy: { order: "asc" },
					include: {
						children: {
							orderBy: { order: "asc" },
						},
					},
				},
			},
		});

		// Transform navigation items to match header format
		const navigationItems =
			menu?.items.map((item) => ({
				title: item.title,
				href: item.href || undefined,
				items:
					item.children && item.children.length > 0
						? item.children.map((child) => ({
								title: child.title,
								href: child.href || undefined,
								description: child.description || undefined,
						  }))
						: undefined,
			})) || [];

		const headerData = {
			logo: {
				text: getSettingValue("site_name", "My Site"),
				href: "/",
				imageUrl: getSettingValue("site_logo") || undefined,
			},
			navigation: {
				items: navigationItems,
			},
			actions: {
				signInText: getSettingValue("header_signin_text", "Sign In"),
				signInHref: getSettingValue("header_signin_url", "/sign-in"),
				getStartedText: getSettingValue("header_cta_text", "Get Started"),
				getStartedHref: getSettingValue("header_cta_url", "/sign-up"),
			},
		};

		return NextResponse.json(headerData);
	} catch (error) {
		console.error("Error fetching header data:", error);
		return NextResponse.json(
			{
				logo: { text: "My Site", href: "/" },
				navigation: { items: [] },
				actions: {
					signInText: "Sign In",
					signInHref: "/sign-in",
					getStartedText: "Get Started",
					getStartedHref: "/sign-up",
				},
			},
			{ status: 500 }
		);
	}
}
