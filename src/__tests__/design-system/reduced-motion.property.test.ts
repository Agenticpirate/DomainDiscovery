/**
 * Property-based test for reduced-motion completeness.
 * @module __tests__/design-system/reduced-motion.property.test
 *
 * Covers task 8.3 of the premium-glass-design-system spec:
 *   - Property 7: Reduced-motion completeness
 *     (Validates: Requirements 9.1, 9.2, 9.3, 14.5)
 *
 * Property 7 (design.md): "For every Motion_Primitive-driven animation class —
 * including the new motion utilities, the Hero Ambient_Motion, and the existing
 * motion utilities (animate-rise, animate-rise-sm, animate-scale-in,
 * animate-fade-in, animate-slide-up, animate-float-soft, animate-shimmer) —
 * while Reduced_Motion is active the element resolves to its non-animated final
 * resting state: animation none, full opacity, and no transform offset."
 *
 * SOURCE-OF-TRUTH CONTRACT (why we parse CSS instead of computing style):
 * jsdom does not apply CSS @media rules and does not compute styles from a
 * stylesheet, so `getComputedStyle` cannot observe the
 * `@media (prefers-reduced-motion: reduce)` neutralization. Instead this test
 * verifies the authoritative contract at its source: it parses
 * `src/app/globals.css`, locates the `@media (prefers-reduced-motion: reduce)`
 * rule, and asserts that (a) every class in `motionClasses` appears as a
 * selector inside that block and (b) the block neutralizes motion via
 * `animation: none !important`, `opacity: 1 !important`, and
 * `transform: none !important`. Together these prove that every motion class
 * resolves to its static resting state under reduced motion.
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — Property 7
 */

import fs from 'fs';
import path from 'path';
import fc from 'fast-check';
import { motionClasses } from '../../design-system/tokens';

// Minimum 100 iterations per property (matches existing PBT style in this suite).
const propertyConfig = { numRuns: 100 };

// ---------------------------------------------------------------------------
// Load the source-of-truth stylesheet from disk and extract the
// reduced-motion rule block.
// ---------------------------------------------------------------------------

const GLOBALS_CSS_PATH = path.resolve(process.cwd(), 'src/app/globals.css');

/** Remove CSS block comments so they cannot produce false selector matches. */
function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Extract the body of the `@media (prefers-reduced-motion: reduce)` rule using
 * brace matching (the body contains a nested selector-rule `{ ... }`, so a
 * naive regex is insufficient). Returns the text between the media rule's
 * opening `{` and its matching closing `}`.
 */
function extractReducedMotionBlock(css: string): string {
  const cleaned = stripCssComments(css);
  const marker = /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/.exec(
    cleaned,
  );
  if (!marker) {
    throw new Error(
      'No @media (prefers-reduced-motion: reduce) rule found in globals.css',
    );
  }

  // Find the opening brace that begins the media rule body.
  const openIndex = cleaned.indexOf('{', marker.index + marker[0].length);
  if (openIndex === -1) {
    throw new Error('Malformed reduced-motion rule: missing opening brace');
  }

  // Brace-match to find the corresponding closing brace.
  let depth = 0;
  for (let i = openIndex; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return cleaned.slice(openIndex + 1, i);
      }
    }
  }
  throw new Error('Malformed reduced-motion rule: unbalanced braces');
}

/**
 * Whether `className` appears as a class selector in `block`. Uses a trailing
 * boundary so that `.animate-rise` does NOT spuriously match the prefix of
 * `.animate-rise-sm` (both are independently required to be present).
 */
function selectorPresent(block: string, className: string): boolean {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // A class selector token is `.<name>` not followed by another name char.
  const re = new RegExp(`\\.${escaped}(?![\\w-])`);
  return re.test(block);
}

const reducedMotionBlock = extractReducedMotionBlock(
  fs.readFileSync(GLOBALS_CSS_PATH, 'utf8'),
);

// ============================================================================
// Concrete contract assertions: the reduced-motion block exists and fully
// neutralizes motion.
// ============================================================================

describe('Reduced-motion block contract (globals.css)', () => {
  it('defines a non-empty @media (prefers-reduced-motion: reduce) rule', () => {
    expect(reducedMotionBlock.trim().length).toBeGreaterThan(0);
  });

  it('neutralizes animation, opacity, and transform with !important', () => {
    expect(reducedMotionBlock).toMatch(/animation\s*:\s*none\s*!important/);
    expect(reducedMotionBlock).toMatch(/opacity\s*:\s*1\s*!important/);
    expect(reducedMotionBlock).toMatch(/transform\s*:\s*none\s*!important/);
  });

  it('exposes a non-empty motionClasses manifest to verify against', () => {
    expect(motionClasses.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Property 7: Reduced-motion completeness
// Validates: Requirements 9.1, 9.2, 9.3, 14.5
// ============================================================================

describe('Property 7: Reduced-motion completeness', () => {
  /**
   * Property: For every class in `motionClasses`, the
   * `@media (prefers-reduced-motion: reduce)` block lists that class as a
   * selector, so that — combined with the block's neutralizing declarations
   * (animation: none / opacity: 1 / transform: none, all !important) — the
   * class resolves to its static, non-animated final resting state under
   * reduced motion.
   */
  it('every motion class is neutralized under prefers-reduced-motion', () => {
    // Confirm the neutralizing declarations hold for the whole block once;
    // the property below then proves every class is governed by that block.
    expect(reducedMotionBlock).toMatch(/animation\s*:\s*none\s*!important/);
    expect(reducedMotionBlock).toMatch(/opacity\s*:\s*1\s*!important/);
    expect(reducedMotionBlock).toMatch(/transform\s*:\s*none\s*!important/);

    fc.assert(
      fc.property(fc.constantFrom(...motionClasses), (className) => {
        // The class must be a selector inside the reduced-motion rule.
        expect(selectorPresent(reducedMotionBlock, className)).toBe(true);
      }),
      propertyConfig,
    );
  });

  it('exhaustive: each motionClass is present in the reduced-motion block', () => {
    // The class set is small, so additionally assert each one explicitly to
    // surface the exact missing class name if a gap is ever introduced.
    const missing = motionClasses.filter(
      (cls) => !selectorPresent(reducedMotionBlock, cls),
    );
    expect(missing).toEqual([]);
  });
});
