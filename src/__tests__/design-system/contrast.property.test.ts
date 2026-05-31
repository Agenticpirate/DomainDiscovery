/**
 * Contrast utility — unit tests + Property 5 (contrast invariant on glass surfaces).
 * @module __tests__/design-system/contrast.property.test
 *
 * Uses fast-check to verify universal properties across randomized inputs, plus
 * pinned unit tests for the WCAG contrast math against reference pairs.
 *
 * Covers two tasks of the premium-glass-design-system spec:
 *   - Task 4.2 — Contrast math unit tests (Requirements 6.5, 6.6)
 *   - Task 4.3 — Property 5: Contrast invariant on glass surfaces
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — Data Models →
 *      "Contrast model"; Correctness Properties → Property 5
 */

import * as fc from 'fast-check';

import {
  type RGB,
  type RGBA,
  alphaComposite,
  contrastRatio,
  effectiveSurface,
  parseColor,
  relativeLuminance,
  round2,
  verifyContrast,
} from '@/design-system/contrast';
import { type Theme, resolveColorTokens } from '@/design-system/theme';
import {
  type ContrastPairing,
  contrastPairings,
  tokenManifest,
} from '@/design-system/tokens';

// Configuration: Minimum 100 iterations per property (per design / PBT guidance).
const propertyConfig = { numRuns: 100 };

/** Strip the alpha channel from an RGBA, yielding an opaque RGB. */
function toRGB(c: RGBA): RGB {
  return { r: c.r, g: c.g, b: c.b };
}

// ============================================================================
// Task 4.2 — Contrast math unit tests
// Validates: Requirements 6.5, 6.6
// ============================================================================

describe('Contrast math (Task 4.2)', () => {
  describe('relativeLuminance / contrastRatio — WCAG reference pairs (Req 6.6)', () => {
    it('black vs white is exactly 21:1', () => {
      const black = parseColor('#000000');
      const white = parseColor('#ffffff');
      expect(contrastRatio(toRGB(black), toRGB(white))).toBe(21);
    });

    it('is symmetric (white vs black also 21:1)', () => {
      const black = parseColor('#000000');
      const white = parseColor('#ffffff');
      expect(contrastRatio(toRGB(white), toRGB(black))).toBe(21);
    });

    it('white vs white is exactly 1:1', () => {
      const white = parseColor('#ffffff');
      expect(contrastRatio(toRGB(white), toRGB(white))).toBe(1);
    });

    it('black vs black is exactly 1:1', () => {
      const black = parseColor('#000000');
      expect(contrastRatio(toRGB(black), toRGB(black))).toBe(1);
    });

    it('pins relative luminance of the sRGB endpoints', () => {
      expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
      expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 10);
    });
  });

  describe('two-decimal rounding (Req 6.6)', () => {
    it('round2 is idempotent', () => {
      fc.assert(
        fc.property(fc.double({ min: 1, max: 21, noNaN: true }), (x) => {
          expect(round2(round2(x))).toBe(round2(x));
        }),
        propertyConfig,
      );
    });

    it('contrastRatio returns a value already rounded to two decimals', () => {
      fc.assert(
        fc.property(
          fc.record({
            r: fc.integer({ min: 0, max: 255 }),
            g: fc.integer({ min: 0, max: 255 }),
            b: fc.integer({ min: 0, max: 255 }),
          }),
          fc.record({
            r: fc.integer({ min: 0, max: 255 }),
            g: fc.integer({ min: 0, max: 255 }),
            b: fc.integer({ min: 0, max: 255 }),
          }),
          (fg, bg) => {
            const ratio = contrastRatio(fg, bg);
            // Already rounded to 2dp ⇒ rounding again is a no-op.
            expect(round2(ratio)).toBe(ratio);
            // ratio * 100 is (within float tolerance) an integer.
            expect(Math.abs(ratio * 100 - Math.round(ratio * 100))).toBeLessThan(1e-9);
          },
        ),
        propertyConfig,
      );
    });
  });

  describe('alphaComposite boundaries (Req 6.5)', () => {
    it('at a = 1 returns the foreground RGB (full coverage)', () => {
      const fg: RGBA = { r: 12, g: 200, b: 99, a: 1 };
      const bg: RGB = { r: 255, g: 255, b: 255 };
      expect(alphaComposite(fg, bg)).toEqual({ r: 12, g: 200, b: 99 });
    });

    it('at a = 0 returns the base background exactly (fully transparent)', () => {
      const fg: RGBA = { r: 12, g: 200, b: 99, a: 0 };
      const bg: RGB = { r: 10, g: 20, b: 30 };
      expect(alphaComposite(fg, bg)).toEqual({ r: 10, g: 20, b: 30 });
    });

    it('blends at the midpoint (a = 0.5) toward the average', () => {
      const fg: RGBA = { r: 0, g: 0, b: 0, a: 0.5 };
      const bg: RGB = { r: 200, g: 100, b: 50 };
      // round(0*0.5 + channel*0.5)
      expect(alphaComposite(fg, bg)).toEqual({ r: 100, g: 50, b: 25 });
    });

    it('effectiveSurface composites a translucent surface over an opaque base', () => {
      const surface: RGBA = { r: 17, g: 17, b: 17, a: 0.8 };
      const base: RGB = { r: 10, g: 10, b: 10 };
      // Equivalent to alphaComposite of the surface over the base.
      expect(effectiveSurface(surface, base)).toEqual(alphaComposite(surface, base));
    });
  });

  describe('parseColor — supported formats (Req 6.5)', () => {
    it('parses 3-digit #rgb (expanded, opaque)', () => {
      expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
      expect(parseColor('#000')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
      expect(parseColor('#abc')).toEqual({ r: 0xaa, g: 0xbb, b: 0xcc, a: 1 });
    });

    it('parses 6-digit #rrggbb (opaque)', () => {
      expect(parseColor('#E9B44C')).toEqual({ r: 0xe9, g: 0xb4, b: 0x4c, a: 1 });
    });

    it('parses 8-digit #rrggbbaa (alpha from the last byte)', () => {
      const c = parseColor('#11111180');
      expect(c.r).toBe(0x11);
      expect(c.g).toBe(0x11);
      expect(c.b).toBe(0x11);
      expect(c.a).toBeCloseTo(0x80 / 255, 10);
    });

    it('parses rgb()', () => {
      expect(parseColor('rgb(255, 0, 128)')).toEqual({ r: 255, g: 0, b: 128, a: 1 });
    });

    it('parses rgba()', () => {
      expect(parseColor('rgba(17, 17, 17, 0.8)')).toEqual({ r: 17, g: 17, b: 17, a: 0.8 });
    });

    it('throws on a clearly invalid input', () => {
      expect(() => parseColor('not-a-color')).toThrow();
      expect(() => parseColor('linear-gradient(135deg, #fff, #000)')).toThrow();
    });
  });
});

