'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { WHOISLookup } from '@/components/domain/WHOISLookup';
import { LocalizedGuidePack } from '@/components/i18n/LocalizedGuidePack';
import { LocalizedDefinition } from '@/components/i18n/LocalizedDefinition';
import { useLocale, useT } from '@/components/i18n/LocaleProvider';
import { pageHeading } from '@/lib/i18n/locales';
import { useTheme } from '@/contexts/ThemeContext';

function WhoisTool() {
  const searchParams = useSearchParams();
  const domainParam = searchParams.get('domain') || undefined;
  return <WHOISLookup domain={domainParam} />;
}

export default function WhoisPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { locale, messages, href } = useLocale();
  const t = useT();
  const localized = locale !== 'en';

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />

      <Navigation activeTool="whois" />

      <main className={PAGE_MAIN_CLASS}>
        <PageBreadcrumb
          items={[
            { label: messages.nav.tools, href: href('/') },
            { label: messages.crumbs.whois },
          ]}
        />
        <SectionAmbient intensity="hero" contentClassName="page-gutter pb-8 sm:pb-12">
          <div className="mx-auto max-w-3xl text-center">
            {!localized && (
            <div className="mb-4 flex justify-center sm:mb-5">
              <div className="hero-badge inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium tracking-wide text-ds-body">
                <span className="relative flex h-1.5 w-1.5" aria-hidden>
                  <span className="home-live-dot absolute inset-0 rounded-full bg-emerald-400" />
                </span>
                <span>
                  <span className="text-ds-ink">Live</span> registry data
                </span>
              </div>
            </div>
            )}
            <h1 className="hero-ink mb-3 text-3xl font-semibold tracking-[-0.045em] sm:text-5xl md:text-[3.5rem]">
              {localized ? pageHeading(messages.pages.whois.title) : 'WHOIS Lookup'}
            </h1>
            <p className="mx-auto mb-5 max-w-xl text-sm text-ds-body sm:mb-6 sm:text-base">
              {localized
                ? messages.pages.whois.description
                : 'See who holds a name, when it expires, and where it points. Then share the record as a card.'}
            </p>
            {!localized && (
            <ul className="mx-auto mb-8 flex max-w-lg flex-wrap justify-center gap-2 text-[12px] font-medium text-ds-body sm:text-[13px]">
              {['Registrar', 'Dates', 'Name servers', 'Share card'].map((label) => (
                <li key={label} className="hero-badge rounded-full px-3 py-1">
                  {label}
                </li>
              ))}
            </ul>
            )}
          </div>
          <div className="mx-auto max-w-5xl">
            <Suspense
              fallback={
                <div
                  className={`rounded-2xl border p-6 text-sm ${
                    isLight ? 'border-slate-200 bg-white text-slate-500' : 'border-white/10 bg-[#0a0a0a] text-white/50'
                  }`}
                >
                  {t('Loading WHOIS…')}
                </div>
              }
            >
              <WhoisTool />
            </Suspense>
          </div>
        </SectionAmbient>

        <LocalizedDefinition id="whois" compact />
        <LocalizedGuidePack pack="whois" />
        {/* Footer affiliate banner only — no stacked inline ad above it */}
      </main>

      <Footer />
    </div>
  );
}
