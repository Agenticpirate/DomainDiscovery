'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/PageBackground';
import { HomePageContent } from '@/components/home/HomePageContent';
import { HeroSearch } from '@/components/home/HeroSearch';
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
        {/* Hero — mobile unchanged; desktop: richer copy, full CTAs, brand palette */}
        <section className="relative px-3.5 sm:px-6 pt-3.5 sm:pt-12 md:pt-14 pb-3 sm:pb-10">
          <div className="w-full max-w-[42rem] sm:max-w-[58rem] mx-auto text-center">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 mb-2.5 sm:mb-5 text-[10px] sm:text-[12px] font-semibold tracking-wide ${
                isLight
                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                  : 'bg-white/[0.04] text-white/65 border border-white/10'
              }`}
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
              <span className="sm:hidden">Free domain name search</span>
              <span className="hidden sm:inline">
                Free domain name search · Live availability · 1,600+ TLDs
              </span>
            </div>

            <h1 className="text-[1.7rem] leading-[1.08] sm:text-[3.65rem] md:text-[4.35rem] font-black tracking-tight mb-1.5 sm:mb-3.5">
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage: isLight
                    ? 'linear-gradient(to right, #0f172a, #1e293b, #475569)'
                    : 'linear-gradient(to right, #fff, #fff, rgba(255,255,255,0.55))',
                }}
              >
                Domain name search
              </span>
              <span
                className="block text-[0.88rem] sm:text-[1.55rem] md:text-[1.95rem] mt-0.5 sm:mt-1.5 font-bold"
                style={{ color: 'var(--gradient-subtitle)' }}
              >
                Check availability in seconds
              </span>
            </h1>

            <p
              className="hidden sm:block text-[15px] leading-relaxed max-w-[40rem] mx-auto mb-6"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Type a name and see live availability across 1,600+ extensions. Generate brandable ideas with AI,
              build geo domain lists for local SEO, run bulk checks, look up WHOIS, and compare registrar prices —
              free, no account required, shortlist saved on your device.
            </p>
            <p
              className="sm:hidden text-[11.5px] leading-snug max-w-[18rem] mx-auto mb-3"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Live availability · 1,600+ TLDs · Free tools
            </p>

            {/* Highlighted search panel — primary CTA zone */}
            <div
              className={`shine-border rounded-2xl p-2.5 sm:p-5 max-w-[40rem] sm:max-w-[50rem] mx-auto ${
                isLight
                  ? 'bg-white border border-slate-200 shadow-lg shadow-slate-900/[0.06]'
                  : 'bg-white/[0.04] border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.35)] sm:shadow-[0_16px_48px_rgba(0,0,0,0.4)]'
              }`}
            >
              <HeroSearch
                initialQuery={searchQuery}
                onSearch={handleHeroSearch}
                popularSearches={['nova', 'pulse', 'studio', 'launch']}
                embedded
              />

              <div className="mt-2.5 sm:mt-3.5 grid grid-cols-2 gap-2 max-w-[18rem] sm:max-w-none mx-auto sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
                <Link
                  href="/bulk-search"
                  className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-[13px] font-semibold transition-all ${
                    isLight
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-white text-black hover:bg-white/90'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="sm:hidden">Bulk</span>
                  <span className="hidden sm:inline">Bulk Domain Search</span>
                  <span
                    className={`text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full ${
                      isLight ? 'bg-white/15' : 'bg-black/10'
                    }`}
                  >
                    1K
                  </span>
                </Link>
                <Link
                  href="/tools/geo"
                  className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-[13px] font-semibold transition-all ${
                    isLight
                      ? 'bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-300'
                      : 'bg-white/[0.06] text-white border border-white/15 hover:border-white/30'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="sm:hidden">Geo</span>
                  <span className="hidden sm:inline">Geo Domains</span>
                </Link>
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
        </section>

        <HomePageContent />
      </main>

      <Footer />
    </div>
  );
}
