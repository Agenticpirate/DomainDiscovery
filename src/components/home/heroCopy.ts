/**
 * Hero copy constants, reachability gate, and fluid sizing model.
 *
 * Pure module — no DOM, no React. Consumed by the Hero component (task 11.1)
 * and by property tests (10.2 copy bounds, 10.3 fluid sizing).
 *
 * Requirements: 10.2, 12.3, 12.4, 13.4
 */

// ---------------------------------------------------------------------------
// Hero copy (Req 10.2)
// ---------------------------------------------------------------------------

/** Headline length bounds (inclusive), per Req 10.2. */
export const HEADLINE_MIN_LENGTH = 1;
export const HEADLINE_MAX_LENGTH = 80;

/** Subhead length bounds (inclusive), per Req 10.2. */
export const SUBHEAD_MIN_LENGTH = 1;
export const SUBHEAD_MAX_LENGTH = 160;

/** The exact headline phrase Req 10.2 forbids. */
export const FORBIDDEN_HEADLINE = 'Find Your Perfect Domain in Seconds';

/**
 * Refined hero headline (design's primary proposal).
 * 34 chars — within [1, 80] and not equal to the forbidden phrase.
 */
export const HERO_HEADLINE = 'Claim the name your idea deserves.';

/**
 * Refined hero subhead (design's proposal).
 * Length verified ≤ 160 (see VERIFY note in task 10.1).
 */
export const HERO_SUBHEAD =
  'Search 1,600+ extensions in real time, compare registrar prices side by side, and register in one click. Free, unlimited, and built for speed.';

/**
 * Validate a headline/subhead pair against Req 10.2.
 *
 * True iff:
 *  - headline length ∈ [1, 80], AND
 *  - headline !== "Find Your Perfect Domain in Seconds", AND
 *  - subhead length ∈ [1, 160].
 */
export function isValidHeroCopy(headline: string, subhead: string): boolean {
  const headlineOk =
    headline.length >= HEADLINE_MIN_LENGTH &&
    headline.length <= HEADLINE_MAX_LENGTH &&
    headline !== FORBIDDEN_HEADLINE;

  const subheadOk =
    subhead.length >= SUBHEAD_MIN_LENGTH && subhead.length <= SUBHEAD_MAX_LENGTH;

  return headlineOk && subheadOk;
}

// ---------------------------------------------------------------------------
// Beginner entry reachability gate (Req 12.3, 12.4)
// ---------------------------------------------------------------------------

/**
 * Known-route allowlist matching the real app's sitemap set. `isReachable`
 * checks a destination against this constant so the Beginner_Entry only
 * navigates to routes that actually exist.
 */
export const KNOWN_ROUTES: readonly string[] = [
  '/',
  '/generator',
  '/bulk-search',
  '/domain-extensions',
  '/tools/compare',
  '/tools/geo',
  '/search',
  '/saved-domains',
  '/premium',
  '/expired',
  '/learn',
  '/blog',
  '/faq',
  '/contact',
  '/privacy',
  '/terms',
];

/**
 * Beginner_Entry destination (Open Questions resolution: BEGINNER_ENTRY_DESTINATION).
 * Default is the shipped AI generator — the closest "help me start" experience —
 * and is the single swap point when the dedicated Domain Finder ships.
 */
export const BEGINNER_ENTRY_DESTINATION = '/generator';

/**
 * True iff `dest` is in the known-route allowlist (Req 12.4). The Hero runs
 * this before `router.push`; on false it surfaces an error toast and preserves
 * Hero state without navigating.
 */
export function isReachable(dest: string): boolean {
  return KNOWN_ROUTES.includes(dest);
}

// ---------------------------------------------------------------------------
// Headline fluid sizing model (Req 13.4)
// ---------------------------------------------------------------------------

/** Mobile breakpoint (px) — headline pinned to the minimum at or below this. */
export const HERO_MIN_VIEWPORT = 767;
/** Desktop breakpoint (px) — headline pinned to the maximum at or above this. */
export const HERO_MAX_VIEWPORT = 1024;

/** Minimum headline size (rem), held at ≤ 767px. */
export const HERO_MIN_REM = 2.5;
/** Maximum headline size (rem), held at ≥ 1024px. */
export const HERO_MAX_REM = 5.25;

/**
 * Model of the `--text-size-hero` clamp:
 *   clamp(2.5, 2.5 + (5.25 - 2.5) * (vw - 767) / 257, 5.25)
 *
 * Returns the headline size in rem for a given viewport width:
 *  - 2.5 at width ≤ 767px (minimum),
 *  - 5.25 at width ≥ 1024px (maximum),
 *  - linearly interpolated and monotonic non-decreasing in between.
 */
export function headlineSizeAt(viewportWidth: number): number {
  const span = HERO_MAX_VIEWPORT - HERO_MIN_VIEWPORT; // 257
  const interpolated =
    HERO_MIN_REM +
    ((HERO_MAX_REM - HERO_MIN_REM) * (viewportWidth - HERO_MIN_VIEWPORT)) / span;

  // clamp(min, interpolated, max)
  return Math.min(HERO_MAX_REM, Math.max(HERO_MIN_REM, interpolated));
}
