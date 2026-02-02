/**
 * Domain Service
 * Provides domain availability checking, suggestion generation, and registrar links
 * @module services/domainService
 */

import {
  DomainCheckResult,
  DomainSuggestion,
  RegistrarLink,
} from '@/types/domain';
import keywordsData from '@/data/keywords.json';
import registrarsData from '@/data/registrars.json';

/**
 * Options for generating domain suggestions
 */
export interface GeneratorOptions {
  /** TLDs to use for suggestions */
  tlds: string[];
  /** Position of the keyword in the domain name */
  position: 'start' | 'end' | 'both';
  /** Maximum length of the domain name (excluding TLD) */
  maxLength: number;
  /** Whether to exclude numbers from suggestions */
  excludeNumbers: boolean;
  /** Whether to exclude hyphens from suggestions */
  excludeHyphens: boolean;
}

/**
 * Keyword data structure from keywords.json
 */
interface KeywordData {
  word: string;
  category: string;
  popularity: number;
}

/**
 * Registrar data structure from registrars.json
 */
interface RegistrarData {
  name: string;
  slug: string;
  baseUrl: string;
  affiliateParam: string;
  affiliateId: string;
  supportedTLDs: string[];
  pricing: Record<string, number>;
}

// Type assertions for imported JSON data
const keywords: KeywordData[] = keywordsData as KeywordData[];
const registrars: RegistrarData[] = registrarsData as RegistrarData[];

/**
 * Extracts the TLD from a domain name
 * @param domain - The full domain name (e.g., "example.com")
 * @returns The TLD (e.g., "com")
 */
