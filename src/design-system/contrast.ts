/**
 * Contrast utility — pure WCAG 2.1 contrast math over the Token_Layer.
 *
 * This module verifies that text-on-surface Token pairings meet their
 * applicable WCAG contrast thresholds in BOTH Themes (Req 6). Glass surfaces
 * are translucent, so the "effective" surface a reader actually sees is the
 * translucent surface Token alpha-composited over the active Theme's opaque
 * base page background (Req 6.5). All ratios are rounded to two decimal places
 * before being compared to a threshold (Req 6.6).
 *
 * PURITY: This is a pure module. It has NO DOM access and NO React dependency.
 * It reads color values from the token manifest (via the pure
 * {@link resolveColorTokens} helper) and computes everything arithmetically, so
 * it is safely importable from the build context and the test suite.
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — Data Models →
 *      "Contrast model"; Correctness Properties → Property 5; Error Handling
 * Requirements: 6.4, 6.5, 6.6
 */

import { type ContrastPairing, type TokenManifest, tokenManifest } from './tokens';
import { type Theme, resolveColorTokens } from './theme';

// ─────────────────────────────────────────────────────────────────────────
// Color value types
// ─────────────────────────────────────────────────────────────────────────

/** An opaque RGB color. Channels are in the range 0–255. */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/** An RGB color with an alpha channel. `a` is in the range 0–1. */
export interface RGBA extends RGB {
  a: number;
}

/** A single contrast verification failure record (Req 6.4). */
export interface ContrastFailure {
  /** The id of the failing {@link ContrastPairing}. */
  pairingId: string;
  /** The Theme in which the failure was measured. */
  theme: Theme;
  /** The measured Contrast_Ratio, rounded to two decimals (Req 6.6). */
  measuredRatio: number;
}

// ─────────────────────────────────────────────────────────────────────────
// Small numeric helpers
// ─────────────────────────────────────────────────────────────────────────

/** Clamp `n` into the inclusive `[min, max]` range. */
function clamp(n: number, min: number, max: number): number {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

/**
 * Round a number to two decimal places (Req 6.6).
 *
 * Used on every Contrast_Ratio BEFORE it is compared to a threshold so the
 * comparison is performed on the rounded value, exactly as the requirement
 * specifies.
 */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// ─────────────────────────────────────────────────────────────────────────
// parseColor — #hex (3/6/8), rgb(), rgba()
// ─────────────────────────────────────────────────────────────────────────

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const RGB_FN_RE = /^rgba?\(([^)]*)\)$/i;

/** Parse a single rgb()/rgba() channel component (`"255"` or `"50%"`). */
function parseChannel(raw: string): number {
  const token = raw.trim();
  if (token.endsWith('%')) {
    const pct = Number.parseFloat(token.slice(0, -1));
    if (Number.isNaN(pct)) return Number.NaN;
    return clamp((pct / 100) * 255, 0, 255);
  }
  const value = Number.parseFloat(token);
  if (Number.isNaN(value)) return Number.NaN;
  return clamp(value, 0, 255);
}

/** Parse an alpha component (`"0.7"` or `"70%"`) into a 0–1 value. */
function parseAlpha(raw: string): number {
  const token = raw.trim();
  if (token.endsWith('%')) {
    const pct = Number.parseFloat(token.slice(0, -1));
    if (Number.isNaN(pct)) return Number.NaN;
    return clamp(pct / 100, 0, 1);
  }
  const value = Number.parseFloat(token);
  if (Number.isNaN(value)) return Number.NaN;
  return clamp(value, 0, 1);
}

/**
 * Parse a CSS color string into {@link RGBA}.
 *
 * Supports the solid color formats that contrast pairings reference:
 *   - `#RGB`     (3-digit hex, expanded; alpha = 1)
 *   - `#RRGGBB`  (6-digit hex; alpha = 1)
 *   - `#RRGGBBAA`(8-digit hex; alpha = AA / 255)
 *   - `rgb(r, g, b)` / `rgba(r, g, b, a)` (comma- or space/slash-separated;
 *      channels accept `%`; alpha accepts `%`)
 *
 * @param input the color string to parse
 * @returns the parsed {@link RGBA} (channels 0–255, alpha 0–1)
 * @throws {Error} with a clear message when `input` cannot be parsed (e.g. a
 *   `linear-gradient(...)`, a named color, or malformed text). Callers that
 *   prefer to report rather than crash (see {@link verifyContrast}) catch this.
 */
