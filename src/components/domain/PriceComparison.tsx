'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/contexts/ThemeContext';
import {
  TOP_COMPARISON_REGISTRARS,
  getRegistrarOfferForTld,
  type RegistrarOffer,
  type TldPricingDetail,
  type TldPricingSummary,
} from '@/lib/tldPriceData';

interface PriceComparisonProps {
  summaries?: TldPricingSummary[];
  details?: TldPricingDetail[];
  initialDetail?: TldPricingDetail;
  generatedAt?: string;
  sourceName?: string;
  sourceUrl?: string;
  domain?: string;
}

type SortKey = 'recommended' | 'coverage' | 'registration' | 'renewal' | 'transfer' | 'value' | 'alphabetical';

function formatDate(value: string) {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed);
}

function priceCellTone(isLight: boolean) {
  return isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/[0.03] border-white/10';
}

function metricTone(isLight: boolean) {
  return isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10';
}

function makeEmptyOffer(registrar: string): RegistrarOffer {
  return {
    registrar,
    url: null,
    registration: { value: null, display: '—' },
    renewal: { value: null, display: '—' },
    transfer: { value: null, display: '—' },
    whoisPrivacy: { value: null, display: '—' },
    score: null,
  };
}

function summarizeTaxAndFees(taxAndFees?: string) {
  if (!taxAndFees || taxAndFees === 'None') {
    return null;
  }
  return 'Taxes or regional fees may apply';
}

