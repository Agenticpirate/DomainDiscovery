import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expired Domains Research — Lifecycle Guide',
  description:
    'Understand domain expiration stages (grace, redemption, pending delete) and research expired domain opportunities. DomainDiscovery is research-only — not a drop-catcher.',
  alternates: { canonical: '/expired' },
  openGraph: {
    title: 'Expired Domains Research — Lifecycle Guide',
    description:
      'Understand domain expiration stages (grace, redemption, pending delete) and research expired domain opportunities.',
    url: '/expired',
  },
};

export default function ExpiredLayout({ children }: { children: React.ReactNode }) {
  return children;
}
