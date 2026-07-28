import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Domain Availability Checker — Instant Domain Search',
  description:
    'Instant domain availability checker across popular TLDs. Type a name, see live free or taken results, and explore brandable alternatives.',
  alternates: { canonical: '/search' },
  openGraph: {
    title: 'Domain Availability Checker — Instant Domain Search',
    description:
      'Instant domain availability checker across popular TLDs. Type a name, see live free or taken results, and explore brandable alternatives.',
    url: '/search',
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
