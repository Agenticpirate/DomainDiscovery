import { NextRequest, NextResponse } from 'next/server';
import { runDomainWatchCheck } from '@/lib/domainWatchCheck';
import { FEATURE_FLAGS } from '@/lib/featureFlags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Cron / manual job: re-check all confirmed watches via RDAP and email changes.
 *
 * Protect with CRON_SECRET header in production:
 *   Authorization: Bearer <CRON_SECRET>
 *   or x-cron-secret: <CRON_SECRET>
 *
 * Free external cron (cron-job.org, EasyCron, GitHub Actions) can hit this daily.
 */
export async function POST(request: NextRequest) {
  if (!FEATURE_FLAGS.domainWatch) {
    return NextResponse.json(
      { success: false, error: 'Domain watch is disabled.', code: 'FEATURE_DISABLED' },
      { status: 503 }
    );
  }

  const secret = process.env.CRON_SECRET || process.env.WATCH_CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization') || '';
    const header = request.headers.get('x-cron-secret') || '';
    const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (header !== secret && bearer !== secret) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = limitParam ? Number(limitParam) : undefined;

  const summary = await runDomainWatchCheck({
    origin: request.nextUrl.origin,
    limit: Number.isFinite(limit) ? limit : undefined,
  });

  return NextResponse.json({
    success: true,
    ...summary,
    tip: 'Schedule POST /api/domains/watch/check daily (free cron). Set RESEND_API_KEY for real inbox delivery.',
  });
}

/** GET for easy browser/cron ping (same auth rules) */
export async function GET(request: NextRequest) {
  return POST(request);
}
