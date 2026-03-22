'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';
import extensionsData from '@/data/extensions.json';

interface Extension {
  tld: string;
  name: string;
  price: string;
  available: boolean | null;
  category: string;
  checking?: boolean;
}

const EXTENSIONS_BASE_DATA = extensionsData as Array<Omit<Extension, 'available' | 'checking'>>;

interface DomainExtensionsViewProps {
  searchQuery?: string;
}

const checkDomainsAvailability = async (domains: string[]): Promise<Map<string, { available: boolean; premium?: boolean }>> => {
  try {
    const res = await fetch('/api/domains/instant-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains }),
    });
    
    if (res.ok) {
      const data = await res.json();
      const resultMap = new Map();
      data.forEach((r: any) => {
        resultMap.set(r.domain, { available: r.available, premium: r.premium });
      });
      return resultMap;
    }
  } catch (e) {
    console.error('Failed to check domains:', e);
  }
  return new Map();
};

export function DomainExtensionsView({ searchQuery = '' }: DomainExtensionsViewProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [extensions, setExtensions] = useState<Extension[]>(() => 
    EXTENSIONS_BASE_DATA.map(ext => ({ ...ext, available: null, checking: false }))
  );
  const [isChecking, setIsChecking] = useState(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchRef = useRef<string>('');

  const checkAvailability = useCallback(async (keyword: string) => {
    if (!keyword.trim() || keyword === lastSearchRef.current) return;
    
    lastSearchRef.current = keyword;
    const cleanKeyword = keyword.toLowerCase().replace(/\s+/g, '').replace(/^\./, '');
    
    if (!cleanKeyword) {
      setExtensions(EXTENSIONS_BASE_DATA.map(ext => ({ ...ext, available: null, checking: false })));
      return;
    }

    setExtensions(prev => prev.map(ext => ({ ...ext, checking: true, available: null })));
    setIsChecking(true);

    const domainsToCheck = EXTENSIONS_BASE_DATA.map(ext => `${cleanKeyword}${ext.tld}`);
    
    const batchSize = 50;
    const results = new Map<string, { available: boolean; premium?: boolean }>();
    
    for (let i = 0; i < domainsToCheck.length; i += batchSize) {
      const batch = domainsToCheck.slice(i, i + batchSize);
      const batchResults = await checkDomainsAvailability(batch);
      batchResults.forEach((value, key) => results.set(key, value));
      
      setExtensions(prev => prev.map(ext => {
        const domain = `${cleanKeyword}${ext.tld}`;
        const result = results.get(domain);
        if (result) {
          return { 
            ...ext, 
            available: result.available, 
            checking: false 
          };
        }
        return ext;
      }));
    }

    setIsChecking(false);
  }, []);

  useEffect(() => {
    const query = localSearch || searchQuery;
    
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    if (!query.trim()) {
      setExtensions(EXTENSIONS_BASE_DATA.map(ext => ({ ...ext, available: null, checking: false })));
      lastSearchRef.current = '';
      return;
    }

    checkTimeoutRef.current = setTimeout(() => {
      checkAvailability(query);
    }, 500);

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [localSearch, searchQuery, checkAvailability]);

  const categories = useMemo(() => {
    const cats = ['All', ...Array.from(new Set(EXTENSIONS_BASE_DATA.map(ext => ext.category)))];
    return cats;
  }, []);

  const filteredExtensions = useMemo(() => {
    let filtered = extensions;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(ext => ext.category === selectedCategory);
    }

    const query = (localSearch || searchQuery).toLowerCase().trim();
    if (query && !isChecking) {
      const isExtensionSearch = query.startsWith('.');
      if (isExtensionSearch) {
        filtered = filtered.filter(ext => 
          ext.tld.toLowerCase().includes(query) ||
          ext.name.toLowerCase().includes(query) ||
          ext.category.toLowerCase().includes(query)
        );
      }
    }

    return filtered;
  }, [extensions, selectedCategory, localSearch, searchQuery, isChecking]);

  const groupedExtensions = useMemo(() => {
    const groups: Record<string, Extension[]> = {};
    filteredExtensions.forEach(ext => {
      if (!groups[ext.category]) {
        groups[ext.category] = [];
      }
      groups[ext.category].push(ext);
    });
    return groups;
  }, [filteredExtensions]);

  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="relative max-w-xl">
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
            <Icons.Search />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Type keyword to check across all extensions..."
            className={`w-full rounded-lg px-11 py-2.5 text-sm focus:outline-none focus:ring-1 ${isLight ? 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20' : 'bg-[#1a1a1a] border border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20'}`}
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-white/40 hover:text-white/80'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="mb-3">
        <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1.5 scrollbar-hide sm:flex-wrap sm:overflow-visible">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-2.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? `${isLight ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20' : 'bg-emerald-500 text-white'}`
                  : `${isLight ? 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-slate-200 shadow-sm' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'}`
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(groupedExtensions).length === 0 ? (
        <div className="text-center py-14">
          <div className={`${isLight ? 'text-slate-300' : 'text-white/20'} mb-4 flex justify-center`}>
            <Icons.Search />
          </div>
          <p className={`${isLight ? 'text-slate-400' : 'text-white/40'}`}>No extensions found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedExtensions).map(([category, exts]) => (
            <div key={category}>
              <h2 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2">
                <span>{category}</span>
                <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-white/40'} font-normal`}>({exts.length})</span>
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 sm:gap-2">
                {exts.map(ext => (
                  <ExtensionCard key={ext.tld} extension={ext} searchQuery={localSearch || searchQuery} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ExtensionCardProps {
  extension: Extension;
  searchQuery: string;
}

function ExtensionCard({ extension, searchQuery }: ExtensionCardProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleClick = () => {
    if (!searchQuery.trim()) {
      return;
    }
    
    if (extension.available) {
      const cleanKeyword = searchQuery.toLowerCase().replace(/\s+/g, '').replace(/^\./, '');
      const domain = `${cleanKeyword}${extension.tld}`;
      window.open(`https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`, '_blank');
    }
  };

  const getStatusColor = () => {
    if (extension.checking) return 'bg-white/40 animate-pulse';
    if (extension.available === true) return 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse';
    if (extension.available === false) return 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.6)]';
    return `${isLight ? 'bg-slate-300' : 'bg-white/20'}`;
  };

  const showStatus = searchQuery.trim() !== '';

  return (
    <button
      onClick={handleClick}
      disabled={!searchQuery.trim() || extension.checking}
      className={`group relative p-2 sm:p-2.5 border rounded-lg transition-all text-left disabled:cursor-default ${isLight ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/[0.06]' : 'bg-[#1a1a1a] border-white/10 hover:border-white/20'}`}
    >
      {showStatus && (
        <div className="absolute top-1.5 right-1.5">
          <span className={`w-1.5 h-1.5 rounded-full block ${getStatusColor()}`} />
        </div>
      )}

      <div className={`font-mono text-[13px] sm:text-base font-bold mb-0 select-none ${isLight ? 'text-slate-900' : 'text-white'}`} style={{ userSelect: 'none' }}>
        {extension.tld}
      </div>
      <div className={`text-[9px] sm:text-[10px] mb-0.5 select-none ${isLight ? 'text-slate-400' : 'text-white/40'}`} style={{ userSelect: 'none' }}>
        {extension.name}
      </div>
      <div className={`text-[10px] sm:text-[11px] font-medium select-none ${isLight ? 'text-slate-500' : 'text-white/50'}`} style={{ userSelect: 'none' }}>
        {extension.price}
      </div>
    </button>
  );
}
