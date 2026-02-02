/**
 * Unit tests for rate limiter
 * @module __tests__/rateLimiter.test
 *
 * Tests for the sliding window rate limiter implementation.
 * Requirements: 14.1, 14.7
 */

import {
  RateLimiter,
  createRateLimiter,
  getClientIP,
  rateLimitResponse,
  addRateLimitHeaders,
  getGlobalRateLimiter,
  resetGlobalRateLimiter,
  DEFAULT_WINDOW_MS,
  DEFAULT_REQUESTS_PER_MINUTE,
  RateLimiterConfig,
  RateLimitResult,
} from '../lib/rateLimiter';

// Polyfill Request and Response for Node.js test environment
// These are available in browsers and Next.js runtime but not in Jest's jsdom
if (typeof globalThis.Request === 'undefined') {
  // Simple mock for Request
  class MockRequest {
    private _headers: Map<string, string>;
    private _url: string;

    constructor(url: string, init?: { headers?: Record<string, string> | Headers }) {
      this._url = url;
      this._headers = new Map();
      if (init?.headers) {
        if (init.headers instanceof Headers) {
          init.headers.forEach((value, key) => {
            this._headers.set(key.toLowerCase(), value);
          });
        } else {
          Object.entries(init.headers).forEach(([key, value]) => {
            this._headers.set(key.toLowerCase(), value);
          });
        }
      }
    }

    get headers() {
      return {
        get: (name: string) => this._headers.get(name.toLowerCase()) || null,
      };
    }

    get url() {
      return this._url;
    }
  }

  (globalThis as unknown as { Request: typeof MockRequest }).Request = MockRequest;
}

