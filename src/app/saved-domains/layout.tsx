import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Domains — Local Folders & Shortlist',
  description:
    'Organize domains into custom folders on this device. Shortlists stay in your browser only — download a CSV backup; we do not store them on our servers.',
  alternates: { canonical: '/saved-domains' },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SavedDomainsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
