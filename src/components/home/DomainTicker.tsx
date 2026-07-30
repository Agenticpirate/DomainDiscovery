'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export type Testimonial = {
  quote: string;
  role: string;
};

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { quote: 'No account. No tracking. Searches stay on my machine.', role: 'Founder' },
  { quote: 'The only domain tool that doesn’t harvest my data.', role: 'Indie hacker' },
  { quote: 'Saved domains live locally — nothing leaves my PC.', role: 'Developer' },
  { quote: 'Instant search without signing up or selling my history.', role: 'Designer' },
  { quote: 'Privacy by default. Exactly what I wanted.', role: 'Builder' },
  { quote: 'AI domain ideas without cloud lock-in or cookies.', role: 'Marketer' },
  { quote: 'Bulk checks and geo names in one clean workflow.', role: 'Agency lead' },
  { quote: 'Found a brandable .ai in minutes — still free to use.', role: 'Startup founder' },
];

/** Real human headshots — greyscale by default, full color / lift on hover */
const HERO_AVATARS = [
  { src: '/avatars/person-1.jpg', alt: 'Privacy-conscious founder' },
  { src: '/avatars/person-2.jpg', alt: 'Independent builder' },
  { src: '/avatars/person-3.jpg', alt: 'Startup developer' },
] as const;

interface DomainTickerProps {
  items?: Testimonial[];
  className?: string;
  intervalMs?: number;
}

export const DomainTicker: React.FC<DomainTickerProps> = ({
  items = DEFAULT_TESTIMONIALS,
  className = '',
  intervalMs = 3600,
}) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (items.length < 2) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let timeoutId: number | undefined;
    let id = 0;
    let inView = true;

    const tick = () => {
      if (document.visibilityState !== 'visible' || !inView) return;
      setPhase('out');
      timeoutId = window.setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setPhase('in');
      }, 200);
    };

    const start = () => {
      if (id) return;
      id = window.setInterval(tick, intervalMs);
    };
    const stop = () => {
      if (id) window.clearInterval(id);
      id = 0;
      if (timeoutId) window.clearTimeout(timeoutId);
    };

    const onVis = () => {
      if (document.visibilityState === 'visible' && inView) start();
      else stop();
    };
    document.addEventListener('visibilitychange', onVis);

    const root =
      typeof document !== 'undefined'
        ? document.querySelector('[data-domain-ticker]')
        : null;
    let io: IntersectionObserver | null = null;
    if (root && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          inView = entries.some((e) => e.isIntersecting);
          if (inView && document.visibilityState === 'visible') start();
          else stop();
        },
        { threshold: 0.15 }
      );
      io.observe(root);
    } else {
      start();
    }

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
      io?.disconnect();
    };
  }, [items.length, intervalMs]);

  const isLight = mounted ? theme === 'light' : false;
  const current = items[index] ?? items[0];
  const longestQuote = useMemo(
    () => items.reduce((a, b) => (a.quote.length >= b.quote.length ? a : b)).quote,
    [items]
  );

  if (!current) return null;

  return (
    <div data-domain-ticker className={`flex justify-center w-full px-0 ${className}`}>
      {/* Mobile: full-width strip. Desktop: compact centered pill (not stretched) */}
      <div
        className={`group/ticker shine-border inline-flex items-center gap-2 sm:gap-2.5 rounded-xl sm:rounded-full pl-1.5 pr-2.5 sm:pl-3 sm:pr-4 py-1 sm:py-2 text-[10px] sm:text-[13px] w-full sm:w-auto sm:max-w-[min(100%,34rem)] ${
          isLight
            ? 'bg-white border border-slate-200 text-slate-600 shadow-sm shadow-slate-900/[0.04] sm:border-slate-300/80 sm:shadow-md sm:shadow-slate-900/[0.05]'
            : 'bg-white/[0.04] border border-white/10 text-white/60 sm:border-white/16 sm:bg-white/[0.05] sm:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_24px_rgba(0,0,0,0.25)]'
        }`}
      >
        <div
          className="flex -space-x-1.5 sm:-space-x-2 shrink-0"
          role="img"
          aria-label="People using Domain Discovery"
        >
          {HERO_AVATARS.map((avatar, h) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={avatar.src}
              src={avatar.src}
              alt={avatar.alt}
              width={28}
              height={28}
              tabIndex={0}
              className={`h-5 w-5 sm:h-7 sm:w-7 rounded-full object-cover object-top ring-2 transition-all duration-300 ease-out cursor-pointer
                grayscale contrast-[1.05] brightness-[0.9] opacity-75
                group-hover/ticker:opacity-90
                hover:grayscale-0 hover:brightness-110 hover:opacity-100 hover:scale-110 hover:z-20
                focus-visible:grayscale-0 focus-visible:brightness-110 focus-visible:opacity-100 focus-visible:scale-110 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-offset-1
                ${
                  isLight
                    ? 'ring-white bg-slate-200 shadow-sm hover:shadow-md focus-visible:ring-slate-400'
                    : 'ring-[#0a0a0a] bg-white/10 hover:ring-white/50 focus-visible:ring-white/40'
                }`}
              style={{ zIndex: HERO_AVATARS.length - h }}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          ))}
        </div>

        {/* Brand palette — desktop badge only */}
        <span
          className={`hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide border ${
            isLight
              ? 'bg-slate-100 text-slate-700 border-slate-200'
              : 'bg-white/[0.06] text-white/75 border-white/15'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${isLight ? 'bg-slate-500' : 'bg-white/70'}`}
          />
          Private
        </span>

        <div className="relative min-w-0 flex-1 sm:flex-none overflow-hidden">
          {/* Width stabilizer — longest quote, capped so pill stays compact on desktop */}
          <p
            className="invisible whitespace-nowrap text-[10px] sm:text-[13px] leading-snug max-w-none sm:max-w-[22rem] truncate"
            aria-hidden
          >
            “{longestQuote}” — Role
          </p>
          <div
            className={`absolute inset-0 flex items-center transition-opacity duration-200 ${
              phase === 'in' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <p className="truncate leading-snug text-[10px] sm:text-[13px] sm:max-w-[22rem]">
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                “{current.quote}”
              </span>
              <span style={{ color: isLight ? '#94a3b8' : 'rgba(255,255,255,0.4)' }}>
                {' '}
                — {current.role}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
