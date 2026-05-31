/**
 * Token manifest module — the single typed, iterable description of the
 * DomainDiscovery design Token_Layer.
 *
 * This module is the data model that three consumers read from:
 *   1. `tailwind.config.ts` — maps tokens into the Tailwind theme by
 *      referencing the CSS custom properties (never literal values).
 *   2. The glass component library — styles surfaces exclusively from tokens.
 *   3. Property-based + non-regression tests — verify theme parity, Tailwind
 *      mapping equivalence, contrast, and value preservation against the same
 *      manifest.
 *
 * SOURCE OF TRUTH: `src/app/globals.css`. Every value below mirrors the CSS
 * custom property values defined on `:root` (dark Theme) and `html.light`
 * (light Theme) EXACTLY. This module re-declares token names + values as
 * TypeScript constants so tooling can iterate them.
 *
 * PURITY: This is a pure data + pure function module. It has NO DOM access and
 * NO React dependency, so it is safely importable by `tailwind.config.ts`
 * (which runs in a Node/build context) and by the test suite. Keep it
 * side-effect free.
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — "Data Models"
 * Requirements: 1.6, 2.1, 2.6, 3.1, 3.6, 14.2
 */

// ─────────────────────────────────────────────────────────────────────────
// Interfaces & types
// ─────────────────────────────────────────────────────────────────────────

/** A color token defined for both themes. */
export interface ColorTokenDef {
  /** CSS custom property name, e.g. `--accent`. */
  name: `--${string}`;
  /** Value resolved on `:root` (dark Theme). */
  dark: string;
  /** Value resolved on `html.light` (light Theme). */
  light: string;
}

/** A theme-independent token (spacing, blur, motion, typography). */
export interface ScalarTokenDef {
  /** CSS custom property name, e.g. `--space-4`. */
  name: `--${string}`;
  /** The single value (theme-independent). */
  value: string;
}

/**
 * A text-on-surface pairing used by contrast verification (Req 6).
 *
 * When the surface is translucent (e.g. `--glass-bg`), `baseToken` names the
 * opaque page background the surface composites over, so the effective surface
 * background can be computed by alpha-compositing (Req 6.5).
 */
export interface ContrastPairing {
  /** Stable identifier reported on a contrast failure (Req 6.4). */
  id: string;
  /** Foreground text color token, e.g. `--text-primary`. */
  textToken: `--${string}`;
  /** Surface background token the text sits on, e.g. `--glass-bg`. */
  surfaceToken: `--${string}`;
  /** Opaque page background the (translucent) surface composites over (Req 6.5). */
  baseToken?: `--${string}`;
  /** Applicable WCAG threshold: 4.5:1 for body/accent text, 3:1 for large text. */
  threshold: 4.5 | 3;
  /** True when the pairing covers large text (≥18.66px bold / ≥24px regular). */
  largeText?: boolean;
}

/**
 * Tailwind exposure map: utility category → { tailwindKey → cssVarName }.
 *
 * Every value MUST be a `var(--token)` reference whose token name exists in
 * the manifest. This is what `tailwind.config.ts` (task 3.1) and the mapping
 * equivalence property test (task 3.2) consume.
 */
export interface TailwindTokenMap {
  colors: Record<string, `var(--${string})`>;
  spacing: Record<string, `var(--${string})`>;
  blur: Record<string, `var(--${string})`>;
  boxShadow: Record<string, `var(--${string})`>;
}

/** Named elevation tiers used by every glass component's `elevation` prop. */
export type Elevation = 1 | 2 | 3 | 'gold';

// ─────────────────────────────────────────────────────────────────────────
// Color tokens — every color token on :root (dark) and html.light (light)
// Values mirror src/app/globals.css EXACTLY.
// ─────────────────────────────────────────────────────────────────────────

/**
 * Every color (and theme-dependent gradient) token, with both theme values.
 * The dark-Theme name set is identical to the light-Theme name set by
 * construction (each entry carries both), satisfying the theme parity
 * property (Req 2.1).
 */
