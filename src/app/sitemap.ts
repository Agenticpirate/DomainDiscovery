import { MetadataRoute } from 'next';
import { getTldAboutSlugs } from '@/lib/tldAboutData';
import { getLearnSlugs } from '@/lib/learnArticles';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteBaseUrl();
  const lastModified = new Date();

  /** Only routes that resolve to real pages (no 404s). */
  const coreRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/search', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/domain-extensions', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/assistant', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/ada', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/ada/docs', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/ada/docs/industry', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/ada/docs/registrars', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/ada/agent-card', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/ada/app', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/ada/chat', priority: 0.88, changeFrequency: 'weekly' as const },
    { path: '/generator', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/bulk-search', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/tools/keyword', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/tools/compare', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/tools/geo', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/tools/whois', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/learn', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/blog/tlds', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/faq', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.65, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/cookies', priority: 0.35, changeFrequency: 'yearly' as const },
    { path: '/disclaimer', priority: 0.35, changeFrequency: 'yearly' as const },
    { path: '/ada/privacy', priority: 0.35, changeFrequency: 'yearly' as const },
    { path: '/ada/terms', priority: 0.35, changeFrequency: 'yearly' as const },
    { path: '/ada/cookies', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/ada/disclaimer', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/saved-domains', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/premium', priority: 0.55, changeFrequency: 'weekly' as const },
    { path: '/expired', priority: 0.55, changeFrequency: 'weekly' as const },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  const learnRoutes = getLearnSlugs().map((slug) => ({
    url: `${baseUrl}/learn/${slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const tldAboutRoutes = getTldAboutSlugs().map((slug) => ({
    url: `${baseUrl}/blog/tlds/${slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }));

  return [...coreRoutes, ...learnRoutes, ...tldAboutRoutes];
}
