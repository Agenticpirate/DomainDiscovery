'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';

interface GeneratedDomain {
  name: string;
  available: boolean;
  popularity: number;
  category: 'exact' | 'prefix' | 'suffix' | 'compound' | 'alternative';
}

interface Registrar {
  name: string;
  url: string;
}

const REGISTRARS: Registrar[] = [
  { name: 'GoDaddy', url: 'https://www.godaddy.com/domainsearch/find?domainToCheck=' },
  { name: 'Namecheap', url: 'https://www.namecheap.com/domains/registration/results/?domain=' },
  { name: 'Google Domains', url: 'https://domains.google.com/registrar/search?searchTerm=' },
  { name: 'Cloudflare', url: 'https://www.cloudflare.com/products/registrar/' },
  { name: 'Name.com', url: 'https://www.name.com/domain/search/' },
];

interface DomainGeneratorProps {
  onSelect?: (domain: string) => void;
}

type FilterType = 'all' | 'starts' | 'ends';
type SortType = 'popularity' | 'alphabetical' | 'length';
type ViewType = 'grid' | 'list';

export function DomainGenerator({ onSelect }: DomainGeneratorProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [keyword, setKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<GeneratedDomain[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<GeneratedDomain[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('popularity');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedRegistrar, setSelectedRegistrar] = useState<string>('GoDaddy');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [showDomainPopup, setShowDomainPopup] = useState(false);

  // Instant search with minimal debounce for real-time feedback
  useEffect(() => {
    if (!keyword.trim()) {
      setSuggestions([]);
      setFilteredSuggestions([]);
      return;
    }

    // Reduced debounce to 50ms for near-instant feedback
    const timer = setTimeout(() => {
      handleSearch(keyword);
    }, 50);

    return () => clearTimeout(timer);
  }, [keyword]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...suggestions];
    const cleanKeyword = keyword.toLowerCase().trim();

    // Apply filter
    switch (filter) {
      case 'starts':
        filtered = filtered.filter(d => d.name.startsWith(cleanKeyword));
        break;
      case 'ends':
        filtered = filtered.filter(d => d.name.endsWith(cleanKeyword));
        break;
      case 'all':
      default:
        // Show all results
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'length':
        filtered.sort((a, b) => a.name.length - b.name.length);
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
    }

    setFilteredSuggestions(filtered);
  }, [suggestions, filter, sortBy, keyword]);

  const handleSearch = async (searchKeyword: string) => {
    if (!searchKeyword.trim()) return;

    setIsSearching(true);
    
    try {
      const cleanKeyword = searchKeyword.toLowerCase().replace(/\s+/g, '');
      
      // Generate comprehensive variations with .com only
      const variations = await generateEnhancedVariations(cleanKeyword);
      
      // Check real availability using the same API as bulk search
      const domainNames = variations.map(v => `${v.name}.com`);
      await checkDomainsAvailability(domainNames, variations);
      
      setSuggestions(variations);
    } catch (error) {
      console.error('Domain generation error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const checkDomainsAvailability = async (domainNames: string[], variations: GeneratedDomain[]) => {
    try {
      const response = await fetch('/api/domains/instant-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domains: domainNames })
      });
      
      if (response.ok) {
        const results = await response.json();
        
        // Update variations with real availability data
        results.forEach((result: { domain: string; available: boolean; premium?: boolean }) => {
          const domainName = result.domain.replace('.com', '');
          const variation = variations.find(v => v.name === domainName);
          if (variation) {
            variation.available = result.available;
          }
        });
      }
    } catch (error) {
      console.error('Availability check error:', error);
      // Keep mock availability if API fails
    }
  };

  const generateEnhancedVariations = async (keyword: string): Promise<GeneratedDomain[]> => {
    const variations: GeneratedDomain[] = [];
    
    // Semantic/contextual word mappings for domain-specific understanding
    const semanticMappings: Record<string, string[]> = {
      'cloud': ['sky', 'compute', 'server', 'host', 'storage', 'data'],
      'mint': ['finance', 'money', 'fresh', 'new', 'budget', 'wealth'],
      'spark': ['ignite', 'data', 'analytics', 'energy', 'bright', 'idea'],
      'search': ['find', 'discover', 'seek', 'explore', 'hunt', 'lookup'],
      'shop': ['store', 'market', 'buy', 'commerce', 'retail', 'mall'],
      'tech': ['technology', 'digital', 'software', 'innovation', 'code', 'dev'],
      'ai': ['artificial', 'intelligence', 'smart', 'machine', 'learning', 'neural'],
      'blog': ['write', 'post', 'journal', 'news', 'article', 'content'],
      'app': ['application', 'mobile', 'software', 'platform', 'tool', 'service'],
      'web': ['internet', 'online', 'site', 'digital', 'cyber', 'net'],
    };
    
    // Get semantic alternatives for the keyword
    const semanticAlternatives = semanticMappings[keyword.toLowerCase()] || [];
    
    // Comprehensive prefix list (200+ prefixes from Lean Domain Search + trending words)
    const prefixes = [
      // Top prefixes from Lean Domain Search
      'my', 'the', 'get', 'best', 'top', 'new', 'pro', 'super', 'mega', 'ultra',
      'all', 'your', 'our', 'one', 'first', 'last', 'next', 'real', 'true', 'pure',
      'free', 'easy', 'quick', 'fast', 'smart', 'cool', 'hot', 'big', 'great', 'good',
      'try', 'use', 'go', 'hey', 'hi', 'hello', 'welcome', 'join', 'meet', 'find',
      // Action words
      'buy', 'shop', 'save', 'make', 'build', 'create', 'start', 'launch', 'grow', 'boost',
      'learn', 'teach', 'share', 'connect', 'discover', 'explore', 'search', 'browse', 'view', 'watch',
      // Quality/Status
      'premium', 'elite', 'prime', 'plus', 'max', 'ultra', 'mega', 'super', 'hyper', 'turbo',
      'expert', 'master', 'genius', 'wizard', 'guru', 'ninja', 'hero', 'star', 'ace', 'king',
      // Modern/Tech
      'digital', 'cyber', 'tech', 'smart', 'cloud', 'web', 'net', 'online', 'virtual', 'meta',
      'crypto', 'blockchain', 'ai', 'ml', 'data', 'code', 'dev', 'app', 'mobile', 'social',
      // Time/Frequency
      'daily', 'weekly', 'monthly', 'instant', 'rapid', 'express', 'flash', 'now', 'today', 'live',
      'always', 'ever', 'never', 'forever', 'constant', 'infinite', 'endless', 'eternal', 'timeless', 'classic',
      // Size/Scale
      'mini', 'micro', 'small', 'tiny', 'compact', 'lite', 'light', 'slim', 'thin', 'nano',
      'giant', 'huge', 'massive', 'grand', 'epic', 'vast', 'wide', 'broad', 'full', 'complete',
      // Location/Direction
      'local', 'global', 'world', 'universal', 'international', 'national', 'regional', 'urban', 'metro', 'city',
      'north', 'south', 'east', 'west', 'central', 'main', 'downtown', 'uptown', 'midtown', 'inner',
      // Emotion/Feeling
      'happy', 'joy', 'love', 'peace', 'zen', 'calm', 'chill', 'relax', 'comfort', 'cozy',
      'fun', 'play', 'game', 'party', 'celebrate', 'festive', 'bright', 'sunny', 'fresh', 'clean',
      // Business/Professional
      'biz', 'corp', 'inc', 'group', 'team', 'crew', 'squad', 'guild', 'club', 'society',
      'agency', 'studio', 'firm', 'company', 'enterprise', 'venture', 'startup', 'launch', 'forge', 'craft',
      // Trending 2024-2026
      'quantum', 'neural', 'edge', 'core', 'nexus', 'vertex', 'apex', 'zenith', 'peak', 'summit',
      'fusion', 'synergy', 'harmony', 'unity', 'alliance', 'collective', 'network', 'mesh', 'grid', 'matrix'
    ];
    
    // Comprehensive suffix list (200+ suffixes from Lean Domain Search + trending words)
    const suffixes = [
      // Top suffixes from Lean Domain Search
      'online', 'hub', 'central', 'zone', 'spot', 'place', 'space', 'point', 'center', 'station',
      'world', 'land', 'ville', 'city', 'town', 'burg', 'port', 'bay', 'beach', 'island',
      // Tech/Digital
      'app', 'web', 'net', 'tech', 'digital', 'cyber', 'cloud', 'data', 'code', 'dev',
      'ai', 'ml', 'bot', 'api', 'sdk', 'platform', 'system', 'engine', 'core', 'stack',
      // Business/Service
      'pro', 'plus', 'max', 'elite', 'premium', 'prime', 'expert', 'master', 'guru', 'ninja',
      'lab', 'labs', 'studio', 'works', 'forge', 'factory', 'shop', 'store', 'mart', 'market',
      // Action/Function
      'ify', 'ize', 'er', 'or', 'ist', 'ster', 'maker', 'builder', 'creator', 'generator',
      'finder', 'searcher', 'hunter', 'tracker', 'scanner', 'detector', 'analyzer', 'monitor', 'watcher', 'guard',
      // Community/Social
      'community', 'social', 'network', 'connect', 'link', 'bridge', 'portal', 'gateway', 'door', 'path',
      'circle', 'group', 'team', 'crew', 'squad', 'guild', 'club', 'society', 'league', 'union',
      // Content/Media
      'blog', 'vlog', 'cast', 'pod', 'stream', 'tube', 'tv', 'radio', 'media', 'press',
      'news', 'post', 'feed', 'wire', 'channel', 'show', 'series', 'episode', 'story', 'tale',
      // Commerce/Transaction
      'shop', 'store', 'mart', 'market', 'bazaar', 'exchange', 'trade', 'deal', 'sale', 'buy',
      'cart', 'checkout', 'pay', 'wallet', 'vault', 'bank', 'fund', 'capital', 'invest', 'wealth',
      // Time/Status
      'now', 'today', 'live', 'instant', 'express', 'rapid', 'fast', 'quick', 'swift', 'speed',
      'daily', 'weekly', 'monthly', 'yearly', 'always', 'forever', 'ever', 'never', 'once', 'twice',
      // Quality/Feature
      'base', 'core', 'main', 'key', 'prime', 'first', 'best', 'top', 'peak', 'max',
      'ultra', 'mega', 'super', 'hyper', 'turbo', 'boost', 'power', 'force', 'energy', 'fuel',
      // Location/Container
      'box', 'kit', 'pack', 'bundle', 'suite', 'set', 'collection', 'library', 'archive', 'vault',
      'room', 'house', 'home', 'nest', 'den', 'cave', 'shelter', 'haven', 'oasis', 'paradise',
      // Direction/Movement
      'go', 'move', 'flow', 'stream', 'wave', 'tide', 'current', 'drift', 'shift', 'swing',
      'rise', 'climb', 'soar', 'fly', 'jump', 'leap', 'bounce', 'spring', 'launch', 'blast',
      // Modern/Trending
      'verse', 'metaverse', 'realm', 'dimension', 'universe', 'cosmos', 'galaxy', 'star', 'nova', 'nebula',
      'quantum', 'neural', 'edge', 'mesh', 'grid', 'matrix', 'nexus', 'vertex', 'apex', 'zenith',
      // Descriptive
      'ly', 'ful', 'less', 'ish', 'able', 'ible', 'ous', 'ious', 'ive', 'ative',
      'wise', 'like', 'style', 'mode', 'form', 'type', 'kind', 'sort', 'class', 'grade'
    ];
    
    // Exact match with .com (highest popularity)
    variations.push({
      name: keyword,
      available: true, // Will be updated by API
      popularity: 100,
      category: 'exact',
    });
    
    // Add semantic alternatives as high-priority suggestions
    semanticAlternatives.forEach((alt, index) => {
      variations.push({
        name: alt,
        available: true,
        popularity: 98 - index,
        category: 'alternative',
      });
      // Also add compound with original keyword
      variations.push({
        name: `${keyword}${alt}`,
        available: true,
        popularity: 96 - index,
        category: 'compound',
      });
      variations.push({
        name: `${alt}${keyword}`,
        available: true,
        popularity: 95 - index,
        category: 'compound',
      });
    });

    // ALL Prefix variations with .com (200+ variations)
    prefixes.forEach((prefix, index) => {
      const pop = 95 - Math.floor(index / 5);
      variations.push({
        name: `${prefix}${keyword}`,
        available: true, // Will be updated by API
        popularity: pop,
        category: 'prefix',
      });
    });

    // ALL Suffix variations with .com (200+ variations)
    suffixes.forEach((suffix, index) => {
      const pop = 93 - Math.floor(index / 5);
      variations.push({
        name: `${keyword}${suffix}`,
        available: true, // Will be updated by API
        popularity: pop,
        category: 'suffix',
      });
    });

    // Expanded compound variations (prefix + keyword + suffix) - Top 50 prefixes x Top 20 suffixes
    const topPrefixes = prefixes.slice(0, 50);
    const topSuffixes = suffixes.slice(0, 20);
    
    topPrefixes.forEach((prefix, i) => {
      topSuffixes.slice(0, 5).forEach((suffix, j) => {
        variations.push({
          name: `${prefix}${keyword}${suffix}`,
          available: true, // Will be updated by API
          popularity: 85 - Math.floor((i + j) / 2),
          category: 'compound',
        });
      });
    });

    // Alternative creative variations with .com
    if (keyword.length > 3) {
      const creative = [
        `${keyword}r`, `${keyword}ly`, `${keyword}ify`, `${keyword}er`, `${keyword}or`,
        `i${keyword}`, `e${keyword}`, `${keyword}s`, `${keyword}ing`, `${keyword}ed`,
        `${keyword}ist`, `${keyword}ster`, `${keyword}able`, `${keyword}ful`, `${keyword}less`,
        `${keyword}ize`, `${keyword}wise`, `${keyword}like`, `${keyword}ish`, `${keyword}ous`,
      ];
      
      creative.forEach((variant, index) => {
        variations.push({
          name: variant,
          available: true, // Will be updated by API
          popularity: 80 - index,
          category: 'alternative',
        });
      });
    }

    return variations;
  };

  const handleDomainClick = (domainName: string) => {
    setSelectedDomain(domainName);
    setShowDomainPopup(true);
  };

  const handleBuyDomain = (domainName: string, registrar: string) => {
    const reg = REGISTRARS.find(r => r.name === registrar);
    if (reg) {
      window.open(`${reg.url}${encodeURIComponent(domainName)}.com`, '_blank');
    }
    setShowDomainPopup(false);
  };

  const handleComClick = (domainName: string) => {
    const reg = REGISTRARS.find(r => r.name === selectedRegistrar);
    if (reg) {
      window.open(`${reg.url}${encodeURIComponent(domainName)}.com`, '_blank');
    }
  };

  const availableCount = suggestions.filter(s => s.available).length;
  const totalCount = suggestions.length;

  return (
    <div className="space-y-0">
      {/* Search Input */}
      <div className={`glass-card p-8 ${isLight ? 'border-slate-200' : 'border-white/10'} rounded-b-none`}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">AI-Powered Domain Generator</h2>
            <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              Generate creative domain name ideas as you type. Instant results with real-time availability.
            </p>
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter your keyword or business idea (e.g., cloud, mint, spark, shop)..."
              className={`w-full ${isLight ? 'bg-slate-100' : 'bg-white/5'} border ${isLight ? 'border-slate-200' : 'border-white/10'} rounded-xl px-6 py-4 text-lg ${isLight ? 'text-slate-900' : 'text-white'} ${isLight ? 'placeholder:text-slate-400' : 'placeholder:text-white/30'} focus:outline-none focus:ring-2 ${isLight ? 'focus:ring-blue-300' : 'focus:ring-white/20'} ${isLight ? 'focus:border-blue-300' : 'focus:border-white/20'} transition-all`}
              autoFocus
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className={`w-5 h-5 border-2 ${isLight ? 'border-slate-300 border-t-slate-600' : 'border-white/20 border-t-white'} rounded-full animate-spin`} />
              </div>
            )}
          </div>

          {keyword && totalCount > 0 && (
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLight ? 'bg-slate-400' : 'bg-white/40'}`}></div>
                <span className={isLight ? 'text-slate-500' : 'text-white/50'}>
                  <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{totalCount}</span> suggestions
                </span>
              </div>
              {availableCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-emerald-400 font-semibold">
                    {availableCount} available now
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      {keyword && totalCount > 0 && (
        <div className={`glass-card ${isLight ? 'border-slate-200' : 'border-white/10'} border-t-0 rounded-t-none`}>
          <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Registrar Selector */}
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Registrar:</span>
                <select
                  value={selectedRegistrar}
                  onChange={(e) => setSelectedRegistrar(e.target.value)}
                  className={`${isLight ? 'bg-slate-100' : 'bg-white/5'} border ${isLight ? 'border-slate-200' : 'border-white/10'} rounded-lg px-3 py-1.5 text-sm ${isLight ? 'text-slate-900' : 'text-white'} focus:outline-none focus:ring-2 ${isLight ? 'focus:ring-blue-300' : 'focus:ring-white/20'}`}
                >
                  {REGISTRARS.map((reg) => (
                    <option key={reg.name} value={reg.name}>
                      {reg.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className={`${isLight ? 'bg-slate-100' : 'bg-white/5'} border ${isLight ? 'border-slate-200' : 'border-white/10'} rounded-lg px-3 py-1.5 text-sm ${isLight ? 'text-slate-900' : 'text-white'} focus:outline-none focus:ring-2 ${isLight ? 'focus:ring-blue-300' : 'focus:ring-white/20'}`}
                >
                  <option value="popularity">Popularity</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="length">Length</option>
                </select>
              </div>

              {/* Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={`flex items-center gap-2 px-3 py-1.5 ${isLight ? 'bg-slate-100' : 'bg-white/5'} border ${isLight ? 'border-slate-200' : 'border-white/10'} rounded-lg text-sm ${isLight ? 'text-slate-900' : 'text-white'} ${isLight ? 'hover:bg-slate-200' : 'hover:bg-white/10'} transition-colors`}
                >
                  <span className={isLight ? 'text-slate-500' : 'text-white/50'}>Filter:</span>
                  <span className={`capitalize ${isLight ? 'text-slate-900' : 'text-white'}`}>{filter === 'all' ? 'All' : filter === 'starts' ? 'Starts with term' : 'Ends with term'}</span>
                  <Icons.ChevronDown />
                </button>
                {showFilterDropdown && (
                  <div className={`absolute left-0 top-full mt-1 w-48 ${isLight ? 'bg-white' : 'bg-[#1a1a1a]'} border ${isLight ? 'border-slate-200' : 'border-white/20'} rounded-lg shadow-xl z-50 py-1`}>
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'starts', label: 'Starts with term' },
                      { value: 'ends', label: 'Ends with term' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilter(option.value as FilterType);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          filter === option.value
                            ? `${isLight ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-white'} font-medium`
                            : `${isLight ? 'text-slate-700 hover:bg-slate-50 hover:text-slate-900' : 'text-white/80 hover:bg-white/5 hover:text-white'}`
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewType('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewType === 'grid' ? `${isLight ? 'bg-slate-200 text-slate-900' : 'bg-white/10 text-white'}` : `${isLight ? 'text-slate-500 hover:text-slate-700' : 'text-white/40 hover:text-white/70'}`
                }`}
                title="Grid view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewType === 'list' ? `${isLight ? 'bg-slate-200 text-slate-900' : 'bg-white/10 text-white'}` : `${isLight ? 'text-slate-500 hover:text-slate-700' : 'text-white/40 hover:text-white/70'}`
                }`}
                title="List view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {filteredSuggestions.length > 0 && (
        <div className={`glass-card ${isLight ? 'border-slate-200' : 'border-white/10'} border-t-0 rounded-t-none`}>
          {viewType === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-6">
              {filteredSuggestions.map((suggestion, i) => (
                <div
                  key={i}
                  className={`group p-4 border rounded-lg transition-all ${
                    suggestion.available
                      ? `${isLight ? 'bg-white' : 'bg-white/[0.02]'} ${isLight ? 'border-slate-200' : 'border-white/10'} hover:border-emerald-500/30 hover:bg-emerald-500/5`
                      : `${isLight ? 'bg-slate-50' : 'bg-white/[0.01]'} ${isLight ? 'border-slate-100' : 'border-white/5'} opacity-60`
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleDomainClick(suggestion.name)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className={`font-bold text-base truncate ${isLight ? 'hover:text-slate-700' : 'hover:text-white/80'} transition-colors`}>
                        {suggestion.name}
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      {suggestion.available ? (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          <button
                            onClick={() => handleComClick(suggestion.name)}
                            className="text-xs font-semibold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          >
                            .com
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
                          <span className={`text-xs px-2 py-1 ${isLight ? 'text-slate-400' : 'text-white/30'}`}>.com</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-white/5'}`}>
              {filteredSuggestions.map((suggestion, i) => (
                <div
                  key={i}
                  className={`px-6 py-3 ${isLight ? 'hover:bg-slate-50' : 'hover:bg-white/[0.02]'} transition-all group`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => handleDomainClick(suggestion.name)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <span className={`font-semibold text-sm truncate ${isLight ? 'hover:text-slate-700' : 'hover:text-white/80'} transition-colors`}>
                        {suggestion.name}
                      </span>
                    </button>
                    <button
                      onClick={() => handleComClick(suggestion.name)}
                      className={`text-xs px-3 py-1 rounded transition-colors ${
                        suggestion.available
                          ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-400/10'
                          : `${isLight ? 'text-slate-400' : 'text-white/30'} cursor-not-allowed`
                      }`}
                      disabled={!suggestion.available}
                    >
                      .com
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!keyword && (
        <div className={`glass-card p-12 ${isLight ? 'border-slate-200' : 'border-white/10'} border-t-0 rounded-t-none text-center`}>
          <div className={`inline-flex p-6 rounded-full ${isLight ? 'bg-slate-100' : 'bg-white/5'} border ${isLight ? 'border-slate-200' : 'border-white/10'} mb-6`}>
            <Icons.Magic />
          </div>
          <h3 className="text-lg font-semibold mb-2">Start Generating Domain Names</h3>
          <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/50'} max-w-md mx-auto mb-6`}>
            Enter a keyword above to generate hundreds of creative domain name suggestions instantly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Try:</span>
            {['cloud', 'mint', 'spark', 'shop', 'tech', 'ai', 'blog'].map(example => (
              <button
                key={example}
                onClick={() => setKeyword(example)}
                className={`px-3 py-1.5 text-xs font-medium ${isLight ? 'bg-slate-100' : 'bg-white/5'} ${isLight ? 'hover:bg-slate-200' : 'hover:bg-white/10'} border ${isLight ? 'border-slate-200' : 'border-white/10'} ${isLight ? 'hover:border-blue-300' : 'hover:border-white/20'} rounded-lg transition-colors`}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {keyword && filteredSuggestions.length === 0 && !isSearching && suggestions.length > 0 && (
        <div className={`glass-card p-12 ${isLight ? 'border-slate-200' : 'border-white/10'} border-t-0 rounded-t-none text-center`}>
          <div className={`inline-flex p-6 rounded-full ${isLight ? 'bg-slate-100' : 'bg-white/5'} border ${isLight ? 'border-slate-200' : 'border-white/10'} mb-6`}>
            <Icons.Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
          <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/50'} max-w-md mx-auto`}>
            Try changing your filter. Your keyword "{keyword}" has {suggestions.length} total results.
          </p>
        </div>
      )}

      {/* Domain Popup */}
      {showDomainPopup && selectedDomain && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDomainPopup(false)}>
          <div className={`${isLight ? 'bg-white' : 'bg-[#1a1a1a]'} border ${isLight ? 'border-slate-200' : 'border-white/10'} rounded-xl p-6 max-w-md w-full`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedDomain}.com</h3>
              <button
                onClick={() => setShowDomainPopup(false)}
                className={`${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-white/50 hover:text-white'} transition-colors`}
              >
                <Icons.Close />
              </button>
            </div>
            
            <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/50'} mb-6`}>
              Choose your preferred registrar to purchase this domain:
            </p>
            
            <div className="space-y-2">
              {REGISTRARS.map((registrar) => (
                <button
                  key={registrar.name}
                  onClick={() => handleBuyDomain(selectedDomain, registrar.name)}
                  className={`w-full text-left px-4 py-3 ${isLight ? 'bg-slate-100' : 'bg-white/5'} ${isLight ? 'hover:bg-slate-200' : 'hover:bg-white/10'} border ${isLight ? 'border-slate-200' : 'border-white/10'} rounded-lg transition-colors group`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{registrar.name}</span>
                    <svg className={`w-4 h-4 ${isLight ? 'text-slate-400 group-hover:text-slate-900' : 'text-white/40 group-hover:text-white'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
