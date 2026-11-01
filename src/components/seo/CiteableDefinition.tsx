import React from 'react';
import Link from 'next/link';
import type { PageDefinition } from '@/lib/seoSiteFacts';

type Props = {
  definition: PageDefinition;
  className?: string;
  /** Compact for tool pages under interactive UI */
  compact?: boolean;
  eyebrow?: string;
};

/**
 * Server-rendered extractable definition block for AEO/GEO (AI Overviews, assistants).
 * No client JS — AI crawlers that skip JavaScript still see the text in HTML.
 * Uses CSS variables so light/dark themes both stay readable.
 */
export function CiteableDefinition({ definition, className = '', compact = false, eyebrow = 'Definition' }: Props) {
  return (
    <section
      className={`px-4 sm:px-6 ${compact ? 'py-5 sm:py-6' : 'py-6 sm:py-8'} ${className}`}
      aria-labelledby={`cite-def-${definition.key}`}
      data-aeo-definition={definition.key}
    >
      <div
        className="surface-premium relative isolate overflow-hidden mx-auto max-w-3xl rounded-2xl border p-4 sm:p-5 border-white/[0.08] [.light_&]:border-[#d7dbdc]"
      >
        <div className="relative z-[1]">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5"
            style={{ color: 'var(--text-muted, rgba(148,163,184,0.8))' }}
          >
            {eyebrow}
          </p>
          <h2
            id={`cite-def-${definition.key}`}
            className="text-base sm:text-lg font-bold tracking-tight mb-2"
            style={{ color: 'var(--text-primary, #f4f5f5)' }}
          >
            {definition.question}
          </h2>
          <p
            className="text-[13px] sm:text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary, rgba(255,255,255,0.65))' }}
          >
            {definition.answer}
          </p>
          {definition.learnHref && definition.learnLabel && (
            <Link
              href={definition.learnHref}
              className="inline-flex mt-3 text-xs sm:text-sm font-semibold underline-offset-2 hover:underline"
              style={{ color: 'var(--text-primary, #d7dbdc)' }}
            >
              {definition.learnLabel} →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