// ============================================================================
// Task 4.3 — Property 5: Contrast invariant on glass surfaces
// Validates: Requirements 6.1, 6.2, 6.3, 6.5, 6.6, 7.3, 10.6
// ============================================================================

const THEMES: readonly Theme[] = ['dark', 'light'];

/**
 * Measure the rounded Contrast_Ratio for a pairing in a theme, mirroring the
 * exact logic verifyContrast uses: composite the (translucent) surface over the
 * theme base when a baseToken is present, composite a translucent text color
 * over that effective surface, then round to two decimals.
 */
function measurePairing(pairing: ContrastPairing, theme: Theme): number {
  const resolved = resolveColorTokens(theme, tokenManifest);

  const surface = parseColor(resolved[pairing.surfaceToken]);

  let effective: RGB;
  if (pairing.baseToken !== undefined) {
    const base = parseColor(resolved[pairing.baseToken]);
    effective = effectiveSurface(surface, toRGB(base));
  } else {
    effective = toRGB(surface);
  }

  const text = parseColor(resolved[pairing.textToken]);
  const textColor = text.a < 1 ? alphaComposite(text, effective) : toRGB(text);

  return contrastRatio(textColor, effective);
}

describe('Property 5: Contrast invariant on glass surfaces (Task 4.3)', () => {
  it('verifyContrast reports zero failures across all pairings in both themes', () => {
    // Primary property: every enumerated pairing passes its WCAG threshold in
    // BOTH dark and light themes (the light --accent-contrast was corrected to
    // #1a1306 so the accent-on-gold pairing now clears 4.5:1).
    const failures = verifyContrast(contrastPairings, tokenManifest);
    expect(failures).toEqual([]);
  });

  it('every pairing × theme meets or exceeds its threshold (rounded to 2dp)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...contrastPairings),
        fc.constantFrom<Theme>(...THEMES),
        (pairing, theme) => {
          const ratio = measurePairing(pairing, theme);
          // Rounded to two decimals (Req 6.6) and ≥ the applicable threshold
          // (4.5:1 body/accent, 3:1 large text / focus indicators — Req 6.1/6.2/6.3/7.3).
          expect(round2(ratio)).toBe(ratio);
          expect(ratio).toBeGreaterThanOrEqual(pairing.threshold);
        },
      ),
      propertyConfig,
    );
  });

  it('any translucent-over-opaque composite is opaque with integer channels in [0,255]', () => {
    fc.assert(
      fc.property(
        fc.record({
          r: fc.integer({ min: 0, max: 255 }),
          g: fc.integer({ min: 0, max: 255 }),
          b: fc.integer({ min: 0, max: 255 }),
          a: fc.float({ min: 0, max: 1, noNaN: true }),
        }),
        fc.record({
          r: fc.integer({ min: 0, max: 255 }),
          g: fc.integer({ min: 0, max: 255 }),
          b: fc.integer({ min: 0, max: 255 }),
        }),
        (fg: RGBA, bg: RGB) => {
          const out = alphaComposite(fg, bg);
          for (const channel of [out.r, out.g, out.b]) {
            expect(Number.isInteger(channel)).toBe(true);
            expect(channel).toBeGreaterThanOrEqual(0);
            expect(channel).toBeLessThanOrEqual(255);
          }
        },
      ),
      { numRuns: 300 },
    );
  });
});
