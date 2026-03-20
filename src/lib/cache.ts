/**
 * In-memory cache with TTL expiration, optional automatic cleanup, and LRU eviction.
 */

export interface CacheConfig {
  ttlMs: number;
  maxSize?: number;
  cleanupIntervalMs?: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

export const DEFAULT_TTL_MS = 5 * 60 * 1000;

export class Cache<T> {
  private readonly ttlMs: number;
  private readonly maxSize: number;
  private readonly entries = new Map<string, CacheEntry<T>>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;
  private hits = 0;
  private misses = 0;

  constructor(config: CacheConfig) {
    this.ttlMs = config.ttlMs;
    this.maxSize = config.maxSize ?? 10_000;

    if (config.cleanupIntervalMs && config.cleanupIntervalMs > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, config.cleanupIntervalMs);
    }
  }

  get(key: string): T | undefined {
    const entry = this.entries.get(key);

    if (!entry) {
      this.misses += 1;
      return undefined;
    }

    if (this.isExpired(entry)) {
      this.entries.delete(key);
      this.misses += 1;
      return undefined;
    }

    this.hits += 1;
    this.touch(key, entry);
    return entry.value;
  }

  set(key: string, value: T, customTtlMs?: number): void {
    const now = Date.now();

    if (!this.entries.has(key) && this.entries.size >= this.maxSize) {
      const firstKey = this.entries.keys().next().value;
      if (firstKey !== undefined) {
        this.entries.delete(firstKey);
      }
    }

    const entry: CacheEntry<T> = {
      value,
      createdAt: now,
      expiresAt: now + (customTtlMs ?? this.ttlMs),
    };

    this.entries.set(key, entry);
    this.touch(key, entry);
  }

  has(key: string): boolean {
    const entry = this.entries.get(key);
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.entries.delete(key);
      return false;
    }

    this.touch(key, entry);
    return true;
  }

  delete(key: string): boolean {
    return this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
    this.hits = 0;
    this.misses = 0;
  }

  size(): number {
    this.cleanup();
    return this.entries.size;
  }

  keys(): string[] {
    this.cleanup();
    return Array.from(this.entries.keys());
  }

  cleanup(): number {
    let removed = 0;
    const now = Date.now();

    for (const [key, entry] of Array.from(this.entries.entries())) {
      if (entry.expiresAt <= now) {
        this.entries.delete(key);
        removed += 1;
      }
    }

    return removed;
  }

  getTTL(key: string): number {
    const entry = this.entries.get(key);
    if (!entry) {
      return -1;
    }

    const remaining = entry.expiresAt - Date.now();
    if (remaining <= 0) {
      this.entries.delete(key);
      return 0;
    }

    return remaining;
  }

  refresh(key: string, customTtlMs?: number): boolean {
    const entry = this.entries.get(key);
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.entries.delete(key);
      return false;
    }

    entry.expiresAt = Date.now() + (customTtlMs ?? this.ttlMs);
    this.touch(key, entry);
    return true;
  }

  getStats(): CacheStats {
    this.cleanup();
    const total = this.hits + this.misses;

    return {
      hits: this.hits,
      misses: this.misses,
      size: this.entries.size,
      hitRate: total === 0 ? 0 : Math.round((this.hits / total) * 100),
    };
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return entry.expiresAt <= Date.now();
  }

  private touch(key: string, entry: CacheEntry<T>) {
    this.entries.delete(key);
    this.entries.set(key, entry);
  }
}

let globalDomainCache: Cache<unknown> | null = null;

export function createCache<T>(config: CacheConfig): Cache<T> {
  return new Cache<T>(config);
}

export function createDefaultCache<T>(): Cache<T> {
  return createCache<T>({ ttlMs: DEFAULT_TTL_MS });
}

export function getGlobalDomainCache<T>(config?: CacheConfig): Cache<T> {
  if (!globalDomainCache) {
    globalDomainCache = createCache<T>({
      ttlMs: config?.ttlMs ?? DEFAULT_TTL_MS,
      maxSize: config?.maxSize,
      cleanupIntervalMs: config?.cleanupIntervalMs,
    }) as Cache<unknown>;
  }

  return globalDomainCache as Cache<T>;
}

export function resetGlobalDomainCache() {
  globalDomainCache?.destroy();
  globalDomainCache = null;
}
