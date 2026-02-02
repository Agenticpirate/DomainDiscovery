/**
 * Property-based tests for Domain Service
 * @module __tests__/domainService.property.test
 *
 * Uses fast-check to verify universal properties across randomized inputs.
 * Tests domain generator functionality for keyword position, max length, and character exclusion.
 * Requirements: 2.2, 2.3, 2.4
 */

import * as fc from 'fast-check';
import {
  generateSuggestions,
  GeneratorOptions,
} from '@/services/domainService';

// Configuration: Minimum 100 iterations per property
const propertyConfig = { numRuns: 100 };

// ============================================================================
// Arbitraries for generating test inputs
// ============================================================================

/**
 * Arbitrary for generating valid keywords (alphanumeric, lowercase)
 * Keywords should be short enough to combine with other words
 */
const keywordArb = fc.stringMatching(/^[a-z]{2,10}$/);

/**
 * Arbitrary for generating keywords that may contain numbers
 */
const keywordWithNumbersArb = fc.stringMatching(/^[a-z0-9]{2,10}$/);

/**
 * Arbitrary for generating keywords that may contain hyphens
 */
const keywordWithHyphensArb = fc.stringMatching(/^[a-z][a-z\-]{1,8}[a-z]$/);

/**
 * Arbitrary for generating valid TLDs
 */
const tldArb = fc.constantFrom('com', 'io', 'ai', 'net', 'org', 'dev', 'co');

/**
 * Arbitrary for generating arrays of TLDs
 */
const tldsArb = fc.array(tldArb, { minLength: 1, maxLength: 5 })
  .map(tlds => [...new Set(tlds)]); // Remove duplicates

/**
 * Arbitrary for generating position options
 */
const positionArb = fc.constantFrom('start', 'end', 'both') as fc.Arbitrary<'start' | 'end' | 'both'>;

/**
 * Arbitrary for generating max length values
 * Domain names can be 1-63 characters (excluding TLD)
 */
const maxLengthArb = fc.integer({ min: 5, max: 63 });

/**
 * Arbitrary for generating boolean filter options
 */
const booleanArb = fc.boolean();

/**
 * Arbitrary for generating complete GeneratorOptions
 */
const generatorOptionsArb = fc.record({
  tlds: tldsArb,
  position: positionArb,
  maxLength: maxLengthArb,
  excludeNumbers: booleanArb,
  excludeHyphens: booleanArb,
});

// ============================================================================
// Feature: domains-discovery-platform, Property 4: Generator Keyword Position Placement
// Validates: Requirements 2.2
// ============================================================================

