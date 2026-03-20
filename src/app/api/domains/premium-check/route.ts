import { NextRequest } from 'next/server';
import { checkDomainsWithGoDaddy } from '@/lib/godaddyAPI';
import { checkDomainAvailabilityViaMCP } from '@/lib/instantDomainMCP';
import { getSearchRateLimiter, getClientIP, rateLimitResponse } from '@/lib/rateLimiter';
import { errorResponse, jsonResponse, corsPreflightResponse } from '@/lib/apiHelpers';

interface PremiumCheckResult {
  domain: string;
  available: boolean;
  premium: boolean;
  price?: string;
  source: 'godaddy' | 'mcp' | 'cache' | 'fallback';
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_DOMAINS = 60;
const cache = new Map<string, { value: PremiumCheckResult; ts: number }>();

function formatPrice(raw: unknown): string | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return `$${raw.toFixed(0)}`;
  if (typeof raw === 'string') {
    const num = Number(raw.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(num) && num > 0) return `$${num.toFixed(0)}`;
  }
  return undefined;
}

function cacheGet(domain: string): PremiumCheckResult | undefined {
  const entry = cache.get(domain);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(domain);
    return undefined;
  }
  return { ...entry.value, source: 'cache' };
}

function cacheSet(domain: string, value: PremiumCheckResult) {
  cache.set(domain, { value, ts: Date.now() });
}

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const rl = getSearchRateLimiter().check(ip);
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const { domains } = await request.json();
    if (!Array.isArray(domains) || domains.length === 0) {
      return errorResponse('Domains array is required', 400);
    }

    const normalized = Array.from(
      new Set(
        domains
          .map((d) => String(d).toLowerCase().trim())
          .filter(Boolean)
          .slice(0, MAX_DOMAINS)
      )
    );

    const byDomain = new Map<string, PremiumCheckResult>();
    const uncached: string[] = [];

    normalized.forEach((domain) => {
      const cached = cacheGet(domain);
      if (cached) byDomain.set(domain, cached);
      else uncached.push(domain);
    });

    if (uncached.length > 0 && process.env.GODADDY_API_KEY && process.env.GODADDY_API_SECRET) {
      try {
        const gdResults = await checkDomainsWithGoDaddy(uncached);
        gdResults.forEach((item) => {
          const domain = item.domain?.toLowerCase();
          if (!domain) return;
          const price = formatPrice(item.price);
          const premium = !!item.premium || (!!price && !item.available);
          const result: PremiumCheckResult = {
            domain,
            available: !!item.available,
            premium,
            price,
            source: 'godaddy',
          };
          byDomain.set(domain, result);
          cacheSet(domain, result);
        });
      } catch (err) {
        console.warn('GoDaddy premium check unavailable:', (err as Error).message);
      }
    }

    const unresolved = uncached.filter((domain) => !byDomain.has(domain));
    if (unresolved.length > 0) {
      try {
        const mcpResults = await checkDomainAvailabilityViaMCP({ domains: unresolved });
        mcpResults.forEach((item) => {
          const domain = item.domain?.toLowerCase();
          if (!domain) return;
          const price = formatPrice(item.price);
          const premium = !!item.premium || (!!price && !item.available);
          const result: PremiumCheckResult = {
            domain,
            available: !!item.available,
            premium,
            price,
            source: 'mcp',
          };
          byDomain.set(domain, result);
          cacheSet(domain, result);
        });
      } catch (err) {
        console.warn('MCP premium check unavailable:', (err as Error).message);
      }
    }

    unresolved.forEach((domain) => {
      if (byDomain.has(domain)) return;
      byDomain.set(domain, {
        domain,
        available: false,
        premium: false,
        source: 'fallback',
      });
    });

    const ordered = normalized.map((domain) => byDomain.get(domain)).filter(Boolean);
    const resp = jsonResponse(ordered, request, 30);
    resp.headers.set('X-RateLimit-Remaining', String(rl.remaining));
    return resp;
  } catch (error) {
    console.error('Premium check error:', error);
    return errorResponse('Premium check failed', 500);
  }
}
