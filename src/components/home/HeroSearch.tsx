'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';

interface HeroSearchProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  popularSearches?: string[];
  /** When true, search bar blends into parent panel (no double border) */
  embedded?: boolean;
  /**
   * Pause after typing before auto-routing to /search.
   * Long enough to finish a full domain name (~3–4s).
   * Enter / Search still navigates immediately.
   */
  debounceMs?: number;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  initialQuery = '',
  onSearch,
  popularSearches = ['nova', 'pulse', 'studio', 'launch'],
  embedded = false,
  debounceMs = 3500,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [aiMode, setAiMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRoutedRef = useRef('');
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  /** Auto-route only after the user stops typing for debounceMs (domain mode only) */
  const scheduleLiveRoute = useCallback(
    (raw: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      // Don't schedule empty queries (user clearing the field)
      if (!raw.trim()) {
        lastRoutedRef.current = '';
        return;
      }

      debounceRef.current = setTimeout(() => {
        const q = raw.trim();
        if (aiMode) return;
        if (!q) return;
        if (q === lastRoutedRef.current) return;
        lastRoutedRef.current = q;
        onSearch(q);
      }, debounceMs);
    },
    [aiMode, debounceMs, onSearch]
  );

  const submit = (value?: string) => {
    const q = (value ?? query).trim();
    if (!q) {
      inputRef.current?.focus();
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    lastRoutedRef.current = q;
    if (aiMode) {
      router.push(`/generator?q=${encodeURIComponent(q)}`);
      return;
    }
    onSearch(q);
  };

  const handleChange = (value: string) => {
    setQuery(value);
    if (!aiMode) {
      scheduleLiveRoute(value);
    }
  };

  // Fewer chips on mobile for a cleaner row
  const chips = popularSearches.slice(0, 4);

  const fieldShell = embedded
    ? isLight
      ? 'bg-slate-50 border border-slate-200 focus-within:border-slate-300'
      : 'bg-black/30 border border-white/10 focus-within:border-white/25'
    : isLight
      ? 'bg-white border border-slate-200 shadow-sm focus-within:border-slate-300 focus-within:shadow-md'
      : 'bg-white/[0.04] border border-white/10 backdrop-blur-xl focus-within:border-white/20';

  const aiBtnClass = `inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[12px] sm:text-[12px] font-bold transition-all ${
    aiMode
      ? isLight
        ? 'bg-slate-900 text-white'
        : 'bg-white text-black'
      : isLight
        ? 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
        : 'bg-white/[0.06] text-white/65 border border-white/10 hover:bg-white/10'
  }`;

  const searchBtnClass =
    'btn-brand inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] sm:text-[13px] font-bold';

  const aiIcon = (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );

  const searchArrow = (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );

  return (
    <div className="w-full max-w-full sm:max-w-[46rem] mx-auto">
      {/* —— Mobile: taller field, bigger CTAs (desktop layout untouched below) —— */}
      <div className="sm:hidden w-full space-y-2.5">
        <div
          className={`flex items-center gap-1.5 rounded-2xl px-2 py-1 min-h-[3.25rem] transition-all ${fieldShell}`}
        >
          <div
            className={`ml-1 shrink-0 flex items-center justify-center w-9 h-9 ${
              isLight ? 'text-slate-400' : 'text-white/40'
            }`}
          >
            <Icons.Search />
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={aiMode ? 'Describe a brand idea…' : 'Search domain names...'}
            autoFocus
            enterKeyHint={aiMode ? 'go' : 'search'}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={`flex-1 min-w-0 bg-transparent border-none outline-none text-[16px] font-medium py-3 pr-2 ${
              isLight
                ? 'text-slate-900 placeholder:text-slate-400'
                : 'text-white placeholder:text-white/38'
            }`}
            aria-label="Search domain names"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                lastRoutedRef.current = '';
                if (debounceRef.current) clearTimeout(debounceRef.current);
                inputRef.current?.focus();
              }}
              className={`mr-1 shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${
                isLight ? 'text-slate-400 active:bg-slate-200' : 'text-white/45 active:bg-white/10'
              }`}
              aria-label="Clear search"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.75fr)] gap-2">
          <button
            type="button"
            onClick={() => setAiMode((v) => !v)}
            className={`${aiBtnClass} w-full min-h-[3rem] rounded-2xl text-[13px] ${
              aiMode ? 'ring-2 ring-white/20' : ''
            }`}
            title="Toggle AI generator mode"
            aria-pressed={aiMode}
          >
            {aiIcon}
            <span>AI</span>
          </button>
          <button
            type="button"
            onClick={() => submit()}
            className={`${searchBtnClass} w-full min-h-[3rem] rounded-2xl text-[14px] shadow-sm`}
          >
            <span>{aiMode ? 'Generate' : 'Search'}</span>
            {searchArrow}
          </button>
        </div>

        {aiMode ? (
          <p
            className={`text-center text-[11px] font-medium leading-snug ${
              isLight ? 'text-slate-500' : 'text-white/45'
            }`}
          >
            AI mode — describe a brand, get name ideas
          </p>
        ) : null}
      </div>

      {/* —— Desktop / tablet: field + AI + Search on one row —— */}
      <div
        className={`hidden sm:flex items-center gap-2 rounded-2xl p-1.5 transition-all ${fieldShell}`}
      >
        <div
          className={`ml-2 shrink-0 flex items-center justify-center w-8 h-8 ${
            isLight ? 'text-slate-400' : 'text-white/35'
          }`}
        >
          <Icons.Search />
        </div>

        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={aiMode ? 'Describe a brand idea…' : 'Search domain names...'}
          className={`flex-1 min-w-0 bg-transparent border-none outline-none text-[15px] font-medium py-2.5 pr-1 ${
            isLight
              ? 'text-slate-900 placeholder:text-slate-400'
              : 'text-white placeholder:text-white/35'
          }`}
          aria-label="Search domain names"
        />

        <button
          type="button"
          onClick={() => setAiMode((v) => !v)}
          className={`${aiBtnClass} shrink-0 px-2.5 py-2`}
          title="Toggle AI generator mode"
          aria-pressed={aiMode}
        >
          {aiIcon}
          <span>AI</span>
        </button>

        <button
          type="button"
          onClick={() => submit()}
          className={`${searchBtnClass} shrink-0 px-5 py-2.5`}
        >
          <span>{aiMode ? 'Generate' : 'Search'}</span>
          {searchArrow}
        </button>
      </div>

      <div className="mt-2.5 sm:mt-2.5 flex flex-nowrap sm:flex-wrap items-center justify-center gap-1.5 sm:gap-1.5 overflow-x-auto scrollbar-none px-0.5">
        <span
          className={`shrink-0 text-[11px] sm:text-[11px] font-medium ${
            isLight ? 'text-slate-500' : 'text-white/40'
          }`}
        >
          Try:
        </span>
        {chips.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => {
              setQuery(term);
              if (debounceRef.current) clearTimeout(debounceRef.current);
              lastRoutedRef.current = term;
              onSearch(term);
            }}
            className={`shrink-0 rounded-full px-2.5 sm:px-2.5 py-1.5 sm:py-1 text-[11px] sm:text-[11px] font-semibold transition-all active:scale-[0.97] ${
              isLight
                ? 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                : 'bg-white/[0.05] border border-white/12 text-white/65 hover:border-white/22 hover:text-white/85'
            }`}
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
};