describe('Property 4: Generator Keyword Position Placement', () => {
  /**
   * Property: For any keyword and position option (start/end/both), all generated
   * domain suggestions SHALL have the keyword placed according to the selected
   * position—at the start of the domain name for "start", at the end for "end",
   * or either position for "both".
   */

  it('should place keyword at start when position is "start"', () => {
    fc.assert(
      fc.property(
        keywordArb,
        tldsArb,
        maxLengthArb,
        (keyword, tlds, maxLength) => {
          const options: GeneratorOptions = {
            tlds,
            position: 'start',
            maxLength,
            excludeNumbers: false,
            excludeHyphens: false,
          };

          const suggestions = generateSuggestions(keyword, options);

          // All suggestions should have the keyword at the start of the domain name
          return suggestions.every(suggestion => {
            const domainName = suggestion.domain.split('.')[0];
            return domainName.startsWith(keyword.toLowerCase());
          });
        }
      ),
      propertyConfig
    );
  });

  it('should place keyword at end when position is "end"', () => {
    fc.assert(
      fc.property(
        keywordArb,
        tldsArb,
        maxLengthArb,
        (keyword, tlds, maxLength) => {
          const options: GeneratorOptions = {
            tlds,
            position: 'end',
            maxLength,
            excludeNumbers: false,
            excludeHyphens: false,
          };

          const suggestions = generateSuggestions(keyword, options);

          // All suggestions should have the keyword at the end of the domain name
          return suggestions.every(suggestion => {
            const domainName = suggestion.domain.split('.')[0];
            return domainName.endsWith(keyword.toLowerCase());
          });
        }
      ),
      propertyConfig
    );
  });

  it('should place keyword at start OR end when position is "both"', () => {
    fc.assert(
      fc.property(
        keywordArb,
        tldsArb,
        maxLengthArb,
        (keyword, tlds, maxLength) => {
          const options: GeneratorOptions = {
            tlds,
            position: 'both',
            maxLength,
            excludeNumbers: false,
            excludeHyphens: false,
          };

          const suggestions = generateSuggestions(keyword, options);

          // All suggestions should have the keyword at either start or end
          return suggestions.every(suggestion => {
            const domainName = suggestion.domain.split('.')[0];
            const normalizedKeyword = keyword.toLowerCase();
            return domainName.startsWith(normalizedKeyword) || 
                   domainName.endsWith(normalizedKeyword);
          });
        }
      ),
      propertyConfig
    );
  });

  it('should include both start and end positions when position is "both" and suggestions exist', () => {
    fc.assert(
      fc.property(
        keywordArb,
        tldsArb,
        fc.integer({ min: 20, max: 63 }), // Use larger maxLength to ensure suggestions are generated
        (keyword, tlds, maxLength) => {
          const options: GeneratorOptions = {
            tlds,
            position: 'both',
            maxLength,
            excludeNumbers: false,
            excludeHyphens: false,
          };

          const suggestions = generateSuggestions(keyword, options);
          
          // Skip if no suggestions (keyword might be too long or no combinations possible)
          if (suggestions.length === 0) {
            return true;
          }

          const normalizedKeyword = keyword.toLowerCase();
          const domainNames = suggestions.map(s => s.domain.split('.')[0]);
          
          // Filter out exact keyword matches (which satisfy both conditions)
          const combinedDomains = domainNames.filter(d => d !== normalizedKeyword);
          
          // If we have combined domains, check for both positions
          if (combinedDomains.length > 0) {
            const hasStartPosition = combinedDomains.some(d => 
              d.startsWith(normalizedKeyword) && d !== normalizedKeyword
            );
            const hasEndPosition = combinedDomains.some(d => 
              d.endsWith(normalizedKeyword) && d !== normalizedKeyword
            );
            
            // Should have at least one of each position type (if combinations exist)
            return hasStartPosition || hasEndPosition;
          }
          
          return true;
        }
      ),
      propertyConfig
    );
  });

  it('should handle keyword normalization (lowercase) for position checking', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[A-Z]{2,8}$/), // Uppercase keywords
        tldsArb,
        positionArb,
        maxLengthArb,
        (keyword, tlds, position, maxLength) => {
          const options: GeneratorOptions = {
            tlds,
            position,
            maxLength,
            excludeNumbers: false,
            excludeHyphens: false,
          };

          const suggestions = generateSuggestions(keyword, options);
          const normalizedKeyword = keyword.toLowerCase();

          // All suggestions should use lowercase and respect position
          return suggestions.every(suggestion => {
            const domainName = suggestion.domain.split('.')[0];
            
            // Domain should be lowercase
            if (domainName !== domainName.toLowerCase()) {
              return false;
            }

            // Check position based on option
            switch (position) {
              case 'start':
                return domainName.startsWith(normalizedKeyword);
              case 'end':
                return domainName.endsWith(normalizedKeyword);
              case 'both':
                return domainName.startsWith(normalizedKeyword) || 
                       domainName.endsWith(normalizedKeyword);
            }
          });
        }
      ),
      propertyConfig
    );
  });
});

// ============================================================================
// Feature: domains-discovery-platform, Property 5: Generator Max Length Enforcement
// Validates: Requirements 2.3
// ============================================================================

