/**
 * Unit + property tests for the shared elevation helper.
 * @module __tests__/design-system/elevation.test
 *
 * Covers task 5.4 of the premium-glass-design-system spec — totality of the
 * shared `resolveElevation` helper used by every glass component.
 *
 * Validates: Requirements 4.6, 4.7, 4.8
 *   - 4.6 a valid named tier resolves to its `var(--elev-*)`
 *   - 4.7 omitted/undefined/null resolves to the lowest tier
 *   - 4.8 any unrecognized value falls back to the lowest tier (never throws)
 *
 * @see src/components/ui/glass/elevation.ts
 * @see .kiro/specs/premium-glass-design-system/design.md — "Shared elevation handling"
 */

import fc from 'fast-check';
import {
  resolveElevation,
  LOWEST_ELEVATION,
  type Elevation,
} from '../../components/ui/glass/elevation';

// Minimum 100 iterations per property (matches existing PBT style).
const propertyConfig = { numRuns: 100 };

// Shape every resolveElevation output must conform to.
const ELEV_VAR_PATTERN = /^var\(--elev-(1|2|3|gold)\)$/;

// The only inputs that should resolve to something other than LOWEST_ELEVATION,
// paired with their expected output.
const VALID_TIERS: ReadonlyArray<[Elevation, string]> = [
  [1, 'var(--elev-1)'],
  [2, 'var(--elev-2)'],
  [3, 'var(--elev-3)'],
  ['gold', 'var(--elev-gold)'],
];

// ============================================================================
// Req 4.6 — valid named tiers map to their CSS custom property
// ============================================================================

describe('resolveElevation — valid tiers (Req 4.6)', () => {
  it('maps numeric tiers 1/2/3 to their var(--elev-*) references', () => {
    expect(resolveElevation(1)).toBe('var(--elev-1)');
    expect(resolveElevation(2)).toBe('var(--elev-2)');
    expect(resolveElevation(3)).toBe('var(--elev-3)');
  });

  it("maps the 'gold' tier to var(--elev-gold)", () => {
    expect(resolveElevation('gold')).toBe('var(--elev-gold)');
  });

  it.each(VALID_TIERS)('resolveElevation(%p) === %p', (input, expected) => {
    expect(resolveElevation(input)).toBe(expected);
  });
});

// ============================================================================
// Req 4.7 — omitted / undefined / null fall back to the lowest tier
// ============================================================================

describe('resolveElevation — default lowest tier (Req 4.7)', () => {
  it('LOWEST_ELEVATION is var(--elev-1)', () => {
    expect(LOWEST_ELEVATION).toBe('var(--elev-1)');
  });

  it('returns LOWEST_ELEVATION when the argument is omitted', () => {
    expect(resolveElevation()).toBe(LOWEST_ELEVATION);
  });

  it('returns LOWEST_ELEVATION for undefined', () => {
    expect(resolveElevation(undefined)).toBe(LOWEST_ELEVATION);
  });

  it('returns LOWEST_ELEVATION for null', () => {
    expect(resolveElevation(null)).toBe(LOWEST_ELEVATION);
  });
});

// ============================================================================
// Req 4.8 — unrecognized values fall back without throwing
// ============================================================================

describe('resolveElevation — fallback for unrecognized values (Req 4.8)', () => {
  it.each([
    0,
    4,
    -1,
    1.5,
    NaN,
    Infinity,
    '',
    '1px',
    'GOLD',
    'elev-2',
    true,
    false,
    {},
    [],
    [1],
    Symbol('x'),
  ])('returns LOWEST_ELEVATION for %p without throwing', (value) => {
    expect(() => resolveElevation(value as unknown)).not.toThrow();
    expect(resolveElevation(value as unknown)).toBe(LOWEST_ELEVATION);
  });
});

// ============================================================================
// Totality property — resolveElevation is a total function (Req 4.6, 4.7, 4.8)
// Validates: Requirements 4.6, 4.7, 4.8
// ============================================================================

describe('resolveElevation — totality property (Req 4.6, 4.7, 4.8)', () => {
  // Helper: is this input one of the four valid tiers? Mirrors the key lookup
  // in the implementation (String(value) match) so the oracle stays independent
  // of internal data structures.
  const expectedFor = (value: unknown): string => {
    const match = VALID_TIERS.find(([tier]) => tier === value);
    return match ? match[1] : LOWEST_ELEVATION;
  };

  it('never throws and always returns a valid var(--elev-*) for fc.anything()', () => {
    fc.assert(
      fc.property(fc.anything(), (value) => {
        const out = resolveElevation(value);
        expect(typeof out).toBe('string');
        expect(out).toMatch(ELEV_VAR_PATTERN);
      }),
      propertyConfig,
    );
  });

  it('returns LOWEST_ELEVATION for any input that is not a valid tier', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string(),
          fc.integer(),
          fc.double(),
          fc.boolean(),
          fc.object(),
          fc.array(fc.anything()),
          fc.constantFrom(undefined, null, NaN),
        ),
        (value) => {
          const out = resolveElevation(value);
          expect(out).toMatch(ELEV_VAR_PATTERN);
          expect(out).toBe(expectedFor(value));
        },
      ),
      propertyConfig,
    );
  });

  it('always resolves the four valid tiers to their distinct var references', () => {
    fc.assert(
      fc.property(fc.constantFrom<Elevation>(1, 2, 3, 'gold'), (tier) => {
        const out = resolveElevation(tier);
        expect(out).toMatch(ELEV_VAR_PATTERN);
        expect(out).toBe(expectedFor(tier));
      }),
      propertyConfig,
    );
  });
});
