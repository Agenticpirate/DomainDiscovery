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
        {/* Hero — dots clear under center copy (intensity=hero), solid search plate */}
        <SectionAmbient
          intensity="hero"
          spotlight
          contentClassName="px-3.5 sm:px-6 pt-4 sm:pt-12 md:pt-14 pb-4 sm:pb-10"
        >
          <div className="relative z-[1] w-full max-w-[42rem] sm:max-w-[58rem] mx-auto text-center">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 sm:px-3 sm:py-1.5 mb-3 sm:mb-5 text-[10.5px] sm:text-[12px] font-semibold tracking-wide border ${
                isLight
                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                  : 'text-white/70 border-white/12'
              }`}
              style={isLight ? undefined : { backgroundColor: '#0c0c0e' }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-50 ${
                    isLight ? 'bg-slate-400' : 'bg-white/50'
                  }`}
                />
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

            <h1 className="text-[1.95rem] leading-[1.06] sm:text-[3.65rem] md:text-[4.35rem] font-black tracking-tight mb-2 sm:mb-3.5">
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
                className="block text-[0.95rem] sm:text-[1.55rem] md:text-[1.95rem] mt-1 sm:mt-1.5 font-bold tracking-tight"
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
              className="sm:hidden text-[12.5px] leading-snug max-w-[19.5rem] mx-auto mb-3.5"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Free domain search, AI names &amp; geo tools — no signup
            </p>

            {/* Search panel — solid fill so ambient dots never show through */}
            <div
              className={`shine-border relative z-[2] isolate rounded-[1.25rem] sm:rounded-2xl p-3 sm:p-5 max-w-[40rem] sm:max-w-[50rem] mx-auto overflow-hidden ${
                isLight
                  ? 'bg-white border border-slate-200 shadow-lg shadow-slate-900/[0.06]'
                  : 'bg-[#0a0a0c] border border-white/[0.14] shadow-[0_12px_40px_rgba(0,0,0,0.45)] sm:shadow-[0_16px_48px_rgba(0,0,0,0.4)]'
              }`}
            >
              {/* Opaque underlay blocks hero dots inside the bar */}
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-0 rounded-[inherit] ${
                  isLight ? 'bg-white' : 'bg-[#0a0a0c]'
                }`}
              />
              <div className="relative z-[1]">
              <HeroSearch
                initialQuery={searchQuery}
                onSearch={handleHeroSearch}
                popularSearches={['nova', 'pulse', 'studio', 'launch']}
                embedded
              />

              {/* Mobile: equal full-width tool chips · Desktop: flex wrap unchanged */}
              <div className="mt-3 sm:mt-3.5 grid grid-cols-2 gap-2 sm:max-w-none sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
                <Link
                  href="/bulk-search"
                  className={`cta-shine cta-shine-primary group/cta inline-flex items-center justify-center gap-1.5 rounded-2xl sm:rounded-full px-3 py-2.5 sm:px-4 sm:py-2.5 text-[12px] sm:text-[13px] font-semibold min-h-[2.75rem] sm:min-h-0 ${
                    isLight
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-white text-black hover:bg-white/90'
                  }`}
                >
                  <span className="cta-shine-sweep" aria-hidden />
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="sm:hidden">Bulk check</span>
                  <span className="hidden sm:inline">Bulk Domain Search</span>
                  <span
                    className={`text-[9px] sm:text-[9px] font-bold px-1.5 sm:px-1.5 py-0.5 rounded-full ${
                      isLight ? 'bg-white/15' : 'bg-black/10'
                    }`}
                  >
                    1K
                  </span>
                </Link>
                <Link
                  href="/tools/geo"
                  className={`cta-shine cta-shine-secondary group/cta inline-flex items-center justify-center gap-1.5 rounded-2xl sm:rounded-full px-3 py-2.5 sm:px-4 sm:py-2.5 text-[12px] sm:text-[13px] font-semibold min-h-[2.75rem] sm:min-h-0 ${
                    isLight
                      ? 'bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-300'
                      : 'text-white border border-white/15 hover:border-white/30'
                  }`}
                  style={isLight ? undefined : { backgroundColor: '#121214' }}
                >
                  <span className="cta-shine-sweep" aria-hidden />
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="sm:hidden">Geo domains</span>
                  <span className="hidden sm:inline">Geo Domains</span>
                </Link>
              </div>

              {/* Mobile trust strip — desktop keeps its longer row */}
              <p
                className="sm:hidden flex items-center justify-center gap-1.5 mt-3 text-[10.5px] font-medium tracking-wide"
                style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.42)' }}
              >
                <span className="inline-flex h-1 w-1 rounded-full bg-emerald-400/90" aria-hidden />
                <span>Live results</span>
                <span className="opacity-35">·</span>
                <span>No signup</span>
                <span className="opacity-35">·</span>
                <span>1,600+ TLDs</span>
              </p>

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

        {/* Hero-adjacent strip — compact height so it matches site density */}
        <div className="pt-2 pb-2.5 sm:pt-2.5 sm:pb-3 page-gutter w-full">
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
