'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { DomainExtensionsView } from '@/components/domain/DomainExtensionsView';
import { ExtensionsGuideContent } from '@/components/domain/ExtensionsGuideContent';
import { SeoGuidePack } from '@/components/seo/SeoGuidePack';
import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import { TOOL_GUIDE_PACKS } from '@/components/seo/toolGuidePacks';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';
import { AffiliateAdRail } from '@/components/ads/AffiliateAdRail';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Page-scoped mobile styles (this route only).
 * Desktop (≥640px) is untouched.
 *
 * Root issue: wide tables / min-content widths expanded the page past the
 * viewport; overflow-x-hidden then clipped every section on the right.
 */
const PAGE_MOBILE_CSS = `
@media (max-width: 639px) {
  .domain-extensions-page {
    overflow-x: clip !important;
    max-width: 100vw !important;
  }
  .domain-extensions-page *,
  .domain-extensions-page *::before,
  .domain-extensions-page *::after {
    box-sizing: border-box;
  }

  .domain-extensions-page .shine-border::before,
  .domain-extensions-page .shine-border::after {
    display: none !important;
    opacity: 0 !important;
    content: none !important;
  }
  .domain-extensions-page .shine-border:hover,
  .domain-extensions-page .shine-border:focus-within {
    transform: none !important;
  }

  /* Contain every content shell to the viewport */
  .domain-extensions-page main,
  .domain-extensions-page .max-w-6xl,
  .domain-extensions-page .ext-guide,
  .domain-extensions-page #extensions-search,
  .domain-extensions-page #how-to-choose {
    max-width: 100% !important;
    min-width: 0 !important;
    width: 100% !important;
  }

  /* FAQ shell — no nested padding crop */
  .domain-extensions-page #extension-faqs.section-shell {
    max-width: none !important;
    width: 100% !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    margin-bottom: 0.35rem !important;
  }
  .domain-extensions-page #extension-faqs .section-title {
    font-size: 0.95rem !important;
  }
  .domain-extensions-page #extension-faqs .shine-border {
    background-color: #0a0a0c !important;
    background-image: none !important;
    transform: none !important;
    max-width: 100% !important;
    width: 100% !important;
    min-width: 0 !important;
    overflow: hidden !important;
  }
  html.light .domain-extensions-page #extension-faqs .shine-border {
    background-color: #ffffff !important;
  }

  /* Guide stack — compact + never wider than parent */
  .domain-extensions-page .ext-guide {
    display: flex !important;
    flex-direction: column !important;
    margin-top: 1rem !important;
    gap: 0.9rem !important;
    overflow-x: clip !important;
  }
  .domain-extensions-page .ext-guide > * {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    min-width: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
  }

  /* Every card/panel stays inside the column */
  .domain-extensions-page .ext-guide .shine-border,
  .domain-extensions-page .ext-guide section,
  .domain-extensions-page .ext-guide [class*="rounded"] {
    max-width: 100% !important;
    min-width: 0 !important;
  }
  .domain-extensions-page .ext-guide .shine-border {
    overflow: hidden !important;
  }

  .domain-extensions-page .ext-guide h2 {
    font-size: 0.95rem !important;
    line-height: 1.25 !important;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  .domain-extensions-page .ext-guide h3 {
    font-size: 0.8125rem !important;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  .domain-extensions-page .ext-guide p,
  .domain-extensions-page .ext-guide li,
  .domain-extensions-page .ext-guide span:not(.truncate) {
    overflow-wrap: anywhere;
    word-break: break-word;
    max-width: 100%;
  }

  /* Tables: wrap inside cards — never expand the page */
  .domain-extensions-page .ext-guide .overflow-x-auto {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
  }
  .domain-extensions-page .ext-guide table {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    table-layout: fixed !important;
    font-size: 10.5px !important;
  }
  .domain-extensions-page .ext-guide th,
  .domain-extensions-page .ext-guide td {
    padding-top: 0.35rem !important;
    padding-bottom: 0.35rem !important;
    padding-right: 0.3rem !important;
    white-space: normal !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
  }

  .domain-extensions-page .ext-guide .trust-note {
    width: auto !important;
    max-width: 3.25rem !important;
    min-width: 0 !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap !important;
  }

  /* Grids always fit */
  .domain-extensions-page .ext-guide .grid {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
  }
  .domain-extensions-page .ext-guide .grid > * {
    min-width: 0 !important;
    max-width: 100% !important;
  }

  .domain-extensions-page .ext-guide .ext-guide-cta {
    padding: 0.9rem 0.8rem !important;
  }
}
`;

