import type { Metadata } from 'next';
import { LocalizedPrivacyPage } from '@/components/legal/LocalizedPrivacyPage';
import { getRequestLocale } from '@/lib/i18n/request';
import { getPrivacyCopy } from '@/lib/i18n/legal/privacy';
import { languageAlternates } from '@/lib/i18n/metadata';
import { localeHref } from '@/lib/i18n/locales';
import { aiSummaryOther, markdownAlternateTypes } from '@/lib/md/head';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getPrivacyCopy(locale);
  const path = '/privacy';
  const description = copy?.metaDescription ?? 'DomainDiscovery Privacy Policy: how we handle browser storage, search data, third-party registrars, U.S. privacy rights (including CCPA/CPRA), and COPPA.';
  return {
    title: copy?.title ?? 'Privacy Policy',
    description,
    alternates: {
      canonical: localeHref(locale, path),
      languages: languageAlternates(path),
      ...(locale === 'en' ? markdownAlternateTypes(getSiteBaseUrl(), path) : {}),
    },
    other: aiSummaryOther(description),
    robots: { index: true, follow: true },
  };
}

export default function PrivacyPage() {
  return <LocalizedPrivacyPage />;
}
