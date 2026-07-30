'use client';

import React from 'react';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
  extensionCount: number;
  generatedAt: string;
};

/** Theme-aware hero + stats for the server-rendered compare page. */
export function ComparePageClientChrome({ extensionCount, generatedAt }: Props) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const panelGrid = isLight ? 'border-slate-200 bg-slate-200' : 'border-white/[0.1] bg-white/[0.08]';
  const panelCell = isLight ? 'bg-white' : 'bg-[#0c0c0e]';

  return (
    <>
      <SectionAmbient intensity="hero" contentClassName="page-gutter pt-1 sm:pt-3 pb-3 sm:pb-8">
        <div className="max-w-4xl mx-auto text-center px-0.5">
          <div className="mb-2 sm:mb-3 flex flex-wrap items-center justify-center gap-1 sm:gap-2">
            {['Regular prices', '10 registrars', `${extensionCount.toLocaleString()}+ TLDs`].map(
              (label) => (
                <span
                  key={label}
                  className={`rounded-full border px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold ${
                    isLight
                      ? 'border-slate-200 bg-white text-slate-600'
                      : 'border-white/10 bg-[#0a0a0c] text-white/55'
                  }`}
                >
                  {label}
                </span>
              )
            )}
          </div>

          <h1
            className={`text-[1.55rem] sm:text-4xl md:text-5xl font-black tracking-tight mb-1 sm:mb-2 leading-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(to right, var(--gradient-hero-from), var(--gradient-hero-from), var(--gradient-hero-to))',
              }}
            >
              Domain price comparison
            </span>
          </h1>
          <p
            className={`mx-auto max-w-2xl text-[11.5px] sm:text-[15px] leading-snug sm:leading-relaxed ${
              isLight ? 'text-slate-500' : 'text-white/45'
            }`}
          >
            <span className="sm:hidden">Reg · renew · transfer across top registrars. No promo codes.</span>
            <span className="hidden sm:inline">
              Compare regular registration, renewal, and transfer prices for popular extensions across the
              registrars people actually use — no first-year promo codes.
            </span>
          </p>
        </div>
      </SectionAmbient>

      <section className="max-w-6xl mx-auto mb-3 sm:mb-6">
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl sm:rounded-2xl border overflow-hidden ${panelGrid}`}>
          {[
            { value: String(extensionCount), label: 'Popular TLDs' },
            { value: '10', label: 'Registrars' },
            { value: 'Reg · Renew · Xfer', label: 'Price types' },
            {
              value: generatedAt.slice(5).replace('-', '/'),
              label: 'Last refreshed',
            },
          ].map((s) => (
            <div key={s.label} className={`px-2 py-2.5 sm:px-3 sm:py-4 text-center ${panelCell}`}>
              <div className="text-[13px] sm:text-xl font-black tracking-tight tabular-nums">{s.value}</div>
              <div
                className="text-[8px] sm:text-[10px] font-medium mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
