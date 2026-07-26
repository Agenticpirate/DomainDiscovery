'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import type { PageDefinition } from '@/lib/seoSiteFacts';

type Props = {
  definition: PageDefinition;
  className?: string;
  /** Compact for tool pages under interactive UI */
  compact?: boolean;
};

/**
 * One extractable definition block for AEO/GEO (AI Overviews, assistants).
 * Answer-first, crawlable HTML — no accordion hide.
 */
export function CiteableDefinition({ definition, className = '', compact = false }: Props) {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;

  return (
    <section
      className={`px-4 sm:px-6 ${compact ? 'py-5 sm:py-6' : 'py-6 sm:py-8'} ${className}`}
      aria-labelledby={`cite-def-${definition.key}`}
      data-aeo-definition={definition.key}
    >
      <div
        className={`mx-auto max-w-3xl rounded-2xl border p-4 sm:p-5 ${
          isLight
            ? 'border-slate-200 bg-white shadow-sm'
            : 'border-white/10 bg-[#0c0c0e]'
        }`}
      >
        <p
          className={`text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5 ${
            isLight ? 'text-slate-400' : 'text-white/35'
          }`}
        >
          Definition
        </p>
        <h2
          id={`cite-def-${definition.key}`}
          className={`text-base sm:text-lg font-bold tracking-tight mb-2 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          {definition.question}
        </h2>
        <p
          className={`text-[13px] sm:text-sm leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-white/60'
          }`}
        >
          {definition.answer}
        </p>
        {definition.learnHref && definition.learnLabel && (
          <Link
            href={definition.learnHref}
            className={`inline-flex mt-3 text-xs sm:text-sm font-semibold underline-offset-2 hover:underline ${
              isLight ? 'text-slate-800' : 'text-white/80'
            }`}
          >
            {definition.learnLabel} →
          </Link>
        )}
      </div>
    </section>
  );
}
