'use client';

import { LegalDocumentPage } from '@/components/layout/LegalDocumentPage';
import { useLocale } from '@/components/i18n/LocaleProvider';
import {
  DD_CONTACT,
  LEGAL_EFFECTIVE,
  LEGAL_LAST_UPDATED,
  ddTermsSections,
} from '@/lib/legal/domainDiscoveryLegal';
import { legalChrome } from '@/lib/i18n/legal/disclaimer';
import { getTermsCopy } from '@/lib/i18n/legal/terms';

export function LocalizedTermsPage() {
  const { locale } = useLocale();
  const copy = getTermsCopy(locale);
  const chrome = legalChrome(locale);

  if (!copy || !chrome) {
    return (
      <LegalDocumentPage
        brandName={DD_CONTACT.brand}
        title="Terms of Use"
        description="Rules for using DomainDiscovery domain search and research tools. We are not a registrar; availability and prices are research snapshots only."
        lastUpdated={LEGAL_LAST_UPDATED}
        effectiveDate={LEGAL_EFFECTIVE}
        contactEmail={DD_CONTACT.support}
        sections={ddTermsSections}
        relatedLinks={[
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Cookie Policy', href: '/cookies' },
          { label: 'Disclaimer', href: '/disclaimer' },
          { label: 'Contact', href: '/contact' },
        ]}
        cta={{ href: '/', label: 'Return Home' }}
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
        { label: chrome.cookies, href: '/cookies' },
        { label: chrome.disclaimer, href: '/disclaimer' },
        { label: chrome.contact, href: '/contact' },
      ]}
      cta={{ href: '/', label: copy.cta }}
    />
  );
}
