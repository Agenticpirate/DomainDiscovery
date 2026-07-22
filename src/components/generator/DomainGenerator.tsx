'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';
import {
  REGISTRARS,
  getRegistrarUrl,
  type RegistrarName,
} from '@/lib/registrars';
import generatorKeywords from '@/data/generator-keywords.json';

interface GeneratedDomain {
  name: string;
  available: boolean;
  premium?: boolean;
  price?: string;
  popularity: number;
  category: 'exact' | 'prefix' | 'suffix' | 'compound' | 'alternative';
}

interface DomainGeneratorProps {
  onSelect?: (domain: string) => void;
}

type FilterType = 'all' | 'starts' | 'ends' | 'available' | 'taken' | 'premium';
type SortType = 'popularity' | 'alphabetical' | 'length';
type ViewType = 'grid' | 'list';
type SeedCategory = keyof typeof generatorKeywords.seeds | 'all';

const SEED_CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  trending: 'Trending',
  tech: 'Tech',
  business: 'Business',
  creative: 'Creative',
  ecommerce: 'E‑commerce',
  health: 'Health',
  education: 'Education',
  lifestyle: 'Lifestyle',
  finance: 'Finance',
  social: 'Social',
  everyday: 'Everyday',
};

const GENERATOR_PREFIXES = generatorKeywords.prefixes as string[];
const GENERATOR_SUFFIXES = generatorKeywords.suffixes as string[];
const GENERATOR_SEMANTIC = generatorKeywords.semantic as Record<string, string[]>;
const GENERATOR_SEEDS = generatorKeywords.seeds as Record<string, string[]>;
const DISPLAY_PAGE = 120;
const CHECK_BATCH = 80;
/** Cap full generation near LDS scale while keeping the UI usable */
const MAX_GENERATED = 5000;

