/**
 * Geo Service
 * Provides geographic location data and geo-based domain generation
 * @module services/geoService
 */

import { GeoLocation, GeoDomainResult } from '@/types/geo';
import countriesData from '@/data/countries.json';
import citiesData from '@/data/cities.json';

/**
 * Country data structure from countries.json
 */
interface CountryData {
  name: string;
  code: string;
  population: number;
  continent: string;
}

/**
 * City data structure from cities.json
 */
interface CityData {
  name: string;
  country: string;
  population: number;
  region?: string;
}

// Type assertions for imported JSON data
const countries: CountryData[] = countriesData as CountryData[];
const cities: CityData[] = citiesData as CityData[];

/**
 * Normalizes a location name for use in domain names
 * - Converts to lowercase
 * - Removes spaces and special characters
 * - Replaces accented characters with ASCII equivalents
 * @param name - The location name to normalize
 * @returns Normalized string suitable for domain names
 */
function normalizeLocationName(name: string): string {
  return name
    .toLowerCase()
    // Remove accents and diacritics
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove spaces and special characters, keep only alphanumeric
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Gets all countries as GeoLocation objects
 * Countries are sorted by population (highest first)
 * @returns Array of GeoLocation objects for all countries
 */
export function getCountries(): GeoLocation[] {
  return countries
    .map((country): GeoLocation => ({
      name: country.name,
      type: 'country',
      population: country.population,
      countryCode: country.code,
    }))
    .sort((a, b) => b.population - a.population);
}

/**
 * Gets cities as GeoLocation objects
 * Optionally filtered by country code
 * Cities are sorted by population (highest first)
 * @param countryCode - Optional ISO country code to filter cities
 * @returns Array of GeoLocation objects for cities
 */
export function getCities(countryCode?: string): GeoLocation[] {
  let filteredCities = cities;
  
  // Filter by country code if provided
  if (countryCode) {
    const normalizedCode = countryCode.toUpperCase();
    filteredCities = cities.filter(city => city.country === normalizedCode);
  }
  
  return filteredCities
    .map((city): GeoLocation => ({
      name: city.name,
      type: 'city',
      population: city.population,
      countryCode: city.country,
    }))
    .sort((a, b) => b.population - a.population);
}

/**
 * Generates geo-based domain suggestions
 * Combines a keyword with geographic location names
 * Results are sorted by population (highest first) as per Requirement 3.2
 * 
 * @param keyword - The keyword to combine with location names
 * @param locations - Array of GeoLocation objects to use
 * @param tlds - Array of TLDs to generate domains for
 * @returns Array of GeoDomainResult objects sorted by population (descending)
 */
export function generateGeoDomains(
  keyword: string,
  locations: GeoLocation[],
  tlds: string[]
): GeoDomainResult[] {
  const normalizedKeyword = keyword.toLowerCase().trim();
  
  if (!normalizedKeyword || locations.length === 0 || tlds.length === 0) {
    return [];
  }
  
  const results: GeoDomainResult[] = [];
  const seenDomains = new Set<string>();
  
  // Process each location
  for (const location of locations) {
    const normalizedLocation = normalizeLocationName(location.name);
    
    // Skip if location name normalizes to empty string
    if (!normalizedLocation) {
      continue;
    }
    
    // Generate domain name: keyword + location
    const domainName = `${normalizedKeyword}${normalizedLocation}`;
    
    // Generate for each TLD
    for (const tld of tlds) {
      const normalizedTld = tld.toLowerCase().replace(/^\./, '');
      const fullDomain = `${domainName}.${normalizedTld}`;
      
      // Skip duplicates
      if (seenDomains.has(fullDomain)) {
        continue;
      }
      seenDomains.add(fullDomain);
      
      results.push({
        domain: fullDomain,
        location,
        // availability is undefined until checked
      });
    }
  }
  
  // Sort by population (highest first) - Requirement 3.2
  results.sort((a, b) => b.location.population - a.location.population);
  
  return results;
}

/**
 * Geo Service interface for external use
 */
export interface GeoService {
  getCountries(): GeoLocation[];
  getCities(countryCode?: string): GeoLocation[];
  generateGeoDomains(keyword: string, locations: GeoLocation[], tlds: string[]): GeoDomainResult[];
}

/**
 * Default geo service instance
 */
export const geoService: GeoService = {
  getCountries,
  getCities,
  generateGeoDomains,
};

export default geoService;
