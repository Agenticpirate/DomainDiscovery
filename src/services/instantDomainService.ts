/**
 * Instant Domain Search Client Service
 * 
 * All functions call the backend API routes which handle:
 * - Rate limiting
 * - Caching
 * - Real DNS-based availability checking
 * - No random/mock data in production
 */

interface DomainSearchResult {
  domain: string;
  available: boolean;
  tld: string;
  price?: string;
  registrar?: string;
  premium?: boolean;
}

interface DomainVariation {
  domain: string;
  available: boolean;
  score: number;
  reason: string;
}

interface SearchDomainsOptions {
  signal?: AbortSignal;
}

const SEARCH_CACHE_TTL_MS = 30_000;
const searchCache = new Map<string, { expiresAt: number; results: DomainSearchResult[] }>();
const inFlightSearches = new Map<string, Promise<DomainSearchResult[]>>();

function getSearchCacheKey(query: string, tlds: string[]) {
  return JSON.stringify({
    query: query.trim().toLowerCase(),
    tlds: tlds.map((tld) => tld.trim().toLowerCase()),
  });
}

export async function searchDomains(
  query: string,
  tlds: string[] = ['.com', '.net', '.org', '.ai', '.io', '.co'],
  options: SearchDomainsOptions = {}
): Promise<DomainSearchResult[]> {
  const cacheKey = getSearchCacheKey(query, tlds);
  const cached = searchCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.results;
  }

  const existingRequest = inFlightSearches.get(cacheKey);
  if (existingRequest) {
    return existingRequest;
  }

  const requestPromise = (async () => {
  try {
    const response = await fetch('/api/domains/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, tlds }),
      signal: options.signal,
    });

    if (response.status === 429) {
      console.warn('Rate limited. Please slow down.');
      return [];
    }

    if (!response.ok) {
      console.error('Search API error:', response.status);
      return [];
    }

      const results = (await response.json()) as DomainSearchResult[];
      searchCache.set(cacheKey, {
        expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
        results,
      });
      return results;
  } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return [];
      }
    console.error('Domain search error:', error);
    return [];
    } finally {
      inFlightSearches.delete(cacheKey);
    }
  })();

  inFlightSearches.set(cacheKey, requestPromise);
  return requestPromise;
}

export async function generateDomainVariations(
  keyword: string,
  count: number = 10
): Promise<DomainVariation[]> {
  try {
    const response = await fetch('/api/domains/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, count }),
    });

    if (response.status === 429) return [];
    if (!response.ok) return [];

    return await response.json();
  } catch (error) {
    console.error('Domain generation error:', error);
    return [];
  }
}

export async function checkDomainAvailability(
  domains: string[]
): Promise<{ domain: string; available: boolean; premium?: boolean; price?: string }[]> {
  try {
    const response = await fetch('/api/domains/instant-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains }),
    });

    if (response.status === 429) return [];
    if (!response.ok) return [];

    return await response.json();
  } catch (error) {
    console.error('Domain check error:', error);
    return [];
  }
}

export async function getWhoisInfo(domain: string) {
  try {
    const response = await fetch(`/api/domains/whois?domain=${encodeURIComponent(domain)}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}


export async function getPriceComparison(domain: string) {
  try {
    const response = await fetch(`/api/domains/prices?domain=${encodeURIComponent(domain)}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
