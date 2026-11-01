'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { HeroSearch } from '@/components/home/HeroSearch';
import { SearchCountPill } from '@/components/home/SearchCountPill';
import { HomePageContent } from '@/components/home/HomePageContent';
import { Footer } from '@/components/layout/Footer';
import { AffiliateAdRail } from '@/components/ads/AffiliateAdRail';
import { useLocale } from '@/components/i18n/LocaleProvider';

const HERO_TRUST_ICONS: React.ReactNode[] = [
  <React.Fragment key="shield">
    <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </React.Fragment>,
  <React.Fragment key="eye">
    <path d="M3 3l18 18" />
    <path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-2.6 3.4M6.3 6.3C3.9 8 2.5 12 2.5 12s3.5 7 9.5 7a9.5 9.5 0 0 0 5.7-1.8" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </React.Fragment>,
  <path key="bolt" d="M13 2L4.5 13.5H12L11 22l8.5-11.5H12L13 2z" />,
  <React.Fragment key="tag">
    <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
    <circle cx="7.5" cy="7.5" r="1.2" />
  </React.Fragment>,
];

export default function Home() {
  const { messages, href } = useLocale();
  const hero = messages.hero;
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeroAd, setShowHeroAd] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        router.push(href('/search'));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [href, router]);

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
    router.push(href(`/search?q=${encodeURIComponent(normalized)}`));
  };

  return (
    <div
      id="top"
      className="page-x-lock min-h-screen"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
    >
      <PageBackground variant="hero" />

      <Navigation />

      <main className="relative page-main">
        {/* Hero — dots clear under center copy (intensity=hero), solid search plate.
            Mobile-only visual polish via max-sm: classes; sm+ layout unchanged. */}
        <SectionAmbient
          intensity="hero"
          className="home-hero-ambient"
          contentClassName="px-3.5 sm:px-6 pt-3 max-sm:pt-4 sm:pt-12 md:pt-14 pb-3 max-sm:pb-4 sm:pb-10"
        >
          <div className="home-hero-stage relative z-[1] w-full max-w-[42rem] sm:max-w-[58rem] mx-auto text-center">
            <div className="relative z-[1] mb-2.5 flex flex-wrap items-center justify-center gap-1 sm:mb-6 sm:gap-2">
              <div className="hero-badge inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-none tracking-wide text-ds-body sm:gap-2 sm:px-3 sm:py-1.5 sm:text-[12px]">
                <span className="relative flex h-1.5 w-1.5" aria-hidden>
                  <span className="home-live-dot absolute inset-0 rounded-full bg-emerald-400" />
                </span>
                <span>
                  <span className="text-ds-ink">{hero.live}</span> {hero.liveRest}
                </span>
              </div>
              <SearchCountPill />
            </div>

            <h1 className="relative z-[1] text-[2.65rem] leading-[0.98] sm:text-[3.65rem] sm:leading-[1.02] md:text-[4.5rem] font-semibold tracking-[-0.045em] sm:tracking-[-0.05em] mb-3 sm:mb-4">
              <span className="hero-ink hero-ink-live block pb-[0.06em]">
                <span className="sm:hidden">{hero.h1Mobile}</span>
                <span className="hidden sm:inline">{hero.h1Desktop}</span>
              </span>
              <span className="block text-[1.35rem] sm:text-[1.5rem] md:text-[1.85rem] mt-1.5 sm:mt-2 font-medium tracking-[-0.02em] sm:tracking-[-0.025em] text-ds-body">
                {hero.sub}
              </span>
            </h1>

            <ul className="relative z-[1] mx-auto mb-3 grid w-full grid-cols-4 gap-1.5 text-[10px] font-medium leading-none text-ds-body sm:mb-8 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-2.5 sm:text-[13px]">
              {hero.trust.map((label, index) => (
                <li
                  key={label}
                  className="hero-badge inline-flex min-w-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-1 py-1.5 sm:gap-1.5 sm:px-3 sm:py-1"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-2.5 w-2.5 shrink-0 text-ds-ink sm:h-3.5 sm:w-3.5"
                    aria-hidden
                  >
                    {HERO_TRUST_ICONS[index]}
                  </svg>
                  {label}
                </li>
              ))}
            </ul>

            {/*
              Search panel — solid bg on the shell (blocks ambient dots).
              IMPORTANT: do NOT put absolute decorative layers as *direct* children of
              .shine-border — globals force `.shine-border > * { position: relative }`,
              which turns absolute h-* layers into empty black boxes in flow (mobile bug).
            */}
            <div className="relative z-[2] mx-auto w-full max-w-[40rem] sm:max-w-[44rem]">
              <div className="hero-halo">
                <HeroSearch
                  initialQuery={searchQuery}
                  onSearch={handleHeroSearch}
                  embedded
                />
              </div>

              <div className="mt-2.5 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:hidden [.light_&]:border-[#d7dbdc] [.light_&]:bg-white">
                {[
                  {
                    href: href('/bulk-search'),
                    title: messages.crumbs.bulk,
                    hint: hero.bulkHint,
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4-8 4-8-4 8-4zM4 12l8 4 8-4M4 16.5l8 4 8-4" />
                      </svg>
                    ),
                  },
                  {
                    href: href('/tools/geo'),
                    title: messages.crumbs.geo,
                    hint: hero.geoHint,
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden>
                        <circle cx="12" cy="12" r="8" />
                        <path strokeLinecap="round" d="M4 12h16M12 4c2.2 2.4 3.3 5.2 3.3 8s-1.1 5.6-3.3 8c-2.2-2.4-3.3-5.2-3.3-8s1.1-5.6 3.3-8z" />
                      </svg>
                    ),
                  },
                  {
                    href: href('/tools/leads'),
                    title: messages.crumbs.leads || 'Domain leads',
                    hint: 'Track buyer prospects',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                    ),
                  },
                ].map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex min-w-0 items-center gap-2 px-2.5 py-2.5 text-left ${
                      index > 0 ? 'border-l border-white/[0.08] [.light_&]:border-[#e7e9ea]' : ''
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#111111] text-white/80 [.light_&]:border-[#e7e9ea] [.light_&]:bg-[#f4f5f5] [.light_&]:text-[#141517]">
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-semibold leading-tight text-ds-ink">{item.title}</span>
                      <span className="mt-0.5 block truncate text-[10px] leading-tight text-ds-mute">{item.hint}</span>
                    </span>
                    <span className="shrink-0 text-[14px] text-ds-mute" aria-hidden>
                      ›
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-4 hidden justify-center sm:flex">
                <div className="hero-badge inline-flex items-center rounded-full p-1">
                  <Link
                    href={href('/bulk-search')}
                    className="group/link inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-ds-ink transition-colors duration-200 hover:bg-white/[0.06] [.light_&]:hover:bg-[#f4f5f5]"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="text-ds-body transition-colors group-hover/link:text-ds-ink" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l9 4.5-9 4.5-9-4.5L12 3zM3 12l9 4.5 9-4.5M3 16.5L12 21l9-4.5" />
                    </svg>
                    {messages.crumbs.bulk}
                  </Link>
                  <span className="mx-0.5 h-4 w-px bg-ds-hairline" aria-hidden />
                  <Link
                    href={href('/tools/geo')}
                    className="group/link inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-ds-ink transition-colors duration-200 hover:bg-white/[0.06] [.light_&]:hover:bg-[#f4f5f5]"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="text-ds-body transition-colors group-hover/link:text-ds-ink" aria-hidden>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" d="M3 12h18M12 3c2.5 2.6 3.75 5.6 3.75 9S14.5 18.4 12 21c-2.5-2.6-3.75-5.6-3.75-9S9.5 5.6 12 3z" />
                    </svg>
                    {messages.crumbs.geo}
                  </Link>
                  <span className="mx-0.5 h-4 w-px bg-ds-hairline" aria-hidden />
                  <Link
                    href={href('/tools/leads')}
                    className="group/link inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-ds-ink transition-colors duration-200 hover:bg-white/[0.06] [.light_&]:hover:bg-[#f4f5f5]"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="text-ds-body transition-colors group-hover/link:text-ds-ink" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    {messages.crumbs.leads || 'Domain leads'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </SectionAmbient>

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
