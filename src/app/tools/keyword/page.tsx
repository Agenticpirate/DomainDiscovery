'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
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

      <main className="relative pt-14 sm:pt-20 px-3 sm:px-4 pb-10 sm:pb-14">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={[{ label: 'Tools', href: '/' }, { label: 'Keyword Domains' }]} />
        </div>

        <section className="max-w-3xl mx-auto text-center pt-3 sm:pt-5 pb-4 sm:pb-6">
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
            <p className="mt-2 text-[12px] font-mono font-semibold text-emerald-500">Selected: {selectedDomain}</p>
          )}
        </section>

        <section className="max-w-6xl mx-auto">
          <KeywordDomainFinder onSelect={setSelectedDomain} />
        </section>

        <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.keyword} compact />
      </main>

      <Footer />
    </div>
  );
}
