import { NextRequest } from 'next/server';
import { searchDomainsViaMCP } from '@/lib/instantDomainMCP';
import { checkDomainsWithGoDaddy } from '@/lib/godaddyAPI';
import { checkDomainAvailabilityViaMCP } from '@/lib/instantDomainMCP';
import { getSearchRateLimiter, getClientIP, rateLimitResponse } from '@/lib/rateLimiter';
import { errorResponse, isValidQuery, jsonResponse, corsPreflightResponse } from '@/lib/apiHelpers';

const DEFAULT_TLDS = ['.com', '.net', '.org', '.ai', '.io', '.co'];
const MAX_SEARCH_TLDS = 320;
const DNS_TIMEOUT_MS = 700;
const DNS_CONCURRENCY = 60;
const DNS_CACHE_TTL_MS = 10 * 60 * 1000;
const PREMIUM_ENRICHMENT_LIMIT = 30;
const EXACT_DOMAIN_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
const ENABLE_MCP_SEARCH = process.env.ENABLE_MCP_SEARCH === 'true';
const ENABLE_PREMIUM_ENRICHMENT = process.env.ENABLE_PREMIUM_ENRICHMENT === 'true';

const dnsCache = new Map<string, { available: boolean; timestamp: number }>();

function normalizeSearchTlds(tlds: unknown): string[] {
  if (!Array.isArray(tlds)) return DEFAULT_TLDS;

  const seen = new Set<string>();
  const normalized = tlds
    .map((tld) => String(tld).trim().toLowerCase())
    .filter(Boolean)
    .map((tld) => (tld.startsWith('.') ? tld : `.${tld}`))
    .filter((tld) => /^\.[a-z0-9-]+(?:\.[a-z0-9-]+)*$/.test(tld))
    .filter((tld) => {
      if (seen.has(tld)) return false;
      seen.add(tld);
      return true;
    })
    .slice(0, MAX_SEARCH_TLDS);

  return normalized.length > 0 ? normalized : DEFAULT_TLDS;
}

function cacheGet(domain: string): boolean | undefined {
  const entry = dnsCache.get(domain);
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > DNS_CACHE_TTL_MS) {
    dnsCache.delete(domain);
    return undefined;
  }
  return entry.available;
}

function cacheSet(domain: string, available: boolean) {
  dnsCache.set(domain, { available, timestamp: Date.now() });
}

function isExactDomainQuery(value: string): boolean {
  return EXACT_DOMAIN_PATTERN.test(value);
}

