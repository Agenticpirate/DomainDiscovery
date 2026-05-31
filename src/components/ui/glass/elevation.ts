/**
 * Shared elevation handling for the glass component library.
 *
 * Every glass component (Glass_Card, Glass_Nav, Glass_Button, Glass_Chip,
 * Glass_Stat, Glass_Modal) resolves its `elevation` prop through the single
 * total function {@link resolveElevation}, so elevation behavior is consistent
 * across the library and can never throw on unexpected input.
 *
 * This reuses the already-shipped `--elev-1/2/3/gold` tokens as the named
 * elevation scale (Req 1.8, 4.6) — the scale is *documented* here, not
 * duplicated. Styling is token-only: each tier maps to its `var(--elev-*)`
 * custom property so the CSS cascade resolves the correct per-theme shadow at
 * runtime.
 *
 * PURITY: pure module — no DOM, no React. Safe to import anywhere.
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — "Shared elevation handling"
 * Requirements: 4.6, 4.7, 4.8
 */

import type { Elevation } from '@/design-system/tokens';

/**
 * The named elevation tiers (`1 | 2 | 3 | 'gold'`), re-exported from the token
 * manifest so there is a single source of truth for the type.
 */
export type { Elevation };

/**
 * Maps each named elevation tier to its CSS custom property reference. Keyed by
 * `String(value)` so both numeric tiers (`1`, `2`, `3`) and the `'gold'` tier
 * resolve through one lookup.
 */
const ELEVATION_VARS: Record<string, string> = {
  '1': 'var(--elev-1)',
  '2': 'var(--elev-2)',
  '3': 'var(--elev-3)',
  gold: 'var(--elev-gold)',
};

/**
 * The default lowest-tier elevation (Req 4.7). Used when no elevation is
 * supplied and as the fallback for any unrecognized value (Req 4.8).
 */
export const LOWEST_ELEVATION = 'var(--elev-1)';

/**
 * Resolve an elevation prop to a `box-shadow` value. Total function: any input
 * yields a defined `var(--elev-*)` value and never throws.
 *
 * - `undefined` / `null` → {@link LOWEST_ELEVATION} (Req 4.7)
 * - a valid named tier (`1`, `2`, `3`, `'gold'`, matched via `String(value)`)
 *   → the corresponding `var(--elev-*)` (Req 4.6)
 * - any unrecognized / invalid value → {@link LOWEST_ELEVATION} (Req 4.8)
 *
 * @param value the elevation prop value (any input accepted)
 * @returns a `var(--elev-*)` box-shadow reference
 */
export function resolveElevation(value?: unknown): string {
  if (value === undefined || value === null) return LOWEST_ELEVATION; // Req 4.7
  let key: string;
  try {
    // `String(value)` can throw for exotic objects whose `toString`/`valueOf`
    // are non-callable (e.g. `{ toString: {} }`). Treat any non-coercible input
    // as unrecognized so the function stays total and never throws (Req 4.8).
    key = String(value);
  } catch {
    return LOWEST_ELEVATION; // Req 4.8 — non-coercible input falls back
  }
  // Own-property guard: a plain index lookup (`ELEVATION_VARS[key]`) would also
  // match inherited `Object.prototype` keys — e.g. `String(value)` of `'toString'`,
  // `'constructor'`, `'valueOf'`, `'hasOwnProperty'`, `'__proto__'` — and leak the
  // inherited method (a non-`var(--elev-*)` value) instead of falling back. Only
  // keys ELEVATION_VARS *owns* are valid tiers; everything else is unrecognized
  // and resolves to the lowest tier (Req 4.8). Valid tiers (1/2/3/'gold') are own
  // properties, so their mapping is unaffected (Req 4.6).
  return Object.prototype.hasOwnProperty.call(ELEVATION_VARS, key)
    ? ELEVATION_VARS[key] // Req 4.6 — valid named tier
    : LOWEST_ELEVATION; // Req 4.8 — unrecognized value falls back
}
