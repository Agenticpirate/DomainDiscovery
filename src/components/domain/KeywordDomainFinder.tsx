'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ui/Toast';
import { checkDomainAvailability } from '@/services/instantDomainService';
import { PreferredRegistrarSelect, RegistrarActionMenu } from '@/components/domain/RegistrarControls';
import { usePreferredRegistrar } from '@/hooks/usePreferredRegistrar';
import { getSavedDomainNames, toggleSavedDomain } from '@/lib/savedDomainsStore';
import keywordTool from '@/data/keyword-tool.json';
import { ds } from '@/lib/ds';

const PREFIXES = keywordTool.prefixes as string[];
const SUFFIXES = keywordTool.suffixes as string[];
type PopularSeed = { word: string; popularity: number; category: string; hot?: boolean };
const POPULAR = keywordTool.popular as PopularSeed[];

const PREFIX_RANK = new Map(PREFIXES.map((w, i) => [w, i]));
const SUFFIX_RANK = new Map(SUFFIXES.map((w, i) => [w, i]));
const SEED_POP = new Map(POPULAR.map((p) => [p.word.toLowerCase(), p.popularity]));

type SortMode = 'popularity' | 'length' | 'alpha';
type FilterMode = 'all' | 'starts' | 'ends';
type AvailFilter = 'all' | 'available' | 'taken' | 'premium' | 'unchecked';
type TypeFilter = 'all' | 'exact' | 'prefix' | 'suffix' | 'combo' | 'hyphen';

interface GeneratedDomain {
  domain: string;
  type: 'exact' | 'prefix' | 'suffix' | 'combo' | 'hyphen';
  available: boolean | null;
  /** Premium aftermarket / registry premium when known */
  premium?: boolean;
  words: string[];
  popularity: number;
  length: number;
}

interface KeywordDomainFinderProps {
  onSelect?: (domain: string) => void;
}

const BATCH_SIZE = 80;
const CHECK_CONCURRENCY = 3;

/** Compact popular row — hot + high-score seeds (includes 2026 trending) */
const POPULAR_CHIPS = POPULAR.filter((p) => p.hot || p.popularity >= 94)
  .sort((a, b) => b.popularity - a.popularity)
  .slice(0, 28);

function scorePopularity(type: GeneratedDomain['type'], words: string[]): number {
  const seedBoost = Math.max(0, ...words.map((w) => (SEED_POP.get(w) ?? 0) - 40));
  if (type === 'exact') return 1000 + seedBoost;
  if (type === 'prefix') {
    const rank = PREFIX_RANK.get(words[0] || '') ?? 999;
    return 900 - Math.min(rank, 800) + seedBoost * 0.5;
  }
  if (type === 'suffix') {
    const rank = SUFFIX_RANK.get(words[words.length - 1] || '') ?? 999;
    return 850 - Math.min(rank, 800) + seedBoost * 0.5;
  }
  if (type === 'combo') return 700 - words.length * 20 + seedBoost * 0.3;
  return 500 + seedBoost * 0.2;
}

