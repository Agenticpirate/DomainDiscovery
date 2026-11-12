'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { Owl, type OwlMood } from '@/components/ui/Owl';

type Status = 'free' | 'taken' | 'premium';

const statusClass: Record<Status, string> = {
  free: 'text-emerald-400',
  taken: 'text-rose-400',
  premium: 'text-amber-400',
};

function StatusMark({ status }: { status: Status }) {
  const { messages } = useLocale();
  const label = status === 'free' ? messages.ui.available : status === 'premium' ? messages.ui.premium : messages.ui.taken;
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 text-[12px] font-semibold ${statusClass[status]}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full bg-current ${status === 'free' ? 'home-live-dot' : ''}`}
        aria-hidden
      />
      {label}
    </span>
  );
}

function MockShell({
  children,
  label,
  mood,
}: {
  children: React.ReactNode;
  label: string;
  mood?: OwlMood;
}) {
  return (
    <div className="surface-premium relative rounded-2xl border border-ds-hairline p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ds-mute">{label}</p>
        {mood && <Owl mood={mood} className="-mt-5 h-10 w-10 shrink-0 sm:-mt-6 sm:h-11 sm:w-11" />}
      </div>
      {children}
    </div>
  );
}

const SEARCH_DEMOS = [
  {
    query: 'YStatups.com',
    rows: [
      ['YStatups.com', 'free'],
      ['FoundersPrime.com', 'premium'],
      ['AgenticPirate.com', 'taken'],
      ['CultBuddy.com', 'free'],
    ],
  },
  {
    query: 'agentfinder.xyz',
    rows: [
      ['agentfinder.xyz', 'free'],
      ['homeos.pro', 'premium'],
      ['isobutanol.in', 'taken'],
      ['floods.si', 'free'],
    ],
  },
  {
    query: 'templego.com',
    rows: [
      ['templego.com', 'free'],
      ['seowhales.com', 'taken'],
      ['karkataka.com', 'premium'],
      ['vrischika.com', 'free'],
    ],
  },
] as const;

const ENDING_TILES = [
  { name: 'YStatups.com', ext: '.com' },
  { name: 'CultBuddy.com', ext: '.com' },
  { name: '7amclub.com', ext: '.com' },
  { name: 'agentfinder.xyz', ext: '.xyz' },
  { name: 'homeos.pro', ext: '.pro' },
  { name: 'isobutanol.in', ext: '.in' },
  { name: 'bhagavadgita.si', ext: '.si' },
  { name: 'floods.si', ext: '.si' },
] as const;

const GENERATOR_NAMES: Array<[string, Status]> = [
  ['AskTheHr.com', 'free'],
  ['secondbraincloud.com', 'free'],
  ['Botlaunches.com', 'premium'],
  ['offlinerobots.com', 'taken'],
];

const BULK_NAMES: Array<[string, Status]> = [
  ['imagetoweb.com', 'free'],
  ['nanolaunches.com', 'taken'],
  ['superrintelligence.com', 'premium'],
  ['seowhales.com', 'free'],
];

function useCycleIndex(length: number, ms: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % length);
    }, ms);
    return () => window.clearInterval(id);
  }, [length, ms]);

  return index;
}

/**
 * Homepage product bands — same rhythm as a modern domain search homepage
 * (search, extensions, generator, bulk), in DomainDiscovery colors.
 */
export function HomeProductRows() {
  const { messages, href } = useLocale();
  const copy = messages.home;
  const demo = SEARCH_DEMOS[useCycleIndex(SEARCH_DEMOS.length, 3800)];

  return (
    <div className="space-y-8 sm:space-y-14">
      <section className="home-rise section-shell !mb-0" style={{ animationDelay: '0.05s' }}>
        <div className="grid items-center gap-5 lg:grid-cols-2 lg:gap-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ds-mute sm:text-[12px]">{copy.searchKicker}</p>
            <h2 className="mt-1 text-[1.55rem] font-semibold leading-[1.05] tracking-[-0.03em] text-ds-ink sm:mt-2 sm:text-[2.15rem]">
              {copy.searchTitle}
            </h2>
            <p className="mt-3 hidden max-w-md text-[15px] leading-relaxed text-ds-body sm:block">
              {copy.searchBody}
            </p>
            <Link
              href={href('/search')}
              className="btn-brand mt-4 hidden min-h-11 items-center rounded-full px-4 text-[13px] font-semibold sm:inline-flex"
            >
              {copy.searchCta}
            </Link>
          </div>
          <MockShell
            label={messages.ui.example}
            mood={demo.rows[0][1] === 'free' ? 'happy' : demo.rows[0][1] === 'taken' ? 'shrug' : 'idle'}
          >
            <div className="mb-2 flex items-center overflow-hidden rounded-xl border border-ds-hairline bg-ds-canvas px-3 py-2.5">
              <span key={demo.query} className="home-swap truncate text-[14px] font-medium text-ds-ink">
                {demo.query}
              </span>
              <span className="home-caret ml-0.5 inline-block h-4 w-px shrink-0 bg-ds-ink" aria-hidden />
            </div>
            <div key={demo.query}>
              {demo.rows.map(([name, status], i) => (
                <div
                  key={name}
                  className="home-mock-row flex items-center justify-between gap-3 border-t border-ds-hairline py-2.5 first:border-t-0"
                  style={{ animationDelay: `${0.08 + i * 0.07}s` }}
                >
                  <span className="truncate text-[14px] font-semibold text-ds-ink">{name}</span>
                  <StatusMark status={status} />
                </div>
              ))}
            </div>
          </MockShell>
        </div>
      </section>

      <section className="home-rise section-shell !mb-0" style={{ animationDelay: '0.12s' }}>
        <div className="grid items-center gap-5 lg:grid-cols-2 lg:gap-10">
          <div className="lg:order-2">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ds-mute">{copy.extKicker}</p>
            <h2 className="mt-2 text-[1.7rem] font-semibold leading-[1.05] tracking-[-0.03em] text-ds-ink sm:text-[2.15rem]">
              {copy.extTitle}
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ds-body">
              {copy.extBody}
            </p>
            <Link
              href={href('/domain-extensions')}
              className="group mt-4 hidden min-h-11 items-center gap-1 text-[13px] font-semibold text-ds-ink underline decoration-ds-mute underline-offset-4 transition-colors hover:decoration-ds-ink sm:inline-flex"
            >
              {copy.extCta}
              <span aria-hidden className="no-underline transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
          <MockShell label={copy.tileLabel}>
            <div className="home-tile-grid grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
              {ENDING_TILES.map((tile, i) => (
                <Link
                  key={tile.name}
                  href={href(`/search?q=${tile.name.toLowerCase()}`)}
                  className="home-tile flex min-h-[2.7rem] flex-col items-start justify-center rounded-lg border border-ds-hairline bg-ds-canvas px-2 py-1 sm:min-h-[4.4rem] sm:rounded-xl sm:px-2.5 sm:py-2"
                  style={{ animationDelay: `${i * 0.05}s, ${i * 1.6}s` }}
                >
                  <span className="w-full truncate text-[12px] font-semibold leading-tight text-ds-ink sm:text-[13px]">
                    {tile.name.replace(tile.ext, '')}
                  </span>
                  <span className="text-[10px] text-ds-mute sm:mt-0.5 sm:text-[11px]">{tile.ext}</span>
                </Link>
              ))}
            </div>
            <Link
              href={href('/domain-extensions')}
              className="btn-brand mt-2.5 inline-flex min-h-9 w-full items-center justify-center rounded-full px-4 text-[13px] font-semibold sm:hidden"
            >
              {copy.extCta}
            </Link>
          </MockShell>
        </div>
      </section>

      <section className="home-rise section-shell !mb-0" style={{ animationDelay: '0.08s' }}>
        <div className="grid items-center gap-5 lg:grid-cols-2 lg:gap-10">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ds-mute">{copy.genKicker}</p>
            <h2 className="mt-2 text-[1.7rem] font-semibold leading-[1.05] tracking-[-0.03em] text-ds-ink sm:text-[2.15rem]">
              {copy.genTitle}
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ds-body">
              {copy.genBody}
            </p>
            <Link
              href={href('/generator')}
              className="btn-brand mt-4 inline-flex min-h-11 items-center rounded-full px-4 text-[13px] font-semibold"
            >
              {copy.genCta}
            </Link>
          </div>
          <MockShell label={copy.shortlist}>
            {GENERATOR_NAMES.map(([name, status], i) => (
              <div
                key={name}
                className="home-mock-row flex items-center justify-between gap-3 border-t border-ds-hairline py-2.5 first:border-t-0"
                style={{ animationDelay: `${0.1 + i * 0.09}s` }}
              >
                <span className="min-w-0 truncate text-[14px] font-semibold text-ds-ink">{name}</span>
                <StatusMark status={status as Status} />
              </div>
            ))}
          </MockShell>
        </div>
      </section>

      <section className="home-rise section-shell !mb-0" style={{ animationDelay: '0.1s' }}>
        <div className="grid items-center gap-5 lg:grid-cols-2 lg:gap-10">
          <div className="lg:order-2">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ds-mute">{copy.bulkKicker}</p>
            <h2 className="mt-2 text-[1.7rem] font-semibold leading-[1.05] tracking-[-0.03em] text-ds-ink sm:text-[2.15rem]">
              {copy.bulkTitle}
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ds-body">
              {copy.bulkBody}
            </p>
            <Link
              href={href('/bulk-search')}
              className="group mt-4 inline-flex min-h-11 items-center gap-1 text-[13px] font-semibold text-ds-ink underline decoration-ds-mute underline-offset-4 transition-colors hover:decoration-ds-ink"
            >
              {copy.bulkCta}
              <span aria-hidden className="no-underline transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
          <MockShell label={copy.bulkFile}>
            <div className="mb-2 flex items-center justify-between rounded-xl border border-ds-hairline bg-ds-canvas px-3 py-2">
              <span className="text-[13px] font-semibold text-ds-ink">shortlist.csv</span>
              <span className="text-[12px] font-semibold text-ds-mute">{messages.ui.namesCount}</span>
            </div>
            {BULK_NAMES.map(([name, status], i) => (
              <div
                key={name}
                className="home-mock-row flex items-center justify-between gap-3 py-2"
                style={{ animationDelay: `${0.08 + i * 0.07}s` }}
              >
                <span className="min-w-0 truncate text-[14px] font-medium text-ds-ink">{name}</span>
                <StatusMark status={status as Status} />
              </div>
            ))}
          </MockShell>
        </div>
      </section>
    </div>
  );
}
