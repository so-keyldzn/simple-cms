import { Metadata } from "next";
import { getSiteSettings } from "./seo";

// Configuration par défaut pour les layouts synchrones
export const siteConfig = {
  name: "simple cms",
  description: "Blog et système de gestion de contenu moderne",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og-image.jpg",
  links: {
    twitter: "https://twitter.com/haezclub",
  },
};

export async function generateMetadata({
  title,
  description,
  image,
  path = "",
  noIndex = false,
}: {
  title: string;
  description?: string;
  image?: string;
  path?: string;
  noIndex?: boolean;
}): Promise<Metadata> {
  try {
    const settings = await getSiteSettings();
    const url = `${settings.siteUrl}${path}`;
    const ogImage = image ? `${settings.siteUrl}${image}` : `${settings.siteUrl}${settings.ogImage}`;
    const metaDescription = description || settings.siteDescription;

    return {
      title,
      description: metaDescription,
      keywords: settings.keywords,
      robots: noIndex ? "noindex,nofollow" : "index,follow",
      openGraph: {
        title,
        description: metaDescription,
        url,
        siteName: settings.siteName,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: "fr_FR",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: metaDescription,
        images: [ogImage],
        creator: settings.twitterHandle,
      },
      alternates: {
        canonical: url,
      },
    };
  } catch {
    // Fallback metadata if database is unavailable
    return {
      title,
      description: description || siteConfig.description,
      robots: noIndex ? "noindex,nofollow" : "index,follow",
    };
  }
}

export async function generateArticleMetadata({
  title,
  description,
  image,
  path,
  publishedAt,
  modifiedAt,
  authors,
  tags,
}: {
  title: string;
  description?: string;
  image?: string;
  path: string;
  publishedAt?: Date;
  modifiedAt?: Date;
  authors?: string[];
  tags?: string[];
}): Promise<Metadata> {
  try {
    const settings = await getSiteSettings();
    const url = `${settings.siteUrl}${path}`;
    const ogImage = image || `${settings.siteUrl}${settings.ogImage}`;
    const metaDescription = description || settings.siteDescription;

    return {
      title,
      description: metaDescription,
      authors: authors?.map(name => ({ name })),
      keywords: tags || settings.keywords,
      openGraph: {
        title,
        description: metaDescription,
        url,
        siteName: settings.siteName,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: "fr_FR",
        type: "article",
        publishedTime: publishedAt?.toISOString(),
        modifiedTime: modifiedAt?.toISOString(),
        authors: authors,
        tags,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: metaDescription,
        images: [ogImage],
        creator: settings.twitterHandle,
      },
      alternates: {
        canonical: url,
      },
    };
  } catch {
    // Fallback metadata if database is unavailable
    return {
      title,
      description: description || siteConfig.description,
      authors: authors?.map(name => ({ name })),
      keywords: tags,
    };
  }
}
