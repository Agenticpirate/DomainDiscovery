'use client';

import React from 'react';
import { Button } from '../ui/Button';
import { useTheme } from '@/contexts/ThemeContext';

interface DomainResult {
  domain: string;
  available: boolean;
  tld: string;
  price?: string;
}

interface DomainCardProps {
  result: DomainResult;
}

export const DomainCard: React.FC<DomainCardProps> = ({ result }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`relative glass-card shine-border p-6 ${isLight ? 'border-slate-200' : 'border-white/10'} transition-all duration-500 group overflow-hidden`}>
      {/* Subtle white glow on hover */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-all duration-500" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className={`text-xl font-bold font-mono tracking-tight group-hover:${isLight ? 'text-slate-900' : 'text-white'} transition-colors mb-1`}>
              {result.domain}
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/40'} uppercase tracking-widest font-semibold`}>
              Standard Registry
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              result.available
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : `${isLight ? 'bg-slate-100' : 'bg-white/5'} ${isLight ? 'text-slate-500' : 'text-white/40'} border ${isLight ? 'border-slate-200' : 'border-white/10'}`
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${result.available ? 'bg-emerald-400 animate-pulse' : isLight ? 'bg-slate-400' : 'bg-white/40'}`} />
            {result.available ? 'Available' : 'Taken'}
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px bg-gradient-to-r from-transparent ${isLight ? 'via-slate-200' : 'via-white/10'} to-transparent mb-6`} />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-white/40'} uppercase font-bold tracking-widest mb-1`}>
              Est. Value
            </p>
            <p className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {result.available ? result.price || '$12.99' : '—'}
            </p>
          </div>

          <Button 
            variant={result.available ? 'primary' : 'secondary'} 
            size="sm"
            className="group-hover:scale-105 transition-transform"
          >
            {result.available ? 'Register' : 'Details'}
          </Button>
        </div>
      </div>
    </div>
  );
};
