/**
 * Property-based tests for rate limiter
 * @module __tests__/rateLimiter.property.test
 *
 * Uses fast-check to verify universal properties across randomized inputs.
 * Feature: domains-discovery-platform, Property 22: Rate Limiter Enforcement
 * Validates: Requirements 14.1, 14.7
 */

import * as fc from 'fast-check';
import {
  RateLimiter,
  rateLimitResponse,
  RateLimitResult,
} from '../lib/rateLimiter';

// Polyfill Response for Node.js test environment
if (typeof globalThis.Response === 'undefined') {
  class MockResponse {
    private _body: string;
    private _status: number;
    private _statusText: string;
    private _headers: Headers;

    constructor(
      body?: string | null,
      init?: { status?: number; statusText?: string; headers?: Headers | Record<string, string> }
    ) {
      this._body = body || '';
      this._status = init?.status || 200;
      this._statusText = init?.statusText || 'OK';
      this._headers = init?.headers instanceof Headers ? init.headers : new Headers(init?.headers);
    }

    get status() {
      return this._status;
    }

    get statusText() {
      return this._statusText;
    }

    get headers() {
      return this._headers;
    }

    get body() {
      return this._body;
    }

    async json() {
      return JSON.parse(this._body);
    }

    async text() {
      return this._body;
    }
  }

  (globalThis as unknown as { Response: typeof MockResponse }).Response = MockResponse;
}

// Configuration: Minimum 100 iterations per property
const propertyConfig = { numRuns: 100 };

// ============================================================================
// Feature: domains-discovery-platform, Property 22: Rate Limiter Enforcement
// Validates: Requirements 14.1, 14.7
// ============================================================================

