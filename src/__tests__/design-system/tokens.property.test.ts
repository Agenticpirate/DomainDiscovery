/**
 * Property-based tests for the design-system token manifest.
 * @module __tests__/design-system/tokens.property.test
 *
 * Uses fast-check to verify universal properties across the shipped manifest.
 * This single file covers three correctness properties from the
 * premium-glass-design-system design doc:
 *   - Property 1  (task 1.3)  — Token manifest completeness and theme parity
 *   - Property 4  (task 3.2)  — Tailwind mapping equivalence
 *   - Property 12 (task 14.2) — Non-regression value preservation
 *
 * Feature: premium-glass-design-system
 */

import fc from 'fast-check';
import {
  colorTokens,
  spacingTokens,
  blurTokens,
  motionTokens,
  elevationTokens,
  typographyTokens,
  tailwindTokenMap,
  tokenManifest,
  knownTokenNames,
  validateThemeParity,
  validateTailwindMapping,
  BASELINE_TOKENS,
  type TokenManifest,
  type ColorTokenDef,
} from '@/design-system/tokens';

// Configuration: minimum 100 iterations per property (matches PBT precedent).
const propertyConfig = { numRuns: 100 } as const;

// A single whole `var(--token-name)` reference, no inner whitespace.
const VAR_REF = /^var\(--[A-Za-z0-9-]+\)$/;
const VAR_REF_CAPTURE = /^var\((--[A-Za-z0-9-]+)\)$/;

// ============================================================================
// Feature: premium-glass-design-system, Property 1: Token manifest
// completeness and theme parity
// Validates: Requirements 1.6, 2.1, 2.6
// ============================================================================

describe('Property 1: Token manifest completeness and theme parity', () => {
  it('every color token has a non-empty dark AND light value', () => {
    fc.assert(
      fc.property(fc.constantFrom(...colorTokens), (token: ColorTokenDef) => {
        expect(typeof token.dark).toBe('string');
        expect(typeof token.light).toBe('string');
        expect(token.dark.trim().length).toBeGreaterThan(0);
        expect(token.light.trim().length).toBeGreaterThan(0);
      }),
      propertyConfig,
    );
  });

  it('the dark color-token name set is identical to the light name set (full parity by construction)', () => {
    const darkNames = new Set(
      colorTokens.filter((t) => t.dark.trim().length > 0).map((t) => t.name),
    );
    const lightNames = new Set(
      colorTokens.filter((t) => t.light.trim().length > 0).map((t) => t.name),
    );

    // Same cardinality and same members in both directions.
    expect(darkNames.size).toBe(lightNames.size);
    for (const name of darkNames) expect(lightNames.has(name)).toBe(true);
    for (const name of lightNames) expect(darkNames.has(name)).toBe(true);

    // Names are internally unique (no accidental duplicate entries).
    expect(darkNames.size).toBe(colorTokens.length);
  });

  it('validateThemeParity reports no violations on the shipped manifest', () => {
    expect(validateThemeParity(tokenManifest)).toEqual([]);
  });

  it('every scalar token (spacing/blur/motion/elevation/typography) has a single non-empty value', () => {
    const allScalarTokens = [
      ...spacingTokens,
      ...blurTokens,
      ...motionTokens,
      ...elevationTokens,
      ...typographyTokens,
    ];

    // Each scalar scale must actually contain tokens.
    expect(spacingTokens.length).toBeGreaterThan(0);
    expect(blurTokens.length).toBeGreaterThan(0);
    expect(motionTokens.length).toBeGreaterThan(0);
    expect(elevationTokens.length).toBeGreaterThan(0);
    expect(typographyTokens.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(fc.constantFrom(...allScalarTokens), (token) => {
        expect(typeof token.value).toBe('string');
        expect(token.value.trim().length).toBeGreaterThan(0);
      }),
      propertyConfig,
    );
  });

  it('a manifest with a color token present in only one theme is flagged by validateThemeParity', () => {
    fc.assert(
      // Pick any color token index to break, and either the dark or light side.
      fc.property(
        fc.nat({ max: colorTokens.length - 1 }),
        fc.constantFrom<'dark' | 'light'>('dark', 'light'),
        (index, side) => {
          const target = colorTokens[index];
          const brokenManifest: TokenManifest = {
            ...tokenManifest,
            colorTokens: colorTokens.map((t, i) =>
              i === index ? { ...t, [side]: '' } : t,
            ),
          };

          const offending = validateThemeParity(brokenManifest);
          // The mutated token must be named as a parity violation.
          expect(offending).toContain(target.name);
        },
      ),
      propertyConfig,
    );
  });
});

