'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { DomainExtensionsView } from '@/components/domain/DomainExtensionsView';
import { ExtensionsGuideContent } from '@/components/domain/ExtensionsGuideContent';
import { SeoGuidePack } from '@/components/seo/SeoGuidePack';
import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import { TOOL_GUIDE_PACKS } from '@/components/seo/toolGuidePacks';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';
import { useTheme } from '@/contexts/ThemeContext';

export default function DomainExtensionsPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
    >
      <PageBackground variant="hero" />

      <Navigation activeTool="extensions" />

      <main className="relative pt-[3.5rem] sm:pt-[4.5rem]">
        {/* Hero + ALL extensions search */}
        <section className="px-3.5 sm:px-6 pt-3 sm:pt-8 pb-2 sm:pb-4">
          <div className="max-w-6xl mx-auto">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Domain Extensions' },
              ]}
            />

            <div className="mt-2 sm:mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6 mb-5 sm:mb-6">
              <div className="max-w-2xl">
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mb-2.5 sm:mb-3.5 text-[10px] sm:text-[11px] font-semibold tracking-wide border ${
                    isLight
                      ? 'bg-white text-slate-600 border-slate-200 shadow-sm'
                      : 'bg-white/[0.04] text-white/60 border-white/10'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isLight ? 'bg-slate-500' : 'bg-white/70'
                    }`}
                  />
                  Search all 1,000+ TLDs · Live availability
                </div>

                <h1 className="text-[1.7rem] sm:text-4xl md:text-[2.95rem] font-black tracking-tight leading-[1.08] mb-2 sm:mb-3">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: isLight
                        ? 'linear-gradient(to right, #0f172a, #1e293b, #475569)'
                        : 'linear-gradient(to right, #fff, #fff, rgba(255,255,255,0.55))',
                    }}
                  >
                    Domain extensions list
                  </span>
                </h1>

                <p
                  className="text-[13px] sm:text-[16px] leading-relaxed max-w-xl mb-2"
                  style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.55)' }}
                >
                  Search <strong className="font-bold" style={{ color: 'var(--text-primary)' }}>every</strong> domain
                  extension and check availability instantly. Compare prices, weigh renewals, and find the best domain
                  ending for your website — as you type.
                </p>
                <p className="text-[12px] sm:text-[13px] leading-relaxed max-w-xl" style={{ color: 'var(--text-tertiary)' }}>
                  Type a name below to check all 1,001 extensions at once. Free · Private · No account required.
                </p>

                <div className="flex flex-wrap gap-2 mt-3.5">
                  <a
                    href="#extensions-search"
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold border ${
                      isLight
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-black border-white'
                    }`}
                  >
                    Search all TLDs
                  </a>
                  <a
                    href="#how-to-choose"
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold border ${
                      isLight
                        ? 'bg-white text-slate-700 border-slate-200'
                        : 'bg-white/[0.04] text-white/75 border-white/15'
                    }`}
                  >
                    How to choose
                  </a>
                  <a
                    href="#extension-faqs"
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold border ${
                      isLight
                        ? 'bg-white text-slate-700 border-slate-200'
                        : 'bg-white/[0.04] text-white/75 border-white/15'
                    }`}
                  >
                    FAQs
                  </a>
                  <a
                    href="#extensions-catalog"
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold border ${
                      isLight
                        ? 'bg-white text-slate-700 border-slate-200'
                        : 'bg-white/[0.04] text-white/75 border-white/15'
                    }`}
                  >
                    Full catalog
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 shrink-0">
                {[
                  { value: '1,001', label: 'All TLDs' },
                  { value: 'Real-time', label: 'Availability' },
                  { value: 'Private', label: 'By default' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`shine-border rounded-xl px-3 py-2.5 sm:px-3.5 sm:py-3 text-center min-w-[5.25rem] border ${
                      isLight
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-white/[0.03] border-white/10'
                    }`}
                  >
                    <div className="text-[13px] sm:text-sm font-black tracking-tight">{s.value}</div>
                    <div
                      className="text-[9px] sm:text-[10px] font-medium mt-0.5 uppercase tracking-wide"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search all extensions lives in the hero */}
            <DomainExtensionsView
              guideSlot={
                <div id="how-to-choose" className="scroll-mt-24">
                  <ExtensionsGuideContent />
                </div>
              }
            />
          </div>
        </section>

        <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.extensions} compact />
        <SeoGuidePack {...TOOL_GUIDE_PACKS.extensions} />
      </main>

      <Footer />
    </div>
  );
}
