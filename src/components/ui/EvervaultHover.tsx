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
}

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateRandomString(length: number) {
  // crypto-fast-ish path for large strings
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
 * Full Aceternity Evervault hover field for the footer brand band.
 * - Scrambling encrypted character matrix
 * - Cyan → blue radial spotlight that follows the cursor
 * - Soft dark core (no solid circle UI, no "hover" label)
 * Brand particle wordmark stays as children on top.
 */
export function EvervaultHover({
  className,
  children,
  radius = 260,
}: EvervaultHoverProps) {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const [active, setActive] = useState(false);
  const [randomString, setRandomString] = useState('');
  const lastRegenRef = useRef(0);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Dense enough to fill a wide footer strip
  const stringLength = useMemo(() => {
    if (typeof window === 'undefined') return 9000;
    const w = Math.max(800, window.innerWidth);
    return Math.min(16000, Math.floor((w * 220) / 8));
  }, []);

  useEffect(() => {
    setRandomString(generateRandomString(stringLength));
  }, [stringLength]);

  const regenChars = useCallback(() => {
    const now = performance.now();
    // Throttle scramble so it feels live without melting the main thread
    if (now - lastRegenRef.current < 48) return;
    lastRegenRef.current = now;
    setRandomString(generateRandomString(stringLength));
  }, [stringLength]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { left, top } = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - left);
      mouseY.set(e.clientY - top);
      regenChars();
    },
    [mouseX, mouseY, regenChars]
  );

  const maskImage = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, white, transparent)`;
  const maskStyle = { maskImage, WebkitMaskImage: maskImage };

  return (
    <div
      className={cn('group/evervault relative', className)}
      onMouseMove={onMouseMove}
      onMouseEnter={() => {
        setActive(true);
        regenChars();
      }}
      onMouseLeave={() => {
        setActive(false);
        mouseX.set(-1000);
        mouseY.set(-1000);
      }}
    >
      {/* —— Evervault field (behind brand particles) —— */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        {/* Subtle idle field so the band never feels empty */}
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            active ? 'opacity-100' : 'opacity-30'
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

        {/* Soft edge fade so matrix doesn’t hard-cut the band */}
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            active ? 'opacity-50' : 'opacity-0',
            isLight
              ? '[mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]'
              : '[mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]'
          )}
        />

        {/* Gradient spotlight — cyan / emerald → deep blue (matches Aceternity demo) */}
        <motion.div
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            active ? 'opacity-100' : 'opacity-0',
            isLight
              ? 'bg-gradient-to-r from-emerald-400/55 via-cyan-400/40 to-blue-500/50'
              : 'bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-700'
          )}
          style={maskStyle}
        />

        {/* Secondary cooler wash for depth */}
        <motion.div
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            active ? 'opacity-90' : 'opacity-0',
            isLight
              ? 'bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.35),transparent_70%)]'
              : 'bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.35),rgba(29,78,216,0.25)_45%,transparent_70%)]'
          )}
          style={maskStyle}
        />

        {/* Scrambling encrypted characters revealed only inside the spotlight */}
        <motion.div
          className={cn(
            'absolute inset-0 mix-blend-overlay transition-opacity duration-500',
            active ? 'opacity-100' : 'opacity-0'
          )}
          style={maskStyle}
        >
          <p
            className={cn(
              'absolute inset-0 h-full break-words whitespace-pre-wrap font-mono text-[10px] leading-[1.15] font-bold tracking-tight transition duration-500 sm:text-[11px]',
              isLight ? 'text-slate-900/90' : 'text-white'
            )}
          >
            {randomString}
          </p>
        </motion.div>

        {/* Soft dark core (vignette hole) — no solid ring / no label */}
        <motion.div
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            active ? 'opacity-100' : 'opacity-0'
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

        {/* Outer bloom */}
        <motion.div
          className={cn(
            'absolute inset-0 blur-2xl transition-opacity duration-700',
            active ? 'opacity-40' : 'opacity-0',
            isLight
              ? 'bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.25),transparent_50%)]'
              : 'bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.2),transparent_50%)]'
          )}
          style={{
            ...maskStyle,
            // slightly larger bloom than the hard mask
          }}
        />
      </div>

      {/* Brand bubbles / ParticleText stay crisp above the effect */}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
