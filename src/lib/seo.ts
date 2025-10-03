import { prisma } from "@/lib/prisma";

export type SiteSettings = {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  ogImage: string;
  twitterHandle: string;
  keywords: string[];
};

const defaultSettings: SiteSettings = {
  siteName: "simple cms",
  siteDescription: "Blog et système de gestion de contenu moderne",
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og-image.jpg",
  twitterHandle: "@haezclub",
  keywords: ["blog", "cms", "next.js"],
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        category: "seo",
        key: {
          in: [
            "site_name",
            "site_description",
            "site_url",
            "og_image",
            "twitter_handle",
            "keywords",
          ],
        },
      },
    });

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      siteName: settingsMap.site_name || defaultSettings.siteName,
      siteDescription: settingsMap.site_description || defaultSettings.siteDescription,
      siteUrl: settingsMap.site_url || defaultSettings.siteUrl,
      ogImage: settingsMap.og_image || defaultSettings.ogImage,
      twitterHandle: settingsMap.twitter_handle || defaultSettings.twitterHandle,
      keywords: settingsMap.keywords
        ? JSON.parse(settingsMap.keywords)
        : defaultSettings.keywords,
    };
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return defaultSettings;
  }
}
