'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { KeywordDomainFinder } from '@/components/domain/KeywordDomainFinder';
import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';
import { useTheme } from '@/contexts/ThemeContext';
import { ds } from '@/lib/ds';

export default function KeywordPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;

  return (
    <div className={`min-h-screen overflow-x-hidden ${ds.page}`}>
      <PageBackground variant="minimal" />
      <Navigation activeTool="keyword" />

      <main className={`${PAGE_MAIN_CLASS} pb-10 sm:pb-14`}>
        <PageBreadcrumb items={[{ label: 'Tools', href: '/' }, { label: 'Keyword Domains' }]} />

        <SectionAmbient intensity="soft" contentClassName="page-gutter pt-1 sm:pt-2 pb-3 sm:pb-5">
          <div className="max-w-3xl mx-auto text-center mb-4 sm:mb-5">
            <div className={`${ds.badgeInk} relative isolate mb-2.5 sm:mb-3.5`}>
              <span className="relative z-[1] inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <span className="sm:hidden">Prefixes · suffixes · live checks</span>
                <span className="hidden sm:inline">
                  Thousands of prefixes &amp; suffixes · Live availability
                </span>
              </span>
            </div>

            <h1 className="text-[1.65rem] sm:text-3xl md:text-4xl font-semibold tracking-tight leading-[1.08] mb-2 sm:mb-2.5">
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage: isLight
                    ? 'linear-gradient(to right, #171717, #4d4d4d, #0070f3)'
                    : 'linear-gradient(to right, #fff, #fff, rgba(255,255,255,0.55))',
                }}
              >
                Keyword domains
              </span>
            </h1>
            <p className={`text-[13px] sm:text-[15px] leading-relaxed max-w-xl mx-auto ${ds.body}`}>
              Expand any keyword with prefixes &amp; suffixes, filter by position, then check
              availability live.
            </p>
            {selectedDomain && (
              <p
                className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-mono font-semibold ${
                  isLight
                    ? 'bg-ds-success-soft text-ds-success border-emerald-200/80'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                }`}
              >
                Selected: {selectedDomain}
              </p>
            )}
          </div>

          <section className="max-w-6xl mx-auto relative z-[1]">
            <KeywordDomainFinder onSelect={setSelectedDomain} />
          </section>
        </SectionAmbient>

        <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.keyword} compact />
      </main>

      <Footer />
    </div>
  );
}
