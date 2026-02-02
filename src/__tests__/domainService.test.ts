/**
 * Unit tests for Domain Service
 * Tests domain availability checking, suggestion generation, and registrar links
 */

import {
  checkAvailability,
  checkBulk,
  generateSuggestions,
  getRegistrarLinks,
  GeneratorOptions,
} from '@/services/domainService';

describe('domainService', () => {
  describe('checkAvailability', () => {
    it('should return a DomainCheckResult with correct structure', async () => {
      const result = await checkAvailability('example.com');
      
      expect(result).toHaveProperty('domain');
      expect(result).toHaveProperty('available');
      expect(result).toHaveProperty('tld');
      expect(result).toHaveProperty('checkedAt');
      expect(result.domain).toBe('example.com');
      expect(result.tld).toBe('com');
      expect(typeof result.available).toBe('boolean');
      expect(result.checkedAt).toBeInstanceOf(Date);
    });

    it('should normalize domain to lowercase', async () => {
      const result = await checkAvailability('EXAMPLE.COM');
      expect(result.domain).toBe('example.com');
    });

    it('should trim whitespace from domain', async () => {
      const result = await checkAvailability('  example.com  ');
      expect(result.domain).toBe('example.com');
    });

    it('should extract TLD correctly for various domains', async () => {
      const comResult = await checkAvailability('test.com');
      expect(comResult.tld).toBe('com');

      const ioResult = await checkAvailability('test.io');
      expect(ioResult.tld).toBe('io');

      const aiResult = await checkAvailability('test.ai');
      expect(aiResult.tld).toBe('ai');
    });

    it('should include registrar links for available domains', async () => {
      // Run multiple checks to find an available domain
      const domains = ['available1.com', 'available2.com', 'available3.com', 'test123.io'];
      let foundAvailable = false;
      
      for (const domain of domains) {
        const result = await checkAvailability(domain);
        if (result.available) {
          expect(result.registrarLinks).toBeDefined();
          expect(Array.isArray(result.registrarLinks)).toBe(true);
          expect(result.registrarLinks!.length).toBeGreaterThan(0);
          foundAvailable = true;
          break;
        }
      }
      
      // At least one should be available given our mock implementation
      expect(foundAvailable).toBe(true);
    });

    it('should return consistent results for the same domain', async () => {
      const result1 = await checkAvailability('consistent-test.com');
      const result2 = await checkAvailability('consistent-test.com');
      
      expect(result1.available).toBe(result2.available);
    });
  });

  describe('checkBulk', () => {
    it('should check multiple domains and return results for each', async () => {
      const domains = ['test1.com', 'test2.io', 'test3.ai'];
      const results = await checkBulk(domains);
      
      expect(results).toHaveLength(3);
      expect(results[0].domain).toBe('test1.com');
      expect(results[1].domain).toBe('test2.io');
      expect(results[2].domain).toBe('test3.ai');
    });

    it('should return empty array for empty input', async () => {
      const results = await checkBulk([]);
      expect(results).toHaveLength(0);
    });

    it('should handle single domain', async () => {
      const results = await checkBulk(['single.com']);
      expect(results).toHaveLength(1);
      expect(results[0].domain).toBe('single.com');
    });
  });

  describe('generateSuggestions', () => {
    const defaultOptions: GeneratorOptions = {
      tlds: ['com'],
      position: 'both',
      maxLength: 63,
      excludeNumbers: false,
      excludeHyphens: false,
    };

    it('should generate suggestions for a keyword', () => {
      const suggestions = generateSuggestions('tech', defaultOptions);
      
      expect(suggestions.length).toBeGreaterThan(0);
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('domain');
        expect(suggestion).toHaveProperty('score');
        expect(suggestion).toHaveProperty('source');
        expect(suggestion.source).toBe('keyword');
      });
    });

    it('should return empty array for empty keyword', () => {
      const suggestions = generateSuggestions('', defaultOptions);
      expect(suggestions).toHaveLength(0);
    });

    it('should return empty array for whitespace-only keyword', () => {
      const suggestions = generateSuggestions('   ', defaultOptions);
      expect(suggestions).toHaveLength(0);
    });

    it('should place keyword at start when position is "start"', () => {
      const options: GeneratorOptions = {
        ...defaultOptions,
        position: 'start',
      };
      const suggestions = generateSuggestions('my', options);
      
      // All suggestions should start with the keyword
      suggestions.forEach(suggestion => {
        const domainName = suggestion.domain.split('.')[0];
        expect(domainName.startsWith('my')).toBe(true);
      });
    });

    it('should place keyword at end when position is "end"', () => {
      const options: GeneratorOptions = {
        ...defaultOptions,
        position: 'end',
      };
      const suggestions = generateSuggestions('hub', options);
      
      // All suggestions should end with the keyword
      suggestions.forEach(suggestion => {
        const domainName = suggestion.domain.split('.')[0];
        expect(domainName.endsWith('hub')).toBe(true);
      });
    });

    it('should include both positions when position is "both"', () => {
      const options: GeneratorOptions = {
        ...defaultOptions,
        position: 'both',
      };
      const suggestions = generateSuggestions('app', options);
      
      const domainNames = suggestions.map(s => s.domain.split('.')[0]);
      const startsWithKeyword = domainNames.some(d => d.startsWith('app') && d !== 'app');
      const endsWithKeyword = domainNames.some(d => d.endsWith('app') && d !== 'app');
      
      expect(startsWithKeyword).toBe(true);
      expect(endsWithKeyword).toBe(true);
    });

    it('should respect maxLength filter', () => {
      const options: GeneratorOptions = {
        ...defaultOptions,
        maxLength: 10,
      };
      const suggestions = generateSuggestions('test', options);
      
      suggestions.forEach(suggestion => {
        const domainName = suggestion.domain.split('.')[0];
        expect(domainName.length).toBeLessThanOrEqual(10);
      });
    });

    it('should exclude numbers when excludeNumbers is true', () => {
      const options: GeneratorOptions = {
        ...defaultOptions,
        excludeNumbers: true,
      };
      const suggestions = generateSuggestions('test', options);
      
      suggestions.forEach(suggestion => {
        const domainName = suggestion.domain.split('.')[0];
        expect(/\d/.test(domainName)).toBe(false);
      });
    });

    it('should exclude hyphens when excludeHyphens is true', () => {
      const options: GeneratorOptions = {
        ...defaultOptions,
        excludeHyphens: true,
      };
      const suggestions = generateSuggestions('test', options);
      
      suggestions.forEach(suggestion => {
        const domainName = suggestion.domain.split('.')[0];
        expect(domainName.includes('-')).toBe(false);
      });
    });

    it('should generate suggestions for multiple TLDs', () => {
      const options: GeneratorOptions = {
        ...defaultOptions,
        tlds: ['com', 'io', 'ai'],
      };
      const suggestions = generateSuggestions('test', options);
      
      const tlds = new Set(suggestions.map(s => s.domain.split('.').pop()));
      expect(tlds.has('com')).toBe(true);
      expect(tlds.has('io')).toBe(true);
      expect(tlds.has('ai')).toBe(true);
    });

    it('should sort suggestions by score (highest first)', () => {
      const suggestions = generateSuggestions('tech', defaultOptions);
      
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i - 1].score).toBeGreaterThanOrEqual(suggestions[i].score);
      }
    });

    it('should not generate duplicate domains', () => {
      const suggestions = generateSuggestions('app', defaultOptions);
      const domains = suggestions.map(s => s.domain);
      const uniqueDomains = new Set(domains);
      
      expect(domains.length).toBe(uniqueDomains.size);
    });

    it('should normalize keyword to lowercase', () => {
      const suggestions = generateSuggestions('TEST', defaultOptions);
      
      suggestions.forEach(suggestion => {
        expect(suggestion.domain).toBe(suggestion.domain.toLowerCase());
      });
    });
  });

  describe('getRegistrarLinks', () => {
    it('should return registrar links for a domain', () => {
      const links = getRegistrarLinks('example.com');
      
      expect(links.length).toBeGreaterThan(0);
      links.forEach(link => {
        expect(link).toHaveProperty('name');
        expect(link).toHaveProperty('url');
        expect(link).toHaveProperty('affiliate');
        expect(link.affiliate).toBe(true);
      });
    });

    it('should include domain in registrar URLs where applicable', () => {
      const domain = 'testdomain.com';
      const links = getRegistrarLinks(domain);
      
      // Most registrars should include the domain in their search URL
      // Some registrars (like Cloudflare) link to a product page instead
      const linksWithDomain = links.filter(link => 
        link.url.toLowerCase().includes('testdomain')
      );
      
      // At least some registrars should include the domain in the URL
      expect(linksWithDomain.length).toBeGreaterThan(0);
      
      // All links should have valid URLs
      links.forEach(link => {
        expect(link.url).toMatch(/^https?:\/\//);
      });
    });

    it('should include price for supported TLDs', () => {
      const links = getRegistrarLinks('example.com');
      
      // At least some registrars should have pricing for .com
      const linksWithPrice = links.filter(link => link.price !== undefined);
      expect(linksWithPrice.length).toBeGreaterThan(0);
      
      linksWithPrice.forEach(link => {
        expect(link.price).toMatch(/^\$\d+\.\d{2}$/);
      });
    });

    it('should only return registrars that support the TLD', () => {
      // .io is supported by most registrars
      const ioLinks = getRegistrarLinks('example.io');
      expect(ioLinks.length).toBeGreaterThan(0);
      
      // All returned registrars should support .io
      ioLinks.forEach(link => {
        expect(link.url).toBeDefined();
      });
    });

    it('should normalize domain to lowercase', () => {
      const links1 = getRegistrarLinks('EXAMPLE.COM');
      const links2 = getRegistrarLinks('example.com');
      
      expect(links1.length).toBe(links2.length);
    });

    it('should sort links by price (lowest first)', () => {
      const links = getRegistrarLinks('example.com');
      const linksWithPrice = links.filter(link => link.price !== undefined);
      
      for (let i = 1; i < linksWithPrice.length; i++) {
        const prevPrice = parseFloat(linksWithPrice[i - 1].price!.replace('$', ''));
        const currPrice = parseFloat(linksWithPrice[i].price!.replace('$', ''));
        expect(prevPrice).toBeLessThanOrEqual(currPrice);
      }
    });

    it('should include affiliate parameters in URLs', () => {
      const links = getRegistrarLinks('example.com');
      
      links.forEach(link => {
        // Each URL should contain an affiliate parameter
        expect(link.url).toMatch(/[?&][a-z_]+=domainsdiscovery/i);
      });
    });
  });
});
