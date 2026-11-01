'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  markSearchCountSeen,
  readSearchCount,
  readSeenSearchCount,
  SEARCH_COUNT_BASE,
  subscribeSearchCount,
} from '@/lib/searchCounter';

function formatCount(value: number) {
  return Math.max(SEARCH_COUNT_BASE, Math.round(value)).toLocaleString('en-US');
}

export function SearchCountPill() {
  const [display, setDisplay] = useState<number | null>(null);
  const displayRef = useRef<number | null>(null);
  const frameRef = useRef(0);

  const animateTo = (target: number, from?: number) => {
    cancelAnimationFrame(frameRef.current);
    const startValue = from ?? displayRef.current ?? target;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || startValue === target) {
      displayRef.current = target;
      setDisplay(target);
      markSearchCountSeen(target);
      return;
    }

    const started = performance.now();
    const duration = Math.min(900, 280 + Math.abs(target - startValue) * 40);

    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(startValue + (target - startValue) * eased);
      displayRef.current = value;
      setDisplay(value);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }
      markSearchCountSeen(target);
    };

    frameRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const target = readSearchCount();
    const seen = readSeenSearchCount();
    const from = seen != null && seen < target ? seen : target;
    displayRef.current = from;
    setDisplay(from);
    animateTo(target, from);
    const unsubscribe = subscribeSearchCount((next) => animateTo(next));
    const refresh = () => {
      const latest = readSearchCount();
      const shown = displayRef.current;
      if (shown == null || latest !== shown) animateTo(latest, shown ?? latest);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', refresh);
      window.removeEventListener('focus', refresh);
      cancelAnimationFrame(frameRef.current);
    };
    // Mount once: later updates arrive through the search-count event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="hero-badge inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-none tracking-wide text-ds-body sm:gap-2 sm:px-3 sm:py-1.5 sm:text-[12px]"
      aria-live="polite"
    >
      <svg className="h-3 w-3 shrink-0 text-ds-ink sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path strokeLinecap="round" d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-7" />
      </svg>
      <span className="tabular-nums font-semibold text-ds-ink" suppressHydrationWarning>
        {display == null ? '20,000,000+' : formatCount(display)}
      </span>
      <span>domains searched</span>
    </div>
  );
}
