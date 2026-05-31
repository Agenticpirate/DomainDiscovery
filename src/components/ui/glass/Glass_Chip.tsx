'use client';

/**
 * Glass_Chip — a small label/pill built on the shipped `.accent-chip` styling.
 *
 * The chip composes the existing `.accent-chip` class, whose surface is drawn
 * entirely from the gold accent token family (`--accent-text` / `--accent-tint`
 * / `--accent-border`). Because the presentation comes from those tokens, the
 * gold appearance resolves from the `--accent` family and switches dark↔light
 * automatically via the CSS cascade — there are no literal colors in this file
 * (Req 4.3, 4.9).
 *
 * Polymorphic via the `as` prop:
 *  - `'span'` (default) → a static, non-focusable label with no focus ring.
 *  - `'button'`         → a native `<button>`; Enter/Space activation and
 *                         disabled focus-exclusion come for free (Req 7.4).
 *  - `'a'`              → an anchor; when `href` is supplied it is keyboard
 *                         focusable and Enter activates it natively.
 *
 * Interactive variants (`button`/`a`) add a token-driven focus-visible ring
 * ≥ 2px sourced from the `--accent` token (Tailwind `ring-accent`), so the
 * focused state differs from the unfocused state by the appearance of the ring,
 * not by color alone (Req 7.1). The static `span` has no focus ring and is not
 * added to the tab order.
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — "Glass_Chip"
 * Requirements: 4.1, 4.3, 4.9, 7.1, 7.4
 */

import type { ElementType, MouseEventHandler, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** The element the chip renders as. Interactive when `'button'` or `'a'`. */
export type GlassChipAs = 'span' | 'button' | 'a';

export interface GlassChipProps {
  /** Element to render. Defaults to `'span'` (static); `'button'`/`'a'` are interactive. */
  as?: GlassChipAs;
  /** Optional leading icon rendered before the children (chip `gap` spaces it). */
  icon?: ReactNode;
  /** Destination URL. Used only when `as="a"`. */
  href?: string;
  /** Activation handler. Fires on pointer click and, for interactive variants, on Enter/Space. */
  onClick?: MouseEventHandler<HTMLElement>;
  /** Extra classes merged via `cn()`. */
  className?: string;
  /** Chip contents (required accessible label). */
  children: ReactNode;
  /** Remaining native props are forwarded to the chosen element. */
  [key: string]: unknown;
}

/**
 * Token-driven focus-visible ring for the interactive variants. Every value
 * references a mapped design token (`ring-accent` → `var(--accent)`,
 * `ring-offset-bg-main` → `var(--bg-main)`), so the ring is token-only and
 * theme-aware. `ring-2` makes the indicator ≥ 2px (Req 7.1).
 */
const INTERACTIVE_CLASSES =
  'cursor-pointer outline-none transition-transform focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-bg-main';

export function Glass_Chip({
  as = 'span',
  icon,
  href,
  onClick,
  className = '',
  children,
  ...rest
}: GlassChipProps) {
  const Component = as as ElementType;
  const isInteractive = as === 'button' || as === 'a';

  // Compose the shipped `.accent-chip` token styling with the interactive focus
  // ring (only for button/a) and any caller-provided classes.
  const elementProps: Record<string, unknown> = {
    ...rest,
    className: cn('accent-chip', isInteractive && INTERACTIVE_CLASSES, className),
    onClick,
  };

  // Forward `href` only for anchors so a static span/button never receives an
  // invalid DOM attribute.
  if (as === 'a' && href !== undefined) {
    elementProps.href = href;
  }

  // Native buttons default to `type="submit"`; pin to `"button"` unless the
  // caller overrode it, so a chip never submits an enclosing form by accident.
  if (as === 'button' && elementProps.type === undefined) {
    elementProps.type = 'button';
  }

  return (
    <Component {...elementProps}>
      {icon}
      {children}
    </Component>
  );
}

export default Glass_Chip;
