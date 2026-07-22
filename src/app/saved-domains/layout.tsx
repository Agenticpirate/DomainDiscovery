import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Domains — Local Shortlist',
  description:
    'View domains you saved on this device while researching with DomainDiscovery. Shortlists stay local in your browser by default.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function SavedDomainsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
