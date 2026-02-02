'use client';

import React, { useState, useMemo } from 'react';
import { DomainResultCard, DomainResultCardProps } from './DomainResultCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface DomainResult {
  domain: string;
  availability: 'available' | 'unavailable' | 'loading' | 'unknown';
  pricing?: {
    amount: number;
    currency: string;
    registrar: string;
  };
  premium?: boolean;
  tld?: string;
}

interface ResultsListProps {
  results: DomainResult[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  sortBy?: 'relevance' | 'price' | 'alphabetical';
  filterBy?: 'available' | 'all';
  emptyStateMessage?: string;
  onDomainBuy?: (domain: string) => void;
  onDomainWhois?: (domain: string) => void;
  onDomainSave?: (domain: string) => void;
  savedDomains?: string[];
}

type SortOption = 'relevance' | 'price' | 'alphabetical';
type FilterOption = 'all' | 'available' | 'unavailable';

export function ResultsList({
  results,
  isLoading = false,
  onLoadMore,
  sortBy: initialSortBy = 'relevance',
  filterBy: initialFilterBy = 'all',
  emptyStateMessage = 'No domains found. Try a different search.',
  onDomainBuy,
  onDomainWhois,
  onDomainSave,
  savedDomains = [],
}: ResultsListProps) {
  const [sortBy, setSortBy] = useState<SortOption>(initialSortBy);
  const [filterBy, setFilterBy] = useState<FilterOption>(initialFilterBy);

  // Filter results
  const filteredResults = useMemo(() => {
    let filtered = [...results];

    if (filterBy === 'available') {
      filtered = filtered.filter((r) => r.availability === 'available');
    } else if (filterBy === 'unavailable') {
      filtered = filtered.filter((r) => r.availability === 'unavailable');
    }

    return filtered;
  }, [results, filterBy]);

  // Sort results
  const sortedResults = useMemo(() => {
    const sorted = [...filteredResults];

    switch (sortBy) {
      case 'alphabetical':
        sorted.sort((a, b) => a.domain.localeCompare(b.domain));
        break;
      case 'price':
        sorted.sort((a, b) => {
          const priceA = a.pricing?.amount ?? Infinity;
          const priceB = b.pricing?.amount ?? Infinity;
          return priceA - priceB;
        });
        break;
      case 'relevance':
      default:
        // Keep original order (relevance)
        break;
    }

    return sorted;
  }, [filteredResults, sortBy]);

  // Count statistics
  const stats = useMemo(() => {
    const available = results.filter((r) => r.availability === 'available').length;
    const unavailable = results.filter((r) => r.availability === 'unavailable').length;
    const loading = results.filter((r) => r.availability === 'loading').length;
    
    return { available, unavailable, loading, total: results.length };
  }, [results]);

  // Empty state
  if (!isLoading && results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
          <svg
            className="w-8 h-8 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white/80 mb-2">
          No Results Found
        </h3>
        <p className="text-sm text-white/50 max-w-md mx-auto">
          {emptyStateMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters and stats */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/10 pb-4 -mx-6 px-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-white/50">
              {sortedResults.length} {sortedResults.length === 1 ? 'domain' : 'domains'}
            </span>
            {stats.available > 0 && (
              <>
                <span className="text-white/30">•</span>
                <span className="text-emerald-400 font-medium">
                  {stats.available} available
                </span>
              </>
            )}
            {stats.unavailable > 0 && (
              <>
                <span className="text-white/30">•</span>
                <span className="text-white/40">
                  {stats.unavailable} taken
                </span>
              </>
            )}
          </div>

          {/* Filters and Sort */}
          <div className="flex items-center gap-2">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setFilterBy('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  filterBy === 'all'
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterBy('available')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  filterBy === 'available'
                    ? 'bg-emerald-500 text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => setFilterBy('unavailable')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  filterBy === 'unavailable'
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Taken
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 text-xs font-medium bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="alphabetical">Sort: A-Z</option>
              <option value="price">Sort: Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && results.length === 0 && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-white/[0.02] border border-white/10 rounded-xl animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      )}

      {/* Results Grid */}
      {sortedResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedResults.map((result, index) => (
            <div
              key={result.domain}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <DomainResultCard
                domain={result.domain}
                availability={result.availability}
                pricing={result.pricing}
                premium={result.premium}
                onBuyClick={() => onDomainBuy?.(result.domain)}
                onWhoisClick={() => onDomainWhois?.(result.domain)}
                onSaveClick={() => onDomainSave?.(result.domain)}
                isSaved={savedDomains.includes(result.domain)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {onLoadMore && sortedResults.length > 0 && (
        <div className="text-center pt-4">
          <Button
            onClick={onLoadMore}
            variant="secondary"
            isLoading={isLoading}
          >
            Load More Results
          </Button>
        </div>
      )}

      {/* Loading More Indicator */}
      {isLoading && results.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-white/40">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-sm">Loading more results...</span>
          </div>
        </div>
      )}
    </div>
  );
}
