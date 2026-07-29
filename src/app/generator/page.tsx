'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { DomainGenerator } from '@/components/generator/DomainGenerator';
import { GeneratorContent } from '@/components/generator/GeneratorContent';
import { SeoGuidePack } from '@/components/seo/SeoGuidePack';
import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import { TOOL_GUIDE_PACKS } from '@/components/seo/toolGuidePacks';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';
import { AffiliateAdRail } from '@/components/ads/AffiliateAdRail';
import { useTheme } from '@/contexts/ThemeContext';

export default function GeneratorPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
    >
      <PageBackground variant="minimal" />

      <Navigation activeTool="generator" />

      <main className={PAGE_MAIN_CLASS}>
        <PageBreadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Domain Generator' },
          ]}
        />
        <SectionAmbient intensity="hero" className="w-full" contentClassName="relative z-[1]">
        {/* Hero — solid badge + center-clear ambient */}
        <div className="page-gutter pb-2 sm:pb-4">
          <div className="max-w-6xl mx-auto">
            <div className="mt-1 sm:mt-3 text-center max-w-2xl mx-auto">
              <div
                className={`relative isolate inline-flex items-center gap-1.5 overflow-hidden rounded-full px-2.5 py-1 mb-2.5 sm:mb-3.5 text-[10px] sm:text-[11px] font-semibold tracking-wide border ${
                  isLight
                    ? 'text-slate-600 border-slate-200 shadow-sm'
                    : 'text-white/60 border-white/10'
                }`}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
                />
                <span className="relative z-[1] inline-flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${isLight ? 'bg-slate-500' : 'bg-white/70'}`} />
                  3,000+ prefixes & suffixes · Up to 5,000 ideas · Live .com checks
                </span>
              </div>

              <h1 className="text-[1.65rem] sm:text-4xl md:text-[2.85rem] font-black tracking-tight leading-[1.08] mb-2 sm:mb-3">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: isLight
                      ? 'linear-gradient(to right, #0f172a, #1e293b, #475569)'
                      : 'linear-gradient(to right, #fff, #fff, rgba(255,255,255,0.55))',
                  }}
                >
                  Domain name generator
                </span>
              </h1>
              <p
                className="text-[13px] sm:text-[15px] leading-relaxed max-w-xl mx-auto"
                style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.55)' }}
              >
                Type a keyword like “agentic” or “buddy” — we pair it with thousands of top domain prefixes and
                suffixes (Lean Domain Search style), then check .com availability as results stream in.
              </p>
            </div>
          </div>
        </div>

        {/* Generator tool */}
        <section className="px-3.5 sm:px-6 pb-8 sm:pb-12" id="top">
          <div className="max-w-6xl mx-auto">
            <DomainGenerator onSelect={setSelectedDomain} />
          </div>
        </section>

        {/* Guides + FAQs */}
        <section className={`border-t ${isLight ? 'border-slate-200' : 'border-white/[0.06]'}`}>
          <GeneratorContent />
        </section>

        <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.generator} compact />
        <SeoGuidePack {...TOOL_GUIDE_PACKS.generator} />
        <div className="pt-2 pb-4">
          <AffiliateAdRail placement="generator" variant="auto" />
        </div>
        </SectionAmbient>
      </main>

      <Footer />
    </div>
  );
}
