'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { KeywordDomainFinder } from '@/components/domain/KeywordDomainFinder';
import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';
import { useTheme } from '@/contexts/ThemeContext';

export default function KeywordPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)' }}>
      <PageBackground variant="minimal" />
      <Navigation activeTool="keyword" />

      <main className={`${PAGE_MAIN_CLASS} pb-10 sm:pb-14`}>
        <PageBreadcrumb items={[{ label: 'Tools', href: '/' }, { label: 'Keyword Domains' }]} />

        {/* Soft ambient — no heavy hero bubble field behind the form */}
        <SectionAmbient intensity="soft" contentClassName="page-gutter pt-1 sm:pt-2 pb-3 sm:pb-4">
          <div className="max-w-3xl mx-auto text-center mb-3 sm:mb-4">
            <h1
              className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-1 sm:mb-1.5 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Keyword domains
            </h1>
            <p className={`text-[13px] sm:text-[14px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
              Expand a keyword with thousands of prefixes &amp; suffixes — then check availability live.
            </p>
            {selectedDomain && (
              <p
                className={`mt-1.5 text-[12px] font-mono font-semibold ${
                  isLight ? 'text-emerald-600' : 'text-emerald-400'
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
