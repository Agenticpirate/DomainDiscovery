'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { PremiumFaqGrid } from '@/components/sections/PremiumFaqGrid';

export type SeoGuideItem = {
  question: string;
  answer: string;
  /** Optional second paragraph / how-to */
  detail?: string;
};

export type SeoGuideCta = {
  href: string;
  label: string;
};

export type SeoGuidePackProps = {
  /** Small eyebrow label */
  eyebrow?: string;
  /** Section H2 */
  title: string;
  /** Short intro under title */
  intro?: string;
  items: SeoGuideItem[];
  /** Primary deep-dive article */
  learnMore?: SeoGuideCta;
  /** Extra related links */
  related?: SeoGuideCta[];
  className?: string;
};

/**
 * Crawlable AEO/GEO pack: homepage FAQ design (PremiumFaqGrid) below tools.
 * Opaque plates so ambient dots never show through titles, cards, or chips.
 */
export function SeoGuidePack({
  eyebrow = 'People also ask',
  title,
  intro,
  items,
  learnMore,
  related = [],
  className = '',
}: SeoGuidePackProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;
  const chipSolid = isLight ? '#ffffff' : '#0a0a0c';

  const faqId = `seo-faqs-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)}`;

  return (
    <section
      className={`px-4 sm:px-6 py-8 sm:py-12 border-t ${
        isLight ? 'border-slate-200/80' : 'border-white/[0.06]'
      } ${className}`}
      aria-labelledby="seo-guide-pack-title"
    >
      <div className="mx-auto max-w-4xl">
        <div className="relative isolate mb-2 flex justify-center">
          <span
            className={`relative overflow-hidden rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
              isLight ? 'text-slate-400' : 'text-white/35'
            }`}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background: isLight
                  ? 'radial-gradient(ellipse 120% 100% at 50% 50%, #f8fafc 0%, #f8fafc 60%, transparent 100%)'
                  : 'radial-gradient(ellipse 120% 100% at 50% 50%, #050505 0%, #050505 60%, transparent 100%)',
              }}
            />
            <span className="relative z-[1]">{eyebrow}</span>
          </span>
        </div>

        <PremiumFaqGrid
          id={faqId}
          headingId="seo-guide-pack-title"
          title={title}
          subtitle={intro}
          items={items}
          maxWidthClass="max-w-4xl"
          className="!mb-0 !px-0 !py-0"
        />

        {(learnMore || related.length > 0) && (
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-2">
            {learnMore && (
              <Link
                href={learnMore.href}
                className={`relative isolate overflow-hidden inline-flex items-center rounded-full px-3.5 py-2 text-xs sm:text-sm font-bold transition ${
                  isLight
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-white text-black hover:bg-white/90'
                }`}
              >
                {learnMore.label}
              </Link>
            )}
            {related.map((r) => (
              <Link
                key={r.href + r.label}
                href={r.href}
                className={`relative isolate overflow-hidden inline-flex items-center rounded-full border px-3 py-2 text-xs sm:text-sm font-semibold transition ${
                  isLight
                    ? 'border-slate-200 text-slate-700 hover:border-slate-300'
                    : 'border-white/15 text-white/75 hover:border-white/30'
                }`}
                style={{ backgroundColor: chipSolid }}
              >
                {r.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
