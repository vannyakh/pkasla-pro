import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Phkasla";
const defaultTitle = process.env.NEXT_PUBLIC_DEFAULT_TITLE || "Phkasla";
const defaultDescription =
  process.env.NEXT_PUBLIC_DEFAULT_DESCRIPTION ||
  "A modern web application built with Next.js";

interface MetadataConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile" | "book";
  noIndex?: boolean;
  noFollow?: boolean;
}

export function generateMetadata(config?: MetadataConfig): Metadata {
  const {
    title = defaultTitle,
    description = defaultDescription,
    keywords = [],
    image = `${siteUrl}/og-image.png`,
    url = siteUrl,
    type = "website",
    noIndex = false,
    noFollow = false,
  } = config || {};

  const fullTitle = title.includes(siteName)
    ? title
    : `${title} | ${siteName}`;

  return {
    title: {
      default: fullTitle,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      locale: "en_US",
      url,
      siteName,
      title: fullTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@yourhandle", // Update with your Twitter handle
    },
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
      other: {
        "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION || "",
      },
    },
    category: "technology",
  };
}

// Default metadata for the root layout
export const defaultMetadata = generateMetadata();

