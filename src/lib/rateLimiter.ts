/**
 * Production Rate Limiter (process-local, legacy domain/search routes).
 *
 * Agent/MCP scale path uses `@/lib/scale` (distributed Redis when REDIS_URL is set,
 * dual light/heavy tiers, per-agent quotas, concurrency load-shed).
 *
 * This module remains for search/bulk/generate legacy IP buckets + shared types.
 * In-memory store uses an LRU map capped at 50k entries to prevent OOM.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter: number;
  limit: number;
}

export interface RateLimiterConfig {
  requestsPerMinute: number;
  windowMs?: number;
}

interface SlidingWindowEntry {
  timestamps: number[];
  lastAccess: number;
}

const MAX_ENTRIES = 50_000;
export const DEFAULT_WINDOW_MS = 60_000;
export const DEFAULT_REQUESTS_PER_MINUTE = 60;

export class RateLimiter {
  private store = new Map<string, SlidingWindowEntry>();
  private readonly limit: number;
  private readonly windowMs: number;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: RateLimiterConfig) {
    this.limit = config.requestsPerMinute;
    this.windowMs = config.windowMs ?? DEFAULT_WINDOW_MS;
    // Cleanup every 2 minutes
    this.cleanupInterval = setInterval(() => this.evict(), 120_000);
  }

  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let entry = this.store.get(key);
    if (!entry) {
      // Evict LRU if at capacity
      if (this.store.size >= MAX_ENTRIES) {
        this.evictLRU();
      }
      entry = { timestamps: [], lastAccess: now };
      this.store.set(key, entry);
    }

    entry.lastAccess = now;
    entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);

    const allowed = entry.timestamps.length < this.limit;
    if (allowed) {
      entry.timestamps.push(now);
    }

    const oldest = entry.timestamps[0] ?? now;
    const resetTime = Math.ceil((oldest + this.windowMs) / 1000);
    const retryAfter = allowed ? 0 : Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000));

    return {
      allowed,
      remaining: Math.max(0, this.limit - entry.timestamps.length),
      resetTime,
      retryAfter,
      limit: this.limit,
    };
  }

  reset(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  getRequestCount(key: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const entry = this.store.get(key);

    if (!entry) {
      return 0;
    }

    entry.lastAccess = now;
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    if (entry.timestamps.length === 0) {
      this.store.delete(key);
      return 0;
    }

    return entry.timestamps.length;
  }

  cleanup() {
    this.evict();
  }

  private evict() {
    const now = Date.now();
    const cutoff = now - this.windowMs * 2;
    const windowStart = now - this.windowMs;

    for (const [key, entry] of Array.from(this.store)) {
      entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

      if (entry.timestamps.length === 0) {
        this.store.delete(key);
        continue;
      }

      if (entry.lastAccess < cutoff) {
        this.store.delete(key);
      }
    }
  }

  private evictLRU() {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    for (const [key, entry] of Array.from(this.store)) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }
    if (oldestKey) this.store.delete(oldestKey);
  }

  destroy() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// --- Singleton instances for different route tiers ---

let globalLimiter: RateLimiter | null = null;
let searchLimiter: RateLimiter | null = null;
let bulkLimiter: RateLimiter | null = null;
let generateLimiter: RateLimiter | null = null;

export function createRateLimiter(config: RateLimiterConfig): RateLimiter {
  return new RateLimiter(config);
}

export function getGlobalRateLimiter(config?: RateLimiterConfig): RateLimiter {
  if (!globalLimiter) {
    globalLimiter = createRateLimiter({
      requestsPerMinute: config?.requestsPerMinute ?? DEFAULT_REQUESTS_PER_MINUTE,
      windowMs: config?.windowMs ?? DEFAULT_WINDOW_MS,
    });
  }
  return globalLimiter;
}

export function resetGlobalRateLimiter() {
  globalLimiter?.destroy();
  globalLimiter = null;
}

/** Standard search: 30 req/min */
export function getSearchRateLimiter(): RateLimiter {
  if (!searchLimiter) {
    const limit = parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '30', 10);
    searchLimiter = createRateLimiter({ requestsPerMinute: limit, windowMs: DEFAULT_WINDOW_MS });
  }
  return searchLimiter;
}

/** Bulk operations: 5 req/min */
export function getBulkRateLimiter(): RateLimiter {
  if (!bulkLimiter) {
    const limit = parseInt(process.env.RATE_LIMIT_BULK_REQUESTS_PER_MINUTE || '5', 10);
    bulkLimiter = createRateLimiter({ requestsPerMinute: limit, windowMs: DEFAULT_WINDOW_MS });
  }
  return bulkLimiter;
}

/** Generation: 10 req/min */
export function getGenerateRateLimiter(): RateLimiter {
  if (!generateLimiter) {
    const limit = parseInt(process.env.RATE_LIMIT_GENERATE_REQUESTS_PER_MINUTE || '10', 10);
    generateLimiter = createRateLimiter({ requestsPerMinute: limit, windowMs: DEFAULT_WINDOW_MS });
  }
  return generateLimiter;
}

/** Extract client IP from request headers */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  return 'unknown';
}

/** Build a 429 response with proper headers */
export function rateLimitResponse(
  result: RateLimitResult,
  message = 'Too many requests. Please try again later.'
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message,
        details: {
          retryAfter: result.retryAfter,
          limit: result.limit,
          remaining: result.remaining,
          resetTime: result.resetTime,
        },
      },
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfter),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.resetTime),
      },
    }
  );
}

/** Add rate limit headers to a successful response */
export function addRateLimitHeaders(response: Response, result: RateLimitResult): Response {
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', String(result.limit));
  headers.set('X-RateLimit-Remaining', String(result.remaining));
  headers.set('X-RateLimit-Reset', String(result.resetTime));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const withRateLimitHeaders = addRateLimitHeaders;

// For testing
export function resetAllLimiters() {
  resetGlobalRateLimiter();
  searchLimiter?.destroy(); searchLimiter = null;
  bulkLimiter?.destroy(); bulkLimiter = null;
  generateLimiter?.destroy(); generateLimiter = null;
}
