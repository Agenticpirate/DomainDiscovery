/**
 * Instant Domain Search API Service
 * 
 * This service integrates with domain availability APIs.
 * Options:
 * 1. Use Instant Domain Search MCP (requires MCP client setup)
 * 2. Use alternative domain APIs (Domainr, RapidAPI, etc.)
 * 3. Use WHOIS-based checking
 */

interface DomainSearchResult {
  domain: string;
  available: boolean;
  tld: string;
  price?: string;
  registrar?: string;
  premium?: boolean;
  seo?: {
    traffic?: number;
    backlinks?: number;
    authority?: number;
  };
}

interface DomainVariation {
  domain: string;
  available: boolean;
  score: number;
  reason: string;
}

/**
 * Search domains across multiple TLDs
 * This mimics the Instant Domain Search MCP search_domains function
 */
export async function searchDomains(
  query: string,
  tlds: string[] = ['.com', '.net', '.org', '.ai', '.io', '.co']
): Promise<DomainSearchResult[]> {
  try {
    // Option 1: Use your own backend API
    const response = await fetch('/api/domains/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, tlds }),
    });

    if (response.ok) {
      return await response.json();
    }

    // Fallback to mock data if API not available
    console.warn('Domain API not available, using mock data');
    return generateMockResults(query, tlds);
  } catch (error) {
    console.error('Domain search error:', error);
    return generateMockResults(query, tlds);
  }
}

/**
 * Generate domain name variations
 * This mimics the Instant Domain Search MCP generate_domain_variations function
 */
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

    if (response.ok) {
      return await response.json();
    }

    // Fallback to mock generation
    return generateMockVariations(keyword, count);
  } catch (error) {
    console.error('Domain generation error:', error);
    return generateMockVariations(keyword, count);
  }
}

/**
 * Check specific domain availability
 * This mimics the Instant Domain Search MCP check_domain_availability function
 */
export async function checkDomainAvailability(
  domains: string[]
): Promise<{ domain: string; available: boolean }[]> {
  try {
    const response = await fetch('/api/domains/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains }),
    });

    if (response.ok) {
      return await response.json();
    }

    // Fallback to mock checking
    return domains.map((domain) => ({
      domain,
      available: Math.random() > 0.5,
    }));
  } catch (error) {
    console.error('Domain check error:', error);
    return domains.map((domain) => ({
      domain,
      available: Math.random() > 0.5,
    }));
  }
}

/**
 * Get WHOIS information for a domain
 */
export async function getWhoisInfo(domain: string) {
  try {
    const response = await fetch(`/api/domains/whois?domain=${encodeURIComponent(domain)}`);
    
    if (response.ok) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error('WHOIS lookup error:', error);
    return null;
  }
}

/**
 * Get domain value estimate
 */
export async function getDomainValue(domain: string) {
  try {
    const response = await fetch(`/api/domains/value?domain=${encodeURIComponent(domain)}`);
    
    if (response.ok) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error('Domain value error:', error);
    return null;
  }
}

/**
 * Get price comparison across registrars
 */
export async function getPriceComparison(domain: string) {
  try {
    const response = await fetch(`/api/domains/prices?domain=${encodeURIComponent(domain)}`);
    
    if (response.ok) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error('Price comparison error:', error);
    return null;
  }
}

// ============================================================================
// Mock Data Generators (for development/fallback)
// ============================================================================

function generateMockResults(query: string, tlds: string[]): DomainSearchResult[] {
  const cleanQuery = query.toLowerCase().replace(/\s+/g, '');
  
  return tlds.map((tld) => ({
    domain: `${cleanQuery}${tld}`,
    available: Math.random() > 0.4,
    tld: tld.replace('.', ''),
    price: getPriceForTLD(tld),
    registrar: Math.random() > 0.5 ? 'Namecheap' : 'GoDaddy',
    premium: Math.random() > 0.85,
    seo: Math.random() > 0.7 ? {
      traffic: Math.floor(Math.random() * 5000),
      backlinks: Math.floor(Math.random() * 100),
      authority: Math.floor(Math.random() * 50) + 30,
    } : undefined,
  }));
}

function generateMockVariations(keyword: string, count: number): DomainVariation[] {
  const cleanKeyword = keyword.toLowerCase().replace(/\s+/g, '');
  const prefixes = ['get', 'my', 'the', 'try', 'use', 'go', 'hey', 'app'];
  const suffixes = ['app', 'hub', 'pro', 'hq', 'lab', 'io', 'ai', 'tech', 'now', 'live'];
  const variations: DomainVariation[] = [];

  // Original
  variations.push({
    domain: `${cleanKeyword}.com`,
    available: Math.random() > 0.7,
    score: 95,
    reason: 'Short, memorable, and brandable',
  });

  // Prefixes
  for (let i = 0; i < Math.min(3, count - 1); i++) {
    const prefix = prefixes[i % prefixes.length];
    variations.push({
      domain: `${prefix}${cleanKeyword}.com`,
      available: true,
      score: 88 - i * 2,
      reason: `Easy to remember with "${prefix}" prefix`,
    });
  }

  // Suffixes
  for (let i = 0; i < Math.min(3, count - variations.length); i++) {
    const suffix = suffixes[i % suffixes.length];
    variations.push({
      domain: `${cleanKeyword}${suffix}.com`,
      available: true,
      score: 90 - i * 2,
      reason: `Modern and tech-focused with "${suffix}"`,
    });
  }

  // Alternative TLDs
  const altTlds = ['.ai', '.io', '.co', '.app'];
  for (let i = 0; i < Math.min(altTlds.length, count - variations.length); i++) {
    variations.push({
      domain: `${cleanKeyword}${altTlds[i]}`,
      available: true,
      score: 87 - i,
      reason: `Perfect for ${getTLDDescription(altTlds[i])}`,
    });
  }

  return variations.slice(0, count);
}

function getPriceForTLD(tld: string): string {
  const prices: Record<string, string> = {
    '.com': '$12.99',
    '.net': '$14.99',
    '.org': '$13.99',
    '.ai': '$89.99',
    '.io': '$49.99',
    '.co': '$29.99',
    '.app': '$19.99',
    '.dev': '$15.99',
    '.xyz': '$9.99',
    '.tech': '$39.99',
  };
  return prices[tld] || '$19.99';
}

function getTLDDescription(tld: string): string {
  const descriptions: Record<string, string> = {
    '.ai': 'AI/tech products',
    '.io': 'startups and tech companies',
    '.co': 'modern businesses',
    '.app': 'applications and software',
    '.dev': 'developers and tech projects',
    '.tech': 'technology companies',
  };
  return descriptions[tld] || 'your business';
}
