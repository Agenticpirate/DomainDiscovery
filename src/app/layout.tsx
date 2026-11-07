import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { DeferredSiteAds } from "@/components/ads/DeferredSiteAds";
import { RouteProgress } from "@/components/ui/motion/RouteProgress";
import {
  getLlmDatasetJsonLd,
  getOrganizationJsonLd,
  getSearchEngineVerification,
  getSiteBaseUrl,
  getSiteToolsItemListJsonLd,
  getSoftwareApplicationJsonLd,
  getWebSiteJsonLd,
  ICON_CACHE_BUST,
  SITE_BRAND,
} from "@/lib/seoSiteFacts";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { getMessages, getPageCopy } from "@/lib/i18n";
import { languageAlternates } from "@/lib/i18n/metadata";
import { getLocaleMeta, localeHref, LOCALES } from "@/lib/i18n/locales";
import { getRequestLocale, getRequestPath } from "@/lib/i18n/request";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

const V = ICON_CACHE_BUST;
const baseUrl = getSiteBaseUrl();

const baseMetadata: Metadata = {
  title: {
    default: "Domain Name Search — Free Instant Availability | DomainDiscovery",
    template: "%s | DomainDiscovery",
  },
  description:
    "Free domain name search across 1,600+ TLDs with live availability. AI name generator, bulk checker, WHOIS lookup, and registrar price comparison. No signup.",
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
  metadataBase: new URL(baseUrl),
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
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "DomainDiscovery — free domain name search",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Domain Name Search — Free Instant Availability | DomainDiscovery",
    description:
      "Check domain availability across 1,600+ extensions. Free AI generator, bulk search, geo domains, WHOIS, and price compare.",
    creator: "@domainsdiscovery",
    images: ["/twitter-image"],
  },
  // Chrome / Android / Bing tile chrome
  other: {
    "theme-color": "#0a0a0a",
    "msapplication-TileColor": "#0a0a0a",
    "msapplication-TileImage": `/icon-192.png?v=${V}`,
    "msapplication-config": "/browserconfig.xml",
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
  // Canonical and hreflang are set in generateMetadata, and only on the homepage.
  // Child routes set their own canonical so this layout cannot consolidate them to "/".
  // Multi-engine webmaster verification (env-only; see getSearchEngineVerification)
  verification: getSearchEngineVerification(),
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const path = await getRequestPath();
  const meta = getLocaleMeta(locale);
  if (path !== "/") return baseMetadata;
  const home = getPageCopy(locale, "/");
  const title = home?.title;
  const description = home?.description;
  return {
    ...baseMetadata,
    title: title ? { default: title, template: "%s | DomainDiscovery" } : baseMetadata.title,
    description,
    keywords: home?.keywords,
    alternates: {
      canonical: localeHref(locale, "/"),
      languages: languageAlternates("/"),
    },
    openGraph: {
      ...baseMetadata.openGraph,
      locale: meta.og,
      alternateLocale: LOCALES.filter((item) => item.id !== locale).map((item) => item.og),
      url: localeHref(locale, "/"),
      title,
      description,
    },
    twitter: {
      ...baseMetadata.twitter,
      title,
      description,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const meta = getLocaleMeta(locale);
  const messages = getMessages(locale);
  const siteJsonLd = getWebSiteJsonLd({
    searchPath: `${localeHref(locale, "/search")}?q={search_term_string}`,
    inLanguage: LOCALES.map((item) => (item.id === "en" ? "en-US" : item.htmlLang)),
  });

  return (
    <html
      lang={meta.htmlLang}
      dir={meta.dir}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        {/* Temporary Impact.com site verification — remove after verified */}
        <meta
          name="impact-site-verification"
          content="94371be8-1bcb-4f36-b961-098e0c4eee46"
          // Impact's snippet uses `value`; include both so crawlers that expect either pass
          {...{ value: "94371be8-1bcb-4f36-b961-098e0c4eee46" }}
        />
        {/* Machine-readable product indexes for assistants (not a Google ranking lever).
            Kept out of metadata.alternates.types: vinext only accepts string URLs there. */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="llms-full.txt" />
      </head>
      <body
        className={`${GeistSans.className} min-h-screen w-full max-w-full font-sans antialiased overflow-x-hidden`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteJsonLd),
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getLlmDatasetJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getSiteToolsItemListJsonLd()),
          }}
        />
        <link
          rel="search"
          type="application/opensearchdescription+xml"
          href="/opensearch.xml"
          title={SITE_BRAND.name}
        />
        <link rel="alternate" type="application/rss+xml" title={`${SITE_BRAND.name} Learn`} href="/feed.xml" />
        <LocaleProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <ToastProvider>
              <RouteProgress />
              <ScrollToTop />
              {children}
              {/* Ads deferred until idle — avoids GTmetrix/PSI "No CPU idle period" */}
              <DeferredSiteAds />
            </ToastProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
