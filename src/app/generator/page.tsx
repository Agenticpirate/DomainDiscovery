'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { DomainGenerator } from '@/components/generator/DomainGenerator';
import { GeneratorContent } from '@/components/generator/GeneratorContent';
import { LocalizedGuidePack } from '@/components/i18n/LocalizedGuidePack';
import { LocalizedDefinition } from '@/components/i18n/LocalizedDefinition';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { pageHeading } from '@/lib/i18n/locales';
import { useTheme } from '@/contexts/ThemeContext';

export default function GeneratorPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const { locale, messages, href } = useLocale();
  const localized = locale !== 'en';
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;
  const solid = isLight ? '#ffffff' : '#0a0a0a';
  const pageSolid = isLight ? '#f4f5f5' : '#000000';

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
            { label: messages.nav.home, href: href('/') },
            { label: messages.crumbs.generator },
          ]}
        />

        {/* Hero only — soft ambient; solid badge so dots never paint through */}
        <SectionAmbient intensity="soft" className="w-full" contentClassName="relative z-[1]">
          <div className="page-gutter pb-2 sm:pb-4">
            <div className="max-w-6xl mx-auto">
              <div className="mt-1 sm:mt-3 text-center max-w-2xl mx-auto">
                <div
                  className={`relative isolate inline-flex items-center gap-1.5 overflow-hidden rounded-full px-2.5 py-1 mb-2.5 sm:mb-3.5 text-[10px] sm:text-[11px] font-semibold tracking-wide border ${
                    isLight
                      ? 'text-slate-600 border-slate-200 shadow-sm'
                      : 'text-white/65 border-white/12'
                  }`}
                  style={{ backgroundColor: solid }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{ backgroundColor: solid }}
                  />
                  <span className="relative z-[1] inline-flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        isLight ? 'bg-slate-500' : 'bg-white/70'
                      }`}
                    />
                    <span className="sm:hidden">5,500+ words · Ideas appear instantly</span>
                    <span className="hidden sm:inline">
                      5,500+ ranked words · Ideas appear instantly · Live checks on the names in view
                    </span>
                  </span>
                </div>

                <h1 className="text-[1.65rem] sm:text-4xl md:text-[2.85rem] font-black tracking-tight leading-[1.08] mb-2 sm:mb-3">
                  <span
                    className="block bg-clip-text text-transparent"
                    style={{
                      backgroundImage: isLight
                        ? 'linear-gradient(to right, #141517, #2a2f31, #52595b)'
                        : 'linear-gradient(to right, #fff, #fff, rgba(255,255,255,0.55))',
                    }}
                  >
                    {localized ? pageHeading(messages.pages.generator.title) : 'Domain name generator'}
                  </span>
                </h1>
                <p
                  className="text-[13px] sm:text-[15px] leading-relaxed max-w-xl mx-auto"
                  style={{ color: isLight ? '#52595b' : 'rgba(255,255,255,0.55)' }}
                >
                  {localized ? (
                    messages.pages.generator.description
                  ) : (
                    <>
                      <span className="sm:hidden">
                        Type a keyword — names from 5,500+ words show up immediately.
                      </span>
                      <span className="hidden sm:inline">
                        Type a keyword like “buddy” — we join it with 5,500+ ranked words on either side
                        and show the names immediately. Availability updates for the rows you’re looking at.
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </SectionAmbient>

        {/* Tool + guides — solid page plate, no ambient bubbles (homepage pattern) */}
        <div className="relative z-[1] w-full" style={{ backgroundColor: pageSolid }}>
          <section className="px-3.5 sm:px-6 pb-8 sm:pb-12" id="top">
            <div className="max-w-6xl mx-auto">
              <DomainGenerator onSelect={setSelectedDomain} />
            </div>
          </section>

          {locale === 'en' && (
            <section className={`border-t ${isLight ? 'border-slate-200' : 'border-white/[0.06]'}`}>
              <GeneratorContent />
            </section>
          )}

          <LocalizedDefinition id="generator" compact />
          <LocalizedGuidePack pack="generator" />
          {/* Footer affiliate banner only — no stacked inline ad */}
        </div>
      </main>

      <Footer />
    </div>
  );
}
