import { prisma } from "@/lib/prisma";

export type SiteSettings = {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  ogImage: string;
  twitterHandle: string;
  keywords: string[];
};

// Validate URL or return default
function getValidUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!envUrl || envUrl === "https://" || envUrl === "http://") {
    return "http://localhost:3000";
  }
  try {
    new URL(envUrl);
    return envUrl;
  } catch {
    return "http://localhost:3000";
  }
}

const defaultSettings: SiteSettings = {
  siteName: "simple cms",
  siteDescription: "Blog et système de gestion de contenu moderne",
  siteUrl: getValidUrl(),
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
  } catch {
    // Database not available (e.g., during build) - use defaults
    return defaultSettings;
  }
}
