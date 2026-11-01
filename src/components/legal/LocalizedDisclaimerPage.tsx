'use client';

import { LegalDocumentPage } from '@/components/layout/LegalDocumentPage';
import { useLocale } from '@/components/i18n/LocaleProvider';
import {
  DD_CONTACT,
  LEGAL_EFFECTIVE,
  LEGAL_LAST_UPDATED,
  ddDisclaimerSections,
} from '@/lib/legal/domainDiscoveryLegal';
import { disclaimerCopy, legalChrome } from '@/lib/i18n/legal/disclaimer';

export function LocalizedDisclaimerPage() {
  const { locale } = useLocale();
  const copy = disclaimerCopy(locale);
  const chrome = legalChrome(locale);

  if (!copy || !chrome) {
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

  return (
    <LegalDocumentPage
      brandName={DD_CONTACT.brand}
      title={copy.title}
      description={copy.description}
      lastUpdated={chrome.date}
      effectiveDate={chrome.date}
      contactEmail={DD_CONTACT.support}
      sections={copy.sections}
      labels={chrome}
      relatedLinks={[
        { label: chrome.terms, href: '/terms' },
        { label: chrome.privacy, href: '/privacy' },
        { label: chrome.cookies, href: '/cookies' },
      ]}
      cta={{ href: '/terms', label: chrome.readTerms }}
    />
  );
}
