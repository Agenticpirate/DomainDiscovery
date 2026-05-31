'use client';

import { useEffect, useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * useReducedMotion
 *
 * Returns whether the user agent currently reports a reduced-motion
 * preference (`(prefers-reduced-motion: reduce)` matches).
 *
 * The hook subscribes to the media query's `change` event so that when the
 * Reduced_Motion state flips from inactive to active (or back) while the page
 * is displayed, the returned value updates and consumers re-render WITHOUT a
 * page reload (Req 9.5). This covers JS-driven Ambient_Motion (e.g. the Hero),
 * letting it switch to its static resting state at runtime. CSS-driven motion
 * is handled separately by the `prefers-reduced-motion` block in globals.css.
 *
 * SSR-safe: defaults to `false` when `window`/`matchMedia` is unavailable, and
 * only reads or subscribes inside an effect (never during render), so server
 * and first client render agree.
 *
 * @returns `true` when reduced motion is preferred, otherwise `false`.
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    // Sync immediately in case the preference is already active on mount, or
    // changed between the initial render and this effect running.
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
