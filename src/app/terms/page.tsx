import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/components/layout/LegalDocumentPage';
import {
  DD_CONTACT,
  LEGAL_EFFECTIVE,
  LEGAL_LAST_UPDATED,
  ddTermsSections,
} from '@/lib/legal/domainDiscoveryLegal';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'DomainDiscovery Terms of Use: acceptable use, research-only disclaimers, third-party registrars, DMCA, liability limits, and U.S. governing law.',
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalDocumentPage
      brandName={DD_CONTACT.brand}
      title="Terms of Use"
      description="Rules for using DomainDiscovery domain search and research tools. We are not a registrar; availability and prices are research snapshots only."
      lastUpdated={LEGAL_LAST_UPDATED}
      effectiveDate={LEGAL_EFFECTIVE}
      contactEmail={DD_CONTACT.support}
      sections={ddTermsSections}
      relatedLinks={[
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'Disclaimer', href: '/disclaimer' },
        { label: 'Contact', href: '/contact' },
      ]}
      cta={{ href: '/', label: 'Return Home' }}
    />
  );
}
