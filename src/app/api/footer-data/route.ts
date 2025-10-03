import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		// Get footer settings
		const settings = await prisma.setting.findMany({
			where: {
				key: {
					in: [
						"site_name",
						"site_logo",
						"footer_description",
						"footer_copyright",
						"footer_social_facebook",
						"footer_social_twitter",
						"footer_social_linkedin",
						"footer_social_github",
						"footer_social_instagram",
						"footer_social_youtube",
					],
				},
			},
		});

		const getSettingValue = (key: string, defaultValue: string = "") => {
			const setting = settings.find((s) => s.key === key);
			return setting?.value || defaultValue;
		};

		// Get footer navigation menu
		const menu = await prisma.navigationMenu.findFirst({
			where: {
				name: "footer",
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

		// Transform navigation items to match footer format
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
								isExternal: child.isExternal || false,
						  }))
						: undefined,
			})) || [];

		// Build social links array
		const socialLinks = [];
		const socialPlatforms = ['facebook', 'twitter', 'linkedin', 'github', 'instagram', 'youtube'];

		for (const platform of socialPlatforms) {
			const href = getSettingValue(`footer_social_${platform}`);
			if (href) {
				socialLinks.push({
					name: platform,
					href,
				});
			}
		}

		const footerData = {
			logo: {
				text: getSettingValue("site_name", "My Site"),
				href: "/",
				imageUrl: getSettingValue("site_logo") || undefined,
			},
			description: getSettingValue("footer_description", "Building amazing things together."),
			navigation: {
				items: navigationItems,
			},
			social: socialLinks,
			copyright: getSettingValue("footer_copyright", `© ${new Date().getFullYear()} My Site. All rights reserved.`),
		};

		return NextResponse.json(footerData);
	} catch (error) {
		console.error("Error fetching footer data:", error);
		return NextResponse.json(
			{
				logo: { text: "My Site", href: "/" },
				description: "Building amazing things together.",
				navigation: { items: [] },
				social: [],
				copyright: `© ${new Date().getFullYear()} My Site. All rights reserved.`,
			},
			{ status: 500 }
		);
	}
}
