import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import learnData from '@/data/learn-articles.json';
import { isLearnArticlePublished, learnTodayUTC } from '@/lib/learnArticles';
import { submitIndexNow } from '@/lib/indexnowConfig';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ArticleRow = {
  slug: string;
  title: string;
  publishedAt?: string;
  batch?: string;
  scheduleSlot?: string;
};

function authorize(req: NextRequest): boolean {
  const secrets = [
    process.env.SEO_CRON_SECRET,
    process.env.REVALIDATE_SECRET,
    process.env.CRON_SECRET,
  ].filter(Boolean) as string[];
  if (secrets.length === 0) {
    // Allow in non-production so local checks work; production requires a secret.
    return process.env.NODE_ENV !== 'production';
  }
  const header = req.headers.get('authorization') || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : '';
  const q = req.nextUrl.searchParams.get('secret') || '';
  return secrets.some((s) => bearer === s || q === s);
}

/**
 * Daily SEO drip unlock helper.
 * Date-gate already publishes by clock; this endpoint revalidates caches and
 * returns which articles are live / due today for monitoring & GitHub Actions.
 *
 * GET /api/cron/seo-publish?secret=…
 */
export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const today = learnTodayUTC();
  const articles = (learnData as { articles: ArticleRow[] }).articles || [];
  const batch = articles.filter((a) => a.batch === 'seo-100' || a.scheduleSlot);

  const live = batch.filter((a) => isLearnArticlePublished(a, today));
  const dueToday = batch.filter((a) => a.publishedAt === today);
  const upcoming = batch
    .filter((a) => a.publishedAt && a.publishedAt > today)
    .sort((a, b) => (a.publishedAt || '').localeCompare(b.publishedAt || ''));

  // Bust Learn + sitemap caches so new day's articles appear immediately
  try {
    revalidatePath('/learn');
    revalidatePath('/sitemap.xml');
    revalidatePath('/feed.xml');
    for (const a of dueToday) {
      revalidatePath(`/learn/${a.slug}`);
      revalidatePath(`/learn/md/${a.slug}`);
    }
    // Also revalidate recently live (last 7 days of batch) in case of lag
    for (const a of live.slice(-21)) {
      revalidatePath(`/learn/${a.slug}`);
    }
  } catch (e) {
    console.error('seo-publish revalidatePath error', e);
  }

  // Ping IndexNow (Bing / Yandex / etc.) so new Learn pages enter non-Google indexes fast
  const base = getSiteBaseUrl();
  let indexNow: Awaited<ReturnType<typeof submitIndexNow>> | null = null;
  try {
    const pingUrls = [
      `${base}/`,
      `${base}/learn`,
      `${base}/sitemap.xml`,
      `${base}/feed.xml`,
      ...dueToday.flatMap((a) => [`${base}/learn/${a.slug}`, `${base}/learn/md/${a.slug}`]),
      ...live.slice(-10).map((a) => `${base}/learn/${a.slug}`),
    ];
    indexNow = await submitIndexNow(Array.from(new Set(pingUrls)));
  } catch (e) {
    console.error('seo-publish IndexNow error', e);
  }

  const remaining = upcoming.length;
  const exhausted = remaining === 0 && batch.length > 0;

  return NextResponse.json({
    ok: true,
    today,
    cadence: 'date-gated (min 2/day scheduled in learn-articles.json)',
    seoBatch: {
      total: batch.length,
      live: live.length,
      dueToday: dueToday.length,
      remaining,
      exhausted,
    },
    publishingToday: dueToday.map((a) => ({
      slug: a.slug,
      title: a.title,
      path: `/learn/${a.slug}`,
    })),
    nextDays: Array.from(
      new Set(upcoming.map((a) => a.publishedAt).filter((d): d is string => Boolean(d)))
    ).slice(0, 5),
    revalidated: true,
    indexNow,
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
