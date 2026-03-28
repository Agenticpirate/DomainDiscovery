import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: {
    default: "Domain Name Search: Find Available Domains Instantly | DomainDiscovery",
    template: "%s | DomainDiscovery",
  },
  description:
    "Domain name search with instant results. Check domain availability as you type across 1,600+ extensions. Find and buy domains with our AI-powered search tool. Free domain generator, bulk checker, WHOIS lookup, and price comparison.",
  keywords: [
    "domain search",
    "domain name search",
    "domain availability checker",
    "instant domain search",
    "domain name generator",
    "AI domain generator",
    "bulk domain search",
    "domain availability",
    "WHOIS lookup",
    "domain price comparison",
    "premium domains",
    "domain extensions",
    "TLD search",
    "find domain names",
    "register domain",
    "domain tools",
  ],
  authors: [{ name: "DomainDiscovery" }],
  creator: "DomainDiscovery",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://domainsdiscovery.com"
  ),

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "DomainDiscovery",
    title: "Domain Name Search: Find Available Domains Instantly",
    description:
      "Domain name search with instant results. Check domain availability as you type with results in milliseconds. Find and buy domains with our AI-powered search tool across 1,600+ extensions.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "DomainDiscovery - The Fastest Domain Search Tool on the Internet",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Domain Name Search: Find Available Domains Instantly",
    description:
      "Domain name search with instant results. Check domain availability as you type across 1,600+ extensions. AI-powered search, bulk checker, and price comparison.",
    images: ["/og-image.svg"],
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
    canonical: process.env.NEXT_PUBLIC_BASE_URL || "https://domainsdiscovery.com",
    languages: {
      'en-US': '/en-US',
    },
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "DomainDiscovery",
              "url": "https://domainsdiscovery.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://domainsdiscovery.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "description": "Domain name search with instant results. Check domain availability as you type across 1,600+ extensions.",
              "publisher": {
                "@type": "Organization",
                "name": "DomainDiscovery",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://domainsdiscovery.com/icon.svg"
                }
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
             __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "DomainDiscovery Search Engine",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "All",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "1248"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": "AI-powered lightning fast domain search engine testing real-time availability across thousands of TLD registrar APIs."
            })
          }}
        />
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
