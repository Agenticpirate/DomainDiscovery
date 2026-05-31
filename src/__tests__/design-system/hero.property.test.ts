/**
 * Property-based tests for the hero copy bounds and the headline fluid-sizing
 * model.
 * @module __tests__/design-system/hero.property.test
 *
 * Covers tasks 10.2 and 10.3 of the premium-glass-design-system spec:
 *   - Property 9:  Hero copy validity bounds                 (Validates: Requirements 10.2)
 *   - Property 10: Headline fluid sizing is monotonic and
 *                  breakpoint-pinned                          (Validates: Requirements 13.4)
 *
 * Uses fast-check to verify these universal properties across broad input
 * spaces, complemented by concrete boundary/edge-case assertions.
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — Correctness
 *      Properties (Property 9, Property 10)
 */

import fc from 'fast-check';
import {
  HERO_HEADLINE,
  HERO_SUBHEAD,
  FORBIDDEN_HEADLINE,
  isValidHeroCopy,
  headlineSizeAt,
  HERO_MIN_VIEWPORT,
  HERO_MAX_VIEWPORT,
  HERO_MIN_REM,
  HERO_MAX_REM,
} from '../../components/home/heroCopy';

// Configuration: minimum 100 iterations per property (matches existing PBT style).
const propertyConfig = { numRuns: 200 };

// ============================================================================
// Property 9: Hero copy validity bounds
// Validates: Requirements 10.2
// ============================================================================

/**
 * Independent re-statement of the Req 10.2 acceptance predicate. The property
 * asserts `isValidHeroCopy` agrees with this explicit boolean for every
 * generated pair, i.e. it accepts IFF the headline length ∈ [1, 80] and is not
 * the forbidden phrase, and the subhead length ∈ [1, 160].
 */
function expectedValid(headline: string, subhead: string): boolean {
  const headlineOk =
    headline.length >= 1 &&
    headline.length <= 80 &&
    headline !== FORBIDDEN_HEADLINE;
  const subheadOk = subhead.length >= 1 && subhead.length <= 160;
  return headlineOk && subheadOk;
}

// Strings of an exact boundary length (length === n is guaranteed by repeat).
const boundaryLengthString = fc
  .constantFrom(0, 1, 2, 78, 79, 80, 81, 82, 158, 159, 160, 161, 162)
  .map((n) => 'a'.repeat(n));

// A headline generator mixing free-form strings, boundary-length strings, and
// the exact forbidden phrase so the IFF predicate is exercised on every branch.
const headlineArb = fc.oneof(
  fc.string(),
  fc.string({ minLength: 0, maxLength: 90 }),
  boundaryLengthString,
  fc.constant(FORBIDDEN_HEADLINE),
);

// A subhead generator mixing free-form strings and boundary-length strings.
const subheadArb = fc.oneof(
  fc.string(),
  fc.string({ minLength: 0, maxLength: 170 }),
  boundaryLengthString,
);

describe('Property 9: Hero copy validity bounds', () => {
  /**
   * Property: `isValidHeroCopy(h, s)` returns true IFF h.length ∈ [1, 80] AND
   * h ≠ FORBIDDEN_HEADLINE AND s.length ∈ [1, 160].
   */
  it('accepts a headline/subhead pair IFF it is within bounds and not the forbidden phrase', () => {
    fc.assert(
      fc.property(headlineArb, subheadArb, (headline, subhead) => {
        expect(isValidHeroCopy(headline, subhead)).toBe(
          expectedValid(headline, subhead),
        );
      }),
      propertyConfig,
    );
  });

  it('rejects the exact forbidden phrase even with a valid subhead', () => {
    const validSubhead = 'a'.repeat(50);
    expect(FORBIDDEN_HEADLINE.length).toBeGreaterThanOrEqual(1);
    expect(FORBIDDEN_HEADLINE.length).toBeLessThanOrEqual(80);
    expect(isValidHeroCopy(FORBIDDEN_HEADLINE, validSubhead)).toBe(false);
  });

  it('rejects an empty headline', () => {
    expect(isValidHeroCopy('', 'a'.repeat(50))).toBe(false);
  });

  it('rejects an 81-character headline (one past the upper bound)', () => {
    expect(isValidHeroCopy('a'.repeat(81), 'a'.repeat(50))).toBe(false);
  });

  it('rejects an empty subhead', () => {
    expect(isValidHeroCopy('a'.repeat(40), '')).toBe(false);
  });

  it('rejects a 161-character subhead (one past the upper bound)', () => {
    expect(isValidHeroCopy('a'.repeat(40), 'a'.repeat(161))).toBe(false);
  });

  it('accepts a valid headline/subhead pair', () => {
    expect(isValidHeroCopy('a'.repeat(40), 'a'.repeat(120))).toBe(true);
    // Exact inclusive boundaries are accepted.
    expect(isValidHeroCopy('a', 'a')).toBe(true);
    expect(isValidHeroCopy('a'.repeat(80), 'a'.repeat(160))).toBe(true);
  });

  it('the shipped HERO_HEADLINE / HERO_SUBHEAD constants pass validation', () => {
    expect(isValidHeroCopy(HERO_HEADLINE, HERO_SUBHEAD)).toBe(true);
  });
});

