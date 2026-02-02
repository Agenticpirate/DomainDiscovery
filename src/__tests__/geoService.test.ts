/**
 * Unit tests for Geo Service
 * Tests getCountries, getCities, and generateGeoDomains functions
 * @module __tests__/geoService.test
 */

import {
  getCountries,
  getCities,
  generateGeoDomains,
} from '@/services/geoService';
import { GeoLocation } from '@/types/geo';

describe('geoService', () => {
  describe('getCountries', () => {
    it('should return an array of countries', () => {
      const countries = getCountries();
      
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
    });

    it('should return countries with correct structure', () => {
      const countries = getCountries();
      const firstCountry = countries[0];
      
      expect(firstCountry).toHaveProperty('name');
      expect(firstCountry).toHaveProperty('type', 'country');
      expect(firstCountry).toHaveProperty('population');
      expect(firstCountry).toHaveProperty('countryCode');
      expect(typeof firstCountry.name).toBe('string');
      expect(typeof firstCountry.population).toBe('number');
    });

    it('should return countries sorted by population (highest first)', () => {
      const countries = getCountries();
      
      for (let i = 0; i < countries.length - 1; i++) {
        expect(countries[i].population).toBeGreaterThanOrEqual(countries[i + 1].population);
      }
    });

    it('should include major countries', () => {
      const countries = getCountries();
      const countryNames = countries.map(c => c.name);
      
      expect(countryNames).toContain('United States');
      expect(countryNames).toContain('China');
      expect(countryNames).toContain('India');
    });
  });

  describe('getCities', () => {
    it('should return an array of cities', () => {
      const cities = getCities();
      
      expect(Array.isArray(cities)).toBe(true);
      expect(cities.length).toBeGreaterThan(0);
    });

    it('should return cities with correct structure', () => {
      const cities = getCities();
      const firstCity = cities[0];
      
      expect(firstCity).toHaveProperty('name');
      expect(firstCity).toHaveProperty('type', 'city');
      expect(firstCity).toHaveProperty('population');
      expect(firstCity).toHaveProperty('countryCode');
      expect(typeof firstCity.name).toBe('string');
      expect(typeof firstCity.population).toBe('number');
    });

    it('should return cities sorted by population (highest first)', () => {
      const cities = getCities();
      
      for (let i = 0; i < cities.length - 1; i++) {
        expect(cities[i].population).toBeGreaterThanOrEqual(cities[i + 1].population);
      }
    });

    it('should include major cities', () => {
      const cities = getCities();
      const cityNames = cities.map(c => c.name);
      
      expect(cityNames).toContain('Tokyo');
      expect(cityNames).toContain('New York');
      expect(cityNames).toContain('London');
    });

    it('should filter cities by country code', () => {
      const usCities = getCities('US');
      
      expect(usCities.length).toBeGreaterThan(0);
      expect(usCities.every(city => city.countryCode === 'US')).toBe(true);
    });

    it('should handle lowercase country code', () => {
      const usCities = getCities('us');
      
      expect(usCities.length).toBeGreaterThan(0);
      expect(usCities.every(city => city.countryCode === 'US')).toBe(true);
    });

    it('should return empty array for non-existent country code', () => {
      const cities = getCities('XX');
      
      expect(cities).toEqual([]);
    });

    it('should return filtered cities sorted by population', () => {
      const usCities = getCities('US');
      
      for (let i = 0; i < usCities.length - 1; i++) {
        expect(usCities[i].population).toBeGreaterThanOrEqual(usCities[i + 1].population);
      }
    });
  });

  describe('generateGeoDomains', () => {
    const sampleLocations: GeoLocation[] = [
      { name: 'Tokyo', type: 'city', population: 37400068, countryCode: 'JP' },
      { name: 'New York', type: 'city', population: 18823000, countryCode: 'US' },
      { name: 'London', type: 'city', population: 9304016, countryCode: 'GB' },
    ];

    it('should generate domains combining keyword with locations', () => {
      const results = generateGeoDomains('hotels', sampleLocations, ['com']);
      
      expect(results.length).toBe(3);
      expect(results.map(r => r.domain)).toContain('hotelstokyo.com');
      expect(results.map(r => r.domain)).toContain('hotelsnewyork.com');
      expect(results.map(r => r.domain)).toContain('hotelslondon.com');
    });

    it('should generate domains for multiple TLDs', () => {
      const results = generateGeoDomains('hotels', [sampleLocations[0]], ['com', 'io', 'net']);
      
      expect(results.length).toBe(3);
      expect(results.map(r => r.domain)).toContain('hotelstokyo.com');
      expect(results.map(r => r.domain)).toContain('hotelstokyo.io');
      expect(results.map(r => r.domain)).toContain('hotelstokyo.net');
    });

    it('should sort results by population (highest first)', () => {
      const results = generateGeoDomains('hotels', sampleLocations, ['com']);
      
      // Tokyo (37M) > New York (18M) > London (9M)
      expect(results[0].domain).toBe('hotelstokyo.com');
      expect(results[1].domain).toBe('hotelsnewyork.com');
      expect(results[2].domain).toBe('hotelslondon.com');
      
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].location.population).toBeGreaterThanOrEqual(
          results[i + 1].location.population
        );
      }
    });

    it('should include location data in results', () => {
      const results = generateGeoDomains('hotels', sampleLocations, ['com']);
      
      const tokyoResult = results.find(r => r.domain === 'hotelstokyo.com');
      expect(tokyoResult).toBeDefined();
      expect(tokyoResult?.location.name).toBe('Tokyo');
      expect(tokyoResult?.location.type).toBe('city');
      expect(tokyoResult?.location.population).toBe(37400068);
    });

    it('should normalize location names (remove spaces and special chars)', () => {
      const locationsWithSpaces: GeoLocation[] = [
        { name: 'New York', type: 'city', population: 18823000, countryCode: 'US' },
        { name: 'Los Angeles', type: 'city', population: 3898747, countryCode: 'US' },
      ];
      
      const results = generateGeoDomains('hotels', locationsWithSpaces, ['com']);
      
      expect(results.map(r => r.domain)).toContain('hotelsnewyork.com');
      expect(results.map(r => r.domain)).toContain('hotelslosangeles.com');
    });

    it('should normalize keyword to lowercase', () => {
      const results = generateGeoDomains('HOTELS', [sampleLocations[0]], ['com']);
      
      expect(results[0].domain).toBe('hotelstokyo.com');
    });

    it('should handle TLDs with or without leading dot', () => {
      const results1 = generateGeoDomains('hotels', [sampleLocations[0]], ['com']);
      const results2 = generateGeoDomains('hotels', [sampleLocations[0]], ['.com']);
      
      expect(results1[0].domain).toBe('hotelstokyo.com');
      expect(results2[0].domain).toBe('hotelstokyo.com');
    });

    it('should return empty array for empty keyword', () => {
      const results = generateGeoDomains('', sampleLocations, ['com']);
      
      expect(results).toEqual([]);
    });

    it('should return empty array for whitespace-only keyword', () => {
      const results = generateGeoDomains('   ', sampleLocations, ['com']);
      
      expect(results).toEqual([]);
    });

    it('should return empty array for empty locations', () => {
      const results = generateGeoDomains('hotels', [], ['com']);
      
      expect(results).toEqual([]);
    });

    it('should return empty array for empty TLDs', () => {
      const results = generateGeoDomains('hotels', sampleLocations, []);
      
      expect(results).toEqual([]);
    });

    it('should not include duplicate domains', () => {
      const duplicateLocations: GeoLocation[] = [
        { name: 'Tokyo', type: 'city', population: 37400068, countryCode: 'JP' },
        { name: 'Tokyo', type: 'city', population: 37400068, countryCode: 'JP' },
      ];
      
      const results = generateGeoDomains('hotels', duplicateLocations, ['com']);
      
      const domains = results.map(r => r.domain);
      const uniqueDomains = Array.from(new Set(domains));
      expect(domains.length).toBe(uniqueDomains.length);
    });

    it('should leave availability undefined', () => {
      const results = generateGeoDomains('hotels', sampleLocations, ['com']);
      
      results.forEach(result => {
        expect(result.available).toBeUndefined();
      });
    });

    it('should work with country locations', () => {
      const countryLocations: GeoLocation[] = [
        { name: 'United States', type: 'country', population: 339996563, countryCode: 'US' },
        { name: 'Germany', type: 'country', population: 83294633, countryCode: 'DE' },
      ];
      
      const results = generateGeoDomains('hotels', countryLocations, ['com']);
      
      expect(results.map(r => r.domain)).toContain('hotelsunitedstates.com');
      expect(results.map(r => r.domain)).toContain('hotelsgermany.com');
    });
  });
});
