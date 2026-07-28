import type { Metadata } from 'next';
import { SiteFaqPage } from '@/components/sections/SiteFaqPage';

export const metadata: Metadata = {
  title: 'Domain Search FAQ — Availability, Registration & Tools',
  description:
    'FAQ for DomainDiscovery (Domain Discovery): domain name search, availability, registration, geo domains, WHOIS, bulk checks, pricing, and privacy.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Domain Search FAQ — Availability, Registration & Tools',
    description:
      'FAQ for DomainDiscovery (Domain Discovery): domain name search, availability, registration, geo domains, WHOIS, bulk checks, pricing, and privacy.',
    url: '/faq',
  },
};

export default function FAQPage() {
  return <SiteFaqPage />;
}
