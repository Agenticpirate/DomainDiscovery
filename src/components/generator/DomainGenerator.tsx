'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ui/Toast';
import {
  REGISTRARS,
  resolveRegisterUrl,
  type RegistrarName,
} from '@/lib/registrars';
import { usePreferredRegistrar } from '@/hooks/usePreferredRegistrar';
import { RegistrarActionMenu } from '@/components/domain/RegistrarControls';
import { getSavedDomainNames, toggleSavedDomain } from '@/lib/savedDomainsStore';
import generatorKeywords from '@/data/generator-keywords.json';

interface GeneratedDomain {
  name: string;
  /** null = not checked yet (pending) — must not look “taken” */
  available: boolean | null;
  premium?: boolean;
  price?: string;
  popularity: number;
  category: 'exact' | 'prefix' | 'suffix' | 'compound' | 'alternative';
}

interface DomainGeneratorProps {
  onSelect?: (domain: string) => void;
}

/** Position of keyword in the generated name */
type PositionFilter = 'all' | 'starts' | 'ends';
/** Availability status — controlled via quick buttons, not buried in a select */
type StatusFilter = 'all' | 'available' | 'premium' | 'taken';
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
  const [positionFilter, setPositionFilter] = useState<PositionFilter>('all');
  /** Status toggled via big buttons (Available / Premium / Taken / All) */
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortType>('popularity');
  const [viewType, setViewType] = useState<ViewType>('grid');
  /** Default Spaceship; user pick persists and drives Continue / buy URLs */
  const { selectedRegistrar, setSelectedRegistrar } = usePreferredRegistrar();
  const { showToast } = useToast();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [showDomainPopup, setShowDomainPopup] = useState(false);
  const [seedCategory, setSeedCategory] = useState<SeedCategory>('trending');
  const [visibleCount, setVisibleCount] = useState(DISPLAY_PAGE);
  const [minLen, setMinLen] = useState(3);
  const [maxLen, setMaxLen] = useState(20);
  const [includeCompounds, setIncludeCompounds] = useState(true);
  const [savedDomains, setSavedDomains] = useState<string[]>([]);
  const searchGenRef = React.useRef(0);

  useEffect(() => {
    setSavedDomains(getSavedDomainNames());
    const sync = () => setSavedDomains(getSavedDomainNames());
    window.addEventListener('savedDomainsUpdated', sync);
    return () => window.removeEventListener('savedDomainsUpdated', sync);
  }, []);

  const handleSave = useCallback(
    (domain: string) => {
      const full = domain.includes('.') ? domain : `${domain}.com`;
      const { saved } = toggleSavedDomain(full);
      setSavedDomains(getSavedDomainNames());
      showToast(saved ? `Saved ${full}` : `Removed ${full}`, 'success', 1500);
    },
    [showToast]
  );

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

    switch (positionFilter) {
      case 'starts':
        filtered = filtered.filter((d) => d.name.startsWith(cleanKeyword));
        break;
      case 'ends':
        filtered = filtered.filter((d) => d.name.endsWith(cleanKeyword));
        break;
      default:
        break;
    }

    switch (statusFilter) {
      case 'available':
        filtered = filtered.filter((d) => d.available === true && !d.premium);
        break;
      case 'taken':
        filtered = filtered.filter((d) => d.available === false && !d.premium);
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
  }, [suggestions, positionFilter, statusFilter, sortBy, keyword, minLen, maxLen]);

  useEffect(() => {
    setVisibleCount(DISPLAY_PAGE);
  }, [keyword, positionFilter, statusFilter, sortBy, minLen, maxLen]);

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
            available: result.available,
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

  const isAvailableSuggestion = (suggestion: GeneratedDomain) =>
    suggestion.available === true && !suggestion.premium;
  const isPremiumSuggestion = (suggestion: GeneratedDomain) => !!suggestion.premium;
  const isTakenSuggestion = (suggestion: GeneratedDomain) =>
    suggestion.available === false && !suggestion.premium;
  const isPendingSuggestion = (suggestion: GeneratedDomain) => suggestion.available === null;

  /** Status surfaces — match keyword/bulk light-mode readability */
  const statusCardClass = (s: GeneratedDomain) => {
    if (isPendingSuggestion(s)) {
      return isLight
        ? 'bg-white border-slate-200 hover:bg-slate-50'
        : 'bg-[#121214] border-white/[0.08] hover:bg-[#161618]';
    }
    if (isAvailableSuggestion(s)) {
      return isLight
        ? 'bg-emerald-50 border-emerald-200/90 hover:border-emerald-300'
        : 'bg-emerald-500/[0.08] border-emerald-500/25 hover:bg-emerald-500/[0.12]';
    }
    if (isPremiumSuggestion(s)) {
      return isLight
        ? 'bg-amber-50 border-amber-200/90 hover:border-amber-300'
        : 'bg-amber-500/[0.08] border-amber-500/25 hover:bg-amber-500/[0.12]';
    }
    return isLight
      ? 'bg-rose-50/90 border-rose-200/80 hover:border-rose-300'
      : 'bg-rose-500/[0.07] border-rose-500/20 hover:bg-rose-500/[0.1]';
  };

  const statusDotClass = (s: GeneratedDomain) => {
    if (isPendingSuggestion(s)) return isLight ? 'bg-slate-300' : 'bg-white/20';
    if (isAvailableSuggestion(s)) {
      return isLight
        ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]'
        : 'bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.4)]';
    }
    if (isPremiumSuggestion(s)) {
      return isLight
        ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]'
        : 'bg-amber-400 shadow-[0_0_7px_rgba(251,191,36,0.45)]';
    }
    return isLight ? 'bg-rose-500' : 'bg-rose-400/85';
  };

  const statusNameClass = (s: GeneratedDomain) => {
    if (isPendingSuggestion(s)) return isLight ? 'text-slate-600' : 'text-white/60';
    if (isAvailableSuggestion(s)) return isLight ? 'text-emerald-950 font-semibold' : 'text-emerald-50 font-semibold';
    if (isPremiumSuggestion(s)) return isLight ? 'text-amber-950 font-semibold' : 'text-amber-50 font-semibold';
    return isLight
      ? 'text-rose-800/75 line-through decoration-rose-300'
      : 'text-white/30 line-through decoration-white/15';
  };

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
      variations.push({ name: clean, available: null, popularity, category });
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

  const registerHref = (domainName: string, registrar: RegistrarName = selectedRegistrar) => {
    const fullDomain = domainName.includes('.') ? domainName : `${domainName}.com`;
    const suggestion = suggestions.find((s) => s.name === domainName || `${s.name}.com` === fullDomain);
    const premium = suggestion ? isPremiumSuggestion(suggestion) : false;
    // Spaceship → full Impact affiliate URL; other registrars as selected in popup
    return resolveRegisterUrl(fullDomain, registrar, null, { premium });
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
    : 'bg-[#121214] border border-white/10 text-white/60 hover:border-white/20 hover:text-white/80';

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Unified search panel — fully opaque so ambient dots never show through */}
      <div
        className={`shine-border relative isolate overflow-hidden rounded-2xl border p-3 sm:p-4 ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm shadow-slate-900/[0.04]'
            : 'bg-[#0a0a0c] border-white/10'
        }`}
        style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
        />
        <div className="relative z-[1] max-w-3xl mx-auto">
          {/* One continuous control — input has NO inner border/box */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 transition-all ${
              isLight
                ? 'bg-slate-50 border border-slate-200 focus-within:border-slate-300 focus-within:bg-white focus-within:shadow-sm'
                : 'bg-[#121214] border border-white/10 focus-within:border-white/22'
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
            <div className="mt-3 space-y-2">
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

              {/* Status quick-filters — primary way to browse free / premium / taken */}
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2"
                role="tablist"
                aria-label="Filter by availability"
              >
                {(
                  [
                    {
                      id: 'available' as const,
                      label: 'Available',
                      count: availableCount,
                      activeCls: isLight
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-emerald-500 text-black border-emerald-500',
                      idleCls: isLight
                        ? 'bg-white text-emerald-700 border-emerald-200 hover:border-emerald-300'
                        : 'bg-[#121214] text-emerald-400 border-emerald-500/25 hover:border-emerald-500/40',
                      dot: 'bg-emerald-400',
                    },
                    {
                      id: 'premium' as const,
                      label: 'Premium',
                      count: premiumCount,
                      activeCls: isLight
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-amber-400 text-black border-amber-400',
                      idleCls: isLight
                        ? 'bg-white text-amber-700 border-amber-200 hover:border-amber-300'
                        : 'bg-[#121214] text-amber-400 border-amber-400/25 hover:border-amber-400/40',
                      dot: 'bg-amber-400',
                    },
                    {
                      id: 'taken' as const,
                      label: 'Taken',
                      count: takenCount,
                      activeCls: isLight
                        ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                        : 'bg-white text-black border-white',
                      idleCls: isLight
                        ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        : 'bg-[#121214] text-white/70 border-white/12 hover:border-white/22',
                      dot: isLight ? 'bg-rose-400' : 'bg-rose-400/90',
                    },
                    {
                      id: 'all' as const,
                      label: 'All ideas',
                      count: totalCount,
                      activeCls: isLight
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white/15 text-white border-white/25',
                      idleCls: isLight
                        ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        : 'bg-[#121214] text-white/60 border-white/10 hover:border-white/20',
                      dot: isLight ? 'bg-slate-400' : 'bg-white/40',
                    },
                  ] as const
                ).map((tab) => {
                  const active = statusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setStatusFilter(tab.id)}
                      className={`flex flex-col items-start gap-0.5 rounded-xl border px-2.5 py-2 sm:px-3 sm:py-2.5 text-left transition-all active:scale-[0.98] ${
                        active ? tab.activeCls : tab.idleCls
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wide opacity-90">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tab.dot}`} aria-hidden />
                        {tab.label}
                      </span>
                      <span className="text-[1.05rem] sm:text-lg font-black tabular-nums leading-none">
                        {tab.count.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls + results */}
      {keyword && totalCount > 0 && (
        <div
          className={`shine-border relative isolate overflow-hidden rounded-2xl border ${
            isLight
              ? 'bg-white border-slate-200 shadow-sm'
              : 'bg-[#0a0a0c] border-white/10'
          }`}
          style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
        >
          <div
            className={`flex flex-col gap-2 px-3 sm:px-4 py-2.5 border-b ${
              isLight ? 'border-slate-100' : 'border-white/[0.06]'
            }`}
          >
            {/*
              Mobile: compact 2-col + full-width register (no stacked label bloat).
              Desktop (sm+): labeled 3-col grid with helper under registrar.
            */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2.5">
              <label className="col-span-2 sm:col-span-1 flex flex-col gap-0.5 sm:gap-1 min-w-0">
                <span
                  className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Register at
                </span>
                <select
                  value={selectedRegistrar}
                  onChange={(e) => setSelectedRegistrar(e.target.value as RegistrarName)}
                  className={`w-full rounded-lg sm:rounded-xl border px-2.5 py-1.5 sm:px-3 sm:py-2.5 text-[11px] sm:text-[13px] font-semibold outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#121214] border-white/12 text-white'
                  }`}
                  aria-label="Where to register available domains"
                >
                  {REGISTRARS.map((reg) => (
                    <option key={reg.name} value={reg.name}>
                      {reg.host}
                    </option>
                  ))}
                </select>
                <span
                  className="hidden sm:block text-[9.5px] leading-snug"
                  style={{ color: 'var(--text-muted)' }}
                >
                  “Go” opens {selectedRegistrar}
                </span>
              </label>

              <label className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
                <span
                  className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Sort
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className={`w-full rounded-lg sm:rounded-xl border px-2 py-1.5 sm:px-3 sm:py-2.5 text-[11px] sm:text-[13px] font-semibold outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#121214] border-white/12 text-white'
                  }`}
                  aria-label="Sort domain ideas"
                >
                  <option value="popularity">Most popular</option>
                  <option value="length">Shortest</option>
                  <option value="alphabetical">A → Z</option>
                </select>
              </label>

              <label className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
                <span
                  className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Keyword
                </span>
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value as PositionFilter)}
                  className={`w-full rounded-lg sm:rounded-xl border px-2 py-1.5 sm:px-3 sm:py-2.5 text-[11px] sm:text-[13px] font-semibold outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#121214] border-white/12 text-white'
                  }`}
                  aria-label="Where the keyword appears in the name"
                >
                  <option value="all">Anywhere</option>
                  <option value="starts">Starts with</option>
                  <option value="ends">Ends with</option>
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
              <div
                className={`inline-flex items-center gap-0.5 rounded-lg sm:rounded-xl border p-0.5 ${
                  isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-[#121214]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setViewType('grid')}
                  className={`inline-flex items-center gap-0.5 sm:gap-1 rounded-md sm:rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-[11px] font-bold transition-colors ${
                    viewType === 'grid'
                      ? isLight
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'bg-white text-black'
                      : isLight
                        ? 'text-slate-500'
                        : 'text-white/45'
                  }`}
                  title="Grid view"
                >
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="hidden xs:inline sm:inline">Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewType('list')}
                  className={`inline-flex items-center gap-0.5 sm:gap-1 rounded-md sm:rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-[11px] font-bold transition-colors ${
                    viewType === 'list'
                      ? isLight
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'bg-white text-black'
                      : isLight
                        ? 'text-slate-500'
                        : 'text-white/45'
                  }`}
                  title="List view"
                >
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>

              <label
                className="inline-flex items-center gap-1 font-medium text-[10px] sm:text-[11px]"
                style={{ color: 'var(--text-muted)' }}
              >
                <span className="hidden sm:inline">Length</span>
                <input
                  type="number"
                  min={2}
                  max={maxLen}
                  value={minLen}
                  onChange={(e) => setMinLen(Math.max(2, Math.min(Number(e.target.value) || 2, maxLen)))}
                  className={`w-9 sm:w-11 rounded-md border px-1 py-0.5 sm:px-1.5 sm:py-1 tabular-nums outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-[#121214] border-white/10 text-white/80'
                  }`}
                  aria-label="Minimum name length"
                />
                <span>–</span>
                <input
                  type="number"
                  min={minLen}
                  max={32}
                  value={maxLen}
                  onChange={(e) => setMaxLen(Math.min(32, Math.max(Number(e.target.value) || 20, minLen)))}
                  className={`w-9 sm:w-11 rounded-md border px-1 py-0.5 sm:px-1.5 sm:py-1 tabular-nums outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-[#121214] border-white/10 text-white/80'
                  }`}
                  aria-label="Maximum name length"
                />
              </label>

              <label
                className={`inline-flex items-center gap-1 cursor-pointer select-none text-[10px] sm:text-[11px] font-medium ${
                  isLight ? 'text-slate-600' : 'text-white/55'
                }`}
              >
                <input
                  type="checkbox"
                  checked={includeCompounds}
                  onChange={(e) => setIncludeCompounds(e.target.checked)}
                  className="rounded border-slate-400 scale-90 sm:scale-100"
                />
                <span className="sm:hidden">Compounds</span>
                <span className="hidden sm:inline">Include compounds</span>
              </label>

              <span
                className="tabular-nums text-[9.5px] sm:text-[11px] ml-auto font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                {Math.min(visibleCount, filteredSuggestions.length).toLocaleString()}/
                {filteredSuggestions.length.toLocaleString()}
              </span>
            </div>
          </div>

          {filteredSuggestions.length > 0 ? (
            viewType === 'grid' ? (
              /* 3-col cards only — no gap-px grey voids on incomplete rows */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 p-2 sm:p-3 auto-rows-auto">
                {filteredSuggestions.slice(0, visibleCount).map((suggestion, i) => {
                  const fullDomain = `${suggestion.name}.com`;
                  const isSaved = savedDomains.includes(fullDomain.toLowerCase());
                  const canRegister =
                    isAvailableSuggestion(suggestion) || isPremiumSuggestion(suggestion);
                  return (
                    <div
                      key={`${suggestion.name}-${i}`}
                      className={`group flex items-center gap-2 rounded-xl border px-2.5 py-2.5 min-w-0 transition-colors ${statusCardClass(suggestion)}`}
                    >
                      <button
                        type="button"
                        onClick={() => handleDomainClick(suggestion.name)}
                        className="flex items-center gap-1.5 min-w-0 flex-1 text-left"
                      >
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDotClass(suggestion)}`} />
                        <span
                          className={`font-mono text-[12px] sm:text-[13px] truncate ${statusNameClass(suggestion)}`}
                        >
                          {suggestion.name}
                          <span
                            className={
                              isAvailableSuggestion(suggestion) || isPremiumSuggestion(suggestion)
                                ? isLight
                                  ? 'text-inherit opacity-60'
                                  : 'text-inherit opacity-50'
                                : isLight
                                  ? 'text-slate-400'
                                  : 'text-white/35'
                            }
                          >
                            .com
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(fullDomain)}
                        className={`h-7 w-7 shrink-0 inline-flex items-center justify-center rounded-full border transition-colors ${
                          isSaved
                            ? isLight
                              ? 'text-slate-900 border-slate-900 bg-slate-100'
                              : 'text-white border-white/30 bg-white/10'
                            : isLight
                              ? 'text-slate-400 border-slate-200 hover:text-slate-700'
                              : 'text-white/40 border-white/10 hover:text-white/80'
                        }`}
                        aria-label={isSaved ? `Remove ${fullDomain}` : `Save ${fullDomain}`}
                        title={isSaved ? 'Saved' : 'Save domain'}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill={isSaved ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </button>
                      <RegistrarActionMenu
                        domain={fullDomain}
                        selectedRegistrar={selectedRegistrar}
                        onSelectRegistrar={setSelectedRegistrar}
                        canRegister={canRegister}
                        isPremium={isPremiumSuggestion(suggestion)}
                        primaryLabel={
                          isAvailableSuggestion(suggestion)
                            ? 'Go'
                            : isPremiumSuggestion(suggestion)
                              ? 'Go · GoDaddy'
                              : 'Info'
                        }
                        premiumLabel={
                          isPremiumSuggestion(suggestion)
                            ? 'Premium listing from GoDaddy'
                            : undefined
                        }
                        primaryButtonClassName={
                          isLight
                            ? 'bg-slate-900 text-white hover:bg-slate-800 text-[10px] sm:text-[11px] font-semibold pl-2.5 pr-2 py-1'
                            : 'bg-white text-black hover:bg-white/90 text-[10px] sm:text-[11px] font-semibold pl-2.5 pr-2 py-1'
                        }
                        chevronButtonClassName={
                          isLight
                            ? 'bg-slate-900 text-white hover:bg-slate-800 px-1.5 py-1'
                            : 'bg-white text-black hover:bg-white/90 px-1.5 py-1'
                        }
                        fallbackButtonClassName={
                          isLight
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full'
                            : 'bg-white/[0.08] text-white/70 hover:bg-white/12 text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full'
                        }
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-white/[0.05]'}`}>
                {filteredSuggestions.slice(0, visibleCount).map((suggestion, i) => {
                  const fullDomain = `${suggestion.name}.com`;
                  const isSaved = savedDomains.includes(fullDomain.toLowerCase());
                  const canRegister =
                    isAvailableSuggestion(suggestion) || isPremiumSuggestion(suggestion);
                  return (
                    <div
                      key={`${suggestion.name}-${i}`}
                      className={`flex items-center justify-between gap-2 px-3 sm:px-4 py-2 border-l-2 ${
                        isPendingSuggestion(suggestion)
                          ? isLight
                            ? 'border-transparent hover:bg-slate-50'
                            : 'border-transparent hover:bg-white/[0.03]'
                          : isAvailableSuggestion(suggestion)
                            ? isLight
                              ? 'border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50'
                              : 'border-emerald-500/50 bg-emerald-500/[0.05]'
                            : isPremiumSuggestion(suggestion)
                              ? isLight
                                ? 'border-amber-400 bg-amber-50/50 hover:bg-amber-50'
                                : 'border-amber-500/50 bg-amber-500/[0.05]'
                              : isLight
                                ? 'border-rose-300 bg-rose-50/40 hover:bg-rose-50/70'
                                : 'border-rose-500/40 bg-rose-500/[0.04]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleDomainClick(suggestion.name)}
                        className="flex items-center gap-2 min-w-0 flex-1 text-left"
                      >
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDotClass(suggestion)}`} />
                        <span
                          className={`font-mono text-[12px] sm:text-[13px] truncate ${statusNameClass(suggestion)}`}
                        >
                          {fullDomain}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(fullDomain)}
                        className={`h-7 w-7 shrink-0 inline-flex items-center justify-center rounded-full border transition-colors ${
                          isSaved
                            ? isLight
                              ? 'text-slate-900 border-slate-900 bg-slate-100'
                              : 'text-white border-white/30 bg-white/10'
                            : isLight
                              ? 'text-slate-400 border-slate-200 hover:text-slate-700'
                              : 'text-white/40 border-white/10 hover:text-white/80'
                        }`}
                        aria-label={isSaved ? `Remove ${fullDomain}` : `Save ${fullDomain}`}
                        title={isSaved ? 'Saved' : 'Save domain'}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill={isSaved ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </button>
                      <RegistrarActionMenu
                        domain={fullDomain}
                        selectedRegistrar={selectedRegistrar}
                        onSelectRegistrar={setSelectedRegistrar}
                        canRegister={canRegister}
                        isPremium={isPremiumSuggestion(suggestion)}
                        primaryLabel={
                          isAvailableSuggestion(suggestion)
                            ? 'Go'
                            : isPremiumSuggestion(suggestion)
                              ? 'Go · GoDaddy'
                              : 'Info'
                        }
                        premiumLabel={
                          isPremiumSuggestion(suggestion)
                            ? 'Premium listing from GoDaddy'
                            : undefined
                        }
                        primaryButtonClassName={
                          isLight
                            ? 'bg-slate-900 text-white hover:bg-slate-800 text-[10px] sm:text-[11px] font-semibold pl-2.5 pr-2 py-1'
                            : 'bg-white text-black hover:bg-white/90 text-[10px] sm:text-[11px] font-semibold pl-2.5 pr-2 py-1'
                        }
                        chevronButtonClassName={
                          isLight
                            ? 'bg-slate-900 text-white hover:bg-slate-800 px-1.5 py-1'
                            : 'bg-white text-black hover:bg-white/90 px-1.5 py-1'
                        }
                        fallbackButtonClassName={
                          isLight
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full'
                            : 'bg-white/[0.08] text-white/70 hover:bg-white/12 text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full'
                        }
                      />
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="text-center py-10 px-4">
              <p className="text-sm font-semibold mb-1">
                {statusFilter === 'available'
                  ? 'No free .com domains in this set yet'
                  : statusFilter === 'premium'
                    ? 'No premium listings in this set'
                    : statusFilter === 'taken'
                      ? 'No taken domains match'
                      : 'No matches for this filter'}
              </p>
              <p className="text-[12px] mb-3" style={{ color: 'var(--text-muted)' }}>
                “{keyword}” has {suggestions.length.toLocaleString()} total ideas
                {checkProgress.done < checkProgress.total
                  ? ' — still checking availability…'
                  : ' — try another status'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {(
                  [
                    { id: 'available' as const, label: 'Available' },
                    { id: 'premium' as const, label: 'Premium' },
                    { id: 'taken' as const, label: 'Taken' },
                    { id: 'all' as const, label: 'All ideas' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                      statusFilter === tab.id
                        ? isLight
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-black border-white'
                        : isLight
                          ? 'bg-white text-slate-600 border-slate-200'
                          : 'bg-[#121214] text-white/70 border-white/12'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
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
                Premium listing from GoDaddy
                {selectedSuggestion.price ? ` (${selectedSuggestion.price})` : ''}.
                Default Go opens GoDaddy; free names use our Spaceship affiliate.
              </p>
            )}
            {selectedSuggestion && isTakenSuggestion(selectedSuggestion) && (
              <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/50'} mb-6`}>
                This domain appears taken. You can still open a registrar to search the name or check aftermarket listings.
              </p>
            )}
            
            <div className="space-y-2">
              {REGISTRARS.map((registrar) => (
                <a
                  key={registrar.name}
                  href={selectedDomain ? registerHref(selectedDomain, registrar.name) : undefined}
                  target="_blank"
                  rel={
                    registrar.name === 'Spaceship'
                      ? 'sponsored noopener noreferrer'
                      : 'noopener noreferrer'
                  }
                  data-affiliate={registrar.name === 'Spaceship' ? 'spaceship' : undefined}
                  data-registrar={registrar.name}
                  data-placement="generator-popup"
                  onClick={() => setShowDomainPopup(false)}
                  className={`w-full block text-left px-4 py-3 border rounded-lg transition-colors group ${
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
                      {registrar.name === 'Spaceship' ? (
                        <span
                          className={`shrink-0 text-[9px] font-bold uppercase tracking-wide ${
                            isLight ? 'text-emerald-700' : 'text-emerald-400'
                          }`}
                        >
                          Partner
                        </span>
                      ) : null}
                    </span>
                    <svg className={`w-4 h-4 shrink-0 ${isLight ? 'text-slate-400 group-hover:text-slate-900' : 'text-white/40 group-hover:text-white'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