function formatMarketplacePrice(raw: unknown): string | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return `$${raw.toFixed(0)}`;
  }

  if (typeof raw === 'string') {
    const numeric = Number(raw.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(numeric) && numeric > 0) {
      return `$${numeric.toFixed(0)}`;
    }
  }

  return undefined;
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
  const rl = getSearchRateLimiter().check(ip);
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const body = await request.json();
    const { query, tlds } = body;

    if (!query || !isValidQuery(query)) {
      return errorResponse('Invalid or missing query parameter', 400);
    }

    const cleanQuery = query.toLowerCase().replace(/\s+/g, '');
    const searchTlds = normalizeSearchTlds(tlds);
    const exactDomainQuery = isExactDomainQuery(cleanQuery);

    // Try MCP first (only on small TLD requests), then fill missing via DNS fallback.
    const mcpByDomain = new Map<string, { domain: string; available: boolean; price?: string; premium: boolean }>();
    const shouldUseMCP = ENABLE_MCP_SEARCH && !exactDomainQuery && searchTlds.length <= 60;

    if (shouldUseMCP) {
      try {
      const mcpResults = await searchDomainsViaMCP({ query: cleanQuery, tlds: searchTlds });
      if (mcpResults && mcpResults.length > 0) {
        mcpResults.forEach((r) => {
          const domain = (r.domain || '').toLowerCase().trim();
          if (!domain) return;
          mcpByDomain.set(domain, {
            domain,
            available: !!r.available,
            price: r.price,
            premium: !!r.premium,
          });
        });
      }
      } catch (mcpError) {
        console.warn('MCP search unavailable:', (mcpError as Error).message);
      }
    }

    const allDomains = exactDomainQuery ? [cleanQuery] : searchTlds.map((tld: string) => `${cleanQuery}${tld}`);
    const missingDomains = allDomains.filter((domain) => !mcpByDomain.has(domain));
    const dnsByDomain = new Map<string, { domain: string; available: boolean; tld: string; price: string; premium: boolean }>();

    // DNS fallback for all missing domains so result count matches requested TLD count.
    const resolvedMissing = await mapWithConcurrency(missingDomains, DNS_CONCURRENCY, async (domain: string) => {
      const tldPart = '.' + domain.split('.').slice(1).join('.');
      const cached = cacheGet(domain);
      const available = cached !== undefined ? cached : await checkViaDNS(domain);
      if (cached === undefined) cacheSet(domain, available);
      return { domain, available, tld: tldPart.replace('.', ''), price: getPriceForTLD(tldPart), premium: false };
    });

    resolvedMissing.forEach((result) => {
      dnsByDomain.set(result.domain, result);
    });

    let orderedResults = allDomains.map((domain) => {
      const fromMcp = mcpByDomain.get(domain);
      if (fromMcp) {
        const tldPart = '.' + domain.split('.').slice(1).join('.');
        return {
          domain,
          available: fromMcp.available,
          tld: tldPart.replace('.', ''),
          price: fromMcp.price || getPriceForTLD(tldPart),
          premium: fromMcp.premium,
        };
      }
      return (
        dnsByDomain.get(domain) || {
          domain,
          available: false,
          tld: domain.split('.').slice(1).join('.'),
          price: getPriceForTLD('.' + domain.split('.').slice(1).join('.')),
          premium: false,
        }
      );
    });

    const premiumCandidates = orderedResults
      .filter((item) => !item.available)
      .map((item) => item.domain)
      .slice(0, PREMIUM_ENRICHMENT_LIMIT);

    if (ENABLE_PREMIUM_ENRICHMENT && premiumCandidates.length > 0) {
      const premiumByDomain = new Map<string, { premium: boolean; price?: string }>();

      if (process.env.GODADDY_API_KEY && process.env.GODADDY_API_SECRET) {
        try {
          const gdResults = await checkDomainsWithGoDaddy(premiumCandidates);
          gdResults.forEach((item) => {
            const domain = item.domain?.toLowerCase().trim();
            if (!domain) return;
            const price = formatMarketplacePrice(item.price);
            premiumByDomain.set(domain, {
              premium: !!item.premium || (!!price && !item.available),
              price,
            });
          });
        } catch (error) {
          console.warn('GoDaddy premium enrichment unavailable:', (error as Error).message);
        }
      }

      const unresolvedPremiumCandidates = premiumCandidates.filter((domain) => {
        const existing = premiumByDomain.get(domain);
        return !existing || (!existing.premium && !existing.price);
      });

      if (unresolvedPremiumCandidates.length > 0) {
        try {
          const mcpPremiumResults = await checkDomainAvailabilityViaMCP({ domains: unresolvedPremiumCandidates });
          mcpPremiumResults.forEach((item) => {
            const domain = item.domain?.toLowerCase().trim();
            if (!domain) return;
            const price = formatMarketplacePrice(item.price);
            const current = premiumByDomain.get(domain);
            premiumByDomain.set(domain, {
              premium: current?.premium || !!item.premium || (!!price && !item.available),
              price: current?.price || price,
            });
          });
        } catch (error) {
          console.warn('MCP premium enrichment unavailable:', (error as Error).message);
        }
      }

      orderedResults = orderedResults.map((item) => {
        const enriched = premiumByDomain.get(item.domain);
        if (!enriched) return item;
        return {
          ...item,
          premium: enriched.premium || item.premium,
          price: enriched.price || item.price,
        };
      });
    }

    const resp = jsonResponse(orderedResults, request, 30);
    resp.headers.set('X-RateLimit-Remaining', String(rl.remaining));
    return resp;
  } catch (error) {
    console.error('Domain search error:', error);
    return errorResponse('Search failed. Please try again.', 500);
  }
}

async function checkViaDNS(domain: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DNS_TIMEOUT_MS);
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

function getPriceForTLD(tld: string): string {
  const prices: Record<string, string> = {
    '.com': '$12.99', '.net': '$14.99', '.org': '$13.99',
    '.ai': '$89.99', '.io': '$49.99', '.co': '$29.99',
    '.app': '$19.99', '.dev': '$15.99', '.xyz': '$9.99',
    '.in': '$19.99', '.co.in': '$9.99', '.net.in': '$9.99', '.org.in': '$9.99',
    '.info': '$12.99', '.store': '$14.99', '.online': '$9.99',
    '.shop': '$14.99', '.site': '$9.99', '.tech': '$12.99',
    '.me': '$19.99', '.biz': '$14.99', '.us': '$12.99',
    '.club': '$9.99', '.pro': '$14.99', '.live': '$12.99',
    '.world': '$9.99', '.today': '$12.99', '.link': '$11.99',
    '.blog': '$14.99', '.design': '$29.99', '.art': '$14.99',
    '.one': '$9.99', '.digital': '$14.99', '.space': '$9.99',
    '.media': '$19.99', '.host': '$29.99', '.ltd': '$14.99',
    '.agency': '$19.99', '.stream': '$9.99', '.web': '$19.99',
    '.work': '$9.99', '.love': '$14.99', '.cool': '$14.99',
    '.guru': '$19.99', '.fit': '$14.99', '.luxury': '$29.99',
    '.vip': '$14.99', '.top': '$4.99', '.tv': '$29.99',
    '.cloud': '$12.99', '.studio': '$19.99', '.fun': '$9.99',
    '.global': '$29.99', '.plus': '$14.99', '.email': '$12.99',
    '.page': '$12.99', '.social': '$14.99', '.zone': '$14.99',
    '.team': '$14.99', '.life': '$14.99', '.best': '$9.99',
    '.care': '$19.99', '.marketing': '$19.99', '.solutions': '$14.99',
    '.lol': '$9.99',
  };
  return prices[tld] || '$14.99';
}
