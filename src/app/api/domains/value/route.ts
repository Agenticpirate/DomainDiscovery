import { NextRequest, NextResponse } from 'next/server';
import { getSearchRateLimiter, getClientIP, rateLimitResponse } from '@/lib/rateLimiter';
import { normalizeDomain, lookupWhois } from '@/lib/rdapClient';
import { estimateDomainValue } from '@/lib/domainValue';
import { summarizeAge } from '@/lib/domainAge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ENRICH_TIMEOUT_MS = 2500;

/** Heuristic domain value range. Optionally uses the registration date when RDAP answers quickly. */
export async function GET(request: NextRequest) {
  const rl = getSearchRateLimiter().check(getClientIP(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const domain = normalizeDomain(request.nextUrl.searchParams.get('domain') || '');
  if (!domain) {
    return NextResponse.json({ success: false, error: 'Enter a valid domain name (e.g. example.com).' }, { status: 400 });
  }

  let ageYears: number | null = null;
  try {
    const whois = await Promise.race([
      lookupWhois(domain),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), ENRICH_TIMEOUT_MS)),
    ]);
    if (whois && whois.success) ageYears = summarizeAge(whois, new Date()).ageYears;
  } catch {
    // Enrichment is optional.
  }

  const estimate = estimateDomainValue(domain, { ageYears });
  return NextResponse.json(
    { success: true, ...estimate, ageYears, currency: 'USD' },
    { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=600' } }
  );
}
