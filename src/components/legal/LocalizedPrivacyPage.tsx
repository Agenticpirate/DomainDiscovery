'use client';

import { LegalDocumentPage } from '@/components/layout/LegalDocumentPage';
import { useLocale } from '@/components/i18n/LocaleProvider';
import {
  DD_CONTACT,
  LEGAL_EFFECTIVE,
  LEGAL_LAST_UPDATED,
  ddPrivacySections,
} from '@/lib/legal/domainDiscoveryLegal';
import { legalChrome } from '@/lib/i18n/legal/disclaimer';
import { getPrivacyCopy } from '@/lib/i18n/legal/privacy';

export function LocalizedPrivacyPage() {
  const { locale } = useLocale();
  const copy = getPrivacyCopy(locale);
  const chrome = legalChrome(locale);

  if (!copy || !chrome) {
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
        { label: chrome.cookies, href: '/cookies' },
        { label: chrome.disclaimer, href: '/disclaimer' },
        { label: chrome.contact, href: '/contact' },
      ]}
      cta={{ href: '/', label: copy.cta }}
    />
  );
}