export function PriceComparison({
  summaries,
  details,
  initialDetail,
  generatedAt,
  sourceName,
  sourceUrl,
  domain,
}: PriceComparisonProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const fullMode = Boolean(summaries && details && initialDetail && generatedAt && sourceName && sourceUrl);
  const fallbackTld = useMemo(() => {
    const raw = (domain || '').trim().toLowerCase();
    if (!raw.includes('.')) {
      return '.com';
    }
    return `.${raw.split('.').slice(1).join('.')}`;
  }, [domain]);

  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('recommended');
  const [selectedTld, setSelectedTld] = useState(initialDetail?.tld ?? fallbackTld);
  const [detail, setDetail] = useState<TldPricingDetail | null>(initialDetail ?? null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);
  const [canScrollTable, setCanScrollTable] = useState(false);
  const [isScrolledToStart, setIsScrolledToStart] = useState(true);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  const topScrollbarRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const syncScrollRef = useRef(false);
  const [meta, setMeta] = useState({
    generatedAt: generatedAt ?? '',
    sourceName: sourceName ?? 'TLD-List',
    sourceUrl: sourceUrl ?? 'https://tld-list.com/',
  });

  const detailsByTld = useMemo(() => {
    const map = new Map<string, TldPricingDetail>();
    for (const entry of details ?? []) {
      map.set(entry.tld.toLowerCase(), entry);
    }
    return map;
  }, [details]);

  const tableRegistrars = TOP_COMPARISON_REGISTRARS;

  const filteredSummaries = useMemo(() => {
    if (!summaries) {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();
    const base = normalizedQuery
      ? summaries.filter((item) => item.tld.toLowerCase().includes(normalizedQuery.replace(/^\./, '.')))
      : summaries;

    const sorted = [...base];
    sorted.sort((a, b) => {
      const detailA = detailsByTld.get(a.tld.toLowerCase()) ?? null;
      const detailB = detailsByTld.get(b.tld.toLowerCase()) ?? null;
      const coverageA = detailA
        ? tableRegistrars.reduce((count, registrar) => count + (getRegistrarOfferForTld(detailA, registrar)?.registration.value != null ? 1 : 0), 0)
        : 0;
      const coverageB = detailB
        ? tableRegistrars.reduce((count, registrar) => count + (getRegistrarOfferForTld(detailB, registrar)?.registration.value != null ? 1 : 0), 0)
        : 0;

      switch (sortKey) {
        case 'recommended':
          return 0;
        case 'coverage':
          if (coverageA !== coverageB) {
            return coverageB - coverageA;
          }
          return (a.cheapestRegistration.value ?? Number.POSITIVE_INFINITY) - (b.cheapestRegistration.value ?? Number.POSITIVE_INFINITY);
        case 'alphabetical':
          return a.tld.localeCompare(b.tld);
        case 'renewal':
          return (a.cheapestRenewal.value ?? Number.POSITIVE_INFINITY) - (b.cheapestRenewal.value ?? Number.POSITIVE_INFINITY);
        case 'transfer':
          return (a.cheapestTransfer.value ?? Number.POSITIVE_INFINITY) - (b.cheapestTransfer.value ?? Number.POSITIVE_INFINITY);
        case 'value':
          return (b.bestValue.score ?? Number.NEGATIVE_INFINITY) - (a.bestValue.score ?? Number.NEGATIVE_INFINITY);
        case 'registration':
        default:
          return (a.cheapestRegistration.value ?? Number.POSITIVE_INFINITY) - (b.cheapestRegistration.value ?? Number.POSITIVE_INFINITY);
      }
    });

    return sorted;
  }, [detailsByTld, query, sortKey, summaries, tableRegistrars]);

  const tableRows = useMemo(() => {
    return filteredSummaries.map((summary) => {
      const rowDetail = detailsByTld.get(summary.tld.toLowerCase()) ?? null;
      const prices = tableRegistrars.map((registrar) => {
        const offer = rowDetail ? getRegistrarOfferForTld(rowDetail, registrar) : null;
        return {
          registrar,
          value: offer?.registration.value ?? null,
          display: offer?.registration.display ?? '—',
        };
      });

      return {
        summary,
        coverage: prices.filter((price) => price.value != null).length,
        prices,
      };
    });
  }, [detailsByTld, filteredSummaries, tableRegistrars]);

  const selectedRegistrarOffers = useMemo(() => {
    if (!detail) {
      return [];
    }
    return tableRegistrars.map((registrar) => getRegistrarOfferForTld(detail, registrar) ?? makeEmptyOffer(registrar));
  }, [detail, tableRegistrars]);

  const selectedSupportCount = useMemo(
    () => selectedRegistrarOffers.filter((offer) => offer.registration.value != null).length,
    [selectedRegistrarOffers]
  );

  const updateScrollState = useCallback(() => {
    const tableScroller = tableScrollRef.current;
    if (!tableScroller) {
      return;
    }

    const nextCanScroll = tableScroller.scrollWidth > tableScroller.clientWidth + 4;
    setTableScrollWidth(tableScroller.scrollWidth);
    setCanScrollTable(nextCanScroll);
    setIsScrolledToStart(tableScroller.scrollLeft <= 4);
    setIsScrolledToEnd(tableScroller.scrollLeft + tableScroller.clientWidth >= tableScroller.scrollWidth - 4);
  }, []);

  const syncScrollPosition = useCallback((source: 'top' | 'table') => {
    const topScroller = topScrollbarRef.current;
    const tableScroller = tableScrollRef.current;

    if (!topScroller || !tableScroller || syncScrollRef.current) {
      return;
    }

    syncScrollRef.current = true;
    if (source === 'top') {
      tableScroller.scrollLeft = topScroller.scrollLeft;
    } else {
      topScroller.scrollLeft = tableScroller.scrollLeft;
    }
    syncScrollRef.current = false;
    updateScrollState();
  }, [updateScrollState]);

  const nudgeScroll = useCallback((direction: 'left' | 'right') => {
    const tableScroller = tableScrollRef.current;
    if (!tableScroller) {
      return;
    }

    tableScroller.scrollBy({
      left: direction === 'left' ? -320 : 320,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    let active = true;

    if (fullMode) {
      const nextDetail = detailsByTld.get(selectedTld.toLowerCase()) ?? initialDetail ?? null;
      setDetail(nextDetail);
      setLoadError(nextDetail ? null : 'Unable to load registrar pricing.');
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setLoadError(null);

    fetch(`/api/tld-prices?tld=${encodeURIComponent(selectedTld)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Unable to load registrar pricing.');
        }
        return response.json();
      })
      .then((payload) => {
        if (!active) {
          return;
        }
        if (payload.meta) {
          setMeta(payload.meta as { generatedAt: string; sourceName: string; sourceUrl: string });
        }
        setDetail(payload.detail as TldPricingDetail);
      })
      .catch((error: Error) => {
        if (!active) {
          return;
        }
        setLoadError(error.message);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [detailsByTld, fullMode, initialDetail, selectedTld]);

  useEffect(() => {
    updateScrollState();

    const handleResize = () => updateScrollState();
    window.addEventListener('resize', handleResize);

    const tableScroller = tableScrollRef.current;
    const resizeObserver = typeof ResizeObserver !== 'undefined' && tableScroller
      ? new ResizeObserver(() => updateScrollState())
      : null;

    if (resizeObserver && tableScroller) {
      resizeObserver.observe(tableScroller);
      if (tableScroller.firstElementChild instanceof HTMLElement) {
        resizeObserver.observe(tableScroller.firstElementChild);
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
    };
  }, [tableRows, updateScrollState]);

  if (!detail) {
    return (
      <div className={`glass-card border p-3 sm:p-4 ${isLight ? 'border-slate-200 shadow-sm' : 'border-white/10'}`}>
        <div className={`rounded-2xl border px-4 py-3 text-sm ${isLight ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-amber-500/20 bg-amber-500/10 text-amber-200'}`}>
          Loading registrar pricing…
        </div>
      </div>
    );
  }

  if (!fullMode) {
    return (
      <div className="space-y-4">
        <div className={`glass-card border p-3 sm:p-4 ${isLight ? 'border-slate-200 shadow-sm' : 'border-white/10'}`}>
          <div>
            <div className={`text-[11px] uppercase tracking-[0.22em] ${isLight ? 'text-slate-500' : 'text-white/45'}`}>Registrar Comparison</div>
            <h3 className="mt-1 text-2xl font-black tracking-tight">{detail.tld}</h3>
            <p className={`mt-2 text-sm ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
              Registration prices normalized from {meta.sourceName}. Promo codes and external registrar redirects are removed.
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MetricCard isLight={isLight} label="Cheapest Reg" value={detail.cheapestRegistration.price ?? '—'} meta={detail.cheapestRegistration.registrar ?? '—'} />
            <MetricCard isLight={isLight} label="Cheapest Renew" value={detail.cheapestRenewal.price ?? '—'} meta={detail.cheapestRenewal.registrar ?? '—'} />
            <MetricCard isLight={isLight} label="Cheapest Transfer" value={detail.cheapestTransfer.price ?? '—'} meta={detail.cheapestTransfer.registrar ?? '—'} />
            <MetricCard isLight={isLight} label="Best Value" value={detail.bestValue.score?.toFixed(2) ?? '—'} meta={detail.bestValue.registrar ?? '—'} />
          </div>
        </div>

        <div className={`glass-card border p-3 sm:p-4 ${isLight ? 'border-slate-200 shadow-sm' : 'border-white/10'}`}>
          <div className="mb-3">
            <h4 className="text-lg font-bold">Top 10 Registrars</h4>
            <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-white/55'}`}>
              Showing only the selected top registrar set for {detail.tld}.
            </p>
          </div>

          <div className="space-y-3">
            {selectedRegistrarOffers.map((offer) => (
              <RegistrarCard key={`${detail.tld}-${offer.registrar}`} offer={offer} isLight={isLight} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className={`glass-card border p-3 sm:p-4 ${isLight ? 'border-slate-200 shadow-sm' : 'border-white/10'}`}>
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.22em]">
              <span className={isLight ? 'text-slate-500' : 'text-white/45'}>Top 50 TLD Pricing</span>
              <span className={`rounded-full px-2 py-1 ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-white/50'}`}>
                10 registrars only
              </span>
              <span className={`rounded-full px-2 py-1 ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-white/50'}`}>
                Regular prices only
              </span>
            </div>
            <h3 className="text-lg font-black tracking-tight sm:text-xl">Top 50 Most Registered TLDs Across 10 Registrars</h3>
            <p className={`max-w-3xl text-[13px] leading-5 sm:text-sm sm:leading-6 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
              Compare regular registration prices for the highest-signal extensions people actually register most often, led by .com, .net, .org, .ai, .io, and .co. Promo codes and outbound source links are removed.
            </p>
          </div>

          <div className={`grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 ${isLight ? 'text-slate-700' : 'text-white/75'}`}>
            <div className={`rounded-xl border px-2.5 py-2 ${metricTone(isLight)}`}>
              <div className={`text-[11px] uppercase tracking-[0.18em] ${isLight ? 'text-slate-500' : 'text-white/45'}`}>Coverage</div>
              <div className="mt-1 text-base font-bold">{summaries?.length ?? 0} TLDs</div>
            </div>
            <div className={`rounded-xl border px-2.5 py-2 ${metricTone(isLight)}`}>
              <div className={`text-[11px] uppercase tracking-[0.18em] ${isLight ? 'text-slate-500' : 'text-white/45'}`}>Registrars</div>
              <div className="mt-1 text-base font-bold">{tableRegistrars.length}</div>
            </div>
            <div className={`rounded-xl border px-2.5 py-2 ${metricTone(isLight)}`}>
              <div className={`text-[11px] uppercase tracking-[0.18em] ${isLight ? 'text-slate-500' : 'text-white/45'}`}>Updated</div>
              <div className="mt-1 text-base font-bold">{formatDate(meta.generatedAt)}</div>
            </div>
            <div className={`rounded-xl border px-2.5 py-2 ${metricTone(isLight)}`}>
              <div className={`text-[11px] uppercase tracking-[0.18em] ${isLight ? 'text-slate-500' : 'text-white/45'}`}>Selected</div>
              <div className="mt-1 text-base font-bold">{detail.tld}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className={`glass-card border p-3 sm:p-4 ${isLight ? 'border-slate-200 shadow-sm' : 'border-white/10'}`}>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a TLD like .ai, .in, .com"
              className="h-10"
            />
            <div className="flex items-center gap-2">
              <label className={`text-xs font-semibold uppercase tracking-[0.18em] ${isLight ? 'text-slate-500' : 'text-white/45'}`} htmlFor="compare-sort">
                Sort
              </label>
              <select
                id="compare-sort"
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                className={`h-10 min-w-[164px] rounded-xl border px-3 text-sm outline-none transition-colors ${
                  isLight ? 'border-slate-200 bg-white text-slate-900' : 'border-white/10 bg-white/[0.04] text-white'
                }`}
              >
                <option value="recommended">Most popular</option>
                <option value="coverage">Most coverage</option>
                <option value="registration">Cheapest registration</option>
                <option value="renewal">Cheapest renewal</option>
                <option value="transfer">Cheapest transfer</option>
                <option value="value">Best value score</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>

          <div className={`mb-3 flex items-center justify-between text-xs ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
            <span>{filteredSummaries.length} extensions</span>
            <span>Registration price matrix for the selected 10 registrars</span>
          </div>

          {canScrollTable && (
            <div className={`mb-3 rounded-xl border px-3 py-2 ${isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/10 bg-white/[0.03]'}`}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className={`text-xs font-semibold uppercase tracking-[0.16em] ${isLight ? 'text-slate-600' : 'text-white/65'}`}>
                  Scroll sideways to compare all 10 registrars
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => nudgeScroll('left')}
                    disabled={isScrolledToStart}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${isLight ? 'border-slate-200 bg-white text-slate-700 disabled:text-slate-300' : 'border-white/10 bg-white/[0.04] text-white/80 disabled:text-white/25'}`}
                  >
                    ← Left
                  </button>
                  <button
                    type="button"
                    onClick={() => nudgeScroll('right')}
                    disabled={isScrolledToEnd}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${isLight ? 'border-slate-200 bg-white text-slate-700 disabled:text-slate-300' : 'border-white/10 bg-white/[0.04] text-white/80 disabled:text-white/25'}`}
                  >
                    Right →
                  </button>
                </div>
              </div>

              <div
                ref={topScrollbarRef}
                onScroll={() => syncScrollPosition('top')}
                className="overflow-x-auto overflow-y-hidden rounded-full"
              >
                <div className="h-2 rounded-full bg-transparent" style={{ width: `${tableScrollWidth}px` }} />
              </div>
            </div>
          )}

          <div className="relative">
            {!isScrolledToStart && <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-8 bg-gradient-to-r from-[var(--bg-main)] to-transparent" />}
            {!isScrolledToEnd && <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-8 bg-gradient-to-l from-[var(--bg-main)] to-transparent" />}

            <div
              ref={tableScrollRef}
              onScroll={() => syncScrollPosition('table')}
              className="overflow-auto rounded-xl border border-white/10"
            >
            <table className="min-w-[1120px] w-full text-sm">
              <thead className={isLight ? 'bg-slate-50' : 'bg-white/[0.03]'}>
                <tr>
                  <th className={`sticky left-0 z-10 min-w-[132px] px-4 py-2 text-left text-xs uppercase tracking-[0.18em] ${isLight ? 'bg-slate-50 text-slate-500' : 'bg-[#111] text-white/45'}`}>TLD</th>
                  <th className={`min-w-[92px] px-3 py-2 text-left text-xs uppercase tracking-[0.14em] ${isLight ? 'text-slate-500' : 'text-white/45'}`}>Listed</th>
                  {tableRegistrars.map((registrar) => (
                    <th key={registrar} className={`min-w-[106px] px-3 py-2 text-left text-xs uppercase tracking-[0.14em] ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
                      {registrar}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map(({ summary, coverage, prices }) => {
                  const active = summary.tld === selectedTld;
                  return (
                    <tr
                      key={summary.tld}
                      role="button"
                      tabIndex={0}
                      aria-pressed={active}
                      onClick={() => setSelectedTld(summary.tld)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setSelectedTld(summary.tld);
                        }
                      }}
                      className={`cursor-pointer border-t transition-colors ${isLight ? 'border-slate-200 hover:bg-slate-50/60 focus-within:bg-slate-50/70' : 'border-white/10 hover:bg-white/[0.035] focus-within:bg-white/[0.05]'} ${active ? (isLight ? 'bg-slate-50/70' : 'bg-white/[0.05]') : ''}`}
                    >
                      <td className={`sticky left-0 z-10 min-w-[132px] px-4 py-3 ${active ? (isLight ? 'bg-slate-900 text-white shadow-[inset_-1px_0_0_rgba(255,255,255,0.08)]' : 'bg-white/[0.08] text-white shadow-[inset_-1px_0_0_rgba(255,255,255,0.08)]') : isLight ? 'bg-white text-slate-900' : 'bg-[#0f0f0f] text-white'}`}>
                        <span className="font-bold tracking-tight">
                          {summary.tld}
                        </span>
                      </td>
                      <td className={`whitespace-nowrap px-3 py-3 font-medium ${active ? (isLight ? 'text-slate-900' : 'text-white') : isLight ? 'text-slate-600' : 'text-white/55'}`}>{coverage}/{tableRegistrars.length}</td>
                      {prices.map((price) => (
                        <td key={`${summary.tld}-${price.registrar}`} className={`whitespace-nowrap px-3 py-3 ${isLight ? 'text-slate-700' : 'text-white/75'}`}>
                          <span className={price.value == null ? (isLight ? 'text-slate-400' : 'text-white/30') : ''}>{price.display}</span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          <p className={`mt-2 text-xs ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
            Entries shown as — mean that registrar is not currently listed for that extension on TLD-List. Where TLD-List shows a promo plus a regular price, the regular price is shown here.
          </p>
        </div>

        <div className="space-y-3">
          <div className={`glass-card border p-3 sm:p-4 ${isLight ? 'border-slate-200 shadow-sm' : 'border-white/10'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className={`text-[11px] uppercase tracking-[0.22em] ${isLight ? 'text-slate-500' : 'text-white/45'}`}>Selected Extension</div>
                <h3 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">{detail.tld}</h3>
                <p className={`mt-1.5 text-[13px] sm:text-sm ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                  Top-10 registrar comparison for {detail.tld}. All displayed prices are normalized regular prices with source promo terms removed.
                </p>
                <p className={`mt-1 text-xs ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
                  {selectedSupportCount}/{tableRegistrars.length} tracked registrars currently list this extension.
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MetricCard isLight={isLight} label="Cheapest Reg" value={detail.cheapestRegistration.price ?? '—'} meta={detail.cheapestRegistration.registrar ?? '—'} />
              <MetricCard isLight={isLight} label="Cheapest Renew" value={detail.cheapestRenewal.price ?? '—'} meta={detail.cheapestRenewal.registrar ?? '—'} />
              <MetricCard isLight={isLight} label="Cheapest Transfer" value={detail.cheapestTransfer.price ?? '—'} meta={detail.cheapestTransfer.registrar ?? '—'} />
              <MetricCard isLight={isLight} label="Best Value" value={detail.bestValue.score?.toFixed(2) ?? '—'} meta={detail.bestValue.registrar ?? '—'} />
            </div>
          </div>

          <div className={`glass-card border p-3 sm:p-4 ${isLight ? 'border-slate-200 shadow-sm' : 'border-white/10'}`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-bold">Top 10 Registrar Breakdown</h4>
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-white/55'}`}>
                  Registrar-wise pricing for {detail.tld}. No outbound redirects.
                </p>
              </div>
              {loading && <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/45'}`}>Loading…</span>}
            </div>

            {loadError ? (
              <div className={`rounded-2xl border px-4 py-3 text-sm ${isLight ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-rose-500/20 bg-rose-500/10 text-rose-200'}`}>
                {loadError}
              </div>
            ) : (
              <div className="space-y-3">
                {selectedRegistrarOffers.map((offer) => (
                  <RegistrarCard key={`${detail.tld}-${offer.registrar}`} offer={offer} isLight={isLight} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  isLight,
  label,
  value,
  meta,
}: {
  isLight: boolean;
  label: string;
  value: string;
  meta: string;
}) {
  return (
    <div className={`rounded-xl border p-2.5 sm:p-3 ${metricTone(isLight)}`}>
      <div
        className={`min-h-[1.65rem] text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] break-words ${isLight ? 'text-slate-500' : 'text-white/45'}`}
      >
        {label}
      </div>
      <div className="mt-1.5 text-base font-bold sm:text-lg">{value}</div>
      <div className={`mt-0.5 text-xs leading-5 ${isLight ? 'text-slate-500' : 'text-white/45'}`}>{meta}</div>
    </div>
  );
}

function RegistrarCard({ offer, isLight }: { offer: RegistrarOffer; isLight: boolean }) {
  const isUnsupported =
    offer.registration.value == null &&
    offer.renewal.value == null &&
    offer.transfer.value == null &&
    offer.whoisPrivacy.value == null &&
    offer.whoisPrivacy.display !== 'Unsupported';
  const taxHint = summarizeTaxAndFees(offer.taxAndFees);

  return (
    <div className={`rounded-xl border p-3 ${priceCellTone(isLight)}`}>
      <div className="flex flex-col gap-2.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h5 className="text-base font-bold">{offer.registrar}</h5>
            {isUnsupported && (
              <span className={`rounded-full px-2 py-1 text-[11px] ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-white/55'}`}>
                Not listed for this TLD
              </span>
            )}
            {offer.score != null && (
              <span className={`rounded-full border px-2 py-1 text-[11px] ${isLight ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-white/10 bg-white/[0.05] text-white/72'}`}>
                Score {offer.score.toFixed(2)}
              </span>
            )}
          </div>
          <div className={`mt-1 flex flex-wrap gap-3 text-xs ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
            {taxHint && <span>{taxHint}</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 2xl:grid-cols-4">
          <MetricCard isLight={isLight} label="Registration" value={offer.registration.display ?? '—'} meta={isUnsupported ? 'Not listed' : 'Standard registration'} />
          <MetricCard isLight={isLight} label="Renewal" value={offer.renewal.display ?? '—'} meta={isUnsupported ? 'Not listed' : 'Standard renewal'} />
          <MetricCard isLight={isLight} label="Transfer" value={offer.transfer.display ?? '—'} meta={isUnsupported ? 'Not listed' : 'Standard transfer'} />
          <MetricCard
            isLight={isLight}
            label="Privacy"
            value={offer.whoisPrivacy.display ?? '—'}
            meta={
              offer.whoisPrivacy.display === 'Unsupported'
                ? 'Unavailable'
                : offer.whoisPrivacy.value === 0
                  ? 'Included'
                  : isUnsupported
                    ? 'Not listed'
                    : 'Extra cost'
            }
          />
        </div>

        {offer.features?.length ? (
          <div className="mt-0.5 text-xs">
            {offer.features?.length ? (
              <div className={`flex flex-wrap gap-2 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                {offer.features.slice(0, 5).map((feature) => (
                  <span key={feature} className={`rounded-full px-2 py-1 ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>
                    {feature}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
