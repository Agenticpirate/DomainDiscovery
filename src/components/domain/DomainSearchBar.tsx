'use client';

import React from 'react';
import { Icons } from '@/components/ui/Icons';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';

interface DomainSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
  placeholder?: string;
  showInstantIndicator?: boolean;
}

export function DomainSearchBar({
  value,
  onChange,
  onSearch,
  isLoading = false,
  placeholder = 'Search for your domain name...',
  showInstantIndicator = true,
}: DomainSearchBarProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`glass-card shine-border no-lift p-3 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
      <div className="flex items-center gap-3">
        <div className="relative flex-grow">
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
            <Icons.Search />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder={placeholder}
            className={`w-full bg-transparent border-none py-4 pl-12 pr-4 text-lg focus:outline-none ${isLight ? 'placeholder:text-slate-400 text-slate-900' : 'placeholder:text-white/30 text-white'}`}
            autoFocus
          />
          {showInstantIndicator && value && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className={`text-[10px] font-bold ${isLight ? 'text-slate-300' : 'text-white/20'} uppercase tracking-widest`}>
                Instant
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}
        </div>
        <Button
          size="lg"
          className="relative overflow-hidden group/btn"
          onClick={onSearch}
          isLoading={isLoading}
        >
          <span className="relative z-10">Search</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
        </Button>
      </div>
    </div>
  );
}
