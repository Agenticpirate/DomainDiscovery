import { NextRequest, NextResponse } from 'next/server';
import {
  getTldMatrixRows,
  getTldPriceDatasetMeta,
  getTldPriceDetailSlim,
} from '@/lib/tldPriceData';

/**
 * Pricing API — keep heavy JSON on the server.
 * ?tld=.com  → slim detail for one extension
 * ?mode=matrix → compact matrix rows (for progressive client load if needed)
 * default → meta only
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tld = searchParams.get('tld');
  const mode = searchParams.get('mode');

  if (tld) {
    const detail = getTldPriceDetailSlim(tld);
    if (!detail) {
      return NextResponse.json({ error: 'TLD not found' }, { status: 404 });
    }
    return NextResponse.json(
      {
        meta: getTldPriceDatasetMeta(),
        detail,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  }

  if (mode === 'matrix') {
    return NextResponse.json(
      {
        meta: getTldPriceDatasetMeta(),
        matrixRows: getTldMatrixRows(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  }

  return NextResponse.json({
    meta: getTldPriceDatasetMeta(),
  });
}