// ============================================================================
// Feature: premium-glass-design-system, Property 4: Tailwind mapping
// equivalence
// Validates: Requirements 3.2, 3.4, 3.6
// ============================================================================

interface TailwindEntry {
  category: string;
  key: string;
  value: string;
}

// Flatten every (category, key, value) triple across the Tailwind token map.
const tailwindEntries: TailwindEntry[] = Object.entries(tailwindTokenMap).flatMap(
  ([category, record]) =>
    Object.entries(record as Record<string, string>).map(([key, value]) => ({
      category,
      key,
      value,
    })),
);

describe('Property 4: Tailwind mapping equivalence', () => {
  it('has at least one mapped entry to exercise', () => {
    expect(tailwindEntries.length).toBeGreaterThan(0);
  });

  it('every mapped value is exactly var(--name) referencing a token that exists in the manifest', () => {
    const known = knownTokenNames(tokenManifest);

    fc.assert(
      fc.property(fc.constantFrom(...tailwindEntries), (entry) => {
        // Value is a single, whole var(--token) reference (never a literal).
        expect(entry.value).toMatch(VAR_REF);

        const match = VAR_REF_CAPTURE.exec(entry.value);
        expect(match).not.toBeNull();
        const referencedName = match![1];

        // The referenced token name resolves against the manifest.
        expect(known.has(referencedName)).toBe(true);
      }),
      propertyConfig,
    );
  });

  it('validateTailwindMapping reports no dangling references on the shipped map', () => {
    expect(validateTailwindMapping(tailwindTokenMap, tokenManifest)).toEqual([]);
  });

  it('a dangling var(--does-not-exist) reference is flagged by validateTailwindMapping', () => {
    const danglingValue = 'var(--does-not-exist)';
    const brokenMap = {
      ...tailwindTokenMap,
      colors: {
        ...tailwindTokenMap.colors,
        // Intentionally point at a token name absent from the manifest.
        broken: danglingValue as `var(--${string})`,
      },
    };

    const dangling = validateTailwindMapping(brokenMap, tokenManifest);
    expect(dangling.length).toBeGreaterThan(0);
    expect(dangling).toContain(danglingValue);
  });
});

// ============================================================================
// Feature: premium-glass-design-system, Property 12: Non-regression value
// preservation
// Validates: Requirements 14.2, 14.6
// ============================================================================

/**
 * Documented CURRENT per-theme elevation shadow values, mirroring
 * `src/app/globals.css` (the `--elev-*` shadows are theme-dependent; the light
 * theme softens each). These are the values the baseline elevation entries are
 * expected to preserve.
 */
const CURRENT_ELEVATION_VALUES: ReadonlyArray<{
  name: `--${string}`;
  theme: 'dark' | 'light';
  value: string;
}> = [
  { name: '--elev-1', theme: 'dark', value: '0 1px 2px rgba(0,0,0,0.3)' },
  { name: '--elev-1', theme: 'light', value: '0 1px 2px rgba(15, 23, 42, 0.06)' },
  { name: '--elev-2', theme: 'dark', value: '0 4px 16px -2px rgba(0,0,0,0.45)' },
  { name: '--elev-2', theme: 'light', value: '0 4px 16px -2px rgba(15, 23, 42, 0.1)' },
  { name: '--elev-3', theme: 'dark', value: '0 12px 40px -8px rgba(0,0,0,0.6)' },
  { name: '--elev-3', theme: 'light', value: '0 12px 40px -8px rgba(15, 23, 42, 0.16)' },
  { name: '--elev-gold', theme: 'dark', value: '0 8px 30px -6px rgba(233, 180, 76, 0.28)' },
  { name: '--elev-gold', theme: 'light', value: '0 8px 30px -6px rgba(184, 134, 11, 0.22)' },
];

