/**
 * Unit tests for validation utilities
 * @module __tests__/validators.test
 *
 * Tests for domain validation, bulk input parsing, and input sanitization.
 * Requirements: 4.1, 14.2
 */

import {
  validateDomain,
  validateBulkInput,
  sanitizeInput,
  containsDangerousContent,
  validateAndSanitizeDomain,
  MAX_BULK_DOMAINS,
  MAX_LABEL_LENGTH,
  MAX_DOMAIN_LENGTH,
  DomainValidation,
  BulkValidation,
} from '../lib/validators';

describe('validateDomain', () => {
  describe('valid domains', () => {
    it('should accept simple domain names', () => {
      const result = validateDomain('example.com');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('example.com');
      expect(result.errors).toHaveLength(0);
    });

    it('should accept domains with subdomains', () => {
      const result = validateDomain('sub.example.com');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('sub.example.com');
    });

    it('should accept domains with multiple subdomains', () => {
      const result = validateDomain('a.b.c.example.com');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('a.b.c.example.com');
    });

    it('should accept domains with hyphens in the middle', () => {
      const result = validateDomain('my-domain.com');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('my-domain.com');
    });

    it('should accept domains with numbers', () => {
      const result = validateDomain('domain123.com');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('domain123.com');
    });

    it('should accept domains with various TLDs', () => {
      const tlds = ['com', 'io', 'ai', 'co', 'uk', 'org', 'net', 'dev', 'app'];
      for (const tld of tlds) {
        const result = validateDomain(`example.${tld}`);
        expect(result.isValid).toBe(true);
        expect(result.normalized).toBe(`example.${tld}`);
      }
    });

    it('should accept country code TLDs', () => {
      const result = validateDomain('example.co.uk');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('example.co.uk');
    });

    it('should accept single character labels', () => {
      const result = validateDomain('a.com');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('a.com');
    });
  });

  describe('normalization', () => {
    it('should normalize domains to lowercase', () => {
      const result = validateDomain('EXAMPLE.COM');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('example.com');
    });

    it('should normalize mixed case domains', () => {
      const result = validateDomain('ExAmPlE.CoM');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('example.com');
    });

    it('should trim whitespace', () => {
      const result = validateDomain('  example.com  ');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('example.com');
    });
  });

  describe('invalid domains', () => {
    it('should reject empty input', () => {
      const result = validateDomain('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Domain name cannot be empty');
    });

    it('should reject whitespace-only input', () => {
      const result = validateDomain('   ');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Domain name cannot be empty');
    });

    it('should reject domains without TLD', () => {
      const result = validateDomain('example');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Domain must include a TLD (e.g., .com, .io)');
    });

    it('should reject domains starting with hyphen', () => {
      const result = validateDomain('-example.com');
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('cannot start with a hyphen'))).toBe(true);
    });

    it('should reject domains ending with hyphen', () => {
      const result = validateDomain('example-.com');
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('cannot end with a hyphen'))).toBe(true);
    });

    it('should reject domains with invalid characters', () => {
      const result = validateDomain('exam_ple.com');
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('invalid characters'))).toBe(true);
    });

    it('should reject domains with spaces', () => {
      const result = validateDomain('exam ple.com');
      expect(result.isValid).toBe(false);
    });

    it('should reject domains with consecutive dots', () => {
      const result = validateDomain('example..com');
      expect(result.isValid).toBe(false);
    });

    it('should reject domains with leading dot', () => {
      const result = validateDomain('.example.com');
      expect(result.isValid).toBe(false);
    });

    it('should reject domains with trailing dot', () => {
      const result = validateDomain('example.com.');
      expect(result.isValid).toBe(false);
    });

    it('should reject TLDs with numbers', () => {
      const result = validateDomain('example.c0m');
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('TLD must contain only letters'))).toBe(true);
    });

    it('should reject single character TLDs', () => {
      const result = validateDomain('example.c');
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('at least 2 characters'))).toBe(true);
    });
  });

  describe('length constraints', () => {
    it('should accept labels at max length (63 characters)', () => {
      const label = 'a'.repeat(MAX_LABEL_LENGTH);
      const result = validateDomain(`${label}.com`);
      expect(result.isValid).toBe(true);
    });

    it('should reject labels exceeding max length', () => {
      const label = 'a'.repeat(MAX_LABEL_LENGTH + 1);
      const result = validateDomain(`${label}.com`);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('exceeds maximum length'))).toBe(true);
    });

    it('should reject domains exceeding total max length', () => {
      // Create a domain that exceeds 253 characters
      const label = 'a'.repeat(50);
      const domain = `${label}.${label}.${label}.${label}.${label}.com`;
      expect(domain.length).toBeGreaterThan(MAX_DOMAIN_LENGTH);
      const result = validateDomain(domain);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes(`exceeds maximum length of ${MAX_DOMAIN_LENGTH}`))).toBe(true);
    });
  });
});

