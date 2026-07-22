'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

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
 * Crawlable AEO/GEO pack: answer-first Q&A below interactive tools.
 * Keeps mobile spacing tight; desktop slightly airier.
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

  return (
    <section
      className={`px-4 sm:px-6 py-8 sm:py-12 border-t ${
        isLight ? 'border-slate-200/80' : 'border-white/[0.06]'
      } ${className}`}
      aria-labelledby="seo-guide-pack-title"
    >
      <div className="mx-auto max-w-3xl">
        <p
          className={`text-[10px] font-bold uppercase tracking-[0.16em] mb-2 ${
            isLight ? 'text-slate-400' : 'text-white/35'
          }`}
        >
          {eyebrow}
        </p>
        <h2
          id="seo-guide-pack-title"
          className={`text-xl sm:text-2xl font-black tracking-tight mb-2 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          {title}
        </h2>
        {intro && (
          <p
            className={`text-sm leading-relaxed mb-5 sm:mb-6 max-w-2xl ${
              isLight ? 'text-slate-500' : 'text-white/50'
            }`}
          >
            {intro}
          </p>
        )}

        <div className="space-y-3 sm:space-y-3.5">
          {items.map((item) => (
            <article
              key={item.question}
              className={`rounded-2xl border p-4 sm:p-5 ${
                isLight
                  ? 'border-slate-200 bg-white shadow-sm'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <h3
                className={`text-[15px] sm:text-base font-bold leading-snug mb-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {item.question}
              </h3>
              <p
                className={`text-[13px] sm:text-[14px] leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-white/60'
                }`}
              >
                {item.answer}
              </p>
              {item.detail && (
                <p
                  className={`mt-2 text-[13px] sm:text-[14px] leading-relaxed ${
                    isLight ? 'text-slate-500' : 'text-white/45'
                  }`}
                >
                  {item.detail}
                </p>
              )}
            </article>
          ))}
        </div>

        {(learnMore || related.length > 0) && (
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2">
            {learnMore && (
              <Link
                href={learnMore.href}
                className={`inline-flex items-center rounded-full px-3.5 py-2 text-xs sm:text-sm font-bold transition ${
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
                className={`inline-flex items-center rounded-full border px-3 py-2 text-xs sm:text-sm font-semibold transition ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    : 'border-white/15 text-white/75 hover:border-white/30'
                }`}
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
