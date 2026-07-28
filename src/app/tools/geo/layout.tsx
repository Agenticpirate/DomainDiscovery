import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Geo Domain Generator — City & Country Domains for Local SEO',
  description:
    'Free geo domain generator: combine any niche with cities and countries, live-check availability, and export CSV. Built for local SEO and multi-market domain lists.',
  alternates: { canonical: '/tools/geo' },
  openGraph: {
    title: 'Geo Domain Generator — Local SEO Domain Lists',
    description:
      'Generate city and country domain names for local SEO. Live free / premium / registered checks and CSV export.',
    url: '/tools/geo',
  },
};

export default function GeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
