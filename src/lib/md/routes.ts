/**
 * Which URLs have a Markdown version. No data imports: middleware loads this file, so it stays
 * tiny. Renderers live in registry.ts; a test keeps the two in step with src/app.
 */
import { isLocaleId, type LocaleId } from '@/lib/i18n/locales';

/** Pages that get Markdown and may be negotiated with an Accept header. */
export const MD_STATIC_PATHS = [
  '/',
  '/search',
  '/generator',
  '/bulk-search',
  '/domain-extensions',
  '/tools/keyword',
  '/tools/compare',
  '/tools/geo',
  '/tools/whois',
  '/tools/value',
  '/tools/domain-age',
  '/tools/dns',
  '/tools/leads',
  '/learn',
  '/blog',
  '/blog/tlds',
  '/faq',
  '/for-ai',
  '/contact',
  '/expired',
  '/alternatives',
  '/domain-leads',
  '/domain-name-ideas',
  '/privacy',
  '/terms',
  '/cookies',
  '/disclaimer',
] as const;

/** Dynamic families: `/<prefix>/<slug>`. The key is the route pattern used in the registry. */
export const MD_DYNAMIC_PREFIXES: Record<string, string> = {
  '/learn/[slug]': '/learn/',
  '/blog/tlds/[slug]': '/blog/tlds/',
  '/alternatives/[slug]': '/alternatives/',
  '/domain-leads/[slug]': '/domain-leads/',
  '/domain-name-ideas/[slug]': '/domain-name-ideas/',
};

export type MdSkip = { path: string; reason: string };

/**
 * Routes that never get Markdown. A path ending in `/*` covers everything below it.
 * The route-coverage test fails when a public page is neither registered nor listed here.
 */
export const MD_SKIP: MdSkip[] = [
  { path: '/premium', reason: 'noindex page (premium domains are coming soon)' },
  { path: '/saved-domains', reason: 'private page: a visitor’s own shortlist, stored in the browser' },
  { path: '/assistant', reason: 'interactive agent hub, not indexable content' },
  { path: '/share/*', reason: 'private shared WHOIS result pages' },
  { path: '/ada/*', reason: 'separate AI Domain Assistant product' },
  { path: '/api/*', reason: 'API routes are not pages' },
  { path: '/leads', reason: 'only redirects to /tools/leads' },
  { path: '/tools/brandable', reason: 'only redirects to /tools/keyword' },
];

/** Old hand-written mirrors. Paths with no real HTML page redirect to the closest new .md path. */
export const LEGACY_MD_REDIRECTS: Record<string, string> = {
  '/geo.md': '/tools/geo.md',
  '/whois.md': '/tools/whois.md',
  '/pricing.md': '/tools/compare.md',
  '/extensions.md': '/domain-extensions.md',
  '/keyword.md': '/tools/keyword.md',
  '/ai-generator.md': '/generator.md',
  '/about.md': '/learn/what-is-domaindiscovery.md',
};

const EXCLUDED_EXACT = new Set([
  '/llms.txt',
  '/llms-full.txt',
  '/ai.txt',
  '/robots.txt',
  '/sitemap.xml',
  '/feed.xml',
]);
const EXCLUDED_PREFIXES = ['/api', '/_next', '/.well-known'];
const ASSET_EXTENSION = /\.(?:png|jpe?g|gif|svg|webp|avif|ico|css|js|mjs|map|json|woff2?|ttf|txt|xml|html|webmanifest)$/i;

/** Files and prefixes the Markdown layer must never touch. */
export function isExcludedPath(pathname: string): boolean {
  if (EXCLUDED_EXACT.has(pathname)) return true;
  if (EXCLUDED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  return ASSET_EXTENSION.test(pathname);
}

/** `/pricing.md` → `/pricing`, `/index.md` → `/`. Null when the path is not a .md path. */
export function htmlPathFromMdPath(pathname: string): string | null {
  if (!pathname.endsWith('.md')) return null;
  const stripped = pathname.slice(0, -3);
  if (stripped === '' || stripped === '/index') return '/';
  if (stripped.endsWith('/')) return null;
  return stripped;
}

/** `/pricing` → `/pricing.md`, `/` → `/index.md`. */
export function mdPathFromHtmlPath(htmlPath: string): string {
  return htmlPath === '/' ? '/index.md' : `${htmlPath}.md`;
}

export type MdMatch = {
  /** Registry pattern, e.g. `/search` or `/learn/[slug]` */
  pattern: string;
  params: Record<string, string>;
  locale: LocaleId;
  /** Path as requested, locale prefix included */
  path: string;
};

const SLUG = /^[a-z0-9][a-z0-9-]*$/i;
const STATIC = new Set<string>(MD_STATIC_PATHS);

/** Resolve an HTML path to a registry pattern. Null when the path has no Markdown version. */
export function matchMarkdownRoute(htmlPath: string): MdMatch | null {
  const path = htmlPath.length > 1 ? htmlPath.replace(/\/$/, '') : htmlPath;
  if (isExcludedPath(path)) return null;
  if (STATIC.has(path) && !MD_SKIP.some((s) => s.path === path)) {
    return { pattern: path, params: {}, locale: 'en', path };
  }
  for (const [pattern, prefix] of Object.entries(MD_DYNAMIC_PREFIXES)) {
    if (!path.startsWith(prefix)) continue;
    const slug = path.slice(prefix.length);
    if (SLUG.test(slug)) return { pattern, params: { slug }, locale: 'en', path };
  }
  // Only learn guides are translated for Markdown: /{lang}/learn/{slug}
  const parts = path.split('/');
  if (parts.length === 4 && parts[2] === 'learn' && isLocaleId(parts[1]) && parts[1] !== 'en' && SLUG.test(parts[3])) {
    return { pattern: '/learn/[slug]', params: { slug: parts[3] }, locale: parts[1], path };
  }
  return null;
}

/** True for paths where an Accept: text/markdown request may be answered with Markdown. */
export function isNegotiablePath(pathname: string): boolean {
  return matchMarkdownRoute(pathname) !== null;
}

/** Cache-Control for Markdown responses. Used by the Markdown response builder. */
export const MD_CACHE_CONTROL = {
  default: 'public, s-maxage=3600, stale-while-revalidate=86400',
  long: 'public, s-maxage=86400, stale-while-revalidate=604800',
} as const;

/** Everything but guides changes rarely. Guides unlock by date, so they keep the short cache. */
export function isLongCachePattern(pattern: string): boolean {
  return pattern !== '/learn/[slug]';
}
