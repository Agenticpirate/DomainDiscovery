/**
 * File-backed domain watch store (free, no database required).
 * Persists under /data so it survives restarts on a single server.
 */
import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes, createHash } from 'crypto';

export type WatchEventType = 'status' | 'expiration' | 'nameservers' | 'availability';

export interface DomainSnapshot {
  status: string;
  statuses: string[];
  registrar: string;
  expirationDateIso: string | null;
  nameServers: string[];
  available: boolean;
  checkedAt: string;
}

export interface DomainWatch {
  id: string;
  domain: string;
  email: string;
  events: WatchEventType[];
  /** Email ownership confirmed */
  confirmed: boolean;
  confirmToken: string;
  unsubscribeToken: string;
  createdAt: string;
  confirmedAt: string | null;
  lastCheckedAt: string | null;
  lastNotifiedAt: string | null;
  snapshot: DomainSnapshot | null;
  active: boolean;
}

interface WatchStoreFile {
  version: 1;
  watches: DomainWatch[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'domain-watches.json');
const MAX_WATCHES_PER_EMAIL = 15;

async function ensureStore(): Promise<WatchStoreFile> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as WatchStoreFile;
    if (!parsed.watches) return { version: 1, watches: [] };
    return parsed;
  } catch {
    const empty: WatchStoreFile = { version: 1, watches: [] };
    await fs.writeFile(STORE_PATH, JSON.stringify(empty, null, 2), 'utf8');
    return empty;
  }
}

async function writeStore(store: WatchStoreFile): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${STORE_PATH}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), 'utf8');
  await fs.rename(tmp, STORE_PATH);
}

function token(): string {
  return randomBytes(24).toString('hex');
}

function id(): string {
  return createHash('sha1').update(`${Date.now()}-${token()}`).digest('hex').slice(0, 16);
}

export function normalizeEmail(email: string): string | null {
  const value = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
  if (value.length > 200) return null;
  return value;
}

export async function listWatchesByEmail(email: string): Promise<DomainWatch[]> {
  const store = await ensureStore();
  const normalized = normalizeEmail(email);
  if (!normalized) return [];
  return store.watches.filter((w) => w.email === normalized && w.active);
}

export async function getWatchById(watchId: string): Promise<DomainWatch | null> {
  const store = await ensureStore();
  return store.watches.find((w) => w.id === watchId) || null;
}

export async function getWatchByConfirmToken(confirmToken: string): Promise<DomainWatch | null> {
  const store = await ensureStore();
  return store.watches.find((w) => w.confirmToken === confirmToken) || null;
}

export async function getWatchByUnsubscribeToken(unsubscribeToken: string): Promise<DomainWatch | null> {
  const store = await ensureStore();
  return store.watches.find((w) => w.unsubscribeToken === unsubscribeToken) || null;
}

export async function createWatch(input: {
  domain: string;
  email: string;
  events: WatchEventType[];
  snapshot?: DomainSnapshot | null;
}): Promise<{ watch: DomainWatch; created: boolean; reason?: string }> {
  const email = normalizeEmail(input.email);
  if (!email) {
    throw new Error('Enter a valid email address.');
  }

  const domain = input.domain.trim().toLowerCase();
  const events = (input.events.length ? input.events : (['status', 'expiration'] as WatchEventType[])).filter(
    (e, i, arr) => arr.indexOf(e) === i
  );

  const store = await ensureStore();
  const existingActive = store.watches.filter((w) => w.email === email && w.active);

  const duplicate = existingActive.find((w) => w.domain === domain);
  if (duplicate) {
    // refresh events if re-subscribed
    duplicate.events = events;
    if (input.snapshot) duplicate.snapshot = input.snapshot;
    await writeStore(store);
    return { watch: duplicate, created: false, reason: 'already_watching' };
  }

  if (existingActive.length >= MAX_WATCHES_PER_EMAIL) {
    throw new Error(`Free plan allows up to ${MAX_WATCHES_PER_EMAIL} domain watches per email.`);
  }

  const watch: DomainWatch = {
    id: id(),
    domain,
    email,
    events,
    confirmed: false,
    confirmToken: token(),
    unsubscribeToken: token(),
    createdAt: new Date().toISOString(),
    confirmedAt: null,
    lastCheckedAt: null,
    lastNotifiedAt: null,
    snapshot: input.snapshot || null,
    active: true,
  };

  store.watches.push(watch);
  await writeStore(store);
  return { watch, created: true };
}

export async function confirmWatch(confirmToken: string): Promise<DomainWatch | null> {
  const store = await ensureStore();
  const watch = store.watches.find((w) => w.confirmToken === confirmToken && w.active);
  if (!watch) return null;
  watch.confirmed = true;
  watch.confirmedAt = new Date().toISOString();
  await writeStore(store);
  return watch;
}

export async function unsubscribeWatch(unsubscribeToken: string): Promise<DomainWatch | null> {
  const store = await ensureStore();
  const watch = store.watches.find((w) => w.unsubscribeToken === unsubscribeToken);
  if (!watch) return null;
  watch.active = false;
  await writeStore(store);
  return watch;
}

export async function listActiveConfirmedWatches(): Promise<DomainWatch[]> {
  const store = await ensureStore();
  return store.watches.filter((w) => w.active && w.confirmed);
}

export async function updateWatchSnapshot(
  watchId: string,
  snapshot: DomainSnapshot,
  opts?: { notified?: boolean }
): Promise<void> {
  const store = await ensureStore();
  const watch = store.watches.find((w) => w.id === watchId);
  if (!watch) return;
  watch.snapshot = snapshot;
  watch.lastCheckedAt = snapshot.checkedAt;
  if (opts?.notified) {
    watch.lastNotifiedAt = new Date().toISOString();
  }
  await writeStore(store);
}

export function diffSnapshots(
  prev: DomainSnapshot | null,
  next: DomainSnapshot,
  events: WatchEventType[]
): { type: WatchEventType; detail: string }[] {
  const changes: { type: WatchEventType; detail: string }[] = [];
  if (!prev) return changes;

  if (events.includes('status')) {
    const prevStatuses = [...prev.statuses].sort().join('|');
    const nextStatuses = [...next.statuses].sort().join('|');
    if (prevStatuses !== nextStatuses || prev.status !== next.status) {
      changes.push({
        type: 'status',
        detail: `Status changed: "${prev.status}" → "${next.status}"`,
      });
    }
  }

  if (events.includes('expiration')) {
    if ((prev.expirationDateIso || '') !== (next.expirationDateIso || '')) {
      changes.push({
        type: 'expiration',
        detail: `Expiration changed: ${prev.expirationDateIso || '—'} → ${next.expirationDateIso || '—'}`,
      });
    }
  }

  if (events.includes('nameservers')) {
    const a = [...prev.nameServers].map((s) => s.toLowerCase()).sort().join(',');
    const b = [...next.nameServers].map((s) => s.toLowerCase()).sort().join(',');
    if (a !== b) {
      changes.push({
        type: 'nameservers',
        detail: `Name servers changed (${prev.nameServers.length} → ${next.nameServers.length})`,
      });
    }
  }

  if (events.includes('availability')) {
    if (prev.available !== next.available) {
      changes.push({
        type: 'availability',
        detail: next.available
          ? 'Domain appears available / not found in RDAP'
          : 'Domain is now registered in RDAP',
      });
    }
  }

  return changes;
}

export { MAX_WATCHES_PER_EMAIL };
