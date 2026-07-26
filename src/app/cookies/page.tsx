import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/components/layout/LegalDocumentPage';
import {
  DD_CONTACT,
  LEGAL_EFFECTIVE,
  LEGAL_LAST_UPDATED,
  ddCookieSections,
} from '@/lib/legal/domainDiscoveryLegal';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'How DomainDiscovery uses cookies, localStorage, and similar technologies for preferences, shortlists, security, and optional analytics.',
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
  return (
    <LegalDocumentPage
      brandName={DD_CONTACT.brand}
      title="Cookie Policy"
      description="Details on cookies and local browser storage used by DomainDiscovery, and how you can control them."
      lastUpdated={LEGAL_LAST_UPDATED}
      effectiveDate={LEGAL_EFFECTIVE}
      contactEmail={DD_CONTACT.support}
      sections={ddCookieSections}
      relatedLinks={[
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Use', href: '/terms' },
        { label: 'Disclaimer', href: '/disclaimer' },
      ]}
      cta={{ href: '/privacy', label: 'Read Privacy Policy' }}
    />
  );
}
