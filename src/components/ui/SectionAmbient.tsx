'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { DottedGlowBackground } from '@/components/ui/DottedGlowBackground';
import { EvervaultHover } from '@/components/ui/EvervaultHover';
import { cn } from '@/lib/utils';

export type SectionAmbientIntensity = 'hero' | 'page' | 'soft' | 'dots';

/** Prevent nested SectionAmbient from stacking a second dotted canvas */
const AmbientActiveContext = React.createContext(false);

type SectionAmbientProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /**
   * hero — spotlight + dots with center soft-clear (landing + tool heroes)
   * page — same center-clear as hero (internal pages; gutters only under copy/badges)
   * soft — lighter dots, mild center clear
   * dots — lightest dots, mild center clear
   */
  intensity?: SectionAmbientIntensity;
  /** Force solid page-black underlay (dark mode). Default true for hero/page. */
  solidBase?: boolean;
  /** Disable all motion layers (SSR-safe placeholder) */
  disabled?: boolean;
  /**
   * Mouse spotlight (Evervault). Default OFF — full-page wrappers with spotlight
   * intercept hover and can break nav menus. Enable only on home hero (`spotlight`).
   */
  spotlight?: boolean;
};

/**
 * Site-wide ambient field: dark black + silver shining dots (+ optional monochrome spotlight).
 * Only ONE dotted canvas mounts in a tree — nested SectionAmbient reuses the outer layer.
 */
export function SectionAmbient({
  children,
  className = '',
  contentClassName = '',
  intensity = 'hero',
  solidBase,
  disabled = false,
  spotlight,
}: SectionAmbientProps) {
  const nestedUnderAmbient = React.useContext(AmbientActiveContext);
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isLight = mounted ? theme === 'light' : false;
  const useSolid = solidBase ?? (intensity === 'hero' || intensity === 'page');
  // Spotlight is opt-in only (home hero). Tool/internal pages use dots + mask alone.
  const showSpotlight = !nestedUnderAmbient && spotlight === true;
  const showDots = !nestedUnderAmbient && !disabled;
  const spotlightRadius = intensity === 'page' ? 96 : 88;

  const dots = {
    // Landing hero: brighter silver + sparkle; center still soft-cleared by mask
    hero: {
      gap: 17,
      radius: 1.2,
      opacity: isLight ? 0.22 : 0.38,
      speedMin: 0.22,
      speedMax: 0.62,
      speedScale: 0.52,
    },
    page: {
      gap: 16,
      radius: 1.18,
      opacity: isLight ? 0.22 : 0.34,
      speedMin: 0.22,
      speedMax: 0.58,
      speedScale: 0.5,
    },
    soft: {
      gap: 20,
      radius: 0.95,
      opacity: isLight ? 0.12 : 0.16,
      speedMin: 0.18,
      speedMax: 0.42,
      speedScale: 0.4,
    },
    dots: {
      gap: 17,
      radius: 1.15,
      opacity: isLight ? 0.18 : 0.28,
      speedMin: 0.2,
      speedMax: 0.52,
      speedScale: 0.46,
    },
  }[intensity];

  const baseStyle: React.CSSProperties | undefined = useSolid
    ? { backgroundColor: isLight ? undefined : '#050505' }
    : undefined;

  const vignette = isLight
    ? 'radial-gradient(ellipse 70% 55% at 50% 20%, rgba(15,23,42,0.04), transparent 65%)'
    : 'radial-gradient(ellipse 70% 55% at 50% 18%, rgba(255,255,255,0.03), transparent 62%)';

  // Nested SectionAmbient: no second canvas — pass children through only
  if (nestedUnderAmbient) {
    return (
      <div className={cn('relative min-h-full w-full', className)} style={baseStyle}>
        <div className={cn('relative z-10 min-h-full w-full', contentClassName)}>{children}</div>
      </div>
    );
  }

  const field = (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden
        style={{ background: vignette }}
      />
      {mounted && showDots && (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden
          data-ambient-dots="single"
          style={
            intensity === 'hero' || intensity === 'page'
              ? // Landing + internal pages: clear under badge / title / copy / CTAs; dots in gutters
                {
                  maskImage:
                    'radial-gradient(ellipse 78% 76% at 50% 36%, transparent 0%, transparent 48%, rgba(0,0,0,0.35) 62%, rgba(0,0,0,0.8) 78%, black 92%)',
                  WebkitMaskImage:
                    'radial-gradient(ellipse 78% 76% at 50% 36%, transparent 0%, transparent 48%, rgba(0,0,0,0.35) 62%, rgba(0,0,0,0.8) 78%, black 92%)',
                }
              : intensity === 'dots' || intensity === 'soft'
                ? // Mild center clear so mid-section copy stays readable
                  {
                    maskImage:
                      'radial-gradient(ellipse 70% 65% at 50% 40%, transparent 0%, transparent 38%, rgba(0,0,0,0.45) 58%, black 85%)',
                    WebkitMaskImage:
                      'radial-gradient(ellipse 70% 65% at 50% 40%, transparent 0%, transparent 38%, rgba(0,0,0,0.45) 58%, black 85%)',
                  }
                : {
                    maskImage:
                      'linear-gradient(to bottom, transparent 0%, black 8%, black 84%, transparent 100%)',
                    WebkitMaskImage:
                      'linear-gradient(to bottom, transparent 0%, black 8%, black 84%, transparent 100%)',
                  }
          }
        >
          {/* Stable key — avoid remounting a second canvas on theme hydrate */}
          <DottedGlowBackground
            gap={dots.gap}
            radius={dots.radius}
            opacity={dots.opacity}
            speedMin={dots.speedMin}
            speedMax={dots.speedMax}
            speedScale={dots.speedScale}
            sparkle
          />
        </div>
      )}
    </>
  );

  // Ambient field is ALWAYS a single layer behind content (z-0).
  // Content is isolated at z-10 so solid plates fully cover the canvas.
  const body = !showSpotlight ? (
    <div className={cn('relative z-10 min-h-full w-full', contentClassName)}>{children}</div>
  ) : (
    <EvervaultHover
      ambient
      radius={spotlightRadius}
      className="relative z-10 flex h-full min-h-full w-full flex-col"
      contentClassName={cn('relative z-10 flex min-h-full w-full flex-1 flex-col', contentClassName)}
    >
      {children}
    </EvervaultHover>
  );

  return (
    <AmbientActiveContext.Provider value={true}>
      {/* overflow-x-clip only — avoid overflow-hidden clipping sticky/dropdown UI */}
      <div className={cn('relative isolate overflow-x-clip', className)} style={baseStyle}>
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          {field}
        </div>
        {body}
      </div>
    </AmbientActiveContext.Provider>
  );
}
