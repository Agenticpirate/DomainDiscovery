'use client';

import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
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

      <main className={`${PAGE_MAIN_CLASS} pb-10 sm:pb-14`}>
        <PageBreadcrumb items={[{ label: 'Tools', href: '/' }, { label: 'Price Comparison' }]} />

        {/* Hero — compact on mobile */}
        <SectionAmbient intensity="hero" contentClassName="page-gutter pt-1 sm:pt-3 pb-3 sm:pb-8">
        <div className="max-w-4xl mx-auto text-center px-0.5">
          <div className="mb-2 sm:mb-3 flex flex-wrap items-center justify-center gap-1 sm:gap-2">
            {[
              'Regular prices',
              '10 registrars',
              `${meta.extensionCount.toLocaleString()}+ TLDs`,
            ].map((label) => (
              <span
                key={label}
                className={`rounded-full border px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-600'
                    : 'border-white/10 bg-[#0a0a0c] text-white/55'
                }`}
              >
                {label}
              </span>
            ))}
          </div>

          <h1
            className={`text-[1.55rem] sm:text-4xl md:text-5xl font-black tracking-tight mb-1 sm:mb-2 leading-tight ${
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
            className={`mx-auto max-w-2xl text-[11.5px] sm:text-[15px] leading-snug sm:leading-relaxed ${
              isLight ? 'text-slate-500' : 'text-white/45'
            }`}
          >
            <span className="sm:hidden">Reg · renew · transfer across top registrars. No promo codes.</span>
            <span className="hidden sm:inline">
              Compare regular registration, renewal, and transfer prices for popular extensions across the
              registrars people actually use — no first-year promo codes.
            </span>
          </p>
        </div>
        </SectionAmbient>

        {/* Stat strip — denser on mobile */}
        <section className="max-w-6xl mx-auto mb-3 sm:mb-6">
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl sm:rounded-2xl border overflow-hidden ${panelGrid}`}>
            {[
              { value: String(meta.extensionCount), label: 'Popular TLDs' },
              { value: '10', label: 'Registrars' },
              { value: 'Reg · Renew · Xfer', label: 'Price types' },
              { value: meta.generatedAt.slice(5).replace('-', '/'), label: 'Last refreshed' },
            ].map((s) => (
              <div key={s.label} className={`px-2 py-2.5 sm:px-3 sm:py-4 text-center ${panelCell}`}>
                <div className="text-[13px] sm:text-xl font-black tracking-tight tabular-nums">{s.value}</div>
                <div className="text-[8px] sm:text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
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

        {/* How pricing works — compact list on mobile; 4-up cards from sm+ */}
        <section className={`mt-6 sm:mt-14 py-5 sm:py-12 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
          <div className="max-w-6xl mx-auto px-0.5">
            <div className="text-center mb-3 sm:mb-8">
              <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 sm:mb-2" style={{ color: 'var(--text-muted)' }}>
                Clear numbers
              </p>
              <h2 className={`text-[1.05rem] sm:text-3xl md:text-4xl font-black mb-1 sm:mb-3 leading-tight tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                How we compare domain prices
              </h2>
              <p className="max-w-xl mx-auto text-[11px] sm:text-[15px] leading-snug sm:leading-relaxed px-1" style={{ color: muted }}>
                <span className="sm:hidden">Regular list prices — so renewals never surprise you.</span>
                <span className="hidden sm:inline">
                  First-year deals look cheap. We show regular list prices so renewals never surprise you.
                </span>
              </p>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-xl sm:rounded-2xl border overflow-hidden ${panelGrid}`}>
              {[
                {
                  step: '01',
                  title: 'Regular prices only',
                  description:
                    'When a registrar lists a promo and a regular price, we keep the regular figure for fair comparison.',
                  descriptionMobile: 'Promo + regular listed? We keep the regular figure for fair compare.',
                  icon: (
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
                {
                  step: '02',
                  title: 'Reg · renew · transfer',
                  description:
                    'Toggle the matrix between registration, renewal, and transfer so the cheapest long-term pick is obvious.',
                  descriptionMobile: 'Toggle reg / renew / transfer so the long-term pick is obvious.',
                  icon: (
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  ),
                },
                {
                  step: '03',
                  title: 'Popular extensions',
                  description:
                    'Focused on TLDs people actually register — .com, .ai, .io, .co, .app, .dev, and more — not a wall of obscure zones.',
                  descriptionMobile: 'Real-world TLDs — .com, .ai, .io, .co, .app, .dev — not obscure zones.',
                  icon: (
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
                {
                  step: '04',
                  title: 'Top 10 registrars',
                  description:
                    'Spaceship, GoDaddy, Namecheap, Porkbun, Dynadot, NameSilo, Sav, Cloudflare, Hostinger, and Unstoppable.',
                  descriptionMobile: 'Spaceship, GoDaddy, Namecheap, Porkbun, Dynadot, Sav, CF, and more.',
                  icon: (
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className={`group flex flex-row sm:flex-col items-start gap-2.5 sm:gap-0 p-2.5 sm:p-5 transition-colors duration-200 ${
                    isLight ? 'bg-white hover:bg-slate-50' : 'bg-[#0c0c0e] hover:bg-[#121214]'
                  }`}
                >
                  <div className="flex sm:w-full items-center justify-between gap-2 sm:mb-3 shrink-0">
                    <div
                      className={`flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl border transition-colors duration-200 ${
                        isLight
                          ? 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900'
                          : 'bg-white/[0.06] text-white/75 border-white/10 group-hover:bg-white group-hover:text-black group-hover:border-white'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span className={`hidden sm:inline text-[11px] font-black tabular-nums ${isLight ? 'text-slate-300' : 'text-white/20'}`}>
                      {item.step}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 sm:flex-none">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-[12px] sm:text-[14px] font-bold tracking-tight mb-0.5 sm:mb-1.5 leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {item.title}
                      </h3>
                      <span className={`sm:hidden text-[9px] font-black tabular-nums shrink-0 ${isLight ? 'text-slate-300' : 'text-white/20'}`}>
                        {item.step}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-[12px] leading-snug sm:leading-relaxed" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.48)' }}>
                      <span className="sm:hidden">{item.descriptionMobile}</span>
                      <span className="hidden sm:inline">{item.description}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Expert tips — denser stack on mobile */}
        <section className={`py-5 sm:py-12 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
          <div className="max-w-6xl mx-auto px-0.5">
            <div className="text-center mb-3 sm:mb-8">
              <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 sm:mb-2" style={{ color: 'var(--text-muted)' }}>
                Expert tips
              </p>
              <h2 className={`text-[1.05rem] sm:text-3xl font-black mb-0 sm:mb-2 leading-tight tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Buy smart, renew cheaper
              </h2>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-3 gap-px rounded-xl sm:rounded-2xl border overflow-hidden ${panelGrid}`}>
              {[
                {
                  title: 'Watch the renewal, not year one',
                  titleShort: 'Watch renewal, not year one',
                  body: 'A $0.99 promo can renew at $20+. Toggle to Renewal in the matrix before you commit.',
                  bodyMobile: 'A $0.99 promo can renew at $20+. Toggle to Renewal before you commit.',
                },
                {
                  title: 'Transfer when it pays off',
                  titleShort: 'Transfer when it pays off',
                  body: 'Many registrars discount transfers. Compare transfer vs renew if you are already on a costly home.',
                  bodyMobile: 'Many discount transfers. Compare xfer vs renew on a costly home.',
                },
                {
                  title: 'Free privacy still matters',
                  titleShort: 'Free privacy still matters',
                  body: 'WHOIS privacy included free is a real line item. Prefer registrars that bundle it at $0.',
                  bodyMobile: 'Free WHOIS privacy is a real line item — prefer $0 privacy.',
                },
              ].map((tip) => (
                <div key={tip.title} className={`px-3 py-2.5 sm:p-6 ${panelCell}`}>
                  <h3 className={`text-[12px] sm:text-[14px] font-bold tracking-tight mb-0.5 sm:mb-2 leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <span className="sm:hidden">{tip.titleShort}</span>
                    <span className="hidden sm:inline">{tip.title}</span>
                  </h3>
                  <p className="text-[11px] sm:text-[13px] leading-snug sm:leading-relaxed" style={{ color: muted }}>
                    <span className="sm:hidden">{tip.bodyMobile}</span>
                    <span className="hidden sm:inline">{tip.body}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Toolkit — compact rows on mobile */}
        <section className={`py-5 sm:py-12 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
          <div className="max-w-6xl mx-auto px-0.5">
            <div className="text-center mb-3 sm:mb-8">
              <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 sm:mb-2" style={{ color: 'var(--text-muted)' }}>
                Free toolkit
              </p>
              <h2 className={`text-[1.05rem] sm:text-3xl font-black mb-0 sm:mb-2 leading-tight tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span className="sm:hidden">Find names, then buy smart</span>
                <span className="hidden sm:inline">Find names, then buy at the best price</span>
              </h2>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-xl sm:rounded-2xl border overflow-hidden ${panelGrid}`}>
              {[
                {
                  href: '/',
                  step: '01',
                  title: 'Domain search',
                  description: 'Instant single-name checks with live availability.',
                  descriptionMobile: 'Live availability for a single name.',
                },
                {
                  href: '/bulk-search',
                  step: '02',
                  title: 'Bulk search',
                  description: 'Check hundreds of names at once and export winners.',
                  descriptionMobile: 'Hundreds of names at once — export winners.',
                },
                {
                  href: '/generator',
                  step: '03',
                  title: 'AI generator',
                  description: 'Invent brandable .com ideas from one keyword.',
                  descriptionMobile: 'Brandable .com ideas from one keyword.',
                },
                {
                  href: '/tools/keyword',
                  step: '04',
                  title: 'Keyword domains',
                  description: 'Expand prefixes and suffixes at scale.',
                  descriptionMobile: 'Prefix & suffix expansion at scale.',
                },
              ].map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`group flex flex-row sm:flex-col items-center sm:items-stretch gap-2.5 sm:gap-0 p-2.5 sm:p-5 transition-colors duration-200 ${
                    isLight ? 'bg-white hover:bg-slate-50' : 'bg-[#0c0c0e] hover:bg-[#121214]'
                  }`}
                >
                  <span className={`text-[10px] sm:text-[11px] font-black tabular-nums shrink-0 sm:mb-0 ${isLight ? 'text-slate-300' : 'text-white/20'}`}>
                    {tool.step}
                  </span>
                  <div className="min-w-0 flex-1 sm:flex-none">
                    <div className="flex items-center justify-between gap-2 sm:block">
                      <h3 className={`text-[12px] sm:text-[14px] font-bold tracking-tight sm:mb-1.5 leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {tool.title}
                      </h3>
                      <svg
                        className={`w-3.5 h-3.5 shrink-0 sm:hidden ${isLight ? 'text-slate-400' : 'text-white/30'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <p className="text-[11px] sm:text-[12px] leading-snug sm:leading-relaxed" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.48)' }}>
                      <span className="sm:hidden">{tool.descriptionMobile}</span>
                      <span className="hidden sm:inline">{tool.description}</span>
                    </p>
                  </div>
                  <svg
                    className={`hidden sm:block w-3.5 h-3.5 ml-auto mt-auto transition-transform group-hover:translate-x-0.5 ${isLight ? 'text-slate-400' : 'text-white/30'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — compact on mobile */}
        <section className={`py-5 sm:py-10 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
          <div className="max-w-6xl mx-auto px-0.5">
            <div
              className={`relative overflow-hidden rounded-xl sm:rounded-2xl border px-3.5 py-4 sm:px-10 sm:py-10 ${
                isLight
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/15'
                  : 'bg-[#0c0c0e] border-white/[0.12]'
              }`}
            >
              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-6">
                <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
                  <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1 sm:mb-2">
                    Free · no account
                  </p>
                  <h2 className="text-[1.05rem] sm:text-3xl font-black tracking-tight text-white mb-1 sm:mb-2 leading-tight">
                    <span className="sm:hidden">Find a name, lock the best price</span>
                    <span className="hidden sm:inline">Find a name, then lock the best price</span>
                  </h2>
                  <p className="text-[11px] sm:text-[14px] leading-snug sm:leading-relaxed text-white/55">
                    <span className="sm:hidden">Search, invent brandables, then pick the cheapest regular price.</span>
                    <span className="hidden sm:inline">
                      Search availability, invent brandables, then come back here to pick the cheapest regular price.
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center lg:justify-end gap-1.5 sm:gap-2 shrink-0">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl px-3.5 py-2 sm:px-6 sm:py-3 text-[11px] sm:text-[13px] font-bold bg-white text-black hover:bg-white/90 transition-colors"
                  >
                    Search domains
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/bulk-search"
                    className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl border border-white/15 px-3 py-2 sm:px-5 sm:py-3 text-[11px] sm:text-[13px] font-semibold text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    Bulk search
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Definition — compact on mobile; long SEO pack desktop-only */}
        <div className="sm:hidden">
          <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.compare} compact />
        </div>
        <div className="hidden sm:block">
          <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.compare} compact />
          <SeoGuidePack {...TOOL_GUIDE_PACKS.compare} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
