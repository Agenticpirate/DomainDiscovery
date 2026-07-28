import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Domain Extensions (TLDs) — Browse 1,600+ Options',
  description:
    'Browse 1,600+ domain extensions and TLDs — from .com and .ai to country codes. Find the right extension, then check availability.',
  alternates: { canonical: '/domain-extensions' },
  openGraph: {
    title: 'Domain Extensions (TLDs) — Browse 1,600+ Options',
    description:
      'Browse 1,600+ domain extensions and TLDs — from .com and .ai to country codes. Find the right extension, then check availability.',
    url: '/domain-extensions',
  },
};

export default function DomainExtensionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
