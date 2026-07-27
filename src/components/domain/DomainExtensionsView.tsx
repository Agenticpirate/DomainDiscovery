'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';
import extensionsData from '@/data/extensions.json';

interface Extension {
  tld: string;
  name: string;
  price: string;
  available: boolean | null;
  category: string;
  checking?: boolean;
}

const EXTENSIONS_BASE_DATA = extensionsData as Array<Omit<Extension, 'available' | 'checking'>>;

/** Preferred category order for a professional browse experience */
const CATEGORY_ORDER = [
  'Featured',
  'Popular',
  'Technology',
  'Business & Commerce',
  'Professional Services',
  'Financial Services',
  'Health & Wellness',
  'Education',
  'Media & Communications',
  'Arts & Entertainment',
  'Lifestyle & Recreation',
  'Sports & Fitness',
  'Travel & Tourism',
  'Food & Beverage',
  'Real Estate',
  'Non-Profit & Community',
  'Government',
  'Generic',
  'Asia-Pacific',
  'Europe',
  'Americas',
  'International',
  'Country',
];

/** One entry per TLD (first occurrence wins) — used for name-search cards to avoid duplicates */
const UNIQUE_TLD_BASE: Array<Omit<Extension, 'available' | 'checking'>> = (() => {
  const seen = new Set<string>();
  const out: Array<Omit<Extension, 'available' | 'checking'>> = [];
  for (const ext of EXTENSIONS_BASE_DATA) {
    const key = ext.tld.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ext);
  }
  return out;
})();

const CATEGORY_SIZE = (() => {
  const map = new Map<string, number>();
  for (const ext of EXTENSIONS_BASE_DATA) {
    map.set(ext.category, (map.get(ext.category) || 0) + 1);
  }
  return map;
})();

const UNIQUE_CATEGORY_SIZE = (() => {
  const byCat = new Map<string, Set<string>>();
  for (const ext of EXTENSIONS_BASE_DATA) {
    if (!byCat.has(ext.category)) byCat.set(ext.category, new Set());
    byCat.get(ext.category)!.add(ext.tld.toLowerCase());
  }
  const map = new Map<string, number>();
  byCat.forEach((set, cat) => map.set(cat, set.size));
  return map;
})();

interface DomainExtensionsViewProps {
  searchQuery?: string;
  /** Educational content rendered after the search panel (before the TLD grid when browsing) */
  guideSlot?: React.ReactNode;
}

const checkDomainsAvailability = async (
  domains: string[]
): Promise<Map<string, { available: boolean; premium?: boolean }>> => {
  try {
    const res = await fetch('/api/domains/instant-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains }),
    });

    if (res.ok) {
      const data = await res.json();
      const resultMap = new Map();
      data.forEach((r: { domain: string; available: boolean; premium?: boolean }) => {
        resultMap.set(r.domain, { available: r.available, premium: r.premium });
      });
      return resultMap;
    }
  } catch (e) {
    console.error('Failed to check domains:', e);
  }
  return new Map();
};

