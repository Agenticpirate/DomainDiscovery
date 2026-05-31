/**
 * Theme resolution algebra — pure helpers that resolve and manipulate the
 * active Theme against the token manifest.
 *
 * These helpers model the two-state Theme system (`dark` default / `light`)
 * described in the design's "Theme resolution model". They are intentionally
 * pure: they read ONLY from the token manifest and never touch the DOM,
 * `localStorage`, or React. That purity is what makes the theme algebra
 * property-testable (toggle round-trip and idempotence — tasks 2.2, 2.3) and
 * safely importable from any context.
 *
 * Note: at runtime the real Theme switch is performed by the existing
 * `ThemeContext`, which toggles the `light` class on the document root so the
 * CSS cascade re-resolves every `var(--token)`. These helpers are the pure
 * data-level model of that behavior — given a Theme they return the exact
 * name→value color map the cascade would resolve.
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — Architecture →
 *      "Theme resolution model"; Data Models
 * Requirements: 2.2, 2.3, 2.4, 2.5
 */

import { type ColorTokenDef, type TokenManifest, tokenManifest } from './tokens';

// ─────────────────────────────────────────────────────────────────────────
// Theme type
// ─────────────────────────────────────────────────────────────────────────

/**
 * The two visual modes. `dark` is the default; `light` is selected by the
 * presence of the `light` class on the document root element.
 */
export type Theme = 'dark' | 'light';

// ─────────────────────────────────────────────────────────────────────────
// Pure resolution
// ─────────────────────────────────────────────────────────────────────────

/**
 * Resolve every color token to its value for the given Theme.
 *
 * Reads each {@link ColorTokenDef}'s `dark` or `light` value from the manifest
 * and returns a fresh, plain `Record<string, string>` keyed by the token name.
 * A new object is allocated on every call so callers can safely deep-equality
 * compare results across toggles (Req 2.4) without aliasing concerns.
 *
 * Pure: depends only on its arguments, performs no DOM/React/storage access.
 *
 * @param theme    the Theme to resolve color tokens for
 * @param manifest the token manifest to read from (defaults to the shipped
 *                 {@link tokenManifest})
 * @returns a fresh name→value map of every color token in the given Theme
 */
export function resolveColorTokens(
  theme: Theme,
  manifest: TokenManifest = tokenManifest,
): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const token of manifest.colorTokens) {
    resolved[token.name] = pickThemeValue(token, theme);
  }
  return resolved;
}

/** Select a color token's value for the given Theme. */
function pickThemeValue(token: ColorTokenDef, theme: Theme): string {
  return theme === 'light' ? token.light : token.dark;
}

// ─────────────────────────────────────────────────────────────────────────
// Pure theme algebra
// ─────────────────────────────────────────────────────────────────────────

/**
 * Toggle to the opposite Theme: `dark` → `light`, `light` → `dark`.
 *
 * Pure and total. Applying this twice is the identity on the Theme value,
 * which underpins the toggle round-trip property (Req 2.4).
 *
 * @param theme the current Theme
 * @returns the opposite Theme
 */
export function toggleTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark';
}

/**
 * Set the Theme to an explicit target, modeling a set operation.
 *
 * Returns `target` regardless of `current`. The `current` argument is accepted
 * for API symmetry with the runtime controller and to support idempotence
 * testing (setting the same target repeatedly yields the same result — Req
 * 2.5). Pure and total.
 *
 * @param _current the current Theme (accepted for symmetry; does not affect the result)
 * @param target   the Theme to set
 * @returns the target Theme
 */
export function setTheme(_current: Theme, target: Theme): Theme {
  return target;
}