/**
 * Resolve the CURRENT value for a (token, theme) pair from the live manifest.
 * Color tokens resolve via their `colorTokens` entry; `--elev-*` tokens resolve
 * via the documented current elevation values above.
 */
function resolveCurrentValue(name: string, theme: 'dark' | 'light'): string | undefined {
  const color = colorTokens.find((t) => t.name === name);
  if (color) return theme === 'dark' ? color.dark : color.light;

  const elevation = CURRENT_ELEVATION_VALUES.find(
    (e) => e.name === name && e.theme === theme,
  );
  return elevation?.value;
}

interface Regression {
  name: string;
  theme: 'dark' | 'light';
  expected: string;
  actual: string | undefined;
}

/**
 * Compare a frozen baseline against a current-value resolver and report every
 * (name, theme) whose current value differs, identifying the differing value.
 */
function diffAgainstBaseline(
  baseline: ReadonlyArray<{ name: `--${string}`; theme: 'dark' | 'light'; value: string }>,
  resolver: (name: string, theme: 'dark' | 'light') => string | undefined,
): Regression[] {
  const regressions: Regression[] = [];
  for (const entry of baseline) {
    const actual = resolver(entry.name, entry.theme);
    if (actual !== entry.value) {
      regressions.push({
        name: entry.name,
        theme: entry.theme,
        expected: entry.value,
        actual,
      });
    }
  }
  return regressions;
}

describe('Property 12: Non-regression value preservation', () => {
  it('has a non-empty frozen baseline to check', () => {
    expect(BASELINE_TOKENS.length).toBeGreaterThan(0);
  });

  it('the intentional WCAG correction is baked into the manifest (accent-contrast light = #1a1306)', () => {
    const accentContrast = colorTokens.find((t) => t.name === '--accent-contrast');
    expect(accentContrast).toBeDefined();
    expect(accentContrast!.light).toBe('#1a1306');

    // The baseline must derive from the corrected manifest value.
    const baselineLight = BASELINE_TOKENS.find(
      (e) => e.name === '--accent-contrast' && e.theme === 'light',
    );
    expect(baselineLight?.value).toBe('#1a1306');
  });

  it('the current resolved value equals the frozen baseline for every (token, theme) pair', () => {
    fc.assert(
      fc.property(fc.constantFrom(...BASELINE_TOKENS), (entry) => {
        const current = resolveCurrentValue(entry.name, entry.theme);
        // Every baseline pair must resolve to a current value...
        expect(current).toBeDefined();
        // ...and that value must match the frozen baseline exactly.
        expect(current).toBe(entry.value);
      }),
      propertyConfig,
    );
  });

  it('a tampered current value is flagged with its token name, theme, and differing value', () => {
    fc.assert(
      fc.property(fc.constantFrom(...BASELINE_TOKENS), (entry) => {
        const tamperedValue = `${entry.value}__TAMPERED__`;

        // Resolver that returns a deliberately altered value for exactly one pair.
        const tamperedResolver = (name: string, theme: 'dark' | 'light') => {
          if (name === entry.name && theme === entry.theme) return tamperedValue;
          return resolveCurrentValue(name, theme);
        };

        const regressions = diffAgainstBaseline(BASELINE_TOKENS, tamperedResolver);

        // Exactly the tampered pair is flagged, identified by name + theme + value.
        const flagged = regressions.find(
          (r) => r.name === entry.name && r.theme === entry.theme,
        );
        expect(flagged).toBeDefined();
        expect(flagged!.theme).toBe(entry.theme);
        expect(flagged!.expected).toBe(entry.value);
        expect(flagged!.actual).toBe(tamperedValue);
      }),
      propertyConfig,
    );
  });
});