describe('validateBulkInput', () => {
  describe('textarea input (string)', () => {
    it('should parse newline-separated domains', async () => {
      const input = 'example.com\ntest.io\ndomain.org';
      const result = await validateBulkInput(input);
      expect(result.valid).toEqual(['example.com', 'test.io', 'domain.org']);
      expect(result.invalid).toHaveLength(0);
      expect(result.duplicates).toHaveLength(0);
    });

    it('should handle Windows line endings (CRLF)', async () => {
      const input = 'example.com\r\ntest.io\r\ndomain.org';
      const result = await validateBulkInput(input);
      expect(result.valid).toEqual(['example.com', 'test.io', 'domain.org']);
    });

    it('should handle old Mac line endings (CR)', async () => {
      const input = 'example.com\rtest.io\rdomain.org';
      const result = await validateBulkInput(input);
      expect(result.valid).toEqual(['example.com', 'test.io', 'domain.org']);
    });

    it('should skip empty lines', async () => {
      const input = 'example.com\n\ntest.io\n\n\ndomain.org';
      const result = await validateBulkInput(input);
      expect(result.valid).toEqual(['example.com', 'test.io', 'domain.org']);
    });

    it('should trim whitespace from each line', async () => {
      const input = '  example.com  \n  test.io  ';
      const result = await validateBulkInput(input);
      expect(result.valid).toEqual(['example.com', 'test.io']);
    });

    it('should normalize domains to lowercase', async () => {
      const input = 'EXAMPLE.COM\nTEST.IO';
      const result = await validateBulkInput(input);
      expect(result.valid).toEqual(['example.com', 'test.io']);
    });

    it('should identify invalid domains', async () => {
      const input = 'example.com\ninvalid\ntest.io';
      const result = await validateBulkInput(input);
      expect(result.valid).toEqual(['example.com', 'test.io']);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0].input).toBe('invalid');
      expect(result.invalid[0].reason).toContain('TLD');
    });

    it('should identify duplicate domains', async () => {
      const input = 'example.com\ntest.io\nexample.com\nEXAMPLE.COM';
      const result = await validateBulkInput(input);
      expect(result.valid).toEqual(['example.com', 'test.io']);
      expect(result.duplicates).toEqual(['example.com', 'example.com']);
    });

    it('should handle empty input', async () => {
      const result = await validateBulkInput('');
      expect(result.valid).toHaveLength(0);
      expect(result.invalid).toHaveLength(0);
      expect(result.duplicates).toHaveLength(0);
    });
  });

  describe('domain limit enforcement', () => {
    it('should accept exactly 500 domains', async () => {
      const domains = Array.from({ length: MAX_BULK_DOMAINS }, (_, i) => `domain${i}.com`);
      const input = domains.join('\n');
      const result = await validateBulkInput(input);
      expect(result.valid).toHaveLength(MAX_BULK_DOMAINS);
    });

    it('should reject more than 500 domains', async () => {
      const domains = Array.from({ length: MAX_BULK_DOMAINS + 1 }, (_, i) => `domain${i}.com`);
      const input = domains.join('\n');
      await expect(validateBulkInput(input)).rejects.toThrow(`Maximum ${MAX_BULK_DOMAINS} domains allowed`);
    });

    it('should include count in error message', async () => {
      const count = MAX_BULK_DOMAINS + 50;
      const domains = Array.from({ length: count }, (_, i) => `domain${i}.com`);
      const input = domains.join('\n');
      await expect(validateBulkInput(input)).rejects.toThrow(`You provided ${count} domains`);
    });
  });

  describe('file input', () => {
    // Helper to create a mock File object
    function createMockFile(content: string, name: string): File {
      const blob = new Blob([content], { type: 'text/plain' });
      return new File([blob], name);
    }

    it('should parse TXT file with newline-separated domains', async () => {
      const file = createMockFile('example.com\ntest.io\ndomain.org', 'domains.txt');
      const result = await validateBulkInput(file);
      expect(result.valid).toEqual(['example.com', 'test.io', 'domain.org']);
    });

    it('should parse CSV file with domains in first column', async () => {
      const csvContent = 'domain,status\nexample.com,available\ntest.io,taken';
      const file = createMockFile(csvContent, 'domains.csv');
      const result = await validateBulkInput(file);
      expect(result.valid).toEqual(['example.com', 'test.io']);
    });

    it('should handle CSV with quoted values', async () => {
      const csvContent = '"example.com",available\n"test.io",taken';
      const file = createMockFile(csvContent, 'domains.csv');
      const result = await validateBulkInput(file);
      expect(result.valid).toEqual(['example.com', 'test.io']);
    });

    it('should skip CSV header row', async () => {
      const csvContent = 'domain,status\nexample.com,available';
      const file = createMockFile(csvContent, 'domains.csv');
      const result = await validateBulkInput(file);
      expect(result.valid).toEqual(['example.com']);
      expect(result.valid).not.toContain('domain');
    });

    it('should handle simple CSV without headers', async () => {
      const csvContent = 'example.com\ntest.io';
      const file = createMockFile(csvContent, 'domains.csv');
      const result = await validateBulkInput(file);
      expect(result.valid).toEqual(['example.com', 'test.io']);
    });
  });
});

