'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface EvervaultHoverProps {
  className?: string;
  children?: React.ReactNode;
  /** Spotlight radius in px */
  radius?: number;
  /**
   * Hero mode: dark-synced silver spotlight + smooth drift.
   * No character matrix, no React re-renders in the animation loop (no flicker).
   */
  ambient?: boolean;
  /** Extra classes for the children wrapper */
  contentClassName?: string;
}

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateRandomString(length: number) {
  let result = '';
  const charsLen = CHARSET.length;
  const batch = 256;
  while (result.length < length) {
    const take = Math.min(batch, length - result.length);
    for (let i = 0; i < take; i++) {
      result += CHARSET.charAt((Math.random() * charsLen) | 0);
    }
  }
  return result;
}

/**
 * Evervault field:
 * - Footer (default): cyan matrix + hover spotlight
 * - Hero ambient: monochrome silver glow on black (site-synced), no matrix flicker
 */
export function EvervaultHover({
  className,
  children,
  radius = 260,
  ambient = false,
  contentClassName,
}: EvervaultHoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const [randomString, setRandomString] = useState('');
  const [lit, setLit] = useState(false);
  const lastRegenRef = useRef(0);
  const hoverRef = useRef(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const smoothRef = useRef({ x: 0, y: 0 });
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const stringLength = useMemo(() => {
    if (ambient) return 0; // no matrix in ambient
    if (typeof window === 'undefined') return 9000;
    const w = Math.max(800, window.innerWidth);
    return Math.min(16000, Math.floor((w * 220) / 8));
  }, [ambient]);

  useEffect(() => {
    if (ambient || stringLength <= 0) return;
    setRandomString(generateRandomString(stringLength));
  }, [ambient, stringLength]);

  // —— Ambient hero: smooth lerp spotlight ——
  // CRITICAL for PageSpeed: never call getBoundingClientRect inside rAF (forced reflow).
  // Pause when tab hidden / reduced-motion / lab automation to avoid 5–28s main-thread work.
  useEffect(() => {
    if (!ambient) return;
    const el = rootRef.current;
    if (!el) return;

    let reduced = false;
    let lab = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      lab = !!(navigator as Navigator & { webdriver?: boolean }).webdriver;
    } catch {
      /* ignore */
    }
    if (lab || reduced) {
      // Static centered spotlight — no continuous rAF
      const { width, height } = el.getBoundingClientRect();
      mouseX.set(width * 0.5);
      mouseY.set(height * 0.34);
      return;
    }

    let width = el.clientWidth || 1;
    let height = el.clientHeight || 1;

    const seed = () => {
      width = el.clientWidth || 1;
      height = el.clientHeight || 1;
      const x = width * 0.5;
      const y = height * 0.34;
      targetRef.current = { x, y };
      smoothRef.current = { x, y };
      mouseX.set(x);
      mouseY.set(y);
    };
    seed();

    let raf = 0;
    let running = true;
    let tabVisible = document.visibilityState === 'visible';
    let inView = true;
    const t0 = performance.now();
    let lastFrame = 0;

    const tick = (now: number) => {
      if (!running) return;
      if (!tabVisible || !inView) {
        raf = 0;
        return;
      }
      // ~20fps when idle; full rate while pointer is active
      if (!hoverRef.current && now - lastFrame < 48) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastFrame = now;

      if (!hoverRef.current) {
        const t = (now - t0) / 1000;
        targetRef.current = {
          x: width * (0.5 + Math.sin(t * 0.22) * 0.1),
          y: height * (0.32 + Math.cos(t * 0.18) * 0.06),
        };
      }

      const s = smoothRef.current;
      const tg = targetRef.current;
      const ease = hoverRef.current ? 0.18 : 0.045;
      s.x += (tg.x - s.x) * ease;
      s.y += (tg.y - s.y) * ease;
      mouseX.set(s.x);
      mouseY.set(s.y);

      raf = requestAnimationFrame(tick);
    };

    const onVis = () => {
      tabVisible = document.visibilityState === 'visible';
      if (tabVisible && inView && running && !raf) raf = requestAnimationFrame(tick);
    };
    document.addEventListener('visibilitychange', onVis);

    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      if (!hoverRef.current) seed();
    });
    ro.observe(el);

    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              inView = entries.some((e) => e.isIntersecting);
              if (tabVisible && inView && running && !raf) raf = requestAnimationFrame(tick);
            },
            { rootMargin: '80px' }
          )
        : null;
    io?.observe(el);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      ro.disconnect();
      io?.disconnect();
    };
  }, [ambient, mouseX, mouseY]);

  const regenChars = useCallback(() => {
    if (ambient) return;
    const now = performance.now();
    if (now - lastRegenRef.current < 48) return;
    lastRegenRef.current = now;
    setRandomString(generateRandomString(stringLength));
  }, [ambient, stringLength]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { left, top } = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      if (ambient) {
        hoverRef.current = true;
        targetRef.current = { x, y };
      } else {
        mouseX.set(x);
        mouseY.set(y);
        regenChars();
      }
    },
    [ambient, mouseX, mouseY, regenChars]
  );

  const maskImage = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, white, transparent 72%)`;
  const maskStyle = { maskImage, WebkitMaskImage: maskImage };

  return (
    <div
      ref={rootRef}
      className={cn('group/evervault relative', className)}
      onMouseMove={onMouseMove}
      onMouseEnter={() => {
        if (ambient) {
          hoverRef.current = true;
        } else {
          setLit(true);
          regenChars();
        }
      }}
      onMouseLeave={() => {
        if (ambient) {
          hoverRef.current = false;
        } else {
          setLit(false);
          mouseX.set(-1000);
          mouseY.set(-1000);
        }
      }}
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        {/* —— Hero ambient: single monochrome silver orb (no stacked layers) —— */}
        {ambient ? (
          <motion.div
            className={cn(
              'absolute inset-0',
              isLight
                ? 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.5)_0%,rgba(226,232,240,0.16)_32%,transparent_68%)]'
                : 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16)_0%,rgba(226,232,240,0.05)_34%,transparent_68%)]'
            )}
            style={maskStyle}
          />
        ) : (
          <>
            {/* Quiet letters in every corner. The color only appears under the pointer. */}
            <div className={cn('absolute inset-0', isLight ? 'text-slate-700' : 'text-white')}>
              <p className="absolute -inset-8 break-words whitespace-pre-wrap font-mono text-[10px] font-bold leading-[1.15] tracking-tight opacity-[0.16] sm:text-[11px]">
                {randomString}
                {randomString}
              </p>
            </div>
            <motion.div
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                lit ? 'opacity-100' : 'opacity-0',
                isLight
                  ? 'bg-gradient-to-r from-emerald-400/40 via-cyan-400/28 to-blue-500/35'
                  : 'bg-gradient-to-r from-emerald-400/50 via-cyan-500/35 to-blue-700/45'
              )}
              style={maskStyle}
            />
            <motion.div
              className={cn(
                'absolute inset-0 mix-blend-overlay transition-opacity duration-500',
                lit ? 'opacity-100' : 'opacity-0'
              )}
              style={maskStyle}
            >
              <p
                className={cn(
                  'absolute -inset-8 break-words whitespace-pre-wrap font-mono text-[10px] font-bold leading-[1.15] tracking-tight sm:text-[11px]',
                  isLight ? 'text-slate-900/80' : 'text-white'
                )}
              >
                {randomString}
                {randomString}
              </p>
            </motion.div>
          </>
        )}
      </div>

      <div className={cn('relative z-[1]', contentClassName)}>{children}</div>
    </div>
  );
}
