/**
 * Global + process heavy-work concurrency limits (load shedding).
 * Prevents thundering herds against Instant Domain / brand pipeline.
 */

import { getRedis } from './redisClient';

declare global {
  // eslint-disable-next-line no-var
  var __adaHeavyInFlight: number | undefined;
}

function maxHeavy(): number {
  const n = parseInt(process.env.ADA_MAX_HEAVY_CONCURRENT || '32', 10);
  return Number.isFinite(n) && n > 0 ? n : 32;
}

function maxHeavyGlobal(): number {
  const n = parseInt(process.env.ADA_MAX_HEAVY_CONCURRENT_GLOBAL || '', 10);
  if (Number.isFinite(n) && n > 0) return n;
  // Default: 4× per-process when multi-instance (override in prod)
  return maxHeavy() * 4;
}

function localInFlight(): number {
  return globalThis.__adaHeavyInFlight ?? 0;
}

function setLocalInFlight(n: number) {
  globalThis.__adaHeavyInFlight = Math.max(0, n);
}

export type ConcurrencyAcquire =
  | { ok: true; release: () => Promise<void>; local: number; global?: number }
  | { ok: false; reason: 'local' | 'global'; local: number; global?: number; limit: number };

const GLOBAL_KEY = 'ada:heavy:inflight';

/**
 * Try to enter a heavy work slot. Always call release() in finally.
 */
export async function acquireHeavySlot(): Promise<ConcurrencyAcquire> {
  const localLimit = maxHeavy();
  const globalLimit = maxHeavyGlobal();

  // Process-local first (cheap)
  if (localInFlight() >= localLimit) {
    return { ok: false, reason: 'local', local: localInFlight(), limit: localLimit };
  }

  setLocalInFlight(localInFlight() + 1);

  const r = getRedis();
  if (!r) {
    return {
      ok: true,
      local: localInFlight(),
      release: async () => {
        setLocalInFlight(localInFlight() - 1);
      },
    };
  }

  try {
    const count = await r.incr(GLOBAL_KEY);
    // keep key alive while traffic exists
    await r.expire(GLOBAL_KEY, 120);
    if (count > globalLimit) {
      await r.decr(GLOBAL_KEY);
      setLocalInFlight(localInFlight() - 1);
      return {
        ok: false,
        reason: 'global',
        local: localInFlight(),
        global: count - 1,
        limit: globalLimit,
      };
    }
    return {
      ok: true,
      local: localInFlight(),
      global: count,
      release: async () => {
        setLocalInFlight(localInFlight() - 1);
        try {
          const left = await r.decr(GLOBAL_KEY);
          if (left < 0) {
            // repair underflow
            await r.set(GLOBAL_KEY, '0');
          }
        } catch {
          /* ignore */
        }
      },
    };
  } catch {
    // Redis fail-open on concurrency (still hold local slot)
    return {
      ok: true,
      local: localInFlight(),
      release: async () => {
        setLocalInFlight(localInFlight() - 1);
      },
    };
  }
}

export function concurrencyStatus() {
  return {
    localInFlight: localInFlight(),
    localLimit: maxHeavy(),
    globalLimit: maxHeavyGlobal(),
  };
}

/** Run heavy work with automatic slot release */
export async function withHeavySlot<T>(fn: () => Promise<T>): Promise<T> {
  const slot = await acquireHeavySlot();
  if (!slot.ok) {
    const err = new Error(
      `Service busy (${slot.reason} concurrency). Retry after a few seconds. limit=${slot.limit}`
    ) as Error & { statusCode?: number; retryAfter?: number };
    err.statusCode = 503;
    err.retryAfter = 5;
    throw err;
  }
  try {
    return await fn();
  } finally {
    await slot.release();
  }
}