export function DomainExtensionsView({ searchQuery = '', guideSlot }: DomainExtensionsViewProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Keep input + live checks in sync when arriving from /search?q=… or Full catalog
  useEffect(() => {
    if (searchQuery && searchQuery !== localSearch) {
      setLocalSearch(searchQuery);
    }
    // Only re-seed when the URL/query prop changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);
  // Browse starts on Featured so the page isn’t buried under 1,000 cards
  const [selectedCategory, setSelectedCategory] = useState<string>('Featured');
  const [extensions, setExtensions] = useState<Extension[]>(() =>
    EXTENSIONS_BASE_DATA.map((ext) => ({ ...ext, available: null, checking: false }))
  );
  const [isChecking, setIsChecking] = useState(false);
  /** Compact preview: few cards first; “View more” expands in place (above guides) */
  const PREVIEW_INITIAL = 8;
  const PREVIEW_STEP = 16;
  const [visibleCount, setVisibleCount] = useState(PREVIEW_INITIAL);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSearchRef = useRef<string>('');
  const previewRef = useRef<HTMLDivElement | null>(null);
  const selectedCategoryRef = useRef(selectedCategory);
  selectedCategoryRef.current = selectedCategory;

  const pickCategory = useCallback((cat: string) => {
    setSelectedCategory(cat);
    setVisibleCount(PREVIEW_INITIAL);
    // Stay on the preview under the filters — never jump past guides to the footer
  }, []);

  const checkAvailability = useCallback(async (keyword: string) => {
    if (!keyword.trim() || keyword === lastSearchRef.current) return;

    lastSearchRef.current = keyword;
    const cleanKeyword = keyword.toLowerCase().replace(/\s+/g, '').replace(/^\./, '');

    if (!cleanKeyword) {
      setExtensions(EXTENSIONS_BASE_DATA.map((ext) => ({ ...ext, available: null, checking: false })));
      return;
    }

    setExtensions((prev) => prev.map((ext) => ({ ...ext, checking: true, available: null })));
    setIsChecking(true);

    // Unique TLDs only — avoid checking .com twice when it lives in Featured + Popular
    const uniqueTlds = UNIQUE_TLD_BASE.map((ext) => ext.tld);
    const domainsToCheck = uniqueTlds.map((tld) => `${cleanKeyword}${tld}`);
    const batchSize = 50;
    const results = new Map<string, { available: boolean; premium?: boolean }>();

    for (let i = 0; i < domainsToCheck.length; i += batchSize) {
      // Abort if user changed keyword mid-flight
      if (lastSearchRef.current !== keyword) return;

      const batch = domainsToCheck.slice(i, i + batchSize);
      const batchResults = await checkDomainsAvailability(batch);
      batchResults.forEach((value, key) => results.set(key, value));

      setExtensions((prev) =>
        prev.map((ext) => {
          const domain = `${cleanKeyword}${ext.tld}`;
          const result = results.get(domain);
          if (result) {
            return {
              ...ext,
              available: result.available,
              checking: false,
            };
          }
          return ext;
        })
      );
    }

    if (lastSearchRef.current === keyword) {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    const query = localSearch || searchQuery;

    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    if (!query.trim()) {
      setExtensions(EXTENSIONS_BASE_DATA.map((ext) => ({ ...ext, available: null, checking: false })));
      lastSearchRef.current = '';
      return;
    }

    checkTimeoutRef.current = setTimeout(() => {
      checkAvailability(query);
    }, 400);

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [localSearch, searchQuery, checkAvailability]);

  const categories = useMemo(() => {
    const present = new Set(EXTENSIONS_BASE_DATA.map((ext) => ext.category));
    const ordered = CATEGORY_ORDER.filter((c) => present.has(c));
    const extras = Array.from(present).filter((c) => !CATEGORY_ORDER.includes(c)).sort();
    return ['All', ...ordered, ...extras];
  }, []);

  const activeQuery = (localSearch || searchQuery).trim();
  const isNameSearch = Boolean(activeQuery) && !activeQuery.startsWith('.');
  const isTldFilter = Boolean(activeQuery) && activeQuery.startsWith('.');
  const cleanKeyword = activeQuery.toLowerCase().replace(/\s+/g, '').replace(/^\./, '');

  /**
   * Category + search filtering.
   * - Category always applies (browse and full name search).
   * - Name search + All: dedupe by TLD so .com isn’t listed twice.
   * - Name search + Technology: only Technology TLDs (even if that TLD also lives in Popular).
   * - TLD filter (starts with "."): match tld / name / category text.
   */
  const filteredExtensions = useMemo(() => {
    let filtered = extensions;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((ext) => ext.category === selectedCategory);
    }

    if (isTldFilter) {
      const q = activeQuery.toLowerCase();
      filtered = filtered.filter(
        (ext) =>
          ext.tld.toLowerCase().includes(q) ||
          ext.name.toLowerCase().includes(q) ||
          ext.category.toLowerCase().includes(q)
      );
    }

    // During full name search with All, collapse duplicate TLDs (Featured+Popular .com → one card)
    if (isNameSearch && selectedCategory === 'All') {
      const seen = new Set<string>();
      filtered = filtered.filter((ext) => {
        const key = ext.tld.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    return filtered;
  }, [extensions, selectedCategory, activeQuery, isNameSearch, isTldFilter]);

  // Auto-expand Featured → All when a name search begins so users see every TLD.
  // If they already picked Technology / Country / etc., keep that filter sticky.
  const prevSearchRef = useRef('');
  useEffect(() => {
    const q = localSearch.trim();
    const prev = prevSearchRef.current;
    prevSearchRef.current = q;

    if (q && !q.startsWith('.') && !prev && selectedCategoryRef.current === 'Featured') {
      setSelectedCategory('All');
    }
  }, [localSearch]);

  // Reset preview size when the name query changes (category reset is in pickCategory)
  useEffect(() => {
    setVisibleCount(PREVIEW_INITIAL);
  }, [localSearch, searchQuery]);

  const visibleExtensions = useMemo(
    () => filteredExtensions.slice(0, visibleCount),
    [filteredExtensions, visibleCount]
  );
  const hiddenCount = Math.max(0, filteredExtensions.length - visibleExtensions.length);
  const canViewMore = hiddenCount > 0;

  const availableCount = useMemo(
    () => filteredExtensions.filter((e) => e.available === true).length,
    [filteredExtensions]
  );
  const takenCount = useMemo(
    () => filteredExtensions.filter((e) => e.available === false).length,
    [filteredExtensions]
  );

  const totalTlds = UNIQUE_TLD_BASE.length;
  const catalogCount = EXTENSIONS_BASE_DATA.length;

  /** Per-category available counts (unique TLDs) for chip badges during live search */
  const availableByCategory = useMemo(() => {
    const map = new Map<string, number>();
    const seenAll = new Set<string>();
    let allAvail = 0;

    for (const ext of extensions) {
      if (ext.available !== true) continue;
      const key = ext.tld.toLowerCase();
      // Per-category (may count same TLD in multiple categories for chip accuracy per filter)
      map.set(ext.category, (map.get(ext.category) || 0) + 1);
      if (!seenAll.has(key)) {
        seenAll.add(key);
        allAvail += 1;
      }
    }
    map.set('All', allAvail);
    return map;
  }, [extensions]);

  const hasLiveResults = extensions.some((e) => e.available !== null);

  const plate = isLight ? '#ffffff' : '#0a0a0c';
  const plateInset = isLight ? '#f8fafc' : '#121214';

  /** Compact preview sits directly under filters, always before Guides / education */
  const resultsPreview = (
    <div
      ref={previewRef}
      id="extensions-catalog"
      className="scroll-mt-20 sm:scroll-mt-24 mb-3 sm:mb-6"
    >
      <div
        className={`shine-border relative isolate overflow-hidden rounded-xl sm:rounded-2xl border p-2.5 sm:p-4 ${
          isLight
            ? 'border-slate-200 shadow-sm shadow-slate-900/[0.03]'
            : 'border-white/10'
        }`}
        style={{ backgroundColor: plate }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-0"
          style={{ backgroundColor: plate }}
        />
        <div className="relative z-[1]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <div className="min-w-0">
            <h2 className="text-[13px] sm:text-base font-black tracking-tight">
              {isNameSearch
                ? selectedCategory === 'All'
                  ? `Results for “${cleanKeyword}”`
                  : `“${cleanKeyword}” · ${selectedCategory}`
                : selectedCategory === 'All'
                  ? 'Browse extensions'
                  : `Browse · ${selectedCategory}`}
            </h2>
            <p className="text-[10px] sm:text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              {filteredExtensions.length === 0
                ? 'No extensions in this filter.'
                : isNameSearch
                  ? `Showing ${visibleExtensions.length} of ${filteredExtensions.length}${
                      !isChecking && hasLiveResults ? ` · ${availableCount} available` : ''
                    }`
                  : `Showing ${visibleExtensions.length} of ${filteredExtensions.length}`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => pickCategory('All')}
                className={`text-[10px] sm:text-[12px] font-semibold ${
                  isLight ? 'text-slate-600 hover:text-black' : 'text-white/55 hover:text-white/85'
                }`}
              >
                Clear filter
              </button>
            )}
            {isNameSearch && cleanKeyword && (
              <Link
                href={`/search?q=${encodeURIComponent(cleanKeyword)}`}
                className={`text-[10px] sm:text-[12px] font-bold ${
                  isLight ? 'text-slate-900' : 'text-white/85'
                }`}
              >
                Full search →
              </Link>
            )}
          </div>
        </div>

        {filteredExtensions.length === 0 ? (
          <div className="text-center py-10">
            <p className="font-semibold text-sm mb-1">No extensions found</p>
            <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
              Try another category or clear the filter.
            </p>
            {selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => pickCategory('All')}
                className={`mt-3 text-[12px] font-semibold ${
                  isLight ? 'text-slate-800' : 'text-white/80'
                }`}
              >
                Show all categories
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
              {visibleExtensions.map((ext) => (
                <ExtensionCard
                  key={`${ext.category}-${ext.tld}`}
                  extension={ext}
                  searchQuery={localSearch || searchQuery}
                  showFullDomain={isNameSearch}
                />
              ))}
            </div>

            {/* View more / show less — expand in place, never dump the full catalog under the page */}
            <div className="mt-3.5 sm:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
              {canViewMore && (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((n) =>
                      Math.min(n + PREVIEW_STEP, filteredExtensions.length)
                    )
                  }
                  className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[12px] sm:text-[13px] font-bold border transition-all ${
                    isLight
                      ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                      : 'bg-white text-black border-white hover:bg-white/90'
                  }`}
                >
                  View more
                  <span className="font-semibold opacity-70">(+{Math.min(PREVIEW_STEP, hiddenCount)})</span>
                </button>
              )}
              {canViewMore && filteredExtensions.length - visibleCount > PREVIEW_STEP && (
                <button
                  type="button"
                  onClick={() => setVisibleCount(filteredExtensions.length)}
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-[12px] sm:text-[13px] font-semibold border transition-all ${
                    isLight
                      ? 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      : 'text-white/70 border-white/12 hover:border-white/25'
                  }`}
                  style={isLight ? undefined : { backgroundColor: '#121214' }}
                >
                  Show all {filteredExtensions.length}
                </button>
              )}
              {!canViewMore && visibleCount > PREVIEW_INITIAL && (
                <button
                  type="button"
                  onClick={() => {
                    setVisibleCount(PREVIEW_INITIAL);
                    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }}
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-[12px] sm:text-[13px] font-semibold border transition-all ${
                    isLight
                      ? 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      : 'text-white/70 border-white/12 hover:border-white/25'
                  }`}
                  style={isLight ? undefined : { backgroundColor: '#121214' }}
                >
                  Show less
                </button>
              )}
            </div>

            {canViewMore && (
              <p
                className="text-center text-[10px] sm:text-[11px] mt-2"
                style={{ color: 'var(--text-muted)' }}
              >
                {hiddenCount} more in this filter · guides & education below
              </p>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-w-0 max-w-full">
      {/* Control panel — solid plate (dots cannot paint through) */}
      <div
        id="extensions-search"
        className={`shine-border relative isolate overflow-hidden rounded-xl sm:rounded-2xl border p-2.5 sm:p-4 mb-3 sm:mb-6 scroll-mt-20 sm:scroll-mt-24 w-full min-w-0 max-w-full ${
          isLight
            ? 'border-slate-200 shadow-sm shadow-slate-900/[0.04]'
            : 'border-white/10'
        }`}
        style={{ backgroundColor: plate }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-0"
          style={{ backgroundColor: plate }}
        />
        <div className="relative z-[1]">
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
          <div className="min-w-0">
            <p className="text-[12px] sm:text-[13px] font-bold leading-tight">
              Search all {totalTlds.toLocaleString()} extensions
            </p>
            <p className="hidden sm:block text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              Type a brand name to check every TLD live — filter by category anytime
            </p>
          </div>
          <span
            className={`hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border ${
              isLight
                ? 'bg-slate-50 text-slate-600 border-slate-200'
                : 'text-white/55 border-white/10'
            }`}
            style={isLight ? undefined : { backgroundColor: plateInset }}
          >
            All TLDs
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 sm:left-3.5 ${
                isLight ? 'text-slate-400' : 'text-white/35'
              }`}
            >
              <Icons.Search />
            </div>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && cleanKeyword) {
                  window.location.href = `/search?q=${encodeURIComponent(cleanKeyword)}`;
                }
              }}
              placeholder={`Search all ${totalTlds.toLocaleString()} TLDs…`}
              className={`w-full rounded-xl pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3.5 text-[13px] sm:text-[15px] font-medium outline-none transition-shadow ${
                isLight
                  ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200'
                  : 'border border-white/10 text-white placeholder:text-white/30 focus:border-white/25 focus:ring-2 focus:ring-white/10'
              }`}
              style={{ backgroundColor: plateInset }}
              aria-label="Search keyword across all domain extensions"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-white/40 hover:text-white/80'
                }`}
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Compact on mobile — avoid full-width blank white bar look */}
          <Link
            href={cleanKeyword ? `/search?q=${encodeURIComponent(cleanKeyword)}` : '/search'}
            className={`group shrink-0 inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-full px-3.5 py-2.5 sm:px-5 sm:py-3.5 text-[11px] sm:text-[13px] font-bold transition-all ${
              isLight
                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/15'
                : 'bg-white text-black hover:bg-white/90 shadow-lg shadow-black/30'
            }`}
          >
            <Icons.Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="whitespace-nowrap">
              {cleanKeyword ? 'Full search' : 'Search all'}
            </span>
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Status chips — scoped to active category filter */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap mt-2 sm:mt-3">
          {isChecking && (
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full border ${
                isLight
                  ? 'bg-slate-50 text-slate-600 border-slate-200'
                  : 'text-white/60 border-white/10'
              }`}
              style={isLight ? undefined : { backgroundColor: plateInset }}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                  isLight ? 'bg-slate-500' : 'bg-white/70'
                }`}
              />
              Checking
              {selectedCategory !== 'All' ? ` ${selectedCategory}` : ' all TLDs'}…
            </span>
          )}
          {!isChecking && isNameSearch && hasLiveResults && (
            <>
              <span
                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-full border ${
                  isLight
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-black border-white'
                }`}
              >
                {availableCount} available
                {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
              </span>
              <span
                className={`text-[10px] sm:text-[11px] font-medium px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full border ${
                  isLight
                    ? 'bg-white text-slate-500 border-slate-200'
                    : 'text-white/45 border-white/10'
                }`}
                style={isLight ? undefined : { backgroundColor: plateInset }}
              >
                {takenCount} taken
              </span>
              {selectedCategory !== 'All' && (
                <span
                  className={`text-[10px] sm:text-[11px] font-medium px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full border ${
                    isLight
                      ? 'bg-slate-50 text-slate-600 border-slate-200'
                      : 'text-white/45 border-white/10'
                  }`}
                  style={isLight ? undefined : { backgroundColor: plateInset }}
                >
                  {filteredExtensions.length} in filter
                </span>
              )}
            </>
          )}
          {!activeQuery && (
            <span
              className={`text-[10px] sm:text-[11px] font-medium px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full border ${
                isLight
                  ? 'bg-slate-50 text-slate-500 border-slate-200'
                  : 'text-white/45 border-white/10'
              }`}
              style={isLight ? undefined : { backgroundColor: plateInset }}
            >
              <span className="sm:hidden">{catalogCount.toLocaleString()} listings</span>
              <span className="hidden sm:inline">
                {catalogCount.toLocaleString()} listings · type a name to check all
              </span>
            </span>
          )}
        </div>

        {/* Category filters — compact enhanced strip on mobile; wrap grid on desktop */}
        <div
          className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t"
          style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)' }}
        >
          {/* Mobile header — tight, pill active state */}
          <div className="flex sm:hidden items-center justify-between gap-2 mb-1.5 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="text-[9px] font-bold uppercase tracking-[0.08em] shrink-0"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Filter
              </span>
              {selectedCategory !== 'All' && (
                <span
                  className={`inline-flex items-center max-w-[9.5rem] truncate rounded-full px-1.5 py-0.5 text-[9px] font-bold border ${
                    isLight
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-black border-white'
                  }`}
                >
                  {selectedCategory}
                </span>
              )}
            </div>
            {selectedCategory !== 'All' ? (
              <button
                type="button"
                onClick={() => pickCategory('All')}
                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                  isLight
                    ? 'bg-white text-slate-600 border-slate-200'
                    : 'text-white/65 border-white/12'
                }`}
                style={isLight ? undefined : { backgroundColor: plateInset }}
              >
                Clear
              </button>
            ) : (
              <span className="text-[9px] font-medium tabular-nums" style={{ color: 'var(--text-muted)' }}>
                swipe →
              </span>
            )}
          </div>

          {/* Desktop header */}
          <div className="hidden sm:flex items-center justify-between gap-2 mb-2">
            <span
              className="text-[11px] font-bold uppercase tracking-wide"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Categories
              {selectedCategory !== 'All' && (
                <span className="ml-1.5 normal-case tracking-normal font-semibold opacity-80">
                  · filtering {selectedCategory}
                </span>
              )}
            </span>
            {selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => pickCategory('All')}
                className={`text-[11px] font-semibold ${
                  isLight ? 'text-slate-600 hover:text-slate-900' : 'text-white/50 hover:text-white/80'
                }`}
              >
                Clear filter
              </button>
            )}
          </div>

          {/* Chip strip */}
          <div className="relative min-w-0">
            {/* Mobile right-edge fade — scroll affordance */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-7 sm:hidden"
              style={{
                background: isLight
                  ? 'linear-gradient(to right, transparent, #ffffff)'
                  : `linear-gradient(to right, transparent, ${plate})`,
              }}
            />
            <div
              className="flex flex-nowrap gap-1 overflow-x-auto overscroll-x-contain pb-0.5 -mx-0.5 px-0.5 snap-x snap-mandatory scrollbar-hide sm:flex-wrap sm:overflow-visible sm:gap-1.5 sm:snap-none sm:mx-0 sm:px-0"
              role="listbox"
              aria-label="Extension categories"
            >
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                const baseCount =
                  cat === 'All'
                    ? isNameSearch
                      ? totalTlds
                      : catalogCount
                    : isNameSearch
                      ? UNIQUE_CATEGORY_SIZE.get(cat) || CATEGORY_SIZE.get(cat) || 0
                      : CATEGORY_SIZE.get(cat) || 0;

                // During live name search show available count in that category
                const liveAvail = hasLiveResults && isNameSearch ? availableByCategory.get(cat) : undefined;
                const countNum = liveAvail !== undefined ? liveAvail : baseCount;
                const countLabel =
                  countNum >= 1000 ? countNum.toLocaleString() : String(countNum);

                return (
                  <button
                    key={cat}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => pickCategory(cat)}
                    aria-pressed={active}
                    className={`shrink-0 snap-start inline-flex items-center gap-1 sm:gap-1 rounded-full whitespace-nowrap transition-all border ${
                      active
                        ? isLight
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-black border-white shadow-[0_2px_10px_rgba(0,0,0,0.35)]'
                        : isLight
                          ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          : 'text-white/60 border-white/10 hover:border-white/20 hover:text-white/85'
                    } px-2 py-1 text-[10px] font-semibold sm:px-2.5 sm:py-1.5 sm:text-[11px]`}
                    style={
                      active || isLight
                        ? undefined
                        : { backgroundColor: plateInset }
                    }
                  >
                    <span className="leading-none">{cat === 'All' ? 'All' : cat}</span>
                    <span
                      className={`inline-flex items-center justify-center min-w-[1.1rem] rounded-full px-1 py-px text-[8px] sm:text-[9px] font-bold tabular-nums leading-none ${
                        active
                          ? isLight
                            ? 'bg-white/15 text-white/75'
                            : 'bg-black/10 text-black/55'
                          : isLight
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-white/[0.06] text-white/40'
                      }`}
                      title={
                        liveAvail !== undefined
                          ? `Available in ${cat}`
                          : `Extensions in ${cat}`
                      }
                    >
                      {countLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Extensions preview — ALWAYS before Guides & education (never under the footer) */}
      {resultsPreview}

      {/* Guides / FAQs / education sit below the compact results */}
      {guideSlot}
    </div>
  );
}

interface ExtensionCardProps {
  extension: Extension;
  searchQuery: string;
  showFullDomain?: boolean;
}

function ExtensionCard({ extension, searchQuery, showFullDomain }: ExtensionCardProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const cleanKeyword = searchQuery.toLowerCase().replace(/\s+/g, '').replace(/^\./, '');
  const fullDomain = cleanKeyword ? `${cleanKeyword}${extension.tld}` : extension.tld;

  const handleClick = () => {
    if (!searchQuery.trim()) return;

    if (extension.available) {
      window.open(
        `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(fullDomain)}`,
        '_blank',
        'noopener,noreferrer'
      );
    } else if (extension.available === false) {
      window.location.href = `/search?q=${encodeURIComponent(cleanKeyword)}`;
    }
  };

  const showStatus = searchQuery.trim() !== '' && !searchQuery.trim().startsWith('.');

  let statusLabel = '';
  let statusDot = isLight ? 'bg-slate-300' : 'bg-white/25';
  let statusText = isLight ? 'text-slate-400' : 'text-white/35';

  if (extension.checking) {
    statusLabel = 'Checking';
    statusDot = isLight ? 'bg-slate-400 animate-pulse' : 'bg-white/50 animate-pulse';
  } else if (extension.available === true) {
    statusLabel = 'Available';
    statusDot = isLight ? 'bg-slate-800' : 'bg-white';
    statusText = isLight ? 'text-slate-700' : 'text-white/80';
  } else if (extension.available === false) {
    statusLabel = 'Taken';
    statusDot = isLight ? 'bg-slate-400' : 'bg-white/35';
    statusText = isLight ? 'text-slate-500' : 'text-white/45';
  }

  const canClick = showStatus && !extension.checking && extension.available !== null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!canClick}
      title={showFullDomain && cleanKeyword ? fullDomain : extension.tld}
      className={`shine-border group relative isolate flex flex-col p-2 sm:p-3 rounded-xl border text-left transition-all duration-200 ${
        canClick ? 'cursor-pointer' : 'cursor-default'
      } ${
        isLight
          ? 'border-slate-200 shadow-sm shadow-slate-900/[0.03] hover:shadow-md'
          : 'border-white/10 hover:border-white/16'
      }`}
      style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] z-0"
        style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
      />
      <div className="relative z-[1] flex flex-col flex-1">
      <div className="flex items-start justify-between gap-1.5 mb-1">
        <div
          className={`font-mono text-[11px] sm:text-[14px] font-black tracking-tight leading-snug break-all ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          {showFullDomain && cleanKeyword ? (
            <>
              <span className={isLight ? 'text-slate-500' : 'text-white/50'}>{cleanKeyword}</span>
              <span>{extension.tld}</span>
            </>
          ) : (
            extension.tld
          )}
        </div>
        {showStatus && (
          <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${statusDot}`} title={statusLabel} />
        )}
      </div>

      <div
        className={`text-[10px] sm:text-[11px] leading-snug line-clamp-2 mb-2 min-h-[1.5rem] ${
          isLight ? 'text-slate-500' : 'text-white/45'
        }`}
      >
        {extension.name}
      </div>

      <div className="mt-auto flex items-center justify-between gap-1">
        <span
          className={`text-[11px] sm:text-[12px] font-semibold tabular-nums ${
            isLight ? 'text-slate-700' : 'text-white/70'
          }`}
        >
          {extension.price}
        </span>
        {showStatus && statusLabel && (
          <span className={`text-[9px] sm:text-[10px] font-semibold ${statusText}`}>{statusLabel}</span>
        )}
      </div>
      </div>
    </button>
  );
}
