'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
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

  const baseStyle: React.CSSProperties | undefined = useSolid
    ? { backgroundColor: isLight ? undefined : '#000000' }
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
        <div className="ambient-edge-fade pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          data-ambient-dots="single"
          style={
            intensity === 'hero' || intensity === 'page'
              ? // Symmetric clear under centered copy; dots live in the side gutters
                {
                  maskImage:
                    'radial-gradient(ellipse 50% 70% at 50% 44%, transparent 0%, transparent 42%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.9) 76%, black 90%)',
                  WebkitMaskImage:
                    'radial-gradient(ellipse 50% 70% at 50% 44%, transparent 0%, transparent 42%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.9) 76%, black 90%)',
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
          <div
            className={`absolute inset-0 ambient-dots ${
              intensity === 'hero' ? 'ambient-dots-hero ambient-drift-soft' : 'ambient-breathe'
            }`}
          />
          {intensity === 'hero' && (
            <div className="absolute inset-0 ambient-sweep ambient-sweep-hero">
              <div className="ambient-sweep-band">
                <div className="ambient-dots ambient-sweep-dots" />
              </div>
            </div>
          )}
        </div>
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
