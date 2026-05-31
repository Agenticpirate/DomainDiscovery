'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';
import countriesData from '@/data/countries.json';
import citiesData from '@/data/cities-expanded.json';
import usStatesData from '@/data/us-states.json';
import canadaProvincesData from '@/data/canada-provinces.json';
import australiaStatesData from '@/data/australia-states.json';

interface Location {
  name: string;
  population: number;
  type: 'country' | 'city' | 'state';
  code?: string;
  continent?: string;
  country?: string;
  region?: string;
}

interface GeneratedDomain {
  domain: string;
  location: string;
  population: number;
  length: number;
  type: 'country' | 'city' | 'state';
  status: 'pending' | 'checking' | 'available' | 'taken' | 'error';
}

type LocationType = 'all_countries' | 'all_cities' | 'us_states' | 'us_cities' | 'canada_cities' | 'canada_provinces' | 'uk_cities' | 'australia_cities' | 'australia_states' | 'europe' | 'asia' | 'africa' | 'south_america' | 'oceania' | 'north_america';
type KeywordPosition = 'start' | 'end' | 'both';

const TLD_OPTIONS = [
  { value: 'com', label: '.com', popular: true, rank: 1 },
  { value: 'net', label: '.net', popular: true, rank: 2 },
  { value: 'org', label: '.org', popular: true, rank: 3 },
  { value: 'co', label: '.co', popular: true, rank: 4 },
  { value: 'io', label: '.io', popular: true, rank: 5 },
  { value: 'info', label: '.info', popular: true, rank: 6 },
  { value: 'biz', label: '.biz', popular: true, rank: 7 },
  { value: 'us', label: '.us', popular: true, rank: 8 },
  { value: 'ai', label: '.ai', popular: true, rank: 9 },
  { value: 'app', label: '.app', popular: true, rank: 10 },
  { value: 'dev', label: '.dev', popular: false, rank: 11 },
  { value: 'xyz', label: '.xyz', popular: false, rank: 12 },
  { value: 'online', label: '.online', popular: false, rank: 13 },
  { value: 'site', label: '.site', popular: false, rank: 14 },
  { value: 'uk', label: '.uk', popular: false, rank: 15 },
  { value: 'ca', label: '.ca', popular: false, rank: 16 },
  { value: 'de', label: '.de', popular: false, rank: 17 },
  { value: 'fr', label: '.fr', popular: false, rank: 18 },
  { value: 'au', label: '.au', popular: false, rank: 19 },
  { value: 'in', label: '.in', popular: false, rank: 20 },
];

const LOCATION_OPTIONS = [
  { value: 'all_countries', label: 'Countries (All)', icon: '🌍' },
  { value: 'all_cities', label: 'Major Cities (300+)', icon: '🏙️' },
  { value: 'us_cities', label: 'US Cities', icon: '🇺🇸' },
  { value: 'us_states', label: 'US State Names', icon: '🇺🇸' },
  { value: 'canada_cities', label: 'Canada Cities', icon: '🇨🇦' },
  { value: 'canada_provinces', label: 'Canada Provinces & Territories', icon: '🇨🇦' },
  { value: 'uk_cities', label: 'UK Cities', icon: '🇬🇧' },
  { value: 'australia_cities', label: 'Australia Cities', icon: '🇦🇺' },
  { value: 'australia_states', label: 'Australia States', icon: '🇦�' },
  { value: 'europe', label: 'Europe', icon: '🇪🇺' },
  { value: 'asia', label: 'Asia', icon: '🌏' },
  { value: 'africa', label: 'Africa', icon: '🌍' },
  { value: 'north_america', label: 'North America', icon: '🌎' },
  { value: 'south_america', label: 'South America', icon: '🌎' },
  { value: 'oceania', label: 'Oceania', icon: '🌊' },
];

const formatPopulation = (pop: number): string => {
  if (pop >= 1000000000) return `${(pop / 1000000000).toFixed(1)}B`;
  if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
  if (pop >= 1000) return `${(pop / 1000).toFixed(0)}K`;
  return pop.toString();
};

