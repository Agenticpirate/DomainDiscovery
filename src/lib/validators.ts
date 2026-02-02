/**
 * Domain validation utilities
 * @module lib/validators
 *
 * Provides validation functions for domain names, bulk input parsing,
 * and input sanitization to prevent XSS attacks.
 *
 * Requirements: 4.1, 14.2
 */

/**
 * Result of validating a single domain
 */
export interface DomainValidation {
  /** Whether the domain is valid */
  isValid: boolean;
  /** Normalized (lowercase) domain name */
  normalized: string;
  /** List of validation errors if any */
  errors: string[];
}

/**
 * Result of validating bulk domain input
 */
export interface BulkValidation {
  /** List of valid, normalized domain names */
  valid: string[];
  /** List of invalid inputs with reasons */
  invalid: Array<{ input: string; reason: string }>;
  /** List of duplicate domains that were removed */
  duplicates: string[];
}

/**
 * Maximum number of domains allowed in bulk operations
 */
export const MAX_BULK_DOMAINS = 500;

/**
 * Maximum length for a single domain label (part between dots)
 */
export const MAX_LABEL_LENGTH = 63;

/**
 * Maximum total length for a domain name
 */
export const MAX_DOMAIN_LENGTH = 253;

/**
 * Regex pattern for valid domain label characters
 * Labels can contain alphanumeric characters and hyphens,
 * but cannot start or end with a hyphen
 */
const VALID_LABEL_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;

/**
 * Regex pattern for valid TLD (must be at least 2 characters, letters only)
 */
const VALID_TLD_PATTERN = /^[a-z]{2,}$/i;

/**
 * Validates a single domain name
 *
 * Validation rules:
 * 1. Domain must contain at least one dot (separating name from TLD)
 * 2. Each label (part between dots) must be 1-63 characters
 * 3. Labels can only contain alphanumeric characters and hyphens
 * 4. Labels cannot start or end with a hyphen
 * 5. Total domain length cannot exceed 253 characters
 * 6. TLD must be at least 2 characters and contain only letters
 *
 * @param input - The domain name to validate
 * @returns Validation result with normalized domain and any errors
 */
