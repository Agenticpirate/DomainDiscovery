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
    <div className="min-h-screen">
      <PageBackground variant="default" />
      <Navigation activeTool="keyword" />

      <main className={`${PAGE_MAIN_CLASS} pb-10 sm:pb-14`}>
        <PageBreadcrumb items={[{ label: 'Tools', href: '/' }, { label: 'Keyword Domains' }]} />

        <SectionAmbient intensity="page" contentClassName="page-gutter pt-2 sm:pt-4 pb-4 sm:pb-6">
          <div className="max-w-3xl mx-auto text-center">
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Keyword domains
          </h1>
          <p className={`text-sm sm:text-[15px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
            Expand a keyword with thousands of prefixes & suffixes. Pick your registrar, then register available names.
          </p>
          {selectedDomain && (
            <p className={`mt-2 text-[12px] font-mono font-semibold ${isLight ? 'text-emerald-600' : 'text-emerald-500'}`}>
              Selected: {selectedDomain}
            </p>
          )}
          </div>
        </SectionAmbient>

        <section className="max-w-6xl mx-auto">
          <KeywordDomainFinder onSelect={setSelectedDomain} />
        </section>

        <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.keyword} compact />
      </main>

      <Footer />
    </div>
  );
}
