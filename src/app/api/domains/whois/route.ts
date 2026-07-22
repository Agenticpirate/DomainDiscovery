import { NextRequest, NextResponse } from 'next/server';
import { lookupWhois } from '@/lib/rdapClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Instant WHOIS via public RDAP:
 * IANA bootstrap (local cache) → direct registry server → 10m memory cache.
 * No paid APIs / no keys.
 */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('domain') || '';
  const result = await lookupWhois(raw);

  if (!result.success) {
    const status = result.available ? 404 : result.error.includes('valid domain') ? 400 : 502;
    return NextResponse.json(result, {
      status,
      headers: {
        'Cache-Control': result.available ? 'public, max-age=60' : 'no-store',
        'X-Lookup-Ms': String(result.latencyMs),
      },
    });
  }

  return NextResponse.json(result, {
    headers: {
      // Browser + edge can reuse for a few minutes
      'Cache-Control': 'public, max-age=120, s-maxage=300, stale-while-revalidate=600',
      'X-Lookup-Ms': String(result.latencyMs),
      'X-Rdap-Server': result.server,
    },
  });
}
