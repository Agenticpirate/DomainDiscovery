'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { GeoDomainGenerator } from '@/components/geo/GeoDomainGenerator';
import { SeoGuidePack } from '@/components/seo/SeoGuidePack';
import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import { TOOL_GUIDE_PACKS } from '@/components/seo/toolGuidePacks';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';
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

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function GeoPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const reduceMotion = useReducedMotion();

  const solid = isLight ? '#ffffff' : '#0a0a0c';
  const solidInset = isLight ? '#f8fafc' : '#121214';
  const muted = isLight ? 'text-slate-500' : 'text-white/45';
  const secondary = isLight ? 'text-slate-600' : 'text-white/55';

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay, ease: easeOut },
        };

  return (
    <div
      className="geo-page min-h-screen overflow-x-clip"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
    >
      {/* No ambient dots on geo tool */}
      <PageBackground variant="minimal" />
      <Navigation activeTool="geo" />

      <main className={PAGE_MAIN_CLASS}>
        <PageBreadcrumb
          items={[
            { label: 'Tools', href: '/' },
            { label: 'Geo Domain Generator' },
          ]}
        />

        {/* —— Compact intro: tool first (solid only) —— */}
        <div className="page-gutter pb-3 sm:pb-4">
          <div className="mx-auto max-w-6xl relative z-[1]">
            <motion.header
              {...fadeUp(0.04)}
              className="geo-solid-plate rounded-xl sm:rounded-2xl border px-3 py-2.5 sm:px-5 sm:py-3.5"
              style={{
                backgroundColor: solid,
                borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)',
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 min-w-0">
                <div className="min-w-0">
                  <p
                    className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] mb-0.5 ${muted}`}
                  >
                    Local SEO · City & country domains
                  </p>
                  <h1
                    className={`text-[1.2rem] sm:text-2xl md:text-[1.75rem] font-black tracking-tight leading-tight ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    Geo domain generator for local SEO
                  </h1>
                  <p className={`mt-0.5 text-[11px] sm:text-[13px] leading-snug ${secondary}`}>
                    <span className="sm:hidden">City &amp; country lists · live check · CSV export</span>
                    <span className="hidden sm:inline">
                      Build city- and country-level domain lists, live-check availability, export CSV.
                    </span>
                  </p>
                </div>
                <div className="hidden sm:flex shrink-0 flex-wrap gap-1.5 justify-end">
                  {['Cities', 'Countries', 'Live check', 'CSV'].map((t) => (
                    <span
                      key={t}
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        isLight ? 'border-slate-200 text-slate-600' : 'border-white/10 text-white/55'
                      }`}
                      style={{ backgroundColor: solidInset }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.header>
          </div>
        </div>

        {/* —— Actual tool — primary surface —— */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.08, ease: easeOut }}
          className="page-gutter pb-6 sm:pb-10 relative z-[1]"
        >
          <div className="mx-auto max-w-6xl">
            <GeoDomainGenerator />
          </div>
        </motion.section>

        {/* —— Education after the tool —— */}
        <section className="page-gutter pb-10 sm:pb-16 relative z-[1]">
          <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
            {/* About + features */}
            <div
              className="geo-solid-plate rounded-xl sm:rounded-2xl border p-3.5 sm:p-6"
              style={{
                backgroundColor: solid,
                borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)',
              }}
            >
              <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5 ${muted}`}>
                About this tool
              </p>
              <h2
                className={`text-[0.95rem] sm:text-xl font-black tracking-tight mb-1.5 sm:mb-2 ${
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

              <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                {FEATURES.map((f) => (
                  <div
                    key={f.label}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold ${
                      isLight
                        ? 'border-slate-200 text-slate-700'
                        : 'border-white/12 text-white/80'
                    }`}
                    style={{ backgroundColor: solidInset }}
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

            {/* How it works */}
            <div
              className="geo-solid-plate rounded-xl sm:rounded-2xl border p-3.5 sm:p-6"
              style={{
                backgroundColor: solid,
                borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)',
              }}
            >
              <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] mb-2 sm:mb-3 ${muted}`}>
                How it works
              </p>
              <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {STEPS.map((s) => (
                  <li
                    key={s.n}
                    className="flex sm:flex-col items-start gap-2.5 sm:gap-2 rounded-lg sm:rounded-xl border p-2.5 sm:p-3 min-w-0"
                    style={{
                      backgroundColor: solidInset,
                      borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] font-bold tabular-nums ${
                        isLight
                          ? 'border-slate-200 bg-white text-slate-600'
                          : 'border-white/10 bg-[#0a0a0c] text-white/50'
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
        </section>

        <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.geo} compact />
        <SeoGuidePack {...TOOL_GUIDE_PACKS.geo} />
      </main>

      <Footer />
    </div>
  );
}
