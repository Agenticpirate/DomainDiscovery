'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ensureGsap, ScrollTrigger } from '@/lib/motion/gsapSetup';

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** CSS selector for children to batch-reveal (relative to container) */
  itemSelector?: string;
  y?: number;
  stagger?: number;
};

/**
 * GSAP ScrollTrigger batch reveal for section grids.
 * Mobile-first: small distance, short duration, force3D, clearProps.
 */
export function ScrollReveal({
  children,
  className = '',
  itemSelector = '.scroll-reveal-item',
  y = 28,
  stagger = 0.08,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === 'undefined') return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const gsap = ensureGsap();
      const root = ref.current;
      if (!root) return;

      const items = root.querySelectorAll(itemSelector);
      if (!items.length) return;

      const isMobile = window.matchMedia('(max-width: 640px)').matches;
      const distance = isMobile ? Math.min(y, 16) : y;

      gsap.set(items, {
        y: distance,
        opacity: 0,
        force3D: true,
      });

      ScrollTrigger.batch(items, {
        start: isMobile ? 'top 94%' : 'top 88%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: isMobile ? 0.38 : 0.55,
            stagger: isMobile ? Math.min(stagger, 0.05) : stagger,
            ease: isMobile ? 'power2.out' : 'power3.out',
            force3D: true,
            overwrite: 'auto',
          });
        },
      });

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          const trig = st.trigger as Element | undefined;
          if (trig && root.contains(trig)) st.kill();
        });
      };
    },
    { scope: ref, dependencies: [itemSelector, y, stagger] }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
