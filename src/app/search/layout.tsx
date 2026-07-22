import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Domain Availability Checker — Instant Domain Search',
  description:
    'Instant domain availability checker across popular TLDs. Type a name, see live free or taken results, and explore brandable alternatives.',
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
