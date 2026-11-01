'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { GeoDomainGenerator } from '@/components/geo/GeoDomainGenerator';
import { LocalizedGuidePack } from '@/components/i18n/LocalizedGuidePack';
import { LocalizedDefinition } from '@/components/i18n/LocalizedDefinition';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { pageHeading } from '@/lib/i18n/locales';
import { pageShell } from '@/lib/i18n/pageShells';
import { useTheme } from '@/contexts/ThemeContext';

const FEATURES = [
  { label: 'Geo domain lists', hint: 'City + country' },
  { label: 'Official flags', hint: 'ISO countries' },
  { label: 'Populations in millions', hint: 'City proper · WPR 2026' },
  { label: 'Live availability', hint: 'Free · premium · taken' },
  { label: 'CSV export', hint: 'Local SEO inventory' },
];

const STEPS = [
  { n: '01', title: 'Local niche keyword', body: 'plumber, dentist, realtor…' },
  { n: '02', title: 'Pick cities or countries', body: 'By country, mega cities, continents' },
  { n: '03', title: 'Pattern & TLDs', body: 'Order, hyphens, .com / geo TLDs' },
  { n: '04', title: 'Generate & live-check', body: 'Available vs registered inventory' },
];

export default function GeoPage() {
  const { theme } = useTheme();
  const { locale, messages, href } = useLocale();
  const localized = locale !== 'en';
  const shell = pageShell(locale);
  const isLight = theme === 'light';

  const muted = isLight ? 'text-slate-500' : 'text-white/45';
  const secondary = isLight ? 'text-slate-600' : 'text-white/55';

  return (
    <div
      className="geo-page min-h-screen overflow-x-clip"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
    >
      <PageBackground variant="hero" />
      <Navigation activeTool="geo" />

      <main className={PAGE_MAIN_CLASS}>
        <PageBreadcrumb
          items={[
            { label: messages.nav.tools, href: href('/') },
            { label: messages.crumbs.geo },
          ]}
        />
        <header className="page-gutter pt-1.5 pb-4 sm:pt-5 sm:pb-7 text-center">
          <div className="mx-auto max-w-3xl">
            {!localized && (
            <div className="hero-badge inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4 sm:mb-5 text-[12px] font-medium tracking-wide text-ds-body">
              <span className="relative flex h-1.5 w-1.5" aria-hidden>
                <span className="home-live-dot absolute inset-0 rounded-full bg-emerald-400" />
              </span>
              <span>
                <span className="text-ds-ink">Local SEO</span> · Cities &amp; countries
              </span>
            </div>
            )}

            <h1 className="text-[2.1rem] leading-[1.04] sm:text-[3.25rem] md:text-[3.85rem] font-semibold tracking-[-0.05em] mb-2.5 sm:mb-3">
              <span className="hero-ink block pb-[0.06em]">
                {localized ? pageHeading(messages.pages.geo.title) : 'Geo domain generator'}
              </span>
              {!localized && (
              <span className="block text-[1rem] sm:text-[1.4rem] md:text-[1.65rem] mt-1.5 sm:mt-2 font-medium tracking-[-0.025em] text-ds-body">
                A domain for every city you serve
              </span>
              )}
            </h1>

            <p className="text-[14px] sm:text-[16px] max-w-xl mx-auto mb-4 leading-relaxed text-ds-mute">
              {localized
                ? messages.pages.geo.description
                : 'One keyword, any list of cities. Live-checked and ready to export.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {(shell?.geoChips ?? ['Cities', 'Countries', 'Live check', 'CSV export']).map((t) => (
                <span
                  key={t}
                  className="hero-badge inline-flex items-center rounded-full px-3 py-1.5 text-[11px] sm:text-[12px] font-medium text-ds-body"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="relative z-[1] w-full">
          <section className="page-gutter pb-6 sm:pb-10 relative z-[1]">
            <div className="mx-auto max-w-6xl">
              <GeoDomainGenerator />
            </div>
          </section>

          {locale === 'en' && (
          <section className="page-gutter pb-8 sm:pb-12 relative z-[1]">
            <div className="mx-auto max-w-6xl space-y-3 sm:space-y-4">
              {/* About + features */}
              <div
                className="geo-solid-plate surface-premium relative isolate overflow-hidden rounded-xl sm:rounded-2xl border p-3.5 sm:p-6"
                style={{
                  borderColor: isLight ? '#d7dbdc' : 'rgba(255,255,255,0.1)',
                }}
              >
                <div className="relative z-[1]">
                  <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5 ${muted}`}>
                    About this tool
                  </p>
                  <h2
                    className={`text-[0.95rem] sm:text-xl font-semibold tracking-[-0.02em] mb-1.5 sm:mb-2 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    City &amp; country domains for local SEO campaigns
                  </h2>
                  <p className={`text-[12px] sm:text-[14px] leading-relaxed max-w-3xl ${secondary}`}>
                    Build city- and country-level domain lists for any niche (plumber, dentist, realtor, and more).
                    Populations display in millions; city figures use city-proper counts (World Population Review 2026).
                    Live-check free, premium, and registered names — then export CSV for your local SEO inventory.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {FEATURES.map((f) => (
                      <div
                        key={f.label}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold ${
                          isLight
                            ? 'border-slate-200 bg-white text-slate-700'
                            : 'border-white/10 bg-[#111111] text-white/80'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            isLight ? 'bg-emerald-500' : 'bg-emerald-400'
                          }`}
                        />
                        <span className="leading-none">{f.label}</span>
                        <span
                          className={`font-medium leading-none ${
                            isLight ? 'text-slate-400' : 'text-white/40'
                          }`}
                        >
                          {f.hint}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div
                className="geo-solid-plate surface-premium relative isolate overflow-hidden rounded-xl sm:rounded-2xl border p-3.5 sm:p-6"
                style={{
                  borderColor: isLight ? '#d7dbdc' : 'rgba(255,255,255,0.1)',
                }}
              >
                <div className="relative z-[1]">
                  <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] mb-2 sm:mb-3 ${muted}`}>
                    How it works
                  </p>
                  <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                    {STEPS.map((s) => (
                      <li
                        key={s.n}
                        className={`flex sm:flex-col items-start gap-2.5 sm:gap-2 rounded-lg sm:rounded-xl border p-2.5 sm:p-3 min-w-0 ${
                          isLight ? 'border-[#d7dbdc] bg-white' : 'border-white/[0.08] bg-[#111111]'
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] font-bold tabular-nums ${
                            isLight
                              ? 'border-slate-200 bg-[#f4f5f5] text-slate-600'
                              : 'border-white/10 bg-[#0a0a0a] text-white/55'
                          }`}
                        >
                          {s.n}
                        </span>
                        <div className="min-w-0">
                          <div
                            className={`text-[12px] sm:text-[13px] font-bold leading-snug ${
                              isLight ? 'text-slate-800' : 'text-white'
                            }`}
                          >
                            {s.title}
                          </div>
                          <div className={`mt-0.5 text-[11px] sm:text-[12px] leading-snug ${muted}`}>
                            {s.body}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </section>
          )}

          <LocalizedDefinition id="geo" compact />
          <LocalizedGuidePack pack="geo" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
