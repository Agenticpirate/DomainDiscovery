import { MetadataRoute } from 'next';
import { getTldAboutSlugs } from '@/lib/tldAboutData';
import { getLearnArticles, getLearnTranslatedLocales } from '@/lib/learnArticles';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';
import {
  absoluteLocaleUrl,
  languageAlternates,
  learnArticleUrl,
  learnLanguageAlternates,
} from '@/lib/i18n/metadata';
import { INDEXABLE_LOCALE_PATHS, LOCALES } from '@/lib/i18n/locales';

/**
 * Page sitemap for search engines. HTML pages only.
 *
 * Left out on purpose:
 * - /ada/*: production redirects these to the dedicated ADA domain (308), so listing
 *   them here only produces "Page with redirect" reports. They belong in that site's sitemap.
 * - .txt / .md / .xml files and /learn/md/*: machine-readable mirrors for AI crawlers.
 *   They are linked from llms.txt, not submitted as pages to Google.
 * - /saved-domains: per-visitor page with no public content.
 *
 * lastmod is only set where we know a real date (Learn publish date). A sitemap where every
 * URL claims "modified now" teaches Google to ignore the field.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteBaseUrl();

  const coreRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/search', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/domain-extensions', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/assistant', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/generator', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/bulk-search', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/tools/keyword', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/tools/compare', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/tools/geo', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/tools/whois', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/tools/value', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tools/domain-age', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tools/dns', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/learn', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/blog/tlds', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/faq', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/for-ai', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/contact', priority: 0.65, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/cookies', priority: 0.35, changeFrequency: 'yearly' as const },
    { path: '/disclaimer', priority: 0.35, changeFrequency: 'yearly' as const },
    { path: '/expired', priority: 0.55, changeFrequency: 'weekly' as const },
  ].map(({ path, priority, changeFrequency }) => {
    const bare = path === '' ? '/' : path;
    const indexable = (INDEXABLE_LOCALE_PATHS as readonly string[]).includes(bare);
    return {
      url: `${baseUrl}${path}`,
      changeFrequency,
      priority,
      ...(indexable ? { alternates: { languages: languageAlternates(bare) } } : {}),
    };
  });

  const localizedRoutes = INDEXABLE_LOCALE_PATHS.flatMap((path) => {
    const english = coreRoutes.find((route) => route.url === (path === '/' ? baseUrl : `${baseUrl}${path}`));
    return LOCALES.filter((locale) => locale.id !== 'en').map((locale) => ({
      url: absoluteLocaleUrl(locale.id, path),
      changeFrequency: english?.changeFrequency ?? ('weekly' as const),
      priority: english?.priority ?? 0.8,
      alternates: { languages: languageAlternates(path) },
    }));
  });

  const learnRoutes = getLearnArticles().flatMap((article) => {
    const published = article.publishedAt ? new Date(article.publishedAt) : null;
    const lastModified =
      published && !Number.isNaN(published.getTime()) ? { lastModified: published } : {};
    // Each language with a real translation gets its own URL; hreflang lists exactly those.
    const translatedLocales = getLearnTranslatedLocales(article.slug);
    const alternates = translatedLocales.length
      ? { alternates: { languages: learnLanguageAlternates(article.slug, translatedLocales) } }
      : {};
    const english = {
      url: learnArticleUrl('en', article.slug),
      ...lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      ...alternates,
    };
    const localized = translatedLocales.map((locale) => ({
      url: learnArticleUrl(locale, article.slug),
      ...lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.65,
      ...alternates,
    }));
    return [english, ...localized];
  });

  const tldAboutRoutes = getTldAboutSlugs().map((slug) => ({
    url: `${baseUrl}/blog/tlds/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }));

  return [...coreRoutes, ...localizedRoutes, ...learnRoutes, ...tldAboutRoutes];
}
