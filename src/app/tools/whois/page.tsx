'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { WHOISLookup } from '@/components/domain/WHOISLookup';
import { SeoGuidePack } from '@/components/seo/SeoGuidePack';
import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import { TOOL_GUIDE_PACKS } from '@/components/seo/toolGuidePacks';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';
import { useTheme } from '@/contexts/ThemeContext';

function WhoisTool() {
  const searchParams = useSearchParams();
  const domainParam = searchParams.get('domain') || undefined;
  return <WHOISLookup domain={domainParam} />;
}

export default function WhoisPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />

      <Navigation activeTool="whois" />

      <main className={PAGE_MAIN_CLASS}>
        <PageBreadcrumb
          items={[
            { label: 'Tools', href: '/' },
            { label: 'WHOIS Lookup' },
          ]}
        />
        <SectionAmbient intensity="hero" contentClassName="page-gutter pb-5 sm:pb-7">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl md:text-[3.9rem] font-black tracking-tight mb-3">
              <span
                className={`bg-gradient-to-r ${
                  isLight
                    ? 'from-indigo-900 via-indigo-600 to-sky-500'
                    : 'from-white via-white to-white/60'
                } bg-clip-text text-transparent`}
              >
                WHOIS Lookup
              </span>
            </h1>
            <p
              className={`text-sm sm:text-base ${
                isLight ? 'text-slate-500' : 'text-white/50'
              } max-w-2xl mx-auto mb-5 sm:mb-6`}
            >
              Instant registry RDAP data — status, registrar, dates, and name servers. Share results as a sleek template
              card across social and messaging.
            </p>
          </div>
        </SectionAmbient>

        <section className="px-4 sm:px-6 pb-12 sm:pb-14">
          <div className="max-w-3xl mx-auto">
            <Suspense
              fallback={
                <div
                  className={`rounded-2xl border p-6 text-sm ${
                    isLight ? 'border-slate-200 bg-white text-slate-500' : 'border-white/10 bg-[#0c0c0e] text-white/50'
                  }`}
                >
                  Loading WHOIS…
                </div>
              }
            >
              <WhoisTool />
            </Suspense>
          </div>
        </section>

        <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.whois} compact />
        <SeoGuidePack {...TOOL_GUIDE_PACKS.whois} />
      </main>

      <Footer />
    </div>
  );
}
