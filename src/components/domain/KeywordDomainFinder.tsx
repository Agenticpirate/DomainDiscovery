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

const PREFIXES = keywordTool.prefixes as string[];
const SUFFIXES = keywordTool.suffixes as string[];
type PopularSeed = { word: string; popularity: number; category: string; hot?: boolean };
const POPULAR = keywordTool.popular as PopularSeed[];

const PREFIX_RANK = new Map(PREFIXES.map((w, i) => [w, i]));
const SUFFIX_RANK = new Map(SUFFIXES.map((w, i) => [w, i]));
const SEED_POP = new Map(POPULAR.map((p) => [p.word.toLowerCase(), p.popularity]));

type SortMode = 'popularity' | 'length' | 'alpha';
type FilterMode = 'all' | 'starts' | 'ends';
type AvailFilter = 'all' | 'available' | 'taken' | 'unchecked';
type TypeFilter = 'all' | 'exact' | 'prefix' | 'suffix' | 'combo' | 'hyphen';

interface GeneratedDomain {
  domain: string;
  type: 'exact' | 'prefix' | 'suffix' | 'combo' | 'hyphen';
  available: boolean | null;
  words: string[];
  popularity: number;
  length: number;
}

interface KeywordDomainFinderProps {
  onSelect?: (domain: string) => void;
}

const BATCH_SIZE = 80;
const CHECK_CONCURRENCY = 3;

