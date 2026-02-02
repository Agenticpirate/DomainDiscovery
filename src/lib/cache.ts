/**
 * In-memory cache with TTL-based expiration
 * @module lib/cache
 *
 * Provides a generic caching utility for storing key-value pairs with
 * configurable time-to-live (TTL) expiration. Designed to help achieve
 * fast response times by caching domain availability results.
 *
 * Requirements: 1.1 (50ms response time for domain checks)
 */

/**
 * Configuration options for the cache
 */
export interface CacheConfig {
  /** Time-to-live in milliseconds for cache entries */
  ttlMs: number;
  /** Maximum number of entries in the cache (optional, defaults to unlimited) */
  maxSize?: number;
  /** Interval in milliseconds for automatic cleanup (optional, defaults to no auto-cleanup) */
  cleanupIntervalMs?: number;
}

/**
 * Statistics about cache performance
 */
export interface CacheStats {
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
  /** Current number of entries in the cache */
  size: number;
  /** Hit rate as a percentage (0-100) */
  hitRate: number;
}

/**
 * Internal structure for storing cached values with metadata
 */
interface CacheEntry<T> {
  /** The cached value */
  value: T;
  /** Timestamp when the entry was created */
  createdAt: number;
  /** Timestamp when the entry expires */
  expiresAt: number;
}

/**
 * Default TTL (5 minutes in milliseconds)
 */
export const DEFAULT_TTL_MS = 5 * 60 * 1000;

/**
 * Generic in-memory cache with TTL-based expiration
 *
 * Features:
 * - Configurable TTL for automatic expiration
 * - Optional maximum size with LRU-like eviction
 * - Cache statistics tracking (hits, misses, hit rate)
 * - Manual and automatic cleanup of expired entries
 *
 * @template T - The type of values stored in the cache
 */
export class Cache<T> {
  private readonly ttlMs: number;
  private readonly maxSize: number | undefined;
  private readonly entries: Map<string, CacheEntry<T>>;
  private hits: number;
  private misses: number;
  private cleanupTimer: ReturnType<typeof setInterval> | null;

