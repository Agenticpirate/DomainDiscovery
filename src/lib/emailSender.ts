/**
 * Free email delivery for domain status alerts.
 *
 * Priority:
 * 1. Resend API (free tier ~100 emails/day) when RESEND_API_KEY is set
 * 2. Generic webhook EMAIL_WEBHOOK_URL (Zapier/Make/n8n free tiers)
 * 3. Local outbox file under data/email-outbox/ (always works for dev)
 */
import { promises as fs } from 'fs';
import path from 'path';

export type OutboundEmail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type EmailResult = {
  ok: boolean;
  provider: 'resend' | 'webhook' | 'outbox';
  id?: string;
  error?: string;
};

const OUTBOX_DIR = path.join(process.cwd(), 'data', 'email-outbox');

async function writeOutbox(email: OutboundEmail, meta?: Record<string, unknown>): Promise<string> {
  await fs.mkdir(OUTBOX_DIR, { recursive: true });
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const file = path.join(OUTBOX_DIR, `${id}.json`);
  await fs.writeFile(
    file,
    JSON.stringify(
      {
        id,
        createdAt: new Date().toISOString(),
        ...email,
        meta: meta || {},
      },
      null,
      2
    ),
    'utf8'
  );
  return id;
}

async function sendResend(email: OutboundEmail): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, provider: 'resend', error: 'RESEND_API_KEY not set' };
  }

  const from =
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    'DomainDiscovery Alerts <onboarding@resend.dev>';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        html: email.html || undefined,
      }),
    });

    const body = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!response.ok) {
      return {
        ok: false,
        provider: 'resend',
        error: body.message || `Resend HTTP ${response.status}`,
      };
    }
    return { ok: true, provider: 'resend', id: body.id };
  } catch (error) {
    return {
      ok: false,
      provider: 'resend',
      error: error instanceof Error ? error.message : 'Resend request failed',
    };
  }
}

async function sendWebhook(email: OutboundEmail): Promise<EmailResult> {
  const url = process.env.EMAIL_WEBHOOK_URL;
  if (!url) {
    return { ok: false, provider: 'webhook', error: 'EMAIL_WEBHOOK_URL not set' };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'domain_watch_email',
        ...email,
        sentAt: new Date().toISOString(),
      }),
    });
    if (!response.ok) {
      return { ok: false, provider: 'webhook', error: `Webhook HTTP ${response.status}` };
    }
    return { ok: true, provider: 'webhook' };
  } catch (error) {
    return {
      ok: false,
      provider: 'webhook',
      error: error instanceof Error ? error.message : 'Webhook failed',
    };
  }
}

/**
 * Send an email using the best available free provider.
 * Always writes an outbox copy for audit / local free use.
 */
export async function sendEmail(email: OutboundEmail): Promise<EmailResult> {
  // Always keep a local copy (free, works offline)
  const outboxId = await writeOutbox(email);

  if (process.env.RESEND_API_KEY) {
    const resend = await sendResend(email);
    if (resend.ok) return { ...resend, id: resend.id || outboxId };
    // fall through
    await writeOutbox(email, { resendError: resend.error, outboxId });
  }

  if (process.env.EMAIL_WEBHOOK_URL) {
    const webhook = await sendWebhook(email);
    if (webhook.ok) return { ...webhook, id: outboxId };
  }

  // Free local mode — email content saved to data/email-outbox/
  return {
    ok: true,
    provider: 'outbox',
    id: outboxId,
  };
}

export function appBaseUrl(requestOrigin?: string | null): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (configured) return configured.replace(/\/$/, '');

  // Avoid 0.0.0.0 links from next dev host binding
  if (requestOrigin && !/0\.0\.0\.0|127\.0\.0\.1/.test(requestOrigin)) {
    return requestOrigin.replace(/\/$/, '');
  }
  if (requestOrigin?.includes('127.0.0.1')) {
    return requestOrigin.replace('127.0.0.1', 'localhost').replace(/\/$/, '');
  }
  return 'http://localhost:5001';
}

export function buildConfirmEmail(opts: {
  domain: string;
  email: string;
  confirmUrl: string;
  unsubscribeUrl: string;
}): OutboundEmail {
  const { domain, email, confirmUrl, unsubscribeUrl } = opts;
  const subject = `Confirm domain watch: ${domain}`;
  const text = [
    `You asked DomainDiscovery to watch ${domain} for free status updates.`,
    '',
    `Confirm this watch (required):`,
    confirmUrl,
    '',
    `We'll email ${email} when RDAP status, expiration, name servers, or availability changes.`,
    '',
    `Unsubscribe anytime:`,
    unsubscribeUrl,
    '',
    `— DomainDiscovery (free RDAP alerts)`,
  ].join('\n');

  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
      <h2 style="margin:0 0 12px">Confirm your free domain watch</h2>
      <p style="line-height:1.55;color:#334155">You asked to track <strong>${domain}</strong> for registration status changes.</p>
      <p style="margin:24px 0">
        <a href="${confirmUrl}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">
          Confirm free alerts
        </a>
      </p>
      <p style="font-size:13px;color:#64748b;line-height:1.5">
        Alerts go to ${email}. Unsubscribe anytime:
        <a href="${unsubscribeUrl}" style="color:#0f172a">unsubscribe</a>.
      </p>
    </div>
  `;

  return { to: email, subject, text, html };
}

export function buildChangeEmail(opts: {
  domain: string;
  email: string;
  changes: { type: string; detail: string }[];
  unsubscribeUrl: string;
  lookupUrl: string;
}): OutboundEmail {
  const { domain, email, changes, unsubscribeUrl, lookupUrl } = opts;
  const subject = `Domain update: ${domain}`;
  const lines = changes.map((c) => `• [${c.type}] ${c.detail}`).join('\n');
  const text = [
    `DomainDiscovery free alert for ${domain}`,
    '',
    'Changes detected:',
    lines,
    '',
    `View live WHOIS: ${lookupUrl}`,
    '',
    `Unsubscribe: ${unsubscribeUrl}`,
    '',
    `Sent free to ${email}`,
  ].join('\n');

  const htmlItems = changes
    .map(
      (c) =>
        `<li style="margin:0 0 8px"><span style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#64748b;margin-right:6px">${c.type}</span>${c.detail}</li>`
    )
    .join('');

  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
      <h2 style="margin:0 0 8px">Update on ${domain}</h2>
      <p style="color:#64748b;margin:0 0 16px">Free RDAP status watch · DomainDiscovery</p>
      <ul style="padding-left:18px;line-height:1.5;color:#334155">${htmlItems}</ul>
      <p style="margin:20px 0">
        <a href="${lookupUrl}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600">
          Open WHOIS
        </a>
      </p>
      <p style="font-size:12px;color:#94a3b8">
        <a href="${unsubscribeUrl}" style="color:#64748b">Unsubscribe</a> from this watch.
      </p>
    </div>
  `;

  return { to: email, subject, text, html };
}
