import type { Metadata } from 'next';
import { LocalizedTermsPage } from '@/components/legal/LocalizedTermsPage';
import { getRequestLocale } from '@/lib/i18n/request';
import { getTermsCopy } from '@/lib/i18n/legal/terms';
import { languageAlternates } from '@/lib/i18n/metadata';
import { localeHref } from '@/lib/i18n/locales';
import { aiSummaryOther, markdownAlternateTypes } from '@/lib/md/head';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getTermsCopy(locale);
  const path = '/terms';
  const description = copy?.metaDescription ?? 'DomainDiscovery Terms of Use: acceptable use, research-only disclaimers, third-party registrars, DMCA, liability limits, and U.S. governing law.';
  return {
    title: copy?.title ?? 'Terms of Use',
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

export default function TermsPage() {
  return <LocalizedTermsPage />;
}