export function validateDomain(input: string): DomainValidation {
  const errors: string[] = [];

  // Trim and normalize to lowercase
  const trimmed = input.trim();
  const normalized = trimmed.toLowerCase();

  // Check for empty input
  if (!trimmed) {
    return {
      isValid: false,
      normalized: '',
      errors: ['Domain name cannot be empty'],
    };
  }

  // Check total length
  if (normalized.length > MAX_DOMAIN_LENGTH) {
    errors.push(`Domain name exceeds maximum length of ${MAX_DOMAIN_LENGTH} characters`);
  }

  // Split into labels
  const labels = normalized.split('.');

  // Must have at least 2 parts (name + TLD)
  if (labels.length < 2) {
    errors.push('Domain must include a TLD (e.g., .com, .io)');
    return {
      isValid: false,
      normalized,
      errors,
    };
  }

  // Validate each label
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const isLastLabel = i === labels.length - 1;
    const labelType = isLastLabel ? 'TLD' : `Label "${label}"`;

    // Check for empty label (consecutive dots or leading/trailing dot)
    if (!label) {
      errors.push(`${labelType} cannot be empty`);
      continue;
    }

    // Check label length
    if (label.length > MAX_LABEL_LENGTH) {
      errors.push(`${labelType} exceeds maximum length of ${MAX_LABEL_LENGTH} characters`);
    }

    // For TLD, check it's letters only
    if (isLastLabel) {
      if (!VALID_TLD_PATTERN.test(label)) {
        errors.push('TLD must contain only letters and be at least 2 characters');
      }
    } else {
      // For non-TLD labels, check valid characters
      if (!VALID_LABEL_PATTERN.test(label)) {
        if (label.startsWith('-')) {
          errors.push(`${labelType} cannot start with a hyphen`);
        } else if (label.endsWith('-')) {
          errors.push(`${labelType} cannot end with a hyphen`);
        } else {
          errors.push(`${labelType} contains invalid characters (only alphanumeric and hyphens allowed)`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    normalized,
    errors,
  };
}

/**
 * Parses text content into individual domain lines
 * Handles various line ending formats (CRLF, LF, CR)
 *
 * @param content - Raw text content
 * @returns Array of trimmed, non-empty lines
 */
function parseLines(content: string): string[] {
  return content
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Parses CSV content to extract domain names
 * Assumes domains are in the first column or the entire line is a domain
 *
 * @param content - CSV content
 * @returns Array of extracted domain candidates
 */
function parseCSV(content: string): string[] {
  const lines = parseLines(content);
  const domains: string[] = [];

  for (const line of lines) {
    // Skip header rows that look like column names
    if (line.toLowerCase().includes('domain') && lines.indexOf(line) === 0) {
      continue;
    }

    // Handle comma-separated values - take first column
    if (line.includes(',')) {
      const firstColumn = line.split(',')[0].trim();
      // Remove quotes if present
      const cleaned = firstColumn.replace(/^["']|["']$/g, '');
      if (cleaned) {
        domains.push(cleaned);
      }
    } else {
      domains.push(line);
    }
  }

  return domains;
}

/**
 * Reads file content as text
 *
 * @param file - File object to read
 * @returns Promise resolving to file content as string
 */
async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Validates bulk domain input from textarea or file
 *
 * Processing steps:
 * 1. Parse input (textarea: newline-separated, file: CSV/TXT)
 * 2. Validate each domain
 * 3. Remove duplicates
 * 4. Enforce 500 domain limit
 *
 * @param input - Either a string (textarea content) or File object
 * @returns Promise resolving to validation result
 * @throws Error if more than 500 domains are provided
 */
export async function validateBulkInput(input: string | File): Promise<BulkValidation> {
  let rawDomains: string[];

  // Parse input based on type
  if (typeof input === 'string') {
    rawDomains = parseLines(input);
  } else {
    const content = await readFileContent(input);
    const fileName = input.name.toLowerCase();

    // Use CSV parser for .csv files, otherwise treat as plain text
    if (fileName.endsWith('.csv')) {
      rawDomains = parseCSV(content);
    } else {
      rawDomains = parseLines(content);
    }
  }

  // Check domain limit before processing
  if (rawDomains.length > MAX_BULK_DOMAINS) {
    throw new Error(`Maximum ${MAX_BULK_DOMAINS} domains allowed. You provided ${rawDomains.length} domains.`);
  }

  const valid: string[] = [];
  const invalid: Array<{ input: string; reason: string }> = [];
  const duplicates: string[] = [];
  const seen = new Set<string>();

  for (const rawDomain of rawDomains) {
    const validation = validateDomain(rawDomain);

    if (!validation.isValid) {
      invalid.push({
        input: rawDomain,
        reason: validation.errors.join('; '),
      });
      continue;
    }

    // Check for duplicates using normalized domain
    if (seen.has(validation.normalized)) {
      duplicates.push(validation.normalized);
      continue;
    }

    seen.add(validation.normalized);
    valid.push(validation.normalized);
  }

  return {
    valid,
    invalid,
    duplicates,
  };
}

/**
 * Dangerous HTML/JS patterns to remove during sanitization
 */
const DANGEROUS_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Script tags and their content
  { pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, replacement: '' },
  // Event handlers (onclick, onerror, onload, etc.)
  { pattern: /\s*on\w+\s*=\s*["'][^"']*["']/gi, replacement: '' },
  { pattern: /\s*on\w+\s*=\s*[^\s>]*/gi, replacement: '' },
  // JavaScript URLs
  { pattern: /javascript\s*:/gi, replacement: '' },
  // Data URLs (can contain scripts)
  { pattern: /data\s*:\s*text\/html/gi, replacement: '' },
  // VBScript URLs
  { pattern: /vbscript\s*:/gi, replacement: '' },
  // Style tags (can contain expressions)
  { pattern: /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, replacement: '' },
  // HTML comments (can hide malicious content)
  { pattern: /<!--[\s\S]*?-->/g, replacement: '' },
  // iframe tags
  { pattern: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, replacement: '' },
  { pattern: /<iframe[^>]*>/gi, replacement: '' },
  // object and embed tags
  { pattern: /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, replacement: '' },
  { pattern: /<embed[^>]*>/gi, replacement: '' },
  // form tags
  { pattern: /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, replacement: '' },
  // base tag (can redirect all URLs)
  { pattern: /<base[^>]*>/gi, replacement: '' },
  // meta refresh
  { pattern: /<meta[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi, replacement: '' },
  // SVG with scripts
  { pattern: /<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, replacement: '' },
  // Expression in CSS (IE)
  { pattern: /expression\s*\([^)]*\)/gi, replacement: '' },
  // URL function in CSS
  { pattern: /url\s*\(\s*["']?\s*javascript:/gi, replacement: 'url(' },
];

/**
 * HTML entities to encode for safe display
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Sanitizes user input to prevent XSS attacks
 *
 * This function removes dangerous HTML/JavaScript constructs while
 * preserving domain-related content. It's designed to be used on
 * user input before displaying or processing.
 *
 * Sanitization steps:
 * 1. Remove dangerous patterns (script tags, event handlers, etc.)
 * 2. Encode HTML entities
 * 3. Trim whitespace
 *
 * @param input - The user input to sanitize
 * @returns Sanitized string safe for display
 */
export function sanitizeInput(input: string): string {
  if (!input) {
    return '';
  }

  let sanitized = input;

  // Remove dangerous patterns
  for (const { pattern, replacement } of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  // Encode HTML entities
  sanitized = sanitized.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Checks if a string contains any potentially dangerous content
 * Useful for validation before processing
 *
 * @param input - The string to check
 * @returns True if the input contains dangerous patterns
 */
export function containsDangerousContent(input: string): boolean {
  if (!input) {
    return false;
  }

  for (const { pattern } of DANGEROUS_PATTERNS) {
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
    if (pattern.test(input)) {
      return true;
    }
  }

  return false;
}

/**
 * Validates and sanitizes a domain input for safe processing
 * Combines validation and sanitization in one step
 *
 * @param input - Raw domain input
 * @returns Object with sanitized input and validation result
 */
export function validateAndSanitizeDomain(input: string): {
  sanitized: string;
  validation: DomainValidation;
} {
  const sanitized = sanitizeInput(input);
  const validation = validateDomain(sanitized);

  return {
    sanitized,
    validation,
  };
}
