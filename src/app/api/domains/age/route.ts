import { NextRequest, NextResponse } from 'next/server';
import { getSearchRateLimiter, getClientIP, rateLimitResponse } from '@/lib/rateLimiter';
import { lookupWhois } from '@/lib/rdapClient';
import { summarizeAge } from '@/lib/domainAge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Domain age and expiry from public RDAP data. */
export async function GET(request: NextRequest) {
  const rl = getSearchRateLimiter().check(getClientIP(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const raw = request.nextUrl.searchParams.get('domain') || '';
  const result = await lookupWhois(raw);
  if (!result.success) {
    const status = result.available ? 404 : result.error.includes('valid domain') ? 400 : 502;
    return NextResponse.json(result, {
      status,
      headers: { 'Cache-Control': result.available ? 'public, max-age=60' : 'no-store' },
    });
  }
  return NextResponse.json(
    {
      success: true,
      domain: result.domain,
      registrar: result.registrar,
      ...summarizeAge(result, new Date()),
      source: result.source,
    },
    { headers: { 'Cache-Control': 'public, max-age=120, s-maxage=300, stale-while-revalidate=600' } }
  );
}
