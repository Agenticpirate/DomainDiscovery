import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Keyword Domain Finder — Brandable Names from Keywords',
  description:
    'Expand a keyword into brandable domain ideas with live availability. Free keyword domain finder for startups and marketers.',
  alternates: { canonical: '/tools/keyword' },
  openGraph: {
    title: 'Keyword Domain Finder — Brandable Names from Keywords',
    description:
      'Expand a keyword into brandable domain ideas with live availability. Free keyword domain finder for startups and marketers.',
    url: '/tools/keyword',
  },
};

export default function KeywordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
