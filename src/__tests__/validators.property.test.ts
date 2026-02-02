/**
 * Property-based tests for validation utilities
 * @module __tests__/validators.property.test
 *
 * Uses fast-check to verify universal properties across randomized inputs.
 * Requirements: 4.1, 14.2
 */

import * as fc from 'fast-check';
import {
  validateBulkInput,
  sanitizeInput,
  validateDomain,
} from '../lib/validators';

// Configuration: Minimum 100 iterations per property
const propertyConfig = { numRuns: 100 };

// ============================================================================
// Feature: domains-discovery-platform, Property 9: Bulk Input Parsing
// Validates: Requirements 4.1
// ============================================================================

describe('Property 9: Bulk Input Parsing', () => {
  /**
   * Property: For any textarea input containing domain names separated by newlines,
   * the parser SHALL extract exactly the non-empty, trimmed lines as individual
   * domain candidates, and for any valid domain format, it SHALL be included
   * in the parsed output.
   */

  // Arbitrary for generating valid domain names
  const validDomainArb = fc.tuple(
    // Domain label: alphanumeric, 1-20 chars
    fc.stringMatching(/^[a-z0-9]{1,20}$/),
    // TLD: letters only, 2-6 chars
    fc.stringMatching(/^[a-z]{2,6}$/)
  ).map(([label, tld]) => `${label}.${tld}`);

  // Arbitrary for generating whitespace variations
  const whitespaceArb = fc.stringMatching(/^[ \t]{0,5}$/);

  // Arbitrary for generating line endings
  const lineEndingArb = fc.constantFrom('\n', '\r\n', '\r');

  it('should extract exactly the non-empty, trimmed lines as domain candidates', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate array of lines (some valid domains, some empty, some whitespace-only)
        fc.array(
          fc.oneof(
            validDomainArb,
            fc.constant(''),
            whitespaceArb
          ),
          { minLength: 1, maxLength: 50 }
        ),
        lineEndingArb,
        async (lines, lineEnding) => {
          // Build input string with the specified line ending
          const input = lines.join(lineEnding);

          // Calculate expected non-empty, trimmed lines
          const expectedNonEmptyLines = lines
            .map(line => line.trim())
            .filter(line => line.length > 0);

          // Parse the input
          const result = await validateBulkInput(input);

          // Total parsed items (valid + invalid) should equal non-empty trimmed lines
          // (excluding duplicates which are counted separately)
          const totalParsed = result.valid.length + result.invalid.length + result.duplicates.length;
          
          return totalParsed === expectedNonEmptyLines.length;
        }
      ),
      propertyConfig
    );
  });

  it('should include all valid domain formats in the parsed output', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate array of valid domains
        fc.array(validDomainArb, { minLength: 1, maxLength: 50 }),
        lineEndingArb,
        async (domains, lineEnding) => {
          // Make domains unique to avoid duplicate handling complexity
          const uniqueDomains = [...new Set(domains.map(d => d.toLowerCase()))];
          const input = uniqueDomains.join(lineEnding);

          const result = await validateBulkInput(input);

          // All unique valid domains should be in the valid output
          // (normalized to lowercase)
          const normalizedInput = uniqueDomains.map(d => d.toLowerCase());
          
          return normalizedInput.every(domain => result.valid.includes(domain));
        }
      ),
      propertyConfig
    );
  });

  it('should preserve the count of non-empty lines after parsing', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random strings as lines (mix of valid/invalid)
        fc.array(
          fc.oneof(
            validDomainArb,
            fc.string({ minLength: 1, maxLength: 30 }) // Random strings
          ),
          { minLength: 1, maxLength: 50 }
        ),
        lineEndingArb,
        async (lines, lineEnding) => {
          const input = lines.join(lineEnding);

          // Count non-empty trimmed lines
          const nonEmptyCount = lines
            .map(l => l.trim())
            .filter(l => l.length > 0)
            .length;

          const result = await validateBulkInput(input);

          // Total items should match non-empty line count
          const totalItems = result.valid.length + result.invalid.length + result.duplicates.length;
          
          return totalItems === nonEmptyCount;
        }
      ),
      propertyConfig
    );
  });

  it('should trim whitespace from each line before validation', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid domains with surrounding whitespace
        fc.array(
          fc.tuple(whitespaceArb, validDomainArb, whitespaceArb)
            .map(([pre, domain, post]) => `${pre}${domain}${post}`),
          { minLength: 1, maxLength: 30 }
        ),
        async (paddedDomains) => {
          // Make unique
          const uniquePadded = [...new Set(paddedDomains)];
          const input = uniquePadded.join('\n');

          const result = await validateBulkInput(input);

          // All results should be trimmed (no leading/trailing whitespace)
          const allTrimmed = result.valid.every(d => d === d.trim());
          
          return allTrimmed;
        }
      ),
      propertyConfig
    );
  });

  it('should handle mixed line endings consistently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(validDomainArb, { minLength: 2, maxLength: 20 }),
        async (domains) => {
          const uniqueDomains = [...new Set(domains.map(d => d.toLowerCase()))];
          
          // Create input with mixed line endings
          const mixedInput = uniqueDomains.reduce((acc, domain, i) => {
            const endings = ['\n', '\r\n', '\r'];
            const ending = endings[i % 3];
            return acc + domain + (i < uniqueDomains.length - 1 ? ending : '');
          }, '');

          const result = await validateBulkInput(mixedInput);

          // Should parse all domains regardless of line ending type
          return result.valid.length === uniqueDomains.length;
        }
      ),
      propertyConfig
    );
  });
});

