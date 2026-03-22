'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';

interface DomainResult {
  domain: string;
  available: boolean;
  tld: string;
  price?: string;
  registrar?: string;
  premium?: boolean;
  seo?: {
    traffic?: number;
    backlinks?: number;
    authority?: number;
  };
}

interface DomainResultsListProps {
  results: DomainResult[];
  isLoading?: boolean;
  onRegister?: (domain: string) => void;
  onViewDetails?: (domain: string) => void;
}

export function DomainResultsList({
  results,
  isLoading = false,
  onRegister,
  onViewDetails,
}: DomainResultsListProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className={`inline-flex items-center gap-2 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
          <div className={`w-2 h-2 rounded-full ${isLight ? 'bg-slate-400' : 'bg-white/40'} animate-pulse`} />
          <span className="text-sm">Searching across 1,600+ extensions...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 animate-fade-in">
      {results.map((result, i) => (
        <div
          key={i}
          className={`glass-card p-3 ${isLight ? 'border-slate-200 hover:border-slate-300' : 'border-white/10 hover:border-white/20'} transition-all duration-300 group animate-fade-in`}
          style={{ animationDelay: `${i * 30}ms` }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="font-mono font-bold text-base sm:text-lg truncate">{result.domain}</div>
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                  result.available
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : `${isLight ? 'bg-slate-100' : 'bg-white/5'} ${isLight ? 'text-slate-500' : 'text-white/40'} border ${isLight ? 'border-slate-200' : 'border-white/10'}`
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${result.available ? 'bg-emerald-400' : isLight ? 'bg-slate-400' : 'bg-white/40'}`} />
                {result.available ? 'Available' : 'Taken'}
              </div>
              {result.premium && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Premium
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {result.available && result.price && (
                <div className="text-right">
                  <span className={`${isLight ? 'text-slate-600' : 'text-white/60'} font-semibold`}>{result.price}</span>
                  {result.registrar && (
                    <div className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-white/30'} uppercase tracking-wider`}>{result.registrar}</div>
                  )}
                </div>
              )}
              {result.seo && (
                <div className={`hidden lg:flex items-center gap-3 text-xs ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                  {result.seo.traffic && (
                    <div className="flex items-center gap-1">
                      <span className={isLight ? 'text-slate-300' : 'text-white/20'}>👁</span>
                      <span>{result.seo.traffic}</span>
                    </div>
                  )}
                  {result.seo.backlinks && (
                    <div className="flex items-center gap-1">
                      <span className={isLight ? 'text-slate-300' : 'text-white/20'}>🔗</span>
                      <span>{result.seo.backlinks}</span>
                    </div>
                  )}
                </div>
              )}
              <Button
                variant={result.available ? 'primary' : 'secondary'}
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => result.available ? onRegister?.(result.domain) : onViewDetails?.(result.domain)}
              >
                {result.available ? 'Register' : 'Details'}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
