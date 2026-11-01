'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocale } from '@/components/i18n/LocaleProvider';

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
  { src: '/avatars/person-1.webp', alt: 'Privacy-conscious founder' },
  { src: '/avatars/person-2.webp', alt: 'Independent builder' },
  { src: '/avatars/person-3.webp', alt: 'Startup developer' },
  { src: '/avatars/person-4.jpg', alt: 'Product designer' },
  { src: '/avatars/person-5.jpg', alt: 'Agency founder' },
] as const;

interface DomainTickerProps {
  items?: Testimonial[];
  className?: string;
  intervalMs?: number;
}

export const DomainTicker: React.FC<DomainTickerProps> = ({
  items,
  className = '',
  intervalMs = 3600,
}) => {
  const { messages } = useLocale();
  const slides = items ?? messages.ticker;
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [facesColor, setFacesColor] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') return;
      const root = document.querySelector('[data-domain-ticker]');
      const inside = root && event.target instanceof Node && root.contains(event.target);
      setFacesColor(Boolean(inside));
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
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
        setIndex((i) => (i + 1) % slides.length);
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
  }, [slides.length, intervalMs]);

  const isLight = mounted ? theme === 'light' : false;
  const current = slides[index] ?? slides[0];
  if (!current) return null;
  const longest = slides.reduce((a, b) =>
    `${a.quote}${a.role}`.length >= `${b.quote}${b.role}`.length ? a : b
  );

  return (
    <div data-domain-ticker className={`flex justify-center w-full px-0 ${className}`}>
      <div
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') setFacesColor(true);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') setFacesColor(false);
        }}
        className={`group/ticker flex w-full max-w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-[12px] sm:w-fit sm:gap-2.5 sm:rounded-full sm:py-2 sm:pl-3 sm:pr-5 sm:text-[13px] ${
          isLight
            ? 'bg-white border border-[#cfcfcf] text-ds-body shadow-sm shadow-slate-900/[0.05]'
            : 'surface-premium border border-white/[0.08] text-[#a1a4a5]'
        }`}
      >
        <div
          className="flex -space-x-1.5 shrink-0"
          role="img"
          aria-label="People using Domain Discovery"
        >
          {HERO_AVATARS.map((avatar, h) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={avatar.src}
              src={avatar.src}
              alt={avatar.alt}
              width={24}
              height={24}
              className={`h-5 w-5 sm:h-7 sm:w-7 rounded-full object-cover object-top ring-2 transition-all duration-300 ease-out
                ${
                  facesColor
                    ? 'grayscale-0 contrast-100 brightness-100 opacity-100'
                    : 'grayscale contrast-[1.05] brightness-[0.9] opacity-80'
                }
                ${
                  isLight
                    ? 'ring-white bg-slate-200 shadow-sm hover:shadow-md focus-visible:ring-slate-400'
                    : 'ring-black bg-white/10 hover:ring-white/50 focus-visible:ring-white/40'
                }`}
              style={{ zIndex: HERO_AVATARS.length - h }}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              onError={(e) => {
                const el = e.currentTarget;
                if (el.src.endsWith('.webp')) {
                  el.src = el.src.replace(/\.webp$/i, '.jpg');
                }
              }}
            />
          ))}
        </div>

        <div className="relative flex min-w-0 flex-1 items-center gap-2 sm:block sm:min-h-0">
          <p className="invisible hidden leading-snug whitespace-nowrap sm:block" aria-hidden>
            “{longest.quote}” — {longest.role}
          </p>
          <p
            className={`min-w-0 flex-1 text-left text-[12px] leading-snug transition-opacity duration-200 sm:absolute sm:inset-0 sm:flex sm:items-center sm:justify-center sm:truncate sm:whitespace-nowrap sm:text-center sm:text-[13px] ${
              phase === 'in' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="font-medium text-ds-ink">“{current.quote}”</span>
            <span className="hidden text-ds-mute sm:inline"> — {current.role}</span>
          </p>
          <span className="flex shrink-0 gap-0.5 text-[10px] leading-none text-amber-300 sm:hidden" aria-label="5 stars">
            ★★★★★
          </span>
        </div>
      </div>
    </div>
  );
};
