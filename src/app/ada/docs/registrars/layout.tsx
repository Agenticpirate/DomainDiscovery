import type { Metadata } from 'next';
import { ADA_BRAND } from '@/lib/adaConfig';

export const metadata: Metadata = {
  // short title — ADA layout template appends brand
  title: 'Agent-Ready Domain Registrars',
  description:
    'Which registrars support API automation agents can call: Cloudflare, Porkbun, Namecheap, Dynadot, OpenSRS, GoDaddy Domains API vs ANS. Domain Connect providers and adapter checklist.',
  alternates: { canonical: '/docs/registrars' },
  openGraph: {
    title: `Agent-Ready Domain Registrars | ${ADA_BRAND.name}`,
    description:
      'Registrar capability matrix for AI agent domain registration and DNS automation.',
    url: '/docs/registrars',
  },
};

export default function RegistrarsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
