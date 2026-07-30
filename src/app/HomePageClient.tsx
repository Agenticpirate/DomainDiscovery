'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { HomePageContent } from '@/components/home/HomePageContent';
import { HeroSearch } from '@/components/home/HeroSearch';
import { AffiliateAdRail } from '@/components/ads/AffiliateAdRail';
import { useTheme } from '@/contexts/ThemeContext';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();
  const isLight = mounted ? theme === 'light' : false;
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        router.push('/search');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  const handleHeroSearch = (query: string) => {
    const normalized = query.trim();
    if (!normalized) return;
    setSearchQuery(normalized);
    router.push(`/search?q=${encodeURIComponent(normalized)}`);
  };

  return (
    <div
      id="top"
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
    >
      <PageBackground variant="hero" />

      <Navigation />

      <main className="relative pt-[3.15rem] sm:pt-[4.25rem]">
        {/* Hero — dots clear under center copy (intensity=hero), solid search plate.
            Mobile-only visual polish via max-sm: classes; sm+ layout unchanged. */}
        <SectionAmbient
          intensity="hero"
          spotlight
          contentClassName="px-3.5 sm:px-6 pt-3.5 max-sm:pt-5 sm:pt-12 md:pt-14 pb-3.5 max-sm:pb-5 sm:pb-10"
        >
          <div className="relative z-[1] w-full max-w-[42rem] sm:max-w-[58rem] mx-auto text-center">
            {/* Soft mobile-only glow behind title (desktop unchanged) */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-2 z-0 h-40 w-[18rem] -translate-x-1/2 rounded-full blur-3xl sm:hidden"
              style={{
                background: isLight
                  ? 'radial-gradient(ellipse, rgba(148,163,184,0.22) 0%, transparent 70%)'
                  : 'radial-gradient(ellipse, rgba(255,255,255,0.08) 0%, transparent 70%)',
              }}
            />

            <div
              className={`relative z-[1] inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 mb-2.5 max-sm:mb-3.5 sm:mb-5 text-[10px] max-sm:text-[10.5px] sm:text-[12px] font-semibold tracking-wide border ${
                isLight
                  ? 'bg-slate-100 text-slate-600 border-slate-200 shadow-sm'
                  : 'text-white/70 border-white/12 max-sm:border-white/14'
              }`}
              style={isLight ? undefined : { backgroundColor: '#0c0c0e' }}
            >
              <span className="relative flex h-1.5 w-1.5">
                {/* Static dot — continuous animate-ping blocks Lighthouse CPU idle */}
                <span
                  className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                    isLight ? 'bg-slate-600' : 'bg-white/80'
                  }`}
                />
              </span>
              <span className="sm:hidden">Free · Live · No account</span>
              <span className="hidden sm:inline">
                Free domain name search · Live availability · 1,600+ TLDs
              </span>
            </div>

            <h1 className="relative z-[1] text-[2.15rem] max-sm:text-[2.25rem] leading-[1.05] max-sm:leading-[1.04] sm:text-[3.65rem] md:text-[4.35rem] font-black tracking-tight mb-1.5 max-sm:mb-2.5 sm:mb-3.5">
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage: isLight
                    ? 'linear-gradient(to right, #0f172a, #1e293b, #475569)'
                    : 'linear-gradient(to right, #fff, #fff, rgba(255,255,255,0.55))',
                }}
              >
                <span className="sm:hidden">Find your domain</span>
                <span className="hidden sm:inline">Domain name search</span>
              </span>
              <span
                className="block text-[1.02rem] max-sm:text-[1.08rem] sm:text-[1.55rem] md:text-[1.95rem] mt-1 max-sm:mt-1.5 sm:mt-1.5 font-bold tracking-tight"
                style={{ color: 'var(--gradient-subtitle)' }}
              >
                <span className="sm:hidden">Live check across 1,600+ TLDs</span>
                <span className="hidden sm:inline">Check availability in seconds</span>
              </span>
            </h1>

            <p
              className="hidden sm:block text-[15px] leading-relaxed max-w-[40rem] mx-auto mb-6"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Type a name and see live availability across 1,600+ extensions. Generate brandable ideas with AI,
              build geo lists for local SEO, run bulk checks, look up WHOIS, and compare registrar prices — free,
              no account required, shortlist saved on your device.
            </p>
            <p
              className="sm:hidden relative z-[1] text-[13px] leading-snug max-w-[20.5rem] mx-auto mb-4"
              style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.52)' }}
            >
              Free domain search, AI names &amp; geo tools — no signup
            </p>

            {/*
              Search panel — solid bg on the shell (blocks ambient dots).
              IMPORTANT: do NOT put absolute decorative layers as *direct* children of
              .shine-border — globals force `.shine-border > * { position: relative }`,
              which turns absolute h-* layers into empty black boxes in flow (mobile bug).
            */}
            <div
              className={`shine-border relative z-[2] isolate overflow-hidden rounded-2xl sm:rounded-2xl p-3 max-sm:p-2.5 sm:p-5 max-w-[40rem] sm:max-w-[50rem] mx-auto ${
                isLight
                  ? 'bg-white border border-slate-200 shadow-lg shadow-slate-900/[0.06] max-sm:shadow-xl max-sm:shadow-slate-900/[0.08]'
                  : 'bg-[#0a0a0c] border border-white/[0.14] max-sm:border-white/[0.16] shadow-[0_12px_40px_rgba(0,0,0,0.45)] max-sm:shadow-[0_16px_44px_-14px_rgba(0,0,0,0.7)] sm:shadow-[0_16px_48px_rgba(0,0,0,0.4)]'
              }`}
            >
              <div className="relative">
                <HeroSearch
                  initialQuery={searchQuery}
                  onSearch={handleHeroSearch}
                  popularSearches={['nova', 'pulse', 'studio', 'launch']}
                  embedded
                />

                {/* Mobile: equal full-width tool chips · Desktop: flex wrap unchanged */}
                <div className="mt-2 max-sm:mt-2 sm:mt-3.5 grid grid-cols-2 gap-1.5 max-sm:gap-1.5 sm:gap-3 sm:max-w-none sm:flex sm:flex-wrap sm:items-center sm:justify-center">
                  <Link
                    href="/bulk-search"
                    className={`cta-shine cta-shine-primary group/cta inline-flex items-center justify-center gap-1 max-sm:gap-1 sm:gap-1.5 rounded-xl max-sm:rounded-xl sm:rounded-full px-2.5 py-1.5 max-sm:py-1.5 sm:px-4 sm:py-2.5 text-[11px] max-sm:text-[11px] sm:text-[13px] font-semibold min-h-0 max-sm:min-h-[2.15rem] sm:min-h-0 ${
                      isLight
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : 'bg-white text-black hover:bg-white/90'
                    }`}
                  >
                    <span className="cta-shine-sweep" aria-hidden />
                    <svg className="w-3 h-3 max-sm:w-3 max-sm:h-3 sm:w-4 sm:h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="sm:hidden">Bulk check</span>
                    <span className="hidden sm:inline">Bulk Domain Search</span>
                    <span
                      className={`text-[8px] max-sm:text-[8px] sm:text-[9px] font-bold px-1 max-sm:px-1 sm:px-1.5 py-0.5 rounded-full ${
                        isLight ? 'bg-white/15' : 'bg-black/10'
                      }`}
                    >
                      1K
                    </span>
                  </Link>
                  <Link
                    href="/tools/geo"
                    className={`cta-shine cta-shine-secondary group/cta inline-flex items-center justify-center gap-1 max-sm:gap-1 sm:gap-1.5 rounded-xl max-sm:rounded-xl sm:rounded-full px-2.5 py-1.5 max-sm:py-1.5 sm:px-4 sm:py-2.5 text-[11px] max-sm:text-[11px] sm:text-[13px] font-semibold min-h-0 max-sm:min-h-[2.15rem] sm:min-h-0 ${
                      isLight
                        ? 'bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-300'
                        : 'text-white border border-white/15 hover:border-white/30 max-sm:border-white/18'
                    }`}
                    style={isLight ? undefined : { backgroundColor: '#121214' }}
                  >
                    <span className="cta-shine-sweep" aria-hidden />
                    <svg className="w-3 h-3 max-sm:w-3 max-sm:h-3 sm:w-4 sm:h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="sm:hidden">Geo domains</span>
                    <span className="hidden sm:inline">Geo Domains</span>
                  </Link>
                </div>

                {/* Mobile trust chips — desktop keeps its longer row */}
                <div className="sm:hidden mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
                  {[
                    { label: 'Live results', live: true },
                    { label: 'No signup' },
                    { label: '1,600+ TLDs' },
                  ].map((item) => (
                    <span
                      key={item.label}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        isLight
                          ? 'border-slate-200 bg-slate-50 text-slate-600'
                          : 'border-white/[0.1] bg-white/[0.04] text-white/55'
                      }`}
                    >
                      {item.live ? (
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                      ) : null}
                      {item.label}
                    </span>
                  ))}
                </div>

                {/* Desktop trust row under CTAs */}
                <p
                  className="hidden sm:flex items-center justify-center gap-2 mt-3.5 text-[12px] font-medium"
                  style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.4)' }}
                >
                  <span>Live availability</span>
                  <span className="opacity-40">·</span>
                  <span>Price comparison</span>
                  <span className="opacity-40">·</span>
                  <span>No account required</span>
                </p>
              </div>
            </div>
          </div>
        </SectionAmbient>

        {/* Hero strip — smaller section width; full banner art (no crop) */}
        <div className="pt-1.5 max-sm:pt-2 pb-2 max-sm:pb-2.5 sm:pt-2.5 sm:pb-3 page-gutter w-full">
          <AffiliateAdRail
            placement="home-hero"
            variant="strip"
            contained={false}
            size="compact"
          />
        </div>

        <HomePageContent />
      </main>

      <Footer />
    </div>
  );
}