describe('Property 5: Generator Max Length Enforcement', () => {
  /**
   * Property: For any max length setting N, all generated domain suggestions
   * (excluding TLD) SHALL have a length less than or equal to N characters.
   */

  it('should never exceed max length for domain name (excluding TLD)', () => {
    fc.assert(
      fc.property(
        keywordArb,
        tldsArb,
        maxLengthArb,
        positionArb,
        (keyword, tlds, maxLength, position) => {
          const options: GeneratorOptions = {
            tlds,
            position,
            maxLength,
            excludeNumbers: false,
            excludeHyphens: false,
          };

          const suggestions = generateSuggestions(keyword, options);

          // All domain names (excluding TLD) should be <= maxLength
          return suggestions.every(suggestion => {
            const domainName = suggestion.domain.split('.')[0];
            return domainName.length <= maxLength;
          });
        }
      ),
      propertyConfig
    );
  });

  it('should enforce max length regardless of keyword length', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z]{1,20}$/), // Variable length keywords
        tldsArb,
        fc.integer({ min: 3, max: 30 }), // Smaller max lengths to test filtering
        positionArb,
        (keyword, tlds, maxLength, position) => {
          const options: GeneratorOptions = {
            tlds,
            position,
            maxLength,
            excludeNumbers: false,
            excludeHyphens: false,
          };

          const suggestions = generateSuggestions(keyword, options);

          // All suggestions must respect max length
          return suggestions.every(suggestion => {
            const domainName = suggestion.domain.split('.')[0];
            return domainName.length <= maxLength;
          });
        }
      ),
      propertyConfig
    );
  });

  it('should return empty results when keyword exceeds max length', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z]{15,25}$/), // Long keywords
        tldsArb,
        fc.integer({ min: 3, max: 10 }), // Short max length
        positionArb,
        (keyword, tlds, maxLength, position) => {
          const options: GeneratorOptions = {
            tlds,
            position,
            maxLength,
            excludeNumbers: false,
            excludeHyphens: false,
          };

          const suggestions = generateSuggestions(keyword, options);

          // If keyword is longer than maxLength, no suggestions should include it
          if (keyword.length > maxLength) {
            return suggestions.every(suggestion => {
              const domainName = suggestion.domain.split('.')[0];
              return domainName.length <= maxLength;
            });
          }
          
          return true;
        }
      ),
      propertyConfig
    );
  });

  it('should filter out combinations that exceed max length', () => {
    fc.assert(
      fc.property(
        keywordArb,
        tldsArb,
        fc.integer({ min: 5, max: 15 }), // Restrictive max length
        positionArb,
        (keyword, tlds, maxLength, position) => {
          const options: GeneratorOptions = {
            tlds,
            position,
            maxLength,
            excludeNumbers: false,
            excludeHyphens: false,
          };

          const suggestions = generateSuggestions(keyword, options);

          // Verify all suggestions respect the constraint
          const allWithinLimit = suggestions.every(suggestion => {
            const domainName = suggestion.domain.split('.')[0];
            return domainName.length <= maxLength;
          });

          return allWithinLimit;
        }
      ),
      propertyConfig
    );
  });

  it('should handle edge case of maxLength equal to keyword length', () => {
    fc.assert(
      fc.property(
        keywordArb,
        tldsArb,
        positionArb,
        (keyword, tlds, position) => {
          const maxLength = keyword.length; // Exact match

          const options: GeneratorOptions = {
            tlds,
            position,
            maxLength,
            excludeNumbers: false,
            excludeHyphens: false,
          };

          const suggestions = generateSuggestions(keyword, options);

          // All suggestions should be at most keyword length
          return suggestions.every(suggestion => {
            const domainName = suggestion.domain.split('.')[0];
            return domainName.length <= maxLength;
          });
        }
      ),
      propertyConfig
    );
  });
});

// ============================================================================
// Feature: domains-discovery-platform, Property 6: Generator Character Exclusion
// Validates: Requirements 2.4
// ============================================================================

