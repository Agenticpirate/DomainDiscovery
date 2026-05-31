/**
 * Glass_Card — a reusable translucent container (Glass_Surface).
 *
 * Built on the semantics of the shipped `.glass-card` class, which stays intact
 * for existing consumers; this component exposes the same surface through a
 * documented, polymorphic prop API. Every surface property (background, border,
 * shadow, blur) resolves from Token_Layer CSS custom properties — there are no
 * literal colors anywhere in this file (Req 4.3, 7.1).
 *
 * Styling strategy: properties Tailwind can't express cleanly (backdrop-filter,
 * a dynamic per-tier box-shadow, token-driven padding) are applied via an inline
 * `style` object that references `var(--…)` tokens; `className` is composed with
 * the shipped `cn()` helper. This guarantees token-only surfaces and switches
 * dark↔light automatically via the CSS cascade (Req 4.4).
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — "Glass_Card"
 * Requirements: 4.1, 4.3, 4.5, 4.6, 4.7, 4.8, 7.1
 */

import type { CSSProperties, ElementType, ReactNode } from 'react';
import { resolveElevation, type Elevation } from './elevation';
import { cn } from '@/lib/utils';

/** Named blur tiers, mapped to the `--blur-*` token scale (Req 4.5). */
export type GlassBlur = 'sm' | 'md' | 'lg' | 'xl';

/** Named padding steps, mapped to the `--space-*` token scale. */
export type GlassPadding = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface GlassCardProps {
  /** Polymorphic root element. Defaults to `'div'`. */
  as?: ElementType;
  /** Elevation tier resolved via {@link resolveElevation} (Req 4.6–4.8). Defaults to `1`. */
  elevation?: Elevation;
  /** Backdrop blur tier, mapped to `var(--blur-*)` (Req 4.5). Defaults to `'lg'`. */
  blur?: GlassBlur;
  /** Padding step, mapped to `var(--space-*)`. Defaults to `5`. */
  padding?: GlassPadding;
  /** Extra classes merged via `cn()`. */
  className?: string;
  /** Inline style overrides, merged after the token-driven surface styles. */
  style?: CSSProperties;
  /** Card contents. */
  children?: ReactNode;
  /** Remaining native props are forwarded to the root element. */
  [key: string]: unknown;
}

/**
 * Radius matches the shipped `.glass-card` (16px) so the new primitive is
 * visually consistent with existing glass surfaces.
 */
const CARD_RADIUS = '16px';

export function Glass_Card({
  as,
  elevation = 1,
  blur = 'lg',
  padding = 5,
  className = '',
  style,
  children,
  ...rest
}: GlassCardProps) {
  const Component = (as ?? 'div') as ElementType;

  // Token-only surface: every value references a CSS custom property so the
  // cascade resolves the correct per-theme value and no literal color appears.
  const surfaceStyle: CSSProperties = {
    background: 'var(--glass-bg)',
    backdropFilter: `blur(var(--blur-${blur}))`,
    WebkitBackdropFilter: `blur(var(--blur-${blur}))`,
    border: '1px solid var(--card-border)',
    boxShadow: resolveElevation(elevation),
    borderRadius: CARD_RADIUS,
    padding: `var(--space-${padding})`,
    ...style,
  };

  return (
    <Component className={cn(className)} style={surfaceStyle} {...rest}>
      {children}
    </Component>
  );
}

export default Glass_Card;
