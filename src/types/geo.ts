/**
 * Geographic-related type definitions
 * @module types/geo
 */

/**
 * Represents a geographic location (country or city)
 */
export interface GeoLocation {
  /** Name of the location */
  name: string;
  /** Type of location */
  type: 'country' | 'city';
  /** Population of the location */
  population: number;
  /** ISO country code (for cities, this is the parent country) */
  countryCode?: string;
}

/**
 * Result of a geo-based domain generation
 */
export interface GeoDomainResult {
  /** The generated domain name */
  domain: string;
  /** The geographic location used to generate this domain */
  location: GeoLocation;
  /** Optional availability status if checked */
  available?: boolean;
}
