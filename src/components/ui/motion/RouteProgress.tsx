'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Thin top progress line on route change — masks hard cuts and feels premium
 * (Vercel/NProgress-style without a heavy dependency).
 */
export function RouteProgress() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const first = useRef(true);
  const timers = useRef<number[]>([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    // Skip first paint so home load isn’t a fake progress bar
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduce) return;

    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];

    setVisible(true);
    setWidth(12);

    const t1 = window.setTimeout(() => setWidth(55), 40);
    const t2 = window.setTimeout(() => setWidth(82), 160);
    const t3 = window.setTimeout(() => setWidth(100), 320);
    const t4 = window.setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 520);
    timers.current = [t1, t2, t3, t4];

    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, [pathname, mounted, reduce]);

  if (!mounted || reduce || !visible) return null;

  const isLight = theme === 'light';

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[2px] overflow-hidden"
      aria-hidden
    >
      <div
        className="h-full origin-left transition-[width] duration-300 ease-out"
        style={{
          width: `${width}%`,
          background: isLight
            ? 'linear-gradient(90deg, #0a0a0c 0%, #334155 55%, #0a0a0c 100%)'
            : 'linear-gradient(90deg, rgba(255,255,255,0.25) 0%, #fff 50%, rgba(255,255,255,0.35) 100%)',
          boxShadow: isLight
            ? '0 0 12px rgba(15,23,42,0.35)'
            : '0 0 14px rgba(255,255,255,0.35)',
        }}
      />
    </div>
  );
}
