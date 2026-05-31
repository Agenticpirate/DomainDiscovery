/**
 * Non-regression class-presence tests for the premium-glass-design-system spec.
 * @module __tests__/design-system/non-regression.test
 *
 * Covers task 14.1:
 *   - Assert every existing `globals.css` component class selector remains
 *     defined after the additive design-system changes (Req 14.1, 14.4).
 *   - Sanity-check that the new additive token scales actually landed
 *     (Req 14.1 — additive, no-removal guarantee).
 *
 * Why source-based assertions: jsdom does not parse/compute styles from an
 * external stylesheet, so we verify the SOURCE OF TRUTH directly by reading
 * `src/app/globals.css` from disk and asserting each class selector token is
 * still defined in the file. A missing selector here is a real regression.
 *
 * @see .kiro/specs/premium-glass-design-system/requirements.md — Requirement 14
 */

import fs from 'fs';
import path from 'path';

// Resolve globals.css relative to the project root (jest cwd === repo root).
const GLOBALS_CSS_PATH = path.resolve(process.cwd(), 'src/app/globals.css');
const css = fs.readFileSync(GLOBALS_CSS_PATH, 'utf8');

/**
 * Every existing component class selector that MUST remain present in
 * globals.css so Existing_Consumers keep resolving to the same styling.
 * (Requirement 14.1)
 */
const REQUIRED_CLASS_SELECTORS = [
  '.glass-card',
  '.theme-card',
  '.premium-card',
  '.btn-accent',
  '.btn-primary',
  '.btn-secondary',
  '.accent-chip',
  '.text-gradient-gold',
  '.display-1',
  '.display-2',
  '.heading-1',
  '.heading-2',
  '.eyebrow',
] as const;

/**
 * New additive token scales that should have landed. Their presence is a
 * sanity check that the additive changes were applied without disturbing the
 * preserved classes above. (Requirement 14.1 — additive extension)
 */
const REQUIRED_NEW_TOKENS = [
  '--space-1',
  '--blur-sm',
  '--motion-duration-fast',
  '--text-size-hero',
] as const;

/** Escape a string for safe use inside a RegExp. */
function escapeForRegExp(value: string): RegExp {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match the class token as a CSS selector: the escaped `.foo` followed by a
  // boundary that is not an identifier char (so `.btn-primary` does not also
  // satisfy a hypothetical `.btn-primaryX`). Class names use [A-Za-z0-9_-].
  return new RegExp(`${escaped}(?![A-Za-z0-9_-])`);
}

describe('globals.css non-regression: existing class selectors preserved (Req 14.1, 14.4)', () => {
  it('reads a non-empty globals.css from the project root', () => {
    expect(css.length).toBeGreaterThan(0);
  });

  it.each(REQUIRED_CLASS_SELECTORS)(
    'still defines the existing class selector %s',
    (selector) => {
      // The class selector must appear as a selector token in the file.
      expect(css).toMatch(escapeForRegExp(selector));
      // Defensive: the literal token must be present at minimum.
      expect(css.includes(selector)).toBe(true);
    },
  );

  it('preserves the complete baseline set of class selectors (no silent removals)', () => {
    const missing = REQUIRED_CLASS_SELECTORS.filter(
      (selector) => !escapeForRegExp(selector).test(css),
    );
    expect(missing).toEqual([]);
  });
});

describe('globals.css non-regression: additive token scales landed (Req 14.1)', () => {
  it.each(REQUIRED_NEW_TOKENS)(
    'defines the new additive token %s',
    (token) => {
      expect(css.includes(token)).toBe(true);
    },
  );

  it('exposes all new additive token scales (no partial application)', () => {
    const missing = REQUIRED_NEW_TOKENS.filter((token) => !css.includes(token));
    expect(missing).toEqual([]);
  });
});
