import { getSiteBaseUrl, SITE_CORE_PATHS } from '@/lib/seoSiteFacts';

/**
 * IndexNow (Bing / Yandex / Seznam / Naver) — speeds discovery for engines
 * that feed ChatGPT browsing and other AI search surfaces.
 *
 * Host the key at /.well-known/indexnow.txt (custom keyLocation).
 * Override with INDEXNOW_KEY in production env.
 *
 * Docs: https://www.indexnow.org/documentation
 */
export const INDEXNOW_DEFAULT_KEY = 'dd7c3e9a1f2b4c5d8e6f0a1b2c3d4e5f6a';

export function getIndexNowKey(): string {
  const fromEnv = (process.env.INDEXNOW_KEY || '').trim();
  // IndexNow keys: 8–128 hex or URL-safe chars
  if (fromEnv.length >= 8 && fromEnv.length <= 128) return fromEnv;
  return INDEXNOW_DEFAULT_KEY;
}

export function getIndexNowKeyLocation(): string {
  return `${getSiteBaseUrl()}/.well-known/indexnow.txt`;
}

/** Default URL set for bulk IndexNow pings (primary tools + GEO surfaces). */
export function getIndexNowDefaultUrls(): string[] {
  const base = getSiteBaseUrl();
  const geoPaths = [
    '/llms.txt',
    '/llms-full.txt',
    '/for-ai',
    '/search.md',
    '/generator.md',
    '/geo.md',
    '/whois.md',
    '/bulk-search.md',
    '/pricing.md',
    '/extensions.md',
    '/about.md',
    '/faq',
    '/learn',
    '/feed.xml',
    '/opensearch.xml',
    '/blog',
    '/blog/tlds',
    '/domain-extensions',
    '/tools/compare',
  ];
  const primary = SITE_CORE_PATHS.filter((p) => p.priority === 'primary').map((p) =>
    p.path === '/' ? base : `${base}${p.path}`
  );
  const geo = geoPaths.map((p) => `${base}${p}`);
  return Array.from(new Set([...primary, ...geo]));
}

export async function submitIndexNow(urlList?: string[]): Promise<{
  ok: boolean;
  submitted: number;
  keyLocation: string;
  results: Array<{ endpoint: string; status: number }>;
}> {
  const key = getIndexNowKey();
  const base = getSiteBaseUrl();
  const keyLocation = getIndexNowKeyLocation();
  const urls = (urlList && urlList.length > 0 ? urlList : getIndexNowDefaultUrls())
    .filter((u) => typeof u === 'string' && u.startsWith(base))
    .slice(0, 100);

  const payload = {
    host: new URL(base).host,
    key,
    keyLocation,
    urlList: urls,
  };

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow',
  ];

  const results: Array<{ endpoint: string; status: number }> = [];
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });
      results.push({ endpoint, status: res.status });
    } catch {
      results.push({ endpoint, status: 0 });
    }
  }

  return {
    ok: results.some((r) => (r.status >= 200 && r.status < 300) || r.status === 202),
    submitted: urls.length,
    keyLocation,
    results,
  };
}
