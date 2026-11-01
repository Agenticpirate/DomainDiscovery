import { NextRequest } from 'next/server';
import { getInstantCheckRateLimiter, getClientIP, rateLimitResponse } from '@/lib/rateLimiter';
import { errorResponse, jsonResponse, corsPreflightResponse } from '@/lib/apiHelpers';
import { checkDomainAvailabilityViaMCP } from '@/lib/instantDomainMCP';
import { getSpaceshipAffiliateUrl } from '@/lib/registrars';
import { checkDnsAvailability } from '@/lib/dnsAvailability';

// LRU cache with max size to prevent OOM
const MAX_CACHE = 10_000;
const CACHE_TTL = 5 * 60 * 1000;
const MAX_DOMAINS = 1_000;
const MCP_BATCH_SIZE = 20;
const DNS_CONCURRENCY = 25;
const ENABLE_MCP_SEARCH = process.env.ENABLE_MCP_SEARCH === 'true';

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
  checked?: boolean;
  premium?: boolean;
  price?: string;
  buyUrl?: string;
  purchaseInfo?: string;
};

const cache = new Map<string, CachedResult>();

function cacheGet(key: string): Omit<CachedResult, 'timestamp'> | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return undefined;
  }
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

/** Outbound buy URL is always the domain affiliate hop. */
function sanitizeResult(r: InstantCheckResult): InstantCheckResult {
  return {
    ...r,
    buyUrl: getSpaceshipAffiliateUrl(r.domain),
  };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) return [];
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const worker = async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await mapper(items[index]);
    }
  };
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
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

    const limiter = getInstantCheckRateLimiter();
    const rl = limiter.check(ip);
    if (!rl.allowed) return rateLimitResponse(rl);

    const results: InstantCheckResult[] = [];
    const uncached: string[] = [];

    for (const d of domainsToCheck) {
      const cached = cacheGet(d);
      if (cached !== undefined) results.push({ domain: d, ...cached });
      else uncached.push(d);
    }

    if (uncached.length > 0) {
      const mcpByDomain = new Map<string, InstantCheckResult>();

      if (ENABLE_MCP_SEARCH) {
        for (let i = 0; i < uncached.length; i += MCP_BATCH_SIZE) {
          const batch = uncached.slice(i, i + MCP_BATCH_SIZE);
          const mcpResults = await checkDomainAvailabilityViaMCP({ domains: batch });
          mcpResults.forEach((item) => {
            mcpByDomain.set(item.domain.toLowerCase().trim(), {
              domain: item.domain.toLowerCase().trim(),
              available: !!item.available,
              premium: !!item.premium,
              price: item.price,
              buyUrl: item.buyUrl,
              purchaseInfo: item.purchaseInfo,
            });
          });
        }
      }

      const unresolved = uncached.filter((d) => !mcpByDomain.has(d));
      const dnsResults = await mapWithConcurrency(unresolved, DNS_CONCURRENCY, async (d) => {
        const state = await checkDnsAvailability(d);
        return {
          domain: d,
          available: state === 'available',
          checked: state !== 'unknown',
          premium: false,
          price: undefined,
          buyUrl: undefined,
          purchaseInfo: undefined,
        } satisfies InstantCheckResult;
      });

      const batchResults = [
        ...Array.from(mcpByDomain.values()),
        ...dnsResults,
      ];

      batchResults.forEach(({ domain, available, checked, premium, price, buyUrl, purchaseInfo }) => {
        if (checked === false) return;
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
  const rl = getInstantCheckRateLimiter().check(ip);
  if (!rl.allowed) return rateLimitResponse(rl);

  const normalized = d.toLowerCase().trim();
  const cached = cacheGet(normalized);
  if (cached !== undefined) {
    return jsonResponse({ domain: normalized, ...cached }, request, 15);
  }

  if (ENABLE_MCP_SEARCH) {
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
  }

  const state = await checkDnsAvailability(normalized);
  const result = sanitizeResult({
    domain: normalized,
    available: state === 'available',
    checked: state !== 'unknown',
    premium: false,
  });
  if (result.checked !== false) {
    cacheSet(normalized, { available: result.available, premium: false });
  }
  return jsonResponse(result, request, 15);
}