function extractTLD(domain: string): string {
  const parts = domain.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * Extracts the domain name without TLD
 * @param domain - The full domain name (e.g., "example.com")
 * @returns The domain name without TLD (e.g., "example")
 */
function extractDomainName(domain: string): string {
  const parts = domain.toLowerCase().split('.');
  return parts.length > 0 ? parts[0] : domain;
}

/**
 * Checks if a domain name contains numbers
 * @param domainName - The domain name without TLD
 * @returns True if the domain contains numbers
 */
function containsNumbers(domainName: string): boolean {
  return /\d/.test(domainName);
}

/**
 * Checks if a domain name contains hyphens
 * @param domainName - The domain name without TLD
 * @returns True if the domain contains hyphens
 */
function containsHyphens(domainName: string): boolean {
  return domainName.includes('-');
}

/**
 * Generates a mock availability status for a domain
 * This is a placeholder implementation that returns random availability
 * In production, this would call an actual domain availability API
 * @param domain - The domain to check
 * @returns A boolean indicating mock availability
 */
function getMockAvailability(domain: string): boolean {
  // Use a simple hash-based approach for consistent results per domain
  // This ensures the same domain always returns the same availability
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    const char = domain.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Return available ~60% of the time for better UX
  return Math.abs(hash % 100) < 60;
}

/**
 * Checks the availability of a single domain
 * Currently uses mock implementation - returns random availability
 * @param domain - The domain to check (e.g., "example.com")
 * @returns Promise resolving to DomainCheckResult
 */
export async function checkAvailability(domain: string): Promise<DomainCheckResult> {
  const normalizedDomain = domain.toLowerCase().trim();
  const tld = extractTLD(normalizedDomain);
  const available = getMockAvailability(normalizedDomain);
  
  const result: DomainCheckResult = {
    domain: normalizedDomain,
    available,
    tld,
    checkedAt: new Date(),
  };
  
  // Add registrar links for available domains
  if (available) {
    result.registrarLinks = getRegistrarLinks(normalizedDomain);
  }
  
  return result;
}

/**
 * Checks the availability of multiple domains in bulk
 * @param domains - Array of domains to check
 * @returns Promise resolving to array of DomainCheckResult
 */
export async function checkBulk(domains: string[]): Promise<DomainCheckResult[]> {
  // Process all domains and return results
  const results = await Promise.all(
    domains.map(domain => checkAvailability(domain))
  );
  return results;
}

/**
 * Generates domain suggestions based on a keyword and options
 * Combines the keyword with common words from the keywords database
 * @param keyword - The base keyword to generate suggestions from
 * @param options - Generator options for filtering and positioning
 * @returns Array of DomainSuggestion objects
 */
export function generateSuggestions(
  keyword: string,
  options: GeneratorOptions
): DomainSuggestion[] {
  const normalizedKeyword = keyword.toLowerCase().trim();
  
  if (!normalizedKeyword) {
    return [];
  }
  
  const suggestions: DomainSuggestion[] = [];
  const seenDomains = new Set<string>();
  
  // Get common words to combine with the keyword
  const commonWords = keywords.map(k => k.word);
  
  // Generate combinations based on position option
  for (const word of commonWords) {
    const combinations: string[] = [];
    
    if (options.position === 'start' || options.position === 'both') {
      // Keyword at start: keyword + word
      combinations.push(`${normalizedKeyword}${word}`);
    }
    
    if (options.position === 'end' || options.position === 'both') {
      // Keyword at end: word + keyword
      combinations.push(`${word}${normalizedKeyword}`);
    }
    
    // Process each combination
    for (const domainName of combinations) {
      // Apply filters
      if (options.excludeNumbers && containsNumbers(domainName)) {
        continue;
      }
      
      if (options.excludeHyphens && containsHyphens(domainName)) {
        continue;
      }
      
      // Check max length (domain name without TLD)
      if (domainName.length > options.maxLength) {
        continue;
      }
      
      // Generate suggestions for each TLD
      for (const tld of options.tlds) {
        const fullDomain = `${domainName}.${tld}`;
        
        // Skip duplicates
        if (seenDomains.has(fullDomain)) {
          continue;
        }
        seenDomains.add(fullDomain);
        
        // Calculate a relevance score based on keyword popularity and position
        const keywordInfo = keywords.find(k => k.word === word);
        const popularityScore = keywordInfo?.popularity || 50;
        const score = Math.min(100, Math.max(0, popularityScore));
        
        suggestions.push({
          domain: fullDomain,
          score,
          source: 'keyword',
        });
      }
    }
  }
  
  // Also add the keyword itself with each TLD
  for (const tld of options.tlds) {
    const fullDomain = `${normalizedKeyword}.${tld}`;
    
    if (!seenDomains.has(fullDomain)) {
      // Check filters for the keyword itself
      if (options.excludeNumbers && containsNumbers(normalizedKeyword)) {
        continue;
      }
      if (options.excludeHyphens && containsHyphens(normalizedKeyword)) {
        continue;
      }
      if (normalizedKeyword.length > options.maxLength) {
        continue;
      }
      
      seenDomains.add(fullDomain);
      suggestions.push({
        domain: fullDomain,
        score: 100, // Exact keyword match gets highest score
        source: 'keyword',
      });
    }
  }
  
  // Sort by score (highest first)
  suggestions.sort((a, b) => b.score - a.score);
  
  return suggestions;
}

/**
 * Gets registrar links for a domain with affiliate URLs
 * @param domain - The domain to get registrar links for
 * @returns Array of RegistrarLink objects
 */
export function getRegistrarLinks(domain: string): RegistrarLink[] {
  const normalizedDomain = domain.toLowerCase().trim();
  const tld = extractTLD(normalizedDomain);
  
  const links: RegistrarLink[] = [];
  
  for (const registrar of registrars) {
    // Check if registrar supports this TLD
    if (!registrar.supportedTLDs.includes(tld)) {
      continue;
    }
    
    // Build the affiliate URL
    const searchQuery = encodeURIComponent(normalizedDomain);
    let url: string;
    
    // Different registrars have different URL patterns
    switch (registrar.slug) {
      case 'godaddy':
        url = `${registrar.baseUrl}?domainToCheck=${searchQuery}&${registrar.affiliateParam}=${registrar.affiliateId}`;
        break;
      case 'namecheap':
        url = `${registrar.baseUrl}?domain=${searchQuery}&${registrar.affiliateParam}=${registrar.affiliateId}`;
        break;
      case 'porkbun':
        url = `${registrar.baseUrl}?q=${searchQuery}&${registrar.affiliateParam}=${registrar.affiliateId}`;
        break;
      case 'google-domains':
        url = `${registrar.baseUrl}?searchTerm=${searchQuery}&${registrar.affiliateParam}=${registrar.affiliateId}`;
        break;
      case 'cloudflare':
        url = `${registrar.baseUrl}?${registrar.affiliateParam}=${registrar.affiliateId}`;
        break;
      case 'hover':
      case 'namecom':
        url = `${registrar.baseUrl}?q=${searchQuery}&${registrar.affiliateParam}=${registrar.affiliateId}`;
        break;
      case 'dynadot':
        url = `${registrar.baseUrl}?domain=${searchQuery}&${registrar.affiliateParam}=${registrar.affiliateId}`;
        break;
      default:
        url = `${registrar.baseUrl}?domain=${searchQuery}&${registrar.affiliateParam}=${registrar.affiliateId}`;
    }
    
    // Get price for this TLD if available
    const price = registrar.pricing[tld];
    
    links.push({
      name: registrar.name,
      url,
      price: price ? `$${price.toFixed(2)}` : undefined,
      affiliate: true,
    });
  }
  
  // Sort by price (lowest first) if prices are available
  links.sort((a, b) => {
    if (!a.price && !b.price) return 0;
    if (!a.price) return 1;
    if (!b.price) return -1;
    const priceA = parseFloat(a.price.replace('$', ''));
    const priceB = parseFloat(b.price.replace('$', ''));
    return priceA - priceB;
  });
  
  return links;
}

/**
 * Domain Service interface for external use
 */
export interface DomainService {
  checkAvailability(domain: string): Promise<DomainCheckResult>;
  checkBulk(domains: string[]): Promise<DomainCheckResult[]>;
  generateSuggestions(keyword: string, options: GeneratorOptions): DomainSuggestion[];
  getRegistrarLinks(domain: string): RegistrarLink[];
}

/**
 * Default domain service instance
 */
export const domainService: DomainService = {
  checkAvailability,
  checkBulk,
  generateSuggestions,
  getRegistrarLinks,
};

export default domainService;