describe('sanitizeInput', () => {
  describe('basic sanitization', () => {
    it('should return empty string for empty input', () => {
      expect(sanitizeInput('')).toBe('');
    });

    it('should return empty string for null/undefined', () => {
      expect(sanitizeInput(null as unknown as string)).toBe('');
      expect(sanitizeInput(undefined as unknown as string)).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  example.com  ')).toBe('example.com');
    });

    it('should preserve valid domain characters', () => {
      expect(sanitizeInput('my-domain123.com')).toBe('my-domain123.com');
    });
  });

  describe('HTML entity encoding', () => {
    it('should encode ampersand', () => {
      expect(sanitizeInput('a&b')).toBe('a&amp;b');
    });

    it('should encode less than', () => {
      expect(sanitizeInput('a<b')).toBe('a&lt;b');
    });

    it('should encode greater than', () => {
      expect(sanitizeInput('a>b')).toBe('a&gt;b');
    });

    it('should encode double quotes', () => {
      expect(sanitizeInput('a"b')).toBe('a&quot;b');
    });

    it('should encode single quotes', () => {
      expect(sanitizeInput("a'b")).toBe('a&#x27;b');
    });

    it('should encode forward slash', () => {
      expect(sanitizeInput('a/b')).toBe('a&#x2F;b');
    });

    it('should encode backtick', () => {
      expect(sanitizeInput('a`b')).toBe('a&#x60;b');
    });

    it('should encode equals sign', () => {
      expect(sanitizeInput('a=b')).toBe('a&#x3D;b');
    });
  });

  describe('XSS prevention', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>example.com';
      const result = sanitizeInput(input);
      expect(result).not.toContain('script');
      expect(result).not.toContain('alert');
    });

    it('should remove script tags with attributes', () => {
      const input = '<script type="text/javascript">alert("xss")</script>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('script');
    });

    it('should remove onclick handlers', () => {
      const input = '<div onclick="alert(1)">test</div>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
    });

    it('should remove onerror handlers', () => {
      const input = '<img onerror="alert(1)" src="x">';
      const result = sanitizeInput(input);
      expect(result).not.toContain('onerror');
    });

    it('should remove onload handlers', () => {
      const input = '<body onload="alert(1)">';
      const result = sanitizeInput(input);
      expect(result).not.toContain('onload');
    });

    it('should remove javascript: URLs', () => {
      const input = '<a href="javascript:alert(1)">click</a>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('javascript:');
    });

    it('should remove style tags', () => {
      const input = '<style>body{background:red}</style>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('style');
      expect(result).not.toContain('background');
    });

    it('should remove iframe tags', () => {
      const input = '<iframe src="evil.com"></iframe>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('iframe');
    });

    it('should remove HTML comments', () => {
      const input = '<!-- hidden content -->visible';
      const result = sanitizeInput(input);
      expect(result).not.toContain('<!--');
      expect(result).not.toContain('hidden');
    });

    it('should remove data: URLs for HTML', () => {
      const input = '<a href="data:text/html,<script>alert(1)</script>">click</a>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('data:text/html');
    });

    it('should remove vbscript: URLs', () => {
      const input = '<a href="vbscript:msgbox(1)">click</a>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('vbscript:');
    });

    it('should remove object tags', () => {
      const input = '<object data="evil.swf"></object>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('object');
    });

    it('should remove embed tags', () => {
      const input = '<embed src="evil.swf">';
      const result = sanitizeInput(input);
      expect(result).not.toContain('embed');
    });

    it('should remove form tags', () => {
      const input = '<form action="evil.com"><input></form>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('form');
    });

    it('should remove base tags', () => {
      const input = '<base href="evil.com">';
      const result = sanitizeInput(input);
      expect(result).not.toContain('base');
    });

    it('should remove meta refresh', () => {
      const input = '<meta http-equiv="refresh" content="0;url=evil.com">';
      const result = sanitizeInput(input);
      expect(result).not.toContain('refresh');
    });

    it('should remove SVG tags', () => {
      const input = '<svg onload="alert(1)"></svg>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('svg');
    });

    it('should remove CSS expressions', () => {
      const input = 'style="width:expression(alert(1))"';
      const result = sanitizeInput(input);
      expect(result).not.toContain('expression');
    });
  });

  describe('complex XSS patterns', () => {
    it('should handle nested script tags', () => {
      const input = '<script><script>alert(1)</script></script>';
      const result = sanitizeInput(input);
      // The inner script content is removed, but the encoded closing tag remains
      // This is safe because the HTML entities are encoded
      expect(result).not.toContain('<script');
      expect(result).not.toContain('alert');
    });

    it('should handle mixed case script tags', () => {
      const input = '<ScRiPt>alert(1)</sCrIpT>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('alert');
    });

    it('should handle event handlers without quotes', () => {
      const input = '<div onclick=alert(1)>test</div>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('onclick');
    });

    it('should handle multiple dangerous patterns', () => {
      const input = '<script>alert(1)</script><img onerror="alert(2)"><iframe src="evil.com">';
      const result = sanitizeInput(input);
      expect(result).not.toContain('script');
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('iframe');
    });
  });
});

