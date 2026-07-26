/**
 * Optional Redis client for multi-instance scale (rate limits, jobs, concurrency).
 * Falls back silently to null when REDIS_URL is unset or connection fails.
 */

import Redis from 'ioredis';

export type RedisLike = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<unknown>;
  setex(key: string, seconds: number, value: string): Promise<unknown>;
  del(...keys: string[]): Promise<number>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  decr(key: string): Promise<number>;
  ttl(key: string): Promise<number>;
  eval(script: string, numKeys: number, ...args: (string | number)[]): Promise<unknown>;
  ping(): Promise<string>;
  status?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __adaRedisClient: Redis | null | undefined;
  // eslint-disable-next-line no-var
  var __adaRedisDisabled: boolean | undefined;
  // eslint-disable-next-line no-var
  var __adaRedisBackend: 'redis' | 'memory' | undefined;
}

function redisUrl(): string | null {
  const url = (process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL || '').trim();
  return url || null;
}

/** True when REDIS_URL is configured (may still fail open to memory). */
export function isRedisConfigured(): boolean {
  return Boolean(redisUrl());
}

export function getRedisBackend(): 'redis' | 'memory' {
  return globalThis.__adaRedisBackend || (isRedisConfigured() ? 'redis' : 'memory');
}

/**
 * Lazy singleton. Returns null when unset or after repeated connection failures.
 * Never throws to callers — scale features degrade to in-process memory.
 */
export function getRedis(): RedisLike | null {
  if (globalThis.__adaRedisDisabled) return null;
  const url = redisUrl();
  if (!url) {
    globalThis.__adaRedisBackend = 'memory';
    return null;
  }

  if (globalThis.__adaRedisClient) {
    globalThis.__adaRedisBackend = 'redis';
    return globalThis.__adaRedisClient as unknown as RedisLike;
  }

  try {
    const client = new Redis(url, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
      connectTimeout: 2_500,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 1_000);
      },
    });

    client.on('error', (err) => {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('[scale] redis error:', err.message);
      }
    });

    // Fire-and-forget connect (ioredis v5+)
    const maybeConnect = (client as Redis & { connect?: () => Promise<void> }).connect;
    if (typeof maybeConnect === 'function') {
      void maybeConnect.call(client).catch((err: Error) => {
        console.warn('[scale] redis connect failed — using memory:', err.message);
        globalThis.__adaRedisDisabled = true;
        globalThis.__adaRedisBackend = 'memory';
        try {
          client.disconnect();
        } catch {
          /* ignore */
        }
        globalThis.__adaRedisClient = null;
      });
    }

    globalThis.__adaRedisClient = client;
    globalThis.__adaRedisBackend = 'redis';
    return client as unknown as RedisLike;
  } catch (e) {
    console.warn('[scale] redis init failed — using memory:', e instanceof Error ? e.message : e);
    globalThis.__adaRedisDisabled = true;
    globalThis.__adaRedisBackend = 'memory';
    return null;
  }
}

/** Health ping — never throws. */
export async function redisPing(): Promise<{ ok: boolean; backend: 'redis' | 'memory'; latencyMs?: number }> {
  const backend = getRedisBackend();
  const r = getRedis();
  if (!r) return { ok: true, backend: 'memory' };
  const t0 = Date.now();
  try {
    const pong = await Promise.race([
      r.ping(),
      new Promise<string>((_, rej) => setTimeout(() => rej(new Error('ping timeout')), 1500)),
    ]);
    return { ok: pong === 'PONG' || pong === 'pong', backend: 'redis', latencyMs: Date.now() - t0 };
  } catch {
    return { ok: false, backend, latencyMs: Date.now() - t0 };
  }
}
