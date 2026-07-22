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

  /** Compact preview sits directly under filters, always before Guides / education */
  const resultsPreview = (
    <div
      ref={previewRef}
      id="extensions-catalog"
      className="scroll-mt-24 mb-5 sm:mb-6"
    >
      <div
        className={`shine-border rounded-2xl border p-3 sm:p-4 ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm shadow-slate-900/[0.03]'
            : 'bg-white/[0.03] border-white/10'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h2 className="text-[14px] sm:text-base font-black tracking-tight">
              {isNameSearch
                ? selectedCategory === 'All'
                  ? `Results for “${cleanKeyword}”`
                  : `“${cleanKeyword}” · ${selectedCategory}`
                : selectedCategory === 'All'
                  ? 'Browse extensions'
                  : `Browse · ${selectedCategory}`}
            </h2>
            <p className="text-[11px] sm:text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              {filteredExtensions.length === 0
                ? 'No extensions in this filter.'
                : isNameSearch
                  ? `Showing ${visibleExtensions.length} of ${filteredExtensions.length}${
                      !isChecking && hasLiveResults ? ` · ${availableCount} available` : ''
                    }`
                  : `Showing ${visibleExtensions.length} of ${filteredExtensions.length} · type a name to check availability`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => pickCategory('All')}
                className={`text-[11px] sm:text-[12px] font-semibold ${
                  isLight ? 'text-slate-600 hover:text-black' : 'text-white/55 hover:text-white/85'
                }`}
              >
                Clear filter
              </button>
            )}
            {isNameSearch && cleanKeyword && (
              <Link
                href={`/search?q=${encodeURIComponent(cleanKeyword)}`}
                className={`text-[11px] sm:text-[12px] font-bold ${
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
                      : 'bg-white/[0.04] text-white/70 border-white/12 hover:border-white/25'
                  }`}
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
                      : 'bg-white/[0.04] text-white/70 border-white/12 hover:border-white/25'
                  }`}
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
  );

  return (
    <div className="w-full">
      {/* Control panel — primary “search all extensions” */}
      <div
        id="extensions-search"
        className={`shine-border rounded-2xl border p-3 sm:p-4 mb-5 sm:mb-6 scroll-mt-24 ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm shadow-slate-900/[0.04]'
            : 'bg-white/[0.03] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
          <div>
            <p className="text-[12px] sm:text-[13px] font-bold">
              Search all {totalTlds.toLocaleString()} extensions
            </p>
            <p className="text-[10px] sm:text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
              Type a brand name to check every TLD live — filter by category anytime
            </p>
          </div>
          <span
            className={`hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border ${
              isLight
                ? 'bg-slate-50 text-slate-600 border-slate-200'
                : 'bg-white/[0.04] text-white/55 border-white/10'
            }`}
          >
            All TLDs
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <div
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
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
              placeholder={`Search all ${totalTlds.toLocaleString()} extensions (e.g. nova, pulse, studio)…`}
              className={`w-full rounded-xl pl-10 pr-10 py-3 sm:py-3.5 text-[13px] sm:text-[15px] font-medium outline-none transition-shadow ${
                isLight
                  ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200'
                  : 'bg-black/30 border border-white/10 text-white placeholder:text-white/30 focus:border-white/25 focus:ring-2 focus:ring-white/10'
              }`}
              aria-label="Search keyword across all domain extensions"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md ${
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

          <Link
            href={cleanKeyword ? `/search?q=${encodeURIComponent(cleanKeyword)}` : '/search'}
            className={`group shrink-0 inline-flex items-center justify-center gap-2 rounded-full px-4 sm:px-5 py-3 sm:py-3.5 text-[12px] sm:text-[13px] font-bold transition-all ${
              isLight
                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/15'
                : 'bg-white text-black hover:bg-white/90 shadow-lg shadow-black/30'
            }`}
          >
            <Icons.Search className="w-4 h-4" />
            <span className="whitespace-nowrap">
              {cleanKeyword ? 'Open full search' : 'Search all extensions'}
            </span>
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Status chips — scoped to active category filter */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap mt-2.5 sm:mt-3">
          {isChecking && (
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-full border ${
                isLight
                  ? 'bg-slate-50 text-slate-600 border-slate-200'
                  : 'bg-white/[0.04] text-white/60 border-white/10'
              }`}
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
                className={`text-[11px] font-medium px-2.5 py-1.5 rounded-full border ${
                  isLight
                    ? 'bg-white text-slate-500 border-slate-200'
                    : 'bg-white/[0.04] text-white/45 border-white/10'
                }`}
              >
                {takenCount} taken
              </span>
              {selectedCategory !== 'All' && (
                <span
                  className={`text-[11px] font-medium px-2.5 py-1.5 rounded-full border ${
                    isLight
                      ? 'bg-slate-50 text-slate-600 border-slate-200'
                      : 'bg-white/[0.04] text-white/45 border-white/10'
                  }`}
                >
                  {filteredExtensions.length} in filter
                </span>
              )}
            </>
          )}
          {!activeQuery && (
            <span
              className={`text-[11px] font-medium px-2.5 py-1.5 rounded-full border ${
                isLight
                  ? 'bg-slate-50 text-slate-500 border-slate-200'
                  : 'bg-white/[0.04] text-white/45 border-white/10'
              }`}
            >
              {catalogCount.toLocaleString()} listings · type a name to check all
            </span>
          )}
        </div>

        {/* Category filters — work for browse AND full name search */}
        <div
          className="mt-3 pt-3 border-t"
          style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide"
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
                className={`text-[10px] sm:text-[11px] font-semibold ${
                  isLight ? 'text-slate-600 hover:text-slate-900' : 'text-white/50 hover:text-white/80'
                }`}
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide sm:flex-wrap sm:overflow-visible">
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
              const countLabel =
                liveAvail !== undefined ? String(liveAvail) : String(baseCount);

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => pickCategory(cat)}
                  aria-pressed={active}
                  className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold whitespace-nowrap transition-all border ${
                    active
                      ? isLight
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-black border-white'
                      : isLight
                        ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        : 'bg-white/[0.03] text-white/55 border-white/10 hover:border-white/20 hover:text-white/80'
                  }`}
                >
                  {cat}
                  <span
                    className={`text-[9px] font-bold tabular-nums ${
                      active
                        ? isLight
                          ? 'text-white/60'
                          : 'text-black/50'
                        : isLight
                          ? 'text-slate-400'
                          : 'text-white/30'
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
      className={`shine-border group relative flex flex-col p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 ${
        canClick ? 'cursor-pointer' : 'cursor-default'
      } ${
        isLight
          ? 'bg-white border-slate-200 shadow-sm shadow-slate-900/[0.03]'
          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'
      }`}
    >
      <div className="flex items-start justify-between gap-1.5 mb-1">
        <div
          className={`font-mono text-[12px] sm:text-[14px] font-black tracking-tight leading-snug break-all ${
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
    </button>
  );
}