function DomainExtensionsPageContent() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;

  const solid = isLight ? '#ffffff' : '#0a0a0c';
  // Carry keyword from /search?q=… via Full catalog / TLDs tab
  // DomainExtensionsView also reads ?q= and sessionStorage itself (belt + suspenders)
  const seedQuery = (searchParams.get('q') || '').trim();

  return (
    <div
      className="domain-extensions-page min-h-screen overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
    >
      <style dangerouslySetInnerHTML={{ __html: PAGE_MOBILE_CSS }} />
      <PageBackground variant="minimal" />

      <Navigation activeTool="extensions" />

      <main className={PAGE_MAIN_CLASS}>
        <PageBreadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Domain Extensions' },
          ]}
        />
        <SectionAmbient intensity="hero" className="w-full max-w-full min-w-0" contentClassName="relative z-[1]">
        <div className="page-gutter pb-2 sm:pb-4 max-w-full min-w-0 overflow-x-clip">
          <div className="mx-auto w-full min-w-0 max-w-6xl">
            {/* Hero — solid badge + center-clear ambient */}
            <div className="relative mt-1 sm:mt-3 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-2.5 sm:gap-6 mb-3 sm:mb-6">
              <div className="relative z-[1] max-w-2xl">
                <div
                  className={`relative isolate inline-flex items-center gap-1.5 overflow-hidden rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 mb-1.5 sm:mb-3.5 text-[9px] sm:text-[11px] font-semibold tracking-wide border ${
                    isLight
                      ? 'text-slate-600 border-slate-200 shadow-sm'
                      : 'text-white/65 border-white/10'
                  }`}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{ backgroundColor: solid }}
                  />
                  <span className="relative z-[1] inline-flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        isLight ? 'bg-slate-500' : 'bg-white/70'
                      }`}
                    />
                    <span className="sm:hidden">1,000+ TLDs · Live</span>
                    <span className="hidden sm:inline">
                      Search all 1,000+ TLDs · Live availability
                    </span>
                  </span>
                </div>

                <h1 className="text-[1.45rem] sm:text-4xl md:text-[2.95rem] font-black tracking-tight leading-[1.08] mb-1 sm:mb-3">
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

                {/* Mobile: one short line. Desktop: full copy. */}
                <p
                  className="sm:hidden text-[11.5px] leading-snug mb-2"
                  style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.55)' }}
                >
                  Check every TLD live — free, private, no account.
                </p>
                <p
                  className="hidden sm:block text-[16px] leading-relaxed max-w-xl mb-2"
                  style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.55)' }}
                >
                  Search <strong className="font-bold" style={{ color: 'var(--text-primary)' }}>every</strong>{' '}
                  domain extension and check availability instantly. Compare prices, weigh renewals, and find the best
                  domain ending for your website — as you type.
                </p>
                <p
                  className="hidden sm:block text-[13px] leading-relaxed max-w-xl"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Type a name below to check all 1,001 extensions at once. Free · Private · No account required.
                </p>

                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3.5">
                  <a
                    href="#extensions-search"
                    className={`rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold border ${
                      isLight
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-black border-white'
                    }`}
                  >
                    Search all TLDs
                  </a>
                  {[
                    { href: '#how-to-choose', label: 'How to choose' },
                    { href: '#extension-faqs', label: 'FAQs' },
                    { href: '#extensions-catalog', label: 'Catalog' },
                  ].map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className={`rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold border ${
                        isLight
                          ? 'bg-white text-slate-700 border-slate-200'
                          : 'text-white/75 border-white/12'
                      }`}
                      style={{ backgroundColor: solid }}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Stats — solid plates; compact row on mobile */}
              <div className="relative z-[1] grid grid-cols-3 gap-1.5 sm:gap-2 shrink-0">
                {[
                  { value: '1,001', label: 'All TLDs' },
                  { value: 'Live', label: 'Availability' },
                  { value: 'Private', label: 'By default' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`relative overflow-hidden rounded-xl px-2 py-2 sm:px-3.5 sm:py-3 text-center min-w-0 border ${
                      isLight ? 'border-slate-200 shadow-sm' : 'border-white/10'
                    }`}
                    style={{ backgroundColor: solid }}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{ backgroundColor: solid }}
                    />
                    <div className="relative z-[1] text-[12px] sm:text-sm font-black tracking-tight">
                      {s.value}
                    </div>
                    <div
                      className="relative z-[1] text-[8px] sm:text-[10px] font-medium mt-0.5 uppercase tracking-wide"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DomainExtensionsView
              key={seedQuery || 'browse'}
              searchQuery={seedQuery}
              guideSlot={
                <div id="how-to-choose" className="scroll-mt-24">
                  <ExtensionsGuideContent />
                </div>
              }
            />
          </div>
        </div>

        {/* Hide long SEO packs on mobile to keep tool compact */}
        <div className="hidden sm:block">
          <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.extensions} compact />
          <SeoGuidePack {...TOOL_GUIDE_PACKS.extensions} />
        </div>
        <div className="pt-3 pb-2">
          <AffiliateAdRail placement="inline" variant="card" />
        </div>
        </SectionAmbient>
      </main>

      <Footer />
    </div>
  );
}

export default function DomainExtensionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)' }} />
      }
    >
      <DomainExtensionsPageContent />
    </Suspense>
  );
}
