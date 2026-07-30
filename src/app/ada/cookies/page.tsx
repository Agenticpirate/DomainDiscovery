import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/components/layout/LegalDocumentPage';
import {ADA_BRAND, adaPath} from '@/lib/adaConfig';
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
        { label: 'Privacy Policy', href: adaPath('/privacy') },
        { label: 'Terms of Use', href: adaPath('/terms') },
        { label: 'Disclaimer', href: adaPath('/disclaimer') },
      ]}
      cta={{ href: adaPath('/privacy'), label: 'Read Privacy Policy' }}
    />
  );
}