// ============================================================================
// Feature: domains-discovery-platform, Property 23: Input Sanitization
// Validates: Requirements 14.2
// ============================================================================

describe('Property 23: Input Sanitization', () => {
  /**
   * Property: For any user input string, the sanitized output SHALL NOT contain
   * script tags, event handlers, or other potentially dangerous HTML/JavaScript
   * constructs, while preserving the semantic content of valid domain-related input.
   */

  // Dangerous patterns that should never appear in sanitized output
  const dangerousPatterns = [
    /<script\b/i,
    /<\/script>/i,
    /\bon\w+\s*=/i,  // Event handlers like onclick=, onerror=
    /javascript\s*:/i,
    /vbscript\s*:/i,
    /data\s*:\s*text\/html/i,
    /<iframe\b/i,
    /<\/iframe>/i,
    /<object\b/i,
    /<\/object>/i,
    /<embed\b/i,
    /<form\b/i,
    /<\/form>/i,
    /<base\b/i,
    /<style\b/i,
    /<\/style>/i,
    /<svg\b/i,
    /<\/svg>/i,
    /expression\s*\(/i,
    /<!--/,  // HTML comments
    /-->/,
  ];

  // Arbitrary for generating script tag variations
  const scriptTagArb = fc.tuple(
    fc.constantFrom('<script>', '<SCRIPT>', '<Script>', '<script type="text/javascript">'),
    fc.string({ minLength: 0, maxLength: 50 }),
    fc.constantFrom('</script>', '</SCRIPT>', '</Script>')
  ).map(([open, content, close]) => `${open}${content}${close}`);

  // Arbitrary for generating event handler variations
  const eventHandlerArb = fc.tuple(
    fc.constantFrom('onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur'),
    fc.constantFrom('=', ' =', '= ', ' = '),
    fc.constantFrom('"', "'", ''),
    fc.string({ minLength: 1, maxLength: 20 }),
    fc.constantFrom('"', "'", '')
  ).map(([event, eq, q1, value, q2]) => `${event}${eq}${q1}${value}${q2}`);

  // Arbitrary for generating javascript: URL variations
  const jsUrlArb = fc.tuple(
    fc.constantFrom('javascript:', 'JavaScript:', 'JAVASCRIPT:', 'javascript :'),
    fc.string({ minLength: 0, maxLength: 30 })
  ).map(([prefix, code]) => `${prefix}${code}`);

  // Arbitrary for valid domain-like strings
  const domainLikeArb = fc.tuple(
    fc.stringMatching(/^[a-z0-9]{1,20}$/),
    fc.constantFrom('.com', '.io', '.org', '.net', '.ai', '.dev')
  ).map(([name, tld]) => `${name}${tld}`);

  it('should never contain script tags in sanitized output', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          scriptTagArb,
          fc.tuple(fc.string(), scriptTagArb, fc.string())
            .map(([pre, script, post]) => `${pre}${script}${post}`)
        ),
        async (input) => {
          const sanitized = sanitizeInput(input);
          
          // Check that no script-related patterns exist
          const hasScript = /<script\b/i.test(sanitized) || /<\/script>/i.test(sanitized);
          
          return !hasScript;
        }
      ),
      propertyConfig
    );
  });

  it('should never contain event handlers in sanitized output', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          eventHandlerArb,
          fc.tuple(fc.string({ maxLength: 20 }), eventHandlerArb, fc.string({ maxLength: 20 }))
            .map(([pre, handler, post]) => `${pre} ${handler} ${post}`)
        ),
        async (input) => {
          const sanitized = sanitizeInput(input);
          
          // Check that no event handler patterns exist
          const hasEventHandler = /\bon\w+\s*=/i.test(sanitized);
          
          return !hasEventHandler;
        }
      ),
      propertyConfig
    );
  });

  it('should never contain javascript: URLs in sanitized output', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          jsUrlArb,
          fc.tuple(fc.string({ maxLength: 20 }), jsUrlArb)
            .map(([pre, url]) => `${pre}${url}`)
        ),
        async (input) => {
          const sanitized = sanitizeInput(input);
          
          // Check that no javascript: URL patterns exist
          const hasJsUrl = /javascript\s*:/i.test(sanitized);
          
          return !hasJsUrl;
        }
      ),
      propertyConfig
    );
  });

  it('should never contain any dangerous HTML/JS constructs', async () => {
    // Generate inputs with various dangerous patterns
    const dangerousInputArb = fc.oneof(
      scriptTagArb,
      eventHandlerArb,
      jsUrlArb,
      fc.constant('<iframe src="evil.com"></iframe>'),
      fc.constant('<object data="evil.swf"></object>'),
      fc.constant('<embed src="evil.swf">'),
      fc.constant('<form action="evil.com"></form>'),
      fc.constant('<base href="evil.com">'),
      fc.constant('<style>body{}</style>'),
      fc.constant('<svg onload="alert(1)"></svg>'),
      fc.constant('<!-- hidden -->'),
      fc.constant('expression(alert(1))'),
      fc.constant('vbscript:msgbox(1)'),
      fc.constant('data:text/html,<script>alert(1)</script>')
    );

    await fc.assert(
      fc.asyncProperty(
        fc.array(dangerousInputArb, { minLength: 1, maxLength: 5 })
          .map(parts => parts.join(' ')),
        async (input) => {
          const sanitized = sanitizeInput(input);
          
          // Check against all dangerous patterns
          const hasDangerous = dangerousPatterns.some(pattern => pattern.test(sanitized));
          
          return !hasDangerous;
        }
      ),
      propertyConfig
    );
  });

  it('should preserve semantic content of valid domain-related input', async () => {
    await fc.assert(
      fc.asyncProperty(
        domainLikeArb,
        async (domain) => {
          const sanitized = sanitizeInput(domain);
          
          // The domain name should be preserved (though some chars may be encoded)
          // Extract alphanumeric content for comparison
          const originalAlphaNum = domain.replace(/[^a-z0-9]/gi, '').toLowerCase();
          const sanitizedAlphaNum = sanitized.replace(/[^a-z0-9]/gi, '').toLowerCase();
          
          // The alphanumeric content should be preserved
          return sanitizedAlphaNum.includes(originalAlphaNum) || 
                 originalAlphaNum.includes(sanitizedAlphaNum);
        }
      ),
      propertyConfig
    );
  });

  it('should preserve alphanumeric characters in domain names', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate simple alphanumeric domain names
        fc.tuple(
          fc.stringMatching(/^[a-z0-9]{1,15}$/),
          fc.constantFrom('com', 'io', 'org', 'net')
        ).map(([name, tld]) => `${name}.${tld}`),
        async (domain) => {
          const sanitized = sanitizeInput(domain);
          
          // Extract just letters and numbers from both
          const originalChars = domain.match(/[a-z0-9]/gi) || [];
          const sanitizedChars = sanitized.match(/[a-z0-9]/gi) || [];
          
          // All original alphanumeric characters should be present
          return originalChars.every(char => 
            sanitizedChars.includes(char) || sanitizedChars.includes(char.toLowerCase())
          );
        }
      ),
      propertyConfig
    );
  });

  it('should handle mixed safe and dangerous content', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          domainLikeArb,
          fc.oneof(scriptTagArb, eventHandlerArb, jsUrlArb),
          domainLikeArb
        ),
        async ([safeBefore, dangerous, safeAfter]) => {
          const input = `${safeBefore} ${dangerous} ${safeAfter}`;
          const sanitized = sanitizeInput(input);
          
          // Should not contain dangerous patterns
          const hasDangerous = dangerousPatterns.some(pattern => pattern.test(sanitized));
          
          // Should preserve some of the safe content (alphanumeric)
          const beforeAlpha = safeBefore.match(/[a-z0-9]/gi) || [];
          const afterAlpha = safeAfter.match(/[a-z0-9]/gi) || [];
          const sanitizedLower = sanitized.toLowerCase();
          
          const preservesSomeContent = beforeAlpha.some(c => sanitizedLower.includes(c.toLowerCase())) ||
                                       afterAlpha.some(c => sanitizedLower.includes(c.toLowerCase()));
          
          return !hasDangerous && preservesSomeContent;
        }
      ),
      propertyConfig
    );
  });

  it('should produce output that is safe for HTML display', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 200 }),
        async (input) => {
          const sanitized = sanitizeInput(input);
          
          // The sanitized output should not contain unencoded HTML special chars
          // that could be interpreted as HTML tags (except for encoded entities)
          const hasUnescapedHtmlTag = /<[a-z]/i.test(sanitized);
          
          return !hasUnescapedHtmlTag;
        }
      ),
      propertyConfig
    );
  });

  it('should always produce a non-null string output', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.string({ minLength: 0, maxLength: 100 }),
          fc.constant(null as unknown as string),
          fc.constant(undefined as unknown as string)
        ),
        async (input) => {
          const sanitized = sanitizeInput(input);
          
          // Output should always be a string (never null/undefined)
          return typeof sanitized === 'string';
        }
      ),
      propertyConfig
    );
  });

  it('should never increase the danger level of input', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 150 }),
        async (input) => {
          const sanitized = sanitizeInput(input);
          
          // Count dangerous patterns in input vs output
          const inputDangerCount = dangerousPatterns.filter(p => p.test(input)).length;
          const outputDangerCount = dangerousPatterns.filter(p => p.test(sanitized)).length;
          
          // Output should have same or fewer dangerous patterns
          return outputDangerCount <= inputDangerCount;
        }
      ),
      propertyConfig
    );
  });
});
