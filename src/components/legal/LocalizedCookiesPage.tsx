'use client';

import { LegalDocumentPage } from '@/components/layout/LegalDocumentPage';
import { useLocale } from '@/components/i18n/LocaleProvider';
import {
  DD_CONTACT,
  LEGAL_EFFECTIVE,
  LEGAL_LAST_UPDATED,
  ddCookieSections,
} from '@/lib/legal/domainDiscoveryLegal';
import { legalChrome } from '@/lib/i18n/legal/disclaimer';
import { getCookieCopy } from '@/lib/i18n/legal/cookies';

export function LocalizedCookiesPage() {
  const { locale } = useLocale();
  const copy = getCookieCopy(locale);
  const chrome = legalChrome(locale);

  if (!copy || !chrome) {
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
        { label: chrome.privacy, href: '/privacy' },
        { label: chrome.terms, href: '/terms' },
        { label: chrome.disclaimer, href: '/disclaimer' },
      ]}
      cta={{ href: '/privacy', label: copy.cta }}
    />
  );
}