if (typeof globalThis.Response === 'undefined') {
  // Simple mock for Response
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

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({ requestsPerMinute: 5 });
  });

  describe('constructor', () => {
    it('should create a rate limiter with specified limit', () => {
      const result = limiter.check('test-ip');
      expect(result.limit).toBe(5);
    });

    it('should use default window size when not specified', () => {
      const customLimiter = new RateLimiter({ requestsPerMinute: 10 });
      const result = customLimiter.check('test-ip');
      expect(result.limit).toBe(10);
    });

    it('should use custom window size when specified', () => {
      const customLimiter = new RateLimiter({
        requestsPerMinute: 10,
        windowMs: 30000,
      });
      const result = customLimiter.check('test-ip');
      expect(result.limit).toBe(10);
    });
  });

  describe('check', () => {
    it('should allow requests within the limit', () => {
      for (let i = 0; i < 5; i++) {
        const result = limiter.check('test-ip');
        expect(result.allowed).toBe(true);
      }
    });

    it('should block requests exceeding the limit', () => {
      // Make 5 allowed requests
      for (let i = 0; i < 5; i++) {
        limiter.check('test-ip');
      }

      // 6th request should be blocked
      const result = limiter.check('test-ip');
      expect(result.allowed).toBe(false);
    });

    it('should track remaining requests correctly', () => {
      const result1 = limiter.check('test-ip');
      expect(result1.remaining).toBe(4);

      const result2 = limiter.check('test-ip');
      expect(result2.remaining).toBe(3);

      const result3 = limiter.check('test-ip');
      expect(result3.remaining).toBe(2);
    });

    it('should return 0 remaining when limit is reached', () => {
      for (let i = 0; i < 5; i++) {
        limiter.check('test-ip');
      }

      const result = limiter.check('test-ip');
      expect(result.remaining).toBe(0);
    });

    it('should track different IPs separately', () => {
      // Exhaust limit for IP1
      for (let i = 0; i < 5; i++) {
        limiter.check('ip1');
      }

      // IP2 should still be allowed
      const result = limiter.check('ip2');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should provide reset time in seconds', () => {
      const result = limiter.check('test-ip');
      expect(typeof result.resetTime).toBe('number');
      expect(result.resetTime).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it('should provide retry-after in seconds', () => {
      const result = limiter.check('test-ip');
      expect(typeof result.retryAfter).toBe('number');
      expect(result.retryAfter).toBeGreaterThanOrEqual(0);
    });

    it('should include limit in result', () => {
      const result = limiter.check('test-ip');
      expect(result.limit).toBe(5);
    });
  });

  describe('sliding window behavior', () => {
    it('should allow requests after window expires', async () => {
      // Use a very short window for testing
      const shortLimiter = new RateLimiter({
        requestsPerMinute: 2,
        windowMs: 100, // 100ms window
      });

      // Make 2 requests (exhaust limit)
      shortLimiter.check('test-ip');
      shortLimiter.check('test-ip');

      // Should be blocked
      let result = shortLimiter.check('test-ip');
      expect(result.allowed).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be allowed again
      result = shortLimiter.check('test-ip');
      expect(result.allowed).toBe(true);
    });

    it('should clean up expired timestamps', async () => {
      const shortLimiter = new RateLimiter({
        requestsPerMinute: 3,
        windowMs: 50,
      });

      // Make some requests
      shortLimiter.check('test-ip');
      shortLimiter.check('test-ip');

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Request count should be 0 after cleanup via check
      const result = shortLimiter.check('test-ip');
      expect(result.remaining).toBe(2); // 3 - 1 = 2
    });
  });

  describe('reset', () => {
    it('should reset rate limit for specific identifier', () => {
      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        limiter.check('test-ip');
      }

      // Should be blocked
      expect(limiter.check('test-ip').allowed).toBe(false);

      // Reset
      limiter.reset('test-ip');

      // Should be allowed again
      expect(limiter.check('test-ip').allowed).toBe(true);
    });

    it('should not affect other identifiers', () => {
      // Make requests for both IPs
      limiter.check('ip1');
      limiter.check('ip2');

      // Reset only ip1
      limiter.reset('ip1');

      // ip1 should have full limit
      expect(limiter.getRequestCount('ip1')).toBe(0);

      // ip2 should still have 1 request
      expect(limiter.getRequestCount('ip2')).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all rate limit records', () => {
      // Make requests for multiple IPs
      limiter.check('ip1');
      limiter.check('ip2');
      limiter.check('ip3');

      // Clear all
      limiter.clear();

      // All should have 0 requests
      expect(limiter.getRequestCount('ip1')).toBe(0);
      expect(limiter.getRequestCount('ip2')).toBe(0);
      expect(limiter.getRequestCount('ip3')).toBe(0);
    });
  });

  describe('getRequestCount', () => {
    it('should return 0 for unknown identifier', () => {
      expect(limiter.getRequestCount('unknown')).toBe(0);
    });

    it('should return correct count for known identifier', () => {
      limiter.check('test-ip');
      limiter.check('test-ip');
      limiter.check('test-ip');

      expect(limiter.getRequestCount('test-ip')).toBe(3);
    });

    it('should not count expired requests', async () => {
      const shortLimiter = new RateLimiter({
        requestsPerMinute: 10,
        windowMs: 50,
      });

      shortLimiter.check('test-ip');
      shortLimiter.check('test-ip');

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(shortLimiter.getRequestCount('test-ip')).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should remove expired records', async () => {
      const shortLimiter = new RateLimiter({
        requestsPerMinute: 5,
        windowMs: 50,
      });

      shortLimiter.check('ip1');
      shortLimiter.check('ip2');

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Cleanup
      shortLimiter.cleanup();

      // Both should have 0 requests
      expect(shortLimiter.getRequestCount('ip1')).toBe(0);
      expect(shortLimiter.getRequestCount('ip2')).toBe(0);
    });

    it('should keep non-expired records', async () => {
      const shortLimiter = new RateLimiter({
        requestsPerMinute: 5,
        windowMs: 200,
      });

      shortLimiter.check('ip1');

      // Wait a bit but not long enough for expiration
      await new Promise((resolve) => setTimeout(resolve, 50));

      shortLimiter.check('ip2');

      // Cleanup
      shortLimiter.cleanup();

      // Both should still have requests
      expect(shortLimiter.getRequestCount('ip1')).toBe(1);
      expect(shortLimiter.getRequestCount('ip2')).toBe(1);
    });
  });
});

describe('createRateLimiter', () => {
  it('should create a RateLimiter instance', () => {
    const limiter = createRateLimiter({ requestsPerMinute: 100 });
    expect(limiter).toBeInstanceOf(RateLimiter);
  });

  it('should create limiter with specified config', () => {
    const limiter = createRateLimiter({ requestsPerMinute: 30 });
    const result = limiter.check('test');
    expect(result.limit).toBe(30);
  });
});

