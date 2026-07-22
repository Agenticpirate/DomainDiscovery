import type { Metadata } from 'next';
import { SimpleContentPage } from '@/components/layout/SimpleContentPage';

export const metadata: Metadata = {
  title: 'Terms of Use — DomainDiscovery',
  description:
    'Terms governing use of DomainDiscovery domain name search, availability tools, WHOIS, and related research features.',
};

export default function TermsPage() {
  return (
    <SimpleContentPage
      title="Terms of Use"
      description="General terms governing access to DomainDiscovery and use of domain search and research tools."
      sections={[
        {
          heading: 'Use of the service',
          body: [
            'The website is provided for lawful domain research, discovery, and registration workflows. You are responsible for how you use availability data, registrar links, and third-party integrations.',
          ],
        },
        {
          heading: 'Third-party services',
          body: [
            'Availability, pricing, WHOIS, and registrar actions may rely on third-party services. Those providers may change pricing, policies, or availability independently of this site.',
          ],
        },
      ]}
      cta={{ href: '/', label: 'Return Home' }}
    />
  );
}
