import { NextRequest, NextResponse } from 'next/server';
import { getSearchRateLimiter, getClientIP, rateLimitResponse } from '@/lib/rateLimiter';
import { isDnsType, lookupDns, validateDnsName } from '@/lib/dnsLookup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** DNS records via DNS-over-HTTPS (Cloudflare, falling back to Google). */
export async function GET(request: NextRequest) {
  const rl = getSearchRateLimiter().check(getClientIP(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const params = request.nextUrl.searchParams;
  const domain = validateDnsName(params.get('domain') || '');
  const type = (params.get('type') || 'A').toUpperCase();
  if (!domain) {
    return NextResponse.json({ success: false, error: 'Enter a valid public domain name (e.g. example.com).' }, { status: 400 });
  }
  if (!isDnsType(type)) {
    return NextResponse.json({ success: false, error: 'Unsupported record type.' }, { status: 400 });
  }

  try {
    const result = await lookupDns(domain, type);
    return NextResponse.json(
      { success: true, ...result },
      { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60' } }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'DNS lookup failed.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
