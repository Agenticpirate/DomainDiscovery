import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/components/layout/LegalDocumentPage';
import { ADA_BRAND } from '@/lib/adaConfig';
import {
  ADA_CONTACT,
  LEGAL_EFFECTIVE,
  LEGAL_LAST_UPDATED,
  adaTermsSections,
} from '@/lib/legal/adaLegal';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: `Terms of Use for ${ADA_BRAND.name}: agent access, research-only use, budget flags, acceptable use, and liability limits.`,
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
};

export default function AdaTermsPage() {
  return (
    <LegalDocumentPage
      bare
      brandName={ADA_CONTACT.brand}
      title="Terms of Use"
      description={`Rules for using ${ADA_BRAND.name} chat, MCP/REST tools, and shortlists. Not a registrar; humans confirm registration.`}
      lastUpdated={LEGAL_LAST_UPDATED}
      effectiveDate={LEGAL_EFFECTIVE}
      contactEmail={ADA_CONTACT.support}
      sections={adaTermsSections}
      relatedLinks={[
        { label: 'Privacy Policy', href: '/ada/privacy' },
        { label: 'Cookie Policy', href: '/ada/cookies' },
        { label: 'Disclaimer', href: '/ada/disclaimer' },
        { label: 'DomainDiscovery Terms', href: '/terms' },
      ]}
      cta={{ href: '/ada', label: 'Back to ADA Home' }}
    />
  );
}
