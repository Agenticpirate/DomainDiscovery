import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { AffiliateInterstitial } from "@/components/ads/AffiliateInterstitial";
import {
  getOrganizationJsonLd,
  getSiteBaseUrl,
  getSoftwareApplicationJsonLd,
  getWebSiteJsonLd,
  SITE_BRAND,
} from "@/lib/seoSiteFacts";

export const metadata: Metadata = {
  title: {
    default: "Domain Name Search — Free Instant Availability | DomainDiscovery",
    template: "%s | DomainDiscovery",
  },
  description:
    "Free domain name search with live availability across 1,600+ TLDs. AI domain generator, bulk checker, geo domains, WHOIS lookup, and registrar price comparison — no account required.",
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
  metadataBase: new URL(getSiteBaseUrl()),

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
  manifest: "/site.webmanifest?v=20260728",
  // Google SERP favicon: needs a crawlable icon that is a multiple of 48px.
  // Cache-bust (?v=) forces re-fetch after logo updates.
  icons: {
    icon: [
      { url: "/favicon.ico?v=20260728", sizes: "any" },
      { url: "/favicon.svg?v=20260728", type: "image/svg+xml" },
      { url: "/icon-48.png?v=20260728", sizes: "48x48", type: "image/png" },
      { url: "/icon-96.png?v=20260728", sizes: "96x96", type: "image/png" },
      { url: "/icon-32.png?v=20260728", sizes: "32x32", type: "image/png" },
      { url: "/icon-16.png?v=20260728", sizes: "16x16", type: "image/png" },
      { url: "/icon-192.png?v=20260728", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=20260728", sizes: "180x180", type: "image/png" },
    ],
    other: [{ rel: "mask-icon", url: "/logo-mark.svg?v=20260728", color: "#0a0a0a" }],
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
            {/* Engaged-time Spaceship interstitial (5 min visible → non-skippable 60s / click) */}
            <AffiliateInterstitial />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
