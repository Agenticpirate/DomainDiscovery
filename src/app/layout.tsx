import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
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
  alternates: {
    canonical: getSiteBaseUrl(),
    types: {
      // Machine-readable product indexes for assistants (not a Google ranking lever)
      'text/plain': [
        { url: '/llms.txt', title: 'llms.txt' },
        { url: '/llms-full.txt', title: 'llms-full.txt' },
      ],
    },
  },
  // Google Search Console meta verification (Phase F). Set in production env only.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/logo-mark.svg" }],
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
      <body className="min-h-screen font-sans antialiased overflow-x-hidden">
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
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
