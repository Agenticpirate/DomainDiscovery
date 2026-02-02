'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Icons } from '@/components/ui/Icons';
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

// Check domains using the instant-check API
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
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [extensions, setExtensions] = useState<Extension[]>(() => 
    EXTENSIONS_BASE_DATA.map(ext => ({ ...ext, available: null, checking: false }))
  );
  const [isChecking, setIsChecking] = useState(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchRef = useRef<string>('');

  // Debounced availability check
  const checkAvailability = useCallback(async (keyword: string) => {
    if (!keyword.trim() || keyword === lastSearchRef.current) return;
    
    lastSearchRef.current = keyword;
    const cleanKeyword = keyword.toLowerCase().replace(/\s+/g, '').replace(/^\./, '');
    
    if (!cleanKeyword) {
      setExtensions(EXTENSIONS_BASE_DATA.map(ext => ({ ...ext, available: null, checking: false })));
      return;
    }

    // Set all to checking state
    setExtensions(prev => prev.map(ext => ({ ...ext, checking: true, available: null })));
    setIsChecking(true);

    // Build domain list
    const domainsToCheck = EXTENSIONS_BASE_DATA.map(ext => `${cleanKeyword}${ext.tld}`);
    
    // Check in batches of 50
    const batchSize = 50;
    const results = new Map<string, { available: boolean; premium?: boolean }>();
    
    for (let i = 0; i < domainsToCheck.length; i += batchSize) {
      const batch = domainsToCheck.slice(i, i + batchSize);
      const batchResults = await checkDomainsAvailability(batch);
      batchResults.forEach((value, key) => results.set(key, value));
      
      // Update UI with batch results
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

  // Trigger check when search query changes
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

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...Array.from(new Set(EXTENSIONS_BASE_DATA.map(ext => ext.category)))];
    return cats;
  }, []);

  // Filter extensions
  const filteredExtensions = useMemo(() => {
    let filtered = extensions;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(ext => ext.category === selectedCategory);
    }

    // Filter by extension name/description (not by keyword search)
    const query = (localSearch || searchQuery).toLowerCase().trim();
    if (query && !isChecking) {
      // Only filter by TLD or name if not actively checking availability
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

  // Group by category
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
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
            <Icons.Search />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Type a keyword to check availability across all extensions..."
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-12 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Extensions Grid */}
      {Object.keys(groupedExtensions).length === 0 ? (
        <div className="text-center py-20">
          <div className="text-white/20 mb-4 flex justify-center">
            <Icons.Search />
          </div>
          <p className="text-white/40">No extensions found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedExtensions).map(([category, exts]) => (
            <div key={category}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>{category}</span>
                <span className="text-xs text-white/40 font-normal">({exts.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
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
  const handleClick = () => {
    if (!searchQuery.trim()) {
      return;
    }
    
    // If available, open registrar with the actual domain
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
    return 'bg-white/20';
  };

  const showStatus = searchQuery.trim() !== '';

  return (
    <button
      onClick={handleClick}
      disabled={!searchQuery.trim() || extension.checking}
      className="group relative p-3 bg-[#1a1a1a] border border-white/10 rounded-lg hover:border-white/20 transition-all text-left disabled:cursor-default"
    >
      {/* Status Indicator */}
      {showStatus && (
        <div className="absolute top-2 right-2">
          <span className={`w-2 h-2 rounded-full block ${getStatusColor()}`} />
        </div>
      )}

      <div className="font-mono text-base font-bold mb-1 text-white select-none" style={{ userSelect: 'none' }}>
        {extension.tld}
      </div>
      <div className="text-[10px] text-white/40 mb-1.5 select-none" style={{ userSelect: 'none' }}>
        {extension.name}
      </div>
      <div className="text-xs font-medium text-white/50 select-none" style={{ userSelect: 'none' }}>
        {extension.price}
      </div>
    </button>
  );
}
