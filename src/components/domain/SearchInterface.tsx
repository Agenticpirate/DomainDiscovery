'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';

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
  console.log('🚀 SearchInterface Enhanced Component Loaded');
  
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
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

  // Save search to recent searches
  const saveToRecentSearches = useCallback((searchQuery: string) => {
    if (!showRecentSearches || !searchQuery.trim()) return;

    try {
      const newSearch: RecentSearch = {
        query: searchQuery.trim(),
        timestamp: Date.now(),
      };

      // Remove duplicates and add new search at the beginning
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

  // Debounced search handler
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

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    onClear();
    setShowRecent(false);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };

  // Handle recent search click
  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery);
    setShowRecent(false);
    onSearch(searchQuery);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Escape to clear
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => setShowRecent(true && recentSearches.length > 0)}
          onBlur={() => setTimeout(() => setShowRecent(false), 200)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pr-24"
          leftIcon={<Icons.Search />}
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-14 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white/80 transition-colors"
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

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Keyboard shortcut hint */}
        {!query && !isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-white/30">
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px]">
              {typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px]">
              K
            </kbd>
          </div>
        )}
      </div>

      {/* Recent searches dropdown */}
      {showRecent && showRecentSearches && recentSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="p-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/40 px-3 py-2">
              Recent Searches
            </div>
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleRecentSearchClick(search.query)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5 rounded-lg transition-colors"
              >
                <div className="w-4 h-4 text-white/40">
                  <Icons.Search />
                </div>
                <span className="flex-1">{search.query}</span>
                <svg
                  className="w-4 h-4 text-white/20"
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