describe('getClientIP', () => {
  function createMockRequest(headers: Record<string, string>): Request {
    return new Request('http://localhost/api/test', {
      headers: new Headers(headers),
    });
  }

  it('should extract IP from X-Forwarded-For header', () => {
    const request = createMockRequest({
      'x-forwarded-for': '192.168.1.1',
    });
    expect(getClientIP(request)).toBe('192.168.1.1');
  });

  it('should extract first IP from X-Forwarded-For with multiple IPs', () => {
    const request = createMockRequest({
      'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1',
    });
    expect(getClientIP(request)).toBe('192.168.1.1');
  });

  it('should extract IP from X-Real-IP header', () => {
    const request = createMockRequest({
      'x-real-ip': '192.168.1.2',
    });
    expect(getClientIP(request)).toBe('192.168.1.2');
  });

  it('should extract IP from CF-Connecting-IP header', () => {
    const request = createMockRequest({
      'cf-connecting-ip': '192.168.1.3',
    });
    expect(getClientIP(request)).toBe('192.168.1.3');
  });

  it('should prefer X-Forwarded-For over other headers', () => {
    const request = createMockRequest({
      'x-forwarded-for': '192.168.1.1',
      'x-real-ip': '192.168.1.2',
      'cf-connecting-ip': '192.168.1.3',
    });
    expect(getClientIP(request)).toBe('192.168.1.1');
  });

  it('should prefer X-Real-IP over CF-Connecting-IP', () => {
    const request = createMockRequest({
      'x-real-ip': '192.168.1.2',
      'cf-connecting-ip': '192.168.1.3',
    });
    expect(getClientIP(request)).toBe('192.168.1.2');
  });

  it('should return "unknown" when no IP headers present', () => {
    const request = createMockRequest({});
    expect(getClientIP(request)).toBe('unknown');
  });

  it('should trim whitespace from IP addresses', () => {
    const request = createMockRequest({
      'x-forwarded-for': '  192.168.1.1  ',
    });
    expect(getClientIP(request)).toBe('192.168.1.1');
  });

  it('should handle empty X-Forwarded-For header', () => {
    const request = createMockRequest({
      'x-forwarded-for': '',
      'x-real-ip': '192.168.1.2',
    });
    expect(getClientIP(request)).toBe('192.168.1.2');
  });
});

