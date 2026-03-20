import { NextRequest, NextResponse } from 'next/server';
import { getTldPriceDatasetMeta, getTldPriceDetail, getTldPriceSummaryList } from '@/lib/tldPriceData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tld = searchParams.get('tld');

  if (tld) {
    const detail = getTldPriceDetail(tld);

    if (!detail) {
      return NextResponse.json({ error: 'TLD not found' }, { status: 404 });
    }

    return NextResponse.json({
      meta: getTldPriceDatasetMeta(),
      detail,
    });
  }

  return NextResponse.json({
    meta: getTldPriceDatasetMeta(),
    summaries: getTldPriceSummaryList(),
  });
}
