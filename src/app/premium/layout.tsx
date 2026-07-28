import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium Domains — Marketplace Coming Soon',
  description:
    'Premium domain marketplace for DomainDiscovery is coming soon. Meanwhile use free domain search, bulk check, and AI generator to find brandable names.',
  alternates: { canonical: '/premium' },
  openGraph: {
    title: 'Premium Domains — Marketplace Coming Soon',
    description:
      'Premium domain marketplace for DomainDiscovery is coming soon. Meanwhile use free domain search, bulk check, and AI generator to find brandable names.',
    url: '/premium',
  },
};

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
