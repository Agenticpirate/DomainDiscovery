import type { Metadata } from 'next';
import { getSiteBaseUrl, SITE_BRAND } from '@/lib/seoSiteFacts';
import { getMessages, getPageCopy } from './index';
import { getRequestLocale } from './request';
import {
  getLocaleMeta,
  INDEXABLE_LOCALE_PATHS,
  LOCALES,
  localeHref,
  type LocaleId,
} from './locales';

export function absoluteLocaleUrl(locale: LocaleId, path: string): string {
  const base = getSiteBaseUrl();
  const href = localeHref(locale, path);
  return href === '/' ? base : `${base}${href}`;
}

/** Full hreflang mesh, including self and x-default. Same helper for HTML and sitemap. */
export function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {
    'x-default': absoluteLocaleUrl('en', path),
  };
  for (const locale of LOCALES) {
    languages[locale.hreflang] = absoluteLocaleUrl(locale.id, path);
  }
  return languages;
}

export async function buildLocalizedToolMetadata(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Promise<Metadata> {
  const locale = await getRequestLocale();
  const meta = getLocaleMeta(locale);
  const copy = locale === 'en' ? null : getPageCopy(locale, opts.path);
  const title = copy?.title ?? opts.title;
  const description = copy?.description ?? opts.description;
  const publicPath = localeHref(locale, opts.path);
  const indexable = (INDEXABLE_LOCALE_PATHS as readonly string[]).includes(opts.path);

  return {
    title,
    description,
    keywords: copy?.keywords ?? opts.keywords,
    alternates: {
      canonical: publicPath,
      ...(indexable ? { languages: languageAlternates(opts.path) } : {}),
    },
    openGraph: {
      type: 'website',
      locale: meta.og,
      alternateLocale: LOCALES.filter((item) => item.id !== locale).map((item) => item.og),
      siteName: SITE_BRAND.name,
      title,
      description,
      url: publicPath,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@domainsdiscovery',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}
