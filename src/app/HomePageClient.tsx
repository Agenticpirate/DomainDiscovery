'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { HeroSearch } from '@/components/home/HeroSearch';
import { FadeIn } from '@/components/ui/motion';
import { useTheme } from '@/contexts/ThemeContext';

const HomePageContent = dynamic(
  () => import('@/components/home/HomePageContent').then((m) => m.HomePageContent),
  { ssr: true }
);
const Footer = dynamic(() => import('@/components/layout/Footer').then((m) => m.Footer), {
  ssr: true,
});
const AffiliateAdRail = dynamic(
  () => import('@/components/ads/AffiliateAdRail').then((m) => m.AffiliateAdRail),
  { ssr: false }
);

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeroAd, setShowHeroAd] = useState(false);
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

  // Defer hero ad until after first paint (LCP is the headline text)
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => setShowHeroAd(true), { timeout: 2200 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setShowHeroAd(true), 1000);
    return () => window.clearTimeout(id);
  }, []);

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

      <main className="relative page-main">
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
              className="pointer-events-none absolute left-1/2 top-2 z-0 h-40 w-[18rem] -translate-x-1/2 rounded-full blur-3xl sm:hidden animate-ambient-drift"
              style={{
                background: isLight
                  ? 'radial-gradient(ellipse, rgba(0,112,243,0.1) 0%, transparent 70%)'
                  : 'radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, transparent 70%)',
              }}
            />

            <FadeIn delay={0.02}>
            <div
              className={`relative z-[1] inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 mb-2.5 max-sm:mb-3.5 sm:mb-5 text-[10px] max-sm:text-[10.5px] sm:text-[12px] font-semibold tracking-wide border ${
                isLight
                  ? 'bg-ds-soft text-ds-body border-ds-hairline shadow-sm'
                  : 'text-white/70 border-white/12 max-sm:border-white/14'
              }`}
              style={isLight ? undefined : { backgroundColor: '#0a0a0a' }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                    isLight ? 'bg-ds-link' : 'bg-white/80'
                  }`}
                />
              </span>
              <span className="sm:hidden">Free · Live · No account</span>
              <span className="hidden sm:inline">
                Free domain name search · Live availability · 1,600+ TLDs
              </span>
            </div>
            </FadeIn>

            <FadeIn delay={0.08}>
            <h1 className="relative z-[1] text-[2.15rem] max-sm:text-[2.25rem] leading-[1.05] max-sm:leading-[1.04] sm:text-[3.65rem] md:text-[4.35rem] font-black tracking-[-0.035em] mb-1.5 max-sm:mb-2.5 sm:mb-3.5">
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage: isLight
                    ? 'linear-gradient(115deg, #171717 0%, #4d4d4d 60%, #0070f3 100%)'
                    : 'linear-gradient(to right, #fff, #fff, rgba(255,255,255,0.55))',
                }}
              >
                <span className="sm:hidden">Find your domain</span>
                <span className="hidden sm:inline">Domain name search</span>
              </span>
              <span
                className="block text-[1.02rem] max-sm:text-[1.08rem] sm:text-[1.55rem] md:text-[1.95rem] mt-1 max-sm:mt-1.5 sm:mt-1.5 font-semibold tracking-tight text-ds-body"
              >
                <span className="sm:hidden">Live check across 1,600+ TLDs</span>
                <span className="hidden sm:inline">Check availability in seconds</span>
              </span>
            </h1>
            </FadeIn>

            <FadeIn delay={0.14}>
            <p
              className="hidden sm:block text-[15px] leading-relaxed max-w-[40rem] mx-auto mb-6 tracking-[-0.01em]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Type a name and see live availability across 1,600+ extensions. Generate brandable ideas with AI,
              build geo lists for local SEO, run bulk checks, look up WHOIS, and compare registrar prices — free,
              no account required, shortlist saved on your device.
            </p>
            <p className="sm:hidden relative z-[1] text-[13px] leading-snug max-w-[20.5rem] mx-auto mb-4 text-ds-body">
              Free domain search, AI names &amp; geo tools — no signup
            </p>
            </FadeIn>

            {/*
              Search panel — solid bg on the shell (blocks ambient dots).
              IMPORTANT: do NOT put absolute decorative layers as *direct* children of
              .shine-border — globals force `.shine-border > * { position: relative }`,
              which turns absolute h-* layers into empty black boxes in flow (mobile bug).
            */}
            <FadeIn delay={0.2}>
            <div
              className={`shine-border relative z-[2] isolate overflow-hidden rounded-2xl sm:rounded-2xl p-3 max-sm:p-2.5 sm:p-5 max-w-[40rem] sm:max-w-[50rem] mx-auto bg-ds-canvas border border-ds-hairline shadow-ds-card ${
                isLight
                  ? 'max-sm:shadow-ds-card-hover'
                  : 'max-sm:shadow-[0_16px_44px_-14px_rgba(0,0,0,0.75)] sm:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.55)]'
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
                    className="cta-shine cta-shine-primary group/cta inline-flex items-center justify-center gap-1 max-sm:gap-1 sm:gap-1.5 rounded-xl max-sm:rounded-xl sm:rounded-full px-2.5 py-1.5 max-sm:py-1.5 sm:px-4 sm:py-2.5 text-[11px] max-sm:text-[11px] sm:text-[13px] font-semibold min-h-0 max-sm:min-h-[2.15rem] sm:min-h-0 bg-ds-ink text-ds-soft hover:brightness-110"
                  >
                    <span className="cta-shine-sweep" aria-hidden />
                    <svg className="w-3 h-3 max-sm:w-3 max-sm:h-3 sm:w-4 sm:h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="sm:hidden">Bulk check</span>
                    <span className="hidden sm:inline">Bulk Domain Search</span>
                    <span
                      className="text-[8px] max-sm:text-[8px] sm:text-[9px] font-bold px-1 max-sm:px-1 sm:px-1.5 py-0.5 rounded-full bg-ds-soft/20"
                    >
                      1K
                    </span>
                  </Link>
                  <Link
                    href="/tools/geo"
                    className="cta-shine cta-shine-secondary group/cta inline-flex items-center justify-center gap-1 max-sm:gap-1 sm:gap-1.5 rounded-xl max-sm:rounded-xl sm:rounded-full px-2.5 py-1.5 max-sm:py-1.5 sm:px-4 sm:py-2.5 text-[11px] max-sm:text-[11px] sm:text-[13px] font-semibold min-h-0 max-sm:min-h-[2.15rem] sm:min-h-0 bg-ds-canvas text-ds-ink border border-ds-hairline hover:border-ds-strong hover:bg-ds-inset"
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
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold border-ds-hairline bg-ds-soft text-ds-body"
                    >
                      {item.live ? (
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                      ) : null}
                      {item.label}
                    </span>
                  ))}
                </div>

                {/* Desktop trust row under CTAs */}
                <p className="hidden sm:flex items-center justify-center gap-2 mt-3.5 text-[12px] font-medium tracking-tight text-ds-mute">
                  <span>Live availability</span>
                  <span className="opacity-40">·</span>
                  <span>Price comparison</span>
                  <span className="opacity-40">·</span>
                  <span>No account required</span>
                </p>
              </div>
            </div>
            </FadeIn>
          </div>
        </SectionAmbient>

        {/* Hero strip — smaller section width; full banner art (no crop) */}
        {showHeroAd && (
          <div className="pt-1.5 max-sm:pt-2 pb-2 max-sm:pb-2.5 sm:pt-2.5 sm:pb-3 page-gutter w-full">
            <AffiliateAdRail
              placement="home-hero"
              variant="strip"
              contained={false}
              size="compact"
            />
          </div>
        )}

        <HomePageContent />
      </main>

      <Footer />
    </div>
  );
}
