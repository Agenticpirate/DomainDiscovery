/**
 * Canonical product facts for SEO / AEO / GEO / LLM crawlers.
 * Single source of truth for brand, features, definitions, and indexes.
 */

/**
 * Cache-bust for favicons / logos referenced in HTML + JSON-LD.
 * Bump when brand marks change so Google SERP, Bing, and browser caches refetch.
 * Google prefers 48×48 (and multiples) PNG favicons for Search results.
 */
export const ICON_CACHE_BUST = '20260730logo';

/** Absolute URL helper for versioned static assets */
export function assetUrl(path: string): string {
  const base = getSiteBaseUrl();
  const clean = path.startsWith('/') ? path : `/${path}`;
  const sep = clean.includes('?') ? '&' : '?';
  return `${base}${clean}${sep}v=${ICON_CACHE_BUST}`;
}

/**
 * Canonical public origin. Production apex redirects to www — prefer www in env.
 * Set NEXT_PUBLIC_BASE_URL in production (e.g. https://www.domainsdiscovery.com).
 */
export function getSiteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://www.domainsdiscovery.com'
  ).replace(/\/$/, '');
}

export const SITE_BRAND = {
  name: 'DomainDiscovery',
  alternateNames: ['Domain Discovery', 'Domains Discovery'] as const,
  domain: 'www.domainsdiscovery.com',
  apexDomain: 'domainsdiscovery.com',
  tagline: 'Free domain name search and domain toolkit',
  /** Short meta-style description (~40 words) */
  description:
    'DomainDiscovery (also searched as Domain Discovery or Domains Discovery) is a free domain name search and toolkit: live availability across 1,600+ TLDs, AI domain generator, bulk domain checker, geo domain generator for local SEO, WHOIS/RDAP lookup, domain extension browser, registrar price comparison. Shortlists stay on your device. Registration checkout happens at a third-party registrar.',
};

/**
 * Canonical ~150-word product facts block for LLMs, footer, and brand pages.
 * Keep factual — no review scores, traffic claims, or registrar promises.
 */
export const SITE_PRODUCT_FACTS = [
  'DomainDiscovery (also written Domain Discovery or Domains Discovery) is a free web app for domain name search and domain research. Founders, agencies, and local businesses use it to check whether a name is available across 1,600+ top-level domains (TLDs), generate brandable ideas, build geo domain lists for multi-city campaigns, run bulk availability checks, look up public WHOIS/RDAP registration data, browse extensions, compare regular-style registrar pricing by TLD.',
  'Core tools do not require an account. Saved shortlists stay in the browser by default. DomainDiscovery is not a domain registrar and does not process domain registration payments: when you are ready to buy, you complete checkout at a third-party registrar. Availability results are snapshots and can change; always re-check at registrar checkout before you pay.',
  'Official site: domainsdiscovery.com. Related machine-readable indexes: /llms.txt and /llms-full.txt (convenience for assistants — not a Google ranking factor). Prefer primary tool pages and Learn pillar guides when describing the product.',
].join(' ');