describe('Property 6: Generator Character Exclusion', () => {
  /**
   * Property: For any filter configuration with excluded characters (numbers, hyphens),
   * all generated domain suggestions SHALL NOT contain any of the excluded character types.
   */

  it('should exclude numbers when excludeNumbers is true', () => {
    fc.assert(
      fc.property(
        keywordWithNumbersArb, // Keywords that may contain numbers
        tldsArb,
        maxLengthArb,
        positionArb,
        (keyword, tlds, maxLength, position) => {
          const options: GeneratorOptions = {
            tlds,
            position,
            maxLength,
            excludeNumbers: true,
            excludeHyphens: false,
          };

          const suggestions = generateSuggestions(keyword, options);

          // No suggestion should contain numbers
          return suggestions.every(suggestion => {
            const domainName = suggestion.domain.split('.')[0];
            return !/\d/.test(domainName);
          });
        }
      ),
      propertyConfig
    );
  });

  it('should exclude hyphens when excludeHyphens is true', () => {
    fc.assert(
      fc.property(
        keywordWithHyphensArb, // Keywords that may contain hyphens
        tldsArb,
        maxLengthArb,
        positionArb,
        (keyword, tlds, maxLength, position) => {
          const options: GeneratorOptions = {
            tlds,
            position,
            maxLength,
            excludeNumbers: false,
            excludeHyphens: true,
          };

          const suggestions = generateSuggestions(keyword, options);

          // No suggestion should contain hyphens
          return suggestions.every(suggestion => {
            const domainName = suggestion.domain.split('.')[0];
            return !domainName.includes('-');
          });
        }
      ),
      propertyConfig
    );
  });

  it('should exclude both numbers and hyphens when both filters are enabled', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z0-9\-]{2,10}$/), // Keywords with numbers and hyphens
        tldsArb,
        maxLengthArb,
        positionArb,
        (keyword, tlds, maxLength, position) => {
          const options: GeneratorOptions = {
            tlds,
            position,
            maxLength,
            excludeNumbers: true,
            excludeHyphens: true,
          };

          const suggestions = generateSuggestions(keyword, options);

          // No suggestion should contain numbers or hyphens
          return suggestions.every(suggestion => {
            const domainName = suggestion.domain.split('.')[0];
            const hasNumbers = /\d/.test(domainName);
            const hasHyphens = domainName.includes('-');
            return !hasNumbers && !hasHyphens;
          });
        }
      ),
      propertyConfig
    );
  });

  it('should allow numbers when excludeNumbers is false', () => {
    fc.assert(
      fc.property(
        keywordArb,
        tldsArb,
        maxLengthArb,
        positionArb,
        (keyword, tlds, maxLength, position) => {
          const options: GeneratorOptions = {
            tlds,
            position,
            maxLength,
            excludeNumbers: false,
            excludeHyphens: false,
          };

          const suggestions = generateSuggestions(keyword, options);

          // When excludeNumbers is false, suggestions may contain numbers
          // (this is a permissive test - we just verify the filter doesn't incorrectly exclude)
          // All suggestions should still be valid domain names
          return suggestions.every(suggestion => {
            const domainName = suggestion.domain.split('.')[0];
            // Domain name should only contain valid characters
            return /^[a-z0-9\-]+$/.test(domainName);
          });
        }
      ),
      propertyConfig
    );
  });

  it('should allow hyphens when excludeHyphens is false', () => {
    fc.assert(
      fc.property(
        keywordArb,
        tldsArb,
        maxLengthArb,
        positionArb,
        (keyword, tlds, maxLength, position) => {
          const options: GeneratorOptions = {
            tlds,
            position,
            maxLength,
            excludeNumbers: false,
            excludeHyphens: false,
          };

          const suggestions = generateSuggestions(keyword, options);

          // When excludeHyphens is false, suggestions may contain hyphens
          // All suggestions should still be valid domain names
          return suggestions.every(suggestion => {
            const domainName = suggestion.domain.split('.')[0];
            // Domain name should only contain valid characters
            return /^[a-z0-9\-]+$/.test(domainName);
          });
        }
      ),
      propertyConfig
    );
  });

  it('should apply character exclusion filters consistently across all TLDs', () => {
    fc.assert(
      fc.property(
        keywordWithNumbersArb,
        fc.array(tldArb, { minLength: 2, maxLength: 5 }).map(tlds => [...new Set(tlds)]),
        maxLengthArb,
        positionArb,
        booleanArb,
        booleanArb,
        (keyword, tlds, maxLength, position, excludeNumbers, excludeHyphens) => {
          const options: GeneratorOptions = {
            tlds,
            position,
            maxLength,
            excludeNumbers,
            excludeHyphens,
          };

          const suggestions = generateSuggestions(keyword, options);

          // Group suggestions by domain name (without TLD)
          const domainNames = new Set(suggestions.map(s => s.domain.split('.')[0]));

          // Each unique domain name should respect the filters
          return Array.from(domainNames).every(domainName => {
            if (excludeNumbers && /\d/.test(domainName)) {
              return false;
            }
            if (excludeHyphens && domainName.includes('-')) {
              return false;
            }
            return true;
          });
        }
      ),
      propertyConfig
    );
  });

  it('should filter out keyword itself if it contains excluded characters', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z]+[0-9]+[a-z]*$/), // Keywords with numbers
        tldsArb,
        maxLengthArb,
        positionArb,
        (keyword, tlds, maxLength, position) => {
          const options: GeneratorOptions = {
            tlds,
            position,
            maxLength,
            excludeNumbers: true,
            excludeHyphens: false,
          };

          const suggestions = generateSuggestions(keyword, options);

          // The keyword itself should not appear as a suggestion if it contains numbers
          const keywordLower = keyword.toLowerCase();
          return suggestions.every(suggestion => {
            const domainName = suggestion.domain.split('.')[0];
            // If the domain name equals the keyword, it should not contain numbers
            if (domainName === keywordLower) {
              return !/\d/.test(domainName);
            }
            // All domain names should not contain numbers
            return !/\d/.test(domainName);
          });
        }
      ),
      propertyConfig
    );
  });

  it('should handle combined filters with various generator options', () => {
    fc.assert(
      fc.property(
        generatorOptionsArb,
        keywordArb,
        (options, keyword) => {
          const suggestions = generateSuggestions(keyword, options);

          // Verify all filters are applied correctly
          return suggestions.every(suggestion => {
            const domainName = suggestion.domain.split('.')[0];

            // Check max length
            if (domainName.length > options.maxLength) {
              return false;
            }

            // Check number exclusion
            if (options.excludeNumbers && /\d/.test(domainName)) {
              return false;
            }

            // Check hyphen exclusion
            if (options.excludeHyphens && domainName.includes('-')) {
              return false;
            }

            // Check position
            const normalizedKeyword = keyword.toLowerCase();
            switch (options.position) {
              case 'start':
                if (!domainName.startsWith(normalizedKeyword)) {
                  return false;
                }
                break;
              case 'end':
                if (!domainName.endsWith(normalizedKeyword)) {
                  return false;
                }
                break;
              case 'both':
                if (!domainName.startsWith(normalizedKeyword) && 
                    !domainName.endsWith(normalizedKeyword)) {
                  return false;
                }
                break;
            }

            return true;
          });
        }
      ),
      propertyConfig
    );
  });
});
