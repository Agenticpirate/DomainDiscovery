'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useLeftGutterBox } from '@/components/ads/useSideRailFit';

const RAIL_W = 168;
const SPOTS = [1, 2, 3];
const X_PROFILE = 'https://x.com/Agenticpirate';

type IconProps = { className?: string };

function BrandIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V9.5L12 4l8 5.5V20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20v-6h6v6" />
    </svg>
  );
}

function InvestorIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path strokeLinecap="round" d="M4 12h16M12 4c2.2 2.4 3.3 5.1 3.3 8s-1.1 5.6-3.3 8c-2.2-2.4-3.3-5.1-3.3-8s1.1-5.6 3.3-8z" />
    </svg>
  );
}

const AUDIENCES = [
  {
    title: 'Brands',
    line: 'Meet founders while they choose a name.',
    Icon: BrandIcon,
    dark: { icon: 'text-[#7dfff6]', plate: 'bg-[#02fcef]/15' },
    light: { icon: 'text-[#0f766e]', plate: 'bg-[#ccfbf1]' },
  },
  {
    title: 'Domain investors',
    line: 'Place your names where buyers are looking.',
    Icon: InvestorIcon,
    dark: { icon: 'text-[#e4c4ff]', plate: 'bg-[#a02bfe]/20' },
    light: { icon: 'text-[#6d28d9]', plate: 'bg-[#ede9fe]' },
  },
];

/**
 * Three open ad spots. Brands and domain investors are separate buyers:
 * a brand promotes the brand, an investor promotes domains.
 */
export function AffiliateGutterSpots() {
  const box = useLeftGutterBox(RAIL_W);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!box || typeof document === 'undefined') return null;

  return createPortal(
    <aside
      data-dd-rail="left"
      className="fixed z-[90] overflow-hidden"
      style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
      aria-label="Open placement spots"
    >
      <div className="flex h-full flex-col gap-2">
        {SPOTS.map((spot) => (
          <a
            key={spot}
            href={X_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex min-h-[9.75rem] shrink-0 grow basis-0 flex-col overflow-hidden rounded-2xl border px-3 py-2.5 focus:outline-none focus-visible:ring-2 ${
              isLight
                ? 'border-[#d7dbdc] bg-white text-slate-900 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.45)] focus-visible:ring-slate-400'
                : 'border-white/10 bg-[#111111] text-white shadow-[0_16px_36px_-20px_rgba(0,0,0,0.8)] focus-visible:ring-white/40'
            }`}
          >
            <span className="flex shrink-0 items-center justify-between gap-2">
              <span
                className={`rounded-full px-1.5 py-px text-[8px] font-bold uppercase tracking-[0.12em] ${
                  isLight ? 'bg-slate-900 text-white' : 'bg-white/15 text-white/85'
                }`}
              >
                Ad
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${
                  isLight ? 'text-slate-500' : 'text-white/50'
                }`}
              >
                Open spot
              </span>
            </span>

            <span className="mt-2.5 flex grow flex-col justify-center gap-2">
              {AUDIENCES.map(({ title, line, Icon, dark, light }) => {
                const tone = isLight ? light : dark;
                return (
                  <span key={title} className="flex items-start gap-2">
                    <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md ${tone.plate}`}>
                      <Icon className={`h-3.5 w-3.5 ${tone.icon}`} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold leading-tight tracking-[-0.01em]">
                        {title}
                      </span>
                      <span
                        className={`mt-0.5 block text-[11px] leading-snug ${
                          isLight ? 'text-slate-500' : 'text-white/55'
                        }`}
                      >
                        {line}
                      </span>
                    </span>
                  </span>
                );
              })}
            </span>

            <span
              className={`mt-2.5 shrink-0 text-[20px] font-semibold leading-none tracking-[-0.03em] ${
                isLight ? 'text-[#b45309]' : 'text-[#ffb52b]'
              }`}
            >
              $99/mo
            </span>
          </a>
        ))}
      </div>
    </aside>,
    document.documentElement
  );
}
