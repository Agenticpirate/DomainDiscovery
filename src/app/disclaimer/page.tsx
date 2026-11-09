import type { Metadata } from 'next';
import { LocalizedDisclaimerPage } from '@/components/legal/LocalizedDisclaimerPage';
import { getRequestLocale } from '@/lib/i18n/request';
import { disclaimerCopy } from '@/lib/i18n/legal/disclaimer';
import { languageAlternates } from '@/lib/i18n/metadata';
import { localeHref } from '@/lib/i18n/locales';
import { aiSummaryOther, markdownAlternateTypes } from '@/lib/md/head';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = disclaimerCopy(locale);
  const path = '/disclaimer';
  const description = copy?.metaDescription ?? 'DomainDiscovery research disclaimer: not a registrar, no guarantee of availability or pricing, not trademark or legal advice.';
  return {
    title: copy?.title ?? 'Disclaimer',
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

export default function DisclaimerPage() {
  return <LocalizedDisclaimerPage />;
}
