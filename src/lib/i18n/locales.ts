/**
 * Translated languages. English stays first and unprefixed.
 * English stays unprefixed so existing URLs do not move.
 * hreflang is language-level (not country-level) so one French page can rank
 * in France and other French-speaking markets. Region is not invented.
 */

export const LOCALE_IDS = ['en', 'zh', 'de', 'es', 'ja', 'fr', 'pt', 'hi', 'ar', 'ru', 'bn', 'ur'] as const;

export type LocaleId = (typeof LOCALE_IDS)[number];

export type LocaleMeta = {
  id: LocaleId;
  /** ISO 639-1, with script where the script would otherwise be ambiguous. */
  hreflang: string;
  htmlLang: string;
  dir: 'ltr' | 'rtl';
  og: string;
  /** Name in that language, for the switcher. */
  name: string;
};

export const LOCALES: readonly LocaleMeta[] = [
  { id: 'en', hreflang: 'en', htmlLang: 'en', dir: 'ltr', og: 'en_US', name: 'English' },
  { id: 'zh', hreflang: 'zh-Hans', htmlLang: 'zh-Hans', dir: 'ltr', og: 'zh_CN', name: '简体中文' },
  { id: 'de', hreflang: 'de', htmlLang: 'de', dir: 'ltr', og: 'de_DE', name: 'Deutsch' },
  { id: 'es', hreflang: 'es', htmlLang: 'es', dir: 'ltr', og: 'es_ES', name: 'Español' },
  { id: 'ja', hreflang: 'ja', htmlLang: 'ja', dir: 'ltr', og: 'ja_JP', name: '日本語' },
  { id: 'fr', hreflang: 'fr', htmlLang: 'fr', dir: 'ltr', og: 'fr_FR', name: 'Français' },
  { id: 'pt', hreflang: 'pt', htmlLang: 'pt', dir: 'ltr', og: 'pt_BR', name: 'Português' },
  { id: 'hi', hreflang: 'hi', htmlLang: 'hi', dir: 'ltr', og: 'hi_IN', name: 'हिन्दी' },
  { id: 'ar', hreflang: 'ar', htmlLang: 'ar', dir: 'rtl', og: 'ar_AR', name: 'العربية' },
  { id: 'ru', hreflang: 'ru', htmlLang: 'ru', dir: 'ltr', og: 'ru_RU', name: 'Русский' },
  { id: 'bn', hreflang: 'bn', htmlLang: 'bn', dir: 'ltr', og: 'bn_BD', name: 'বাংলা' },
  { id: 'ur', hreflang: 'ur', htmlLang: 'ur', dir: 'rtl', og: 'ur_PK', name: 'اردو' },
];

const BY_ID = new Map(LOCALES.map((locale) => [locale.id, locale]));

/** Cookie that keeps the chosen language across internal pages. */
export const LOCALE_COOKIE = 'dd-locale';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Pages whose visible copy and metadata are translated. Other pages keep the language in the URL, but are not indexed as translations. */
export const INDEXABLE_LOCALE_PATHS = [
  '/',
  '/search',
  '/generator',
  '/bulk-search',
  '/domain-extensions',
  '/tools/whois',
  '/tools/compare',
  '/tools/geo',
  '/faq',
  '/contact',
  '/privacy',
  '/terms',
  '/cookies',
  '/disclaimer',
] as const;

const INDEXABLE = new Set<string>(INDEXABLE_LOCALE_PATHS);

export function isLocaleId(value: string): value is LocaleId {
  return BY_ID.has(value as LocaleId);
}

export function getLocaleMeta(id: LocaleId): LocaleMeta {
  return BY_ID.get(id) ?? LOCALES[0];
}

/** Locale prefix on a pathname. Unprefixed paths are English. */
export function localeFromPathname(pathname: string): LocaleId {
  const pathOnly = pathname.split('?')[0];
  const parts = pathOnly.split('/');
  if (parts.length > 1 && isLocaleId(parts[1])) return parts[1];
  return 'en';
}

/** Drop the brand suffix so a meta title can be used as a visible heading. */
export function pageHeading(title: string): string {
  return title.replace(/\s*\|\s*DomainDiscovery\s*$/u, '');
}

