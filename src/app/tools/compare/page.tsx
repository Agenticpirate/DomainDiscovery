'use client';

import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { PriceComparison } from '@/components/domain/PriceComparison';
import { SeoGuidePack } from '@/components/seo/SeoGuidePack';
import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import { TOOL_GUIDE_PACKS } from '@/components/seo/toolGuidePacks';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getAllTldPriceDetails,
  getTldPriceDatasetMeta,
  getTldPriceDetail,
  getTldPriceSummaryList,
} from '@/lib/tldPriceData';

export default function ComparePage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const summaries = getTldPriceSummaryList();
  const details = getAllTldPriceDetails();
  const meta = getTldPriceDatasetMeta();
  const initialDetail = getTldPriceDetail('.com');

  if (!initialDetail) {
    throw new Error('TLD comparison dataset is unavailable.');
  }

  const panelGrid = isLight
    ? 'border-slate-200 bg-slate-200'
    : 'border-white/[0.1] bg-white/[0.08]';
  const panelCell = isLight ? 'bg-white' : 'bg-[#0c0c0e]';
  const muted = isLight ? '#64748b' : 'rgba(255,255,255,0.5)';

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />
      <Navigation activeTool="compare" />

      <main className="relative pt-14 sm:pt-20 px-3 sm:px-4 pb-10 sm:pb-14">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={[{ label: 'Tools', href: '/' }, { label: 'Price Comparison' }]} />
        </div>

        {/* Hero */}
        <section className="max-w-4xl mx-auto text-center pt-3 sm:pt-5 pb-5 sm:pb-8">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {[
              'Regular prices only',
              '10 registrars',
              `${meta.extensionCount.toLocaleString()}+ TLDs`,
              'No promo codes',
            ].map((label) => (
              <span
                key={label}
                className={`rounded-full border px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-600'
                    : 'border-white/10 bg-white/[0.04] text-white/55'
                }`}
              >
                {label}
              </span>
            ))}
          </div>

          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(to right, var(--gradient-hero-from), var(--gradient-hero-from), var(--gradient-hero-to))',
              }}
            >
              Domain price comparison
            </span>
          </h1>
          <p
            className={`mx-auto max-w-2xl text-sm sm:text-[15px] leading-relaxed ${
              isLight ? 'text-slate-500' : 'text-white/45'
            }`}
          >
            Compare regular registration, renewal, and transfer prices for popular extensions across the
            registrars people actually use — no first-year promo codes.
          </p>
        </section>

        {/* Stat strip */}
        <section className="max-w-6xl mx-auto mb-4 sm:mb-6">
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl border overflow-hidden ${panelGrid}`}>
            {[
              { value: String(meta.extensionCount), label: 'Popular TLDs' },
              { value: '10', label: 'Registrars' },
              { value: 'Reg · Renew · Xfer', label: 'Price types' },
              { value: meta.generatedAt.slice(5).replace('-', '/'), label: 'Last refreshed' },
            ].map((s) => (
              <div key={s.label} className={`px-3 py-3.5 sm:py-4 text-center ${panelCell}`}>
                <div className="text-base sm:text-xl font-black tracking-tight tabular-nums">{s.value}</div>
                <div className="text-[9px] sm:text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison tool */}
        <section className="max-w-7xl mx-auto">
          <PriceComparison
            summaries={summaries}
            details={details}
            initialDetail={initialDetail}
            generatedAt={meta.generatedAt}
            sourceName={meta.sourceName}
            sourceUrl={meta.sourceUrl}
          />
        </section>

        {/* How pricing works */}
        <section className={`mt-10 sm:mt-14 py-8 sm:py-12 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-5 sm:mb-8">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Clear numbers
              </p>
              <h2 className={`text-xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3 leading-tight tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                How we compare domain prices
              </h2>
              <p className="max-w-xl mx-auto text-[13px] sm:text-[15px] leading-relaxed" style={{ color: muted }}>
                First-year deals look cheap. We show regular list prices so renewals never surprise you.
              </p>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl border overflow-hidden ${panelGrid}`}>
              {[
                {
                  step: '01',
                  title: 'Regular prices only',
                  description:
                    'When a registrar lists a promo and a regular price, we keep the regular figure for fair comparison.',
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
                {
                  step: '02',
                  title: 'Reg · renew · transfer',
                  description:
                    'Toggle the matrix between registration, renewal, and transfer so the cheapest long-term pick is obvious.',
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  ),
                },
                {
                  step: '03',
                  title: 'Popular extensions',
                  description:
                    'Focused on TLDs people actually register — .com, .ai, .io, .co, .app, .dev, and more — not a wall of obscure zones.',
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
                {
                  step: '04',
                  title: 'Top 10 registrars',
                  description:
                    'Spaceship, GoDaddy, Namecheap, Porkbun, Dynadot, NameSilo, Sav, Cloudflare, Hostinger, and Unstoppable.',
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className={`group flex flex-col p-4 sm:p-5 transition-colors duration-200 ${
                    isLight ? 'bg-white hover:bg-slate-50' : 'bg-[#0c0c0e] hover:bg-[#121214]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors duration-200 ${
                        isLight
                          ? 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900'
                          : 'bg-white/[0.06] text-white/75 border-white/10 group-hover:bg-white group-hover:text-black group-hover:border-white'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span className={`text-[11px] font-black tabular-nums ${isLight ? 'text-slate-300' : 'text-white/20'}`}>
                      {item.step}
                    </span>
                  </div>
                  <h3 className={`text-[13px] sm:text-[14px] font-bold tracking-tight mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {item.title}
                  </h3>
                  <p className="text-[12px] leading-relaxed" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.48)' }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Expert tips */}
        <section className={`py-8 sm:py-12 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-5 sm:mb-8">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Expert tips
              </p>
              <h2 className={`text-xl sm:text-3xl font-black mb-2 leading-tight tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Buy smart, renew cheaper
              </h2>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-3 gap-px rounded-2xl border overflow-hidden ${panelGrid}`}>
              {[
                {
                  title: 'Watch the renewal, not year one',
                  body: 'A $0.99 promo can renew at $20+. Toggle to Renewal in the matrix before you commit.',
                },
                {
                  title: 'Transfer when it pays off',
                  body: 'Many registrars discount transfers. Compare transfer vs renew if you are already on a costly home.',
                },
                {
                  title: 'Free privacy still matters',
                  body: 'WHOIS privacy included free is a real line item. Prefer registrars that bundle it at $0.',
                },
              ].map((tip) => (
                <div key={tip.title} className={`p-5 sm:p-6 ${panelCell}`}>
                  <h3 className={`text-[14px] font-bold tracking-tight mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {tip.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: muted }}>
                    {tip.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Toolkit */}
        <section className={`py-8 sm:py-12 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-5 sm:mb-8">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Free toolkit
              </p>
              <h2 className={`text-xl sm:text-3xl font-black mb-2 leading-tight tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Find names, then buy at the best price
              </h2>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl border overflow-hidden ${panelGrid}`}>
              {[
                {
                  href: '/',
                  step: '01',
                  title: 'Domain search',
                  description: 'Instant single-name checks with live availability.',
                },
                {
                  href: '/bulk-search',
                  step: '02',
                  title: 'Bulk search',
                  description: 'Check hundreds of names at once and export winners.',
                },
                {
                  href: '/generator',
                  step: '03',
                  title: 'AI generator',
                  description: 'Invent brandable .com ideas from one keyword.',
                },
                {
                  href: '/tools/keyword',
                  step: '04',
                  title: 'Keyword domains',
                  description: 'Expand prefixes and suffixes at scale.',
                },
              ].map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`group flex flex-col p-4 sm:p-5 transition-colors duration-200 ${
                    isLight ? 'bg-white hover:bg-slate-50' : 'bg-[#0c0c0e] hover:bg-[#121214]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[11px] font-black tabular-nums ${isLight ? 'text-slate-300' : 'text-white/20'}`}>
                      {tool.step}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${isLight ? 'text-slate-400' : 'text-white/30'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className={`text-[13px] sm:text-[14px] font-bold tracking-tight mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {tool.title}
                  </h3>
                  <p className="text-[12px] leading-relaxed" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.48)' }}>
                    {tool.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={`py-8 sm:py-10 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
          <div className="max-w-6xl mx-auto">
            <div
              className={`relative overflow-hidden rounded-2xl border px-5 py-7 sm:px-10 sm:py-10 ${
                isLight
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/15'
                  : 'bg-[#0c0c0e] border-white/[0.12]'
              }`}
            >
              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-6">
                <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2">
                    Free · no account
                  </p>
                  <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white mb-2">
                    Find a name, then lock the best price
                  </h2>
                  <p className="text-[13px] sm:text-[14px] leading-relaxed text-white/55">
                    Search availability, invent brandables, then come back here to pick the cheapest regular price.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 shrink-0">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 sm:px-6 sm:py-3 text-[12px] sm:text-[13px] font-bold bg-white text-black hover:bg-white/90 transition-colors"
                  >
                    Search domains
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/bulk-search"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2.5 sm:px-5 sm:py-3 text-[12px] sm:text-[13px] font-semibold text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    Bulk search
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.compare} compact />
        <SeoGuidePack {...TOOL_GUIDE_PACKS.compare} />
      </main>

      <Footer />
    </div>
  );
}