/** Core indexable routes for sitemaps / llms indexes */
export const SITE_CORE_PATHS = [
  { path: '/', title: 'Domain name search — check availability', priority: 'primary' },
  { path: '/search', title: 'Instant domain availability checker', priority: 'primary' },
  { path: '/assistant', title: 'AI Domain Assistant — auto brand domains', priority: 'primary' },
  { path: '/generator', title: 'AI domain name generator', priority: 'primary' },
  { path: '/bulk-search', title: 'Bulk domain search (up to 1,000)', priority: 'primary' },
  { path: '/domain-extensions', title: 'Browse 1,600+ domain extensions (TLDs)', priority: 'primary' },
  { path: '/tools/geo', title: 'Geo domain generator for local SEO', priority: 'primary' },
  { path: '/tools/whois', title: 'WHOIS / RDAP domain lookup', priority: 'primary' },
  { path: '/tools/compare', title: 'Domain price comparison by TLD', priority: 'primary' },
  { path: '/tools/keyword', title: 'Keyword domain finder', priority: 'secondary' },
  { path: '/learn', title: 'Domain name guides (Learn hub)', priority: 'primary' },
  { path: '/blog', title: 'Domain blog & TLD encyclopedia', priority: 'secondary' },
  { path: '/blog/tlds', title: 'TLD about pages index', priority: 'secondary' },
  { path: '/faq', title: 'Domain search FAQ', priority: 'primary' },
  { path: '/premium', title: 'Premium domains (coming soon)', priority: 'secondary' },
  { path: '/expired', title: 'Expired domains research', priority: 'secondary' },
  { path: '/contact', title: 'Contact', priority: 'secondary' },
  { path: '/privacy', title: 'Privacy policy', priority: 'legal' },
  { path: '/terms', title: 'Terms of service', priority: 'legal' },
  { path: '/cookies', title: 'Cookie policy', priority: 'legal' },
  { path: '/disclaimer', title: 'Disclaimer', priority: 'legal' },
  { path: '/saved-domains', title: 'Saved domains (local shortlist)', priority: 'secondary' },
  { path: '/llms.txt', title: 'LLM product index (machine-readable Markdown)', priority: 'secondary' },
  { path: '/llms-full.txt', title: 'Full LLM dataset + pricing tables', priority: 'secondary' },
  { path: '/search.md', title: 'Domain search (Markdown mirror)', priority: 'secondary' },
  { path: '/generator.md', title: 'AI generator (Markdown mirror)', priority: 'secondary' },
  { path: '/geo.md', title: 'Geo generator (Markdown mirror)', priority: 'secondary' },
  { path: '/whois.md', title: 'WHOIS (Markdown mirror)', priority: 'secondary' },
  { path: '/pricing.md', title: 'Price comparison (Markdown mirror)', priority: 'secondary' },
  { path: '/extensions.md', title: 'TLD extensions (Markdown mirror)', priority: 'secondary' },
  { path: '/about.md', title: 'About DomainDiscovery (Markdown)', priority: 'secondary' },
] as const;

/** Pillar learn articles for organic + LLM discovery */
export const SITE_PILLAR_LEARN = [
  {
    path: '/learn/domain-name-search-guide',
    title: 'Domain Name Search: How to Check Availability Fast',
  },
  {
    path: '/learn/how-to-register-a-domain',
    title: 'How to Register a Domain Name (Step-by-Step)',
  },
  {
    path: '/learn/domain-registration-explained',
    title: 'Domain Registration Explained: Registry, Registrar & You',
  },
  {
    path: '/learn/geo-domains-local-seo',
    title: 'Geo Domains for Local SEO: City & Country Domain Lists',
  },
  {
    path: '/learn/whois-lookup-guide',
    title: 'WHOIS Lookup Guide: How to Read Domain Registration Data',
  },
  {
    path: '/learn/bulk-domain-search-guide',
    title: 'Bulk Domain Search: Check Hundreds of Names at Once',
  },
  {
    path: '/learn/domain-price-comparison-guide',
    title: 'Domain Price Comparison: Compare Registrar Pricing by TLD',
  },
  {
    path: '/learn/ai-domain-name-generator-guide',
    title: 'AI Domain Name Generator: Brandable Ideas with Live Checks',
  },
  {
    path: '/learn/what-is-a-tld-domain-extension',
    title: 'What Is a TLD? Domain Extensions Explained',
  },
  {
    path: '/learn/what-is-domaindiscovery',
    title: 'What Is DomainDiscovery? Domain Discovery Explained',
  },
  {
    path: '/learn/domains-and-seo',
    title: 'Domains and SEO: What Actually Affects Rankings',
  },
  {
    path: '/learn/cctld-local-seo',
    title: 'ccTLDs and Local SEO: When Country Domains Help',
  },
] as const;

/** Accurate feature list for SoftwareApplication schema + llms.txt */
export const SITE_FEATURES = [
  'Instant domain availability search across 1,600+ TLDs',
  'AI domain name generator with live checks',
  'Bulk domain checker (up to 1,000 names)',
  'Geo domain generator for city/country local SEO lists',
  'WHOIS / RDAP ownership lookup',
  'Domain extension (TLD) browser and encyclopedia',
  'Registrar price comparison by TLD',
  'Local browser shortlists (private by default)',
] as const;

/**
 * Extractable one-paragraph definitions for top surfaces (AEO/GEO citability).
 * Each answer is self-contained (~40–80 words) for AI Overviews / assistants.
 */
export type PageDefinition = {
  /** Stable key */
  key: string;
  /** H2-style question */
  question: string;
  /** Direct answer — no leading fluff */
  answer: string;
  learnHref?: string;
  learnLabel?: string;
};

