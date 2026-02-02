'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { AvailabilityIndicator } from '@/components/ui/AvailabilityIndicator';

interface KeywordDomain {
  domain: string;
  available: boolean;
  keywords: string[];
  relevance: number;
  searchVolume?: string;
}

interface KeywordDomainFinderProps {
  onSelect?: (domain: string) => void;
}

export function KeywordDomainFinder({ onSelect }: KeywordDomainFinderProps) {
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [includeHyphens, setIncludeHyphens] = useState(false);
  const [tlds, setTlds] = useState<string[]>(['.com']);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<KeywordDomain[]>([]);

  const availableTlds = ['.com', '.net', '.org', '.io', '.co', '.ai', '.app', '.dev'];

  const toggleTld = (tld: string) => {
    setTlds((prev) =>
      prev.includes(tld) ? prev.filter((t) => t !== tld) : [...prev, tld]
    );
  };

  const handleSearch = async () => {
    if (!primaryKeyword.trim()) return;

    setIsSearching(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const primary = primaryKeyword.toLowerCase().replace(/\s+/g, '');
    const secondary = secondaryKeywords
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0);

    const combinations: KeywordDomain[] = [];

    // Primary keyword only
    tlds.forEach((tld) => {
      combinations.push({
        domain: `${primary}${tld}`,
        available: Math.random() > 0.6,
        keywords: [primaryKeyword],
        relevance: 100,
        searchVolume: '10K-50K',
      });
    });

    // Primary + secondary combinations
    secondary.forEach((sec) => {
      tlds.slice(0, 2).forEach((tld) => {
        combinations.push({
          domain: `${primary}${sec}${tld}`,
          available: Math.random() > 0.4,
          keywords: [primaryKeyword, sec],
          relevance: 90,
          searchVolume: '5K-20K',
        });

        if (includeHyphens) {
          combinations.push({
            domain: `${primary}-${sec}${tld}`,
            available: Math.random() > 0.3,
            keywords: [primaryKeyword, sec],
            relevance: 85,
            searchVolume: '2K-10K',
          });
        }
      });
    });

    // Prefixes
    const prefixes = ['get', 'my', 'the', 'best', 'top'];
    prefixes.slice(0, 2).forEach((prefix) => {
      combinations.push({
        domain: `${prefix}${primary}.com`,
        available: Math.random() > 0.3,
        keywords: [prefix, primaryKeyword],
        relevance: 80,
        searchVolume: '1K-5K',
      });
    });

    // Suffixes
    const suffixes = ['hub', 'pro', 'app', 'hq', 'now'];
    suffixes.slice(0, 2).forEach((suffix) => {
      combinations.push({
        domain: `${primary}${suffix}.com`,
        available: Math.random() > 0.3,
        keywords: [primaryKeyword, suffix],
        relevance: 82,
        searchVolume: '1K-5K',
      });
    });

    setResults(combinations.slice(0, 15));
    setIsSearching(false);
  };

  return (
    <div className="glass-card p-6 border-white/10">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <Icons.Search />
          </div>
          <h3 className="text-lg font-bold">Keyword-Based Domain Finder</h3>
        </div>
        <p className="text-sm text-white/40">
          Discover SEO-optimized domains based on your target keywords
        </p>
      </div>

      {/* Primary Keyword */}
      <div className="mb-4">
        <Input
          label="Primary Keyword"
          value={primaryKeyword}
          onChange={(e) => setPrimaryKeyword(e.target.value)}
          placeholder="e.g., founders, startups, ventures..."
        />
      </div>

      {/* Secondary Keywords */}
      <div className="mb-4">
        <Input
          label="Secondary Keywords (comma separated)"
          value={secondaryKeywords}
          onChange={(e) => setSecondaryKeywords(e.target.value)}
          placeholder="e.g., prime, blog, hub..."
        />
      </div>

      {/* TLD Selection */}
      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-3">
          Domain Extensions
        </label>
        <div className="flex flex-wrap gap-2">
          {availableTlds.map((tld) => (
            <Button
              key={tld}
              onClick={() => toggleTld(tld)}
              variant={tlds.includes(tld) ? 'primary' : 'secondary'}
              size="sm"
              className="font-mono"
            >
              {tld}
            </Button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeHyphens}
            onChange={(e) => setIncludeHyphens(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/20"
          />
          <span className="text-sm text-white/60">Include hyphenated domains</span>
        </label>
      </div>

      {/* Search Button */}
      <Button onClick={handleSearch} isLoading={isSearching} className="w-full mb-6">
        Find Keyword Domains
      </Button>

      {/* Results */}
      {isSearching && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-white/40">
            <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
            <span className="text-sm">Searching keyword combinations...</span>
          </div>
        </div>
      )}

      {results.length > 0 && !isSearching && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-white/40">
              {results.length} domains found
            </span>
            <span className="text-xs text-white/30">Sorted by relevance</span>
          </div>

          {results.map((result, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all group"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <AvailabilityIndicator 
                      status={result.available ? 'available' : 'unavailable'}
                      size="sm"
                    />
                    <span className="font-mono font-bold">{result.domain}</span>
                    <Badge 
                      variant={result.available ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {result.available ? 'Available' : 'Taken'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/40 mb-2">
                    <span>Relevance: {result.relevance}%</span>
                    {result.searchVolume && (
                      <>
                        <span>•</span>
                        <span>Search Vol: {result.searchVolume}</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {result.keywords.map((kw, j) => (
                      <Badge
                        key={j}
                        variant="neutral"
                        size="sm"
                      >
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant={result.available ? 'primary' : 'secondary'}
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onSelect?.(result.domain)}
                >
                  {result.available ? 'Register' : 'Details'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
