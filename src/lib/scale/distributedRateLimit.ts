/**
 * Distributed sliding-window rate limit (Redis) with in-memory fallback.
 * Compatible with existing RateLimitResult shape.
 */

import type { RateLimitResult } from '@/lib/rateLimiter';
import { getRedis } from './redisClient';

const WINDOW_MS = 60_000;

type MemEntry = { timestamps: number[]; lastAccess: number };
const mem = new Map<string, MemEntry>();
const MAX_MEM = 50_000;

function memCheck(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  let entry = mem.get(key);
  if (!entry) {
    if (mem.size >= MAX_MEM) {
      let oldestKey: string | null = null;
      let oldest = Infinity;
      const entries = Array.from(mem.entries());
      for (let i = 0; i < entries.length; i++) {
        const k = entries[i][0];
        const e = entries[i][1];
        if (e.lastAccess < oldest) {
          oldest = e.lastAccess;
          oldestKey = k;
        }
      }
      if (oldestKey) mem.delete(oldestKey);
    }
    entry = { timestamps: [], lastAccess: now };
    mem.set(key, entry);
  }
  entry.lastAccess = now;
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);
  const allowed = entry.timestamps.length < limit;
  if (allowed) entry.timestamps.push(now);
  const oldestTs = entry.timestamps[0] ?? now;
  const resetTime = Math.ceil((oldestTs + windowMs) / 1000);
  const retryAfter = allowed ? 0 : Math.max(1, Math.ceil((oldestTs + windowMs - now) / 1000));
  return {
    allowed,
    remaining: Math.max(0, limit - entry.timestamps.length),
    resetTime,
    retryAfter,
    limit,
  };
}

/** Redis sorted-set sliding window (ZADD + ZREMRANGEBYSCORE + ZCARD). */
async function redisCheck(key: string, limit: number, windowMs: number): Promise<RateLimitResult | null> {
  const r = getRedis();
  if (!r) return null;
  const now = Date.now();
  const windowStart = now - windowMs;
  const member = `${now}:${Math.random().toString(36).slice(2, 9)}`;
  const redisKey = `rl:v1:${key}`;

  const script = `
    redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[1])
    local count = redis.call('ZCARD', KEYS[1])
    if count < tonumber(ARGV[2]) then
      redis.call('ZADD', KEYS[1], ARGV[3], ARGV[4])
      redis.call('PEXPIRE', KEYS[1], ARGV[5])
      count = count + 1
      return {1, count, ARGV[2]}
    end
    local oldest = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')
    local oldestScore = oldest[2] or ARGV[3]
    return {0, count, ARGV[2], oldestScore}
  `;

  try {
    const raw = (await r.eval(
      script,
      1,
      redisKey,
      String(windowStart),
      String(limit),
      String(now),
      member,
      String(windowMs + 1_000)
    )) as (string | number)[];

    const allowed = Number(raw[0]) === 1;
    const count = Number(raw[1]) || 0;
    const lim = Number(raw[2]) || limit;
    const oldestScore = Number(raw[3] ?? now);
    const resetTime = Math.ceil((oldestScore + windowMs) / 1000);
    const retryAfter = allowed ? 0 : Math.max(1, Math.ceil((oldestScore + windowMs - now) / 1000));
    return {
      allowed,
      remaining: Math.max(0, lim - count),
      resetTime,
      retryAfter,
      limit: lim,
    };
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[scale] redis rate limit failed, memory fallback:', e instanceof Error ? e.message : e);
    }
    return null;
  }
}

/**
 * Check rate limit for a bucket key.
 * Prefers Redis when available; otherwise process memory.
 */
export async function checkDistributedRateLimit(
  key: string,
  limit: number,
  windowMs: number = WINDOW_MS
): Promise<RateLimitResult> {
  const safeLimit = Math.max(1, Math.floor(limit));
  const fromRedis = await redisCheck(key, safeLimit, windowMs);
  if (fromRedis) return fromRedis;
  return memCheck(key, safeLimit, windowMs);
}

/** Reset helpers for tests */
export function resetMemoryRateLimits() {
  mem.clear();
}
