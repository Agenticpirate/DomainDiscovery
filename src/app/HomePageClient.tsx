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
import { DomainTicker } from '@/components/home/DomainTicker';
import { StatsBar } from '@/components/home/StatsBar';
import { Owl } from '@/components/ui/Owl';
import { HeroStickyNote } from '@/components/home/HeroStickyNote';
import { AffiliateAdRail } from '@/components/ads/AffiliateAdRail';
import { Footer } from '@/components/layout/Footer';
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
  const { messages, href, locale } = useLocale();
  const isEn = locale === 'en';
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
        <HeroStickyNote />
        {/* Full-viewport mobile hero zone: fills 100svh evenly without blank dead zones; Section 2 stays strictly below fold */}
        <div className="min-h-[calc(100svh-4rem-env(safe-area-inset-top,0px))] flex flex-col justify-between sm:justify-start sm:min-h-0 sm:block pt-1 pb-3 min-[390px]:pb-4 sm:py-0">
          <SectionAmbient
            intensity="hero"
            className="home-hero-ambient w-full flex flex-1 flex-col justify-center sm:block"
            contentClassName="px-3.5 sm:px-6 pt-3 min-[390px]:pt-4 pb-1 sm:pt-12 md:pt-14 sm:pb-8"
          >
          <div className="home-hero-stage relative z-[1] w-full max-w-[42rem] sm:max-w-[58rem] mx-auto text-center">
            <div className="relative z-[1] mt-1 min-[390px]:mt-1.5 sm:mt-0 mb-3 flex flex-wrap items-center justify-center gap-1.5 sm:mb-6 sm:gap-2">
              <div className="hero-badge inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium leading-none tracking-wide text-ds-body sm:gap-2 sm:px-3 sm:py-1.5 sm:text-[12px]">
                <span className="relative flex h-1.5 w-1.5" aria-hidden>
                  <span className="home-live-dot absolute inset-0 rounded-full bg-emerald-400" />
                </span>
                <span>
                  <span className="text-ds-ink">{hero.live}</span> {hero.liveRest}
                </span>
              </div>
              <SearchCountPill />
            </div>

            <h1 className="relative z-[1] text-[clamp(1.9rem,9.2vw,2.75rem)] leading-[1.04] sm:text-[3.65rem] sm:leading-[1.02] md:text-[4.5rem] font-bold tracking-[-0.04em] sm:tracking-[-0.05em] mb-3 sm:mb-4">
              {/* Same heading on every screen size; the tagline (hero.sub) sits underneath. */}
              <span className="hero-ink hero-ink-live block pb-[0.06em] text-balance">{hero.h1Desktop}</span>
              <span className="block text-[1.18rem] min-[380px]:text-[1.25rem] sm:text-[1.5rem] md:text-[1.85rem] mt-1.5 sm:mt-2 font-medium tracking-[-0.02em] sm:tracking-[-0.025em] text-ds-body">
                {hero.sub}
              </span>
            </h1>

            <ul className="relative z-[1] mx-auto mb-4 sm:mb-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-[11px] min-[380px]:text-[12px] sm:text-[13px] font-medium text-ds-body">
              {hero.trust.map((label, index) => (
                <li
                  key={label}
                  className="hero-badge inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 min-[380px]:px-3 min-[380px]:py-1.5 sm:px-3.5 sm:py-1.5"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3 shrink-0 text-ds-ink sm:h-3.5 sm:w-3.5"
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
              {/* Mascot perched on the search panel (hover to make it hop) */}
              <Owl
                mood="idle"
                className="pointer-events-auto absolute -top-[3.1rem] right-5 z-[3] hidden h-14 w-14 sm:block"
              />
              <div className="hero-halo">
                <HeroSearch
                  initialQuery={searchQuery}
                  onSearch={handleHeroSearch}
                  embedded
                />
              </div>

              <div className="mt-3.5 sm:mt-5 flex justify-center">
                <div className={`hero-badge inline-flex max-w-full items-center rounded-full p-1 shadow-sm ${isEn ? '' : 'flex-wrap justify-center rounded-[1.4rem] sm:flex-nowrap sm:rounded-full'}`}>
                  <Link
                    href={href('/bulk-search')}
                    className="group/link inline-flex min-h-9 sm:min-h-10 items-center gap-1.5 sm:gap-2 rounded-full px-2 min-[400px]:px-3 sm:px-4 text-[12px] min-[360px]:text-[12.5px] sm:text-[13px] font-semibold text-ds-ink transition-colors duration-200 hover:bg-white/[0.06] [.light_&]:hover:bg-[#f4f5f5] whitespace-nowrap"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5 sm:h-[15px] sm:w-[15px] text-ds-body transition-colors group-hover/link:text-ds-ink shrink-0" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l9 4.5-9 4.5-9-4.5L12 3zM3 12l9 4.5 9-4.5M3 16.5L12 21l9-4.5" />
                    </svg>
                    <span className="inline min-[380px]:hidden">Bulk</span>
                    <span className="hidden min-[380px]:inline">{messages.crumbs.bulk}</span>
                  </Link>
                  <span className={`mx-0.5 h-3.5 sm:h-4 w-px bg-ds-hairline shrink-0 ${isEn ? '' : 'hidden min-[420px]:block'}`} aria-hidden />
                  <Link
                    href={href('/tools/geo')}
                    className="group/link inline-flex min-h-9 sm:min-h-10 items-center gap-1.5 sm:gap-2 rounded-full px-2 min-[400px]:px-3 sm:px-4 text-[12px] min-[360px]:text-[12.5px] sm:text-[13px] font-semibold text-ds-ink transition-colors duration-200 hover:bg-white/[0.06] [.light_&]:hover:bg-[#f4f5f5] whitespace-nowrap"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5 sm:h-[15px] sm:w-[15px] text-ds-body transition-colors group-hover/link:text-ds-ink shrink-0" aria-hidden>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" d="M3 12h18M12 3c2.5 2.6 3.75 5.6 3.75 9S14.5 18.4 12 21c-2.5-2.6-3.75-5.6-3.75-9S9.5 5.6 12 3z" />
                    </svg>
                    <span className="inline min-[380px]:hidden">Geo</span>
                    <span className="hidden min-[380px]:inline">{messages.crumbs.geo}</span>
                  </Link>
                  <span className={`mx-0.5 h-3.5 sm:h-4 w-px bg-ds-hairline shrink-0 ${isEn ? '' : 'hidden min-[420px]:block'}`} aria-hidden />
                  <Link
                    href={href('/tools/leads')}
                    className="group/link inline-flex min-h-9 sm:min-h-10 items-center gap-1.5 sm:gap-2 rounded-full px-2 min-[400px]:px-3 sm:px-4 text-[12px] min-[360px]:text-[12.5px] sm:text-[13px] font-semibold text-ds-ink transition-colors duration-200 hover:bg-white/[0.06] [.light_&]:hover:bg-[#f4f5f5] whitespace-nowrap"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5 sm:h-[15px] sm:w-[15px] text-ds-body transition-colors group-hover/link:text-ds-ink shrink-0" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    <span className="inline min-[380px]:hidden">Leads</span>
                    <span className="hidden min-[380px]:inline">{messages.crumbs.leads || 'Domain leads'}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </SectionAmbient>

        {/* Social proof + stats + sponsor rail — seamless spacing without artificial gaps */}
        <div className="w-full section-shell space-y-2 min-[390px]:space-y-2.5 !mt-2.5 min-[390px]:!mt-3 sm:!mt-3 sm:space-y-2.5 sm:!max-w-[50rem]">
          {showHeroAd && (
            <AffiliateAdRail
              placement="home-hero"
              variant="strip"
              contained={false}
              size="compact"
            />
          )}
          <DomainTicker />
          <div className="pt-2 min-[390px]:pt-2.5 sm:pt-0">
            <StatsBar />
          </div>
        </div>
      </div>

        <HomePageContent />
      </main>

      <Footer />
    </div>
  );
}