export function DomainGenerator({ onSelect }: DomainGeneratorProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [keyword, setKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [checkProgress, setCheckProgress] = useState({ done: 0, total: 0 });
  const [suggestions, setSuggestions] = useState<GeneratedDomain[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<GeneratedDomain[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('popularity');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [selectedRegistrar, setSelectedRegistrar] = useState<RegistrarName>('GoDaddy');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [showDomainPopup, setShowDomainPopup] = useState(false);
  const [seedCategory, setSeedCategory] = useState<SeedCategory>('trending');
  const [visibleCount, setVisibleCount] = useState(DISPLAY_PAGE);
  const [minLen, setMinLen] = useState(3);
  const [maxLen, setMaxLen] = useState(20);
  const [includeCompounds, setIncludeCompounds] = useState(true);
  const searchGenRef = React.useRef(0);

  const seedWords = useMemo(() => {
    if (seedCategory === 'all') {
      return (generatorKeywords.allSeeds as string[]).slice(0, 64);
    }
    return (GENERATOR_SEEDS[seedCategory] || []).slice(0, 40);
  }, [seedCategory]);

  const lexiconStats = generatorKeywords.stats as {
    prefixes: number;
    suffixes: number;
    seedWords: number;
    totalLexicon: number;
  };

  // Deep-link / content chips: ?q= or custom "generator-seed" event
  useEffect(() => {
    const applySeed = (value: string) => {
      const next = value.trim().toLowerCase();
      if (!next) return;
      setKeyword(next);
    };

    try {
      const q = new URLSearchParams(window.location.search).get('q');
      if (q) applySeed(q);
    } catch {
      /* ignore */
    }

    const onSeed = (e: Event) => {
      const detail = (e as CustomEvent<{ keyword?: string }>).detail;
      if (detail?.keyword) applySeed(detail.keyword);
    };
    window.addEventListener('generator-seed', onSeed as EventListener);
    return () => window.removeEventListener('generator-seed', onSeed as EventListener);
  }, []);

  // Generate as user types (debounced slightly so multi-char keywords feel smooth)
  useEffect(() => {
    if (!keyword.trim()) {
      setSuggestions([]);
      setFilteredSuggestions([]);
      setCheckProgress({ done: 0, total: 0 });
      return;
    }

    const timer = setTimeout(() => {
      void handleSearch(keyword);
    }, 180);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, includeCompounds]);

  // Apply filters and sorting (client-side on full result set)
  useEffect(() => {
    let filtered = [...suggestions];
    const cleanKeyword = keyword.toLowerCase().replace(/\s+/g, '');

    filtered = filtered.filter((d) => {
      const len = d.name.length;
      return len >= minLen && len <= maxLen;
    });

    switch (filter) {
      case 'starts':
        filtered = filtered.filter((d) => d.name.startsWith(cleanKeyword));
        break;
      case 'ends':
        filtered = filtered.filter((d) => d.name.endsWith(cleanKeyword));
        break;
      case 'available':
        filtered = filtered.filter((d) => d.available && !d.premium);
        break;
      case 'taken':
        filtered = filtered.filter((d) => !d.available && !d.premium);
        break;
      case 'premium':
        filtered = filtered.filter((d) => !!d.premium);
        break;
      case 'all':
      default:
        break;
    }

    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'length':
        filtered.sort((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name));
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => b.popularity - a.popularity || a.name.localeCompare(b.name));
        break;
    }

    setFilteredSuggestions(filtered);
  }, [suggestions, filter, sortBy, keyword, minLen, maxLen]);

  useEffect(() => {
    setVisibleCount(DISPLAY_PAGE);
  }, [keyword, filter, sortBy, minLen, maxLen]);

  const handleSearch = async (searchKeyword: string) => {
    if (!searchKeyword.trim()) return;

    const gen = ++searchGenRef.current;
    setIsSearching(true);

    try {
      const cleanKeyword = searchKeyword.toLowerCase().replace(/\s+/g, '');

      // Full LDS-style expansion (prefix + suffix + optional compounds) — thousands of ideas
      let variations = generateEnhancedVariations(cleanKeyword, includeCompounds);
      variations = variations
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, MAX_GENERATED);

      if (gen !== searchGenRef.current) return;

      setSuggestions(variations.map((v) => ({ ...v })));
      setCheckProgress({ done: 0, total: variations.length });

      // Progressive availability: first batches update UI as they complete
      await checkDomainsAvailabilityProgressive(variations, gen);
    } catch (error) {
      console.error('Domain generation error:', error);
    } finally {
      if (gen === searchGenRef.current) {
        setIsSearching(false);
      }
    }
  };

  const checkDomainsAvailabilityProgressive = async (
    variations: GeneratedDomain[],
    gen: number
  ) => {
    const resultByDomain = new Map<
      string,
      { available: boolean; premium?: boolean; price?: string }
    >();

    const applyMap = () => {
      if (gen !== searchGenRef.current) return;
      setSuggestions((prev) =>
        prev.map((variation) => {
          const fullDomain = `${variation.name}.com`.toLowerCase();
          const result = resultByDomain.get(fullDomain);
          if (!result) return variation;
          return {
            ...variation,
            available: !!result.available && !result.premium,
            premium: !!result.premium,
            price: result.price,
          };
        })
      );
    };

    try {
      for (let i = 0; i < variations.length; i += CHECK_BATCH) {
        if (gen !== searchGenRef.current) return;

        const batch = variations.slice(i, i + CHECK_BATCH).map((v) => `${v.name}.com`);
        try {
          const response = await fetch('/api/domains/instant-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domains: batch }),
          });
          if (response.ok) {
            const batchResults = await response.json();
            if (Array.isArray(batchResults)) {
              batchResults.forEach(
                (r: { domain: string; available: boolean; premium?: boolean; price?: string }) => {
                  if (r?.domain) {
                    resultByDomain.set(r.domain.toLowerCase(), r);
                  }
                }
              );
            }
          }
        } catch {
          /* continue batches */
        }

        applyMap();
        if (gen === searchGenRef.current) {
          setCheckProgress({
            done: Math.min(i + CHECK_BATCH, variations.length),
            total: variations.length,
          });
        }
      }
    } catch (error) {
      console.error('Availability check error:', error);
    }
  };

  const isAvailableSuggestion = (suggestion: GeneratedDomain) => suggestion.available && !suggestion.premium;
  const isPremiumSuggestion = (suggestion: GeneratedDomain) => !suggestion.available && !!suggestion.premium;
  const isTakenSuggestion = (suggestion: GeneratedDomain) => !suggestion.available && !suggestion.premium;

  /**
   * Lean Domain Search–style expansion:
   * every prefix + keyword, every keyword + suffix (+ optional compounds/morphs).
   * Yields thousands of names for a single seed (e.g. "agentic" → 5k+).
   */
  const generateEnhancedVariations = (
    keyword: string,
    withCompounds: boolean
  ): GeneratedDomain[] => {
    const variations: GeneratedDomain[] = [];
    const seen = new Set<string>();

    const push = (name: string, popularity: number, category: GeneratedDomain['category']) => {
      const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!clean || clean.length < 2 || clean.length > 32 || seen.has(clean)) return;
      if (/^\d+$/.test(clean)) return;
      if (clean === keyword && category !== 'exact') return;
      seen.add(clean);
      variations.push({ name: clean, available: false, popularity, category });
    };

    const prefixes = GENERATOR_PREFIXES;
    const suffixes = GENERATOR_SUFFIXES;
    const semanticAlternatives = GENERATOR_SEMANTIC[keyword.toLowerCase()] || [];

    // Exact match first
    push(keyword, 100, 'exact');

    // Semantic alternatives
    semanticAlternatives.forEach((alt, index) => {
      push(alt, 98 - index, 'alternative');
      if (withCompounds) {
        push(`${keyword}${alt}`, 96 - index, 'compound');
        push(`${alt}${keyword}`, 95 - index, 'compound');
      }
    });

    // Full prefix library (LDS core)
    prefixes.forEach((prefix, index) => {
      if (prefix === keyword) return;
      push(`${prefix}${keyword}`, Math.max(50, 95 - Math.floor(index / 40)), 'prefix');
    });

    // Full suffix library (LDS core)
    suffixes.forEach((suffix, index) => {
      if (suffix === keyword) return;
      push(`${keyword}${suffix}`, Math.max(48, 93 - Math.floor(index / 40)), 'suffix');
    });

    // Optional high-value compounds (top prefixes × top suffixes)
    if (withCompounds) {
      const topPrefixes = prefixes.slice(0, 60);
      const topSuffixes = suffixes.slice(0, 25);
      topPrefixes.forEach((prefix, i) => {
        topSuffixes.forEach((suffix, j) => {
          push(`${prefix}${keyword}${suffix}`, Math.max(30, 82 - Math.floor((i + j) / 4)), 'compound');
        });
      });
    }

    // Brand morphs
    if (keyword.length >= 3) {
      const morphs = [
        `${keyword}ly`,
        `${keyword}ify`,
        `${keyword}er`,
        `${keyword}or`,
        `${keyword}io`,
        `${keyword}hq`,
        `${keyword}ai`,
        `${keyword}app`,
        `${keyword}pro`,
        `${keyword}hub`,
        `get${keyword}`,
        `my${keyword}`,
        `try${keyword}`,
        `go${keyword}`,
        `the${keyword}`,
        `i${keyword}`,
        `e${keyword}`,
        `${keyword}s`,
        `${keyword}ing`,
        `${keyword}able`,
        `${keyword}ful`,
        `${keyword}less`,
        `${keyword}ize`,
        `${keyword}wise`,
        `${keyword}ster`,
      ];
      morphs.forEach((variant, index) => push(variant, 78 - index, 'alternative'));
    }

    // Multi-word seeds
    const parts = keyword.split(/(?=[A-Z])|[\s\-_]+/).filter(Boolean).map((p) => p.toLowerCase());
    if (parts.length >= 2) {
      const [a, b] = [parts[0], parts[1]];
      [
        `${a}${b}`,
        `${b}${a}`,
        `${a}${b}hq`,
        `${a}${b}app`,
        `${a}${b}pro`,
        `get${a}${b}`,
        `my${a}${b}`,
        `go${a}${b}`,
      ].forEach((v, i) => push(v, 90 - i, 'compound'));
    }

    return variations;
  };

  const handleDomainClick = (domainName: string) => {
    setSelectedDomain(domainName);
    setShowDomainPopup(true);
  };

  const handleBuyDomain = (domainName: string, registrar: RegistrarName) => {
    const fullDomain = domainName.includes('.') ? domainName : `${domainName}.com`;
    window.open(getRegistrarUrl(fullDomain, registrar), '_blank', 'noopener,noreferrer');
    setShowDomainPopup(false);
  };

  const handleComClick = (domainName: string) => {
    const fullDomain = domainName.includes('.') ? domainName : `${domainName}.com`;
    window.open(getRegistrarUrl(fullDomain, selectedRegistrar), '_blank', 'noopener,noreferrer');
  };

  const availableCount = suggestions.filter(isAvailableSuggestion).length;
  const premiumCount = suggestions.filter(isPremiumSuggestion).length;
  const takenCount = suggestions.filter(isTakenSuggestion).length;
  const totalCount = suggestions.length;
  const selectedSuggestion = selectedDomain
    ? suggestions.find((suggestion) => suggestion.name === selectedDomain) ?? null
    : null;

  const chipClass = isLight
    ? 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
    : 'bg-white/[0.04] border border-white/10 text-white/60 hover:border-white/20 hover:text-white/80';

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Unified search panel — single border, no nested input box */}
      <div
        className={`shine-border rounded-2xl border p-3 sm:p-4 ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm shadow-slate-900/[0.04]'
            : 'bg-white/[0.03] border-white/10'
        }`}
      >
        <div className="max-w-3xl mx-auto">
          {/* One continuous control — input has NO inner border/box */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 transition-all ${
              isLight
                ? 'bg-slate-50 border border-slate-200 focus-within:border-slate-300 focus-within:bg-white focus-within:shadow-sm'
                : 'bg-black/30 border border-white/10 focus-within:border-white/22'
            }`}
          >
            <div
              className={`hidden sm:flex ml-2 shrink-0 items-center justify-center w-8 h-8 ${
                isLight ? 'text-slate-400' : 'text-white/35'
              }`}
            >
              <Icons.Search />
            </div>

            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(keyword)}
              placeholder="Enter a keyword (cloud, mint, spark, shop…)"
              autoFocus
              autoComplete="off"
              spellCheck={false}
              className={`flex-1 min-w-0 bg-transparent border-0 outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus:border-0 text-[14px] sm:text-[15px] font-medium py-2.5 pl-3 sm:pl-0 pr-1 ${
                isLight
                  ? 'text-slate-900 placeholder:text-slate-400'
                  : 'text-white placeholder:text-white/35'
              }`}
              aria-label="Domain keyword"
              style={{ boxShadow: 'none', WebkitAppearance: 'none' }}
            />

            {keyword && (
              <button
                type="button"
                onClick={() => {
                  setKeyword('');
                  setSuggestions([]);
                  setFilteredSuggestions([]);
                }}
                className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-white/35 hover:text-white/70'
                }`}
                aria-label="Clear"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {isSearching && (
              <div className="shrink-0 mr-1">
                <div
                  className={`w-4 h-4 border-2 rounded-full animate-spin ${
                    isLight ? 'border-slate-200 border-t-slate-700' : 'border-white/15 border-t-white'
                  }`}
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => handleSearch(keyword)}
              disabled={!keyword.trim() || isSearching}
              className={`btn-brand shrink-0 inline-flex items-center gap-1 rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-bold disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <span>Generate</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {/* Curated keyword library — industry seeds from top generators */}
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-1">
              {(
                [
                  'trending',
                  'tech',
                  'business',
                  'creative',
                  'ecommerce',
                  'finance',
                  'health',
                  'education',
                  'lifestyle',
                  'social',
                  'all',
                ] as SeedCategory[]
              ).map((cat) => {
                const active = seedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSeedCategory(cat)}
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-bold border transition-all ${
                      active
                        ? isLight
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-black border-white'
                        : isLight
                          ? 'bg-transparent text-slate-500 border-transparent hover:bg-slate-50'
                          : 'bg-transparent text-white/40 border-transparent hover:bg-white/[0.04]'
                    }`}
                  >
                    {SEED_CATEGORY_LABELS[cat] || cat}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-h-[4.5rem] sm:max-h-none overflow-y-auto">
              {seedWords.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setKeyword(example)}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold transition-all ${
                    keyword === example
                      ? isLight
                        ? 'bg-slate-900 text-white border border-slate-900'
                        : 'bg-white text-black border border-white'
                      : chipClass
                  }`}
                >
                  {example}
                </button>
              ))}
            </div>
            <p className="text-center text-[9px] sm:text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {lexiconStats.prefixes.toLocaleString()} prefixes · {lexiconStats.suffixes.toLocaleString()}{' '}
              suffixes · {lexiconStats.seedWords.toLocaleString()} seeds · up to{' '}
              {MAX_GENERATED.toLocaleString()} ideas per keyword
            </p>
          </div>

          {/* Live stats + check progress */}
          {keyword && totalCount > 0 && (
            <div className="mt-3 space-y-1.5">
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] sm:text-[12px]">
                <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                    {totalCount.toLocaleString()}
                  </span>{' '}
                  ideas
                </span>
                {availableCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {availableCount.toLocaleString()} available
                  </span>
                )}
                {premiumCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-amber-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {premiumCount.toLocaleString()} premium
                  </span>
                )}
                {takenCount > 0 && (
                  <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                    {takenCount.toLocaleString()} taken
                  </span>
                )}
              </div>
              {checkProgress.total > 0 && checkProgress.done < checkProgress.total && (
                <div className="max-w-md mx-auto">
                  <div
                    className={`h-1 rounded-full overflow-hidden ${
                      isLight ? 'bg-slate-200' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${
                        isLight ? 'bg-emerald-500' : 'bg-emerald-400'
                      }`}
                      style={{
                        width: `${Math.round((checkProgress.done / checkProgress.total) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-center text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    Checking availability {checkProgress.done.toLocaleString()} /{' '}
                    {checkProgress.total.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls + results */}
      {keyword && totalCount > 0 && (
        <div
          className={`shine-border rounded-2xl border overflow-hidden ${
            isLight
              ? 'bg-white border-slate-200 shadow-sm'
              : 'bg-white/[0.025] border-white/10'
          }`}
        >
          <div
            className={`flex flex-col gap-2 px-3 sm:px-4 py-2.5 border-b ${
              isLight ? 'border-slate-100' : 'border-white/[0.06]'
            }`}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <select
                  value={selectedRegistrar}
                  onChange={(e) => setSelectedRegistrar(e.target.value as RegistrarName)}
                  className={`rounded-lg border px-2 py-1.5 text-[11px] sm:text-[12px] font-semibold outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-white/[0.04] border-white/10 text-white/80'
                  }`}
                  aria-label="Registrar"
                >
                  {REGISTRARS.map((reg) => (
                    <option key={reg.name} value={reg.name}>
                      {reg.host}
                    </option>
                  ))}
                </select>

                {/* Sort — popularity / length / alphabetical */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className={`rounded-lg border px-2 py-1.5 text-[11px] sm:text-[12px] font-semibold outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-white/[0.04] border-white/10 text-white/80'
                  }`}
                  aria-label="Sort results"
                >
                  <option value="popularity">Sort: Popularity</option>
                  <option value="length">Sort: Length</option>
                  <option value="alphabetical">Sort: Alphabetical</option>
                </select>

                {/* Term position filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className={`rounded-lg border px-2 py-1.5 text-[11px] sm:text-[12px] font-semibold outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-white/[0.04] border-white/10 text-white/80'
                  }`}
                  aria-label="Filter results"
                >
                  <option value="all">Filter: All</option>
                  <option value="starts">Starts with term</option>
                  <option value="ends">Ends with term</option>
                  <option value="available">Available only</option>
                  <option value="taken">Taken only</option>
                  <option value="premium">Premium only</option>
                </select>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setViewType('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewType === 'grid'
                      ? isLight
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-black'
                      : isLight
                        ? 'text-slate-400 hover:text-slate-700'
                        : 'text-white/35 hover:text-white/70'
                  }`}
                  title="Grid"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewType('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewType === 'list'
                      ? isLight
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-black'
                      : isLight
                        ? 'text-slate-400 hover:text-slate-700'
                        : 'text-white/35 hover:text-white/70'
                  }`}
                  title="List"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Extra customization */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px]">
              <label className="inline-flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                Min
                <input
                  type="number"
                  min={2}
                  max={maxLen}
                  value={minLen}
                  onChange={(e) => setMinLen(Math.max(2, Math.min(Number(e.target.value) || 2, maxLen)))}
                  className={`w-12 rounded-md border px-1.5 py-1 tabular-nums outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-white/[0.04] border-white/10 text-white/80'
                  }`}
                />
              </label>
              <label className="inline-flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                Max
                <input
                  type="number"
                  min={minLen}
                  max={32}
                  value={maxLen}
                  onChange={(e) => setMaxLen(Math.min(32, Math.max(Number(e.target.value) || 20, minLen)))}
                  className={`w-12 rounded-md border px-1.5 py-1 tabular-nums outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-white/[0.04] border-white/10 text-white/80'
                  }`}
                />
                chars
              </label>
              <label
                className={`inline-flex items-center gap-1.5 cursor-pointer select-none font-medium ${
                  isLight ? 'text-slate-600' : 'text-white/55'
                }`}
              >
                <input
                  type="checkbox"
                  checked={includeCompounds}
                  onChange={(e) => setIncludeCompounds(e.target.checked)}
                  className="rounded border-slate-400"
                />
                Compounds (prefix+keyword+suffix)
              </label>
              <span className="tabular-nums ml-auto" style={{ color: 'var(--text-muted)' }}>
                Showing {Math.min(visibleCount, filteredSuggestions.length).toLocaleString()} of{' '}
                {filteredSuggestions.length.toLocaleString()}
              </span>
            </div>
          </div>

          {filteredSuggestions.length > 0 ? (
            viewType === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-2 p-2 sm:p-3">
                {filteredSuggestions.slice(0, visibleCount).map((suggestion, i) => (
                  <div
                    key={`${suggestion.name}-${i}`}
                    className={`shine-border no-lift group flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2.5 transition-all ${
                      isAvailableSuggestion(suggestion)
                        ? isLight
                          ? 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                          : 'bg-white/[0.02] border-white/10 hover:border-emerald-500/30'
                        : isPremiumSuggestion(suggestion)
                          ? isLight
                            ? 'bg-amber-50/50 border-amber-200'
                            : 'bg-amber-500/[0.05] border-amber-400/20'
                          : isLight
                            ? 'bg-slate-50/80 border-slate-100 opacity-80'
                            : 'bg-white/[0.015] border-white/[0.06] opacity-75'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleDomainClick(suggestion.name)}
                      className="flex items-center gap-1.5 min-w-0 flex-1 text-left"
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          isAvailableSuggestion(suggestion)
                            ? 'bg-emerald-500'
                            : isPremiumSuggestion(suggestion)
                              ? 'bg-amber-400'
                              : isLight
                                ? 'bg-rose-400'
                                : 'bg-rose-400/80'
                        }`}
                      />
                      <span className="font-mono text-[12px] sm:text-[13px] font-bold truncate">
                        {suggestion.name}
                        <span className={isLight ? 'text-slate-400' : 'text-white/35'}>.com</span>
                      </span>
                    </button>
                    {isAvailableSuggestion(suggestion) ? (
                      <button
                        type="button"
                        onClick={() => handleComClick(suggestion.name)}
                        className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold transition-colors ${
                          isLight
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                            : 'bg-emerald-500 text-black hover:bg-emerald-400'
                        }`}
                      >
                        Continue
                      </button>
                    ) : isPremiumSuggestion(suggestion) ? (
                      <button
                        type="button"
                        onClick={() => handleDomainClick(suggestion.name)}
                        title="Search this premium domain at registrars"
                        className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold transition-colors ${
                          isLight
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
                        }`}
                      >
                        {suggestion.price || 'Premium'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDomainClick(suggestion.name)}
                        title="Search this domain at registrars"
                        className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                          isLight
                            ? 'text-slate-500 hover:bg-slate-100'
                            : 'text-white/40 hover:bg-white/[0.06] hover:text-white/70'
                        }`}
                      >
                        Taken
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-white/[0.05]'}`}>
                {filteredSuggestions.slice(0, visibleCount).map((suggestion, i) => (
                  <div
                    key={`${suggestion.name}-${i}`}
                    className={`flex items-center justify-between gap-3 px-3 sm:px-4 py-2 ${
                      isLight ? 'hover:bg-slate-50' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleDomainClick(suggestion.name)}
                      className="flex items-center gap-2 min-w-0 flex-1 text-left"
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          isAvailableSuggestion(suggestion)
                            ? 'bg-emerald-500'
                            : isPremiumSuggestion(suggestion)
                              ? 'bg-amber-400'
                              : isLight
                                ? 'bg-rose-400'
                                : 'bg-rose-400/80'
                        }`}
                      />
                      <span className="font-mono text-[12px] sm:text-[13px] font-semibold truncate">
                        {suggestion.name}.com
                      </span>
                    </button>
                    {isAvailableSuggestion(suggestion) ? (
                      <button
                        type="button"
                        onClick={() => handleComClick(suggestion.name)}
                        className={`shrink-0 rounded-md px-2.5 py-1 text-[10px] font-bold ${
                          isLight
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-500 text-black'
                        }`}
                      >
                        Continue
                      </button>
                    ) : isPremiumSuggestion(suggestion) ? (
                      <button
                        type="button"
                        onClick={() => handleDomainClick(suggestion.name)}
                        title="Search this premium domain at registrars"
                        className="shrink-0 rounded-md px-2.5 py-1 text-[10px] font-bold text-amber-500 hover:bg-amber-500/10 transition-colors"
                      >
                        {suggestion.price || 'Premium'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDomainClick(suggestion.name)}
                        title="Search this domain at registrars"
                        className="shrink-0 rounded-md px-2.5 py-1 text-[10px] transition-colors hover:opacity-80"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Taken
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12 px-4">
              <p className="text-sm font-semibold mb-1">No matches for this filter</p>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                “{keyword}” has {suggestions.length.toLocaleString()} total results — try Filter → All
              </p>
            </div>
          )}

          {filteredSuggestions.length > visibleCount && (
            <div
              className={`flex items-center justify-center gap-3 py-3 border-t ${
                isLight ? 'border-slate-100' : 'border-white/[0.06]'
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((n) => Math.min(n + DISPLAY_PAGE, filteredSuggestions.length))
                }
                className={`text-[12px] font-bold ${
                  isLight ? 'text-slate-800 hover:text-black' : 'text-white/85 hover:text-white'
                }`}
              >
                View more ({(filteredSuggestions.length - visibleCount).toLocaleString()} left)
              </button>
              <button
                type="button"
                onClick={() => setVisibleCount(filteredSuggestions.length)}
                className="text-[11px] font-semibold"
                style={{ color: 'var(--text-muted)' }}
              >
                Show all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Compact hint only — no large empty card */}
      {!keyword && (
        <p
          className="text-center text-[11px] sm:text-[12px] py-1"
          style={{ color: 'var(--text-muted)' }}
        >
          Pick a keyword chip or type above — results appear here with live .com availability.
        </p>
      )}

      {/* Domain Popup */}
      {showDomainPopup && selectedDomain && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDomainPopup(false)}>
          <div className={`${isLight ? 'bg-white' : 'bg-[#1a1a1a]'} border ${isLight ? 'border-slate-200' : 'border-white/10'} rounded-xl p-3.5 sm:p-4 max-w-md w-full`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold">{selectedDomain}.com</h3>
              <button
                onClick={() => setShowDomainPopup(false)}
                className={`${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-white/50 hover:text-white'} transition-colors`}
              >
                <Icons.Close />
              </button>
            </div>
            
            {selectedSuggestion && isAvailableSuggestion(selectedSuggestion) && (
              <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/50'} mb-6`}>
                Choose a registrar to search and register this domain:
              </p>
            )}
            {selectedSuggestion && isPremiumSuggestion(selectedSuggestion) && (
              <p className={`text-sm ${isLight ? 'text-amber-700' : 'text-amber-300'} mb-6`}>
                This domain is listed as premium{selectedSuggestion.price ? ` from ${selectedSuggestion.price}` : ''}.
                Open a registrar below to search the exact name and see live pricing or aftermarket options.
              </p>
            )}
            {selectedSuggestion && isTakenSuggestion(selectedSuggestion) && (
              <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/50'} mb-6`}>
                This domain appears taken. You can still open a registrar to search the name or check aftermarket listings.
              </p>
            )}
            
            <div className="space-y-2">
              {REGISTRARS.map((registrar) => (
                <button
                  key={registrar.name}
                  type="button"
                  onClick={() => selectedDomain && handleBuyDomain(selectedDomain, registrar.name)}
                  className={`w-full text-left px-4 py-3 border rounded-lg transition-colors group ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-900'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={registrar.logo}
                        alt=""
                        width={20}
                        height={20}
                        className={`h-5 w-5 shrink-0 rounded-md object-contain ${
                          isLight ? 'bg-white ring-1 ring-slate-200' : 'bg-white/95 ring-1 ring-white/10'
                        }`}
                        loading="lazy"
                      />
                      <span className="font-semibold truncate">{registrar.host}</span>
                    </span>
                    <svg className={`w-4 h-4 shrink-0 ${isLight ? 'text-slate-400 group-hover:text-slate-900' : 'text-white/40 group-hover:text-white'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