  /**
   * Creates a new cache instance
   *
   * @param config - Configuration options for the cache
   */
  constructor(config: CacheConfig) {
    this.ttlMs = config.ttlMs;
    this.maxSize = config.maxSize;
    this.entries = new Map();
    this.hits = 0;
    this.misses = 0;
    this.cleanupTimer = null;

    // Set up automatic cleanup if configured
    if (config.cleanupIntervalMs && config.cleanupIntervalMs > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, config.cleanupIntervalMs);
    }
  }

  /**
   * Gets a value from the cache
   *
   * Returns undefined if the key doesn't exist or the entry has expired.
   * Expired entries are automatically removed when accessed.
   *
   * @param key - The key to look up
   * @returns The cached value or undefined if not found/expired
   */
  get(key: string): T | undefined {
    const entry = this.entries.get(key);

    if (!entry) {
      this.misses++;
      return undefined;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.entries.delete(key);
      this.misses++;
      return undefined;
    }

    this.hits++;
    return entry.value;
  }

  /**
   * Sets a value in the cache
   *
   * If the cache has a maximum size and is full, the oldest entry
   * will be evicted to make room for the new entry.
   *
   * @param key - The key to store the value under
   * @param value - The value to cache
   * @param customTtlMs - Optional custom TTL for this specific entry
   */
  set(key: string, value: T, customTtlMs?: number): void {
    const now = Date.now();
    const ttl = customTtlMs ?? this.ttlMs;

    // Evict oldest entry if at max size (and key doesn't already exist)
    if (this.maxSize && !this.entries.has(key) && this.entries.size >= this.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      value,
      createdAt: now,
      expiresAt: now + ttl,
    };

    this.entries.set(key, entry);
  }

  /**
   * Checks if a key exists in the cache and is not expired
   *
   * @param key - The key to check
   * @returns True if the key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.entries.get(key);

    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.entries.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Deletes a specific key from the cache
   *
   * @param key - The key to delete
   * @returns True if the key was found and deleted
   */
  delete(key: string): boolean {
    return this.entries.delete(key);
  }

  /**
   * Clears all entries from the cache
   *
   * Also resets the hit/miss statistics.
   */
  clear(): void {
    this.entries.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Gets the current cache statistics
   *
   * @returns Cache statistics including hits, misses, size, and hit rate
   */
  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      size: this.entries.size,
      hitRate: Math.round(hitRate * 100) / 100, // Round to 2 decimal places
    };
  }

  /**
   * Gets the current number of entries in the cache
   *
   * Note: This includes potentially expired entries that haven't been cleaned up yet.
   * Use cleanup() first for an accurate count of valid entries.
   *
   * @returns The number of entries in the cache
   */
  size(): number {
    return this.entries.size;
  }

  /**
   * Gets all keys currently in the cache
   *
   * Note: Some keys may be expired but not yet cleaned up.
   *
   * @returns Array of all keys in the cache
   */
  keys(): string[] {
    return Array.from(this.entries.keys());
  }

  /**
   * Removes all expired entries from the cache
   *
   * This is called automatically if cleanupIntervalMs is configured,
   * but can also be called manually.
   *
   * @returns The number of entries that were removed
   */
  cleanup(): number {
    let removed = 0;

    for (const [key, entry] of Array.from(this.entries.entries())) {
      if (this.isExpired(entry)) {
        this.entries.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Gets the remaining TTL for a specific key in milliseconds
   *
   * @param key - The key to check
   * @returns Remaining TTL in milliseconds, or -1 if key doesn't exist, or 0 if expired
   */
  getTTL(key: string): number {
    const entry = this.entries.get(key);

    if (!entry) {
      return -1;
    }

    const remaining = entry.expiresAt - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Refreshes the TTL for an existing entry
   *
   * @param key - The key to refresh
   * @param customTtlMs - Optional custom TTL, defaults to the cache's configured TTL
   * @returns True if the key was found and refreshed
   */
  refresh(key: string, customTtlMs?: number): boolean {
    const entry = this.entries.get(key);

    if (!entry || this.isExpired(entry)) {
      return false;
    }

    const ttl = customTtlMs ?? this.ttlMs;
    entry.expiresAt = Date.now() + ttl;
    return true;
  }

  /**
   * Stops the automatic cleanup timer
   *
   * Should be called when the cache is no longer needed to prevent memory leaks.
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Checks if a cache entry has expired
   *
   * @param entry - The cache entry to check
   * @returns True if the entry has expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Evicts the oldest entry from the cache
   *
   * Used when the cache is at max capacity and a new entry needs to be added.
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of Array.from(this.entries.entries())) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.entries.delete(oldestKey);
    }
  }
}

/**
 * Creates a new cache instance with the given configuration
 *
 * @param config - Configuration options for the cache
 * @returns A new Cache instance
 *
 * @example
 * ```typescript
 * import { createCache } from '@/lib/cache';
 * import { DomainCheckResult } from '@/types/domain';
 *
 * // Create a cache for domain check results with 5 minute TTL
 * const domainCache = createCache<DomainCheckResult>({ ttlMs: 300000 });
 *
 * // Set a value
 * domainCache.set('example.com', {
 *   domain: 'example.com',
 *   available: true,
 *   tld: 'com',
 *   checkedAt: new Date(),
 * });
 *
 * // Get a value (returns undefined if expired or not found)
 * const result = domainCache.get('example.com');
 *
 * // Check if key exists and is not expired
 * if (domainCache.has('example.com')) {
 *   // Use cached value
 * }
 *
 * // Delete a specific key
 * domainCache.delete('example.com');
 *
 * // Clear all entries
 * domainCache.clear();
 *
 * // Get cache statistics
 * const stats = domainCache.getStats();
 * console.log(`Hit rate: ${stats.hitRate}%`);
 * ```
 */
export function createCache<T>(config: CacheConfig): Cache<T> {
  return new Cache<T>(config);
}

/**
 * Creates a cache with default configuration (5 minute TTL)
 *
 * @returns A new Cache instance with default settings
 */
export function createDefaultCache<T>(): Cache<T> {
  return new Cache<T>({ ttlMs: DEFAULT_TTL_MS });
}

// Global cache instances for common use cases
let globalDomainCache: Cache<unknown> | null = null;

/**
 * Gets or creates a global domain cache instance
 *
 * This is useful for sharing a cache across multiple API routes
 * or components without passing the cache instance around.
 *
 * @param config - Optional configuration (only used on first call)
 * @returns The global domain cache instance
 */
export function getGlobalDomainCache<T>(config?: CacheConfig): Cache<T> {
  if (!globalDomainCache) {
    globalDomainCache = createCache<T>(config ?? { ttlMs: DEFAULT_TTL_MS });
  }
  return globalDomainCache as Cache<T>;
}

/**
 * Resets the global domain cache (useful for testing)
 */
export function resetGlobalDomainCache(): void {
  if (globalDomainCache) {
    globalDomainCache.destroy();
    globalDomainCache = null;
  }
}
