/**
 * Unit tests for cache utility
 * @module __tests__/cache.test
 *
 * Tests for the in-memory cache with TTL-based expiration.
 * Requirements: 1.1 (50ms response time for domain checks)
 */

import {
  Cache,
  createCache,
  createDefaultCache,
  getGlobalDomainCache,
  resetGlobalDomainCache,
  DEFAULT_TTL_MS,
  CacheConfig,
  CacheStats,
} from '../lib/cache';

// Test interface for domain check results
interface TestDomainResult {
  domain: string;
  available: boolean;
  tld: string;
  checkedAt: Date;
}

describe('Cache', () => {
  let cache: Cache<string>;

  beforeEach(() => {
    cache = new Cache<string>({ ttlMs: 1000 }); // 1 second TTL for tests
  });

  afterEach(() => {
    cache.destroy();
  });

  describe('constructor', () => {
    it('should create a cache with specified TTL', () => {
      const customCache = new Cache<string>({ ttlMs: 5000 });
      expect(customCache.size()).toBe(0);
      customCache.destroy();
    });

    it('should create a cache with max size', () => {
      const limitedCache = new Cache<string>({ ttlMs: 1000, maxSize: 5 });
      expect(limitedCache.size()).toBe(0);
      limitedCache.destroy();
    });

    it('should set up cleanup timer when cleanupIntervalMs is provided', () => {
      const autoCleanupCache = new Cache<string>({
        ttlMs: 100,
        cleanupIntervalMs: 50,
      });
      expect(autoCleanupCache.size()).toBe(0);
      autoCleanupCache.destroy();
    });
  });

  describe('set and get', () => {
    it('should store and retrieve a value', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for non-existent key', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should overwrite existing value with same key', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });

    it('should store multiple key-value pairs', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });

    it('should handle empty string as value', () => {
      cache.set('key1', '');
      expect(cache.get('key1')).toBe('');
    });

    it('should handle empty string as key', () => {
      cache.set('', 'value');
      expect(cache.get('')).toBe('value');
    });
  });

  describe('TTL expiration', () => {
    it('should return undefined for expired entries', async () => {
      const shortTtlCache = new Cache<string>({ ttlMs: 50 });
      shortTtlCache.set('key1', 'value1');

      // Value should exist immediately
      expect(shortTtlCache.get('key1')).toBe('value1');

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Value should be expired
      expect(shortTtlCache.get('key1')).toBeUndefined();
      shortTtlCache.destroy();
    });

    it('should remove expired entry on access', async () => {
      const shortTtlCache = new Cache<string>({ ttlMs: 50 });
      shortTtlCache.set('key1', 'value1');

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Access triggers removal
      shortTtlCache.get('key1');
      expect(shortTtlCache.size()).toBe(0);
      shortTtlCache.destroy();
    });

    it('should support custom TTL per entry', async () => {
      const shortTtlCache = new Cache<string>({ ttlMs: 200 });

      // Set with default TTL
      shortTtlCache.set('default', 'value1');
      // Set with custom shorter TTL
      shortTtlCache.set('custom', 'value2', 50);

      // Both should exist initially
      expect(shortTtlCache.get('default')).toBe('value1');
      expect(shortTtlCache.get('custom')).toBe('value2');

      // Wait for custom TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Custom should be expired, default should still exist
      expect(shortTtlCache.get('custom')).toBeUndefined();
      expect(shortTtlCache.get('default')).toBe('value1');
      shortTtlCache.destroy();
    });
  });

  describe('has', () => {
    it('should return true for existing non-expired key', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false for expired key', async () => {
      const shortTtlCache = new Cache<string>({ ttlMs: 50 });
      shortTtlCache.set('key1', 'value1');

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(shortTtlCache.has('key1')).toBe(false);
      shortTtlCache.destroy();
    });

    it('should remove expired entry when checking', async () => {
      const shortTtlCache = new Cache<string>({ ttlMs: 50 });
      shortTtlCache.set('key1', 'value1');

      await new Promise((resolve) => setTimeout(resolve, 100));

      shortTtlCache.has('key1');
      expect(shortTtlCache.size()).toBe(0);
      shortTtlCache.destroy();
    });
  });

  describe('delete', () => {
    it('should delete an existing key', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should return false when deleting non-existent key', () => {
      expect(cache.delete('nonexistent')).toBe(false);
    });

    it('should not affect other keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.delete('key1');

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBeUndefined();
    });

    it('should reset statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1'); // hit
      cache.get('nonexistent'); // miss

      cache.clear();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should track hits correctly', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('key1');
      cache.get('key1');

      const stats = cache.getStats();
      expect(stats.hits).toBe(3);
    });

    it('should track misses correctly', () => {
      cache.get('nonexistent1');
      cache.get('nonexistent2');

      const stats = cache.getStats();
      expect(stats.misses).toBe(2);
    });

    it('should track size correctly', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const stats = cache.getStats();
      expect(stats.size).toBe(2);
    });

    it('should calculate hit rate correctly', () => {
      cache.set('key1', 'value1');
      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('nonexistent'); // miss

      const stats = cache.getStats();
      expect(stats.hitRate).toBe(75);
    });

    it('should return 0 hit rate when no requests', () => {
      const stats = cache.getStats();
      expect(stats.hitRate).toBe(0);
    });

    it('should count expired entry access as miss', async () => {
      const shortTtlCache = new Cache<string>({ ttlMs: 50 });
      shortTtlCache.set('key1', 'value1');

      await new Promise((resolve) => setTimeout(resolve, 100));

      shortTtlCache.get('key1'); // miss (expired)

      const stats = shortTtlCache.getStats();
      expect(stats.misses).toBe(1);
      expect(stats.hits).toBe(0);
      shortTtlCache.destroy();
    });
  });

  describe('size', () => {
    it('should return 0 for empty cache', () => {
      expect(cache.size()).toBe(0);
    });

    it('should return correct count after adding entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
    });

    it('should return correct count after deleting entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.delete('key1');
      expect(cache.size()).toBe(1);
    });
  });

  describe('keys', () => {
    it('should return empty array for empty cache', () => {
      expect(cache.keys()).toEqual([]);
    });

    it('should return all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      const keys = cache.keys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      const shortTtlCache = new Cache<string>({ ttlMs: 50 });
      shortTtlCache.set('key1', 'value1');
      shortTtlCache.set('key2', 'value2');

      await new Promise((resolve) => setTimeout(resolve, 100));

      const removed = shortTtlCache.cleanup();
      expect(removed).toBe(2);
      expect(shortTtlCache.size()).toBe(0);
      shortTtlCache.destroy();
    });

    it('should keep non-expired entries', async () => {
      const shortTtlCache = new Cache<string>({ ttlMs: 200 });
      shortTtlCache.set('key1', 'value1');

      await new Promise((resolve) => setTimeout(resolve, 50));

      const removed = shortTtlCache.cleanup();
      expect(removed).toBe(0);
      expect(shortTtlCache.size()).toBe(1);
      shortTtlCache.destroy();
    });

    it('should return count of removed entries', async () => {
      const shortTtlCache = new Cache<string>({ ttlMs: 50 });
      shortTtlCache.set('key1', 'value1');
      shortTtlCache.set('key2', 'value2');
      shortTtlCache.set('key3', 'value3');

      await new Promise((resolve) => setTimeout(resolve, 100));

      const removed = shortTtlCache.cleanup();
      expect(removed).toBe(3);
      shortTtlCache.destroy();
    });
  });

  describe('getTTL', () => {
    it('should return -1 for non-existent key', () => {
      expect(cache.getTTL('nonexistent')).toBe(-1);
    });

    it('should return remaining TTL for existing key', () => {
      cache.set('key1', 'value1');
      const ttl = cache.getTTL('key1');
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(1000);
    });

    it('should return 0 for expired key', async () => {
      const shortTtlCache = new Cache<string>({ ttlMs: 50 });
      shortTtlCache.set('key1', 'value1');

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(shortTtlCache.getTTL('key1')).toBe(0);
      shortTtlCache.destroy();
    });
  });

  describe('refresh', () => {
    it('should refresh TTL for existing key', async () => {
      const shortTtlCache = new Cache<string>({ ttlMs: 200 });
      shortTtlCache.set('key1', 'value1');

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Refresh the TTL (resets to 200ms from now)
      const refreshed = shortTtlCache.refresh('key1');
      expect(refreshed).toBe(true);

      // Wait another 100ms (would have expired without refresh at 200ms, but now expires at 300ms)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should still exist (we're at ~200ms, refresh extended to ~300ms)
      expect(shortTtlCache.get('key1')).toBe('value1');
      shortTtlCache.destroy();
    });

    it('should return false for non-existent key', () => {
      expect(cache.refresh('nonexistent')).toBe(false);
    });

    it('should return false for expired key', async () => {
      const shortTtlCache = new Cache<string>({ ttlMs: 50 });
      shortTtlCache.set('key1', 'value1');

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(shortTtlCache.refresh('key1')).toBe(false);
      shortTtlCache.destroy();
    });

    it('should support custom TTL on refresh', async () => {
      const shortTtlCache = new Cache<string>({ ttlMs: 50 });
      shortTtlCache.set('key1', 'value1');

      // Refresh with longer TTL
      shortTtlCache.refresh('key1', 200);

      // Wait past original TTL
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should still exist due to refreshed TTL
      expect(shortTtlCache.get('key1')).toBe('value1');
      shortTtlCache.destroy();
    });
  });

  describe('max size eviction', () => {
    it('should evict oldest entry when at max size', () => {
      const limitedCache = new Cache<string>({ ttlMs: 1000, maxSize: 3 });

      limitedCache.set('key1', 'value1');
      limitedCache.set('key2', 'value2');
      limitedCache.set('key3', 'value3');

      // Adding 4th entry should evict key1 (oldest)
      limitedCache.set('key4', 'value4');

      expect(limitedCache.size()).toBe(3);
      expect(limitedCache.get('key1')).toBeUndefined();
      expect(limitedCache.get('key2')).toBe('value2');
      expect(limitedCache.get('key3')).toBe('value3');
      expect(limitedCache.get('key4')).toBe('value4');
      limitedCache.destroy();
    });

    it('should not evict when updating existing key', () => {
      const limitedCache = new Cache<string>({ ttlMs: 1000, maxSize: 3 });

      limitedCache.set('key1', 'value1');
      limitedCache.set('key2', 'value2');
      limitedCache.set('key3', 'value3');

      // Updating existing key should not trigger eviction
      limitedCache.set('key2', 'updated');

      expect(limitedCache.size()).toBe(3);
      expect(limitedCache.get('key1')).toBe('value1');
      expect(limitedCache.get('key2')).toBe('updated');
      expect(limitedCache.get('key3')).toBe('value3');
      limitedCache.destroy();
    });
  });

  describe('destroy', () => {
    it('should stop cleanup timer', () => {
      const autoCleanupCache = new Cache<string>({
        ttlMs: 100,
        cleanupIntervalMs: 50,
      });

      // Should not throw
      autoCleanupCache.destroy();
      autoCleanupCache.destroy(); // Double destroy should be safe
    });
  });
});

