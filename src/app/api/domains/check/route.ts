import { NextRequest } from 'next/server';
import { getBulkRateLimiter, getSearchRateLimiter, getClientIP, rateLimitResponse } from '@/lib/rateLimiter';
import { errorResponse, jsonResponse, corsPreflightResponse } from '@/lib/apiHelpers';

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const rl = getBulkRateLimiter().check(ip);
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const { domains } = await request.json();
    if (!domains || !Array.isArray(domains) || domains.length === 0) {
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
    const available = await checkViaDNS(domain.toLowerCase().trim());
    const resp = jsonResponse({ domain: domain.toLowerCase().trim(), available }, request, 30);
    resp.headers.set('X-RateLimit-Remaining', String(rl.remaining));
    return resp;
  } catch (error) {
    console.error('Domain check error:', error);
    return errorResponse('Check failed', 500);
  }
}

async function checkBatch(domains: string[], concurrency: number) {
  const results: { domain: string; available: boolean }[] = [];
  for (let i = 0; i < domains.length; i += concurrency) {
    const batch = domains.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (domain) => ({ domain, available: await checkViaDNS(domain) }))
    );
    results.push(...batchResults);
  }
  return results;
}

async function checkViaDNS(domain: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
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
