import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WHOIS Lookup — Free RDAP Domain Ownership Check',
  description:
    'Free WHOIS / RDAP lookup: registration dates, registrar, name servers, and ownership signals. Research domains before you buy or brand.',
};

export default function WhoisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
