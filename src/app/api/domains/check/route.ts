import { NextRequest } from 'next/server';
import { getBulkRateLimiter, getSearchRateLimiter, getClientIP, rateLimitResponse } from '@/lib/rateLimiter';
import { errorResponse, jsonResponse, corsPreflightResponse } from '@/lib/apiHelpers';
import { checkDnsAvailability } from '@/lib/dnsAvailability';

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const rl = getBulkRateLimiter().check(ip);
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const body = await request.json();
    const domains = Array.isArray(body.domains)
      ? body.domains
      : body.domain
      ? [body.domain]
      : [];
    if (domains.length === 0) {
      return errorResponse('Domains array is required', 400);
    }

    const domainsToCheck = domains.slice(0, 100).map((d: string) => d.toLowerCase().trim());
    const results = await checkBatch(domainsToCheck, 20);

    const resp = jsonResponse(results, request, 30);
    resp.headers.set('X-RateLimit-Remaining', String(rl.remaining));
    return resp;
  } catch (error) {
    console.error('Domain check error:', error);
    return errorResponse('Check failed', 500);
  }
}

export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  const rl = getSearchRateLimiter().check(ip);
  if (!rl.allowed) return rateLimitResponse(rl);

  const domain = new URL(request.url).searchParams.get('domain');
  if (!domain) return errorResponse('Domain parameter is required', 400);

  try {
    const state = await checkDnsAvailability(domain.toLowerCase().trim());
    const resp = jsonResponse(
      {
        domain: domain.toLowerCase().trim(),
        available: state === 'available',
        checked: state !== 'unknown',
      },
      request,
      30
    );
    resp.headers.set('X-RateLimit-Remaining', String(rl.remaining));
    return resp;
  } catch (error) {
    console.error('Domain check error:', error);
    return errorResponse('Check failed', 500);
  }
}

async function checkBatch(domains: string[], concurrency: number) {
  const results: { domain: string; available: boolean; checked: boolean }[] = [];
  for (let i = 0; i < domains.length; i += concurrency) {
    const batch = domains.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (domain) => {
        const state = await checkDnsAvailability(domain);
        return { domain, available: state === 'available', checked: state !== 'unknown' };
      })
    );
    results.push(...batchResults);
  }
  return results;
}
