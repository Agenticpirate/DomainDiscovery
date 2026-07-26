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
    id: 'registrar-reviews',
    title: 'Registrar reviews & comparisons',
    description: '2026 registrar pricing, renewals, privacy, and head-to-head comparisons.',
    hubSlug: 'best-domain-registrar-in-2026-10-options-ranked-and-reviewed',
    slugs: [
      'best-domain-registrar-in-2026-10-options-ranked-and-reviewed',
      'namecheap-vs-godaddy-2026-which-registrar-is-actually-cheaper',
      'porkbun-review-2026-is-it-the-best-cheap-domain-registrar',
      'godaddy-alternatives-in-2026-8-better-and-cheaper-options',
      'namecheap-review-2026-pros-cons-and-hidden-fees',
      'cloudflare-registrar-review-the-cheapest-domain-option',
      'dynadot-vs-namecheap-which-is-better-for-bulk-domains',
      'godaddy-review-2026-still-worth-it-or-time-to-switch',
      'cheapest-com-domain-registrar-in-2026-price-comparison',
      'best-domain-registrar-for-beginners-in-2026',
      'cheapest-domain-renewal-prices-in-2026-don-t-get-ripped-off',
      'how-to-transfer-a-domain-name-to-another-registrar-step-by-step',
      'namecheap-vs-google-domains-2026-full-comparison',
      'best-domain-registrar-for-privacy-protection-in-2026',
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

/** Stable anchor id for TOC / in-page links (SSR-safe). */
export function slugifyHeading(heading: string): string {
  return heading
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'section';
}

export type LearnFaqPair = { question: string; answer: string };

/** Detect FAQ-style sections by heading. */
export function isFaqSection(section: LearnSection): boolean {
  return /^faq\b/i.test(section.heading.trim()) || /frequently asked/i.test(section.heading);
}

/**
 * Parse "Q: … A: …" lines (and multi-line bodies) into FAQ pairs for
 * display + FAQPage JSON-LD (LLM/AEO citability).
 */
export function extractFaqPairs(section: LearnSection): LearnFaqPair[] {
  const pairs: LearnFaqPair[] = [];
  const blob = section.body.join('\n');
  // Match Q: ... A: ... (non-greedy until next Q: or end)
  const re = /Q:\s*([\s\S]*?)\s*A:\s*([\s\S]*?)(?=\s*Q:|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(blob)) !== null) {
    const question = m[1].replace(/\s+/g, ' ').trim();
    const answer = m[2].replace(/\s+/g, ' ').trim();
    if (question && answer) pairs.push({ question, answer });
  }
  return pairs;
}

/** First-paragraph definition for AEO/GEO answer-first blocks. */
export function getArticleDefinition(article: LearnArticle): string {
  const first = article.sections[0]?.body?.[0]?.trim();
  if (first && first.length > 40) return first;
  return article.description;
}

/** 3–5 short takeaways pulled from early sections (citable bullets). */
export function getArticleKeyTakeaways(article: LearnArticle, limit = 5): string[] {
  const out: string[] = [];
  for (const section of article.sections) {
    if (isFaqSection(section)) continue;
    for (const para of section.body) {
      const t = para.trim();
      if (t.length < 48 || t.length > 220) continue;
      if (/^Q:/i.test(t)) continue;
      // Prefer decision-oriented sentences
      if (
        /should|always|never|prefer|use |check |test |short|brand|renew|trademark|radio/i.test(t) ||
        out.length < 2
      ) {
        out.push(t);
      }
      if (out.length >= limit) return out;
    }
  }
  if (out.length === 0 && article.description) out.push(article.description);
  return out.slice(0, limit);
}

export function getArticleWordCount(article: LearnArticle): number {
  return articleWordCount(article);
}

/** Unique section anchors (handles duplicate headings). */
export function getArticleToc(
  article: LearnArticle
): { id: string; heading: string; isFaq: boolean }[] {
  const seen = new Map<string, number>();
  return article.sections.map((section) => {
    const base = slugifyHeading(section.heading);
    const n = (seen.get(base) || 0) + 1;
    seen.set(base, n);
    const id = n === 1 ? base : `${base}-${n}`;
    return { id, heading: section.heading, isFaq: isFaqSection(section) };
  });
}
