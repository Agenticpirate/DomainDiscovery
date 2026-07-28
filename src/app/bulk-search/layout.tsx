import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bulk Domain Search — Check Up to 1,000 Domains',
  description:
    'Bulk domain availability checker for portfolios and agencies. Paste up to 1,000 names and screen free vs registered in batches.',
  alternates: { canonical: '/bulk-search' },
  openGraph: {
    title: 'Bulk Domain Search — Check Up to 1,000 Domains',
    description:
      'Bulk domain availability checker for portfolios and agencies. Paste up to 1,000 names and screen free vs registered in batches.',
    url: '/bulk-search',
  },
};

export default function BulkSearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
