import {
  getSiteBaseUrl,
  getBreadcrumbListJsonLd,
  getWebPageJsonLd,
  type BreadcrumbItem,
} from '@/lib/seoSiteFacts';
import { getMessages } from '@/lib/i18n';
import { getLocaleMeta, localeHref, stripLocalePrefix } from '@/lib/i18n/locales';
import { getRequestLocale } from '@/lib/i18n/request';

/**
 * Server-rendered JSON-LD. Prefer this over client injection so Googlebot
 * and non-JS AI crawlers see schema in the initial HTML.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

function localizedCrumbName(path: string | undefined, fallback: string, locale: Awaited<ReturnType<typeof getRequestLocale>>) {
  if (!path) return fallback;
  const bare = stripLocalePrefix(path);
  const messages = getMessages(locale);
  if (bare === '/') return messages.nav.home;
  if (bare === '/search') return messages.crumbs.search;
  if (bare === '/generator') return messages.crumbs.generator;
  if (bare === '/bulk-search') return messages.crumbs.bulk;
  if (bare === '/domain-extensions') return messages.crumbs.extensions;
  if (bare === '/tools/whois') return messages.crumbs.whois;
  if (bare === '/tools/compare') return messages.crumbs.compare;
  if (bare === '/tools/geo') return messages.crumbs.geo;
  if (bare === '/faq') return messages.crumbs.faq;
  if (bare === '/contact') return messages.crumbs.contact;
  return fallback;
}

/** Convenience: WebPage + BreadcrumbList for a tool surface */
export async function ToolPageJsonLd({
  path,
  name,
  description,
  breadcrumbs,
}: {
  path: string;
  name: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
}) {
  const locale = await getRequestLocale();
  const meta = getLocaleMeta(locale);
  const messages = getMessages(locale);
  const pageKey =
    path === '/' ? 'home'
    : path === '/search' ? 'search'
    : path === '/generator' ? 'generator'
    : path === '/bulk-search' ? 'bulk'
    : path === '/domain-extensions' ? 'extensions'
    : path === '/tools/whois' ? 'whois'
    : path === '/tools/compare' ? 'compare'
    : path === '/tools/geo' ? 'geo'
    : path === '/faq' ? 'faq'
    : path === '/contact' ? 'contact'
    : null;
  const copy = locale === 'en' || !pageKey ? null : messages.pages[pageKey];
  const publicPath = localeHref(locale, path);
  const crumbs = breadcrumbs.map((item) => ({
    name: locale === 'en' ? item.name : localizedCrumbName(item.path, item.name, locale),
    path: item.path ? localeHref(locale, item.path) : undefined,
  }));

  return (
    <>
      <JsonLd
        data={getWebPageJsonLd({
          path: publicPath,
          name: copy?.title ?? name,
          description: copy?.description ?? description,
          inLanguage: locale === 'en' ? 'en-US' : meta.htmlLang,
        })}
      />
      <JsonLd data={getBreadcrumbListJsonLd(crumbs)} />
    </>
  );
}

/**
 * FAQPage structured data built from the same localized copy that renders the visible FAQ,
 * so the markup always matches what people see. Server-rendered for crawlers.
 */
export async function FaqPageJsonLd({
  source,
  path,
}: {
  source: 'home' | 'faqPage';
  path: string;
}) {
  const locale = await getRequestLocale();
  const meta = getLocaleMeta(locale);
  const messages = getMessages(locale);
  const items = source === 'home' ? messages.home.faqs : messages.faqPage.items;
  if (!items?.length) return null;
  const base = getSiteBaseUrl();
  const publicPath = localeHref(locale, path);
  const url = publicPath === '/' ? base : `${base}${publicPath}`;

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        url,
        inLanguage: locale === 'en' ? 'en-US' : meta.htmlLang,
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }}
    />
  );
}
