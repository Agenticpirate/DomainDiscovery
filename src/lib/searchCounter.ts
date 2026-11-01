const COUNT_KEY = 'dd.domainsSearched';
const SEEN_KEY = 'dd.domainsSearched.seen';
const EVENT_NAME = 'dd-search-count';

/** Floor so the public counter always reads as 20 million plus. */
export const SEARCH_COUNT_BASE = 20_000_000;

function canUseStorage() {
  return typeof window !== 'undefined';
}

function createSeed() {
  return SEARCH_COUNT_BASE + 100_000 + Math.floor(Math.random() * 3_400_000);
}

export function readSearchCount(): number {
  if (!canUseStorage()) return SEARCH_COUNT_BASE;
  try {
    const stored = Number(localStorage.getItem(COUNT_KEY));
    if (Number.isFinite(stored) && stored >= SEARCH_COUNT_BASE) return Math.floor(stored);
  } catch {
    /* private mode */
  }
  const seeded = createSeed();
  try {
    localStorage.setItem(COUNT_KEY, String(seeded));
  } catch {
    /* ignore */
  }
  return seeded;
}

export function readSeenSearchCount(): number | null {
  if (!canUseStorage()) return null;
  try {
    const seen = Number(sessionStorage.getItem(SEEN_KEY));
    if (Number.isFinite(seen) && seen >= SEARCH_COUNT_BASE) return Math.floor(seen);
  } catch {
    /* ignore */
  }
  return null;
}

export function markSearchCountSeen(count: number) {
  if (!canUseStorage()) return;
  try {
    sessionStorage.setItem(SEEN_KEY, String(Math.floor(count)));
  } catch {
    /* ignore */
  }
}

const recentChecks = new Map<string, number>();

/**
 * Add domains that were just checked.
 * The same batch inside a short window counts once so a double render
 * does not add twice. A later search of the same name counts again.
 */
export function recordDomainsChecked(count: number, dedupeKey?: string): number {
  const amount = Math.max(0, Math.floor(Number(count) || 0));
  const current = readSearchCount();
  if (amount <= 0 || !canUseStorage()) return current;

  if (dedupeKey) {
    const now = Date.now();
    for (const [key, at] of recentChecks) {
      if (now - at > 1500) recentChecks.delete(key);
    }
    const previousAt = recentChecks.get(dedupeKey);
    if (previousAt != null && now - previousAt < 1200) return current;
    recentChecks.set(dedupeKey, now);
  }

  const next = current + amount;
  try {
    localStorage.setItem(COUNT_KEY, String(next));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
  return next;
}

/** Count the domains in one committed search. */
export function recordDomainSearch(query: string, count = 1): number {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return readSearchCount();
  return recordDomainsChecked(count, `q:${normalized}:${count}`);
}

export function subscribeSearchCount(listener: (count: number) => void) {
  if (!canUseStorage()) return () => {};
  const onEvent = (event: Event) => {
    const detail = (event as CustomEvent<number>).detail;
    if (Number.isFinite(detail)) listener(detail);
  };
  window.addEventListener(EVENT_NAME, onEvent);
  return () => window.removeEventListener(EVENT_NAME, onEvent);
}
