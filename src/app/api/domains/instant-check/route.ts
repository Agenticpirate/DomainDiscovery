import { NextRequest } from 'next/server';
import { getSearchRateLimiter, getBulkRateLimiter, getClientIP, rateLimitResponse } from '@/lib/rateLimiter';
import { errorResponse, jsonResponse, corsPreflightResponse } from '@/lib/apiHelpers';
import { checkDomainAvailabilityViaMCP } from '@/lib/instantDomainMCP';
import { ensureSpaceshipAffiliate } from '@/lib/registrars';

// LRU cache with max size to prevent OOM
const MAX_CACHE = 10_000;
const CACHE_TTL = 5 * 60 * 1000;
const MAX_DOMAINS = 1_000;
const MCP_BATCH_SIZE = 20;
type CachedResult = {
  available: boolean;
  premium?: boolean;
  price?: string;
  buyUrl?: string;
  purchaseInfo?: string;
  timestamp: number;
};
type InstantCheckResult = {
  domain: string;
  available: boolean;
  premium?: boolean;
  price?: string;
  buyUrl?: string;
  purchaseInfo?: string;
};
const cache = new Map<string, CachedResult>();

function cacheGet(key: string): Omit<CachedResult, 'timestamp'> | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > CACHE_TTL) { cache.delete(key); return undefined; }
  return {
    available: entry.available,
    premium: entry.premium,
    price: entry.price,
    buyUrl: entry.buyUrl,
    purchaseInfo: entry.purchaseInfo,
  };
}

function cacheSet(key: string, value: Omit<CachedResult, 'timestamp'>) {
  if (cache.size >= MAX_CACHE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { ...value, timestamp: Date.now() });
}

/** Never return untracked Spaceship merchant links from the API */
function sanitizeResult(r: InstantCheckResult): InstantCheckResult {
  if (!r.buyUrl) return r;
  return {
    ...r,
    buyUrl: ensureSpaceshipAffiliate(r.buyUrl, r.domain),
  };
}

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  try {
    const { domain, domains } = await request.json();
    const domainsToCheck: string[] = Array.from(
      new Set(
        (domains || (domain ? [domain] : []))
          .slice(0, MAX_DOMAINS)
          .map((d: string) => d.toLowerCase().trim())
          .filter(Boolean)
      )
    );

    if (domainsToCheck.length === 0) return errorResponse('Domain(s) required', 400);

    const limiter = domainsToCheck.length > 1 ? getBulkRateLimiter() : getSearchRateLimiter();
    const rl = limiter.check(ip);
    if (!rl.allowed) return rateLimitResponse(rl);

    const results: InstantCheckResult[] = [];
    const uncached: string[] = [];

    for (const d of domainsToCheck) {
      const cached = cacheGet(d);
      if (cached !== undefined) results.push({ domain: d, ...cached });
      else uncached.push(d);
    }

    // Check uncached first via MCP for premium-aware status, then DNS as fallback.
    for (let i = 0; i < uncached.length; i += MCP_BATCH_SIZE) {
      const batch = uncached.slice(i, i + MCP_BATCH_SIZE);
      const mcpResults = await checkDomainAvailabilityViaMCP({ domains: batch });
      const mcpByDomain = new Map(
        mcpResults.map((item) => [
          item.domain.toLowerCase().trim(),
          {
            domain: item.domain.toLowerCase().trim(),
            available: !!item.available,
            premium: !!item.premium,
            price: item.price,
            buyUrl: item.buyUrl,
            purchaseInfo: item.purchaseInfo,
          },
        ])
      );

      const unresolved = batch.filter((d) => !mcpByDomain.has(d));
      const dnsResults = await Promise.all(
        unresolved.map(async (d) => {
          const available = await checkViaDNS(d);
          return { domain: d, available, premium: false, price: undefined, buyUrl: undefined, purchaseInfo: undefined } satisfies InstantCheckResult;
        })
      );

      const batchResults = [
        ...Array.from(mcpByDomain.values()),
        ...dnsResults,
      ];

      batchResults.forEach(({ domain, available, premium, price, buyUrl, purchaseInfo }) => {
        cacheSet(domain, { available, premium, price, buyUrl, purchaseInfo });
      });
      results.push(...batchResults);
    }

    const ordered = domainsToCheck.map((d) =>
      sanitizeResult(
        results.find((r) => r.domain === d) || {
          domain: d,
          available: false,
          premium: false,
        }
      )
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
    return jsonResponse({ domain: normalized, ...cached }, request, 15);
  }

  const [mcpResult] = await checkDomainAvailabilityViaMCP({ domains: [normalized] });
  if (mcpResult) {
    const result = sanitizeResult({
      domain: normalized,
      available: !!mcpResult.available,
      premium: !!mcpResult.premium,
      price: mcpResult.price,
      buyUrl: mcpResult.buyUrl,
      purchaseInfo: mcpResult.purchaseInfo,
    });
    cacheSet(normalized, {
      available: result.available,
      premium: result.premium,
      price: result.price,
      buyUrl: result.buyUrl,
      purchaseInfo: result.purchaseInfo,
    });
    return jsonResponse(result, request, 15);
  }

  const available = await checkViaDNS(normalized);
  cacheSet(normalized, { available, premium: false });
  return jsonResponse({ domain: normalized, available, premium: false }, request, 15);
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
