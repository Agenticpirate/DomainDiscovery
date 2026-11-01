'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ui/Toast';
import { getSpaceshipAffiliateUrl } from '@/lib/registrars';
import { recordDomainsChecked } from '@/lib/searchCounter';
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

function StatusGlyph({ id }: { id: StatusFilter }) {
  const cls = 'h-[18px] w-[18px]';
  if (id === 'available') {
    return (
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (id === 'premium') {
    return (
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    );
  }
  if (id === 'taken') {
    return (
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    );
  }
  return (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

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
/** Responsive batching: streams results smoothly in small chunks (<250ms per batch). */
const CHECK_BATCH = 40;
/** Live-check the rows on screen plus a buffer ahead. */
const CHECK_AHEAD = 40;
const CHECK_CAP = 480;
/**
 * Full affix pass: every ranked word on both sides of the keyword.
 * 5,532 words × 2 positions, plus morphs and a few compounds.
 */
const MAX_GENERATED = 14000;

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
  const { selectedRegistrar, setSelectedRegistrar } = usePreferredRegistrar();
  const { showToast } = useToast();
  const [seedCategory, setSeedCategory] = useState<SeedCategory>('trending');
  const [visibleCount, setVisibleCount] = useState(DISPLAY_PAGE);
  const [minLen, setMinLen] = useState(3);
  const [maxLen, setMaxLen] = useState(20);
  const [includeCompounds, setIncludeCompounds] = useState(true);
  const [savedDomains, setSavedDomains] = useState<string[]>([]);
  const searchGenRef = React.useRef(0);
  /** Stems already sent for a live check, so scrolling does not re-query them. */
  const queuedCheckRef = React.useRef<Set<string>>(new Set());
  /** Keyword the current suggestion list was built for. Checks wait until these match. */
  const suggestionKeywordRef = React.useRef('');
  const checkCooldownRef = React.useRef(0);

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
    }, 420);

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

  // Check the visible window only. The rest of the word list is already on screen.
  useEffect(() => {
    if (!suggestions.length) return;
    const cleanKeyword = keyword.toLowerCase().replace(/\s+/g, '');
    if (suggestionKeywordRef.current !== cleanKeyword) return;
    if (Date.now() < checkCooldownRef.current) return;
    const gen = searchGenRef.current;

    const pool = suggestions.filter((d) => {
      const len = d.name.length;
      if (len < minLen || len > maxLen) return false;
      if (positionFilter === 'starts' && !d.name.startsWith(cleanKeyword)) return false;
      if (positionFilter === 'ends' && !d.name.endsWith(cleanKeyword)) return false;
      return true;
    });

    if (sortBy === 'alphabetical') {
      pool.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'length') {
      pool.sort((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name));
    } else {
      pool.sort((a, b) => b.popularity - a.popularity || a.name.localeCompare(b.name));
    }

    const windowSize = Math.min(pool.length, Math.min(visibleCount, CHECK_CAP) + CHECK_AHEAD);
    const pending: GeneratedDomain[] = [];
    for (let i = 0; i < windowSize; i++) {
      const row = pool[i];
      if (row.available !== null || queuedCheckRef.current.has(row.name)) continue;
      queuedCheckRef.current.add(row.name);
      pending.push(row);
    }
    if (!pending.length) return;
    void checkDomainsAvailabilityProgressive(pending, gen);
    // The checker is recreated each render; the queue ref stops duplicate lookups.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions, visibleCount, positionFilter, sortBy, minLen, maxLen, keyword]);

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

      // Names are a local join of the word list. Paint them immediately.
      // Availability is checked only for the rows in view.
      suggestionKeywordRef.current = cleanKeyword;
      queuedCheckRef.current = new Set();
      checkCooldownRef.current = 0;
      setSuggestions(variations.map((v) => ({ ...v })));
      setCheckProgress({ done: 0, total: 0 });
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
          const priceNum = result.price ? parseFloat(result.price.replace(/[^0-9.]/g, '')) : NaN;
          // A token aftermarket price is a parked name, not a premium listing.
          const premium = !!result.premium && (!Number.isFinite(priceNum) || priceNum >= 100);
          return {
            ...variation,
            available: result.available,
            premium,
            price: premium ? result.price : undefined,
          };
        })
      );
    };

    const release = (names: string[]) => {
      names.forEach((name) => queuedCheckRef.current.delete(name));
    };

    try {
      for (let i = 0; i < variations.length; i += CHECK_BATCH) {
        if (gen !== searchGenRef.current) return;

        const slice = variations.slice(i, i + CHECK_BATCH);
        const batch = slice.map((v) => `${v.name}.com`);
        const names = slice.map((v) => v.name);
        recordDomainsChecked(batch.length, `gen:${gen}:${batch[0] || i}`);

        const requestBatch = async () => {
          const response = await fetch('/api/domains/instant-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domains: batch }),
          });
          return response;
        };

        try {
          let response = await requestBatch();
          if (response.status === 429 && gen === searchGenRef.current) {
            await new Promise((resolve) => setTimeout(resolve, 1600));
            if (gen !== searchGenRef.current) return;
            response = await requestBatch();
          }
          if (!response.ok) {
            release(names);
            checkCooldownRef.current = Date.now() + 8000;
            break;
          }
          const batchResults = await response.json();
          if (Array.isArray(batchResults)) {
            batchResults.forEach(
              (r: { domain: string; available: boolean; premium?: boolean; price?: string; checked?: boolean }) => {
                if (!r?.domain) return;
                if (r.checked === false) {
                  const stem = r.domain.toLowerCase().replace(/\.com$/, '');
                  queuedCheckRef.current.delete(stem);
                  return;
                }
                resultByDomain.set(r.domain.toLowerCase(), r);
              }
            );
          }
        } catch {
          release(names);
          break;
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

  /** Same neutral card as bulk search — color lives on the status icon only. */
  const rowCardClass = isLight
    ? 'bg-white hover:bg-slate-50 border-slate-200'
    : 'bg-[#111111] hover:bg-white/[0.06] border-white/[0.08]';
  const rowNameClass = isLight ? 'text-slate-900' : 'text-white/90';

  const StatusMark = ({ suggestion }: { suggestion: GeneratedDomain }) => {
    if (isPendingSuggestion(suggestion)) {
      return (
        <span
          className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
            isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/[0.06] text-white/35'
          }`}
          title="Not checked yet"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/30'}`} />
        </span>
      );
    }
    if (isPremiumSuggestion(suggestion)) {
      return (
        <span
          className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
            isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-500/15 text-amber-400'
          }`}
          title="Premium"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" />
          </svg>
        </span>
      );
    }
    if (isAvailableSuggestion(suggestion)) {
      return (
        <span
          className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
            isLight
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-[0_0_6px_rgba(16,185,129,0.28)]'
              : 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/25 shadow-[0_0_8px_rgba(52,211,153,0.32)]'
          }`}
          title="Available"
          aria-label="Available"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      );
    }
    return (
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
          isLight ? 'bg-rose-50 text-rose-500' : 'bg-rose-500/10 text-rose-400/90'
        }`}
        title="Taken"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
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

    // Exact match first, then the ranked word list.
    // Ends-with = word+keyword. Starts-with = keyword+word.
    // Score follows list order so popular modifiers stay first.
    push(keyword, 500000, 'exact');

    prefixes.forEach((prefix, index) => {
      if (prefix === keyword) return;
      push(`${prefix}${keyword}`, 200000 - index * 2, 'prefix');
    });

    suffixes.forEach((suffix, index) => {
      if (suffix === keyword) return;
      push(`${keyword}${suffix}`, 200000 - index * 2 - 1, 'suffix');
    });

    // Extra semantic joins only when that word is not already in the ranked list.
    semanticAlternatives.forEach((alt, index) => {
      push(alt, 5000 - index, 'alternative');
      if (withCompounds) {
        push(`${keyword}${alt}`, 4000 - index, 'compound');
        push(`${alt}${keyword}`, 3900 - index, 'compound');
      }
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

  const cleanKeywordNow = keyword.toLowerCase().replace(/\s+/g, '');
  const matchedSuggestions = suggestions.filter((d) => {
    const len = d.name.length;
    if (len < minLen || len > maxLen) return false;
    if (positionFilter === 'starts' && !d.name.startsWith(cleanKeywordNow)) return false;
    if (positionFilter === 'ends' && !d.name.endsWith(cleanKeywordNow)) return false;
    return true;
  });
  const availableCount = matchedSuggestions.filter(isAvailableSuggestion).length;
  const premiumCount = matchedSuggestions.filter(isPremiumSuggestion).length;
  const takenCount = matchedSuggestions.filter(isTakenSuggestion).length;
  const totalCount = suggestions.length;
  const listedCount = matchedSuggestions.length;

  const chipClass = isLight
    ? 'bg-white border-[var(--ds-hairline)] text-slate-600 hover:border-[var(--ds-hairline-strong)]'
    : 'bg-[#111111] border-white/[0.08] text-white/55 hover:border-white/16 hover:text-white/80';

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Unified search panel — fully opaque so ambient dots never show through */}
      <div
        className={`shine-border relative isolate overflow-hidden rounded-2xl border p-3 sm:p-4 ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm shadow-slate-900/[0.04]'
            : 'bg-[#0a0a0a] border-white/10'
        }`}
        style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0a' }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0a' }}
        />
        <div className="relative z-[1] max-w-3xl mx-auto">
          {/* One continuous control — input has NO inner border/box */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 transition-all ${
              isLight
                ? 'bg-slate-50 border border-slate-200 focus-within:border-slate-300 focus-within:bg-white focus-within:shadow-sm'
                : 'bg-[#111111] border border-white/10 focus-within:border-white/22'
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
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-bold border transition-colors ${
                      active
                        ? isLight
                          ? 'bg-white text-slate-900 border-[var(--ds-hairline-strong)]'
                          : 'bg-[#111111] text-white border-white/20'
                        : isLight
                          ? 'bg-transparent text-slate-500 border-transparent hover:text-slate-800'
                          : 'bg-transparent text-white/40 border-transparent hover:text-white/70'
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
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold transition-colors ${
                    keyword === example
                      ? isLight
                        ? 'bg-white text-slate-900 border-[var(--ds-hairline-strong)]'
                        : 'bg-[#111111] text-white border-white/20'
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
                        isLight ? 'bg-slate-900' : 'bg-white/70'
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
                className="grid grid-cols-2 gap-1.5 sm:grid-cols-[repeat(4,minmax(0,1fr))] sm:gap-2"
                role="tablist"
                aria-label="Filter by availability"
              >
                {(
                  [
                    {
                      id: 'available' as const,
                      label: 'Available',
                      hint: 'Free to register',
                      count: availableCount,
                      icon: isLight
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
                    },
                    {
                      id: 'premium' as const,
                      label: 'Premium',
                      hint: 'Listed for sale',
                      count: premiumCount,
                      icon: isLight
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-amber-400/25 bg-amber-400/10 text-amber-300',
                    },
                    {
                      id: 'taken' as const,
                      label: 'Taken',
                      hint: 'Already registered',
                      count: takenCount,
                      icon: isLight
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : 'border-rose-400/25 bg-rose-400/10 text-rose-300',
                    },
                    {
                      id: 'all' as const,
                      label: 'All ideas',
                      hint: 'Every generated name',
                      count: listedCount,
                      icon: isLight
                        ? 'border-[#d7dbdc] bg-[#f4f5f5] text-slate-700'
                        : 'border-white/12 bg-white/[0.04] text-white/75',
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
                      className={`flex w-full min-w-0 flex-col gap-1.5 rounded-xl border px-2.5 py-2.5 sm:px-3 sm:py-3 text-left transition-colors ${
                        isLight ? 'bg-white text-slate-900' : 'bg-[#111111] text-white'
                      } ${
                        active
                          ? isLight
                            ? 'border-[var(--ds-hairline-strong)]'
                            : 'border-white/25'
                          : isLight
                            ? 'border-[var(--ds-hairline)] hover:border-[var(--ds-hairline-strong)]'
                            : 'border-white/[0.08] hover:border-white/16'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${tab.icon}`}
                        >
                          <StatusGlyph id={tab.id} />
                        </span>
                        <span
                          className={`min-w-0 flex-1 truncate text-[10px] font-bold uppercase tracking-wide sm:text-[11px] ${
                            isLight ? 'text-slate-500' : 'text-white/45'
                          }`}
                        >
                          {tab.label}
                        </span>
                        <span className="shrink-0 text-base font-black tabular-nums leading-none sm:text-lg">
                          {tab.count.toLocaleString()}
                        </span>
                      </span>
                      <span
                        className={`block truncate pl-11 text-[11px] font-medium leading-snug sm:text-[12px] ${
                          isLight ? 'text-slate-600' : 'text-white/55'
                        }`}
                      >
                        {tab.hint}
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
              : 'bg-[#0a0a0a] border-white/10'
          }`}
          style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0a' }}
        >
          <div
            className={`flex flex-col gap-2 px-3 sm:px-4 py-2.5 border-b ${
              isLight ? 'border-slate-100' : 'border-white/[0.06]'
            }`}
          >
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5">
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
                      : 'bg-[#111111] border-white/12 text-white'
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
                      : 'bg-[#111111] border-white/12 text-white'
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
                  isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-[#111111]'
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
                      : 'bg-[#111111] border-white/10 text-white/80'
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
                      : 'bg-[#111111] border-white/10 text-white/80'
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
                      className={`group flex items-center gap-2 rounded-xl border px-2.5 py-2.5 min-w-0 transition-colors ${rowCardClass}`}
                    >
                      <a
                        href={getSpaceshipAffiliateUrl(fullDomain)}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        data-affiliate="spaceship"
                        data-placement="generator-domain"
                        title={`Register ${fullDomain} on Spaceship`}
                        className="flex items-center gap-2 min-w-0 flex-1 text-left"
                      >
                        <StatusMark suggestion={suggestion} />
                        <span className={`font-mono text-[12px] sm:text-[13px] font-medium truncate ${rowNameClass}`}>
                          {suggestion.name}
                          <span className={isLight ? 'text-slate-400' : 'text-white/35'}>.com</span>
                        </span>
                      </a>
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
                        primaryLabel="Go"
                        premiumLabel={
                          isPremiumSuggestion(suggestion) ? 'Premium listing' : undefined
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
                      className={`flex items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b last:border-b-0 ${
                        isLight ? 'border-slate-100 hover:bg-slate-50' : 'border-white/[0.05] hover:bg-white/[0.03]'
                      }`}
                    >
                      <a
                        href={getSpaceshipAffiliateUrl(fullDomain)}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        data-affiliate="spaceship"
                        data-placement="generator-domain"
                        title={`Register ${fullDomain} on Spaceship`}
                        className="flex items-center gap-2 min-w-0 flex-1 text-left"
                      >
                        <StatusMark suggestion={suggestion} />
                        <span className={`font-mono text-[12px] sm:text-[13px] font-medium truncate ${rowNameClass}`}>
                          {fullDomain}
                        </span>
                      </a>
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
                        primaryLabel="Go"
                        premiumLabel={
                          isPremiumSuggestion(suggestion) ? 'Premium listing' : undefined
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
                          : 'bg-[#111111] text-white/70 border-white/12'
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
          Pick a keyword chip or type above — names from the word list show up here immediately.
        </p>
      )}
    </div>
  );
}
