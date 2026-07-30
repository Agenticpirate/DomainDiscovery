import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/components/layout/LegalDocumentPage';
import {ADA_BRAND, adaPath} from '@/lib/adaConfig';
import {
  ADA_CONTACT,
  LEGAL_EFFECTIVE,
  LEGAL_LAST_UPDATED,
  adaPrivacySections,
} from '@/lib/legal/adaLegal';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy Policy for ${ADA_BRAND.name}: chat, MCP tools, local shortlists, U.S. privacy rights, and research-only processing.`,
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

export default function AdaPrivacyPage() {
  return (
    <LegalDocumentPage
      bare
      brandName={ADA_CONTACT.brand}
      title="Privacy Policy"
      description={`How ${ADA_BRAND.name} handles briefs, chat, agent API traffic, browser storage, and U.S. privacy rights. Research only—we do not process domain registration payments.`}
      lastUpdated={LEGAL_LAST_UPDATED}
      effectiveDate={LEGAL_EFFECTIVE}
      contactEmail={ADA_CONTACT.support}
      sections={adaPrivacySections}
      relatedLinks={[
        { label: 'Terms of Use', href: adaPath('/terms') },
        { label: 'Cookie Policy', href: adaPath('/cookies') },
        { label: 'Disclaimer', href: adaPath('/disclaimer') },
        { label: 'DomainDiscovery Privacy', href: '/privacy' },
      ]}
      cta={{ href: adaPath('/'), label: 'Back to ADA Home' }}
    />
  );
}
