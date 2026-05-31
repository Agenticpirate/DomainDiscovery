'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Mandala } from '@/components/ui/Mandala';

interface PageBackgroundProps {
  /** Kept for backwards-compatibility with existing call sites; no longer
   *  changes the look. The background is now a single, consistent, plain
   *  treatment across every page. */
  variant?: 'default' | 'hero' | 'minimal';
  showGrid?: boolean;
}

/**
 * PageBackground — a clean, plain backdrop shared by every page.
 *
 * One soft top glow (a restrained kiss of the gold brand accent over the page
 * base) plus two very faint, slowly drifting tech-mandala motifs anchored to the
 * corners. The mandalas are the same gold-token motif used in the hero, rendered
 * at low opacity so the brand's signature ringwork is felt site-wide without
 * competing with content. The body's `--bg-main` provides the base color; this
 * only adds the gentle ambient light + motif. All decoration is reduced-motion
 * aware (handled inside `Mandala`) and `pointer-events-none`.
 */
export const PageBackground: React.FC<PageBackgroundProps> = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Single consistent top glow — same on every page. */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] max-w-[140vw] h-[520px] rounded-full"
        style={{
          background: isLight
            ? 'radial-gradient(ellipse at center, rgba(184,134,11,0.06), transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(233,180,76,0.06), transparent 70%)',
          filter: 'blur(90px)',
        }}
      />

      {/* Ambient tech-mandala motifs — faint, brand-consistent texture.
          Rendered STATIC site-wide (animated={false}): the motif is the focal,
          animated element only in the hero. Everywhere else it stays a crisp
          still texture so we avoid continuous compositor/GPU work (and battery
          drain) on pages where it isn't the point. Two corner anchors keep the
          composition balanced on tall and short pages alike. */}
      <Mandala
        petals={14}
        animated={false}
        className={`absolute -right-28 -top-24 h-[28rem] w-[28rem] sm:-right-32 sm:-top-28 sm:h-[36rem] sm:w-[36rem] ${
          isLight ? 'opacity-[0.05]' : 'opacity-[0.06]'
        }`}
      />
      <Mandala
        petals={10}
        animated={false}
        className={`absolute -left-32 bottom-[-10rem] hidden h-[30rem] w-[30rem] sm:block sm:h-[38rem] sm:w-[38rem] ${
          isLight ? 'opacity-[0.04]' : 'opacity-[0.05]'
        }`}
      />
    </div>
  );
};