describe('Property 22: Rate Limiter Enforcement', () => {
  /**
   * Property: For any sequence of API requests from the same client exceeding
   * the configured rate limit within the time window, requests beyond the limit
   * SHALL receive a 429 status code response with a Retry-After header.
   */

  // Arbitrary for generating valid rate limits (reasonable range for testing)
  const rateLimitArb = fc.integer({ min: 1, max: 100 });

  // Arbitrary for generating client identifiers
  const clientIdArb = fc.stringMatching(/^[a-z0-9]{1,20}$/);

  // Arbitrary for generating multiple unique client identifiers
  const multipleClientIdsArb = fc.array(clientIdArb, { minLength: 2, maxLength: 10 })
    .map(ids => [...new Set(ids)]) // Ensure uniqueness
    .filter(ids => ids.length >= 2); // Ensure at least 2 unique IDs

  // Arbitrary for generating number of requests (at least limit + 1)
  const requestCountArb = (limit: number) => fc.integer({ min: limit + 1, max: limit + 50 });

  it('should block the (N+1)th request when limit is N', () => {
    fc.assert(
      fc.property(
        rateLimitArb,
        clientIdArb,
        (limit, clientId) => {
          const limiter = new RateLimiter({ requestsPerMinute: limit });

          // Make exactly N requests (all should be allowed)
          for (let i = 0; i < limit; i++) {
            const result = limiter.check(clientId);
            if (!result.allowed) {
              return false; // First N requests should all be allowed
            }
          }

          // The (N+1)th request should be blocked
          const blockedResult = limiter.check(clientId);
          return blockedResult.allowed === false;
        }
      ),
      propertyConfig
    );
  });

  it('should return 429 status code for blocked requests', () => {
    fc.assert(
      fc.property(
        rateLimitArb,
        clientIdArb,
        (limit, clientId) => {
          const limiter = new RateLimiter({ requestsPerMinute: limit });

          // Exhaust the limit
          for (let i = 0; i < limit; i++) {
            limiter.check(clientId);
          }

          // Get the blocked result
          const blockedResult = limiter.check(clientId);

          // Generate the response
          const response = rateLimitResponse(blockedResult);

          return response.status === 429;
        }
      ),
      propertyConfig
    );
  });

  it('should include Retry-After header with positive value for blocked requests', () => {
    fc.assert(
      fc.property(
        rateLimitArb,
        clientIdArb,
        (limit, clientId) => {
          const limiter = new RateLimiter({ requestsPerMinute: limit });

          // Exhaust the limit
          for (let i = 0; i < limit; i++) {
            limiter.check(clientId);
          }

          // Get the blocked result
          const blockedResult = limiter.check(clientId);

          // Generate the response
          const response = rateLimitResponse(blockedResult);

          // Check Retry-After header
          const retryAfter = response.headers.get('Retry-After');
          if (!retryAfter) {
            return false;
          }

          const retryAfterValue = parseInt(retryAfter, 10);
          return retryAfterValue >= 0; // Should be non-negative (0 or positive)
        }
      ),
      propertyConfig
    );
  });

  it('should track requests from different identifiers independently', () => {
    fc.assert(
      fc.property(
        rateLimitArb,
        multipleClientIdsArb,
        (limit, clientIds) => {
          const limiter = new RateLimiter({ requestsPerMinute: limit });

          // Exhaust limit for first client
          const firstClient = clientIds[0];
          for (let i = 0; i < limit; i++) {
            limiter.check(firstClient);
          }

          // First client should be blocked
          const firstClientBlocked = limiter.check(firstClient);
          if (firstClientBlocked.allowed) {
            return false;
          }

          // All other clients should still be allowed
          for (let i = 1; i < clientIds.length; i++) {
            const result = limiter.check(clientIds[i]);
            if (!result.allowed) {
              return false; // Other clients should not be affected
            }
          }

          return true;
        }
      ),
      propertyConfig
    );
  });

  it('should allow exactly N requests before blocking', () => {
    fc.assert(
      fc.property(
        rateLimitArb,
        clientIdArb,
        (limit, clientId) => {
          const limiter = new RateLimiter({ requestsPerMinute: limit });

          let allowedCount = 0;

          // Make limit + 5 requests and count allowed ones
          for (let i = 0; i < limit + 5; i++) {
            const result = limiter.check(clientId);
            if (result.allowed) {
              allowedCount++;
            }
          }

          // Exactly N requests should have been allowed
          return allowedCount === limit;
        }
      ),
      propertyConfig
    );
  });

  it('should correctly report remaining requests', () => {
    fc.assert(
      fc.property(
        rateLimitArb,
        clientIdArb,
        fc.integer({ min: 0, max: 50 }),
        (limit, clientId, requestsToMake) => {
          const limiter = new RateLimiter({ requestsPerMinute: limit });
          const actualRequests = Math.min(requestsToMake, limit);

          // Make some requests
          for (let i = 0; i < actualRequests; i++) {
            limiter.check(clientId);
          }

          // Check remaining
          const result = limiter.check(clientId);
          const expectedRemaining = Math.max(0, limit - actualRequests - (result.allowed ? 1 : 0));

          return result.remaining === expectedRemaining;
        }
      ),
      propertyConfig
    );
  });

  it('should include correct limit value in response', () => {
    fc.assert(
      fc.property(
        rateLimitArb,
        clientIdArb,
        (limit, clientId) => {
          const limiter = new RateLimiter({ requestsPerMinute: limit });

          // Make a request
          const result = limiter.check(clientId);

          return result.limit === limit;
        }
      ),
      propertyConfig
    );
  });

  it('should include rate limit headers in blocked response', () => {
    fc.assert(
      fc.property(
        rateLimitArb,
        clientIdArb,
        (limit, clientId) => {
          const limiter = new RateLimiter({ requestsPerMinute: limit });

          // Exhaust the limit
          for (let i = 0; i < limit; i++) {
            limiter.check(clientId);
          }

          // Get blocked result and response
          const blockedResult = limiter.check(clientId);
          const response = rateLimitResponse(blockedResult);

          // Check all required headers are present
          const hasRetryAfter = response.headers.get('Retry-After') !== null;
          const hasLimit = response.headers.get('X-RateLimit-Limit') !== null;
          const hasRemaining = response.headers.get('X-RateLimit-Remaining') !== null;
          const hasReset = response.headers.get('X-RateLimit-Reset') !== null;

          return hasRetryAfter && hasLimit && hasRemaining && hasReset;
        }
      ),
      propertyConfig
    );
  });

  it('should return remaining as 0 when limit is exceeded', () => {
    fc.assert(
      fc.property(
        rateLimitArb,
        clientIdArb,
        (limit, clientId) => {
          const limiter = new RateLimiter({ requestsPerMinute: limit });

          // Exhaust the limit
          for (let i = 0; i < limit; i++) {
            limiter.check(clientId);
          }

          // Check blocked request
          const blockedResult = limiter.check(clientId);

          return blockedResult.remaining === 0;
        }
      ),
      propertyConfig
    );
  });

  it('should provide valid reset time in the future', () => {
    fc.assert(
      fc.property(
        rateLimitArb,
        clientIdArb,
        (limit, clientId) => {
          const limiter = new RateLimiter({ requestsPerMinute: limit });
          const now = Math.floor(Date.now() / 1000);

          // Make a request
          const result = limiter.check(clientId);

          // Reset time should be in the future (or very close to now)
          return result.resetTime >= now;
        }
      ),
      propertyConfig
    );
  });

  it('should block all requests after limit is exhausted', () => {
    fc.assert(
      fc.property(
        rateLimitArb,
        clientIdArb,
        fc.integer({ min: 1, max: 20 }),
        (limit, clientId, extraRequests) => {
          const limiter = new RateLimiter({ requestsPerMinute: limit });

          // Exhaust the limit
          for (let i = 0; i < limit; i++) {
            limiter.check(clientId);
          }

          // All subsequent requests should be blocked
          for (let i = 0; i < extraRequests; i++) {
            const result = limiter.check(clientId);
            if (result.allowed) {
              return false;
            }
          }

          return true;
        }
      ),
      propertyConfig
    );
  });

  it('should include error details in blocked response body', async () => {
    await fc.assert(
      fc.asyncProperty(
        rateLimitArb,
        clientIdArb,
        async (limit, clientId) => {
          const limiter = new RateLimiter({ requestsPerMinute: limit });

          // Exhaust the limit
          for (let i = 0; i < limit; i++) {
            limiter.check(clientId);
          }

          // Get blocked result and response
          const blockedResult = limiter.check(clientId);
          const response = rateLimitResponse(blockedResult);

          // Parse response body
          const body = await response.json();

          // Check error structure
          const hasSuccess = body.success === false;
          const hasErrorCode = body.error?.code === 'RATE_LIMITED';
          const hasMessage = typeof body.error?.message === 'string';
          const hasDetails = body.error?.details !== undefined;

          return hasSuccess && hasErrorCode && hasMessage && hasDetails;
        }
      ),
      propertyConfig
    );
  });

  it('should maintain consistent state across multiple check calls', () => {
    fc.assert(
      fc.property(
        rateLimitArb,
        clientIdArb,
        (limit, clientId) => {
          const limiter = new RateLimiter({ requestsPerMinute: limit });

          // Track request count manually
          let manualCount = 0;

          for (let i = 0; i < limit + 5; i++) {
            const result = limiter.check(clientId);

            if (result.allowed) {
              manualCount++;
            }

            // Verify internal count matches
            const internalCount = limiter.getRequestCount(clientId);
            if (internalCount !== manualCount) {
              return false;
            }
          }

          return manualCount === limit;
        }
      ),
      propertyConfig
    );
  });

  it('should reset properly and allow new requests', () => {
    fc.assert(
      fc.property(
        rateLimitArb,
        clientIdArb,
        (limit, clientId) => {
          const limiter = new RateLimiter({ requestsPerMinute: limit });

          // Exhaust the limit
          for (let i = 0; i < limit; i++) {
            limiter.check(clientId);
          }

          // Should be blocked
          const blockedResult = limiter.check(clientId);
          if (blockedResult.allowed) {
            return false;
          }

          // Reset the client
          limiter.reset(clientId);

          // Should be allowed again
          const afterResetResult = limiter.check(clientId);
          return afterResetResult.allowed === true;
        }
      ),
      propertyConfig
    );
  });
});
