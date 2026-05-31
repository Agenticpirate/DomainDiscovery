'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/contexts/ThemeContext';
import { checkDomainAvailability } from '@/services/instantDomainService';

/* ── Lean-Domain-Search-style prefix / suffix word lists ── */
const PREFIXES = [
  'get','my','the','go','try','use','hey','join','be','we',
  'all','any','one','top','best','new','pro','super','ultra','mega',
  'hyper','smart','fast','quick','easy','simple','open','free','real','true',
  'just','only','pure','prime','first','next','ever','over','up','on',
  'in','re','un','pre','out','no','so','do','hi','ok',
  'air','big','hot','cool','zen','ace','max','mini','micro','nano',
  'auto','cyber','digi','eco','geo','bio','neo','meta','omni','poly',
  'multi','inter','cross','trans','co','de','ex','sub','mis','non',
];

const SUFFIXES = [
  'hub','pro','app','hq','lab','now','live','zone','spot','base',
  'pad','box','kit','set','way','net','web','dev','tech','ai',
  'io','co','ly','ify','ful','er','ize','up','it','on',
  'go','me','us','to','at','in','fx','rx','mx','ox',
  'able','ware','works','craft','smith','mind','flow','wave','pulse','spark',
  'fire','bolt','dash','rush','flip','snap','click','tap','pop','buzz',
  'nest','dock','port','gate','link','path','loop','core','edge','peak',
  'rise','shift','stack','vault','cloud','space','world','land','city','town',
  'crew','team','clan','tribe','guild','force','squad','group','club','circle',
  'plus','max','prime','elite','ultra','super','master','chief','boss','king',
  'star','nova','pixel','byte','bit','data','code','node','wire','grid',
  'line','point','mark','sign','tag','log','map','plan','list','rank',
  'shop','store','deal','cart','pay','sell','buy','trade','market','sales',
  'fit','health','life','care','well','med','vital','active','energy','power',
  'learn','study','skill','guide','book','read','know','wise','brain','think',
  'play','game','fun','joy','happy','party','show','stream','video','music',
  'home','place','nest','urban','eco','green','solar','clean','blue','sky',
  'design','studio','art','craft','create','make','build','media','brand','style',
];

type SortMode = 'popularity' | 'length' | 'alpha';
type FilterMode = 'all' | 'starts' | 'ends';
type AvailFilter = 'all' | 'available' | 'taken';

interface GeneratedDomain {
  domain: string;
  type: 'exact' | 'prefix' | 'suffix' | 'combo' | 'hyphen';
  available: boolean | null; // null = unchecked
  words: string[];
}

interface KeywordDomainFinderProps {
  onSelect?: (domain: string) => void;
  /** Show the internal title + subtitle. Off by default since callers provide a page heading. */
  showHeading?: boolean;
}

const CHECK_LIMIT = 600;