export function parseColor(input: string): RGBA {
  if (typeof input !== 'string') {
    throw new Error(`parseColor: expected a string, received ${typeof input}`);
  }
  const value = input.trim();

  // ── Hex ──
  const hexMatch = HEX_RE.exec(value);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      const r = Number.parseInt(hex[0] + hex[0], 16);
      const g = Number.parseInt(hex[1] + hex[1], 16);
      const b = Number.parseInt(hex[2] + hex[2], 16);
      return { r, g, b, a: 1 };
    }
    if (hex.length === 6) {
      const r = Number.parseInt(hex.slice(0, 2), 16);
      const g = Number.parseInt(hex.slice(2, 4), 16);
      const b = Number.parseInt(hex.slice(4, 6), 16);
      return { r, g, b, a: 1 };
    }
    // length === 8 → #RRGGBBAA
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    const a = Number.parseInt(hex.slice(6, 8), 16) / 255;
    return { r, g, b, a };
  }

  // ── rgb() / rgba() ──
  const fnMatch = RGB_FN_RE.exec(value);
  if (fnMatch) {
    // Split on commas and slashes (modern syntax) and whitespace.
    const parts = fnMatch[1]
      .split(/[,/\s]+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (parts.length === 3 || parts.length === 4) {
      const r = parseChannel(parts[0]);
      const g = parseChannel(parts[1]);
      const b = parseChannel(parts[2]);
      const a = parts.length === 4 ? parseAlpha(parts[3]) : 1;
      if (![r, g, b, a].some(Number.isNaN)) {
        return { r, g, b, a };
      }
    }
  }

  throw new Error(`parseColor: unable to parse color "${input}"`);
}

// ─────────────────────────────────────────────────────────────────────────
// alphaComposite — source-over over an opaque base (Req 6.5)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Composite a translucent foreground over an OPAQUE base using the standard
 * source-over operator (Req 6.5).
 *
 * Because the base is opaque, the result is opaque: each output channel is the
 * alpha-weighted blend `fg * a + bg * (1 - a)`, rounded to an 8-bit integer and
 * clamped to `[0, 255]`. Boundary behavior:
 *   - `a === 1` → returns `fg` as RGB (foreground fully covers the base).
 *   - `a === 0` → returns `bg` unchanged (foreground fully transparent).
 *
 * @param fg the translucent foreground color
 * @param bg the opaque base color
 * @returns the opaque composited {@link RGB}, channels in `[0, 255]`
 */
