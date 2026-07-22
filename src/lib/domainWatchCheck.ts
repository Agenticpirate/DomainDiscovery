/**
 * Poll RDAP for watched domains and email free status-change alerts.
 */
import { lookupWhois } from '@/lib/rdapClient';
import {
  diffSnapshots,
  listActiveConfirmedWatches,
  updateWatchSnapshot,
  type DomainSnapshot,
  type DomainWatch,
} from '@/lib/domainWatchStore';
import { appBaseUrl, buildChangeEmail, sendEmail } from '@/lib/emailSender';

function snapshotFromLookup(
  domain: string,
  result: Awaited<ReturnType<typeof lookupWhois>>
): DomainSnapshot {
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

export type CheckSummary = {
  checked: number;
  changed: number;
  emailed: number;
  errors: number;
  details: {
    domain: string;
    email: string;
    changes: string[];
    emailed: boolean;
    error?: string;
  }[];
};

export async function runDomainWatchCheck(opts?: {
  origin?: string | null;
  limit?: number;
}): Promise<CheckSummary> {
  const watches = await listActiveConfirmedWatches();
  const limit = opts?.limit ?? watches.length;
  const batch = watches.slice(0, Math.max(0, limit));
  const base = appBaseUrl(opts?.origin);

  const summary: CheckSummary = {
    checked: 0,
    changed: 0,
    emailed: 0,
    errors: 0,
    details: [],
  };

  // sequential to stay friendly to free RDAP registries
  for (const watch of batch) {
    summary.checked += 1;
    try {
      const result = await lookupWhois(watch.domain);
      const next = snapshotFromLookup(watch.domain, result);
      const changes = diffSnapshots(watch.snapshot, next, watch.events);

      if (changes.length === 0) {
        await updateWatchSnapshot(watch.id, next);
        continue;
      }

      summary.changed += 1;
      const emailPayload = buildChangeEmail({
        domain: watch.domain,
        email: watch.email,
        changes,
        unsubscribeUrl: `${base}/api/domains/watch/unsubscribe?token=${watch.unsubscribeToken}`,
        lookupUrl: `${base}/tools/whois?domain=${encodeURIComponent(watch.domain)}`,
      });

      const sent = await sendEmail(emailPayload);
      await updateWatchSnapshot(watch.id, next, { notified: sent.ok });

      if (sent.ok) summary.emailed += 1;
      summary.details.push({
        domain: watch.domain,
        email: watch.email,
        changes: changes.map((c) => c.detail),
        emailed: sent.ok,
        error: sent.ok ? undefined : sent.error,
      });
    } catch (error) {
      summary.errors += 1;
      summary.details.push({
        domain: watch.domain,
        email: watch.email,
        changes: [],
        emailed: false,
        error: error instanceof Error ? error.message : 'Check failed',
      });
    }
  }

  return summary;
}

export async function seedSnapshotForWatch(watch: DomainWatch): Promise<DomainSnapshot> {
  const result = await lookupWhois(watch.domain);
  const snap = snapshotFromLookup(watch.domain, result);
  await updateWatchSnapshot(watch.id, snap);
  return snap;
}