// ============================================================================
// Property 10: Headline fluid sizing is monotonic and breakpoint-pinned
// Validates: Requirements 13.4
// ============================================================================

// Tiny tolerance to absorb floating-point error in the linear interpolation.
const EPSILON = 1e-9;

const viewportArb = fc.integer({ min: 200, max: 2000 });

describe('Property 10: Headline fluid sizing is monotonic and breakpoint-pinned', () => {
  /**
   * Property: the modeled headline size is pinned to the minimum at or below
   * the mobile breakpoint, pinned to the maximum at or above the desktop
   * breakpoint, and lies between the two within the intermediate range.
   */
  it('is pinned to the minimum at ≤767px, the maximum at ≥1024px, and between in the mid range', () => {
    fc.assert(
      fc.property(viewportArb, (width) => {
        const size = headlineSizeAt(width);
        if (width <= HERO_MIN_VIEWPORT) {
          expect(size).toBe(HERO_MIN_REM);
        } else if (width >= HERO_MAX_VIEWPORT) {
          expect(size).toBe(HERO_MAX_REM);
        } else {
          expect(size).toBeGreaterThanOrEqual(HERO_MIN_REM);
          expect(size).toBeLessThanOrEqual(HERO_MAX_REM);
        }
      }),
      propertyConfig,
    );
  });

  /**
   * Property: the size never decreases as the viewport width increases —
   * monotonic non-decreasing across the full range.
   */
  it('is monotonic non-decreasing in viewport width', () => {
    fc.assert(
      fc.property(viewportArb, viewportArb, (a, b) => {
        const w1 = Math.min(a, b);
        const w2 = Math.max(a, b);
        // w1 <= w2  ⇒  headlineSizeAt(w1) <= headlineSizeAt(w2)
        expect(headlineSizeAt(w1)).toBeLessThanOrEqual(
          headlineSizeAt(w2) + EPSILON,
        );
      }),
      propertyConfig,
    );
  });

  it('is monotonic non-decreasing under a non-negative width delta', () => {
    fc.assert(
      fc.property(
        viewportArb,
        fc.integer({ min: 0, max: 1800 }),
        (w, delta) => {
          expect(headlineSizeAt(w)).toBeLessThanOrEqual(
            headlineSizeAt(w + delta) + EPSILON,
          );
        },
      ),
      propertyConfig,
    );
  });

  it('concrete: breakpoints are pinned exactly', () => {
    expect(headlineSizeAt(767)).toBe(2.5);
    expect(headlineSizeAt(1024)).toBe(5.25);
    expect(headlineSizeAt(500)).toBe(2.5);
    expect(headlineSizeAt(1600)).toBe(5.25);
  });

  it('concrete: a mid-range width interpolates strictly between the bounds', () => {
    const mid = headlineSizeAt(896); // midpoint of (767, 1024)
    expect(mid).toBeGreaterThan(2.5);
    expect(mid).toBeLessThan(5.25);
  });
});
