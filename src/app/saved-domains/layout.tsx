import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Domains — Local Folders & Shortlist',
  description:
    'Organize domains into folders and category tags on this device. A name can carry several categories. Shortlists stay in your browser only.',
  alternates: { canonical: '/saved-domains' },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SavedDomainsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