describe('Cache with complex types', () => {
  it('should work with object values', () => {
    const cache = new Cache<TestDomainResult>({ ttlMs: 1000 });

    const result: TestDomainResult = {
      domain: 'example.com',
      available: true,
      tld: 'com',
      checkedAt: new Date(),
    };

    cache.set('example.com', result);
    const retrieved = cache.get('example.com');

    expect(retrieved).toEqual(result);
    expect(retrieved?.domain).toBe('example.com');
    expect(retrieved?.available).toBe(true);
    cache.destroy();
  });

  it('should work with array values', () => {
    const cache = new Cache<string[]>({ ttlMs: 1000 });

    cache.set('domains', ['example.com', 'test.io', 'demo.net']);
    const retrieved = cache.get('domains');

    expect(retrieved).toEqual(['example.com', 'test.io', 'demo.net']);
    cache.destroy();
  });

  it('should work with null values', () => {
    const cache = new Cache<string | null>({ ttlMs: 1000 });

    cache.set('nullable', null);
    expect(cache.get('nullable')).toBeNull();
    expect(cache.has('nullable')).toBe(true);
    cache.destroy();
  });
});

describe('createCache', () => {
  it('should create a Cache instance', () => {
    const cache = createCache<string>({ ttlMs: 1000 });
    expect(cache).toBeInstanceOf(Cache);
    cache.destroy();
  });

  it('should create cache with specified config', () => {
    const cache = createCache<string>({ ttlMs: 5000, maxSize: 100 });
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
    cache.destroy();
  });
});

