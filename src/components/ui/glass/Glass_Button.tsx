'use client';

/**
 * Glass_Button — the action control of the glass component library.
 *
 * Renders a NATIVE `<button>`, so keyboard activation (Enter/Space) and
 * disabled focus-exclusion are provided by the platform rather than
 * re-implemented (Req 7.4, 7.6). Two variants:
 *
 *  - `primary`   → composes the shipped `.btn-accent` class, whose gold surface
 *                  resolves entirely from the `--accent` token family
 *                  (`--gradient-gold` / `--accent-contrast` / `--elev-gold`), so
 *                  the gold presentation comes from existing accent tokens, never
 *                  a literal color (Req 4.9).
 *  - `secondary` → a glass surface drawn from the shipped button-secondary
 *                  tokens (`--btn-secondary-bg` / `-text` / `-border`).
 *
 * The default is `secondary` so composing a screen never accidentally produces a
 * second gold control; a screen opts exactly one button into `primary` (the Hero
 * Primary_CTA, Req 10.3).
 *
 * TOKEN-ONLY SURFACE (Req 4.3): every surface color, border, and shadow is a
 * `var(--…)` reference — there are no literal hex/rgb colors in this file. For
 * `primary`, composing `.btn-accent` is the allowed token-driven path; for
 * `secondary`, the surface is applied via inline `var(--…)` styles. Because the
 * values are CSS custom properties, the cascade resolves the correct per-theme
 * value automatically (Req 4.4).
 *
 * FOCUS (Req 7.1): a token-driven `focus-visible` ring ≥ 2px (`ring-2` →
 * `var(--accent)`) appears on keyboard focus. The focused state differs from the
 * unfocused state by the *appearance of the ring* (a geometry/width change), not
 * by color alone.
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — "Glass_Button"
 * Requirements: 4.1, 4.3, 4.9, 7.1, 7.4, 7.6
 */

import type {
  ButtonHTMLAttributes,
  CSSProperties,
  ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

import { resolveElevation, type Elevation } from './elevation';

/** Visual variant. `primary` is gold (`.btn-accent`); `secondary` is glass. */
export type GlassButtonVariant = 'primary' | 'secondary';

/** Size step; controls padding (and type size) from the token scales. */
export type GlassButtonSize = 'sm' | 'md' | 'lg';

/**
 * Per-size padding sourced from the `--space-*` scale, and a matching type size
 * from the `--text-size-*` scale. Token-only — no literal lengths for color and
 * no hard-coded surface values. `md` deliberately matches the shipped
 * `.btn-accent` padding (`0.75rem 1.5rem`) so the default primary button keeps
 * its established proportions.
 */
const SIZE_STYLES: Record<GlassButtonSize, { padding: string; fontSize: string }> = {
  sm: { padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-size-sm)' },
  md: { padding: 'var(--space-3) var(--space-5)', fontSize: 'var(--text-size-base)' },
  lg: { padding: 'var(--space-4) var(--space-6)', fontSize: 'var(--text-size-lg)' },
};

/**
 * Token-driven `focus-visible` ring (Req 7.1). `ring-2` makes the indicator
 * ≥ 2px; `ring-accent` / `ring-offset-bg-main` reference mapped design tokens
 * (`var(--accent)` / `var(--bg-main)`), so the ring is token-only and
 * theme-aware. The unfocused→focused difference is the ring's appearance, not a
 * color swap.
 */
const FOCUS_RING =
  'outline-none focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-main';

/**
 * Disabled affordance. The native `disabled` attribute already excludes the
 * button from tab order and blocks Enter/Space activation (Req 7.6); these
 * classes add the matching non-color visual state.
 */
const DISABLED_CLASSES =
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

/** Shared layout for the `secondary` variant (primary inherits `.btn-accent`). */
const SECONDARY_LAYOUT =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold ' +
  'select-none transition-transform';

export interface GlassButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Visual variant. Defaults to `'secondary'` (glass); `'primary'` is gold. */
  variant?: GlassButtonVariant;
  /** Size step mapped to `--space-*` padding (and `--text-size-*`). Default `'md'`. */
  size?: GlassButtonSize;
  /**
   * Elevation tier resolved via {@link resolveElevation}. Defaults to `1` for
   * `secondary` and `'gold'` for `primary`. When omitted on `primary`, the
   * `.btn-accent` shadow (gold + inset highlight) is preserved.
   */
  elevation?: Elevation;
  /** Native button type. Defaults to `'button'` so it never submits a form by accident. */
  type?: 'button' | 'submit';
  /** Optional leading icon rendered before the children. */
  leftIcon?: ReactNode;
  /** Extra classes merged via `cn()`. */
  className?: string;
  /** Button label content (required accessible label). */
  children: ReactNode;
}

/**
 * Render a glass action button. See the file header for the full behavior and
 * token contract.
 */
export function Glass_Button({
  variant = 'secondary',
  size = 'md',
  elevation,
  type = 'button',
  leftIcon,
  disabled = false,
  className = '',
  children,
  ...rest
}: GlassButtonProps) {
  const isPrimary = variant === 'primary';
  const { padding, fontSize } = SIZE_STYLES[size];

  // Token-only style. Padding/type size apply to both variants; the surface for
  // `secondary` is drawn from the button-secondary tokens. For `primary`, the
  // `.btn-accent` class owns the gold surface + its box-shadow (gold + inset),
  // so we only override the shadow when an explicit `elevation` is supplied.
  const style: CSSProperties = { padding, fontSize };

  if (isPrimary) {
    if (elevation !== undefined) {
      style.boxShadow = resolveElevation(elevation);
    }
  } else {
    style.background = 'var(--btn-secondary-bg)';
    style.color = 'var(--btn-secondary-text)';
    style.border = '1px solid var(--btn-secondary-border)';
    style.boxShadow = resolveElevation(elevation ?? 1);
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        isPrimary ? 'btn-accent' : SECONDARY_LAYOUT,
        FOCUS_RING,
        DISABLED_CLASSES,
        className
      )}
      style={style}
      {...rest}
    >
      {leftIcon}
      {children}
    </button>
  );
}

export default Glass_Button;
