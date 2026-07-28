import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/components/layout/LegalDocumentPage';
import {
  DD_CONTACT,
  LEGAL_EFFECTIVE,
  LEGAL_LAST_UPDATED,
  ddPrivacySections,
} from '@/lib/legal/domainDiscoveryLegal';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'DomainDiscovery Privacy Policy: how we handle browser storage, search data, third-party registrars, U.S. privacy rights (including CCPA/CPRA), and COPPA.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      brandName={DD_CONTACT.brand}
      title="Privacy Policy"
      description="How DomainDiscovery collects, uses, and protects information for free domain name search and research tools. Written for U.S. users, including California privacy rights."
      lastUpdated={LEGAL_LAST_UPDATED}
      effectiveDate={LEGAL_EFFECTIVE}
      contactEmail={DD_CONTACT.support}
      sections={ddPrivacySections}
      relatedLinks={[
        { label: 'Terms of Use', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'Disclaimer', href: '/disclaimer' },
        { label: 'Contact', href: '/contact' },
      ]}
      cta={{ href: '/', label: 'Back to Search' }}
    />
  );
}
