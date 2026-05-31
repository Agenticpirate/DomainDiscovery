/**
 * Glass_Stat — a stat tile (Glass_Surface) that presents a single statistic
 * `value` prominently with one descriptive `label` beneath it. Used to compose
 * the Hero's Stat_Strip (20M+, 50K+, 1,600+, 99.9%).
 *
 * TOKEN-ONLY SURFACE (Req 4.3, 11.2): the surface background, border, shadow,
 * and text colors are sourced exclusively from Token_Layer CSS custom
 * properties — there are no literal hex/rgb colors in this component. Because
 * styling reads from `var(--…)`, the CSS cascade resolves the correct per-theme
 * value automatically, giving free dark↔light parity (Req 4.4).
 *
 * @see .kiro/specs/premium-glass-design-system/design.md — "Glass_Stat"
 * Requirements: 4.1, 4.3, 4.5, 11.2, 11.3
 */

import * as React from 'react';

import { cn } from '@/lib/utils';

import { resolveElevation, type Elevation } from './elevation';

/** Named blur scale steps consumed by Glass_Surface components (Req 4.5). */
type Blur = 'sm' | 'md' | 'lg' | 'xl';

/** Maps each blur step to its `--blur-*` Token reference (token-only). */
const BLUR_VARS: Record<Blur, string> = {
  sm: 'var(--blur-sm)',
  md: 'var(--blur-md)',
  lg: 'var(--blur-lg)',
  xl: 'var(--blur-xl)',
};

export interface GlassStatProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** The statistic value rendered prominently, e.g. `'20M+'`. Required. */
  value: string;
  /** Non-empty descriptor rendered beneath the value (Req 11.3). Required. */
  label: string;
  /** Elevation tier resolved via {@link resolveElevation}. Default `1`. */
  elevation?: Elevation;
  /** Backdrop blur step mapped to `--blur-*`. Default `'md'`. */
  blur?: Blur;
  /** Extra classes merged via {@link cn}. */
  className?: string;
}

/**
 * Render a glass stat tile. The surface is a translucent `--glass-bg` panel with
 * a `--blur-*` backdrop, a `--card-border` border, and a `resolveElevation`
 * box-shadow. The `value` is shown with a large type token in `--text-primary`,
 * and exactly one non-empty label element sits beneath it in `--text-tertiary`.
 */
export function Glass_Stat({
  value,
  label,
  elevation = 1,
  blur = 'md',
  className,
  ...rest
}: GlassStatProps): React.ReactElement {
  const blurValue = BLUR_VARS[blur];

  return (
    <div
      className={cn('relative flex flex-col items-start gap-1 overflow-hidden p-5', className)}
      style={{
        background: 'var(--glass-premium-bg)',
        backdropFilter: `blur(${blurValue}) saturate(140%)`,
        WebkitBackdropFilter: `blur(${blurValue}) saturate(140%)`,
        border: '1px solid var(--glass-premium-border)',
        borderRadius: '16px',
        boxShadow: `${resolveElevation(elevation)}, inset 0 1px 0 0 var(--glass-premium-edge)`,
      }}
      {...rest}
    >
      <span
        className="font-black leading-none tracking-tight"
        style={{
          fontSize: 'var(--text-size-2xl)',
          color: 'var(--text-primary)',
        }}
      >
        {value}
      </span>
      <span
        className="font-medium uppercase leading-snug"
        style={{
          fontSize: 'var(--text-size-xs)',
          letterSpacing: '0.06em',
          color: 'var(--text-tertiary)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default Glass_Stat;
