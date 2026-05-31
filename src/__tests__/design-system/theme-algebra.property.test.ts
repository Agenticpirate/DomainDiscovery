/**
 * Property-based tests for the theme resolution algebra.
 * @module __tests__/design-system/theme-algebra.property.test
 *
 * Covers tasks 2.2 and 2.3 of the premium-glass-design-system spec:
 *   - Property 2: Theme toggle round-trip   (Validates: Requirements 2.4)
 *   - Property 3: Theme toggle idempotence   (Validates: Requirements 2.5)
 *
 * Uses fast-check to verify these universal properties across the full Theme
 * input space, plus a few concrete sanity assertions on the pure helpers.
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — Correctness
 *      Properties (Property 2, Property 3)
 */

import fc from 'fast-check';
import {
  resolveColorTokens,
  setTheme,
  toggleTheme,
  type Theme,
} from '../../design-system/theme';

// Configuration: minimum 100 iterations per property (matches existing PBT style).
const propertyConfig = { numRuns: 100 };

// Arbitrary over the two valid Theme values.
const themeArb = fc.constantFrom<Theme>('dark', 'light');

// ============================================================================
// Property 2: Theme toggle round-trip
// Validates: Requirements 2.4
// ============================================================================

describe('Property 2: Theme toggle round-trip', () => {
  /**
   * Property: For any starting Theme, applying the Theme toggle twice resolves
   * every color Token to the same value it held before the two toggles.
   */
  it('resolveColorTokens(toggle(toggle(t))) deep-equals resolveColorTokens(t)', () => {
    fc.assert(
      fc.property(themeArb, (t) => {
        const roundTrip = toggleTheme(toggleTheme(t));
        expect(resolveColorTokens(roundTrip)).toEqual(resolveColorTokens(t));
      }),
      propertyConfig,
    );
  });

  it('concrete sanity: toggleTheme flips dark↔light', () => {
    expect(toggleTheme('dark')).toBe('light');
    expect(toggleTheme('light')).toBe('dark');
    // Double toggle is the identity on the Theme value itself.
    expect(toggleTheme(toggleTheme('dark'))).toBe('dark');
    expect(toggleTheme(toggleTheme('light'))).toBe('light');
  });
});

// ============================================================================
// Property 3: Theme toggle idempotence
// Validates: Requirements 2.5
// ============================================================================

describe('Property 3: Theme toggle idempotence', () => {
  /**
   * Property: For any target Theme and any repetition count of one or more,
   * setting the Theme to that target value repeatedly resolves every color
   * Token to the same values as setting it to that target exactly once.
   *
   * We start from the opposite Theme and fold `setTheme(result, target)` n
   * times, then assert the resolved color map equals both the single
   * application result and the canonical resolution of the target Theme.
   */
  it('applying setTheme(target) n>=1 times resolves identically to applying it once', () => {
    fc.assert(
      fc.property(themeArb, fc.integer({ min: 1, max: 10 }), (target, n) => {
        const opposite = toggleTheme(target);

        // Fold setTheme n times starting from the opposite Theme.
        let result: Theme = opposite;
        for (let i = 0; i < n; i++) {
          result = setTheme(result, target);
        }

        const single = setTheme(opposite, target);

        // n applications == single application == canonical target resolution.
        expect(resolveColorTokens(result)).toEqual(resolveColorTokens(single));
        expect(resolveColorTokens(result)).toEqual(resolveColorTokens(target));
      }),
      propertyConfig,
    );
  });

  it('concrete sanity: setTheme returns the target regardless of current', () => {
    expect(setTheme('dark', 'light')).toBe('light');
    expect(setTheme('light', 'dark')).toBe('dark');
    expect(setTheme('dark', 'dark')).toBe('dark');
    expect(setTheme('light', 'light')).toBe('light');
  });
});