export function stripLocalePrefix(pathname: string): string {
  const [pathOnly] = pathname.split('?');
  const parts = pathOnly.split('/');
  if (parts.length > 1 && isLocaleId(parts[1])) {
    const rest = `/${parts.slice(2).join('/')}`.replace(/\/$/, '');
    return rest === '' ? '/' : rest;
  }
  if (pathOnly === '' || pathOnly === '/') return '/';
  return pathOnly.endsWith('/') && pathOnly.length > 1 ? pathOnly.slice(0, -1) : pathOnly;
}

/** A single Learn guide, such as /learn/whois-lookup-guide. Indexing for these is decided per guide by the page itself. */
export function isLearnArticlePath(pathname: string): boolean {
  const bare = stripLocalePrefix(pathname.split('?')[0]);
  return /^\/learn\/[^/]+$/.test(bare) && bare !== '/learn/md';
}

export function isIndexableLocalePath(pathname: string): boolean {
  const bare = stripLocalePrefix(pathname.split('?')[0]);
  return INDEXABLE.has(bare);
}

const STATIC_FILE = /\.(?:xml|txt|md|json|webmanifest|ico|png|jpe?g|gif|svg|webp|css|js|map|woff2?)$/i;

/**
 * In-app pages that should stay in the active language.
 * Files, APIs, and the separate ADA site stay unprefixed.
 */
export function isLocaleNavigablePath(pathname: string): boolean {
  const bare = stripLocalePrefix((pathname.split('?')[0] || '/').split('#')[0]);
  if (!bare.startsWith('/')) return false;
  if (bare.startsWith('/api') || bare.startsWith('/_next') || bare.startsWith('/.well-known')) return false;
  if (bare === '/ada' || bare.startsWith('/ada/')) return false;
  if (STATIC_FILE.test(bare)) return false;
  return true;
}

function splitHref(href: string): { bare: string; query: string; hash: string } | null {
  if (!href.startsWith('/') || href.startsWith('//')) return null;
  const hashAt = href.indexOf('#');
  const hash = hashAt >= 0 ? href.slice(hashAt) : '';
  const noHash = hashAt >= 0 ? href.slice(0, hashAt) : href;
  const queryAt = noHash.indexOf('?');
  const query = queryAt >= 0 ? noHash.slice(queryAt) : '';
  const path = queryAt >= 0 ? noHash.slice(0, queryAt) : noHash;
  return { bare: stripLocalePrefix(path || '/'), query, hash };
}

function prefixLocale(locale: LocaleId, bare: string, query: string, hash: string): string {
  if (locale === 'en') return `${bare}${query}${hash}`;
  const prefixed = bare === '/' ? `/${locale}` : `/${locale}${bare}`;
  return `${prefixed}${query}${hash}`;
}

/** Public canonical path. English has no prefix. Untranslated paths stay on English so hreflang does not advertise them. */
export function localeHref(locale: LocaleId, href: string): string {
  const parts = splitHref(href);
  if (!parts) return href;
  if (locale === 'en' || !INDEXABLE.has(parts.bare)) {
    return `${parts.bare}${parts.query}${parts.hash}`;
  }
  return prefixLocale(locale, parts.bare, parts.query, parts.hash);
}

/** In-app link. Keeps the active language on every internal page, including ones whose body copy is still English. */
export function localeNavHref(locale: LocaleId, href: string): string {
  const parts = splitHref(href);
  if (!parts) return href;
  if (locale === 'en' || !isLocaleNavigablePath(parts.bare)) {
    return `${parts.bare}${parts.query}${parts.hash}`;
  }
  return prefixLocale(locale, parts.bare, parts.query, parts.hash);
}

/** Language switch target. Stays on the same internal page. */
export function switchLocaleHref(locale: LocaleId, pathname: string): string {
  const bare = stripLocalePrefix(pathname.split('?')[0] || '/');
  if (!isLocaleNavigablePath(bare)) return localeNavHref(locale, '/');
  return localeNavHref(locale, bare);
}

/** Remember a language choice before navigation so middleware does not bounce back to the previous one. */
export function persistLocaleChoice(locale: LocaleId): void {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}
