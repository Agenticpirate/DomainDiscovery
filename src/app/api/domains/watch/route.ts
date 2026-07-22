import { NextRequest, NextResponse } from 'next/server';
import { lookupWhois } from '@/lib/rdapClient';
import {
  createWatch,
  listWatchesByEmail,
  normalizeEmail,
  type DomainSnapshot,
  type WatchEventType,
} from '@/lib/domainWatchStore';
import { appBaseUrl, buildConfirmEmail, sendEmail } from '@/lib/emailSender';
import { FEATURE_FLAGS } from '@/lib/featureFlags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_EVENTS: WatchEventType[] = ['status', 'expiration', 'nameservers', 'availability'];

function snapshotFromWhois(domain: string, result: Awaited<ReturnType<typeof lookupWhois>>): DomainSnapshot {
  const checkedAt = new Date().toISOString();
  if (!result.success) {
    return {
      status: result.available ? 'not registered / not in RDAP' : 'lookup failed',
      statuses: result.available ? ['available'] : ['error'],
      registrar: '—',
      expirationDateIso: null,
      nameServers: [],
      available: Boolean(result.available),
      checkedAt,
    };
  }
  return {
    status: result.status,
    statuses: result.statuses || [result.status],
    registrar: result.registrar,
    expirationDateIso: result.expirationDateIso,
    nameServers: result.nameServers || [],
    available: false,
    checkedAt,
  };
}

/** Create a free domain status watch + send confirm email */
export async function POST(request: NextRequest) {
  if (!FEATURE_FLAGS.domainWatch) {
    return NextResponse.json(
      {
        success: false,
        error: 'Domain watch is temporarily unavailable. Check back soon.',
        code: 'FEATURE_DISABLED',
      },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      domain?: string;
      email?: string;
      events?: string[];
    };

    const domain = (body.domain || '').trim().toLowerCase();
    const email = normalizeEmail(body.email || '');
    if (!domain || !email) {
      return NextResponse.json(
        { success: false, error: 'Domain and a valid email are required.' },
        { status: 400 }
      );
    }

    const events = (body.events || ['status', 'expiration', 'availability'])
      .map((e) => e.toLowerCase())
      .filter((e): e is WatchEventType => ALLOWED_EVENTS.includes(e as WatchEventType));

    // Capture current RDAP snapshot as baseline
    const whois = await lookupWhois(domain);
    const snapshot = snapshotFromWhois(domain, whois);

    const { watch, created, reason } = await createWatch({
      domain: whois.success ? whois.domain : domain,
      email,
      events: events.length ? events : ['status', 'expiration', 'availability'],
      snapshot,
    });

    const origin = request.nextUrl.origin;
    const base = appBaseUrl(origin);
    const confirmUrl = `${base}/api/domains/watch/confirm?token=${watch.confirmToken}`;
    const unsubscribeUrl = `${base}/api/domains/watch/unsubscribe?token=${watch.unsubscribeToken}`;

    // Always send / re-send confirm if not confirmed yet
    let emailResult = null;
    if (!watch.confirmed) {
      emailResult = await sendEmail(
        buildConfirmEmail({
          domain: watch.domain,
          email: watch.email,
          confirmUrl,
          unsubscribeUrl,
        })
      );
    }

    return NextResponse.json({
      success: true,
      created,
      reason: reason || null,
      watch: {
        id: watch.id,
        domain: watch.domain,
        email: watch.email,
        events: watch.events,
        confirmed: watch.confirmed,
        createdAt: watch.createdAt,
      },
      email: emailResult
        ? {
            sent: emailResult.ok,
            provider: emailResult.provider,
            // Helpful in local free mode
            note:
              emailResult.provider === 'outbox'
                ? 'Confirm email saved to data/email-outbox/ (set RESEND_API_KEY for real inbox delivery).'
                : `Confirm email sent via ${emailResult.provider}.`,
          }
        : { sent: false, provider: null, note: 'Already confirmed — watch is active.' },
      baseline: {
        status: snapshot.status,
        expirationDateIso: snapshot.expirationDateIso,
        nameServers: snapshot.nameServers,
        available: snapshot.available,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Could not create watch.',
      },
      { status: 400 }
    );
  }
}

/** List active watches for an email (simple free management) */
export async function GET(request: NextRequest) {
  const email = normalizeEmail(request.nextUrl.searchParams.get('email') || '');
  if (!email) {
    return NextResponse.json({ success: false, error: 'email query required' }, { status: 400 });
  }

  const watches = await listWatchesByEmail(email);
  return NextResponse.json({
    success: true,
    watches: watches.map((w) => ({
      id: w.id,
      domain: w.domain,
      events: w.events,
      confirmed: w.confirmed,
      createdAt: w.createdAt,
      lastCheckedAt: w.lastCheckedAt,
      lastNotifiedAt: w.lastNotifiedAt,
      snapshot: w.snapshot
        ? {
            status: w.snapshot.status,
            expirationDateIso: w.snapshot.expirationDateIso,
            available: w.snapshot.available,
          }
        : null,
    })),
  });
}
