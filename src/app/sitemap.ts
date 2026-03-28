import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://domainsdiscovery.com';
  const lastModified = new Date();

  const coreRoutes = [
    '',
    '/search',
    '/domain-extensions',
    '/generator',
    '/bulk-search',
    '/tools/brandable',
    '/tools/keyword',
    '/tools/compare',
    '/tools/geo',
    '/learn',
    '/learn/choosing-domain',
    '/learn/domain-extensions',
    '/learn/domain-valuation',
    '/learn/brand-protection',
    '/learn/domain-investing',
    '/learn/dns-guide',
    '/faq',
    '/glossary',
    '/blog',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const ideaRoutes = [
    'tech-startups',
    'coffee-shops',
    'saas-companies',
    'real-estate',
    'marketing-agencies'
  ].map((slug) => ({
    url: `${baseUrl}/ideas/${slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const blogSlugs = [
    'domain-investing-high-value-sales-2026',
    'smile-and-scratch-framework-alexandra-watkins',
    'the-radio-test-brandable-domains',
    'how-expired-domains-concept-works',
    'domain-history-checking-past-reputations',
    'tlds-gtlds-special-characters-extensions',
    'the-psychology-behind-domain-length',
    'domain-investments-turning-virtual-real-estate-into-roi',
    'how-startups-use-alternative-tlds',
    'why-exact-match-domains-are-losing',
    'ultimate-guide-finding-brandable-domains',
    'understanding-dns-records-a-cname-mx-txt',
    'how-the-domain-name-system-dns-works',
    'how-to-update-dns-records-top-registrars',
    'top-5-domain-registrars-compared-2026',
    'top-domain-communities-to-learn-investing',
    'ultimate-tools-dnjournal-namebio-dotdb'
  ];

  const blogRoutesParams = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...coreRoutes, ...ideaRoutes, ...blogRoutesParams];
}
