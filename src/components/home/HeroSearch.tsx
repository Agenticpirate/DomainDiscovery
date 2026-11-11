'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocale, useT } from '@/components/i18n/LocaleProvider';

interface HeroSearchProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
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
  embedded = false,
  debounceMs = 3500,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [aiMode, setAiMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRoutedRef = useRef('');
  const router = useRouter();
  const { messages, href, locale } = useLocale();
  const t = useT();
  const hero = messages.hero;
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
      router.push(href(`/generator?q=${encodeURIComponent(q)}`));
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

  const fieldShell = embedded
    ? isLight
      ? 'min-h-[3.75rem] bg-white border border-[#e6e8e8] shadow-[0_1px_1px_rgba(0,0,0,0.03),0_12px_32px_-16px_rgba(0,0,0,0.12)] focus-within:border-[#0a0a0a] focus-within:shadow-[0_0_0_4px_rgba(20,21,23,0.06),0_12px_32px_-16px_rgba(0,0,0,0.12)] transition-[border-color,box-shadow] duration-300'
      : 'min-h-[3.75rem] bg-[#0a0a0a] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_60px_-30px_rgba(0,0,0,1)] hover:border-white/[0.16] focus-within:border-white/30 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_0_4px_rgba(255,255,255,0.05),0_24px_60px_-30px_rgba(0,0,0,1)] transition-[border-color,box-shadow] duration-300'
    : isLight
      ? 'bg-white border border-[#c8c8c8] shadow-[0_1px_2px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.05)] focus-within:border-[#171717] focus-within:shadow-[0_0_0_3px_rgba(0,112,243,0.14),0_12px_40px_rgba(0,0,0,0.08)] transition-[border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
      : 'bg-[#0a0a0a] border border-white/10 backdrop-blur-2xl focus-within:border-white/28 focus-within:shadow-[0_0_0_3px_rgba(0,112,243,0.18),0_20px_50px_-20px_rgba(0,0,0,0.7)] transition-[border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]';

  const aiBtnClass = `inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold tracking-tight transition-colors duration-200 active:scale-[0.97] ${
    aiMode
      ? isLight
        ? 'bg-[#171717] text-white'
        : 'bg-white text-black'
      : embedded
        ? isLight
          ? 'text-[#6e7679] hover:text-[#0a0a0a]'
          : 'text-[#8b9194] hover:text-[#f0f0f0]'
        : isLight
          ? 'bg-ds-soft text-ds-body border border-[#c8c8c8] hover:border-[#9a9a9a] hover:bg-[#f0f0f0] hover:text-ds-ink'
          : 'bg-white/[0.06] text-white/65 border border-white/10 hover:bg-white/10 hover:text-white'
  }`;

  const searchBtnClass =
    'btn-brand inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] sm:text-[13px] font-semibold tracking-tight';

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
      {/* —— Mobile only (desktop layout untouched below) —— */}
      <div className="sm:hidden w-full">
        <div
          className={`flex items-center gap-1 rounded-2xl pl-3 pr-1.5 min-h-[3.25rem] border transition-colors ${
            isLight
              ? 'bg-white border-[#d7dbdc] focus-within:border-[#0a0a0a]'
              : 'bg-[#0a0a0a] border-white/[0.1] focus-within:border-white/25'
          }`}
        >
          <div
            className={`shrink-0 flex items-center justify-center ${
              isLight ? 'text-[#6e7679]' : 'text-[#878d8f]'
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
            placeholder={aiMode ? hero.placeholderAi : hero.placeholder}
            enterKeyHint={aiMode ? 'go' : 'search'}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            className={`flex-1 min-w-0 bg-transparent border-none outline-none text-[15px] font-medium py-2.5 pr-1 ${
              isLight
                ? 'text-[#0a0a0a] placeholder:text-[#6e7679]'
                : 'text-[#f0f0f0] placeholder:text-[#878d8f]'
            }`}
            aria-label={hero.aria}
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
              className={`shrink-0 flex h-11 w-11 items-center justify-center rounded-xl ${
                isLight ? 'text-[#52595b] active:bg-[#f4f5f5]' : 'text-[#a1a4a5] active:bg-white/10'
              }`}
              aria-label={t('Clear search')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setAiMode((v) => !v)}
            className={`${aiBtnClass} shrink-0 px-2.5 py-2 min-h-[44px]`}
            title={t('Toggle AI generator mode')}
            aria-pressed={aiMode}
          >
            {aiIcon}
            <span>AI</span>
          </button>
          <button
            type="button"
            onClick={() => submit()}
            className={`${searchBtnClass} shrink-0 rounded-full px-3 min-[400px]:px-3.5 py-2 text-[12px] min-h-[44px]`}
          >
            <span>
              {aiMode ? (
                hero.generate
              ) : (
                locale === 'en' ? (
                  <>
                    <span>Search</span>
                    <span className="hidden min-[420px]:inline"> domains</span>
                  </>
                ) : (
                  hero.search
                )
              )}
            </span>
            {searchArrow}
          </button>
        </div>
      </div>

      {/* —— Desktop / tablet: field + AI + Search on one row —— */}
      <div
        className={`hidden sm:flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-1.5 transition-all ${fieldShell}`}
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
          placeholder={aiMode ? hero.placeholderAi : hero.placeholderDots}
          className={`flex-1 min-w-0 bg-transparent border-none outline-none text-[16px] font-medium py-2.5 pr-1 ${
            isLight
              ? 'text-slate-900 placeholder:text-slate-400'
              : 'text-white placeholder:text-white/35'
          }`}
          aria-label={hero.aria}
        />

        <button
          type="button"
          onClick={() => setAiMode((v) => !v)}
          className={`${aiBtnClass} shrink-0 px-2.5 py-2`}
          title={t('Toggle AI generator mode')}
          aria-pressed={aiMode}
        >
          {aiIcon}
          <span>AI</span>
        </button>

        <button
          type="button"
          onClick={() => submit()}
          className={`${searchBtnClass} shrink-0 rounded-full px-5 py-3 transition-transform duration-200 hover:-translate-y-px active:translate-y-0`}
        >
          <span>{aiMode ? hero.generate : hero.search}</span>
          {searchArrow}
        </button>
      </div>
    </div>
  );
};
