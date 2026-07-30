import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { AffiliateInterstitial } from "@/components/ads/AffiliateInterstitial";
import { AffiliateSkyscraper } from "@/components/ads/AffiliateSkyscraper";
import {
  getOrganizationJsonLd,
  getSiteBaseUrl,
  getSoftwareApplicationJsonLd,
  getWebSiteJsonLd,
  ICON_CACHE_BUST,
  SITE_BRAND,
} from "@/lib/seoSiteFacts";

const V = ICON_CACHE_BUST;

export const metadata: Metadata = {
  title: {
    default: "Domain Name Search — Free Instant Availability | DomainDiscovery",
    template: "%s | DomainDiscovery",
  },
  description:
    "Free domain name search with live availability across 1,600+ TLDs. AI domain generator, bulk checker, geo domains, WHOIS lookup, and registrar price comparison — no account required.",
  applicationName: SITE_BRAND.name,
  category: "technology",
  keywords: [
    "domain name search",
    "domain availability checker",
    "instant domain search",
    "check domain availability",
    "AI domain generator",
    "domain name generator",
    "bulk domain search",
    "geo domain generator",
    "WHOIS lookup",
    "domain price comparison",
    "domain extensions",
    "TLD search",
    "brandable domain names",
    "keyword domain finder",
    "domain valuation",
    "local SEO domains",
    "register domain",
  ],
  authors: [{ name: SITE_BRAND.name }],
  creator: SITE_BRAND.name,
  publisher: SITE_BRAND.name,
  metadataBase: new URL(getSiteBaseUrl()),
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_BRAND.name,
    title: "Domain Name Search — Free Instant Availability | DomainDiscovery",
    description:
      "Check domain availability across 1,600+ extensions. Free AI generator, bulk search, geo domains, WHOIS, and price compare.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Domain Name Search — Free Instant Availability | DomainDiscovery",
    description:
      "Check domain availability across 1,600+ extensions. Free AI generator, bulk search, geo domains, WHOIS, and price compare.",
    creator: "@domainsdiscovery",
  },
  // Chrome / Android tab + PWA chrome
  other: {
    "theme-color": "#0a0a0a",
    "msapplication-TileColor": "#0a0a0a",
    "msapplication-TileImage": `/icon-192.png?v=${V}`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Homepage-only default canonical. Child routes MUST set their own
  // alternates.canonical — otherwise Google consolidates them to "/".
  alternates: {
    canonical: "/",
    types: {
      // Machine-readable product indexes for assistants (not a Google ranking lever)
      "text/plain": [
        { url: "/llms.txt", title: "llms.txt" },
        { url: "/llms-full.txt", title: "llms-full.txt" },
      ],
    },
  },
  // Google Search Console meta verification (Phase F). Set in production env only.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  manifest: `/site.webmanifest?v=${V}`,
  // Google SERP favicon: multiples of 48px (48 / 96) as first PNG entries.
  // Solid #0a0a0a plate so the white D mark matches logo on light SERP backgrounds.
  // Cache-bust (?v=) forces Google / Bing / Yandex to re-fetch after brand updates.
  icons: {
    icon: [
      // Google / Chromium prefer these for SERP + tab when present
      { url: `/icon-48.png?v=${V}`, sizes: "48x48", type: "image/png" },
      { url: `/icon-96.png?v=${V}`, sizes: "96x96", type: "image/png" },
      { url: `/favicon-48.png?v=${V}`, sizes: "48x48", type: "image/png" },
      { url: `/favicon-96.png?v=${V}`, sizes: "96x96", type: "image/png" },
      { url: `/icon-192.png?v=${V}`, sizes: "192x192", type: "image/png" },
      { url: `/icon-512.png?v=${V}`, sizes: "512x512", type: "image/png" },
      { url: `/icon-32.png?v=${V}`, sizes: "32x32", type: "image/png" },
      { url: `/icon-16.png?v=${V}`, sizes: "16x16", type: "image/png" },
      { url: `/favicon.ico?v=${V}`, sizes: "any" },
      { url: `/favicon.svg?v=${V}`, type: "image/svg+xml" },
    ],
    apple: [
      { url: `/apple-touch-icon.png?v=${V}`, sizes: "180x180", type: "image/png" },
    ],
    shortcut: [{ url: `/icon-96.png?v=${V}`, type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Temporary Impact.com site verification — remove after verified */}
        <meta
          name="impact-site-verification"
          content="94371be8-1bcb-4f36-b961-098e0c4eee46"
          // Impact's snippet uses `value`; include both so crawlers that expect either pass
          {...{ value: "94371be8-1bcb-4f36-b961-098e0c4eee46" }}
        />
      </head>
      <body className="min-h-screen w-full max-w-full font-sans antialiased overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getWebSiteJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getSoftwareApplicationJsonLd()),
          }}
        />
        <ThemeProvider>
          <ToastProvider>
            <ScrollToTop />
            {children}
            {/* Desktop sticky Spacemail 160×600 skyscraper */}
            <AffiliateSkyscraper />
            {/* Engaged-time Spaceship interstitial (5 min visible → non-skippable 60s / click) */}
            <AffiliateInterstitial />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
