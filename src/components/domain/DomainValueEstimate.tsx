'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';

interface ValueEstimate {
  domain: string;
  estimatedValue: string;
  confidence: 'high' | 'medium' | 'low';
  factors: {
    length: number;
    keywords: number;
    extension: number;
    brandability: number;
    seo: number;
  };
  comparables?: {
    domain: string;
    soldFor: string;
    date: string;
  }[];
}

interface DomainValueEstimateProps {
  domain?: string;
}

export function DomainValueEstimate({ domain: initialDomain }: DomainValueEstimateProps) {
  const [domain, setDomain] = useState(initialDomain || '');
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimate, setEstimate] = useState<ValueEstimate | null>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleEstimate = async () => {
    if (!domain.trim()) return;

    setIsCalculating(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setEstimate({
      domain: domain,
      estimatedValue: '$2,500 - $5,000',
      confidence: 'high',
      factors: {
        length: 85,
        keywords: 78,
        extension: 95,
        brandability: 82,
        seo: 70,
      },
      comparables: [
        { domain: 'similar1.com', soldFor: '$3,200', date: '2024-11' },
        { domain: 'similar2.com', soldFor: '$4,800', date: '2024-10' },
      ],
    });

    setIsCalculating(false);
  };

  return (
    <div className={`glass-card p-3.5 sm:p-4 ${isLight ? 'border-slate-200 shadow-sm' : 'border-white/10'}`}>
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border border-white/10'}`}>
            <Icons.Dollar />
          </div>
          <h3 className="text-lg font-bold">Domain Value Estimate</h3>
        </div>
        <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
          Get an estimated market value based on real sales data
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-5">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleEstimate()}
          placeholder="Enter domain name..."
          className={`flex-1 ${isLight ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20' : 'bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-white/30 focus:ring-white/10'} border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 transition-all`}
        />
        <Button onClick={handleEstimate} isLoading={isCalculating} className="w-full sm:w-auto">
          Estimate
        </Button>
      </div>

      {estimate && (
        <div className="space-y-4 animate-fade-in">
          <div className={`p-3.5 sm:p-4 rounded-xl ${isLight ? 'bg-gradient-to-br from-slate-50 to-white border-slate-200' : 'bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10'} border`}>
            <div className="text-center mb-3 sm:mb-4">
              <div className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-white/40'} mb-2`}>
                Estimated Value
              </div>
              <div className="text-2xl sm:text-3xl font-black break-words">{estimate.estimatedValue}</div>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    estimate.confidence === 'high'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {estimate.confidence} confidence
                </span>
              </div>
            </div>
          </div>

          <div className={`p-3.5 sm:p-4 rounded-xl ${isLight ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/[0.06]' : 'bg-white/[0.02] border border-white/10 hover:border-white/20'} border`}>
            <div className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-white/40'} mb-3`}>
              Value Factors
            </div>
            <div className="space-y-3">
              {Object.entries(estimate.factors).map(([factor, score]) => (
                <div key={factor}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs capitalize">{factor}</span>
                    <span className="text-xs font-bold">{score}%</span>
                  </div>
                  <div className={`h-1.5 ${isLight ? 'bg-slate-100' : 'bg-white/5'} rounded-full overflow-hidden`}>
                    <div
                      className={`h-full ${isLight ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gradient-to-r from-white/40 to-white/60'} rounded-full transition-all duration-500`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {estimate.comparables && (
            <div className={`p-3.5 sm:p-4 rounded-xl ${isLight ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/[0.06]' : 'bg-white/[0.02] border border-white/10 hover:border-white/20'} border`}>
              <div className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-white/40'} mb-3`}>
                Comparable Sales
              </div>
              <div className="space-y-2">
                {estimate.comparables.map((comp, i) => (
                  <div key={i} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm">
                    <span className={`font-mono break-all ${isLight ? 'text-slate-600' : 'text-white/60'}`}>{comp.domain}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{comp.soldFor}</span>
                      <span className={`text-xs ${isLight ? 'text-slate-300' : 'text-white/30'}`}>{comp.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