/** Compact popular row only — not the full 5k library on screen */
const POPULAR_CHIPS = POPULAR.filter((p) => p.hot || p.popularity >= 94)
  .sort((a, b) => b.popularity - a.popularity)
  .slice(0, 20);

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
  const [maxLen, setMaxLen] = useState(24);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [generated, setGenerated] = useState<GeneratedDomain[]>([]);
  const [checkedCount, setCheckedCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(160);
  /** Filters / popular chips stay collapsed until the user opens them */
  const [showOptions, setShowOptions] = useState(false);
  const [showPopular, setShowPopular] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';
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

  const addTldFromSelect = (tld: string) => {
    if (!tld) return;
    setSelectedTlds((prev) => (prev.includes(tld) ? prev : [...prev, tld]));
  };

  const checkAvailabilityInBatches = useCallback(async (domains: GeneratedDomain[]) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setIsChecking(true);
    setCheckedCount(0);
    const domainNames = domains.map((d) => d.domain);
    let checked = 0;

    for (let i = 0; i < domainNames.length; i += BATCH_SIZE * CHECK_CONCURRENCY) {
      if (controller.signal.aborted) break;
      const batchPromises: Promise<void>[] = [];
      for (let j = 0; j < CHECK_CONCURRENCY; j++) {
        const start = i + j * BATCH_SIZE;
        const batch = domainNames.slice(start, start + BATCH_SIZE);
        if (batch.length === 0) continue;
        batchPromises.push(
          checkDomainAvailability(batch).then((results) => {
            if (controller.signal.aborted) return;
            const availMap = new Map(results.map((r) => [r.domain.toLowerCase(), r.available]));
            setGenerated((prev) =>
              prev.map((d) => {
                const avail = availMap.get(d.domain.toLowerCase());
                return avail !== undefined ? { ...d, available: avail } : d;
              })
            );
            checked += batch.length;
            setCheckedCount(checked);
          })
        );
      }
      await Promise.all(batchPromises);
    }
    setIsChecking(false);
  }, []);

  const buildDomainsForPrimary = useCallback(
    (primaryRaw: string, secondaryRaw?: string) => {
      const primary = primaryRaw.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!primary) return [] as GeneratedDomain[];

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

      for (const tld of selectedTlds) {
        add(`${primary}${tld}`, 'exact', [primary]);
        for (const prefix of PREFIXES) {
          if (prefix === primary) continue;
          add(`${prefix}${primary}${tld}`, 'prefix', [prefix, primary]);
          if (includeHyphens) add(`${prefix}-${primary}${tld}`, 'hyphen', [prefix, primary]);
        }
        for (const suffix of SUFFIXES) {
          if (suffix === primary) continue;
          add(`${primary}${suffix}${tld}`, 'suffix', [primary, suffix]);
          if (includeHyphens) add(`${primary}-${suffix}${tld}`, 'hyphen', [primary, suffix]);
        }
        for (const sec of secondary) {
          add(`${primary}${sec}${tld}`, 'combo', [primary, sec]);
          add(`${sec}${primary}${tld}`, 'combo', [sec, primary]);
          if (includeHyphens) {
            add(`${primary}-${sec}${tld}`, 'hyphen', [primary, sec]);
            add(`${sec}-${primary}${tld}`, 'hyphen', [sec, primary]);
          }
          for (const prefix of PREFIXES.slice(0, 40)) {
            add(`${prefix}${primary}${sec}${tld}`, 'combo', [prefix, primary, sec]);
          }
          for (const suffix of SUFFIXES.slice(0, 40)) {
            add(`${primary}${sec}${suffix}${tld}`, 'combo', [primary, sec, suffix]);
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
      setPrimaryKeyword(seed);
      primary = seed;
    } else if (!primary && secondaryParts.length > 0) {
      primary = secondaryParts[0];
      secondaryParts = secondaryParts.slice(1);
      setPrimaryKeyword(primary);
      setSecondaryKeyword(secondaryParts.join(', '));
    }

    // Normalize; support multi-word primary → first token + rest as secondary
    primary = primary.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim();
    const primaryTokens = primary.split(/[\s-]+/).filter(Boolean);
    if (primaryTokens.length > 1) {
      primary = primaryTokens[0];
      secondaryParts = Array.from(new Set([...primaryTokens.slice(1), ...secondaryParts]));
      setPrimaryKeyword(primary);
      setSecondaryKeyword(secondaryParts.join(', '));
    } else {
      primary = primaryTokens[0] || primary.replace(/[^a-z0-9]/g, '');
    }

    if (!primary) return;

    abortRef.current?.abort();
    setIsGenerating(true);
    setVisibleCount(160);
    setAvailFilter('all');

    const domains = buildDomainsForPrimary(primary, secondaryParts.join(', '));
    if (!domains.length) {
      setIsGenerating(false);
      return;
    }
    setGenerated(domains);
    setIsGenerating(false);
    void checkAvailabilityInBatches(domains);
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsChecking(false);
  };

  const filtered = useMemo(() => {
    let list = [...generated];
    const primary = primaryKeyword.toLowerCase().replace(/[^a-z0-9]/g, '');
    list = list.filter((d) => d.length >= minLen && d.length <= maxLen);

    if (filterMode === 'starts') list = list.filter((d) => d.domain.split('.')[0].startsWith(primary));
    else if (filterMode === 'ends') list = list.filter((d) => d.domain.split('.')[0].endsWith(primary));

    if (typeFilter !== 'all') list = list.filter((d) => d.type === typeFilter);
    if (availFilter === 'available') list = list.filter((d) => d.available === true);
    else if (availFilter === 'taken') list = list.filter((d) => d.available === false);
    else if (availFilter === 'unchecked') list = list.filter((d) => d.available === null);

    if (sortMode === 'length') list.sort((a, b) => a.length - b.length || a.domain.localeCompare(b.domain));
    else if (sortMode === 'alpha') list.sort((a, b) => a.domain.localeCompare(b.domain));
    else list.sort((a, b) => b.popularity - a.popularity || a.length - b.length);

    return list;
  }, [generated, filterMode, availFilter, sortMode, primaryKeyword, typeFilter, minLen, maxLen]);

  const visible = filtered.slice(0, visibleCount);

  // Counts respect keyword position + length (same base as result list)
  const positionPool = useMemo(() => {
    const primary = primaryKeyword.toLowerCase().replace(/[^a-z0-9]/g, '');
    return generated.filter((d) => {
      if (d.length < minLen || d.length > maxLen) return false;
      if (typeFilter !== 'all' && d.type !== typeFilter) return false;
      const name = d.domain.split('.')[0] || '';
      if (filterMode === 'starts') return !!primary && name.startsWith(primary);
      if (filterMode === 'ends') return !!primary && name.endsWith(primary);
      return true;
    });
  }, [generated, primaryKeyword, filterMode, minLen, maxLen, typeFilter]);

  const availableCount = positionPool.filter((d) => d.available === true).length;
  const takenCount = positionPool.filter((d) => d.available === false).length;
  const uncheckedCount = positionPool.filter((d) => d.available === null).length;
  const positionTotal = positionPool.length;
  const progressPct =
    generated.length > 0 ? Math.round((checkedCount / Math.max(generated.length, 1)) * 100) : 0;

  const pill = (active: boolean) =>
    `inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${
      active
        ? isLight
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-white text-black border-white'
        : isLight
          ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          : 'bg-white/[0.04] text-white/65 border-white/10 hover:bg-white/[0.08] hover:text-white'
    }`;

  return (
    <div className="space-y-3 sm:space-y-4 animate-fade-in">
      {/* Main card — search first, options on demand */}
      <div
        className={`rounded-2xl border p-3.5 sm:p-5 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0c0e] border-white/[0.1]'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                isLight ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-black border-white'
              }`}
            >
              <Icons.Search />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">Keyword domain finder</h3>
              <p className="text-[11px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
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

        {/* 2) Extensions dropdown + CTA */}
        <div className="mb-3 flex flex-col sm:flex-row sm:items-end gap-2.5 sm:gap-3">
          <div className="flex-1 min-w-0">
            <label
              className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ${
                isLight ? 'text-slate-500' : 'text-white/40'
              }`}
            >
              Extensions
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              <select
                value=""
                onChange={(e) => {
                  addTldFromSelect(e.target.value);
                  e.target.value = '';
                }}
                className={`rounded-xl border px-3 py-2 text-[12px] font-semibold outline-none min-w-[9rem] ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-[#121214] border-white/10 text-white'
                }`}
                aria-label="Add extension"
              >
                <option value="">Add extension…</option>
                {availableTlds.map((tld) => (
                  <option key={tld} value={tld} disabled={selectedTlds.includes(tld)}>
                    {tld}
                    {selectedTlds.includes(tld) ? ' ✓' : ''}
                  </option>
                ))}
              </select>
              {selectedTlds.map((tld) => (
                <button
                  key={tld}
                  type="button"
                  onClick={() => toggleTld(tld)}
                  title={selectedTlds.length === 1 ? 'At least one extension required' : `Remove ${tld}`}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-mono font-semibold ${
                    isLight
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-black border-white'
                  }`}
                >
                  {tld}
                  {selectedTlds.length > 1 && <span className="opacity-60">×</span>}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={!canSearch || isGenerating}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-[13px] font-bold transition-opacity duration-150 w-full sm:w-auto shrink-0 ${
              !canSearch || isGenerating
                ? isLight
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-white/15 text-white/35 cursor-not-allowed'
                : isLight
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-white text-black hover:bg-white/90'
            }`}
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
          {(primaryKeyword || secondaryKeyword) && (
            <button
              type="button"
              onClick={() => {
                abortRef.current?.abort();
                setPrimaryKeyword('');
                setSecondaryKeyword('');
                setGenerated([]);
                setIsChecking(false);
                setCheckedCount(0);
              }}
              className={`text-[12px] font-semibold px-1 ${
                isLight ? 'text-slate-400 hover:text-slate-700' : 'text-white/35 hover:text-white/70'
              }`}
            >
              Clear
            </button>
          )}
        </div>

        {showPopular && (
          <div className="mt-2.5 mb-1">
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CHIPS.map((item) => (
                <button
                  key={item.word}
                  type="button"
                  onClick={() => void handleSearch(item.word)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    isLight
                      ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900'
                      : 'bg-white/[0.04] text-white/70 border-white/10 hover:bg-white hover:text-black hover:border-white'
                  }`}
                >
                  {item.word}
                </button>
              ))}
            </div>
          </div>
        )}

        {showOptions && (
          <div
            className={`mt-3 pt-3 border-t space-y-3 ${
              isLight ? 'border-slate-100' : 'border-white/[0.06]'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label
                  className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${
                    isLight ? 'text-slate-500' : 'text-white/40'
                  }`}
                >
                  Keyword position
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: 'all' as const, label: 'All matches', hint: 'Prefixes, suffixes & combos' },
                      { id: 'starts' as const, label: 'Starts with', hint: 'keyword…' },
                      { id: 'ends' as const, label: 'Ends with', hint: '…keyword' },
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
              </div>

              <div>
                <label
                  className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${
                    isLight ? 'text-slate-500' : 'text-white/40'
                  }`}
                >
                  Sort by
                </label>
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
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeHyphens}
                onChange={(e) => setIncludeHyphens(e.target.checked)}
                className="w-3.5 h-3.5 rounded"
              />
              <span className={`text-[12px] ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                Include hyphens
              </span>
            </label>
          </div>
        )}

        {!canSearch && (
          <p className="mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Type a primary or secondary keyword, then click Find domains
          </p>
        )}
      </div>

      {/* Results */}
      {generated.length > 0 && (
        <div
          className={`rounded-2xl border overflow-hidden ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0c0e] border-white/[0.1]'
          }`}
        >
          <div
            className={`px-3 sm:px-4 py-3 border-b space-y-2.5 ${
              isLight ? 'border-slate-100' : 'border-white/[0.06]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
                <span className={`font-bold tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {filtered.length.toLocaleString()}
                  <span className={`font-medium ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                    {' '}
                    / {positionTotal.toLocaleString()}
                    <span className="hidden sm:inline">
                      {' '}
                      ({generated.length.toLocaleString()} total)
                    </span>
                  </span>
                </span>
                {availableCount > 0 && (
                  <span className="text-emerald-500 font-semibold">{availableCount} available</span>
                )}
                {takenCount > 0 && (
                  <span className={isLight ? 'text-slate-400' : 'text-white/30'}>{takenCount} taken</span>
                )}
                {uncheckedCount > 0 && isChecking && (
                  <span className={isLight ? 'text-slate-500' : 'text-white/45'}>
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
              <div className={`h-1 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-white/10'}`}>
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, progressPct)}%` }}
                />
              </div>
            )}

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
                    { id: 'available' as const, label: `Available (${availableCount})` },
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
                  className={`rounded-lg border px-2 py-1 text-[11px] font-semibold outline-none ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-700'
                      : 'bg-white/[0.04] border-white/10 text-white/70'
                  }`}
                >
                  <option value="all">Type: All</option>
                  <option value="exact">Exact</option>
                  <option value="prefix">Prefix</option>
                  <option value="suffix">Suffix</option>
                  <option value="combo">Combo</option>
                  <option value="hyphen">Hyphen</option>
                </select>
                <label className="inline-flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Len
                  <input
                    type="number"
                    min={2}
                    max={maxLen}
                    value={minLen}
                    onChange={(e) => setMinLen(Math.max(2, Math.min(Number(e.target.value) || 2, maxLen)))}
                    className={`w-10 rounded-md border px-1 py-1 tabular-nums outline-none ${
                      isLight ? 'bg-white border-slate-200' : 'bg-white/[0.04] border-white/10'
                    }`}
                  />
                  –
                  <input
                    type="number"
                    min={minLen}
                    max={40}
                    value={maxLen}
                    onChange={(e) => setMaxLen(Math.min(40, Math.max(Number(e.target.value) || 24, minLen)))}
                    className={`w-10 rounded-md border px-1 py-1 tabular-nums outline-none ${
                      isLight ? 'bg-white border-slate-200' : 'bg-white/[0.04] border-white/10'
                    }`}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="max-h-[min(68vh,calc(100vh-16rem))] overflow-y-auto overscroll-contain p-1.5 sm:p-2">
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
              <p className="text-center py-12 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                No domains match these filters
              </p>
            )}
          </div>

          {visibleCount < filtered.length && (
            <div
              className={`flex items-center justify-center gap-4 py-2.5 border-t ${
                isLight ? 'border-slate-100 bg-slate-50/50' : 'border-white/[0.06] bg-black/20'
              }`}
            >
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
        <p className="text-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
          Type any keyword (or use Popular), pick a registrar, then Find domains — prefixes, suffixes & live checks included.
        </p>
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

  const isAvailable = item.available === true;
  const isTaken = item.available === false;
  const isUnchecked = item.available === null;
  const canRegister = isAvailable;

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2.5 min-w-0 rounded-xl border transition-colors ${
        isLight
          ? 'bg-white hover:bg-slate-50 border-slate-200'
          : 'bg-[#121214] hover:bg-[#161618] border-white/[0.08]'
      }`}
    >
      <button
        type="button"
        className="flex items-center gap-1.5 min-w-0 flex-1 text-left"
        onClick={() => onSelect?.(item.domain)}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isUnchecked
              ? isLight
                ? 'bg-slate-300'
                : 'bg-white/20'
              : isAvailable
                ? isLight
                  ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.35)]'
                  : 'bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.4)]'
                : 'bg-red-400/85'
          }`}
        />
        <span
          className={`font-mono text-[12px] sm:text-[13px] truncate ${
            isAvailable
              ? isLight
                ? 'text-slate-900 font-semibold'
                : 'text-white font-semibold'
              : isTaken
                ? isLight
                  ? 'text-slate-400'
                  : 'text-white/30'
                : isLight
                  ? 'text-slate-600'
                  : 'text-white/55'
          }`}
        >
          {item.domain}
        </span>
      </button>

      <button
        type="button"
        onClick={() => {
          const { saved } = toggleSavedDomain(item.domain);
          setIsSaved(saved);
          showToast(saved ? `Saved ${item.domain}` : `Removed ${item.domain}`, 'success', 1500);
        }}
        className={`h-7 w-7 shrink-0 inline-flex items-center justify-center rounded-full border transition-colors ${
          isSaved
            ? isLight
              ? 'text-slate-900 border-slate-900 bg-slate-100'
              : 'text-white border-white/30 bg-white/10'
            : isLight
              ? 'text-slate-400 border-slate-200 hover:text-slate-700'
              : 'text-white/40 border-white/10 hover:text-white/80'
        }`}
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
            primaryLabel="Go"
            primaryButtonClassName={`text-[10px] sm:text-[11px] px-2 py-1 rounded-full font-semibold transition-colors ${
              isLight
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-white text-black hover:bg-white/90'
            }`}
            chevronButtonClassName={`rounded-full p-1 transition-colors ${
              isLight
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-white text-black hover:bg-white/90'
            }`}
            fallbackButtonClassName={`text-[10px] sm:text-[11px] px-2 py-1 rounded-full font-semibold transition-colors ${
              isLight
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-white/[0.06] text-white/60 hover:bg-white/10'
            }`}
          />
        </div>
      )}
    </div>
  );
}