export const colorTokens: readonly ColorTokenDef[] = [
  // ── Surfaces & base backgrounds ──
  { name: '--bg-main', dark: '#0a0a0a', light: '#f5f7fa' },
  { name: '--bg-card', dark: '#111111', light: '#ffffff' },
  { name: '--bg-elevated', dark: '#1a1a1a', light: '#ffffff' },

  // ── Neutral accents (legacy non-gold) ──
  { name: '--accent-primary', dark: '#FFFFFF', light: '#000000' },
  { name: '--accent-dim', dark: '#888888', light: '#555555' },

  // ── Borders ──
  { name: '--border-color', dark: 'rgba(255, 255, 255, 0.08)', light: 'rgba(0, 0, 0, 0.1)' },

  // ── Text tiers ──
  { name: '--text-primary', dark: '#FFFFFF', light: '#0f172a' },
  { name: '--text-secondary', dark: 'rgba(255, 255, 255, 0.7)', light: '#334155' },
  { name: '--text-tertiary', dark: 'rgba(255, 255, 255, 0.5)', light: '#64748b' },
  { name: '--text-muted', dark: 'rgba(255, 255, 255, 0.4)', light: '#94a3b8' },

  // ── Glass / card surfaces ──
  { name: '--glass-bg', dark: 'rgba(17, 17, 17, 0.8)', light: 'rgba(255, 255, 255, 0.9)' },
  { name: '--card-bg', dark: 'rgba(255, 255, 255, 0.02)', light: '#ffffff' },
  { name: '--card-bg-hover', dark: 'rgba(255, 255, 255, 0.04)', light: '#f8fafc' },
  { name: '--card-border', dark: 'rgba(255, 255, 255, 0.1)', light: '#e2e8f0' },
  { name: '--card-border-hover', dark: 'rgba(255, 255, 255, 0.2)', light: '#cbd5e1' },

  // ── Icon surfaces ──
  { name: '--icon-bg', dark: 'rgba(255, 255, 255, 0.05)', light: '#f1f5f9' },
  { name: '--icon-bg-hover', dark: 'rgba(255, 255, 255, 0.1)', light: '#e2e8f0' },
  { name: '--icon-color', dark: 'rgba(255, 255, 255, 0.7)', light: '#475569' },

  // ── Inputs ──
  { name: '--input-bg', dark: 'rgba(255, 255, 255, 0.05)', light: '#ffffff' },
  { name: '--input-border', dark: 'rgba(255, 255, 255, 0.1)', light: '#d1d5db' },
  { name: '--input-border-focus', dark: 'rgba(255, 255, 255, 0.2)', light: '#94a3b8' },
  { name: '--input-ring', dark: 'rgba(255, 255, 255, 0.1)', light: 'rgba(100, 116, 139, 0.15)' },
  { name: '--input-placeholder', dark: 'rgba(255, 255, 255, 0.3)', light: '#9ca3af' },

  // ── Nav ──
  { name: '--nav-bg', dark: 'rgba(0, 0, 0, 0.4)', light: 'rgba(255, 255, 255, 0.92)' },
  {
    name: '--nav-item-active-bg',
    dark: 'linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0.08))',
    light: 'linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0.04))',
  },
  { name: '--nav-item-border', dark: 'rgba(255, 255, 255, 0.08)', light: '#e2e8f0' },
  { name: '--nav-item-text', dark: 'rgba(255, 255, 255, 0.7)', light: '#475569' },

  // ── Dropdown ──
  { name: '--dropdown-bg', dark: '#000000', light: '#ffffff' },
  { name: '--dropdown-border', dark: 'rgba(255, 255, 255, 0.15)', light: '#e2e8f0' },

  // ── Footer ──
  { name: '--footer-bg', dark: 'rgba(0, 0, 0, 0.4)', light: '#f8fafc' },

  // ── Buttons (existing token classes) ──
  { name: '--btn-primary-bg', dark: '#FFFFFF', light: '#0f172a' },
  { name: '--btn-primary-text', dark: '#000000', light: '#FFFFFF' },
  { name: '--btn-primary-hover', dark: '#f0f0f0', light: '#1e293b' },
  { name: '--btn-secondary-bg', dark: 'rgba(255, 255, 255, 0.05)', light: '#f1f5f9' },
  { name: '--btn-secondary-text', dark: '#FFFFFF', light: '#0f172a' },
  { name: '--btn-secondary-border', dark: 'rgba(255, 255, 255, 0.1)', light: '#e2e8f0' },
  { name: '--btn-secondary-hover-bg', dark: 'rgba(255, 255, 255, 0.1)', light: '#e2e8f0' },

  // ── Gradients (hero/subtitle) ──
  { name: '--gradient-hero-from', dark: 'rgba(255, 255, 255, 1)', light: 'rgba(0, 0, 0, 1)' },
  { name: '--gradient-hero-to', dark: 'rgba(255, 255, 255, 0.6)', light: 'rgba(0, 0, 0, 0.55)' },
  { name: '--gradient-subtitle', dark: 'rgba(255, 255, 255, 0.5)', light: '#475569' },

  // ── Shadow color ──
  { name: '--shadow-color', dark: 'rgba(0, 0, 0, 0.2)', light: 'rgba(0, 0, 0, 0.06)' },

  // ── CTA backgrounds ──
  { name: '--cta-bg-from', dark: 'rgba(255, 255, 255, 0.08)', light: '#f1f5f9' },
  { name: '--cta-bg-to', dark: 'rgba(255, 255, 255, 0.02)', light: '#f8fafc' },

  // ── Keyboard hint (kbd) ──
  { name: '--kbd-bg', dark: 'rgba(255, 255, 255, 0.05)', light: '#f1f5f9' },
  { name: '--kbd-border', dark: 'rgba(255, 255, 255, 0.1)', light: '#d1d5db' },
  { name: '--kbd-text', dark: 'rgba(255, 255, 255, 0.3)', light: '#6b7280' },

  // ── Recent items ──
  { name: '--recent-bg', dark: '#171717', light: '#ffffff' },

  // ── Badge ──
  { name: '--badge-bg', dark: 'rgba(16, 185, 129, 0.1)', light: 'rgba(16, 185, 129, 0.1)' },
  { name: '--badge-text', dark: '#34d399', light: '#059669' },
  { name: '--badge-border', dark: 'rgba(16, 185, 129, 0.2)', light: 'rgba(16, 185, 129, 0.2)' },

  // ── Stats / section divider (dark counterparts supplied for theme parity, Req 2.6) ──
  { name: '--stats-bg', dark: '#111111', light: '#ffffff' },
  { name: '--section-divider', dark: 'rgba(255, 255, 255, 0.08)', light: '#e2e8f0' },

  // ── Signature gold accent system (authoritative palette — Req 1.7, 7) ──
  { name: '--accent', dark: '#E9B44C', light: '#B8860B' },
  { name: '--accent-bright', dark: '#F6C967', light: '#C9971C' },
  { name: '--accent-deep', dark: '#C28B2B', light: '#936A08' },
  // Intentional WCAG contrast correction (Req 6.4): light-theme accent-contrast
  // was '#ffffff' (white-on-gold ≈ 3.25:1, below 4.5:1). Corrected to '#1a1306'
  // (dark brown, ≈ 5.66:1 on the light-theme gold '--accent' = #B8860B), matching
  // the dark theme. This corrected value is the new non-regression baseline
  // (Req 14.2/14.6) since BASELINE_TOKENS derives it from this entry via flatMap.
  { name: '--accent-contrast', dark: '#1a1306', light: '#1a1306' },
  { name: '--accent-text', dark: '#F2C25C', light: '#9A6F12' },
  { name: '--accent-tint', dark: 'rgba(233, 180, 76, 0.12)', light: 'rgba(184, 134, 11, 0.1)' },
  {
    name: '--accent-tint-strong',
    dark: 'rgba(233, 180, 76, 0.2)',
    light: 'rgba(184, 134, 11, 0.16)',
  },
  { name: '--accent-border', dark: 'rgba(233, 180, 76, 0.34)', light: 'rgba(184, 134, 11, 0.3)' },
  { name: '--accent-glow', dark: 'rgba(233, 180, 76, 0.28)', light: 'rgba(184, 134, 11, 0.2)' },
  {
    name: '--gradient-gold',
    dark: 'linear-gradient(135deg, #F6C967 0%, #E9B44C 46%, #C28B2B 100%)',
    light: 'linear-gradient(135deg, #C9971C 0%, #B8860B 50%, #936A08 100%)',
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────
// Scalar scales — theme-independent (single value on :root). Req 1.6.
// Values mirror src/app/globals.css EXACTLY.
// ─────────────────────────────────────────────────────────────────────────

/** Spacing scale (rem) — Req 1.3 (≥6 steps, same unit). */
export const spacingTokens: readonly ScalarTokenDef[] = [
  { name: '--space-1', value: '0.25rem' },
  { name: '--space-2', value: '0.5rem' },
  { name: '--space-3', value: '0.75rem' },
  { name: '--space-4', value: '1rem' },
  { name: '--space-5', value: '1.5rem' },
  { name: '--space-6', value: '2rem' },
  { name: '--space-7', value: '3rem' },
  { name: '--space-8', value: '4rem' },
] as const;

/** Blur scale (Glass_Surface backdrop radii) — Req 1.4 (≥3 steps). */
export const blurTokens: readonly ScalarTokenDef[] = [
  { name: '--blur-sm', value: '8px' },
  { name: '--blur-md', value: '16px' },
  { name: '--blur-lg', value: '24px' },
  { name: '--blur-xl', value: '32px' },
] as const;

/** Motion primitives — Req 1.5 (≥3 durations + ≥2 easing curves). */
export const motionTokens: readonly ScalarTokenDef[] = [
  { name: '--motion-duration-fast', value: '150ms' },
  { name: '--motion-duration-base', value: '300ms' },
  { name: '--motion-duration-slow', value: '700ms' },
  { name: '--motion-ease-standard', value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  { name: '--motion-ease-entrance', value: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  { name: '--motion-ease-float', value: 'ease-in-out' },
] as const;

/**
 * Elevation scale — Req 1.8 (≥3 steps), reused from the shipped `--elev-*`
 * tiers (documented, not duplicated).
 *
 * NOTE: the `--elev-*` box-shadows are theme-dependent in `globals.css` (the
 * light theme softens each shadow). The design models `elevationTokens` as a
 * `ScalarTokenDef[]`, so we record the canonical DARK-theme value here and keep
 * the scale simple. Both theme values are still captured for non-regression in
 * {@link BASELINE_TOKENS} and consumed via `var(--elev-*)` so the CSS cascade
 * resolves the correct per-theme shadow at runtime regardless of the canonical
 * value recorded here.
 */
export const elevationTokens: readonly ScalarTokenDef[] = [
  { name: '--elev-1', value: '0 1px 2px rgba(0,0,0,0.3)' },
  { name: '--elev-2', value: '0 4px 16px -2px rgba(0,0,0,0.45)' },
  { name: '--elev-3', value: '0 12px 40px -8px rgba(0,0,0,0.6)' },
  { name: '--elev-gold', value: '0 8px 30px -6px rgba(233, 180, 76, 0.28)' },
] as const;

/** Typography scale — Req 1.9 (≥5 type-size steps). */
export const typographyTokens: readonly ScalarTokenDef[] = [
  { name: '--text-size-xs', value: '0.75rem' },
  { name: '--text-size-sm', value: '0.875rem' },
  { name: '--text-size-base', value: '1rem' },
  { name: '--text-size-lg', value: '1.125rem' },
  { name: '--text-size-xl', value: '1.5rem' },
  { name: '--text-size-2xl', value: '2rem' },
  {
    name: '--text-size-hero',
    value: 'clamp(2.5rem, calc(2.5rem + (5.25 - 2.5) * (100vw - 767px) / 257), 5.25rem)',
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────
// Contrast pairings — text-on-surface pairings the contrast tests check (Req 6)
// ─────────────────────────────────────────────────────────────────────────

/**
 * The enumerated text-on-surface pairings verified by the contrast utility
 * (task 4.x, Property 5). Glass surfaces are translucent, so each glass
 * pairing carries a `baseToken` (the opaque page background it composites over)
 * per Req 6.5.
 *
 * - Body text on glass surface → 4.5:1 (Req 6.1)
 * - Large text on glass surface → 3:1 (Req 6.2)
 * - Accent-contrast text on the gold accent background → 4.5:1 (Req 6.3)
 */
export const contrastPairings: readonly ContrastPairing[] = [
  {
    id: 'body-primary-on-glass',
    textToken: '--text-primary',
    surfaceToken: '--glass-bg',
    baseToken: '--bg-main',
    threshold: 4.5,
  },
  {
    id: 'body-secondary-on-glass',
    textToken: '--text-secondary',
    surfaceToken: '--glass-bg',
    baseToken: '--bg-main',
    threshold: 4.5,
  },
  {
    id: 'large-primary-on-glass',
    textToken: '--text-primary',
    surfaceToken: '--glass-bg',
    baseToken: '--bg-main',
    threshold: 3,
    largeText: true,
  },
  {
    id: 'accent-contrast-on-gold',
    textToken: '--accent-contrast',
    surfaceToken: '--accent',
    threshold: 4.5,
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────
// Tailwind exposure map — every value is a var(--token) reference whose name
// exists in the manifest above (consumed by tailwind.config.ts + task 3.2).
// ─────────────────────────────────────────────────────────────────────────

/**
 * Maps design tokens into Tailwind theme categories by referencing the CSS
 * custom property (never duplicating a literal value — Req 3.4). The `border`
 * color mapping mirrors the existing `tailwind.config.ts` entry to preserve it
 * (Req 3.3). Every `var(--x)` reference here resolves to a token defined in the
 * manifest, which `validateTailwindMapping` enforces (Req 3.6).
 */
export const tailwindTokenMap: TailwindTokenMap = {
  colors: {
    border: 'var(--border-color)',
    accent: 'var(--accent)',
    'accent-bright': 'var(--accent-bright)',
    'accent-deep': 'var(--accent-deep)',
    'accent-contrast': 'var(--accent-contrast)',
    'accent-text': 'var(--accent-text)',
    'bg-main': 'var(--bg-main)',
    'bg-card': 'var(--bg-card)',
    'bg-elevated': 'var(--bg-elevated)',
    glass: 'var(--glass-bg)',
    'card-border': 'var(--card-border)',
    'text-primary': 'var(--text-primary)',
    'text-secondary': 'var(--text-secondary)',
    'text-tertiary': 'var(--text-tertiary)',
    'text-muted': 'var(--text-muted)',
  },
  spacing: {
    '1': 'var(--space-1)',
    '2': 'var(--space-2)',
    '3': 'var(--space-3)',
    '4': 'var(--space-4)',
    '5': 'var(--space-5)',
    '6': 'var(--space-6)',
    '7': 'var(--space-7)',
    '8': 'var(--space-8)',
  },
  blur: {
    sm: 'var(--blur-sm)',
    md: 'var(--blur-md)',
    lg: 'var(--blur-lg)',
    xl: 'var(--blur-xl)',
  },
  boxShadow: {
    elev1: 'var(--elev-1)',
    elev2: 'var(--elev-2)',
    elev3: 'var(--elev-3)',
    'elev-gold': 'var(--elev-gold)',
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Motion classes — every Motion_Primitive-driven animation class (Req 9, 14.5)
// ─────────────────────────────────────────────────────────────────────────

/**
 * The full set of animation utility class names that must resolve to a static
 * resting state under `prefers-reduced-motion: reduce` (Property 7 / Req 9.x,
 * 14.5). Includes the new motion utility / Hero ambient class plus every
 * existing animation class already shipped in `globals.css`.
 */
export const motionClasses: readonly string[] = [
  // New design-system motion utilities + Hero ambient motion
  'animate-ambient',
  'animate-mandala',
  'animate-mandala-reverse',
  'animate-mandala-pulse',
  // Existing animation classes (must remain reduced-motion-safe — Req 14.5)
  'animate-rise',
  'animate-rise-sm',
  'animate-scale-in',
  'animate-fade-in',
  'animate-slide-up',
  'animate-float-soft',
  'animate-shimmer',
] as const;

// ─────────────────────────────────────────────────────────────────────────
// Baseline snapshot — frozen (token, theme) resolved values for non-regression
// ─────────────────────────────────────────────────────────────────────────

/** A single frozen baseline entry: a token's resolved value in one theme. */
export interface BaselineTokenEntry {
  name: `--${string}`;
  theme: 'dark' | 'light';
  value: string;
}

/**
 * Frozen snapshot of existing (token, theme) resolved values, captured from the
 * shipped `globals.css`. The non-regression property test (Property 12, task
 * 14.2) asserts the current resolved value equals this baseline in both themes,
 * flagging any drift with the token, theme, and differing value (Req 14.2,
 * 14.6).
 *
 * Built from `colorTokens` (both theme values) plus the theme-dependent
 * `--elev-*` shadows, then deeply frozen so it cannot be mutated at runtime.
 */
export const BASELINE_TOKENS: readonly BaselineTokenEntry[] = Object.freeze(
  [
    ...colorTokens.flatMap((t): BaselineTokenEntry[] => [
      { name: t.name, theme: 'dark', value: t.dark },
      { name: t.name, theme: 'light', value: t.light },
    ]),
    // Theme-dependent elevation shadows (light theme softens each — capture both).
    { name: '--elev-1', theme: 'dark', value: '0 1px 2px rgba(0,0,0,0.3)' },
    { name: '--elev-1', theme: 'light', value: '0 1px 2px rgba(15, 23, 42, 0.06)' },
    { name: '--elev-2', theme: 'dark', value: '0 4px 16px -2px rgba(0,0,0,0.45)' },
    { name: '--elev-2', theme: 'light', value: '0 4px 16px -2px rgba(15, 23, 42, 0.1)' },
    { name: '--elev-3', theme: 'dark', value: '0 12px 40px -8px rgba(0,0,0,0.6)' },
    { name: '--elev-3', theme: 'light', value: '0 12px 40px -8px rgba(15, 23, 42, 0.16)' },
    { name: '--elev-gold', theme: 'dark', value: '0 8px 30px -6px rgba(233, 180, 76, 0.28)' },
    { name: '--elev-gold', theme: 'light', value: '0 8px 30px -6px rgba(184, 134, 11, 0.22)' },
  ].map((e) => Object.freeze(e)),
) as readonly BaselineTokenEntry[];

// ─────────────────────────────────────────────────────────────────────────
// Manifest aggregate + validators
// ─────────────────────────────────────────────────────────────────────────

/**
 * The complete token manifest. Passed to the validators and consumed by the
 * property/non-regression tests.
 */
export interface TokenManifest {
  colorTokens: readonly ColorTokenDef[];
  spacingTokens: readonly ScalarTokenDef[];
  blurTokens: readonly ScalarTokenDef[];
  motionTokens: readonly ScalarTokenDef[];
  elevationTokens: readonly ScalarTokenDef[];
  typographyTokens: readonly ScalarTokenDef[];
}

/** The shipped manifest aggregate, assembled from the exported token sets. */
export const tokenManifest: TokenManifest = {
  colorTokens,
  spacingTokens,
  blurTokens,
  motionTokens,
  elevationTokens,
  typographyTokens,
};

/**
 * Returns the set of every token name known to the manifest (color + all
 * scalar scales). Used by `validateTailwindMapping` to detect dangling
 * references.
 */
export function knownTokenNames(manifest: TokenManifest = tokenManifest): Set<string> {
  const names = new Set<string>();
  for (const t of manifest.colorTokens) names.add(t.name);
  for (const t of manifest.spacingTokens) names.add(t.name);
  for (const t of manifest.blurTokens) names.add(t.name);
  for (const t of manifest.motionTokens) names.add(t.name);
  for (const t of manifest.elevationTokens) names.add(t.name);
  for (const t of manifest.typographyTokens) names.add(t.name);
  return names;
}

/**
 * Validate theme parity for color tokens (Req 2.1, 2.6).
 *
 * A {@link ColorTokenDef} is well-formed only when it defines a non-empty value
 * for BOTH themes. This returns the names of any color tokens that are missing
 * (empty/whitespace) a value in exactly one theme — i.e. present in one theme
 * but effectively absent from the other. An empty array means full parity.
 *
 * @param manifest the token manifest to check (defaults to the shipped manifest)
 * @returns offending token names present in only one theme
 */
export function validateThemeParity(manifest: TokenManifest = tokenManifest): string[] {
  const offending: string[] = [];
  for (const token of manifest.colorTokens) {
    const hasDark = typeof token.dark === 'string' && token.dark.trim().length > 0;
    const hasLight = typeof token.light === 'string' && token.light.trim().length > 0;
    // Flag when defined for exactly one theme (XOR) — a parity violation.
    if (hasDark !== hasLight) {
      offending.push(token.name);
    }
  }
  return offending;
}

/**
 * Validate that every Tailwind mapping value references a token that exists in
 * the manifest (Req 3.6).
 *
 * Each value in the map must be exactly `var(--<name>)` where `--<name>` is a
 * token name known to the manifest. This returns the list of dangling
 * `var(--x)` references whose `--x` is absent from the manifest's known token
 * names (or whose value is not a well-formed single `var(--...)` reference). An
 * empty array means every reference resolves.
 *
 * @param map the Tailwind token map to check
 * @param manifest the token manifest providing the known token names
 * @returns dangling `var(--x)` reference strings that cannot be resolved
 */
export function validateTailwindMapping(
  map: TailwindTokenMap = tailwindTokenMap,
  manifest: TokenManifest = tokenManifest,
): string[] {
  const known = knownTokenNames(manifest);
  const dangling: string[] = [];
  // Matches a single, whole `var(--token-name)` reference.
  const varRef = /^var\(\s*(--[A-Za-z0-9-]+)\s*\)$/;

  const categories: Record<string, string>[] = [
    map.colors,
    map.spacing,
    map.blur,
    map.boxShadow,
  ];
  for (const category of categories) {
    for (const value of Object.values(category)) {
      const match = varRef.exec(value);
      if (!match || !known.has(match[1])) {
        dangling.push(value);
      }
    }
  }
  return dangling;
}
