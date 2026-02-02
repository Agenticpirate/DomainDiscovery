import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/contexts/ThemeContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Domain Name Search: Find Available Domains Instantly | DomainsDiscovery",
    template: "%s | DomainsDiscovery",
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
  authors: [{ name: "DomainsDiscovery" }],
  creator: "DomainsDiscovery",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://domainsdiscovery.com"
  ),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "DomainsDiscovery",
    title: "Domain Name Search: Find Available Domains Instantly",
    description:
      "Domain name search with instant results. Check domain availability as you type with results in milliseconds. Find and buy domains with our AI-powered search tool across 1,600+ extensions.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "DomainsDiscovery - The Fastest Domain Search Tool on the Internet",
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
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
