'use client';

/**
 * Glass_Nav — a Glass_Surface anchored to the top of the viewport.
 *
 * Renders a translucent, blurred navigation bar styled exclusively from
 * Token_Layer values (Req 4.3): the surface comes from `--nav-bg` layered over
 * `--glass-bg` as a fallback, the backdrop blur from the `--blur-*` scale
 * (Req 4.5), the bottom border from `--card-border`, and the drop shadow from
 * the shared {@link resolveElevation} helper. No literal colors appear in this
 * component.
 *
 * Polymorphic via the `as` prop (defaults to `<nav>`). When `as` resolves to a
 * non-`nav` element, the component applies `role="navigation"` so assistive
 * technology still recognizes it as a navigation landmark.
 *
 * Keyboard order follows DOM order (Req 7.2): the component never sets a
 * positive `tabIndex` and never reorders its children, so focus traversal
 * matches the visual reading order.
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — "Glass_Nav"
 * Requirements: 4.1, 4.3, 4.5, 7.2
 */

import React, { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties, ElementType, ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { resolveElevation, type Elevation } from './elevation';

/** Named steps of the blur scale (`--blur-*`) consumable by Glass_Surface. */
export type GlassBlur = 'sm' | 'md' | 'lg' | 'xl';

export interface GlassNavProps {
  /** Elevation tier resolved via {@link resolveElevation}. Defaults to `2`. */
  elevation?: Elevation;
  /** Backdrop blur radius from the `--blur-*` scale. Defaults to `'md'`. */
  blur?: GlassBlur;
  /** When true, pins the bar to the top of the viewport (`position: sticky; top: 0`). Defaults to `true`. */
  sticky?: boolean;
  /** Polymorphic root element. Defaults to `'nav'`; non-`nav` elements get `role="navigation"`. */
  as?: ElementType;
  /** Additional classes merged via {@link cn}. */
  className?: string;
  /** Navigation content. */
  children?: ReactNode;
}

/**
 * Props accepted by Glass_Nav: the documented API above plus any native
 * attributes valid on the rendered element (forwarded through).
 */
export type GlassNavComponentProps = GlassNavProps &
  Omit<ComponentPropsWithoutRef<'nav'>, keyof GlassNavProps>;

const Glass_Nav = forwardRef<HTMLElement, GlassNavComponentProps>(function Glass_Nav(
  {
    elevation = 2,
    blur = 'md',
    sticky = true,
    as,
    className,
    children,
    style,
    ...rest
  },
  ref
) {
  const Component = (as ?? 'nav') as ElementType;
  const isNav = Component === 'nav';

  // Token-only surface styling (Req 4.3, 4.5). The `--nav-bg` token defines the
  // navigation surface per theme, falling back to `--glass-bg` where it is not
  // defined; the bottom border and shadow are token-driven as well.
  const blurValue = `blur(var(--blur-${blur}))`;
  const surfaceStyle: CSSProperties = {
    background: 'var(--nav-bg, var(--glass-bg))',
    backdropFilter: blurValue,
    WebkitBackdropFilter: blurValue,
    borderBottom: '1px solid var(--card-border)',
    boxShadow: resolveElevation(elevation),
    ...style,
  };

  return (
    <Component
      ref={ref}
      // role="navigation" only when the rendered element is not a <nav> so the
      // landmark semantics are preserved for assistive technology.
      role={isNav ? undefined : 'navigation'}
      // Sticky positioning + a sensible stacking context so the bar floats over
      // page content. Keyboard order follows DOM order — no positive tabIndex,
      // no child reordering (Req 7.2).
      className={cn(sticky && 'sticky top-0 z-40', className)}
      style={surfaceStyle}
      {...rest}
    >
      {children}
    </Component>
  );
});

export default Glass_Nav;
export { Glass_Nav };
