import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

/** Paths no crawler should fetch. ai.txt lists the same paths as excluded. */
/** /_data/ holds raw JSON the server reads at request time (src/lib/dataFiles.ts); not pages. */
export const ROBOTS_DISALLOW = ['/api/', '/share/', '/_data/'];

/** Named user agents. Search and AI bots all get the same allow rules; none is ever blocked outright. */
export const ROBOTS_AGENTS = {
  search: [
    'Googlebot',
    'Googlebot-Image',
    'Googlebot-News',
    'Googlebot-Video',
    'GoogleOther',
    'Bingbot',
    'Slurp', // Yahoo
    'DuckDuckBot',
    'Baiduspider',
    'YandexBot',
    'YandexImages',
    'Sogou',
    'Exabot',
    'facebot',
    'ia_archiver',
    'Applebot',
  ],
  /** Fetch pages to answer a user's question */
  aiSearch: ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'Claude-SearchBot', 'Claude-User'],
  /** Training and general AI crawlers: allowed on purpose */
  aiOther: [
    'GPTBot',
    'Google-Extended',
    'ClaudeBot',
    'anthropic-ai',
    'Applebot-Extended',
    'Bytespider',
    'cohere-ai',
    'meta-externalagent',
    'FacebookBot',
    'Amazonbot',
    'YouBot',
    'Diffbot',
    'CCBot',
  ],
} as const;

export const ROBOTS_ALL_AGENTS: string[] = [...ROBOTS_AGENTS.search, ...ROBOTS_AGENTS.aiSearch, ...ROBOTS_AGENTS.aiOther];

/** robots.txt text. MetadataRoute.Robots cannot print comments, so this is a route handler. */
export function buildRobotsTxt(): string {
  const base = getSiteBaseUrl();
  const rules = (agent: string) => [`User-agent: ${agent}`, 'Allow: /', ...ROBOTS_DISALLOW.map((d) => `Disallow: ${d}`), ''];
  return [
    '# robots.txt for DomainDiscovery',
    `# AI-readable indexes: ${base}/llms.txt (page index), ${base}/llms-full.txt (full content)`,
    `# AI usage terms: ${base}/ai.txt`,
    '# Keep in sync with /llms.txt and /ai.txt: private paths here are the excluded paths in ai.txt.',
    '',
    ...rules('*'),
    '# Search engines',
    ...ROBOTS_AGENTS.search.flatMap(rules),
    '# AI search and assistant bots',
    ...ROBOTS_AGENTS.aiSearch.flatMap(rules),
    '# AI training crawlers (allowed)',
    ...ROBOTS_AGENTS.aiOther.flatMap(rules),
    `Host: ${base}`,
    `Sitemap: ${base}/sitemap.xml`,
    `Sitemap: ${base}/feed.xml`,
    '',
  ].join('\n');
}
