import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/components/layout/LegalDocumentPage';
import { ADA_BRAND } from '@/lib/adaConfig';
import {
  ADA_CONTACT,
  LEGAL_EFFECTIVE,
  LEGAL_LAST_UPDATED,
  adaCookieSections,
} from '@/lib/legal/adaLegal';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: `Cookie and local storage policy for ${ADA_BRAND.name}.`,
  alternates: { canonical: '/cookies' },
  robots: { index: true, follow: true },
};

export default function AdaCookiesPage() {
  return (
    <LegalDocumentPage
      bare
      brandName={ADA_CONTACT.brand}
      title="Cookie Policy"
      description="How AI Domain Assistant uses cookies and browser storage for preferences, sessions, and shortlists."
      lastUpdated={LEGAL_LAST_UPDATED}
      effectiveDate={LEGAL_EFFECTIVE}
      contactEmail={ADA_CONTACT.support}
      sections={adaCookieSections}
      relatedLinks={[
        { label: 'Privacy Policy', href: '/ada/privacy' },
        { label: 'Terms of Use', href: '/ada/terms' },
        { label: 'Disclaimer', href: '/ada/disclaimer' },
      ]}
      cta={{ href: '/ada/privacy', label: 'Read Privacy Policy' }}
    />
  );
}
