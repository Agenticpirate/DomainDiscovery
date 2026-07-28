import type { Metadata } from 'next';
import { SimpleContentPage } from '@/components/layout/SimpleContentPage';
import { DD_CONTACT } from '@/lib/legal/legalMeta';

export const metadata: Metadata = {
  title: 'Contact DomainDiscovery — Support & Partnerships',
  description:
    'Contact DomainDiscovery (Domain Discovery) for product feedback, bug reports, privacy requests, legal notices, and partnership inquiries.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact DomainDiscovery — Support & Partnerships',
    description:
      'Contact DomainDiscovery (Domain Discovery) for product feedback, bug reports, privacy requests, legal notices, and partnership inquiries.',
    url: '/contact',
  },
};

export default function ContactPage() {
  return (
    <SimpleContentPage
      title="Contact"
      description="Get in touch about product feedback, partnerships, bug reports, privacy requests, or legal notices for DomainDiscovery domain name search tools."
      sections={[
        {
          heading: 'Support',
          body: [
            `For all inquiries — product questions, bug reports, privacy requests, DMCA / legal notices, and partnerships — email ${DD_CONTACT.support}.`,
            'If you are reporting a bug, include the page, device, browser, and the exact steps needed to reproduce it.',
            'For privacy requests, put “Privacy Request” in the subject line. For copyright / DMCA notices, put “DMCA Notice” in the subject line.',
          ],
        },
        {
          heading: 'Policies',
          body: [
            'Also see our Privacy Policy, Terms of Use, Cookie Policy, and Disclaimer linked in the site footer.',
          ],
        },
        {
          heading: 'Partnerships',
          body: [
            `If you are a registrar, aftermarket platform, or data provider and want to discuss integrations, email ${DD_CONTACT.support} and include the integration scope and technical contact details.`,
          ],
        },
      ]}
      cta={{ href: '/', label: 'Back to Search' }}
    />
  );
}
