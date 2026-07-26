import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/components/layout/LegalDocumentPage';
import {
  DD_CONTACT,
  LEGAL_EFFECTIVE,
  LEGAL_LAST_UPDATED,
  ddDisclaimerSections,
} from '@/lib/legal/domainDiscoveryLegal';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description:
    'DomainDiscovery research disclaimer: not a registrar, no guarantee of availability or pricing, not trademark or legal advice.',
  robots: { index: true, follow: true },
};

export default function DisclaimerPage() {
  return (
    <LegalDocumentPage
      brandName={DD_CONTACT.brand}
      title="Disclaimer"
      description="Important limits on DomainDiscovery as a free research toolkit—not a registrar and not legal advice."
      lastUpdated={LEGAL_LAST_UPDATED}
      effectiveDate={LEGAL_EFFECTIVE}
      contactEmail={DD_CONTACT.support}
      sections={ddDisclaimerSections}
      relatedLinks={[
        { label: 'Terms of Use', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Cookie Policy', href: '/cookies' },
      ]}
      cta={{ href: '/terms', label: 'Read full Terms' }}
    />
  );
}
