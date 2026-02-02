/**
 * Rate limiter with sliding window algorithm
 * @module lib/rateLimiter
 *
 * Provides rate limiting functionality for API routes using a sliding window
 * algorithm for more accurate rate limiting than fixed windows.
 *
 * Requirements: 14.1, 14.7
 */

/**
 * Configuration options for the rate limiter
 */
export interface RateLimiterConfig {
  /** Maximum number of requests allowed per minute */
  requestsPerMinute: number;
  /** Window size in milliseconds (default: 60000 = 1 minute) */
  windowMs?: number;
}

/**
 * Result of a rate limit check
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of remaining requests in the current window */
  remaining: number;
  /** Unix timestamp (in seconds) when the rate limit resets */
  resetTime: number;
  /** Number of seconds until the rate limit resets */
  retryAfter: number;
  /** Total limit per window */
  limit: number;
}

/**
 * Internal structure for tracking requests per IP
 */
interface RequestRecord {
  /** Timestamps of requests within the window */
  timestamps: number[];
}

/**
 * Default window size (1 minute in milliseconds)
 */
export const DEFAULT_WINDOW_MS = 60 * 1000;

/**
 * Default requests per minute limit
 */
export const DEFAULT_REQUESTS_PER_MINUTE = 60;

/**
 * Rate limiter class using sliding window algorithm
 *
 * The sliding window algorithm provides more accurate rate limiting than
 * fixed windows by tracking individual request timestamps and counting
 * requests within a rolling time window.
 *
 * Benefits over fixed window:
 * - No burst at window boundaries
 * - More even distribution of allowed requests
 * - Fairer to users who spread requests over time
 */
export class RateLimiter {
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly requests: Map<string, RequestRecord>;

  /**
   * Creates a new rate limiter instance
   *
   * @param config - Configuration options
   */
  constructor(config: RateLimiterConfig) {
    this.limit = config.requestsPerMinute;
    this.windowMs = config.windowMs ?? DEFAULT_WINDOW_MS;
    this.requests = new Map();
  }

  /**
   * Checks if a request from the given identifier is allowed
   *
   * This method:
   * 1. Gets or creates a request record for the identifier
   * 2. Removes expired timestamps (outside the sliding window)
   * 3. Checks if the request count is within the limit
   * 4. If allowed, records the new request timestamp
   *
   * @param identifier - Unique identifier for the client (typically IP address)
   * @returns Rate limit check result
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create request record
    let record = this.requests.get(identifier);
    if (!record) {
      record = { timestamps: [] };
      this.requests.set(identifier, record);
    }

    // Remove expired timestamps (sliding window cleanup)
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    // Calculate reset time (when the oldest request in window expires)
    const oldestTimestamp = record.timestamps[0] ?? now;
    const resetTime = Math.ceil((oldestTimestamp + this.windowMs) / 1000);
    const retryAfter = Math.max(0, Math.ceil((oldestTimestamp + this.windowMs - now) / 1000));

    // Check if request is allowed
    const currentCount = record.timestamps.length;
    const allowed = currentCount < this.limit;
    const remaining = Math.max(0, this.limit - currentCount - (allowed ? 1 : 0));

    // Record the request if allowed
    if (allowed) {
      record.timestamps.push(now);
    }

    return {
      allowed,
      remaining,
      resetTime,
      retryAfter,
      limit: this.limit,
    };
  }

  /**
   * Resets the rate limit for a specific identifier
   *
   * @param identifier - The identifier to reset
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Clears all rate limit records
   * Useful for testing or administrative purposes
   */
  clear(): void {
    this.requests.clear();
  }

  /**
   * Gets the current request count for an identifier
   * Useful for monitoring and debugging
   *
   * @param identifier - The identifier to check
   * @returns Current request count within the window
   */
  getRequestCount(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const record = this.requests.get(identifier);

    if (!record) {
      return 0;
    }

    // Count only non-expired timestamps
    return record.timestamps.filter((ts) => ts > windowStart).length;
  }

  /**
   * Cleans up expired records from all identifiers
   * Should be called periodically to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    Array.from(this.requests.entries()).forEach(([identifier, record]) => {
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

      // Remove empty records
      if (record.timestamps.length === 0) {
        this.requests.delete(identifier);
      }
    });
  }
}

/**
 * Creates a new rate limiter instance with the given configuration
 *
 * @param config - Configuration options
 * @returns A new RateLimiter instance
 *
 * @example
 * ```typescript
 * const limiter = createRateLimiter({ requestsPerMinute: 60 });
 *
 * export async function GET(request: Request) {
 *   const ip = getClientIP(request);
 *   const result = limiter.check(ip);
 *
 *   if (!result.allowed) {
 *     return rateLimitResponse(result);
 *   }
 *
 *   // Handle request...
 * }
 * ```
 */
export function createRateLimiter(config: RateLimiterConfig): RateLimiter {
  return new RateLimiter(config);
}

/**
 * Extracts the client IP address from a request
 *
 * Checks headers in order of preference:
 * 1. X-Forwarded-For (first IP in the list)
 * 2. X-Real-IP
 * 3. CF-Connecting-IP (Cloudflare)
 * 4. Falls back to 'unknown'
 *
 * @param request - The incoming request
 * @returns The client IP address or 'unknown'
 */
export function getClientIP(request: Request): string {
  // Check X-Forwarded-For header (may contain multiple IPs)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP (original client)
    const firstIP = forwardedFor.split(',')[0].trim();
    if (firstIP) {
      return firstIP;
    }
  }

  // Check X-Real-IP header
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  // Check Cloudflare header
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP.trim();
  }

  // Fallback
  return 'unknown';
}

/**
 * Creates a 429 Too Many Requests response with appropriate headers
 *
 * @param result - The rate limit check result
 * @param message - Optional custom error message
 * @returns A Response object with 429 status and rate limit headers
 */
export function rateLimitResponse(
  result: RateLimitResult,
  message = 'Too many requests. Please try again later.'
): Response {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Retry-After': String(result.retryAfter),
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetTime),
  });

  const body = JSON.stringify({
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
  });

  return new Response(body, {
    status: 429,
    headers,
  });
}

/**
 * Adds rate limit headers to an existing response
 *
 * @param response - The original response
 * @param result - The rate limit check result
 * @returns A new Response with rate limit headers added
 */
export function addRateLimitHeaders(response: Response, result: RateLimitResult): Response {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-RateLimit-Limit', String(result.limit));
  newHeaders.set('X-RateLimit-Remaining', String(result.remaining));
  newHeaders.set('X-RateLimit-Reset', String(result.resetTime));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

// Global rate limiter instance for API routes
// Can be imported and used across all API routes
let globalRateLimiter: RateLimiter | null = null;

/**
 * Gets or creates the global rate limiter instance
 *
 * @param config - Optional configuration (only used on first call)
 * @returns The global rate limiter instance
 */
export function getGlobalRateLimiter(config?: RateLimiterConfig): RateLimiter {
  if (!globalRateLimiter) {
    globalRateLimiter = createRateLimiter(
      config ?? { requestsPerMinute: DEFAULT_REQUESTS_PER_MINUTE }
    );
  }
  return globalRateLimiter;
}

/**
 * Resets the global rate limiter (useful for testing)
 */
export function resetGlobalRateLimiter(): void {
  globalRateLimiter = null;
}
