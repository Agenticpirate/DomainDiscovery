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
  const [active, setActive] = useState(false);
  const [randomString, setRandomString] = useState('');
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
    const t0 = performance.now();
    let lastFrame = 0;

    const tick = (now: number) => {
      if (!running) return;
      if (!tabVisible) {
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
      if (tabVisible && running && !raf) raf = requestAnimationFrame(tick);
    };
    document.addEventListener('visibilitychange', onVis);

    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      if (!hoverRef.current) seed();
    });
    ro.observe(el);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      ro.disconnect();
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

  const maskImage = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, white, transparent 70%)`;
  const maskStyle = { maskImage, WebkitMaskImage: maskImage };

  const idleOn = ambient || active;

  return (
    <div
      ref={rootRef}
      className={cn('group/evervault relative', className)}
      onMouseMove={onMouseMove}
      onMouseEnter={() => {
        if (ambient) {
          hoverRef.current = true;
        } else {
          setActive(true);
          regenChars();
        }
      }}
      onMouseLeave={() => {
        if (ambient) {
          hoverRef.current = false;
        } else {
          setActive(false);
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
            {/* Footer interactive: matrix + color spotlight */}
            <div
              className={cn(
                'absolute inset-0 transition-opacity duration-700',
                idleOn ? 'opacity-100' : 'opacity-30'
              )}
            >
              <div
                className={cn(
                  'absolute inset-0 opacity-[0.07]',
                  isLight ? 'text-slate-700' : 'text-white'
                )}
              >
                <p className="absolute inset-0 break-words whitespace-pre-wrap font-mono text-[10px] leading-[1.15] font-bold tracking-tight sm:text-[11px]">
                  {randomString}
                </p>
              </div>
            </div>

            <div
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                idleOn ? 'opacity-50' : 'opacity-0',
                isLight
                  ? '[mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]'
                  : '[mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]'
              )}
            />

            <motion.div
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                idleOn ? 'opacity-100' : 'opacity-0',
                isLight
                  ? 'bg-gradient-to-r from-emerald-400/55 via-cyan-400/40 to-blue-500/50'
                  : 'bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-700'
              )}
              style={maskStyle}
            />

            <motion.div
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                idleOn ? 'opacity-90' : 'opacity-0',
                isLight
                  ? 'bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.35),transparent_70%)]'
                  : 'bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.35),rgba(29,78,216,0.25)_45%,transparent_70%)]'
              )}
              style={maskStyle}
            />

            <motion.div
              className={cn(
                'absolute inset-0 mix-blend-overlay transition-opacity duration-500',
                idleOn ? 'opacity-100' : 'opacity-0'
              )}
              style={maskStyle}
            >
              <p
                className={cn(
                  'absolute inset-0 h-full break-words whitespace-pre-wrap font-mono text-[10px] leading-[1.15] font-bold tracking-tight sm:text-[11px]',
                  isLight ? 'text-slate-900/90' : 'text-white'
                )}
              >
                {randomString}
              </p>
            </motion.div>

            <motion.div
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                idleOn ? 'opacity-100' : 'opacity-0'
              )}
              style={maskStyle}
            >
              <div
                className={cn(
                  'absolute inset-0',
                  isLight
                    ? 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.08)_28%,transparent_55%)]'
                    : 'bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.35)_22%,transparent_52%)]'
                )}
              />
            </motion.div>

            <motion.div
              className={cn(
                'absolute inset-0 blur-2xl transition-opacity duration-700',
                idleOn ? 'opacity-40' : 'opacity-0',
                isLight
                  ? 'bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.25),transparent_50%)]'
                  : 'bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.2),transparent_50%)]'
              )}
              style={maskStyle}
            />
          </>
        )}
      </div>

      <div className={cn('relative z-[1]', contentClassName)}>{children}</div>
    </div>
  );
}
