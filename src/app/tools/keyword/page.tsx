'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { KeywordDomainFinder } from '@/components/domain/KeywordDomainFinder';
import { useTheme } from '@/contexts/ThemeContext';

export default function KeywordPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />
      
      <Navigation activeTool="keyword" />

      {/* Main Content */}
      <main className="relative pt-[4.75rem] sm:pt-24">
        {/* Hero Section */}
        <section className="px-3 sm:px-6 pb-3 sm:pb-7">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb items={[
              { label: 'Tools', href: '/' },
              { label: 'Keyword Domains' }
            ]} />
          </div>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-5xl md:text-[3.9rem] font-black tracking-tight mb-1.5 sm:mb-3">
              <span className={`bg-gradient-to-r ${isLight ? 'from-slate-900 via-slate-800 to-slate-600' : 'from-white via-white to-white/60'} bg-clip-text text-transparent`}>
                Keyword Domains
              </span>
            </h1>
            <p className={`text-xs sm:text-base ${isLight ? 'text-slate-500' : 'text-white/50'} max-w-2xl mx-auto mb-3 sm:mb-6`}>
              Generate 1,000+ domain name ideas by combining your keywords with popular prefixes and suffixes. Inspired by Lean Domain Search.
            </p>
          </div>
        </section>

        {/* Keyword Finder */}
        <section className="px-3 sm:px-6 pb-12 sm:pb-14">
          <div className="max-w-5xl mx-auto">
            <KeywordDomainFinder onSelect={setSelectedDomain} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
