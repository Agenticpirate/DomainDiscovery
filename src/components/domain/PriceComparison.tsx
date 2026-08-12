'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/contexts/ThemeContext';
import {
  MATRIX_PAGE_DESKTOP,
  MATRIX_PAGE_MOBILE,
  MATRIX_PAGE_STEP,
  REGISTRAR_LOGO_PATHS,
  TOP_COMPARISON_REGISTRARS,
  type RegistrarOffer,
  type TldMatrixRow,
  type TldPricingDetail,
} from '@/lib/tldPriceTypes';

interface PriceComparisonProps {
  /** Slim matrix preview (or full). Omit for compact domain-only widget. */
  matrixRows?: TldMatrixRow[];
  /** When true, fetch remaining TLDs from /api/tld-prices?mode=matrix after mount */
  loadFullMatrix?: boolean;
  totalExtensionCount?: number;
  initialDetail?: TldPricingDetail;
  generatedAt?: string;
  sourceName?: string;
  sourceUrl?: string;
  /** Compact mode: load one TLD from domain string via API */
  domain?: string;
}

type SortKey = 'recommended' | 'coverage' | 'registration' | 'renewal' | 'transfer' | 'value' | 'alphabetical';
type MatrixPriceKey = 'registration' | 'renewal' | 'transfer';
type DetailSortKey = 'registration' | 'renewal' | 'transfer' | 'score' | 'name';

const QUICK_TLDS = ['.com', '.net', '.org', '.ai', '.io', '.co', '.app', '.dev', '.xyz', '.shop', '.store', '.online'];

function formatDate(value: string) {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed);
}

