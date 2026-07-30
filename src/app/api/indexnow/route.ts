import { NextRequest, NextResponse } from 'next/server';
import {
  getIndexNowDefaultUrls,
  getIndexNowKey,
  getIndexNowKeyLocation,
  submitIndexNow,
} from '@/lib/indexnowConfig';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

/**
 * IndexNow helper for Bing / Yandex / Naver / Seznam.
 * POST body: { "urlList": ["https://..."] } or omit to ping default GEO + tool URLs.
 * Optional: Authorization: Bearer $CRON_SECRET or ?secret= for production protection.
 *
 * Docs: https://www.indexnow.org/documentation
 */
function authorized(req: NextRequest): boolean {
  const secret = (process.env.CRON_SECRET || process.env.INDEXNOW_SECRET || '').trim();
  if (!secret) return true; // open in dev / when no secret configured
  const auth = req.headers.get('authorization') || '';
  if (auth === `Bearer ${secret}`) return true;
  if (req.nextUrl.searchParams.get('secret') === secret) return true;
  return false;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const base = getSiteBaseUrl();
  let urlList: string[] | undefined;

  try {
    const body = (await req.json().catch(() => ({}))) as { urlList?: string[] };
    if (Array.isArray(body.urlList) && body.urlList.length > 0) {
      urlList = body.urlList.filter((u) => typeof u === 'string' && u.startsWith(base));
    }
  } catch {
    /* empty → defaults */
  }

  const result = await submitIndexNow(urlList);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

export async function GET(req: NextRequest) {
  const base = getSiteBaseUrl();
  return NextResponse.json({
    ok: true,
    keyLocation: getIndexNowKeyLocation(),
    keyConfigured: Boolean(getIndexNowKey()),
    defaultUrlCount: getIndexNowDefaultUrls().length,
    usage: `POST ${base}/api/indexnow with optional { "urlList": ["${base}/..."] }`,
    note: 'Key is served at /.well-known/indexnow.txt. Set INDEXNOW_KEY to override the default key. Set CRON_SECRET to protect POST in production.',
  });
}
