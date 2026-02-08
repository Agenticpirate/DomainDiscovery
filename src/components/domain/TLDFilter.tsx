'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface TLD {
  extension: string;
  price: string;
  popular?: boolean;
}

interface TLDFilterProps {
  onSelect?: (tlds: string[]) => void;
}

const POPULAR_TLDS: TLD[] = [
  { extension: '.com', price: '$12.99', popular: true },
  { extension: '.net', price: '$14.99', popular: true },
  { extension: '.org', price: '$13.99', popular: true },
  { extension: '.ai', price: '$89.99', popular: true },
  { extension: '.io', price: '$49.99', popular: true },
  { extension: '.co', price: '$29.99', popular: true },
  { extension: '.app', price: '$19.99' },
  { extension: '.dev', price: '$15.99' },
  { extension: '.xyz', price: '$9.99' },
  { extension: '.shop', price: '$24.99' },
  { extension: '.tech', price: '$39.99' },
  { extension: '.online', price: '$29.99' },
];

export function TLDFilter({ onSelect }: TLDFilterProps) {
  const [selectedTLDs, setSelectedTLDs] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const toggleTLD = (tld: string) => {
    const updated = selectedTLDs.includes(tld)
      ? selectedTLDs.filter((t) => t !== tld)
      : [...selectedTLDs, tld];
    setSelectedTLDs(updated);
    onSelect?.(updated);
  };

  const displayTLDs = showAll ? POPULAR_TLDS : POPULAR_TLDS.filter((t) => t.popular);

  return (
    <div className={`glass-card p-6 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-bold uppercase tracking-widest ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
          Filter by Extension
        </h3>
        <button
          onClick={() => setShowAll(!showAll)}
          className={`text-xs ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-white/40 hover:text-white'} transition-colors`}
        >
          {showAll ? 'Show Less' : 'Show All 1,600+'}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {displayTLDs.map((tld) => (
          <button
            key={tld.extension}
            onClick={() => toggleTLD(tld.extension)}
            className={`px-3 py-2 rounded-full text-xs font-mono font-bold transition-all ${
              selectedTLDs.includes(tld.extension)
                ? 'bg-white text-black'
                : `${isLight ? 'bg-slate-100' : 'bg-white/5'} border ${isLight ? 'border-slate-200' : 'border-white/10'} ${isLight ? 'text-slate-600' : 'text-white/60'} ${isLight ? 'hover:bg-slate-200' : 'hover:bg-white/10'}`
            }`}
          >
            <span>{tld.extension}</span>
            <span className="ml-2 text-[10px] opacity-60">{tld.price}</span>
          </button>
        ))}
      </div>
      {selectedTLDs.length > 0 && (
        <button
          onClick={() => {
            setSelectedTLDs([]);
            onSelect?.([]);
          }}
          className={`mt-4 text-xs ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-white/40 hover:text-white'} transition-colors`}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