function panelTone(isLight: boolean) {
  return isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-white/10 bg-[#0c0c0e]';
}

function formatMoney(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `$${value.toFixed(2)}`;
}

function cellForKey(cell: TldMatrixRow['cells'][number], key: MatrixPriceKey) {
  if (key === 'registration') return { value: cell.rv, display: formatMoney(cell.rv) };
  if (key === 'renewal') return { value: cell.wv, display: formatMoney(cell.wv) };
  return { value: cell.tv, display: formatMoney(cell.tv) };
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

function RegistrarMark({ name, isLight, size = 'sm' }: { name: string; isLight: boolean; size?: 'sm' | 'md' }) {
  const logo = REGISTRAR_LOGO_PATHS[name];
  const dim = size === 'md' ? 'h-8 w-8' : 'h-7 w-7';
  const text = size === 'md' ? 'text-[11px]' : 'text-[9px]';
  const shell = `inline-flex ${dim} shrink-0 items-center justify-center overflow-hidden rounded-lg border ${
    isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-white/12 bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)]'
  }`;

  if (logo) {
    return (
      <span className={shell} title={name}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${logo}?v=3`}
          alt={name}
          className="h-full w-full object-contain p-[2px]"
          loading="lazy"
          decoding="async"
          width={32}
          height={32}
        />
      </span>
    );
  }

  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={`inline-flex ${dim} shrink-0 items-center justify-center rounded-lg border font-bold ${text} ${
        isLight ? 'border-slate-200 bg-slate-100 text-slate-600' : 'border-white/10 bg-white/[0.06] text-white/65'
      }`}
      title={name}
    >
      {initials}
    </span>
  );
}


function MetricCard({
  isLight,
  label,
  labelShort,
  value,
  meta,
  emphasize = false,
}: {
  isLight: boolean;
  label: string;
  labelShort?: string;
  value: string;
  meta: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`rounded-md sm:rounded-xl border px-1.5 py-1 sm:p-3 min-w-0 ${
        emphasize
          ? isLight
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-white/25 bg-[#121214] text-white ring-1 ring-white/20'
          : isLight
            ? 'bg-white border-slate-200'
            : 'bg-[#121214] border-white/10'
      }`}
    >
      <div
        className={`text-[7px] sm:text-[10px] font-semibold uppercase leading-none tracking-[0.08em] sm:tracking-[0.1em] ${
          emphasize
            ? isLight
              ? 'text-white/55'
              : 'text-white/45'
            : isLight
              ? 'text-slate-500'
              : 'text-white/45'
        }`}
      >
        <span className="sm:hidden">{labelShort || label}</span>
        <span className="hidden sm:inline">{label}</span>
      </div>
      <div className="mt-0.5 text-[13px] sm:text-lg font-black tabular-nums leading-none sm:leading-tight">
        {value}
      </div>
      <div
        className={`mt-0.5 truncate text-[9px] sm:text-[11px] leading-none sm:leading-tight ${
          emphasize
            ? isLight
              ? 'text-white/55'
              : 'text-white/40'
            : isLight
              ? 'text-slate-500'
              : 'text-white/45'
        }`}
        title={meta}
      >
        {meta}
      </div>
    </div>
  );
}

function RegistrarCard({
  offer,
  isLight,
  rank,
  isCheapestReg,
  isCheapestRenew,
  isBestValue,
}: {
  offer: RegistrarOffer;
  isLight: boolean;
  rank: number;
  isCheapestReg?: boolean;
  isCheapestRenew?: boolean;
  isBestValue?: boolean;
}) {
  const isUnsupported =
    offer.registration.value == null &&
    offer.renewal.value == null &&
    offer.transfer.value == null;

  const displayName =
    offer.registrar === 'Unstoppable Domains' ? 'Unstoppable' : offer.registrar;

  return (
    <div
      className={`rounded-md sm:rounded-xl border p-1.5 sm:p-3 transition-colors ${
        isCheapestReg
          ? isLight
            ? 'border-slate-900/30 bg-slate-50'
            : 'border-white/20 bg-[#121214]'
          : isLight
            ? 'border-slate-200 bg-white hover:border-slate-300'
            : 'border-white/10 bg-[#0a0a0c] hover:border-white/15'
      } ${isUnsupported ? 'opacity-60' : ''}`}
    >
      {/* Header — single compact row on mobile */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1 sm:mb-2.5 min-w-0">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <span
            className={`flex h-4 w-4 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded sm:rounded-md text-[8px] sm:text-[10px] font-black tabular-nums ${
              rank === 1
                ? isLight
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-black'
                : isLight
                  ? 'bg-slate-100 text-slate-500'
                  : 'bg-[#121214] text-white/40 border border-white/10'
            }`}
          >
            {rank}
          </span>
          <span className="hidden sm:inline-flex">
            <RegistrarMark name={offer.registrar} isLight={isLight} size="sm" />
          </span>
          <span className="sm:hidden shrink-0 scale-90 origin-left">
            <RegistrarMark name={offer.registrar} isLight={isLight} size="sm" />
          </span>
          <div className="min-w-0 flex items-center gap-1 sm:block">
            <div
              className={`truncate text-[11px] sm:text-[13px] font-bold leading-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {displayName}
            </div>
            <div className="flex flex-wrap gap-0.5 sm:gap-1 sm:mt-0.5 shrink-0">
              {isCheapestReg && (
                <span
                  className={`rounded px-1 py-px text-[7px] sm:text-[9px] font-bold uppercase tracking-wide leading-none ${
                    isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
                  }`}
                >
                  Best reg
                </span>
              )}
              {isCheapestRenew && !isCheapestReg && (
                <span
                  className={`rounded px-1 py-px text-[7px] sm:text-[9px] font-bold uppercase tracking-wide leading-none ${
                    isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-white/70'
                  }`}
                >
                  Best renew
                </span>
              )}
              {isBestValue && (
                <span
                  className={`rounded px-1 py-px text-[7px] sm:text-[9px] font-bold uppercase tracking-wide leading-none ${
                    isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-white/70'
                  }`}
                >
                  Best value
                </span>
              )}
              {isUnsupported && (
                <span className={`text-[9px] sm:text-[10px] ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                  Not listed
                </span>
              )}
            </div>
          </div>
        </div>
        {offer.score != null && (
          <span
            className={`shrink-0 rounded-full border px-1 sm:px-2 py-px sm:py-0.5 text-[8px] sm:text-[10px] font-bold tabular-nums ${
              isLight ? 'border-slate-200 text-slate-600' : 'border-white/10 text-white/55'
            }`}
          >
            {offer.score.toFixed(1)}
          </span>
        )}
      </div>

      {/* Prices — 3 cols mobile (Reg/Renew/Xfer), 4 on desktop (+Privacy) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-0.5 sm:gap-1.5">
        <PricePill isLight={isLight} label="Reg" value={offer.registration.display ?? '—'} highlight={isCheapestReg} />
        <PricePill isLight={isLight} label="Renew" value={offer.renewal.display ?? '—'} highlight={isCheapestRenew} />
        <PricePill isLight={isLight} label="Xfer" value={offer.transfer.display ?? '—'} />
        <div className="hidden sm:block">
          <PricePill
            isLight={isLight}
            label="Privacy"
            value={
              offer.whoisPrivacy.display === 'Unsupported'
                ? 'N/A'
                : offer.whoisPrivacy.value === 0
                  ? 'Free'
                  : offer.whoisPrivacy.display ?? '—'
            }
          />
        </div>
      </div>

      {offer.features && offer.features.length > 0 && (
        <div className="mt-1 sm:mt-2 flex flex-wrap gap-0.5 sm:gap-1">
          {offer.features.slice(0, 2).map((feature) => (
            <span
              key={feature}
              className={`rounded px-1 py-px sm:rounded-md sm:px-1.5 sm:py-0.5 text-[8px] sm:text-[10px] leading-tight ${
                isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#121214] text-white/50 border border-white/8'
              }`}
            >
              {feature}
            </span>
          ))}
          {offer.features.length > 2 && (
            <span
              className={`hidden sm:inline rounded-md px-1.5 py-0.5 text-[10px] ${
                isLight ? 'bg-slate-100 text-slate-500' : 'bg-[#121214] text-white/40 border border-white/8'
              }`}
            >
              +{offer.features.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function PricePill({
  isLight,
  label,
  value,
  highlight = false,
}: {
  isLight: boolean;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded sm:rounded-lg border px-0.5 py-0.5 sm:px-1.5 sm:py-1.5 text-center ${
        highlight
          ? isLight
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-white/30 bg-white text-black'
          : isLight
            ? 'border-slate-100 bg-slate-50'
            : 'border-white/10 bg-[#121214]'
      }`}
    >
      <div
        className={`text-[7px] sm:text-[9px] font-semibold uppercase tracking-wide leading-none ${
          highlight
            ? isLight
              ? 'text-white/55'
              : 'text-black/50'
            : isLight
              ? 'text-slate-400'
              : 'text-white/35'
        }`}
      >
        {label}
      </div>
      <div className="mt-px sm:mt-0.5 text-[10px] sm:text-[12px] font-bold tabular-nums leading-tight truncate">
        {value}
      </div>
    </div>
  );
}


export function PriceComparison({
  matrixRows: matrixRowsProp = [],
  loadFullMatrix = false,
  totalExtensionCount,
  initialDetail,
  generatedAt,
  sourceName,
  sourceUrl,
  domain,
}: PriceComparisonProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const tableRegistrars = TOP_COMPARISON_REGISTRARS;
  const fullMode = matrixRowsProp.length > 0 || loadFullMatrix;

  const fallbackTld = useMemo(() => {
    const raw = (domain || '').trim().toLowerCase();
    if (!raw.includes('.')) return '.com';
    return `.${raw.split('.').slice(1).join('.')}`;
  }, [domain]);

  const [matrixRows, setMatrixRows] = useState<TldMatrixRow[]>(matrixRowsProp);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [registrarFilter, setRegistrarFilter] = useState<string | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('recommended');
  const [matrixPriceKey, setMatrixPriceKey] = useState<MatrixPriceKey>('registration');
  const [detailSortKey, setDetailSortKey] = useState<DetailSortKey>('registration');
  const [selectedTld, setSelectedTld] = useState(initialDetail?.tld ?? fallbackTld);
  const [detail, setDetail] = useState<TldPricingDetail | null>(initialDetail ?? null);
  const detailCacheRef = useRef<Record<string, TldPricingDetail>>(
    initialDetail ? { [initialDetail.tld.toLowerCase()]: initialDetail } : {}
  );
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(MATRIX_PAGE_DESKTOP);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);
  const [canScrollTable, setCanScrollTable] = useState(false);
  const [isScrolledToStart, setIsScrolledToStart] = useState(true);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  const topScrollbarRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const syncScrollRef = useRef(false);
  const [meta] = useState({
    generatedAt: generatedAt ?? '',
    sourceName: sourceName ?? 'TLD-List',
    sourceUrl: sourceUrl ?? 'https://tld-list.com/',
  });

  // Mobile starts with fewer DOM rows
  useEffect(() => {
    const narrow = typeof window !== 'undefined' && window.innerWidth < 640;
    setVisibleCount(narrow ? MATRIX_PAGE_MOBILE : MATRIX_PAGE_DESKTOP);
  }, []);

  // Progressive matrix load — keep first paint tiny; expand catalog in background
  useEffect(() => {
    if (!loadFullMatrix) return;
    let active = true;
    setMatrixLoading(true);
    fetch('/api/tld-prices?mode=matrix')
      .then(async (res) => {
        if (!res.ok) throw new Error('matrix');
        return res.json();
      })
      .then((payload) => {
        if (!active) return;
        const rows = payload.matrixRows as TldMatrixRow[];
        if (Array.isArray(rows) && rows.length > 0) {
          setMatrixRows(rows);
        }
      })
      .catch(() => {
        /* keep preview rows */
      })
      .finally(() => {
        if (active) setMatrixLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadFullMatrix]);

  const normalizeExtensionQuery = useCallback((raw: string) => {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed) return '';
    return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
  }, []);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const dottedQuery = normalizeExtensionQuery(query);
    const bareQuery = normalizedQuery.replace(/^\./, '');

    let base = matrixRows;

    if (normalizedQuery) {
      base = base.filter((item) => {
        const tld = item.tld.toLowerCase();
        const bare = tld.replace(/^\./, '');
        return (
          tld.includes(normalizedQuery) ||
          tld.includes(dottedQuery) ||
          bare.includes(bareQuery) ||
          bare.startsWith(bareQuery) ||
          bare.endsWith(bareQuery)
        );
      });
    }

    if (registrarFilter !== 'all') {
      const idx = tableRegistrars.indexOf(registrarFilter as (typeof tableRegistrars)[number]);
      if (idx >= 0) {
        base = base.filter((item) => item.cells[idx]?.rv != null);
      }
    }

    const sorted = [...base];
    sorted.sort((a, b) => {
      const idx =
        registrarFilter !== 'all'
          ? tableRegistrars.indexOf(registrarFilter as (typeof tableRegistrars)[number])
          : -1;

      if (registrarFilter !== 'all' && idx >= 0 && (sortKey === 'recommended' || sortKey === 'registration')) {
        const priceA = cellForKey(a.cells[idx], matrixPriceKey).value;
        const priceB = cellForKey(b.cells[idx], matrixPriceKey).value;
        const va = priceA ?? Number.POSITIVE_INFINITY;
        const vb = priceB ?? Number.POSITIVE_INFINITY;
        if (va !== vb) return va - vb;
      }

      switch (sortKey) {
        case 'recommended':
          return 0;
        case 'coverage':
          if (a.coverage !== b.coverage) return b.coverage - a.coverage;
          return (a.cr ?? Number.POSITIVE_INFINITY) - (b.cr ?? Number.POSITIVE_INFINITY);
        case 'alphabetical':
          return a.tld.localeCompare(b.tld);
        case 'renewal':
          return (a.cw ?? Number.POSITIVE_INFINITY) - (b.cw ?? Number.POSITIVE_INFINITY);
        case 'transfer':
          return (a.ct ?? Number.POSITIVE_INFINITY) - (b.ct ?? Number.POSITIVE_INFINITY);
        case 'value':
          return (b.bv ?? Number.NEGATIVE_INFINITY) - (a.bv ?? Number.NEGATIVE_INFINITY);
        case 'registration':
        default:
          return (a.cr ?? Number.POSITIVE_INFINITY) - (b.cr ?? Number.POSITIVE_INFINITY);
      }
    });

    return sorted;
  }, [matrixPriceKey, matrixRows, normalizeExtensionQuery, query, registrarFilter, sortKey, tableRegistrars]);

  // Reset pagination when filters change
  useEffect(() => {
    const narrow = typeof window !== 'undefined' && window.innerWidth < 640;
    setVisibleCount(narrow ? MATRIX_PAGE_MOBILE : MATRIX_PAGE_DESKTOP);
  }, [query, registrarFilter, sortKey, matrixPriceKey]);

  const visibleRows = useMemo(
    () => filteredRows.slice(0, visibleCount),
    [filteredRows, visibleCount]
  );

  const tableRows = useMemo(() => {
    return visibleRows.map((row) => {
      const prices = row.cells.map((cell, i) => {
        const price = cellForKey(cell, matrixPriceKey);
        return {
          registrar: tableRegistrars[i],
          value: price.value,
          display: price.display,
        };
      });
      const priced = prices.filter((p) => p.value != null);
      const cheapestValue = priced.length ? Math.min(...priced.map((p) => p.value as number)) : null;
      return {
        summary: row,
        coverage: row.coverage,
        prices,
        cheapestValue,
      };
    });
  }, [matrixPriceKey, tableRegistrars, visibleRows]);

  const selectedRegistrarOffers = useMemo(() => {
    if (!detail) return [];
    const fromEntry = (detail.registrars ?? []).filter(
      (offer) =>
        offer.registration?.value != null ||
        offer.renewal?.value != null ||
        offer.transfer?.value != null
    );
    const offers =
      fromEntry.length > 0
        ? fromEntry
        : tableRegistrars.map((registrar) => makeEmptyOffer(registrar));

    const sorted = [...offers];
    sorted.sort((a, b) => {
      switch (detailSortKey) {
        case 'name':
          return a.registrar.localeCompare(b.registrar);
        case 'score':
          return (b.score ?? Number.NEGATIVE_INFINITY) - (a.score ?? Number.NEGATIVE_INFINITY);
        case 'renewal':
          return (a.renewal.value ?? Number.POSITIVE_INFINITY) - (b.renewal.value ?? Number.POSITIVE_INFINITY);
        case 'transfer':
          return (a.transfer.value ?? Number.POSITIVE_INFINITY) - (b.transfer.value ?? Number.POSITIVE_INFINITY);
        case 'registration':
        default:
          return (
            (a.registration.value ?? Number.POSITIVE_INFINITY) -
            (b.registration.value ?? Number.POSITIVE_INFINITY)
          );
      }
    });
    return sorted;
  }, [detail, detailSortKey, tableRegistrars]);

  const selectedSupportCount = useMemo(
    () => selectedRegistrarOffers.filter((offer) => offer.registration.value != null).length,
    [selectedRegistrarOffers]
  );

  const cheapestRegName = detail?.cheapestRegistration.registrar ?? null;
  const cheapestRenewName = detail?.cheapestRenewal.registrar ?? null;
  const bestValueName = detail?.bestValue.registrar ?? null;

  const selectTld = useCallback((tld: string) => {
    setSelectedTld(tld);
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, []);

  const jumpToExtensionQuery = useCallback(() => {
    const dotted = normalizeExtensionQuery(query);
    if (!dotted || !matrixRows.length) return;
    const exact = matrixRows.find((s) => s.tld.toLowerCase() === dotted);
    if (exact) {
      selectTld(exact.tld);
      return;
    }
    if (filteredRows.length === 1) {
      selectTld(filteredRows[0].tld);
      return;
    }
    if (filteredRows.length > 0) {
      const starts = filteredRows.find((s) => s.tld.toLowerCase().startsWith(dotted));
      selectTld((starts ?? filteredRows[0]).tld);
    }
  }, [filteredRows, matrixRows, normalizeExtensionQuery, query, selectTld]);

  const clearFilters = useCallback(() => {
    setQuery('');
    setRegistrarFilter('all');
  }, []);

  const hasActiveFilters = query.trim().length > 0 || registrarFilter !== 'all';

  useEffect(() => {
    if (!filteredRows.length) return;
    const stillVisible = filteredRows.some((s) => s.tld === selectedTld);
    if (!stillVisible) selectTld(filteredRows[0].tld);
  }, [filteredRows, selectTld, selectedTld]);

  useEffect(() => {
    if (registrarFilter === 'all') return;
    const idx = tableRegistrars.indexOf(registrarFilter as (typeof tableRegistrars)[number]);
    if (idx < 0) return;
    const scroller = tableScrollRef.current;
    if (!scroller) return;
    const isNarrow = typeof window !== 'undefined' && window.innerWidth < 640;
    const stickyW = isNarrow ? 54 : 172;
    const colW = isNarrow ? 74 : 100;
    const left = Math.max(0, stickyW + idx * colW - (isNarrow ? 40 : 80));
    scroller.scrollTo({ left, behavior: 'smooth' });
  }, [registrarFilter, tableRegistrars]);

  // Compact widget: follow domain prop
  useEffect(() => {
    if (fullMode) return;
    setSelectedTld(fallbackTld);
  }, [fallbackTld, fullMode]);

  // On-demand detail fetch (cached) — never ship all TLD details to the client
  useEffect(() => {
    let active = true;
    const key = selectedTld.toLowerCase();
    const cached = detailCacheRef.current[key];
    if (cached) {
      setDetail(cached);
      setLoadError(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setLoadError(null);

    fetch(`/api/tld-prices?tld=${encodeURIComponent(selectedTld)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load registrar pricing.');
        return response.json();
      })
      .then((payload) => {
        if (!active) return;
        const next = payload.detail as TldPricingDetail;
        detailCacheRef.current[key] = next;
        setDetail(next);
      })
      .catch((error: Error) => {
        if (!active) return;
        setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedTld]);

  const updateScrollState = useCallback(() => {
    const tableScroller = tableScrollRef.current;
    if (!tableScroller) return;
    const nextCanScroll = tableScroller.scrollWidth > tableScroller.clientWidth + 4;
    setTableScrollWidth(tableScroller.scrollWidth);
    setCanScrollTable(nextCanScroll);
    setIsScrolledToStart(tableScroller.scrollLeft <= 4);
    setIsScrolledToEnd(
      tableScroller.scrollLeft + tableScroller.clientWidth >= tableScroller.scrollWidth - 4
    );
  }, []);

  const syncScrollPosition = useCallback(
    (source: 'top' | 'table') => {
      const topScroller = topScrollbarRef.current;
      const tableScroller = tableScrollRef.current;
      if (!topScroller || !tableScroller || syncScrollRef.current) return;
      syncScrollRef.current = true;
      if (source === 'top') tableScroller.scrollLeft = topScroller.scrollLeft;
      else topScroller.scrollLeft = tableScroller.scrollLeft;
      syncScrollRef.current = false;
      updateScrollState();
    },
    [updateScrollState]
  );

  const nudgeScroll = useCallback((direction: 'left' | 'right') => {
    const tableScroller = tableScrollRef.current;
    if (!tableScroller) return;
    const step = typeof window !== 'undefined' && window.innerWidth < 640 ? 180 : 320;
    tableScroller.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    updateScrollState();
    const handleResize = () => updateScrollState();
    window.addEventListener('resize', handleResize);
    const tableScroller = tableScrollRef.current;
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' && tableScroller
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
      <div className={`rounded-2xl border p-4 sm:p-5 ${panelTone(isLight)}`}>
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            isLight ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-white/10 bg-white/[0.03] text-white/70'
          }`}
        >
          Loading registrar pricing…
        </div>
      </div>
    );
  }

  // Compact embed (e.g. enhanced homepage) — detail only, no giant matrix
  if (!fullMode) {
    return (
      <div className="space-y-3">
        <div className={`rounded-2xl border p-4 sm:p-5 ${panelTone(isLight)}`}>
          <div className={`text-[11px] uppercase tracking-[0.22em] ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
            Registrar comparison
          </div>
          <h3 className="mt-1 text-2xl font-black tracking-tight">{detail.tld}</h3>
          {loadError && (
            <p className={`mt-2 text-sm ${isLight ? 'text-rose-600' : 'text-rose-300'}`}>{loadError}</p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <MetricCard
              isLight={isLight}
              label="Cheapest reg"
              value={detail.cheapestRegistration.price ?? '—'}
              meta={detail.cheapestRegistration.registrar ?? '—'}
              emphasize
            />
            <MetricCard
              isLight={isLight}
              label="Cheapest renew"
              value={detail.cheapestRenewal.price ?? '—'}
              meta={detail.cheapestRenewal.registrar ?? '—'}
            />
          </div>
        </div>
        <div className={`rounded-2xl border p-4 sm:p-5 ${panelTone(isLight)}`}>
          <h4 className="text-sm font-bold mb-2">Top registrars</h4>
          <div className="max-h-72 space-y-1.5 overflow-y-auto">
            {selectedRegistrarOffers.slice(0, 10).map((offer, index) => (
              <RegistrarCard
                key={`${detail.tld}-${offer.registrar}`}
                offer={offer}
                isLight={isLight}
                rank={index + 1}
                isCheapestReg={offer.registrar === cheapestRegName}
                isCheapestRenew={offer.registrar === cheapestRenewName}
                isBestValue={offer.registrar === bestValueName}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const matrixLabel =
    matrixPriceKey === 'registration' ? 'Registration' : matrixPriceKey === 'renewal' ? 'Renewal' : 'Transfer';

  const availableQuickTlds = QUICK_TLDS.filter((tld) =>
    matrixRows.some((r) => r.tld.toLowerCase() === tld)
  );

  const canShowMore = visibleCount < filteredRows.length;

  return (
    <div className="space-y-2.5 sm:space-y-4">
      <div className={`rounded-xl sm:rounded-2xl border overflow-hidden ${panelTone(isLight)}`}>
        <div
          className={`border-b px-2.5 py-2.5 sm:px-4 sm:py-3.5 ${
            isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/10 bg-[#0a0a0c]'
          }`}
        >
          <div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className={`text-[14px] sm:text-lg font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Price matrix
                </h3>
                <span
                  className={`rounded-full border px-1.5 py-0.5 sm:px-2 text-[9px] sm:text-[10px] font-semibold ${
                    isLight ? 'border-slate-200 bg-white text-slate-600' : 'border-white/10 bg-[#121214] text-white/55'
                  }`}
                >
                  {filteredRows.length.toLocaleString()}
                  {totalExtensionCount && matrixRows.length < totalExtensionCount
                    ? ` / ${totalExtensionCount.toLocaleString()}`
                    : ''}{' '}
                  TLDs
                  {canShowMore ? ` · showing ${visibleRows.length}` : ''}
                  {matrixLoading ? ' · loading…' : ''}
                </span>
              </div>
              <p className={`mt-0.5 text-[11px] sm:text-[12px] ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                Viewing <span className="font-semibold">{matrixLabel.toLowerCase()}</span> list prices
              </p>
            </div>

            <div
              className={`inline-flex rounded-lg sm:rounded-xl border p-0.5 ${
                isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#121214]'
              }`}
              role="group"
              aria-label="Price type"
            >
              {(
                [
                  ['registration', 'Reg'],
                  ['renewal', 'Renew'],
                  ['transfer', 'Xfer'],
                ] as const
              ).map(([key, label]) => {
                const active = matrixPriceKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMatrixPriceKey(key)}
                    className={`rounded-md sm:rounded-lg px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold transition ${
                      active
                        ? isLight
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-black'
                        : isLight
                          ? 'text-slate-600 hover:text-slate-900'
                          : 'text-white/55 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`mt-2 sm:mt-3 grid gap-2 sm:gap-2.5 rounded-xl border p-2 sm:p-3 lg:grid-cols-[1.15fr_1fr_auto] ${
              isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#0a0a0c]'
            }`}
          >
            <label className="block min-w-0">
              <span
                className={`mb-0.5 sm:mb-1 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] ${
                  isLight ? 'text-slate-500' : 'text-white/45'
                }`}
              >
                Find extension
              </span>
              <div className="flex gap-1.5">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      jumpToExtensionQuery();
                    }
                  }}
                  placeholder="e.g. .ai · .com · hamburg"
                  aria-label="Search or jump to a domain extension"
                  className="h-9 sm:h-10 w-full text-[13px]"
                />
                <button
                  type="button"
                  onClick={jumpToExtensionQuery}
                  className={`h-9 w-9 sm:h-10 sm:w-auto sm:px-3 shrink-0 rounded-lg sm:rounded-xl border text-[11px] sm:text-xs font-bold transition flex items-center justify-center ${
                    isLight
                      ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
                      : 'border-white bg-white text-black hover:bg-white/90'
                  }`}
                >
                  Go
                </button>
              </div>
            </label>

            <label className="block min-w-0">
              <span
                className={`mb-0.5 sm:mb-1 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] ${
                  isLight ? 'text-slate-500' : 'text-white/45'
                }`}
              >
                Filter by registrar
              </span>
              <select
                id="compare-registrar-filter"
                value={registrarFilter}
                onChange={(event) => setRegistrarFilter(event.target.value)}
                aria-label="Show only extensions sold by this registrar"
                className={`h-9 sm:h-10 w-full rounded-lg sm:rounded-xl border px-2.5 sm:px-3 text-[13px] sm:text-sm font-medium outline-none ${
                  isLight
                    ? 'border-slate-200 bg-slate-50 text-slate-900'
                    : 'border-white/10 bg-[#121214] text-white'
                }`}
              >
                <option value="all">All registrars</option>
                {tableRegistrars.map((name) => (
                  <option key={name} value={name}>
                    Only {name === 'Unstoppable Domains' ? 'Unstoppable' : name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block min-w-0 lg:min-w-[150px]">
              <span
                className={`mb-0.5 sm:mb-1 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] ${
                  isLight ? 'text-slate-500' : 'text-white/45'
                }`}
              >
                Sort list
              </span>
              <select
                id="compare-sort"
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                aria-label="Sort extensions"
                className={`h-9 sm:h-10 w-full rounded-lg sm:rounded-xl border px-2.5 text-[13px] sm:text-sm font-medium outline-none ${
                  isLight
                    ? 'border-slate-200 bg-slate-50 text-slate-900'
                    : 'border-white/10 bg-[#121214] text-white'
                }`}
              >
                <option value="recommended">Most popular</option>
                <option value="coverage">Most coverage</option>
                <option value="registration">Cheapest reg</option>
                <option value="renewal">Cheapest renew</option>
                <option value="transfer">Cheapest transfer</option>
                <option value="value">Best value</option>
                <option value="alphabetical">A–Z</option>
              </select>
            </label>
          </div>

          <div className="mt-2 sm:mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide sm:flex-wrap sm:overflow-visible">
            <span
              className={`shrink-0 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] ${
                isLight ? 'text-slate-400' : 'text-white/35'
              }`}
            >
              Registrars
            </span>
            <button
              type="button"
              onClick={() => setRegistrarFilter('all')}
              className={`shrink-0 rounded-md sm:rounded-lg border px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-[11px] font-semibold transition ${
                registrarFilter === 'all'
                  ? isLight
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-white bg-white text-black'
                  : isLight
                    ? 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    : 'border-white/10 bg-[#121214] text-white/60 hover:border-white/20'
              }`}
            >
              All
            </button>
            {tableRegistrars.map((name) => {
              const active = registrarFilter === name;
              const short = name === 'Unstoppable Domains' ? 'Unstoppable' : name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setRegistrarFilter(active ? 'all' : name)}
                  title={`Show only extensions listed by ${name}`}
                  className={`shrink-0 inline-flex items-center gap-1 rounded-md sm:rounded-lg border px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-[11px] font-semibold transition ${
                    active
                      ? isLight
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-white bg-white text-black'
                      : isLight
                        ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        : 'border-white/10 bg-[#121214] text-white/70 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <RegistrarMark name={name} isLight={!active && isLight} />
                  <span className="hidden sm:inline">{short}</span>
                </button>
              );
            })}
          </div>

          {availableQuickTlds.length > 0 && (
            <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide sm:flex-wrap sm:overflow-visible">
              <span
                className={`shrink-0 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] ${
                  isLight ? 'text-slate-400' : 'text-white/35'
                }`}
              >
                Extensions
              </span>
              {availableQuickTlds.map((tld) => {
                const active = selectedTld === tld;
                return (
                  <button
                    key={tld}
                    type="button"
                    onClick={() => {
                      setQuery(tld);
                      selectTld(tld);
                    }}
                    className={`shrink-0 rounded-md sm:rounded-lg border px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold tracking-tight transition ${
                      active
                        ? isLight
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-white bg-white text-black'
                        : isLight
                          ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          : 'border-white/10 bg-[#121214] text-white/70 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {tld}
                  </button>
                );
              })}
            </div>
          )}

          {hasActiveFilters && (
            <div
              className={`mt-2.5 flex flex-wrap items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[12px] ${
                isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-white/10 bg-white/[0.03] text-white/60'
              }`}
            >
              <span className="font-semibold">
                Showing {filteredRows.length.toLocaleString()} extension
                {filteredRows.length === 1 ? '' : 's'}
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className={`ml-auto text-[11px] font-bold underline-offset-2 hover:underline ${
                  isLight ? 'text-slate-700' : 'text-white/75'
                }`}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* grid-cols-1 (minmax(0,1fr)) + min-w-0 children: without them the table's
            min-w forces the auto track to ~900px on phones and clips the detail panel */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
          <div className={`min-w-0 p-2 sm:p-4 xl:border-r ${isLight ? 'xl:border-slate-200' : 'xl:border-white/10'}`}>
            {canScrollTable && (
              <div
                className={`mb-2 sm:mb-3 flex items-center justify-between gap-2 sm:gap-3 rounded-lg sm:rounded-xl border px-2 py-1.5 sm:px-3 sm:py-2 ${
                  isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/10 bg-[#121214]'
                }`}
              >
                <div className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                  <span className="sm:hidden">Swipe for more registrars</span>
                  <span className="hidden sm:inline">Scroll horizontally for all 10 registrars</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => nudgeScroll('left')}
                    disabled={isScrolledToStart}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                      isLight
                        ? 'border-slate-200 bg-white text-slate-700 disabled:text-slate-300'
                        : 'border-white/10 bg-white/[0.04] text-white/80 disabled:text-white/25'
                    }`}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => nudgeScroll('right')}
                    disabled={isScrolledToEnd}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                      isLight
                        ? 'border-slate-200 bg-white text-slate-700 disabled:text-slate-300'
                        : 'border-white/10 bg-white/[0.04] text-white/80 disabled:text-white/25'
                    }`}
                  >
                    →
                  </button>
                </div>
              </div>
            )}

            <div className="relative">
              {!isScrolledToStart && (
                <div
                  className={`pointer-events-none absolute inset-y-0 left-0 z-20 w-4 sm:w-6 ${
                    isLight
                      ? 'bg-gradient-to-r from-white to-transparent'
                      : 'bg-gradient-to-r from-[#0c0c0e] to-transparent'
                  }`}
                />
              )}
              {!isScrolledToEnd && (
                <div
                  className={`pointer-events-none absolute inset-y-0 right-0 z-20 w-4 sm:w-6 ${
                    isLight
                      ? 'bg-gradient-to-l from-white to-transparent'
                      : 'bg-gradient-to-l from-[#0c0c0e] to-transparent'
                  }`}
                />
              )}

              <div
                ref={tableScrollRef}
                onScroll={() => syncScrollPosition('table')}
                role="region"
                aria-label="Domain price comparison matrix"
                tabIndex={0}
                className={`max-h-[min(58vh,640px)] sm:max-h-[min(62vh,640px)] overflow-auto rounded-lg sm:rounded-xl border focus:outline-none focus-visible:ring-2 ${
                  isLight
                    ? 'border-slate-200 focus-visible:ring-slate-400'
                    : 'border-white/10 focus-visible:ring-white/40'
                }`}
              >
                <div
                  ref={topScrollbarRef}
                  onScroll={() => syncScrollPosition('top')}
                  className="hidden"
                  style={{ width: `${tableScrollWidth}px` }}
                />

                <table className="w-full text-sm min-w-[720px] sm:min-w-[1080px]">
                  <caption className="sr-only">
                    Registration prices by extension and registrar. Cheapest price in each row is highlighted.
                  </caption>
                  <thead className={`sticky top-0 z-30 ${isLight ? 'bg-slate-50' : 'bg-[#111]'}`}>
                    <tr>
                      <th
                        scope="col"
                        className={`sticky left-0 z-40 w-[3.35rem] min-w-[3.35rem] max-w-[3.35rem] sm:w-auto sm:min-w-[100px] sm:max-w-none px-1.5 sm:px-3 py-1.5 sm:py-2.5 text-left text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.12em] ${
                          isLight ? 'bg-slate-50 text-slate-500' : 'bg-[#111] text-white/45'
                        }`}
                      >
                        <span className="sm:hidden">Ext</span>
                        <span className="hidden sm:inline">TLD</span>
                      </th>
                      <th
                        scope="col"
                        className={`hidden sm:table-cell min-w-[52px] sm:min-w-[72px] px-1.5 sm:px-2 py-2 sm:py-2.5 text-left text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] ${
                          isLight ? 'text-slate-500' : 'text-white/45'
                        }`}
                      >
                        Cover
                      </th>
                      {tableRegistrars.map((registrar) => {
                        const focused = registrarFilter === registrar;
                        const shortName =
                          registrar === 'Unstoppable Domains'
                            ? 'Unstoppable'
                            : registrar.length > 10
                              ? registrar.slice(0, 8) + '…'
                              : registrar;
                        return (
                          <th
                            key={registrar}
                            scope="col"
                            className={`min-w-[4.6rem] sm:min-w-[100px] px-1 sm:px-2 py-1.5 sm:py-2.5 text-left cursor-pointer transition ${
                              focused
                                ? isLight
                                  ? 'bg-slate-200/80 text-slate-900'
                                  : 'bg-white/10 text-white'
                                : isLight
                                  ? 'text-slate-600 hover:bg-slate-100/80'
                                  : 'text-white/55 hover:bg-white/[0.04]'
                            }`}
                            onClick={() => setRegistrarFilter(focused ? 'all' : registrar)}
                          >
                            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                              <RegistrarMark name={registrar} isLight={isLight} />
                              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.08em] leading-tight">
                                {registrar === 'Unstoppable Domains' ? 'Unstoppable' : registrar}
                              </span>
                              <span className="sm:hidden text-[8px] font-bold uppercase tracking-tight leading-none truncate max-w-[2.8rem]">
                                {shortName}
                              </span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={2 + tableRegistrars.length}
                          className={`px-4 py-10 text-center ${isLight ? 'text-slate-500' : 'text-white/50'}`}
                        >
                          <p className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white/80'}`}>
                            No extensions match your filters
                          </p>
                          <button
                            type="button"
                            onClick={clearFilters}
                            className={`mt-3 rounded-lg border px-3 py-1.5 text-xs font-bold ${
                              isLight
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-white bg-white text-black'
                            }`}
                          >
                            Clear filters
                          </button>
                        </td>
                      </tr>
                    ) : (
                      tableRows.map(({ summary, coverage, prices, cheapestValue }) => {
                        const active = summary.tld === selectedTld;
                        return (
                          <tr
                            key={summary.tld}
                            role="button"
                            tabIndex={0}
                            aria-pressed={active}
                            onClick={() => selectTld(summary.tld)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                selectTld(summary.tld);
                              }
                            }}
                            style={{ contentVisibility: 'auto', containIntrinsicSize: '0 36px' }}
                            className={`cursor-pointer border-t transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset ${
                              isLight
                                ? 'border-slate-100 hover:bg-slate-50/80 focus-visible:ring-slate-400'
                                : 'border-white/[0.06] hover:bg-white/[0.03] focus-visible:ring-white/30'
                            } ${active ? (isLight ? 'bg-slate-50' : 'bg-white/[0.04]') : ''}`}
                          >
                            <th
                              scope="row"
                              className={`sticky left-0 z-10 px-1.5 sm:px-3 py-1.5 sm:py-2 text-left font-black tracking-tight tabular-nums ${
                                isLight
                                  ? active
                                    ? 'bg-slate-50 text-slate-900'
                                    : 'bg-white text-slate-900'
                                  : active
                                    ? 'bg-[#121214] text-white'
                                    : 'bg-[#0c0c0e] text-white'
                              }`}
                            >
                              <span className="text-[11px] sm:text-sm">{summary.tld}</span>
                              <span className={`mt-0.5 block text-[9px] font-semibold sm:hidden ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                                {coverage}/{tableRegistrars.length}
                              </span>
                            </th>
                            <td
                              className={`hidden sm:table-cell px-2 py-2 text-[12px] tabular-nums ${
                                isLight ? 'text-slate-600' : 'text-white/55'
                              }`}
                            >
                              {coverage}/{tableRegistrars.length}
                            </td>
                            {prices.map((price) => {
                              const isCheapest =
                                price.value != null && cheapestValue != null && price.value === cheapestValue;
                              return (
                                <td
                                  key={price.registrar}
                                  className={`px-1 sm:px-2 py-1.5 sm:py-2 ${
                                    isLight ? 'text-slate-800' : 'text-white/75'
                                  }`}
                                >
                                  {price.value == null ? (
                                    <span
                                      className={`inline-flex min-w-[2.5rem] justify-center rounded-md px-1 py-0.5 text-[10px] sm:text-[12px] font-medium tabular-nums ${
                                        isLight ? 'text-slate-300' : 'text-white/25'
                                      }`}
                                    >
                                      —
                                    </span>
                                  ) : (
                                    <span
                                      className={
                                        isCheapest
                                          ? isLight
                                            ? 'inline-flex rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] sm:text-[12px] font-bold tabular-nums text-white'
                                            : 'inline-flex rounded-md bg-white px-1.5 py-0.5 text-[10px] sm:text-[12px] font-bold tabular-nums text-black'
                                          : isLight
                                            ? 'inline-flex rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] sm:text-[12px] font-semibold tabular-nums text-slate-800 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-[13px]'
                                            : 'inline-flex rounded-md border border-white/10 bg-[#121214] px-1.5 py-0.5 text-[10px] sm:text-[12px] font-semibold tabular-nums text-white/85 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-[13px]'
                                      }
                                    >
                                      {price.display}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {canShowMore && (
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((n) => n + MATRIX_PAGE_STEP)}
                  className={`rounded-xl border px-4 py-2 text-xs sm:text-sm font-bold transition ${
                    isLight
                      ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
                      : 'border-white bg-white text-black hover:bg-white/90'
                  }`}
                >
                  Show more extensions ({(filteredRows.length - visibleCount).toLocaleString()} left)
                </button>
              </div>
            )}

            <p className={`mt-2 text-[10px] sm:text-[11px] leading-snug ${isLight ? 'text-slate-500' : 'text-white/35'}`}>
              <span className="sm:hidden">
                — not listed · white pill = best in row · source {formatDate(meta.generatedAt)}
              </span>
              <span className="hidden sm:inline">
                — = not listed. Regular list prices when promo + regular both exist. Source updated{' '}
                {formatDate(meta.generatedAt)}.
              </span>
            </p>
          </div>

          <div ref={detailRef} className="min-w-0 p-2 sm:p-4 space-y-2 sm:space-y-3 border-t xl:border-t-0 border-white/10">
            <div
              className={`rounded-lg sm:rounded-xl border p-2 sm:p-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0a0a0c] border-white/10'
              }`}
            >
              <div className="flex items-center sm:items-start justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex sm:block items-baseline gap-2">
                  <div className="min-w-0">
                    <div className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.14em] ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                      Selected extension
                    </div>
                    <h3 className={`mt-0 text-lg sm:text-3xl font-black tracking-tight tabular-nums leading-none sm:mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {detail.tld}
                    </h3>
                  </div>
                  <p className={`text-[9px] sm:text-[12px] sm:mt-0.5 shrink-0 ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
                    <span className="sm:hidden">{selectedSupportCount}/{tableRegistrars.length} list it</span>
                    <span className="hidden sm:inline">
                      {selectedSupportCount}/{tableRegistrars.length} registrars list this TLD
                    </span>
                  </p>
                </div>
                {loading && (
                  <span className={`text-[10px] sm:text-[11px] ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Loading…</span>
                )}
              </div>

              <div className="mt-1.5 sm:mt-3 grid grid-cols-2 gap-1 sm:gap-2">
                <MetricCard isLight={isLight} label="Cheapest reg" labelShort="Reg" value={detail.cheapestRegistration.price ?? '—'} meta={detail.cheapestRegistration.registrar ?? '—'} emphasize />
                <MetricCard isLight={isLight} label="Cheapest renew" labelShort="Renew" value={detail.cheapestRenewal.price ?? '—'} meta={detail.cheapestRenewal.registrar ?? '—'} />
                <MetricCard isLight={isLight} label="Cheapest transfer" labelShort="Xfer" value={detail.cheapestTransfer.price ?? '—'} meta={detail.cheapestTransfer.registrar ?? '—'} />
                <MetricCard isLight={isLight} label="Best value" labelShort="Value" value={detail.bestValue.score?.toFixed(2) ?? '—'} meta={detail.bestValue.registrar ?? '—'} />
              </div>
            </div>

            <div>
              <div className="mb-1.5 sm:mb-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h4 className={`text-[12px] sm:text-sm font-bold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Registrar breakdown
                  </h4>
                  <p className={`text-[9px] sm:text-[11px] ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                    Sorted by {detailSortKey === 'score' ? 'value score' : detailSortKey}
                  </p>
                </div>
                <select
                  value={detailSortKey}
                  onChange={(event) => setDetailSortKey(event.target.value as DetailSortKey)}
                  aria-label="Sort registrars"
                  className={`h-6 sm:h-8 rounded-md sm:rounded-lg border px-1.5 sm:px-2 text-[9px] sm:text-[11px] font-medium outline-none ${
                    isLight
                      ? 'border-slate-200 bg-white text-slate-800'
                      : 'border-white/10 bg-[#121214] text-white'
                  }`}
                >
                  <option value="registration">Reg price</option>
                  <option value="renewal">Renew price</option>
                  <option value="transfer">Transfer price</option>
                  <option value="score">Value score</option>
                  <option value="name">A–Z</option>
                </select>
              </div>

              {loadError ? (
                <div
                  className={`rounded-xl border px-3 py-2.5 text-sm ${
                    isLight ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-rose-500/20 bg-rose-500/10 text-rose-200'
                  }`}
                >
                  {loadError}
                </div>
              ) : (
                <div className="max-h-[min(48vh,560px)] sm:max-h-[min(58vh,560px)] space-y-1 sm:space-y-2 overflow-y-auto pr-0.5">
                  {selectedRegistrarOffers.map((offer, index) => (
                    <RegistrarCard
                      key={`${detail.tld}-${offer.registrar}`}
                      offer={offer}
                      isLight={isLight}
                      rank={index + 1}
                      isCheapestReg={offer.registrar === cheapestRegName}
                      isCheapestRenew={offer.registrar === cheapestRenewName}
                      isBestValue={offer.registrar === bestValueName}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