describe('containsDangerousContent', () => {
  it('should return false for empty input', () => {
    expect(containsDangerousContent('')).toBe(false);
  });

  it('should return false for safe input', () => {
    expect(containsDangerousContent('example.com')).toBe(false);
    expect(containsDangerousContent('my-domain123.io')).toBe(false);
  });

  it('should return true for script tags', () => {
    expect(containsDangerousContent('<script>alert(1)</script>')).toBe(true);
  });

  it('should return true for event handlers', () => {
    expect(containsDangerousContent('onclick="alert(1)"')).toBe(true);
  });

  it('should return true for javascript: URLs', () => {
    expect(containsDangerousContent('javascript:alert(1)')).toBe(true);
  });

  it('should return true for iframe tags', () => {
    expect(containsDangerousContent('<iframe src="evil.com">')).toBe(true);
  });
});

describe('validateAndSanitizeDomain', () => {
  it('should sanitize and validate in one step', () => {
    const result = validateAndSanitizeDomain('  EXAMPLE.COM  ');
    expect(result.sanitized).toBe('EXAMPLE.COM');
    expect(result.validation.isValid).toBe(true);
    expect(result.validation.normalized).toBe('example.com');
  });

  it('should handle dangerous input', () => {
    const result = validateAndSanitizeDomain('<script>alert(1)</script>example.com');
    // Script tags are removed, but the remaining content gets HTML encoded
    expect(result.sanitized).not.toContain('<script');
    expect(result.sanitized).not.toContain('alert');
    // After sanitization, the result is "example.com" which is valid
    // The script content is completely removed
    expect(result.sanitized).toBe('example.com');
    expect(result.validation.isValid).toBe(true);
    expect(result.validation.normalized).toBe('example.com');
  });

  it('should handle empty input', () => {
    const result = validateAndSanitizeDomain('');
    expect(result.sanitized).toBe('');
    expect(result.validation.isValid).toBe(false);
  });
});

describe('exported constants', () => {
  it('should export MAX_BULK_DOMAINS as 500', () => {
    expect(MAX_BULK_DOMAINS).toBe(500);
  });

  it('should export MAX_LABEL_LENGTH as 63', () => {
    expect(MAX_LABEL_LENGTH).toBe(63);
  });

  it('should export MAX_DOMAIN_LENGTH as 253', () => {
    expect(MAX_DOMAIN_LENGTH).toBe(253);
  });
});
