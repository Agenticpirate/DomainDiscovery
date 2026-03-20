import { NextRequest } from 'next/server';
import { getSearchRateLimiter, getBulkRateLimiter, getClientIP, rateLimitResponse } from '@/lib/rateLimiter';
import { errorResponse, jsonResponse, corsPreflightResponse } from '@/lib/apiHelpers';

// LRU cache with max size to prevent OOM
const MAX_CACHE = 10_000;
const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map<string, { available: boolean; timestamp: number }>();

function cacheGet(key: string): boolean | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > CACHE_TTL) { cache.delete(key); return undefined; }
  return entry.available;
}

function cacheSet(key: string, available: boolean) {
  if (cache.size >= MAX_CACHE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { available, timestamp: Date.now() });
}

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  try {
    const { domain, domains } = await request.json();
    const domainsToCheck: string[] = (domains || (domain ? [domain] : []))
      .slice(0, 100)
      .map((d: string) => d.toLowerCase().trim());

    if (domainsToCheck.length === 0) return errorResponse('Domain(s) required', 400);

    const limiter = domainsToCheck.length > 1 ? getBulkRateLimiter() : getSearchRateLimiter();
    const rl = limiter.check(ip);
    if (!rl.allowed) return rateLimitResponse(rl);

    const results: { domain: string; available: boolean }[] = [];
    const uncached: string[] = [];

    for (const d of domainsToCheck) {
      const cached = cacheGet(d);
      if (cached !== undefined) results.push({ domain: d, available: cached });
      else uncached.push(d);
    }

    // Check uncached via DNS with concurrency limit
    for (let i = 0; i < uncached.length; i += 20) {
      const batch = uncached.slice(i, i + 20);
      const batchResults = await Promise.all(
        batch.map(async (d) => {
          const available = await checkViaDNS(d);
          cacheSet(d, available);
          return { domain: d, available };
        })
      );
      results.push(...batchResults);
    }

    const ordered = domainsToCheck.map(d =>
      results.find(r => r.domain === d) || { domain: d, available: false }
    );

    const resp = jsonResponse(domain ? ordered[0] : ordered, request, 15);
    resp.headers.set('X-RateLimit-Remaining', String(rl.remaining));
    return resp;
  } catch (error) {
    console.error('Instant check error:', error);
    return errorResponse('Check failed', 500);
  }
}

export async function GET(request: NextRequest) {
  const d = new URL(request.url).searchParams.get('domain');
  if (!d) return errorResponse('Domain required', 400);

  const ip = getClientIP(request);
  const rl = getSearchRateLimiter().check(ip);
  if (!rl.allowed) return rateLimitResponse(rl);

  const normalized = d.toLowerCase().trim();
  const cached = cacheGet(normalized);
  if (cached !== undefined) {
    return jsonResponse({ domain: normalized, available: cached }, request, 15);
  }

  const available = await checkViaDNS(normalized);
  cacheSet(normalized, available);
  return jsonResponse({ domain: normalized, available }, request, 15);
}

async function checkViaDNS(domain: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 900);
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
      { signal: controller.signal, headers: { Accept: 'application/dns-json' } }
    );
    clearTimeout(timeout);
    if (response.ok) {
      const data = await response.json();
      return data.Status === 3;
    }
  } catch { /* safe default */ }
  return false;
}