describe('createDefaultCache', () => {
  it('should create a cache with default TTL', () => {
    const cache = createDefaultCache<string>();
    expect(cache).toBeInstanceOf(Cache);
    cache.destroy();
  });
});

describe('getGlobalDomainCache', () => {
  beforeEach(() => {
    resetGlobalDomainCache();
  });

  afterEach(() => {
    resetGlobalDomainCache();
  });

  it('should create a global cache on first call', () => {
    const cache = getGlobalDomainCache<string>();
    expect(cache).toBeInstanceOf(Cache);
  });

  it('should return the same instance on subsequent calls', () => {
    const cache1 = getGlobalDomainCache<string>();
    const cache2 = getGlobalDomainCache<string>();
    expect(cache1).toBe(cache2);
  });

  it('should use default config when not specified', () => {
    const cache = getGlobalDomainCache<string>();
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  it('should use provided config on first call', () => {
    const cache = getGlobalDomainCache<string>({ ttlMs: 10000 });
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  it('should ignore config on subsequent calls', () => {
    const cache1 = getGlobalDomainCache<string>({ ttlMs: 10000 });
    cache1.set('key', 'value');

    const cache2 = getGlobalDomainCache<string>({ ttlMs: 1 });
    // Should still use first config
    expect(cache2.get('key')).toBe('value');
  });
});

describe('resetGlobalDomainCache', () => {
  it('should allow creating a new global cache after reset', () => {
    const cache1 = getGlobalDomainCache<string>({ ttlMs: 1000 });
    cache1.set('key', 'value1');

    resetGlobalDomainCache();

    const cache2 = getGlobalDomainCache<string>({ ttlMs: 2000 });
    expect(cache2.get('key')).toBeUndefined(); // New cache, no data
    expect(cache1).not.toBe(cache2);
  });
});

describe('DEFAULT_TTL_MS constant', () => {
  it('should be 5 minutes in milliseconds', () => {
    expect(DEFAULT_TTL_MS).toBe(5 * 60 * 1000);
    expect(DEFAULT_TTL_MS).toBe(300000);
  });
});

describe('integration scenarios', () => {
  it('should work for domain availability caching use case', () => {
    const domainCache = createCache<TestDomainResult>({ ttlMs: 300000 }); // 5 min TTL

    // Simulate caching domain check results
    const domains = ['example.com', 'test.io', 'demo.net'];

    for (const domain of domains) {
      const result: TestDomainResult = {
        domain,
        available: Math.random() > 0.5,
        tld: domain.split('.').pop() || '',
        checkedAt: new Date(),
      };
      domainCache.set(domain, result);
    }

    // Verify all cached
    expect(domainCache.size()).toBe(3);

    // Simulate cache hits
    for (const domain of domains) {
      const cached = domainCache.get(domain);
      expect(cached).toBeDefined();
      expect(cached?.domain).toBe(domain);
    }

    // Check stats
    const stats = domainCache.getStats();
    expect(stats.hits).toBe(3);
    expect(stats.hitRate).toBe(100);

    domainCache.destroy();
  });

  it('should handle high-frequency access patterns', () => {
    const cache = createCache<number>({ ttlMs: 1000 });

    // Simulate rapid access
    for (let i = 0; i < 1000; i++) {
      cache.set(`key${i % 100}`, i);
    }

    // Should have 100 unique keys
    expect(cache.size()).toBe(100);

    // Access all keys
    for (let i = 0; i < 100; i++) {
      expect(cache.get(`key${i}`)).toBeDefined();
    }

    cache.destroy();
  });

  it('should work with automatic cleanup', async () => {
    const cache = createCache<string>({
      ttlMs: 50,
      cleanupIntervalMs: 30,
    });

    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    expect(cache.size()).toBe(2);

    // Wait for TTL and cleanup
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Entries should be cleaned up automatically
    expect(cache.size()).toBe(0);

    cache.destroy();
  });
});
