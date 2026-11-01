import type { Metadata } from 'next';
import { LocalizedCookiesPage } from '@/components/legal/LocalizedCookiesPage';
import { getRequestLocale } from '@/lib/i18n/request';
import { getCookieCopy } from '@/lib/i18n/legal/cookies';
import { languageAlternates } from '@/lib/i18n/metadata';
import { localeHref } from '@/lib/i18n/locales';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getCookieCopy(locale);
  const path = '/cookies';
  return {
    title: copy?.title ?? 'Cookie Policy',
    description:
      copy?.metaDescription ??
      'How DomainDiscovery uses cookies, localStorage, and similar technologies for preferences, shortlists, security, and optional analytics.',
    alternates: {
      canonical: localeHref(locale, path),
      languages: languageAlternates(path),
    },
    robots: { index: true, follow: true },
  };
}

export default function CookiesPage() {
  return <LocalizedCookiesPage />;
}
