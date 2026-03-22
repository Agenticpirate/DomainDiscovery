'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';

interface SearchInterfaceProps {
  initialQuery?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear: () => void;
  autoFocus?: boolean;
  showRecentSearches?: boolean;
  debounceMs?: number;
  isLoading?: boolean;
}

interface RecentSearch {
  query: string;
  timestamp: number;
}

const RECENT_SEARCHES_KEY = 'domain_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export function SearchInterface({
  initialQuery = '',
  placeholder = 'Search for your perfect domain...',
  onSearch,
  onClear,
  autoFocus = false,
  showRecentSearches = true,
  debounceMs = 150,
  isLoading = false,
}: SearchInterfaceProps) {
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const showRecentPanel = showRecent && showRecentSearches && recentSearches.length > 0;

  useEffect(() => {
    if (showRecentSearches && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as RecentSearch[];
          setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
        }
      } catch (error) {
        console.error('Failed to load recent searches:', error);
      }
    }
  }, [showRecentSearches]);

  const saveToRecentSearches = useCallback((searchQuery: string) => {
    if (!showRecentSearches || !searchQuery.trim()) return;

    try {
      const newSearch: RecentSearch = {
        query: searchQuery.trim(),
        timestamp: Date.now(),
      };

      const updated = [
        newSearch,
        ...recentSearches.filter((s) => s.query !== newSearch.query),
      ].slice(0, MAX_RECENT_SEARCHES);

      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  }, [recentSearches, showRecentSearches]);

  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (searchQuery.trim()) {
          onSearch(searchQuery.trim());
          saveToRecentSearches(searchQuery.trim());
        }
      }, debounceMs);
    },
    [onSearch, saveToRecentSearches, debounceMs]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
  };

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleClear = () => {
    setQuery('');
    onClear();
    setShowRecent(false);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };

  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery);
    setShowRecent(false);
    onSearch(searchQuery);
    saveToRecentSearches(searchQuery);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }

      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative w-full ${showRecentPanel ? 'pb-[12.5rem] sm:pb-[13rem]' : ''}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              e.preventDefault();
              if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
              onSearch(query.trim());
              saveToRecentSearches(query.trim());
              setShowRecent(false);
            }
          }}
          onFocus={() => setShowRecent(true && recentSearches.length > 0)}
          onBlur={() => setTimeout(() => setShowRecent(false), 200)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pr-14 sm:pr-20"
          leftIcon={<Icons.Search />}
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute right-8 sm:right-11 top-1/2 -translate-y-1/2 p-1 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Clear search"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {isLoading && (
          <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{
              borderColor: 'var(--input-border)',
              borderTopColor: 'var(--text-primary)'
            }} />
          </div>
        )}

        {!query && !isLoading && (
          <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-xs" style={{ color: 'var(--kbd-text)' }}>
            <kbd className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--kbd-bg)', border: '1px solid var(--kbd-border)' }} suppressHydrationWarning>
              {typeof window !== 'undefined' && navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--kbd-bg)', border: '1px solid var(--kbd-border)' }}>
              K
            </kbd>
          </div>
        )}
      </div>

      {showRecentPanel && (
        <div className={`absolute top-full left-0 right-0 mt-1.5 rounded-xl z-50 overflow-hidden animate-fade-in ${
          isLight
            ? 'bg-white border border-slate-200 shadow-lg shadow-slate-900/[0.06]'
            : 'bg-neutral-900 border border-white/10 shadow-xl'
        }`}>
          <div className="max-h-[11rem] overflow-y-auto p-1.5 sm:max-h-[11.5rem]">
            <div className="flex items-center justify-between px-2.5 py-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Recent Searches
              </div>
              {recentSearches.length > 0 && (
                <button
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem(RECENT_SEARCHES_KEY);
                    setShowRecent(false);
                  }}
                  className={`text-[11px] transition-colors ${isLight ? 'text-slate-400 hover:text-red-500' : 'text-white/40 hover:text-red-400'}`}
                >
                  Clear
                </button>
              )}
            </div>
            {recentSearches.map((search, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-1.5 py-0.5 rounded-lg transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'}`}
              >
                <button
                  onClick={() => handleRecentSearchClick(search.query)}
                  className="w-full flex items-center gap-2.5 px-1 py-1 text-left text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <div className="w-4 h-4" style={{ color: 'var(--text-muted)' }}>
                    <Icons.Search />
                  </div>
                  <span className="flex-1 truncate">{search.query}</span>
                  <svg
                    className="w-4 h-4"
                    style={{ color: 'var(--text-muted)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const updated = recentSearches.filter((item) => item.query !== search.query);
                    setRecentSearches(updated);
                    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
                  }}
                  className={`p-1.5 rounded-md transition-colors ${isLight ? 'text-slate-300 hover:text-red-500 hover:bg-red-50' : 'text-white/20 hover:text-red-400 hover:bg-red-500/10'}`}
                  aria-label={`Remove ${search.query}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