describe('rateLimitResponse', () => {
  const mockResult: RateLimitResult = {
    allowed: false,
    remaining: 0,
    resetTime: 1700000000,
    retryAfter: 30,
    limit: 60,
  };

  it('should return 429 status code', () => {
    const response = rateLimitResponse(mockResult);
    expect(response.status).toBe(429);
  });

  it('should include Retry-After header', () => {
    const response = rateLimitResponse(mockResult);
    expect(response.headers.get('Retry-After')).toBe('30');
  });

  it('should include X-RateLimit-Limit header', () => {
    const response = rateLimitResponse(mockResult);
    expect(response.headers.get('X-RateLimit-Limit')).toBe('60');
  });

  it('should include X-RateLimit-Remaining header', () => {
    const response = rateLimitResponse(mockResult);
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  it('should include X-RateLimit-Reset header', () => {
    const response = rateLimitResponse(mockResult);
    expect(response.headers.get('X-RateLimit-Reset')).toBe('1700000000');
  });

  it('should include Content-Type header', () => {
    const response = rateLimitResponse(mockResult);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('should include error details in body', async () => {
    const response = rateLimitResponse(mockResult);
    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.error.code).toBe('RATE_LIMITED');
    expect(body.error.details.retryAfter).toBe(30);
    expect(body.error.details.limit).toBe(60);
    expect(body.error.details.remaining).toBe(0);
    expect(body.error.details.resetTime).toBe(1700000000);
  });

  it('should use default error message', async () => {
    const response = rateLimitResponse(mockResult);
    const body = await response.json();

    expect(body.error.message).toBe('Too many requests. Please try again later.');
  });

  it('should use custom error message when provided', async () => {
    const response = rateLimitResponse(mockResult, 'Custom rate limit message');
    const body = await response.json();

    expect(body.error.message).toBe('Custom rate limit message');
  });
});

describe('addRateLimitHeaders', () => {
  const mockResult: RateLimitResult = {
    allowed: true,
    remaining: 55,
    resetTime: 1700000000,
    retryAfter: 0,
    limit: 60,
  };

  it('should add rate limit headers to response', () => {
    const originalResponse = new Response('{"data": "test"}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    const newResponse = addRateLimitHeaders(originalResponse, mockResult);

    expect(newResponse.headers.get('X-RateLimit-Limit')).toBe('60');
    expect(newResponse.headers.get('X-RateLimit-Remaining')).toBe('55');
    expect(newResponse.headers.get('X-RateLimit-Reset')).toBe('1700000000');
  });

  it('should preserve original headers', () => {
    const originalResponse = new Response('test', {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'custom-value',
      },
    });

    const newResponse = addRateLimitHeaders(originalResponse, mockResult);

    expect(newResponse.headers.get('Content-Type')).toBe('application/json');
    expect(newResponse.headers.get('X-Custom-Header')).toBe('custom-value');
  });

  it('should preserve original status code', () => {
    const originalResponse = new Response('created', { status: 201 });
    const newResponse = addRateLimitHeaders(originalResponse, mockResult);

    expect(newResponse.status).toBe(201);
  });
});

describe('getGlobalRateLimiter', () => {
  beforeEach(() => {
    resetGlobalRateLimiter();
  });

  afterEach(() => {
    resetGlobalRateLimiter();
  });

  it('should create a global rate limiter on first call', () => {
    const limiter = getGlobalRateLimiter();
    expect(limiter).toBeInstanceOf(RateLimiter);
  });

  it('should return the same instance on subsequent calls', () => {
    const limiter1 = getGlobalRateLimiter();
    const limiter2 = getGlobalRateLimiter();
    expect(limiter1).toBe(limiter2);
  });

  it('should use default config when not specified', () => {
    const limiter = getGlobalRateLimiter();
    const result = limiter.check('test');
    expect(result.limit).toBe(DEFAULT_REQUESTS_PER_MINUTE);
  });

  it('should use provided config on first call', () => {
    const limiter = getGlobalRateLimiter({ requestsPerMinute: 100 });
    const result = limiter.check('test');
    expect(result.limit).toBe(100);
  });

  it('should ignore config on subsequent calls', () => {
    const limiter1 = getGlobalRateLimiter({ requestsPerMinute: 100 });
    const limiter2 = getGlobalRateLimiter({ requestsPerMinute: 200 });

    const result = limiter2.check('test');
    expect(result.limit).toBe(100); // First config is used
  });
});

describe('resetGlobalRateLimiter', () => {
  it('should allow creating a new global limiter after reset', () => {
    const limiter1 = getGlobalRateLimiter({ requestsPerMinute: 50 });
    expect(limiter1.check('test').limit).toBe(50);

    resetGlobalRateLimiter();

    const limiter2 = getGlobalRateLimiter({ requestsPerMinute: 100 });
    expect(limiter2.check('test').limit).toBe(100);
    expect(limiter1).not.toBe(limiter2);
  });
});

describe('exported constants', () => {
  it('should export DEFAULT_WINDOW_MS as 60000', () => {
    expect(DEFAULT_WINDOW_MS).toBe(60000);
  });

  it('should export DEFAULT_REQUESTS_PER_MINUTE as 60', () => {
    expect(DEFAULT_REQUESTS_PER_MINUTE).toBe(60);
  });
});

describe('integration scenarios', () => {
  it('should work in typical API route usage pattern', () => {
    const limiter = createRateLimiter({ requestsPerMinute: 60 });

    // Simulate multiple requests from same IP
    const ip = '192.168.1.100';

    for (let i = 0; i < 60; i++) {
      const result = limiter.check(ip);
      expect(result.allowed).toBe(true);
    }

    // 61st request should be blocked
    const blockedResult = limiter.check(ip);
    expect(blockedResult.allowed).toBe(false);
    expect(blockedResult.retryAfter).toBeGreaterThan(0);
  });

  it('should handle burst traffic from multiple IPs', () => {
    const limiter = createRateLimiter({ requestsPerMinute: 10 });

    // Simulate 5 different IPs making requests
    const ips = ['ip1', 'ip2', 'ip3', 'ip4', 'ip5'];

    for (const ip of ips) {
      // Each IP makes 10 requests
      for (let i = 0; i < 10; i++) {
        const result = limiter.check(ip);
        expect(result.allowed).toBe(true);
      }

      // 11th request from each IP should be blocked
      const blockedResult = limiter.check(ip);
      expect(blockedResult.allowed).toBe(false);
    }
  });

  it('should generate valid 429 response for blocked requests', async () => {
    const limiter = createRateLimiter({ requestsPerMinute: 1 });

    // First request allowed
    limiter.check('test-ip');

    // Second request blocked
    const result = limiter.check('test-ip');
    expect(result.allowed).toBe(false);

    // Generate response
    const response = rateLimitResponse(result);

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBeTruthy();

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('RATE_LIMITED');
  });
});
