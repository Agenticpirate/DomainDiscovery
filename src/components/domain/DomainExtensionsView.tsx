'use client';

import React, { useState, useMemo, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';
import extensionsData from '@/data/extensions.json';
import {
  clearCatalogSeed,
  normalizeCatalogKeyword,
  readCatalogSeed,
} from '@/lib/catalogHandoff';
import { resolveRegisterUrl } from '@/lib/registrars';

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

/** Always-visible filters — keeps the panel tight; rest open under “More” */
const PRIMARY_CATEGORIES = [
  'All',
  'Featured',
  'Popular',
  'Technology',
  'Business & Commerce',
  'Country',
] as const;

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
  const searchParams = useSearchParams();

  // Prefer live URL ?q=, then prop, then sessionStorage handoff from /search
  const urlQ = normalizeCatalogKeyword(searchParams.get('q') || '');
  const propQ = normalizeCatalogKeyword(searchQuery);
  const seedKeyword = urlQ || propQ;

  const [localSearch, setLocalSearch] = useState(() => seedKeyword || readCatalogSeed());
  const inputRef = useRef<HTMLInputElement | null>(null);
  const seededOnceRef = useRef(false);

  // Apply seed as soon as URL/prop is known (before paint when possible)
  useLayoutEffect(() => {
    const fromStorage = readCatalogSeed();
    const next = seedKeyword || fromStorage;
    if (!next) return;
    setLocalSearch((prev) => (prev === next ? prev : next));
    if (fromStorage) clearCatalogSeed();
    if (!seededOnceRef.current && next) {
      seededOnceRef.current = true;
      // Bring the prefilled search into view (hero sits above on mobile)
      requestAnimationFrame(() => {
        document.getElementById('extensions-search')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        inputRef.current?.focus({ preventScroll: true });
      });
    }
  }, [seedKeyword]);

  // Browse starts on Featured so the page isn’t buried under 1,000 cards
  const [selectedCategory, setSelectedCategory] = useState<string>('Featured');
  /** Availability filter during live name search */
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'taken'>('all');
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

  const { primaryCategories, moreCategories, industryCategories, regionCategories } = useMemo(() => {
    const primarySet = new Set<string>(PRIMARY_CATEGORIES);
    const primary = PRIMARY_CATEGORIES.filter((c) => categories.includes(c));
    const more = categories.filter((c) => !primarySet.has(c));
    const regionSet = new Set(['Asia-Pacific', 'Europe', 'Americas', 'International']);
    const industry = more.filter((c) => !regionSet.has(c));
    const regions = more.filter((c) => regionSet.has(c));
    return {
      primaryCategories: primary,
      moreCategories: more,
      industryCategories: industry,
      regionCategories: regions,
    };
  }, [categories]);

  const isMoreCategory = moreCategories.includes(selectedCategory);

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
   * - Status filter (available / taken) applies after category during live name search.
   */
  const categoryFilteredExtensions = useMemo(() => {
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

  const availableCount = useMemo(
    () => categoryFilteredExtensions.filter((e) => e.available === true).length,
    [categoryFilteredExtensions]
  );
  const takenCount = useMemo(
    () => categoryFilteredExtensions.filter((e) => e.available === false).length,
    [categoryFilteredExtensions]
  );

  const filteredExtensions = useMemo(() => {
    if (!isNameSearch || statusFilter === 'all') return categoryFilteredExtensions;
    if (statusFilter === 'available') {
      return categoryFilteredExtensions.filter((e) => e.available === true);
    }
    // taken — include confirmed taken only
    return categoryFilteredExtensions.filter((e) => e.available === false);
  }, [categoryFilteredExtensions, isNameSearch, statusFilter]);

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

  // Reset preview size + status filter when the name query changes
  useEffect(() => {
    setVisibleCount(PREVIEW_INITIAL);
    setStatusFilter('all');
  }, [localSearch, searchQuery]);

  // Reset preview when status filter changes
  useEffect(() => {
    setVisibleCount(PREVIEW_INITIAL);
  }, [statusFilter]);

  const visibleExtensions = useMemo(
    () => filteredExtensions.slice(0, visibleCount),
    [filteredExtensions, visibleCount]
  );
  const hiddenCount = Math.max(0, filteredExtensions.length - visibleExtensions.length);
  const canViewMore = hiddenCount > 0;

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
                ? statusFilter === 'available'
                  ? `Available · “${cleanKeyword}”`
                  : statusFilter === 'taken'
                    ? `Taken · “${cleanKeyword}”`
                    : selectedCategory === 'All'
                      ? `Results for “${cleanKeyword}”`
                      : `“${cleanKeyword}” · ${selectedCategory}`
                : selectedCategory === 'All'
                  ? 'Browse extensions'
                  : `Browse · ${selectedCategory}`}
            </h2>
            <p className="text-[10px] sm:text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              {filteredExtensions.length === 0
                ? statusFilter === 'taken'
                  ? 'No taken domains in this filter.'
                  : statusFilter === 'available'
                    ? 'No available domains in this filter yet.'
                    : 'No extensions in this filter.'
                : isNameSearch
                  ? `Showing ${visibleExtensions.length} of ${filteredExtensions.length}${
                      !isChecking && hasLiveResults && statusFilter === 'all'
                        ? ` · ${availableCount} available · ${takenCount} taken`
                        : ''
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
            <p className="font-semibold text-sm mb-1">
              {statusFilter === 'taken'
                ? 'No taken domains here'
                : statusFilter === 'available'
                  ? 'No available domains here'
                  : 'No extensions found'}
            </p>
            <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
              {statusFilter !== 'all'
                ? 'Try All, or switch category.'
                : 'Try another category or clear the filter.'}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {statusFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`text-[12px] font-semibold rounded-full px-3 py-1.5 border ${
                    isLight
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-black border-white'
                  }`}
                >
                  Show all statuses
                </button>
              )}
              {selectedCategory !== 'All' && (
                <button
                  type="button"
                  onClick={() => pickCategory('All')}
                  className={`text-[12px] font-semibold ${
                    isLight ? 'text-slate-800' : 'text-white/80'
                  }`}
                >
                  Show all categories
                </button>
              )}
            </div>
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

  /** Count badge for a category chip / option */
  const countForCategory = useCallback(
    (cat: string) => {
      const baseCount =
        cat === 'All'
          ? isNameSearch
            ? totalTlds
            : catalogCount
          : isNameSearch
            ? UNIQUE_CATEGORY_SIZE.get(cat) || CATEGORY_SIZE.get(cat) || 0
            : CATEGORY_SIZE.get(cat) || 0;
      const liveAvail =
        hasLiveResults && isNameSearch ? availableByCategory.get(cat) : undefined;
      const countNum = liveAvail !== undefined ? liveAvail : baseCount;
      return countNum >= 1000 ? countNum.toLocaleString() : String(countNum);
    },
    [isNameSearch, totalTlds, catalogCount, hasLiveResults, availableByCategory]
  );

  return (
    <div className="w-full min-w-0 max-w-full">
      {/* Control panel — single cohesive surface (no chip walls) */}
      <div
        id="extensions-search"
        className={`shine-border relative isolate overflow-hidden rounded-xl sm:rounded-2xl border p-3 sm:p-4 mb-3 sm:mb-6 scroll-mt-20 sm:scroll-mt-24 w-full min-w-0 max-w-full ${
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
        <div className="relative z-[1] space-y-2.5 sm:space-y-3">
          {/* Header — title + meta in one row */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] sm:text-[15px] font-black tracking-tight leading-tight">
                Search all {totalTlds.toLocaleString()} extensions
              </p>
              <p
                className="mt-0.5 text-[11px] sm:text-[12px] leading-snug truncate"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Type a brand · filter by category anytime
              </p>
            </div>
            <span
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tabular-nums ${
                isLight
                  ? 'bg-slate-50 text-slate-600 border-slate-200'
                  : 'text-white/55 border-white/10'
              }`}
              style={isLight ? undefined : { backgroundColor: plateInset }}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${isLight ? 'bg-emerald-500' : 'bg-emerald-400'}`}
              />
              {catalogCount.toLocaleString()} listings
            </span>
          </div>

          {/* Search + CTA */}
          <div
            className={`flex flex-col sm:flex-row sm:items-stretch gap-2 rounded-2xl border p-1.5 ${
              isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/10'
            }`}
            style={isLight ? undefined : { backgroundColor: plateInset }}
          >
            <div className="relative flex-1 min-w-0">
              <div
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isLight ? 'text-slate-400' : 'text-white/35'
                }`}
              >
                <Icons.Search />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && cleanKeyword) {
                    window.location.href = `/search?q=${encodeURIComponent(cleanKeyword)}`;
                  }
                }}
                placeholder={`Brand name · checks ${totalTlds.toLocaleString()} TLDs`}
                className={`w-full rounded-xl border-0 bg-transparent pl-9 sm:pl-10 pr-9 py-2.5 sm:py-3 text-[13px] sm:text-[15px] font-medium outline-none focus:ring-0 ${
                  isLight
                    ? 'text-slate-900 placeholder:text-slate-400'
                    : 'text-white placeholder:text-white/30'
                }`}
                aria-label="Search keyword across all domain extensions"
                autoComplete="off"
                spellCheck={false}
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <Link
              href={cleanKeyword ? `/search?q=${encodeURIComponent(cleanKeyword)}` : '/search'}
              className={`group shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-[12px] sm:text-[13px] font-bold transition-all ${
                isLight
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/15'
                  : 'bg-white text-black hover:bg-white/90 shadow-lg shadow-black/30'
              }`}
            >
              <Icons.Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">{cleanKeyword ? 'Full search' : 'Search all'}</span>
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>

          {/* Filters toolbar — one row: primary segments + more select + status */}
          <div
            className={`flex flex-col gap-2 rounded-2xl border p-1.5 sm:p-2 ${
              isLight ? 'border-slate-200/90 bg-white/60' : 'border-white/[0.08] bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {/* Primary categories — single horizontal track, no wrap scatter */}
              <div
                className="flex-1 min-w-0 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                role="listbox"
                aria-label="Extension categories"
              >
                <div className="inline-flex items-center gap-1 min-w-min pr-1">
                  {primaryCategories.map((cat) => {
                    const active = selectedCategory === cat;
                    const countLabel = countForCategory(cat);
                    const shortLabel =
                      cat === 'Business & Commerce'
                        ? 'Business'
                        : cat === 'Technology'
                          ? 'Tech'
                          : cat;

                    return (
                      <button
                        key={cat}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => pickCategory(cat)}
                        aria-pressed={active}
                        title={cat === shortLabel ? undefined : cat}
                        className={`inline-flex items-center gap-1.5 rounded-full whitespace-nowrap transition-all border px-2.5 py-1.5 text-[11px] font-semibold ${
                          active
                            ? isLight
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-white text-black border-white shadow-[0_2px_10px_rgba(0,0,0,0.35)]'
                            : isLight
                              ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                              : 'text-white/65 border-white/10 hover:border-white/20 hover:text-white/90'
                        }`}
                        style={active || isLight ? undefined : { backgroundColor: plateInset }}
                      >
                        <span className="leading-none">{shortLabel}</span>
                        <span
                          className={`inline-flex items-center justify-center min-w-[1.15rem] rounded-full px-1 py-px text-[9px] font-bold tabular-nums leading-none ${
                            active
                              ? isLight
                                ? 'bg-white/15 text-white/75'
                                : 'bg-black/10 text-black/55'
                              : isLight
                                ? 'bg-slate-100 text-slate-500'
                                : 'bg-white/[0.06] text-white/40'
                          }`}
                        >
                          {countLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Secondary categories — compact select (no chip wall) */}
              {moreCategories.length > 0 && (
                <div className="relative shrink-0">
                  <label htmlFor="ext-more-category" className="sr-only">
                    Industry and region categories
                  </label>
                  <select
                    id="ext-more-category"
                    value={isMoreCategory ? selectedCategory : ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      pickCategory(v || 'All');
                    }}
                    className={`appearance-none cursor-pointer rounded-full border pl-2.5 pr-7 py-1.5 text-[11px] font-semibold outline-none transition-colors max-w-[9.5rem] sm:max-w-[12rem] truncate ${
                      isMoreCategory
                        ? isLight
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-black border-white'
                        : isLight
                          ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          : 'text-white/70 border-white/10 hover:border-white/20'
                    }`}
                    style={
                      isMoreCategory || isLight ? undefined : { backgroundColor: plateInset }
                    }
                    aria-label="More categories: industry and regions"
                  >
                    <option value="">
                      {isMoreCategory ? 'Clear more…' : `More · ${moreCategories.length}`}
                    </option>
                    {industryCategories.length > 0 && (
                      <optgroup label="Industry">
                        {industryCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat} ({countForCategory(cat)})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {regionCategories.length > 0 && (
                      <optgroup label="Regions">
                        {regionCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat} ({countForCategory(cat)})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <svg
                    className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 ${
                      isMoreCategory
                        ? isLight
                          ? 'text-white/70'
                          : 'text-black/50'
                        : isLight
                          ? 'text-slate-400'
                          : 'text-white/40'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.4}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              )}

              {selectedCategory !== 'All' && selectedCategory !== 'Featured' && (
                <button
                  type="button"
                  onClick={() => pickCategory('All')}
                  className={`shrink-0 text-[11px] font-semibold px-1 ${
                    isLight ? 'text-slate-500 hover:text-slate-900' : 'text-white/45 hover:text-white/80'
                  }`}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Live availability — only when checking or results exist */}
            {(isChecking || (isNameSearch && hasLiveResults)) && (
              <div
                className={`flex items-center gap-2 flex-wrap pt-1.5 border-t ${
                  isLight ? 'border-slate-100' : 'border-white/[0.06]'
                }`}
              >
                {isChecking && (
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
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
                    Checking{selectedCategory !== 'All' ? ` ${selectedCategory}` : ' all TLDs'}…
                  </span>
                )}
                {isNameSearch && hasLiveResults && (
                  <div
                    className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 ${
                      isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10'
                    }`}
                    style={isLight ? undefined : { backgroundColor: plateInset }}
                    role="group"
                    aria-label="Filter by availability status"
                  >
                    {(
                      [
                        {
                          id: 'all' as const,
                          label: 'All',
                          n: categoryFilteredExtensions.length,
                          dot: isLight ? 'bg-slate-400' : 'bg-white/45',
                        },
                        {
                          id: 'available' as const,
                          label: 'Available',
                          n: availableCount,
                          dot: isLight ? 'bg-emerald-500' : 'bg-emerald-400',
                        },
                        {
                          id: 'taken' as const,
                          label: 'Taken',
                          n: takenCount,
                          dot: isLight ? 'bg-rose-500' : 'bg-rose-400',
                        },
                      ] as const
                    ).map((chip) => {
                      const active = statusFilter === chip.id;
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => setStatusFilter(chip.id)}
                          aria-pressed={active}
                          className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold transition-all ${
                            active
                              ? chip.id === 'available'
                                ? isLight
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-emerald-500 text-black shadow-sm'
                                : chip.id === 'taken'
                                  ? isLight
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'bg-rose-500 text-black shadow-sm'
                                  : isLight
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-white text-black shadow-sm'
                              : isLight
                                ? 'text-slate-600 hover:bg-white hover:text-slate-900'
                                : 'text-white/55 hover:bg-white/[0.06] hover:text-white/85'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full shrink-0 ${chip.dot}`}
                            aria-hidden
                          />
                          <span>
                            {chip.label}
                            <span className="ml-0.5 tabular-nums opacity-80">{chip.n}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
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
      // Default partner: Spaceship Impact affiliate (never raw merchant register URL)
      window.open(
        resolveRegisterUrl(fullDomain, 'Spaceship'),
        '_blank',
        'noopener,noreferrer'
      );
    } else if (extension.available === false) {
      // Taken: open full search so user can check aftermarket / alternatives for that name
      window.location.href = `/search?q=${encodeURIComponent(cleanKeyword)}`;
    }
  };

  const showStatus = searchQuery.trim() !== '' && !searchQuery.trim().startsWith('.');

  let statusLabel = '';
  let statusDot = isLight ? 'bg-slate-300' : 'bg-white/25';
  let statusText = isLight ? 'text-slate-400' : 'text-white/35';
  let cardBorder = isLight ? 'border-slate-200' : 'border-white/10';
  let cardHover = isLight ? 'hover:shadow-md' : 'hover:border-white/16';

  if (extension.checking) {
    statusLabel = 'Checking';
    statusDot = isLight ? 'bg-slate-400 animate-pulse' : 'bg-white/50 animate-pulse';
  } else if (extension.available === true) {
    statusLabel = 'Available';
    statusDot = isLight ? 'bg-emerald-500' : 'bg-emerald-400';
    statusText = isLight ? 'text-emerald-700' : 'text-emerald-300';
    cardBorder = isLight ? 'border-emerald-200/80' : 'border-emerald-500/25';
    cardHover = isLight
      ? 'hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-900/5'
      : 'hover:border-emerald-400/40';
  } else if (extension.available === false) {
    statusLabel = 'Taken';
    statusDot = isLight ? 'bg-rose-500' : 'bg-rose-400';
    statusText = isLight ? 'text-rose-600' : 'text-rose-300';
    cardBorder = isLight ? 'border-rose-200/70' : 'border-rose-500/20';
    cardHover = isLight
      ? 'hover:border-rose-300 hover:shadow-md hover:shadow-rose-900/5'
      : 'hover:border-rose-400/35';
  }

  const canClick = showStatus && !extension.checking && extension.available !== null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!canClick}
      title={
        showFullDomain && cleanKeyword
          ? extension.available === false
            ? `${fullDomain} · Taken — open search`
            : extension.available
              ? `${fullDomain} · Available — register`
              : fullDomain
          : extension.tld
      }
      className={`shine-border group relative isolate flex flex-col p-2 sm:p-3 rounded-xl border text-left transition-all duration-200 ${
        canClick ? 'cursor-pointer' : 'cursor-default'
      } ${cardBorder} ${
        isLight ? `shadow-sm shadow-slate-900/[0.03] ${cardHover}` : cardHover
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
          <span
            className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ring-2 ${statusDot} ${
              extension.available === true
                ? isLight
                  ? 'ring-emerald-100'
                  : 'ring-emerald-400/20'
                : extension.available === false
                  ? isLight
                    ? 'ring-rose-100'
                    : 'ring-rose-400/20'
                  : 'ring-transparent'
            }`}
            title={statusLabel}
            aria-label={statusLabel}
          />
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
          <span
            className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold ${statusText}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} aria-hidden />
            {statusLabel}
          </span>
        )}
      </div>
      </div>
    </button>
  );
}