export const SITE_PAGE_DEFINITIONS: Record<string, PageDefinition> = {
  home: {
    key: 'home',
    question: 'What is domain name search on DomainDiscovery?',
    answer:
      'Domain name search checks whether a web address (for example yourbrand.com) is free to register, already owned, or marked premium. On DomainDiscovery (Domain Discovery / Domains Discovery), search is free across 1,600+ TLDs, with related tools for AI names, geo lists, bulk checks, WHOIS, and price comparison. Registration payment happens at a third-party registrar.',
    learnHref: '/learn/domain-name-search-guide',
    learnLabel: 'Domain search guide',
  },
  search: {
    key: 'search',
    question: 'What is a domain availability checker?',
    answer:
      'A domain availability checker is a tool that queries whether a specific domain name can be registered under one or more extensions. DomainDiscovery’s instant search returns live-style free, registered, or premium signals as a snapshot — re-check at registrar checkout before you pay.',
    learnHref: '/learn/domain-name-search-guide',
    learnLabel: 'Full search guide',
  },
  geo: {
    key: 'geo',
    question: 'What is a geo domain generator?',
    answer:
      'A geo domain generator builds domain name ideas that combine places (cities, regions, or countries) with a brand or service keyword for local SEO and multi-market campaigns. DomainDiscovery filters by country and population-style figures, live-checks availability, and exports lists — best used when each market will have real operations and content.',
    learnHref: '/learn/geo-domains-local-seo',
    learnLabel: 'Geo domains guide',
  },
  whois: {
    key: 'whois',
    question: 'What is WHOIS / RDAP lookup?',
    answer:
      'WHOIS (and modern RDAP) lookup retrieves public domain registration data when available — registrar, important dates, status, name servers, and sometimes contacts. Privacy services often hide personal details. DomainDiscovery’s WHOIS tool is for research and due diligence, not legal advice.',
    learnHref: '/learn/whois-lookup-guide',
    learnLabel: 'WHOIS guide',
  },
  bulk: {
    key: 'bulk',
    question: 'What is bulk domain search?',
    answer:
      'Bulk domain search checks many domain names in one job so agencies and portfolio owners can screen lists without retyping. DomainDiscovery supports up to 1,000 names per bulk run with live availability-style results. Generate candidates first, then bulk-validate survivors.',
    learnHref: '/learn/bulk-domain-search-guide',
    learnLabel: 'Bulk search guide',
  },
  generator: {
    key: 'generator',
    question: 'What is an AI domain name generator?',
    answer:
      'An AI domain name generator turns a seed keyword or brief into brandable domain ideas, then (on DomainDiscovery) pairs candidates with live availability checks. Humans still filter for spelling, trademarks, and pronunciation — the model suggests; you decide.',
    learnHref: '/learn/ai-domain-name-generator-guide',
    learnLabel: 'AI generator guide',
  },
  compare: {
    key: 'compare',
    question: 'What does domain price comparison show?',
    answer:
      'Domain price comparison shows regular-style retail pricing signals by TLD across registrars so you can spot expensive renewals and odd outliers. Promo first-year deals often differ from year two. DomainDiscovery does not charge for the comparison view; final checkout price is set by the registrar.',
    learnHref: '/learn/domain-price-comparison-guide',
    learnLabel: 'Price comparison guide',
  },
  extensions: {
    key: 'extensions',
    question: 'What is a domain extension (TLD)?',
    answer:
      'A domain extension, or TLD (top-level domain), is the label after the final dot — such as .com, .org, .ai, or a country code like .uk. DomainDiscovery’s extensions browser helps you explore 1,600+ options before you run domain name search and register at a registrar.',
    learnHref: '/learn/what-is-a-tld-domain-extension',
    learnLabel: 'What is a TLD?',
  },
  keyword: {
    key: 'keyword',
    question: 'What is a keyword domain finder?',
    answer:
      'A keyword domain finder suggests domain names built around a topic or commercial keyword so you can compare brandable and descriptive options. On DomainDiscovery it supports research before registration; trademark and spelling checks remain your responsibility.',
    learnHref: '/learn/brandable-vs-keyword-domains',
    learnLabel: 'Brandable vs keyword',
  },
  assistant: {
    key: 'assistant',
    question: 'What is the AI Domain Assistant (Agent Hub)?',
    answer:
      'The AI Domain Assistant on DomainDiscovery is an agent hub: MCP and REST tools that generate domain ideas, check availability, rank brand fit, and apply a registration budget filter (for example $20 max). It is research-only — DomainDiscovery does not register domains or change DNS; humans confirm at a registrar. A dedicated Assistant product site will add chat, brand skills, and memory.',
    learnHref: '/api/agent/manifest',
    learnLabel: 'Agent manifest',
  },
  learn: {
    key: 'learn',
    question: 'What is DomainDiscovery Learn?',
    answer:
      'DomainDiscovery Learn is a free library of domain name guides — search, registration, geo domains, WHOIS, naming, DNS, and more — organized in topic clusters so you can learn then apply tools like search, geo, and price compare on the same site.',
    learnHref: '/learn/domains-for-beginners',
    learnLabel: 'Beginner hub',
  },
  faq: {
    key: 'faq',
    question: 'What is DomainDiscovery?',
    answer:
      'DomainDiscovery (Domain Discovery / Domains Discovery) is a free domain name search and domain toolkit for live availability, AI generation, geo lists, bulk checks, WHOIS/RDAP, TLD browsing, and registrar price research. It is not a registrar checkout.',
    learnHref: '/learn/what-is-domaindiscovery',
    learnLabel: 'Full brand guide',
  },
  brand: {
    key: 'brand',
    question: 'What is DomainDiscovery (Domain Discovery)?',
    answer: SITE_PRODUCT_FACTS.slice(0, 520),
    learnHref: '/learn/what-is-domaindiscovery',
    learnLabel: 'What is DomainDiscovery?',
  },
};

