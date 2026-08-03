'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

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

function formatStat(n: number, suffix: string, decimals: number) {
  if (suffix === 'M+') return `${Math.round(n)}M+`;
  if (suffix === 'K+') return `${Math.round(n)}K+`;
  if (suffix === '+') return `${Math.round(n).toLocaleString()}+`;
  if (suffix === '%') return `${n.toFixed(decimals)}%`;
  return `${n}${suffix}`;
}

export const StatsBar: React.FC = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [counts, setCounts] = useState(STATS.map(() => 0));
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
    const duration = 1100;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      setCounts(STATS.map((s) => s.target * e));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setCounts(STATS.map((s) => s.target));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  return (
    <div
      ref={ref}
      className={`shine-border grid grid-cols-4 gap-0 rounded-xl sm:rounded-2xl overflow-hidden relative ${
        isLight
          ? 'bg-white border border-[#cfcfcf] shadow-sm shadow-slate-900/[0.05]'
          : 'bg-gradient-to-b from-white/[0.05] to-white/[0.015] border border-white/10'
      }`}
    >
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className={`shine-stat-cell group relative text-center px-0.5 py-1.5 sm:py-4 sm:px-2 transition-colors duration-300 ${
            i > 0 ? (isLight ? 'border-l border-[#e0e0e0]' : 'border-l border-white/[0.06]') : ''
          } ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-white/[0.03]'}`}
          style={{
            animation: visible ? `statPop 0.5s ease-out ${i * 0.08}s both` : undefined,
          }}
        >
          <div
            className={`text-[0.8rem] sm:text-2xl font-black leading-none tracking-tight tabular-nums transition-transform duration-300 group-hover:scale-[1.04] ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            {formatStat(counts[i], stat.suffix, stat.decimals ?? 0)}
          </div>
          <div
            className="text-[7px] sm:text-[11px] font-medium mt-0.5 sm:mt-1 tracking-wide uppercase"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};
