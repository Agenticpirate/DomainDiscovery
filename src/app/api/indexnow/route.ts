import { NextRequest, NextResponse } from 'next/server';
import { getSiteBaseUrl, SITE_CORE_PATHS } from '@/lib/seoSiteFacts';

/**
 * IndexNow helper for Bing / Yandex / Naver / Seznam.
 * POST body: { "urlList": ["https://..."] } or omit to ping core routes.
 * Requires INDEXNOW_KEY env (key file also served at /{key}.txt if configured).
 *
 * Docs: https://www.indexnow.org/documentation
 */
export async function POST(req: NextRequest) {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'INDEXNOW_KEY is not set. Generate a key, host it at https://www.domainsdiscovery.com/{key}.txt, and set INDEXNOW_KEY in env.',
      },
      { status: 503 }
    );
  }

  const base = getSiteBaseUrl();
  let urlList: string[] = [];

  try {
    const body = (await req.json().catch(() => ({}))) as { urlList?: string[] };
    if (Array.isArray(body.urlList) && body.urlList.length > 0) {
      urlList = body.urlList.filter((u) => typeof u === 'string' && u.startsWith(base));
    }
  } catch {
    /* empty body → default core URLs */
  }

  if (urlList.length === 0) {
    urlList = SITE_CORE_PATHS.filter((p) => p.priority === 'primary').map((p) =>
      p.path === '/' ? base : `${base}${p.path}`
    );
  }

  // IndexNow allows max 10,000 URLs; we cap at 100 for safety
  urlList = urlList.slice(0, 100);

  const payload = {
    host: new URL(base).host,
    key,
    keyLocation: `${base}/${key}.txt`,
    urlList,
  };

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow',
  ];

  const results: Array<{ endpoint: string; status: number }> = [];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });
      results.push({ endpoint, status: res.status });
    } catch {
      results.push({ endpoint, status: 0 });
    }
  }

  return NextResponse.json({
    ok: results.some((r) => r.status >= 200 && r.status < 300 || r.status === 202),
    submitted: urlList.length,
    results,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage: 'POST /api/indexnow with optional { "urlList": ["https://www.domainsdiscovery.com/..."] }',
    note: 'Requires INDEXNOW_KEY env + public /{key}.txt key file',
  });
}