export function KeywordDomainFinder({ onSelect }: KeywordDomainFinderProps) {
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeyword, setSecondaryKeyword] = useState('');
  const [includeHyphens, setIncludeHyphens] = useState(false);
  const [selectedTlds, setSelectedTlds] = useState<string[]>(['.com']);
  const [sortMode, setSortMode] = useState<SortMode>('popularity');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [availFilter, setAvailFilter] = useState<AvailFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [minLen, setMinLen] = useState(2);
  /** Allow longer prefix+keyword+suffix combos so filters don't wipe results */
  const [maxLen, setMaxLen] = useState(40);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [generated, setGenerated] = useState<GeneratedDomain[]>([]);
  const [checkedCount, setCheckedCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(160);
  /** Keyword used for the last successful generate — filters must use this, not live typing */
  const [searchPrimary, setSearchPrimary] = useState('');
  /** Filters / popular chips stay collapsed until the user opens them */
  const [showOptions, setShowOptions] = useState(false);
  const [showPopular, setShowPopular] = useState(false);
  const [customTldInput, setCustomTldInput] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const searchGenRef = useRef(0);
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { showToast } = useToast();
  const { selectedRegistrar, setSelectedRegistrar } = usePreferredRegistrar();

  const availableTlds = [
    '.com',
    '.net',
    '.org',
    '.io',
    '.co',
    '.ai',
    '.app',
    '.dev',
    '.xyz',
    '.tech',
    '.me',
    '.shop',
    '.info',
    '.biz',
    '.online',
    '.site',
    '.store',
    '.blog',
    '.cloud',
    '.design',
  ];

  const toggleTld = (tld: string) => {
    setSelectedTlds((prev) =>
      prev.includes(tld) ? (prev.length > 1 ? prev.filter((t) => t !== tld) : prev) : [...prev, tld]
    );
  };

  /** Accept .com, com, COM, or co.uk-style labels → normalize to .tld */
  const normalizeTld = (raw: string): string | null => {
    let t = raw.trim().toLowerCase();
    if (!t) return null;
    t = t.replace(/^\.+/, '');
    // allow multi-label like co.uk → .co.uk
    t = t.replace(/[^a-z0-9.]/g, '');
    t = t.replace(/\.+/g, '.').replace(/^\./, '').replace(/\.$/, '');
    if (!t || t.length < 2 || t.length > 32) return null;
    if (!/^[a-z0-9]+(\.[a-z0-9]+)*$/.test(t)) return null;
    return `.${t}`;
  };

  const addTld = (raw: string) => {
    const tld = normalizeTld(raw);
    if (!tld) return false;
    setSelectedTlds((prev) => (prev.includes(tld) ? prev : [...prev, tld]));
    return true;
  };

  const commitCustomTld = () => {
    if (addTld(customTldInput)) {
      setCustomTldInput('');
    }
  };

  const checkAvailabilityInBatches = useCallback(async (domains: GeneratedDomain[], gen: number) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setIsChecking(true);
    setCheckedCount(0);
    const domainNames = domains.map((d) => d.domain);
    let checked = 0;

    try {
      for (let i = 0; i < domainNames.length; i += BATCH_SIZE * CHECK_CONCURRENCY) {
        if (controller.signal.aborted || gen !== searchGenRef.current) break;
        const batchPromises: Promise<void>[] = [];
        for (let j = 0; j < CHECK_CONCURRENCY; j++) {
          const start = i + j * BATCH_SIZE;
          const batch = domainNames.slice(start, start + BATCH_SIZE);
          if (batch.length === 0) continue;
          batchPromises.push(
            checkDomainAvailability(batch)
              .then((results) => {
                if (controller.signal.aborted || gen !== searchGenRef.current) return;
                const resultMap = new Map(
                  (results || []).map((r) => [
                    r.domain.toLowerCase(),
                    { available: r.available, premium: Boolean(r.premium) },
                  ])
                );
                setGenerated((prev) => {
                  if (gen !== searchGenRef.current) return prev;
                  return prev.map((d) => {
                    const hit = resultMap.get(d.domain.toLowerCase());
                    if (!hit) return d;
                    return {
                      ...d,
                      available: hit.available,
                      premium: hit.premium,
                    };
                  });
                });
                checked += batch.length;
                if (gen === searchGenRef.current) {
                  setCheckedCount(checked);
                }
              })
              .catch(() => {
                // Keep domains visible as pending if a batch fails
                if (gen === searchGenRef.current) {
                  checked += batch.length;
                  setCheckedCount(checked);
                }
              })
          );
        }
        await Promise.all(batchPromises);
      }
    } finally {
      if (gen === searchGenRef.current) {
        setIsChecking(false);
      }
    }
  }, []);

  const buildDomainsForPrimary = useCallback(
    (primaryRaw: string, secondaryRaw?: string, tldsOverride?: string[]) => {
      const primary = primaryRaw.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!primary) return [] as GeneratedDomain[];

      const tlds =
        tldsOverride && tldsOverride.length > 0
          ? tldsOverride
          : selectedTlds.length > 0
            ? selectedTlds
            : ['.com'];

      const secondary = (secondaryRaw ?? secondaryKeyword)
        .split(',')
        .map((k) => k.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
        .filter(Boolean);
      const seen = new Set<string>();
      const out: GeneratedDomain[] = [];
      const add = (domain: string, type: GeneratedDomain['type'], words: string[]) => {
        const key = domain.toLowerCase();
        if (seen.has(key)) return;
        const name = key.split('.')[0] || '';
        if (name.length < 2 || name.length > 63) return;
        seen.add(key);
        out.push({
          domain: key,
          type,
          available: null,
          words,
          popularity: scorePopularity(type, words),
          length: name.length,
        });
      };

      for (const tld of tlds) {
        const ext = tld.startsWith('.') ? tld : `.${tld}`;
        add(`${primary}${ext}`, 'exact', [primary]);
        for (const prefix of PREFIXES) {
          if (prefix === primary) continue;
          add(`${prefix}${primary}${ext}`, 'prefix', [prefix, primary]);
          if (includeHyphens) add(`${prefix}-${primary}${ext}`, 'hyphen', [prefix, primary]);
        }
        for (const suffix of SUFFIXES) {
          if (suffix === primary) continue;
          add(`${primary}${suffix}${ext}`, 'suffix', [primary, suffix]);
          if (includeHyphens) add(`${primary}-${suffix}${ext}`, 'hyphen', [primary, suffix]);
        }
        for (const sec of secondary) {
          add(`${primary}${sec}${ext}`, 'combo', [primary, sec]);
          add(`${sec}${primary}${ext}`, 'combo', [sec, primary]);
          if (includeHyphens) {
            add(`${primary}-${sec}${ext}`, 'hyphen', [primary, sec]);
            add(`${sec}-${primary}${ext}`, 'hyphen', [sec, primary]);
          }
          for (const prefix of PREFIXES.slice(0, 40)) {
            add(`${prefix}${primary}${sec}${ext}`, 'combo', [prefix, primary, sec]);
          }
          for (const suffix of SUFFIXES.slice(0, 40)) {
            add(`${primary}${sec}${suffix}${ext}`, 'combo', [primary, sec, suffix]);
          }
        }
      }
      return out;
    },
    [secondaryKeyword, selectedTlds, includeHyphens]
  );

  const canSearch = Boolean(
    primaryKeyword.trim() ||
      secondaryKeyword
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean).length
  );

  const handleSearch = async (seed?: string) => {
    // Free typing works anytime — popular chips are optional shortcuts only
    let primary = (seed ?? primaryKeyword).trim();
    let secondaryParts = secondaryKeyword
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (seed) {
      primary = seed;
    } else if (!primary && secondaryParts.length > 0) {
      primary = secondaryParts[0];
      secondaryParts = secondaryParts.slice(1);
    }

    // Normalize; support multi-word primary → first token + rest as secondary
    primary = primary.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim();
    const primaryTokens = primary.split(/[\s-]+/).filter(Boolean);
    if (primaryTokens.length > 1) {
      primary = primaryTokens[0];
      secondaryParts = Array.from(new Set([...primaryTokens.slice(1), ...secondaryParts]));
    } else {
      primary = primaryTokens[0] || primary.replace(/[^a-z0-9]/g, '');
    }

    if (!primary) {
      showToast('Enter a keyword with letters or numbers to search', 'info', 2200);
      return;
    }

    // Always keep input + filter keyword in sync with what we generate
    setPrimaryKeyword(primary);
    setSecondaryKeyword(secondaryParts.join(', '));
    setSearchPrimary(primary);

    // Ensure at least one TLD; pass explicitly so we never build against empty state
    const tlds = selectedTlds.length > 0 ? selectedTlds : ['.com'];
    if (!selectedTlds.length) setSelectedTlds(['.com']);

    const gen = ++searchGenRef.current;
    abortRef.current?.abort();
    setIsGenerating(true);
    setVisibleCount(160);
    // Reset result filters so a prior "Available only" / type / length cut never hides a fresh search
    setAvailFilter('all');
    setTypeFilter('all');
    setMinLen(2);
    setMaxLen(40);

    try {
      let list = buildDomainsForPrimary(primary, secondaryParts.join(', '), tlds);

      // Safety net: if build returned nothing, force .com exact/prefix/suffix
      if (!list.length) {
        list = buildDomainsForPrimary(primary, secondaryParts.join(', '), ['.com']);
      }

      if (gen !== searchGenRef.current) return;

      if (!list.length) {
        setGenerated([]);
        showToast('No domains generated — try another keyword or extension', 'info', 2500);
        return;
      }

      setGenerated(list);
      void checkAvailabilityInBatches(list, gen);
    } catch (err) {
      console.error('Keyword search failed:', err);
      if (gen === searchGenRef.current) {
        showToast('Search failed — please try again', 'error', 2500);
      }
    } finally {
      if (gen === searchGenRef.current) {
        setIsGenerating(false);
      }
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsChecking(false);
  };

  const filtered = useMemo(() => {
    let list = [...generated];
    // Must use searchPrimary (last successful generate), NOT live input — typing after search was wiping results
    const primary = searchPrimary.toLowerCase().replace(/[^a-z0-9]/g, '');
    list = list.filter((d) => d.length >= minLen && d.length <= maxLen);

    if (primary) {
      if (filterMode === 'starts') {
        list = list.filter((d) => (d.domain.split('.')[0] || '').startsWith(primary));
      } else if (filterMode === 'ends') {
        list = list.filter((d) => (d.domain.split('.')[0] || '').endsWith(primary));
      }
    }

    if (typeFilter !== 'all') list = list.filter((d) => d.type === typeFilter);
    if (availFilter === 'available') {
      list = list.filter((d) => d.available === true && !d.premium);
    } else if (availFilter === 'premium') {
      list = list.filter((d) => d.premium === true);
    } else if (availFilter === 'taken') {
      list = list.filter((d) => d.available === false && !d.premium);
    } else if (availFilter === 'unchecked') {
      list = list.filter((d) => d.available === null);
    }

    if (sortMode === 'length') list.sort((a, b) => a.length - b.length || a.domain.localeCompare(b.domain));
    else if (sortMode === 'alpha') list.sort((a, b) => a.domain.localeCompare(b.domain));
    else list.sort((a, b) => b.popularity - a.popularity || a.length - b.length);

    return list;
  }, [generated, filterMode, availFilter, sortMode, searchPrimary, typeFilter, minLen, maxLen]);

  const visible = filtered.slice(0, visibleCount);

  // Counts respect keyword position + length (same base as result list)
  const positionPool = useMemo(() => {
    const primary = searchPrimary.toLowerCase().replace(/[^a-z0-9]/g, '');
    return generated.filter((d) => {
      if (d.length < minLen || d.length > maxLen) return false;
      if (typeFilter !== 'all' && d.type !== typeFilter) return false;
      const name = d.domain.split('.')[0] || '';
      if (filterMode === 'starts') return !primary || name.startsWith(primary);
      if (filterMode === 'ends') return !primary || name.endsWith(primary);
      return true;
    });
  }, [generated, searchPrimary, filterMode, minLen, maxLen, typeFilter]);

  const availableCount = positionPool.filter((d) => d.available === true && !d.premium).length;
  const premiumCount = positionPool.filter((d) => d.premium === true).length;
  const takenCount = positionPool.filter((d) => d.available === false && !d.premium).length;
  const uncheckedCount = positionPool.filter((d) => d.available === null).length;
  const positionTotal = positionPool.length;
  const progressPct =
    generated.length > 0 ? Math.round((checkedCount / Math.max(generated.length, 1)) * 100) : 0;

  const pill = (active: boolean) => ds.pill(active);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main card — DESIGN.md canvas + hairline */}
      <div className={`${ds.card} overflow-hidden rounded-2xl`}>
        {/* Header — polarity ink band (DESIGN.md showcase-band-dark) */}
        <div
          className={`flex flex-wrap items-start justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b ${
            isLight
              ? 'bg-[#171717] text-white border-white/[0.08]'
              : 'border-ds-hairline pt-4 sm:pt-5 pb-0'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl border shrink-0 bg-white text-black border-white shadow-sm">
              <Icons.Search />
            </div>
            <div>
              <h3
                className={`text-base sm:text-lg font-semibold tracking-tight ${
                  isLight ? 'text-white' : 'text-ds-ink'
                }`}
              >
                Keyword domain finder
              </h3>
              <p
                className={`text-[11px] sm:text-xs mt-0.5 ${
                  isLight ? 'text-white/45' : 'text-ds-mute'
                }`}
              >
                {PREFIXES.length.toLocaleString()}+ prefixes · {SUFFIXES.length.toLocaleString()}+ suffixes ·{' '}
                {POPULAR.length.toLocaleString()}+ seeds
              </p>
            </div>
          </div>
          <PreferredRegistrarSelect
            selectedRegistrar={selectedRegistrar}
            onSelectRegistrar={setSelectedRegistrar}
            label="Registrar"
          />
        </div>

        <div className="p-4 sm:p-6 pt-4 sm:pt-5">

        {/* 1) Search fields first */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Input
            label="Primary keyword"
            value={primaryKeyword}
            onChange={(e) => setPrimaryKeyword(e.target.value)}
            placeholder="Type any word — e.g. ai, coffee, travel…"
            autoComplete="off"
            spellCheck={false}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleSearch();
              }
            }}
          />
          <Input
            label="Secondary (optional)"
            value={secondaryKeyword}
            onChange={(e) => setSecondaryKeyword(e.target.value)}
            placeholder="Optional — e.g. hub, pro, buddy"
            autoComplete="off"
            spellCheck={false}
            helperText="Combines with primary (aibuddy, buddyai, …). Works alone if primary is empty."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleSearch();
              }
            }}
          />
        </div>

        {/* Keyword position — filters result list after generate (not generation shape) */}
        <div className="mb-4">
          <label className={`${ds.label} block mb-1.5`}>Filter by position</label>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                {
                  id: 'all' as const,
                  label: 'All matches',
                  hint: 'Prefixes, suffixes & combos around your keyword',
                },
                {
                  id: 'starts' as const,
                  label: 'Starts with',
                  hint: 'Names that begin with your keyword (e.g. jobs…)',
                },
                {
                  id: 'ends' as const,
                  label: 'Ends with',
                  hint: 'Names that end with your keyword (e.g. …jobs)',
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                title={opt.hint}
                onClick={() => setFilterMode(opt.id)}
                className={pill(filterMode === opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className={`mt-1.5 text-[10px] sm:text-[11px] ${ds.mute}`}>
            {filterMode === 'starts' && 'Only domains that start with your keyword.'}
            {filterMode === 'ends' && 'Only domains that end with your keyword.'}
            {filterMode === 'all' && 'All prefix, suffix, and combo patterns.'}
          </p>
        </div>

        {/* 2) Extensions — type any TLD, pick presets, chips for selected */}
        <div className="mb-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className={ds.label}>Extensions</label>
            <span className={`text-[10px] ${ds.mute}`}>
              Type any TLD (e.g. shop, .io, co.uk) or pick a preset
            </span>
          </div>

          <div className={`flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:p-2.5 ${ds.inset} rounded-2xl`}>
            <div className="flex flex-1 min-w-0 flex-wrap items-center gap-1.5">
              <div className="relative flex-1 min-w-[8.5rem] max-w-full sm:max-w-[14rem]">
                <span
                  className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-mono ${ds.mute}`}
                >
                  .
                </span>
                <input
                  type="text"
                  value={customTldInput.replace(/^\.+/, '')}
                  onChange={(e) => setCustomTldInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
                      e.preventDefault();
                      commitCustomTld();
                    }
                  }}
                  onBlur={() => {
                    if (customTldInput.trim()) commitCustomTld();
                  }}
                  placeholder="type tld…"
                  autoComplete="off"
                  spellCheck={false}
                  className={`w-full rounded-ds-md border pl-6 pr-3 py-2 text-[12px] font-mono font-semibold outline-none transition-colors ${ds.input}`}
                  aria-label="Type a preferred extension"
                />
              </div>
              <button
                type="button"
                onClick={commitCustomTld}
                disabled={!normalizeTld(customTldInput)}
                className={`shrink-0 rounded-ds-md border px-3 py-2 text-[11px] font-bold transition-colors disabled:opacity-40 ${ds.btnSecondary} !rounded-ds-md`}
              >
                Add
              </button>
              <select
                value=""
                onChange={(e) => {
                  addTld(e.target.value);
                  e.target.value = '';
                }}
                className={`rounded-ds-md border px-2.5 py-2 text-[12px] font-semibold outline-none min-w-[7.5rem] ${ds.input}`}
                aria-label="Choose preset extension"
              >
                <option value="">Presets…</option>
                {availableTlds.map((tld) => (
                  <option key={tld} value={tld} disabled={selectedTlds.includes(tld)}>
                    {tld}
                    {selectedTlds.includes(tld) ? ' ✓' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => void handleSearch()}
              disabled={!canSearch || isGenerating}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold transition-all duration-150 w-full sm:w-auto shrink-0 ${
                !canSearch || isGenerating ? ds.btnDisabled : ds.btnPrimary
              } !rounded-xl`}
            >
              {isGenerating ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Building…
                </>
              ) : (
                <>
                  <Icons.Search className="w-4 h-4" />
                  Find domains
                </>
              )}
            </button>
          </div>

          {selectedTlds.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedTlds.map((tld) => (
                <button
                  key={tld}
                  type="button"
                  onClick={() => toggleTld(tld)}
                  title={
                    selectedTlds.length === 1
                      ? 'At least one extension required'
                      : `Remove ${tld}`
                  }
                  className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-mono font-semibold transition-colors bg-ds-ink text-white border-ds-ink hover:brightness-110"
                >
                  {tld}
                  {selectedTlds.length > 1 && (
                    <span className="opacity-55 text-[12px] leading-none" aria-hidden>
                      ×
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3) Optional toggles */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <button type="button" onClick={() => setShowOptions((v) => !v)} className={pill(showOptions)}>
            {showOptions ? 'Hide options' : 'More options'}
            <svg
              className={`w-3 h-3 transition-transform ${showOptions ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button type="button" onClick={() => setShowPopular((v) => !v)} className={pill(showPopular)}>
            {showPopular ? 'Hide popular' : 'Popular seeds'}
          </button>
          {(primaryKeyword || secondaryKeyword || generated.length > 0) && (
            <button
              type="button"
              onClick={() => {
                abortRef.current?.abort();
                searchGenRef.current += 1;
                setPrimaryKeyword('');
                setSecondaryKeyword('');
                setSearchPrimary('');
                setGenerated([]);
                setIsChecking(false);
                setIsGenerating(false);
                setCheckedCount(0);
                setVisibleCount(160);
                setAvailFilter('all');
                setTypeFilter('all');
                setFilterMode('all');
                setMinLen(2);
                setMaxLen(40);
              }}
              className={`text-[12px] font-semibold px-1 ${ds.mute} hover:text-ds-ink transition-colors`}
            >
              Clear
            </button>
          )}
        </div>

        {showPopular && (
          <div className={`mt-3 mb-1 p-2.5 sm:p-3 ${ds.inset}`}>
            <p className={`${ds.label} mb-2`}>Popular seeds</p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CHIPS.map((item) => (
                <button
                  key={item.word}
                  type="button"
                  onClick={() => void handleSearch(item.word)}
                  className={`${ds.pill(false)} !rounded-full hover:!bg-ds-ink hover:!text-white hover:!border-ds-ink`}
                >
                  {item.word}
                </button>
              ))}
            </div>
          </div>
        )}

        {showOptions && (
          <div className={`mt-3 pt-3 border-t space-y-3 border-ds-hairline`}>
            <div>
              <label className={`${ds.label} block mb-2`}>Sort by</label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'popularity' as const, label: 'Popularity' },
                    { id: 'alpha' as const, label: 'Alphabetical' },
                    { id: 'length' as const, label: 'Length' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortMode(opt.id)}
                    className={pill(sortMode === opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeHyphens}
                onChange={(e) => setIncludeHyphens(e.target.checked)}
                className="w-3.5 h-3.5 rounded"
              />
              <span className={`text-[12px] ${ds.body}`}>Include hyphens</span>
            </label>
          </div>
        )}

        {!canSearch && (
          <p className={`mt-2 text-[11px] ${ds.mute}`}>
            Type a primary or secondary keyword, then click Find domains
          </p>
        )}
        </div>
      </div>

      {/* Results */}
      {generated.length > 0 && (
        <div className={`${ds.card} overflow-hidden rounded-2xl`}>
          {/* Dark stats chrome (light mode) — same surfaces as dark product UI */}
          <div
            className={`px-3 sm:px-4 py-2.5 sm:py-3 border-b ${
              isLight
                ? 'bg-[#0c0c0e] border-white/[0.06] text-white'
                : 'border-white/[0.06]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
                <span className="font-bold tabular-nums text-white">
                  {filtered.length.toLocaleString()}
                  <span className="font-medium text-white/40">
                    {' '}
                    / {positionTotal.toLocaleString()}
                    <span className="hidden sm:inline">
                      {' '}
                      ({generated.length.toLocaleString()} total)
                    </span>
                  </span>
                </span>
                {availableCount > 0 && (
                  <span className="text-emerald-400 font-semibold">{availableCount} free</span>
                )}
                {premiumCount > 0 && (
                  <span className="text-amber-400 font-semibold">{premiumCount} premium</span>
                )}
                {takenCount > 0 && (
                  <span className="text-rose-300/90">{takenCount} taken</span>
                )}
                {uncheckedCount > 0 && isChecking && (
                  <span className="text-white/50">
                    checking {checkedCount.toLocaleString()}…
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <PreferredRegistrarSelect
                  selectedRegistrar={selectedRegistrar}
                  onSelectRegistrar={setSelectedRegistrar}
                  label="Register at"
                  className="text-[11px]"
                />
                {isChecking && (
                  <button type="button" onClick={handleStop} className={pill(false)}>
                    Stop
                  </button>
                )}
              </div>
            </div>

            {isChecking && (
              <div className="mt-2 h-1 rounded-full overflow-hidden bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, progressPct)}%` }}
                />
              </div>
            )}
          </div>

          <div className="px-3 sm:px-4 py-3 border-b space-y-2.5 border-ds-hairline bg-ds-soft">
            {/* Position + sort also editable after results (same state as form) */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wide mr-0.5" style={{ color: 'var(--text-muted)' }}>
                Position
              </span>
              {(
                [
                  { id: 'all' as const, label: 'All' },
                  { id: 'starts' as const, label: 'Starts' },
                  { id: 'ends' as const, label: 'Ends' },
                ] as const
              ).map((m) => (
                <button key={m.id} type="button" onClick={() => setFilterMode(m.id)} className={pill(filterMode === m.id)}>
                  {m.label}
                </button>
              ))}
              <span className="text-[9px] font-bold uppercase tracking-wide ml-1 mr-0.5" style={{ color: 'var(--text-muted)' }}>
                Sort
              </span>
              {(
                [
                  { id: 'popularity' as const, label: 'Popularity' },
                  { id: 'alpha' as const, label: 'Alphabetical' },
                  { id: 'length' as const, label: 'Length' },
                ] as const
              ).map((m) => (
                <button key={m.id} type="button" onClick={() => setSortMode(m.id)} className={pill(sortMode === m.id)}>
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'all' as const, label: `All (${positionTotal})` },
                    { id: 'available' as const, label: `Free (${availableCount})` },
                    { id: 'premium' as const, label: `Premium (${premiumCount})` },
                    { id: 'taken' as const, label: `Taken (${takenCount})` },
                    { id: 'unchecked' as const, label: `Pending (${uncheckedCount})` },
                  ] as const
                ).map((m) => (
                  <button key={m.id} type="button" onClick={() => setAvailFilter(m.id)} className={pill(availFilter === m.id)}>
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                  className={`rounded-lg border px-2 py-1 text-[11px] font-semibold outline-none ${ds.input}`}
                >
                  <option value="all">Type: All</option>
                  <option value="exact">Exact</option>
                  <option value="prefix">Prefix</option>
                  <option value="suffix">Suffix</option>
                  <option value="combo">Combo</option>
                  <option value="hyphen">Hyphen</option>
                </select>
                <label className={`inline-flex items-center gap-1 text-[10px] ${ds.mute}`}>
                  Len
                  <input
                    type="number"
                    min={2}
                    max={maxLen}
                    value={minLen}
                    onChange={(e) => setMinLen(Math.max(2, Math.min(Number(e.target.value) || 2, maxLen)))}
                    className={`w-10 rounded-md border px-1 py-1 tabular-nums outline-none ${ds.input}`}
                  />
                  –
                  <input
                    type="number"
                    min={minLen}
                    max={40}
                    value={maxLen}
                    onChange={(e) => setMaxLen(Math.min(40, Math.max(Number(e.target.value) || 24, minLen)))}
                    className={`w-10 rounded-md border px-1 py-1 tabular-nums outline-none ${ds.input}`}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="max-h-[min(68vh,calc(100vh-16rem))] overflow-y-auto overscroll-contain p-2 sm:p-2.5 bg-ds-soft/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 auto-rows-auto">
              {visible.map((item) => (
                <DomainRow
                  key={item.domain}
                  item={item}
                  isLight={isLight}
                  selectedRegistrar={selectedRegistrar}
                  onSelectRegistrar={setSelectedRegistrar}
                  onSelect={onSelect}
                />
              ))}
            </div>
            {visible.length === 0 && (
              <div className="text-center py-12 space-y-3">
                <p className={`text-[12px] ${ds.mute}`}>
                  No domains match these filters
                  {searchPrimary ? ` for “${searchPrimary}”` : ''}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilterMode('all');
                    setAvailFilter('all');
                    setTypeFilter('all');
                    setMinLen(2);
                    setMaxLen(40);
                  }}
                  className={pill(false)}
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          {visibleCount < filtered.length && (
            <div className="flex items-center justify-center gap-4 py-2.5 border-t border-ds-hairline bg-ds-soft">
              <button
                type="button"
                onClick={() => setVisibleCount((n) => n + 200)}
                className={pill(false)}
              >
                Show more ({Math.min(200, filtered.length - visibleCount)} of{' '}
                {(filtered.length - visibleCount).toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => setVisibleCount(filtered.length)}
                className="text-[11px] font-semibold"
                style={{ color: 'var(--text-muted)' }}
              >
                Show all {filtered.length.toLocaleString()}
              </button>
            </div>
          )}
        </div>
      )}

      {generated.length === 0 && !isGenerating && (
        <div className={`text-center rounded-2xl border px-4 py-6 sm:py-8 ${ds.card} ${ds.mute}`}>
          <p className={`text-[12px] sm:text-[13px] leading-relaxed max-w-md mx-auto ${ds.mute}`}>
            Type any keyword (or use Popular), pick a registrar, then Find domains — prefixes,
            suffixes &amp; live checks included.
          </p>
        </div>
      )}
    </div>
  );
}

function DomainRow({
  item,
  isLight,
  selectedRegistrar,
  onSelectRegistrar,
  onSelect,
}: {
  item: GeneratedDomain;
  isLight: boolean;
  selectedRegistrar: import('@/lib/registrars').RegistrarName;
  onSelectRegistrar: (r: import('@/lib/registrars').RegistrarName) => void;
  onSelect?: (domain: string) => void;
}) {
  const { showToast } = useToast();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const sync = () => setIsSaved(getSavedDomainNames().includes(item.domain.toLowerCase()));
    sync();
    window.addEventListener('savedDomainsUpdated', sync);
    return () => window.removeEventListener('savedDomainsUpdated', sync);
  }, [item.domain]);

  const isPremium = Boolean(item.premium);
  const isAvailable = item.available === true && !isPremium;
  const isTaken = item.available === false && !isPremium;
  const isUnchecked = item.available === null;
  const canRegister = isAvailable || isPremium;

  // Card surfaces: light mode needs strong tinted plates (same language as bulk search)
  const cardClass = isUnchecked
    ? isLight
      ? 'bg-white border-slate-200/90 shadow-sm shadow-slate-900/[0.03] hover:border-slate-300 hover:shadow-md'
      : 'bg-[#121214] border-white/[0.08] hover:bg-[#161618]'
    : isAvailable
      ? isLight
        ? 'bg-emerald-50 border-emerald-200/90 shadow-sm shadow-emerald-900/[0.04] hover:border-emerald-300 hover:bg-emerald-50/95'
        : 'bg-emerald-500/[0.08] border-emerald-500/25 hover:bg-emerald-500/[0.12]'
      : isPremium
        ? isLight
          ? 'bg-amber-50 border-amber-200/90 shadow-sm shadow-amber-900/[0.05] hover:border-amber-300 hover:bg-amber-50/95'
          : 'bg-amber-500/[0.08] border-amber-500/25 hover:bg-amber-500/[0.12]'
        : isLight
          ? 'bg-rose-50/90 border-rose-200/80 shadow-sm shadow-rose-900/[0.03] hover:border-rose-300'
          : 'bg-rose-500/[0.07] border-rose-500/20 hover:bg-rose-500/[0.1]';

  const dotClass = isUnchecked
    ? isLight
      ? 'bg-slate-300'
      : 'bg-white/20'
    : isAvailable
      ? isLight
        ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.45)]'
        : 'bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.45)]'
      : isPremium
        ? isLight
          ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.45)]'
          : 'bg-amber-400 shadow-[0_0_7px_rgba(251,191,36,0.45)]'
        : isLight
          ? 'bg-rose-500'
          : 'bg-rose-400/90';

  const nameClass = isUnchecked
    ? isLight
      ? 'text-slate-600'
      : 'text-white/55'
    : isAvailable
      ? isLight
        ? 'text-emerald-950 font-semibold'
        : 'text-emerald-50 font-semibold'
      : isPremium
        ? isLight
          ? 'text-amber-950 font-semibold'
          : 'text-amber-50 font-semibold'
        : isLight
          ? 'text-rose-800/80 line-through decoration-rose-300'
          : 'text-white/30 line-through decoration-white/15';

  const saveClass = isSaved
    ? isLight
      ? isAvailable
        ? 'text-emerald-800 border-emerald-600 bg-emerald-100'
        : isPremium
          ? 'text-amber-900 border-amber-600 bg-amber-100'
          : isTaken
            ? 'text-rose-800 border-rose-500 bg-rose-100'
            : 'text-slate-900 border-slate-900 bg-slate-100'
      : 'text-white border-white/30 bg-white/10'
    : isLight
      ? isAvailable
        ? 'text-emerald-600/50 border-emerald-200 hover:text-emerald-800 hover:bg-emerald-100'
        : isPremium
          ? 'text-amber-700/50 border-amber-200 hover:text-amber-900 hover:bg-amber-100'
          : isTaken
            ? 'text-rose-500/50 border-rose-200 hover:text-rose-800 hover:bg-rose-100'
            : 'text-slate-400 border-slate-200 bg-white hover:text-slate-700 hover:border-slate-300'
      : 'text-white/40 border-white/10 hover:text-white/80';

  const goPrimary = isLight
    ? isAvailable
      ? 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm shadow-emerald-900/15'
      : isPremium
        ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm shadow-amber-900/15'
        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm shadow-slate-900/15'
    : 'bg-white text-black hover:bg-white/90';

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2.5 min-w-0 rounded-xl border transition-all duration-150 ${cardClass}`}
    >
      <button
        type="button"
        className="flex items-center gap-1.5 min-w-0 flex-1 text-left"
        onClick={() => onSelect?.(item.domain)}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
        <span className={`font-mono text-[12px] sm:text-[13px] truncate ${nameClass}`}>
          {item.domain}
        </span>
        {isPremium && (
          <span
            className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
              isLight
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-amber-400/15 text-amber-200 border-amber-400/25'
            }`}
            title="Premium listing from GoDaddy"
          >
            Premium · GoDaddy
          </span>
        )}
        {isAvailable && (
          <span
            className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
              isLight
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : 'bg-emerald-400/15 text-emerald-200 border-emerald-400/25'
            }`}
          >
            Free
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          const { saved } = toggleSavedDomain(item.domain);
          setIsSaved(saved);
          showToast(saved ? `Saved ${item.domain}` : `Removed ${item.domain}`, 'success', 1500);
        }}
        className={`h-7 w-7 shrink-0 inline-flex items-center justify-center rounded-full border transition-colors ${saveClass}`}
        aria-label={isSaved ? `Remove ${item.domain}` : `Save ${item.domain}`}
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

      {!isUnchecked && (
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <RegistrarActionMenu
            domain={item.domain}
            selectedRegistrar={selectedRegistrar}
            onSelectRegistrar={onSelectRegistrar}
            canRegister={canRegister}
            isPremium={isPremium}
            primaryLabel={isPremium ? 'Go · GoDaddy' : 'Go'}
            premiumLabel={isPremium ? 'Premium listing from GoDaddy' : undefined}
            primaryButtonClassName={`text-[10px] sm:text-[11px] px-2 py-1 rounded-full font-semibold transition-colors ${goPrimary}`}
            chevronButtonClassName={`rounded-full p-1 transition-colors ${goPrimary}`}
            fallbackButtonClassName={`text-[10px] sm:text-[11px] px-2 py-1 rounded-full font-semibold transition-colors ${
              isLight
                ? 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200/80'
                : 'bg-white/[0.06] text-white/60 hover:bg-white/10'
            }`}
          />
        </div>
      )}
    </div>
  );
}