const sanitizeDomainName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 63);
};

export const GeoDomainGenerator: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [keyword, setKeyword] = useState('');
  const [locationType, setLocationType] = useState<LocationType>('all_countries');
  const [position, setPosition] = useState<KeywordPosition>('end');
  const [selectedTlds, setSelectedTlds] = useState<string[]>(['com']);
  const [minPopulation, setMinPopulation] = useState<number>(0);
  const [generatedDomains, setGeneratedDomains] = useState<GeneratedDomain[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sortBy, setSortBy] = useState<'domain' | 'population' | 'length'>('population');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'taken' | 'checking'>('all');

  const locations = useMemo((): Location[] => {
    let result: Location[] = [];

    if (locationType === 'all_countries') {
      result = countriesData.map(c => ({
        name: c.name,
        population: c.population,
        type: 'country' as const,
        code: c.code,
        continent: c.continent,
      }));
    } else if (locationType === 'all_cities') {
      result = citiesData.map(c => ({
        name: c.name,
        population: c.population,
        type: 'city' as const,
        country: c.country,
        region: c.countryName,
      }));
    } else if (locationType === 'us_cities') {
      result = citiesData
        .filter(c => c.country === 'US')
        .map(c => ({
          name: c.name,
          population: c.population,
          type: 'city' as const,
          country: c.country,
          region: c.countryName,
        }));
    } else if (locationType === 'europe') {
      result = countriesData
        .filter(c => c.continent === 'Europe')
        .map(c => ({
          name: c.name,
          population: c.population,
          type: 'country' as const,
          code: c.code,
          continent: c.continent,
        }));
    } else if (locationType === 'asia') {
      result = countriesData
        .filter(c => c.continent === 'Asia')
        .map(c => ({
          name: c.name,
          population: c.population,
          type: 'country' as const,
          code: c.code,
          continent: c.continent,
        }));
    } else if (locationType === 'us_states') {
      result = usStatesData.map(s => ({
        name: s.name,
        population: s.population,
        type: 'state' as const,
        code: s.code,
        region: s.region,
      }));
    } else if (locationType === 'africa') {
      result = countriesData
        .filter(c => c.continent === 'Africa')
        .map(c => ({
          name: c.name,
          population: c.population,
          type: 'country' as const,
          code: c.code,
          continent: c.continent,
        }));
    } else if (locationType === 'north_america') {
      result = countriesData
        .filter(c => c.continent === 'North America')
        .map(c => ({
          name: c.name,
          population: c.population,
          type: 'country' as const,
          code: c.code,
          continent: c.continent,
        }));
    } else if (locationType === 'south_america') {
      result = countriesData
        .filter(c => c.continent === 'South America')
        .map(c => ({
          name: c.name,
          population: c.population,
          type: 'country' as const,
          code: c.code,
          continent: c.continent,
        }));
    } else if (locationType === 'oceania') {
      result = countriesData
        .filter(c => c.continent === 'Oceania')
        .map(c => ({
          name: c.name,
          population: c.population,
          type: 'country' as const,
          code: c.code,
          continent: c.continent,
        }));
    } else if (locationType === 'canada_cities') {
      result = citiesData
        .filter(c => c.country === 'CA')
        .map(c => ({
          name: c.name,
          population: c.population,
          type: 'city' as const,
          country: c.country,
          region: c.countryName,
        }));
    } else if (locationType === 'canada_provinces') {
      result = canadaProvincesData.map(p => ({
        name: p.name,
        population: p.population,
        type: 'state' as const,
        code: p.code,
        country: p.country,
      }));
    } else if (locationType === 'uk_cities') {
      result = citiesData
        .filter(c => c.country === 'GB')
        .map(c => ({
          name: c.name,
          population: c.population,
          type: 'city' as const,
          country: c.country,
          region: c.countryName,
        }));
    } else if (locationType === 'australia_cities') {
      result = citiesData
        .filter(c => c.country === 'AU')
        .map(c => ({
          name: c.name,
          population: c.population,
          type: 'city' as const,
          country: c.country,
          region: c.countryName,
        }));
    } else if (locationType === 'australia_states') {
      result = australiaStatesData.map(s => ({
        name: s.name,
        population: s.population,
        type: 'state' as const,
        code: s.code,
        country: s.country,
      }));
    }

    return result.filter(l => l.population >= minPopulation);
  }, [locationType, minPopulation]);

  const checkDomainAvailability = useCallback(async (domainsToCheck: GeneratedDomain[]) => {
    // The availability API counts each request against a tight bulk rate limit
    // (5/min). Send ONE request (it chunks server-side) instead of many
    // sequential batches, which would get 429'd and leave domains stuck "checking".
    const CHECK_LIMIT = 600;
    const domainNames = domainsToCheck.slice(0, CHECK_LIMIT).map(d => d.domain);
    if (domainNames.length === 0) return;

    try {
      const response = await fetch('/api/domains/instant-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domains: domainNames }),
      });

      if (response.ok) {
        const results = await response.json();
        const byDomain = new Map<string, { available: boolean }>(
          (Array.isArray(results) ? results : []).map((r: { domain: string; available: boolean }) => [r.domain.toLowerCase(), r])
        );
        setGeneratedDomains(prev => prev.map(d => {
          const result = byDomain.get(d.domain.toLowerCase());
          if (result) return { ...d, status: result.available ? 'available' : 'taken' };
          // Anything beyond the cap (or unresolved) shouldn't spin forever.
          return d.status === 'checking' ? { ...d, status: 'taken' } : d;
        }));
      } else {
        setGeneratedDomains(prev => prev.map(d => d.status === 'checking' ? { ...d, status: 'error' } : d));
      }
    } catch (error) {
      console.error('Error checking domains:', error);
      setGeneratedDomains(prev => prev.map(d => d.status === 'checking' ? { ...d, status: 'error' } : d));
    }
  }, []);

  const generateDomains = useCallback(async () => {
    if (!keyword.trim()) return;

    setIsGenerating(true);
    const sanitizedKeyword = sanitizeDomainName(keyword);
    const domains: GeneratedDomain[] = [];

    locations.forEach(location => {
      const sanitizedLocation = sanitizeDomainName(location.name);
      
      selectedTlds.forEach(tld => {
        if (position === 'start' || position === 'both') {
          const domain = `${sanitizedKeyword}${sanitizedLocation}.${tld}`;
          domains.push({
            domain,
            location: location.name,
            population: location.population,
            length: domain.length,
            type: location.type,
            status: 'checking',
          });
        }
        
        if (position === 'end' || position === 'both') {
          const domain = `${sanitizedLocation}${sanitizedKeyword}.${tld}`;
          domains.push({
            domain,
            location: location.name,
            population: location.population,
            length: domain.length,
            type: location.type,
            status: 'checking',
          });
        }
      });
    });

    setGeneratedDomains(domains);
    setIsGenerating(false);

    // Start checking availability in background
    checkDomainAvailability(domains);
  }, [keyword, locations, selectedTlds, position, checkDomainAvailability]);

  const sortedDomains = useMemo(() => {
    let filtered = [...generatedDomains];
    
    // Apply status filter if set
    if (statusFilter === 'available') {
      filtered = filtered.filter(d => d.status === 'available');
    } else if (statusFilter === 'taken') {
      filtered = filtered.filter(d => d.status === 'taken');
    } else if (statusFilter === 'checking') {
      filtered = filtered.filter(d => d.status === 'checking');
    }
    // If statusFilter is 'all', show all domains

    return filtered.sort((a, b) => {
      // Sort by status first (available first, then checking, then taken)
      const statusOrder = { available: 0, checking: 1, pending: 2, taken: 3, error: 4 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;

      let comparison = 0;
      if (sortBy === 'domain') {
        comparison = a.domain.localeCompare(b.domain);
      } else if (sortBy === 'population') {
        comparison = a.population - b.population;
      } else if (sortBy === 'length') {
        comparison = a.length - b.length;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [generatedDomains, sortBy, sortOrder, statusFilter]);

  const toggleTld = (tld: string) => {
    setSelectedTlds(prev => 
      prev.includes(tld) 
        ? prev.filter(t => t !== tld)
        : [...prev, tld]
    );
  };


  const stats = useMemo(() => ({
    total: generatedDomains.length,
    available: generatedDomains.filter(d => d.status === 'available').length,
    taken: generatedDomains.filter(d => d.status === 'taken').length,
    checking: generatedDomains.filter(d => d.status === 'checking').length,
    pending: generatedDomains.filter(d => d.status === 'pending').length,
  }), [generatedDomains]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Settings Panel */}
      <div className={`p-3.5 sm:p-4 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/[0.02] border border-white/10'} border rounded-2xl space-y-4 sm:space-y-5`}>
        {/* Keyword Input */}
        <div>
          <label className={`block text-sm font-medium ${isLight ? 'text-slate-600' : 'text-white/70'} mb-2`}>
            Enter Your Keyword / Niche
          </label>
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., plumber, lawyer, pizza, news, bulletin"
              className={`w-full px-4 py-3 text-sm sm:text-base ${isLight ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20' : 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-slate-400/50 focus:ring-slate-400/50'} border rounded-xl focus:outline-none focus:ring-1 transition-all`}
            />
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-300' : 'text-white/30'}`}>
              <Icons.Search />
            </div>
          </div>
          <p className={`mt-2 text-xs ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
            This keyword will be combined with location names to generate geo-targeted domain names.
          </p>
        </div>

        {/* Location Type */}
        <div>
          <label className={`block text-sm font-medium ${isLight ? 'text-slate-600' : 'text-white/70'} mb-3`}>
            Target Locations
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-1.5 sm:gap-2">
            {LOCATION_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setLocationType(option.value as LocationType)}
                className={`flex items-center gap-1.5 px-2.5 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border text-[11px] sm:text-sm font-medium transition-all text-left ${
                  locationType === option.value
                    ? `${isLight ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-400/20 border-slate-400/50 text-white'}`
                    : `${isLight ? 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-slate-900' : 'bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20 hover:text-white'}`
                }`}
              >
                <span className="shrink-0">{option.icon}</span>
                <span className="truncate">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Keyword Position */}
        <div>
          <label className={`block text-sm font-medium ${isLight ? 'text-slate-600' : 'text-white/70'} mb-3`}>
            Keyword Position
          </label>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {[
              { value: 'start', label: 'Keyword First', example: 'plumberlondon.com' },
              { value: 'end', label: 'Location First', example: 'londonplumber.com' },
              { value: 'both', label: 'Both Positions', example: 'Both variations' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setPosition(option.value as KeywordPosition)}
                className={`px-2.5 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border text-left transition-all min-w-0 ${
                  position === option.value
                    ? `${isLight ? 'bg-blue-50 border-blue-300' : 'bg-slate-400/20 border-slate-400/50'}`
                    : `${isLight ? 'bg-white border-slate-200 hover:border-blue-300' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`
                }`}
              >
                <div className={`text-[11px] sm:text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{option.label}</div>
                <div className={`text-[10px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-white/40'} mt-0.5 sm:mt-1 truncate`}>{option.example}</div>
              </button>
            ))}
          </div>
        </div>

        {/* TLD Selection */}
        <div>
          <label className={`block text-sm font-medium ${isLight ? 'text-slate-600' : 'text-white/70'} mb-3`}>
            Domain Extensions (TLDs)
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {TLD_OPTIONS.map(tld => (
              <button
                key={tld.value}
                onClick={() => toggleTld(tld.value)}
                className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
                  selectedTlds.includes(tld.value)
                    ? `${isLight ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-400/20 border-slate-400/50 text-white'}`
                    : `${isLight ? 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-slate-900' : 'bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20 hover:text-white'}`
                }`}
              >
                {tld.label}
                {tld.popular && selectedTlds.includes(tld.value) && (
                  <span className="ml-1 text-xs text-slate-400">★</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Population Filter */}
        <div>
          <label className={`block text-sm font-medium ${isLight ? 'text-slate-600' : 'text-white/70'} mb-3`}>
            Minimum Population: {formatPopulation(minPopulation)}
          </label>
          <input
            type="range"
            min="0"
            max="100000000"
            step="100000"
            value={minPopulation}
            onChange={(e) => setMinPopulation(Number(e.target.value))}
            className={`w-full h-2 ${isLight ? 'bg-slate-100' : 'bg-white/10'} rounded-lg appearance-none cursor-pointer accent-slate-400`}
          />
          <div className={`flex justify-between text-xs ${isLight ? 'text-slate-500' : 'text-white/40'} mt-1`}>
            <span>All</span>
            <span>100M+</span>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            onClick={generateDomains}
            disabled={!keyword.trim() || selectedTlds.length === 0 || isGenerating}
            size="lg"
            className="flex-1 min-h-[44px]"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Generating...
              </>
            ) : (
              <>
                <Icons.Magic />
                <span className="ml-2">Generate {locations.length * selectedTlds.length * (position === 'both' ? 2 : 1)} Domains</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results Section */}
      {generatedDomains.length > 0 && (
        <div className="space-y-4">
          {/* Results Header with Stats */}
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3.5 sm:p-4 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/[0.02] border border-white/10'} border rounded-xl`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div>
                <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Results</h3>
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{stats.total} domains</p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className={`text-sm ${isLight ? 'text-slate-600' : 'text-white/70'}`}>{stats.available} available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className={`text-sm ${isLight ? 'text-slate-600' : 'text-white/70'}`}>{stats.taken} taken</span>
                </div>
                {stats.checking > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className={`text-sm ${isLight ? 'text-slate-600' : 'text-white/70'}`}>{stats.checking} checking...</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/40'} italic`}>Click domain names or Register buttons to purchase</span>
            </div>
          </div>

          {/* Sort Controls */}
          <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 p-3.5 sm:p-4 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/[0.02] border border-white/10'} border rounded-xl`}>
            <span className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Sort by:</span>
            {['domain', 'population', 'length'].map(sort => (
              <button
                key={sort}
                onClick={() => {
                  if (sortBy === sort) {
                    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(sort as typeof sortBy);
                    setSortOrder('desc');
                  }
                }}
                className={`px-2.5 py-1.5 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  sortBy === sort
                    ? `${isLight ? 'bg-blue-50 text-blue-700' : 'bg-slate-400/20 text-white'}`
                    : `${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-white/50 hover:text-white'}`
                }`}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
                {sortBy === sort && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            ))}
          </div>

          {/* Results Table */}
          <div 
            className="overflow-x-auto select-none rounded-xl border border-transparent"
            onContextMenu={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
          >
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className={`border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                  <th className={`text-left py-2.5 px-3 sm:py-3 sm:px-4 text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-white/50'} uppercase tracking-wider`}>Domain</th>
                  <th className={`text-center py-2.5 px-3 sm:py-3 sm:px-4 text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-white/50'} uppercase tracking-wider`}>Status</th>
                  <th className={`text-left py-2.5 px-3 sm:py-3 sm:px-4 text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-white/50'} uppercase tracking-wider`}>Location</th>
                  <th className={`text-right py-2.5 px-3 sm:py-3 sm:px-4 text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-white/50'} uppercase tracking-wider`}>Population</th>
                  <th className={`text-center py-2.5 px-3 sm:py-3 sm:px-4 text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-white/50'} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-white/5'}`}>
                {sortedDomains.slice(0, 100).map((domain, index) => (
                  <tr key={index} className={`${isLight ? 'hover:bg-slate-50' : 'hover:bg-white/[0.02]'} transition-colors`}>
                    <td className="py-3 px-4">
                      <a
                        href={`https://www.godaddy.com/domainsearch/find?domainToCheck=${domain.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-mono text-sm ${isLight ? 'text-slate-900 hover:text-emerald-600' : 'text-white hover:text-emerald-400'} transition-colors cursor-pointer`}
                        title="Register this domain on GoDaddy"
                      >
                        {domain.domain}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {domain.status === 'checking' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Checking
                        </span>
                      )}
                      {domain.status === 'available' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                          <Icons.Check />
                          Available
                        </span>
                      )}
                      {domain.status === 'taken' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                          Taken
                        </span>
                      )}
                      {domain.status === 'error' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                          Error
                        </span>
                      )}
                      {domain.status === 'pending' && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-white/40'}`}>
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${isLight ? 'text-slate-600' : 'text-white/70'}`}>{domain.location}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-white/40'}`}>
                          {domain.type}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{formatPopulation(domain.population)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={`https://www.godaddy.com/domainsearch/find?domainToCheck=${domain.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            domain.status === 'available' 
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25' 
                              : `${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900' : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'}`
                          }`}
                          title="Register on GoDaddy"
                        >
                          {domain.status === 'available' ? (
                            <>
                              <Icons.Globe />
                              Register
                            </>
                          ) : (
                            <>
                              <Icons.Globe />
                              Check
                            </>
                          )}
                        </a>
                        <a
                          href={`https://who.is/whois/${domain.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-1.5 ${isLight ? 'text-slate-300 hover:text-slate-900 hover:bg-slate-100' : 'text-white/30 hover:text-white hover:bg-white/10'} rounded transition-all`}
                          title="WHOIS Lookup"
                        >
                          <Icons.Info />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedDomains.length > 100 && (
            <p className={`text-center text-sm ${isLight ? 'text-slate-500' : 'text-white/40'} py-4`}>
              Showing 100 of {sortedDomains.length} domains. Export to CSV to see all results.
            </p>
          )}
        </div>
      )}

      {/* SEO Content Section */}
      <div className={`space-y-6 pt-8 border-t ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
        <h2 className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>What is a Geo Domain Generator?</h2>
        <div className="prose prose-invert max-w-none">
          <p className={`${isLight ? 'text-slate-600' : 'text-white/60'} leading-relaxed`}>
            A Geo Domain Generator is a powerful SEO tool that combines your business keyword or niche with geographic locations 
            (countries, cities, regions) to create location-targeted domain names. These geo-specific domains are highly valuable 
            for local SEO, helping businesses rank higher in location-based searches.
          </p>
        </div>

        <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'} mt-8`}>Why Use Geo-Targeted Domains?</h3>
        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          {[
            { title: 'Local SEO Boost', desc: 'Geo domains naturally rank better for location-specific searches like "plumber london" or "lawyer new york".' },
            { title: 'Instant Relevance', desc: 'Users immediately understand your service area, increasing click-through rates from search results.' },
            { title: 'Brand Trust', desc: 'Local domain names build trust with customers who prefer working with businesses in their area.' },
            { title: 'Market Targeting', desc: 'Target specific markets with dedicated domains for each location you serve.' },
          ].map((item, i) => (
            <div key={i} className={`p-3.5 sm:p-4 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/[0.02] border border-white/10'} border rounded-xl`}>
              <h4 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'} mb-2`}>{item.title}</h4>
              <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{item.desc}</p>
            </div>
          ))}
        </div>

        <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'} mt-8`}>Popular Geo Domain Niches</h3>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {['plumber', 'lawyer', 'dentist', 'realtor', 'pizza', 'taxi', 'hotel', 'news', 'jobs', 'cars', 'homes', 'rentals', 'tours', 'gym', 'spa'].map(niche => (
            <button
              key={niche}
              onClick={() => setKeyword(niche)}
              className={`px-2.5 py-1.5 sm:px-3 ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-blue-300' : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20'} border rounded-lg text-xs sm:text-sm transition-all`}
            >
              {niche}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
