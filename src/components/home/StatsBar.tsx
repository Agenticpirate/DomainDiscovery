'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { getLocaleMeta } from '@/lib/i18n/locales';

type Stat = {
  value: string;
  label: string;
  target: number;
  suffix: string;
  decimals?: number;
};

const STATS: Stat[] = [
  { value: '20M+', label: 'Searches', target: 20, suffix: 'M+', decimals: 0 },
  { value: '50K+', label: 'Users', target: 50, suffix: 'K+', decimals: 0 },
  { value: '1,600+', label: 'TLDs', target: 1600, suffix: '+', decimals: 0 },
  { value: '99.9%', label: 'Uptime', target: 99.9, suffix: '%', decimals: 1 },
];

const STAT_ICONS = [
  <path key="search" strokeLinecap="round" d="M11 6a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM15.5 15.5 19 19" />,
  <path key="users" strokeLinecap="round" d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3.5 18.5c.6-2.2 2.4-3.5 4.5-3.5s3.9 1.3 4.5 3.5M16 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM16 15c1.7 0 3.2.9 3.8 2.5" />,
  <><circle key="g" cx="12" cy="12" r="8" /><path key="p" strokeLinecap="round" d="M4 12h16M12 4c2 2.2 3 5 3 8s-1 5.8-3 8c-2-2.2-3-5-3-8s1-5.8 3-8z" /></>,
  <path key="shield" strokeLinejoin="round" d="M12 3.5 19 6.5v5.2c0 4-2.6 6.8-7 8.3-4.4-1.5-7-4.3-7-8.3V6.5L12 3.5z" />,
];

function formatStat(n: number, suffix: string, decimals: number, locale: string) {
  if (suffix === 'M+') return `${Math.round(n)}M+`;
  if (suffix === 'K+') return `${Math.round(n)}K+`;
  if (suffix === '+') return `${Math.round(n).toLocaleString(locale)}+`;
  if (suffix === '%') return `${n.toFixed(decimals)}%`;
  return `${n}${suffix}`;
}

export const StatsBar: React.FC = () => {
  const { locale, messages } = useLocale();
  const numberLocale = getLocaleMeta(locale).htmlLang;
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [counts, setCounts] = useState(() => STATS.map((stat) => stat.target));
  const ref = useRef<HTMLDivElement>(null);
  const isLight = mounted ? theme === 'light' : false;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setCounts(STATS.map((s) => s.target));
      return;
    }
    const duration = 700;
    const start = performance.now();
    const origin = 0.94;
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      setCounts(STATS.map((s) => s.target * (origin + (1 - origin) * e)));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setCounts(STATS.map((s) => s.target));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  return (
    <div
      ref={ref}
      className={`grid grid-cols-2 sm:grid-cols-4 gap-0 rounded-2xl overflow-hidden border ${
        isLight ? 'bg-white border-[#d7dbdc]' : 'surface-premium border-white/[0.08]'
      }`}
    >
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className={`flex items-center justify-center gap-2 px-2 py-2 text-left sm:block sm:gap-0 sm:px-2 sm:py-4 sm:text-center ${
            i % 2 === 1 ? (isLight ? 'border-l border-[#d7dbdc]' : 'border-l border-white/[0.08]') : ''
          } ${
            i >= 2 ? (isLight ? 'border-t border-[#d7dbdc] sm:border-t-0' : 'border-t border-white/[0.08] sm:border-t-0') : ''
          } ${
            i > 0 ? (isLight ? 'sm:border-l sm:border-[#d7dbdc]' : 'sm:border-l sm:border-white/[0.08]') : ''
          }`}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border sm:hidden ${
              isLight ? 'border-[#d7dbdc] bg-[#f4f5f5] text-[#141517]' : 'border-white/[0.08] bg-[#111111] text-white/80'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-3.5 w-3.5" aria-hidden>
              {STAT_ICONS[i]}
            </svg>
          </span>
          <div className="min-w-0">
            <div
              className={`text-[1.05rem] sm:text-2xl font-semibold leading-none tracking-tight tabular-nums ${
                isLight ? 'text-[#0a0a0a]' : 'text-[#f0f0f0]'
              }`}
            >
              {formatStat(counts[i], stat.suffix, stat.decimals ?? 0, numberLocale)}
            </div>
            <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-ds-mute sm:mt-1.5 sm:text-[11px]">
              {messages.stats[i]}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