export function alphaComposite(fg: RGBA, bg: RGB): RGB {
  const a = clamp(fg.a, 0, 1);
  const blend = (f: number, b: number): number => {
    const fc = clamp(f, 0, 255);
    const bc = clamp(b, 0, 255);
    return clamp(Math.round(fc * a + bc * (1 - a)), 0, 255);
  };
  return {
    r: blend(fg.r, bg.r),
    g: blend(fg.g, bg.g),
    b: blend(fg.b, bg.b),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// WCAG relative luminance + contrast ratio
// ─────────────────────────────────────────────────────────────────────────

/** Convert a single 0–255 sRGB channel to its linear-light value. */
function linearizeChannel(channel: number): number {
  const cs = clamp(channel, 0, 255) / 255;
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

/**
 * WCAG 2.1 relative luminance of an opaque RGB color.
 *
 * `L = 0.2126·R + 0.7152·G + 0.0722·B`, where each channel is first linearized
 * from sRGB. The result is in `[0, 1]` (0 = black, 1 = white).
 *
 * @param c the opaque color
 * @returns the relative luminance in `[0, 1]`
 */
export function relativeLuminance(c: RGB): number {
  const r = linearizeChannel(c.r);
  const g = linearizeChannel(c.g);
  const b = linearizeChannel(c.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * WCAG contrast ratio between two opaque colors, rounded to two decimals.
 *
 * `ratio = (L_lighter + 0.05) / (L_darker + 0.05)`, where the lighter/darker
 * roles are assigned by relative luminance so the result is always ≥ 1. The
 * value is rounded to two decimal places (Req 6.6) so callers compare the
 * rounded ratio against the threshold. Black vs white yields exactly `21`.
 *
 * @param fg one color (foreground)
 * @param bg the other color (background)
 * @returns the contrast ratio rounded to two decimals (range `[1, 21]`)
 */
export function contrastRatio(fg: RGB, bg: RGB): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return round2(ratio);
}

// ─────────────────────────────────────────────────────────────────────────
// effectiveSurface — opaque glass background a reader actually sees (Req 6.5)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Compute the effective (opaque) glass surface background: the translucent
 * surface Token alpha-composited over the opaque base page background (Req 6.5).
 *
 * This is the background against which text contrast must be measured for any
 * Glass_Surface.
 *
 * @param surfaceToken the translucent surface color (e.g. `--glass-bg`)
 * @param baseToken    the opaque page background the surface sits on (e.g. `--bg-main`)
 * @returns the opaque effective surface {@link RGB}
 */
export function effectiveSurface(surfaceToken: RGBA, baseToken: RGB): RGB {
  return alphaComposite(surfaceToken, baseToken);
}

// ─────────────────────────────────────────────────────────────────────────
// verifyContrast — check every pairing in both themes (Req 6.4)
// ─────────────────────────────────────────────────────────────────────────

/** Strip the alpha channel from an {@link RGBA}, yielding an opaque {@link RGB}. */
function toRGB(c: RGBA): RGB {
  return { r: c.r, g: c.g, b: c.b };
}

/** The two Themes every pairing is verified in. */
const THEMES: readonly Theme[] = ['dark', 'light'];

/**
 * Verify every text-on-surface pairing against its WCAG threshold in BOTH
 * Themes, returning a failure record for each pairing/theme below threshold
 * (Req 6.4).
 *
 * For each pairing and each Theme:
 *   1. Resolve the text, surface, and (optional) base Token values for the
 *      Theme from the manifest's color tokens.
 *   2. Compute the effective surface: when a `baseToken` is present, composite
 *      the translucent surface over the base (Req 6.5); otherwise the surface
 *      is expected to be opaque and is used as-is.
 *   3. Resolve the text color over that effective surface — when the text Token
 *      is itself translucent (e.g. an `rgba(...)` text color), composite it
 *      over the effective surface before measuring.
 *   4. Compute the contrast ratio (rounded to two decimals, Req 6.6) and
 *      compare it to the pairing's threshold.
 *
 * Defensive parsing (Error Handling): contrast pairings only reference solid
 * color Tokens, but if any resolved value cannot be parsed (e.g. it resolves to
 * a gradient or is missing), the pairing is REPORTED as a failure with
 * `measuredRatio: 0` rather than throwing — surfacing the problem the same way
 * a below-threshold result is surfaced, so the verification never crashes.
 *
 * @param pairings the text-on-surface pairings to verify
 * @param manifest the token manifest providing per-theme color values
 * @returns an array of {@link ContrastFailure} records (empty when all pass)
 */
export function verifyContrast(
  pairings: readonly ContrastPairing[],
  manifest: TokenManifest = tokenManifest,
): ContrastFailure[] {
  const failures: ContrastFailure[] = [];

  for (const theme of THEMES) {
    const resolved = resolveColorTokens(theme, manifest);

    for (const pairing of pairings) {
      const measuredRatio = measurePairing(pairing, resolved);
      if (measuredRatio < pairing.threshold) {
        failures.push({ pairingId: pairing.id, theme, measuredRatio });
      }
    }
  }

  return failures;
}

/**
 * Measure the (rounded) contrast ratio for a single pairing using already
 * theme-resolved token values. Returns `0` when any referenced value is missing
 * or unparseable, so the caller treats it as a failure (never throws).
 */
function measurePairing(
  pairing: ContrastPairing,
  resolved: Record<string, string>,
): number {
  try {
    const textRaw = resolved[pairing.textToken];
    const surfaceRaw = resolved[pairing.surfaceToken];
    if (textRaw === undefined || surfaceRaw === undefined) return 0;

    const surface = parseColor(surfaceRaw);

    // Effective (opaque) surface the text sits on.
    let effective: RGB;
    if (pairing.baseToken !== undefined) {
      const baseRaw = resolved[pairing.baseToken];
      if (baseRaw === undefined) return 0;
      const base = parseColor(baseRaw);
      effective = effectiveSurface(surface, toRGB(base));
    } else {
      // No base token → the surface is expected to be opaque; use it directly.
      effective = toRGB(surface);
    }

    // Resolve the text color over the effective surface. A translucent text
    // Token must be composited over the effective surface before measuring.
    const text = parseColor(textRaw);
    const textColor = text.a < 1 ? alphaComposite(text, effective) : toRGB(text);

    return contrastRatio(textColor, effective);
  } catch {
    // Unparseable value (e.g. gradient / named color): report as a failure.
    return 0;
  }
}