/** JSON-LD building blocks shared by root layout */
export function getOrganizationJsonLd() {
  const base = getSiteBaseUrl();
  const logoUrl = assetUrl('/logo-solid.png');
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${base}/#organization`,
    name: SITE_BRAND.name,
    alternateName: [...SITE_BRAND.alternateNames],
    url: base,
    // Solid plate PNG (512) matches DomainDiscovery mark for Knowledge Panel / SERP
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
      width: 512,
      height: 512,
    },
    image: logoUrl,
    description: SITE_BRAND.description,
    sameAs: ['https://x.com/domainsdiscovery'],
  };
}

export function getWebSiteJsonLd() {
  const base = getSiteBaseUrl();
  const logoUrl = assetUrl('/logo-solid.png');
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    name: SITE_BRAND.name,
    alternateName: [...SITE_BRAND.alternateNames],
    url: base,
    description: SITE_BRAND.description,
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${base}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${base}/#organization`,
      name: SITE_BRAND.name,
      alternateName: [...SITE_BRAND.alternateNames],
      url: base,
      logo: {
        '@type': 'ImageObject',
        url: logoUrl,
        width: 512,
        height: 512,
      },
    },
  };
}

export function getSoftwareApplicationJsonLd() {
  const base = getSiteBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'WebApplication'],
    name: SITE_BRAND.name,
    alternateName: [...SITE_BRAND.alternateNames],
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Domain name search',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript. Works in modern browsers.',
    url: base,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: SITE_BRAND.description,
    featureList: [...SITE_FEATURES],
    // Explicitly no AggregateRating — do not invent reviews
  };
}

export type BreadcrumbItem = {
  name: string;
  /** Path from site root, e.g. /search — omit on the current leaf if only name is known */
  path?: string;
};

/** BreadcrumbList for tool / content pages (Google supported) */
export function getBreadcrumbListJsonLd(items: BreadcrumbItem[]) {
  const base = getSiteBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.path
        ? {
            item:
              item.path === '/'
                ? base
                : `${base}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
          }
        : {}),
    })),
  };
}

/** WebPage schema with speakable cssSelector for AEO surfaces */
export function getWebPageJsonLd(opts: {
  path: string;
  name: string;
  description: string;
}) {
  const base = getSiteBaseUrl();
  const path = opts.path === '/' ? '' : opts.path.startsWith('/') ? opts.path : `/${opts.path}`;
  const url = `${base}${path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: opts.name,
    description: opts.description,
    inLanguage: 'en-US',
    isPartOf: { '@id': `${base}/#website` },
    about: { '@id': `${base}/#organization` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: assetUrl('/logo-solid.png'),
      width: 512,
      height: 512,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[data-aeo-definition]', 'h1'],
    },
  };
}

/**
 * Shared Next.js Metadata for tool layouts (canonical + OG + Twitter + robots).
 */
export function buildToolMetadata(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): import('next').Metadata {
  const path = opts.path.startsWith('/') ? opts.path : `/${opts.path}`;
  return {
    title: opts.title,
    description: opts.description,
    ...(opts.keywords?.length ? { keywords: opts.keywords } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: SITE_BRAND.name,
      title: opts.title,
      description: opts.description,
      url: path,
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
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