export function KeywordDomainFinder({ onSelect, showHeading = false }: KeywordDomainFinderProps) {
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeyword, setSecondaryKeyword] = useState('');
  const [includeHyphens, setIncludeHyphens] = useState(false);
  const [selectedTlds, setSelectedTlds] = useState<string[]>(['.com']);
  const [sortMode, setSortMode] = useState<SortMode>('popularity');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [availFilter, setAvailFilter] = useState<AvailFilter>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [generated, setGenerated] = useState<GeneratedDomain[]>([]);
  const [checkedCount, setCheckedCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(100);
  const abortRef = useRef<AbortController | null>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const availableTlds = ['.com', '.net', '.org', '.io', '.co', '.ai', '.app', '.dev', '.xyz', '.tech', '.me', '.shop'];

  const toggleTld = (tld: string) => {
    setSelectedTlds((prev) =>
      prev.includes(tld) ? (prev.length > 1 ? prev.filter((t) => t !== tld) : prev) : [...prev, tld]
    );
  };

  /* ── Generate all domain combinations (client-side, instant) ── */
  const generateCombinations = useCallback(() => {
    const primary = primaryKeyword.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!primary) return;

    const secondary = secondaryKeyword
      .split(',')
      .map((k) => k.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter((k) => k.length > 0);

    const seen = new Set<string>();
    const domains: GeneratedDomain[] = [];

    const add = (domain: string, type: GeneratedDomain['type'], words: string[]) => {
      const key = domain.toLowerCase();
      if (seen.has(key) || key.length > 63 + key.lastIndexOf('.')) return;
      seen.add(key);
      domains.push({ domain: key, type, available: null, words });
    };

    for (const tld of selectedTlds) {
      // Exact match
      add(`${primary}${tld}`, 'exact', [primary]);

      // Prefix combos: prefix + primary
      for (const prefix of PREFIXES) {
        add(`${prefix}${primary}${tld}`, 'prefix', [prefix, primary]);
        if (includeHyphens) {
          add(`${prefix}-${primary}${tld}`, 'hyphen', [prefix, primary]);
        }
      }

      // Suffix combos: primary + suffix
      for (const suffix of SUFFIXES) {
        add(`${primary}${suffix}${tld}`, 'suffix', [primary, suffix]);
        if (includeHyphens) {
          add(`${primary}-${suffix}${tld}`, 'hyphen', [primary, suffix]);
        }
      }

      // Secondary keyword combos
      for (const sec of secondary) {
        add(`${primary}${sec}${tld}`, 'combo', [primary, sec]);
        add(`${sec}${primary}${tld}`, 'combo', [sec, primary]);
        if (includeHyphens) {
          add(`${primary}-${sec}${tld}`, 'hyphen', [primary, sec]);
          add(`${sec}-${primary}${tld}`, 'hyphen', [sec, primary]);
        }

        // Secondary + prefixes/suffixes
        for (const prefix of PREFIXES.slice(0, 15)) {
          add(`${prefix}${primary}${sec}${tld}`, 'combo', [prefix, primary, sec]);
          add(`${prefix}${sec}${primary}${tld}`, 'combo', [prefix, sec, primary]);
        }
        for (const suffix of SUFFIXES.slice(0, 15)) {
          add(`${primary}${sec}${suffix}${tld}`, 'combo', [primary, sec, suffix]);
          add(`${sec}${primary}${suffix}${tld}`, 'combo', [sec, primary, suffix]);
        }
      }
    }

    return domains;
  }, [primaryKeyword, secondaryKeyword, selectedTlds, includeHyphens]);

  /* ── Check availability in a single batched request ── */
  const checkAvailabilityInBatches = useCallback(async (domains: GeneratedDomain[]) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setIsChecking(true);
    setCheckedCount(0);

    // The availability API enforces a tight bulk rate limit (5/min), so fire a
    // single request (it chunks server-side) instead of many concurrent ones
    // that would get 429'd and leave names stuck on "unchecked".
    const domainNames = domains.slice(0, CHECK_LIMIT).map((d) => d.domain);

    try {
      const results = await checkDomainAvailability(domainNames);
      if (controller.signal.aborted) return;

      const availMap = new Map(results.map((r) => [r.domain.toLowerCase(), r.available]));
      setGenerated((prev) =>
        prev.map((d) => {
          const avail = availMap.get(d.domain.toLowerCase());
          return avail !== undefined ? { ...d, available: avail } : d;
        })
      );
      setCheckedCount(domainNames.length);
    } finally {
      if (!controller.signal.aborted) setIsChecking(false);
    }
  }, []);

  const handleSearch = async () => {
    if (!primaryKeyword.trim()) return;
    abortRef.current?.abort();
    setIsGenerating(true);
    setVisibleCount(100);
    setAvailFilter('all');

    const domains = generateCombinations();
    if (!domains || domains.length === 0) {
      setIsGenerating(false);
      return;
    }

    setGenerated(domains);
    setIsGenerating(false);

    // Start availability checking in background
    void checkAvailabilityInBatches(domains);
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsChecking(false);
  };

  /* ── Filtering & sorting ── */
  const filtered = useMemo(() => {
    let list = [...generated];
    const primary = primaryKeyword.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (filterMode === 'starts') {
      list = list.filter((d) => {
        const name = d.domain.split('.')[0];
        return name.startsWith(primary);
      });
    } else if (filterMode === 'ends') {
      list = list.filter((d) => {
        const name = d.domain.split('.')[0];
        return name.endsWith(primary);
      });
    }

    if (availFilter === 'available') {
      list = list.filter((d) => d.available === true);
    } else if (availFilter === 'taken') {
      list = list.filter((d) => d.available === false);
    }

    if (sortMode === 'length') {
      list.sort((a, b) => a.domain.split('.')[0].length - b.domain.split('.')[0].length);
    } else if (sortMode === 'alpha') {
      list.sort((a, b) => a.domain.localeCompare(b.domain));
    }
    // 'popularity' keeps original order (prefixes/suffixes ordered by frequency)

    return list;
  }, [generated, filterMode, availFilter, sortMode, primaryKeyword]);

  const visible = filtered.slice(0, visibleCount);
  const availableCount = generated.filter((d) => d.available === true).length;
  const takenCount = generated.filter((d) => d.available === false).length;
  const uncheckedCount = generated.filter((d) => d.available === null).length;

  return (
    <div className={`rounded-2xl border p-3 sm:p-5 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/[0.02] border-white/10'}`}>
      {/* Header */}
      {showHeading && (
        <div className="mb-4">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className={`p-1.5 sm:p-2 rounded-lg ${isLight ? 'bg-slate-100' : 'bg-white/5 border border-white/10'}`}>
              <Icons.Search />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black">Keyword Domain Finder</h3>
              <p className={`text-[11px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                Generate 1,000+ domain name ideas from your keywords
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <Input
          label="Primary Keyword"
          value={primaryKeyword}
          onChange={(e) => setPrimaryKeyword(e.target.value)}
          placeholder="e.g., startup, coffee, travel..."
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Input
          label="Secondary Keywords (comma separated)"
          value={secondaryKeyword}
          onChange={(e) => setSecondaryKeyword(e.target.value)}
          placeholder="e.g., hub, pro, digital..."
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      {/* TLD Selection */}
      <div className="mb-3">
        <label className={`block text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-white/40'} mb-2`}>
          Extensions
        </label>
        <div className="flex flex-wrap gap-1 sm:gap-1.5">
          {availableTlds.map((tld) => (
            <button
              key={tld}
              onClick={() => toggleTld(tld)}
              className={`px-2 py-1 text-[11px] sm:text-xs font-mono font-semibold rounded-lg border transition-colors ${
                selectedTlds.includes(tld)
                  ? isLight ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-black border-white'
                  : isLight ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300' : 'bg-white/[0.03] text-white/60 border-white/10 hover:border-white/20'
              }`}
            >
              {tld}
            </button>
          ))}
        </div>
      </div>

      {/* Options + Search */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeHyphens}
            onChange={(e) => setIncludeHyphens(e.target.checked)}
            className="w-3.5 h-3.5 rounded"
          />
          <span className={`text-[11px] sm:text-xs ${isLight ? 'text-slate-600' : 'text-white/60'}`}>Include hyphens</span>
        </label>
        <Button onClick={handleSearch} isLoading={isGenerating} size="sm" className="px-4 sm:px-6">
          Find Domains
        </Button>
      </div>

      {/* Results */}
      {generated.length > 0 && (
        <div className="animate-fade-in">
          {/* Stats bar */}
          <div className={`flex items-center justify-between gap-2 py-2 px-2 rounded-lg mb-2 ${isLight ? 'bg-slate-50' : 'bg-white/[0.03]'}`}>
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs flex-wrap">
              <span className={isLight ? 'text-slate-700 font-bold' : 'text-white/80 font-bold'}>{generated.length.toLocaleString()} names</span>
              {availableCount > 0 && <span className="text-emerald-500 font-semibold">{availableCount} available</span>}
              {takenCount > 0 && <span className={isLight ? 'text-slate-400' : 'text-white/30'}>{takenCount} taken</span>}
              {isChecking && <span className={`${isLight ? 'text-blue-500' : 'text-blue-400'} animate-pulse`}>checking...</span>}
            </div>
            <div className="flex items-center gap-1">
              {isChecking && (
                <button onClick={handleStop} className={`px-2 py-0.5 text-[10px] font-semibold rounded border transition-colors ${isLight ? 'border-slate-200 text-slate-500 hover:bg-slate-100' : 'border-white/10 text-white/50 hover:bg-white/5'}`}>
                  Stop
                </button>
              )}
            </div>
          </div>

          {/* Sort & Filter controls */}
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1">
              {(['popularity', 'length', 'alpha'] as SortMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  className={`px-2 py-1 text-[10px] sm:text-[11px] font-semibold rounded-md transition-colors ${
                    sortMode === mode
                      ? isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
                      : isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-white/40 hover:bg-white/5'
                  }`}
                >
                  {mode === 'popularity' ? 'Popular' : mode === 'length' ? 'Short' : 'A-Z'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {(['all', 'starts', 'ends'] as FilterMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-2 py-1 text-[10px] sm:text-[11px] font-semibold rounded-md transition-colors ${
                    filterMode === mode
                      ? isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
                      : isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-white/40 hover:bg-white/5'
                  }`}
                >
                  {mode === 'all' ? 'All' : mode === 'starts' ? 'Starts with' : 'Ends with'}
                </button>
              ))}
            </div>
          </div>

          {/* Availability filter */}
          <div className="flex items-center gap-1 mb-3">
            {(['all', 'available', 'taken'] as AvailFilter[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setAvailFilter(mode)}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] sm:text-[11px] font-semibold rounded-md transition-colors ${
                  availFilter === mode
                    ? isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
                    : isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-white/40 hover:bg-white/5'
                }`}
              >
                {mode === 'available' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                {mode === 'taken' && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                {mode === 'all' ? `All (${filtered.length})` : mode === 'available' ? `Available (${availableCount})` : `Taken (${takenCount})`}
              </button>
            ))}
          </div>

          {/* Domain grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3">
            {visible.map((item) => (
              <DomainItem
                key={item.domain}
                item={item}
                isLight={isLight}
                onSelect={onSelect}
              />
            ))}
          </div>

          {/* Load more */}
          {visibleCount < filtered.length && (
            <div className="text-center mt-3">
              <button
                onClick={() => setVisibleCount((prev) => prev + 200)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  isLight ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-white/10 text-white/60 hover:bg-white/5'
                }`}
              >
                Show more ({Math.min(200, filtered.length - visibleCount)} of {(filtered.length - visibleCount).toLocaleString()} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {generated.length === 0 && !isGenerating && (
        <div className={`text-center py-6 sm:py-10 rounded-xl ${isLight ? 'bg-slate-50' : 'bg-white/[0.02]'}`}>
          <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
            Enter a keyword and click &quot;Find Domains&quot; to generate 1,000+ name ideas
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Individual domain row ── */
function DomainItem({ item, isLight, onSelect }: { item: GeneratedDomain; isLight: boolean; onSelect?: (domain: string) => void }) {
  const isAvailable = item.available === true;
  const isTaken = item.available === false;
  const isUnchecked = item.available === null;

  return (
    <div
      className={`flex items-center justify-between gap-1.5 py-[5px] px-1.5 rounded transition-colors cursor-pointer ${
        isAvailable
          ? isLight ? 'hover:bg-emerald-50' : 'hover:bg-emerald-500/5'
          : isLight ? 'hover:bg-slate-50' : 'hover:bg-white/[0.03]'
      }`}
      onClick={() => onSelect?.(item.domain)}
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          isUnchecked ? (isLight ? 'bg-slate-300' : 'bg-white/20') :
          isAvailable ? 'bg-emerald-500' : 'bg-red-400'
        }`} />
        <span className={`text-[11px] sm:text-[13px] font-mono break-all line-clamp-1 ${
          isAvailable
            ? isLight ? 'text-slate-900 font-semibold' : 'text-white font-semibold'
            : isTaken
              ? isLight ? 'text-slate-400' : 'text-white/30'
              : isLight ? 'text-slate-600' : 'text-white/60'
        }`}>
          {item.domain}
        </span>
      </div>
      {isAvailable && (
        <a
          href={`https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(item.domain)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
        >
          Register
        </a>
      )}
    </div>
  );
}
