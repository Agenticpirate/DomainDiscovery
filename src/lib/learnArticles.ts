import learnData from '@/data/learn-articles.json';

export type LearnSection = {
  heading: string;
  body: string[];
};

export type LearnArticle = {
  slug: string;
  title: string;
  category: string;
  icon: string;
  readTime: string;
  topics: string[];
  description: string;
  trending?: boolean;
  publishedAt?: string;
  sections: LearnSection[];
};

export type LearnClusterHub = {
  id: string;
  title: string;
  description: string;
  /** Primary hub article slug */
  hubSlug: string;
  /** Supporting guides in the cluster */
  slugs: string[];
  /** Product tool CTA */
  toolHref: string;
  toolLabel: string;
};

type LearnFile = {
  generatedAt: string;
  sourceNotes: string[];
  count: number;
  categories: string[];
  articles: LearnArticle[];
};

const data = learnData as LearnFile;

/** Phase D topic clusters — product-aligned hubs for internal linking */
export const LEARN_CLUSTERS: LearnClusterHub[] = [
  {
    id: 'beginner',
    title: 'Beginner domain ownership',
    description: 'Search, register, buy safely, and understand registration basics.',
    hubSlug: 'domains-for-beginners',
    slugs: [
      'domains-for-beginners',
      'domain-name-search-guide',
      'how-to-register-a-domain',
      'how-to-buy-a-domain',
      'domain-registration-explained',
      'safe-domain-purchase-checklist',
      'registry-vs-registrar',
      'what-is-domaindiscovery',
    ],
    toolHref: '/',
    toolLabel: 'Domain search',
  },
  {
    id: 'local-seo',
    title: 'Local SEO, geo & ccTLDs',
    description: 'City patterns, country extensions, and multi-location domain strategy.',
    hubSlug: 'geo-domains-local-seo',
    slugs: [
      'geo-domains-local-seo',
      'cctld-local-seo',
      'local-business-domains',
      'international-seo-domains',
      'what-is-a-tld-domain-extension',
    ],
    toolHref: '/tools/geo',
    toolLabel: 'Geo generator',
  },
  {
    id: 'naming',
    title: 'Brandable naming',
    description: 'Radio test, length, brandable vs keyword, and generator workflows.',
    hubSlug: 'choosing-domain',
    slugs: [
      'choosing-domain',
      'the-radio-test-brandable-domains',
      'brandable-vs-keyword-domains',
      'domain-length-psychology',
      'ai-domain-name-generator-guide',
      'domain-name-generators',
    ],
    toolHref: '/generator',
    toolLabel: 'AI generator',
  },
  {
    id: 'technical',
    title: 'Technical DNS & WHOIS',
    description: 'DNS records, nameservers, email auth, transfers, and RDAP lookups.',
    hubSlug: 'whois-lookup-guide',
    slugs: [
      'whois-lookup-guide',
      'dns-guide',
      'how-dns-works',
      'nameservers-explained',
      'email-authentication-spf-dkim-dmarc',
      'domains-and-seo',
      'transfer-auth-codes',
    ],
    toolHref: '/tools/whois',
    toolLabel: 'WHOIS lookup',
  },
  {
    id: 'tools-pricing',
    title: 'Tools & pricing research',
    description: 'Bulk checks, price comparison, monitoring, and registrar choice.',
    hubSlug: 'bulk-domain-search-guide',
    slugs: [
      'bulk-domain-search-guide',
      'domain-price-comparison-guide',
      'domain-tools-stack',
      'top-domain-registrars-compared',
      'premium-vs-standard-registration',
    ],
    toolHref: '/tools/compare',
    toolLabel: 'Price compare',
  },
  {
    id: 'investing',
    title: 'Investing & aftermarket',
    description: 'Portfolio discipline, auctions, and valuation — secondary to builder topics.',
    hubSlug: 'domain-investing',
    slugs: [
      'domain-investing',
      'domain-valuation',
      'expired-domains-guide',
      'godaddy-auctions-guide',
      'escrow-for-domains',
    ],
    toolHref: '/bulk-search',
    toolLabel: 'Bulk check',
  },
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3);
}

function articleWordCount(article: LearnArticle): number {
  return article.sections
    .flatMap((s) => [s.heading, ...s.body])
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function getLearnArticles(): LearnArticle[] {
  return data.articles;
}

export function getLearnCategories(): string[] {
  return data.categories;
}

export function getLearnMeta() {
  return {
    generatedAt: data.generatedAt,
    count: data.count,
    sourceNotes: data.sourceNotes,
  };
}

export function getLearnArticle(slug: string): LearnArticle | null {
  return data.articles.find((a) => a.slug === slug) ?? null;
}

export function getTrendingArticles(limit = 12): LearnArticle[] {
  const trending = data.articles.filter((a) => a.trending);
  if (trending.length >= limit) return trending.slice(0, limit);
  // Prefer deeper product hubs when trending flags are sparse
  const hubs = LEARN_CLUSTERS.map((c) => c.hubSlug);
  const hubArticles = data.articles.filter((a) => hubs.includes(a.slug));
  const rest = data.articles.filter((a) => !hubs.includes(a.slug));
  return [...trending, ...hubArticles, ...rest].filter(
    (a, i, arr) => arr.findIndex((x) => x.slug === a.slug) === i
  ).slice(0, limit);
}

export function getLearnSlugs(): string[] {
  return data.articles.map((a) => a.slug);
}

/**
 * Keyword-aware related scoring (Phase D).
 * Category match + shared topics + title tokens + depth bonus + same cluster.
 */
export function getRelatedArticles(article: LearnArticle, limit = 4): LearnArticle[] {
  const articleTokens = new Set(
    tokenize(`${article.title} ${article.topics.join(' ')} ${article.description}`)
  );
  const articleClusters = LEARN_CLUSTERS.filter((c) => c.slugs.includes(article.slug)).map(
    (c) => c.id
  );

  return getLearnArticles()
    .filter((a) => a.slug !== article.slug)
    .map((a) => {
      let score = 0;
      if (a.category === article.category) score += 4;
      const sharedTopics = a.topics.filter((t) => article.topics.includes(t)).length;
      score += sharedTopics * 3;
      for (const t of tokenize(`${a.title} ${a.topics.join(' ')}`)) {
        if (articleTokens.has(t)) score += 1;
      }
      const sameCluster = LEARN_CLUSTERS.some(
        (c) => articleClusters.includes(c.id) && c.slugs.includes(a.slug)
      );
      if (sameCluster) score += 5;
      if (LEARN_CLUSTERS.some((c) => c.hubSlug === a.slug)) score += 2;
      if (articleWordCount(a) >= 800) score += 2;
      if (a.trending) score += 1;
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || x.a.title.localeCompare(y.a.title))
    .slice(0, limit)
    .map((x) => x.a);
}

export function getClusterForSlug(slug: string): LearnClusterHub | undefined {
  return LEARN_CLUSTERS.find((c) => c.slugs.includes(slug) || c.hubSlug === slug);
}
