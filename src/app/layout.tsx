import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: {
    default: "DomainDiscovery — Find Your Perfect Domain in Seconds",
    template: "%s | DomainDiscovery",
  },
  description:
    "Find your perfect domain in seconds. Search 1,600+ extensions with instant availability results. Free AI domain generator, bulk checker, and price comparison.",
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
    "domain extensions",
    "TLD search",
    "find domain names",
    "register domain",
    "domain tools",
    "brandable domain names",
    "keyword domain finder",
    "domain valuation",
    "DNS guide",
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
    title: "DomainDiscovery — Find Your Perfect Domain in Seconds",
    description:
      "Search 1,600+ domain extensions with instant availability results. Free AI generator, bulk checker, and price comparison.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DomainDiscovery — Find Your Perfect Domain in Seconds",
    description:
      "Search 1,600+ domain extensions with instant availability results. Free AI generator, bulk checker, and price comparison.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme bootstrap — runs before first paint to prevent a flash of the
            wrong theme (FOUC). Reads the saved choice, falling back to the OS
            preference, and sets the `.light` class on <html> synchronously so
            the very first painted frame is already in the correct theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}if(t==='light'){document.documentElement.classList.add('light');}document.documentElement.style.colorScheme=t;}catch(e){}})();`,
          }}
        />
      </head>
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
              "description": "Find your perfect domain in seconds. Search 1,600+ extensions with instant availability results.",
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
              "description": "Find your perfect domain in seconds. AI-powered domain search engine with real-time availability across 1,600+ TLD extensions."
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
