import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/components/layout/LegalDocumentPage';
import { ADA_BRAND } from '@/lib/adaConfig';
import {
  ADA_CONTACT,
  LEGAL_EFFECTIVE,
  LEGAL_LAST_UPDATED,
  adaDisclaimerSections,
} from '@/lib/legal/adaLegal';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: `Research-only disclaimer for ${ADA_BRAND.name}: no auto-registration, no legal advice, verify at registrar.`,
  alternates: { canonical: '/disclaimer' },
  robots: { index: true, follow: true },
};

export default function AdaDisclaimerPage() {
  return (
    <LegalDocumentPage
      bare
      brandName={ADA_CONTACT.brand}
      title="Disclaimer"
      description="Critical limits on AI Domain Assistant as a research product for humans and agents."
      lastUpdated={LEGAL_LAST_UPDATED}
      effectiveDate={LEGAL_EFFECTIVE}
      contactEmail={ADA_CONTACT.support}
      sections={adaDisclaimerSections}
      relatedLinks={[
        { label: 'Terms of Use', href: '/ada/terms' },
        { label: 'Privacy Policy', href: '/ada/privacy' },
        { label: 'Cookie Policy', href: '/ada/cookies' },
      ]}
      cta={{ href: '/ada/terms', label: 'Read full Terms' }}
    />
  );
}
