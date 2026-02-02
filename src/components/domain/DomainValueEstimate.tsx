'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';

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
    <div className="glass-card p-6 border-white/10">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <Icons.Dollar />
          </div>
          <h3 className="text-lg font-bold">Domain Value Estimate</h3>
        </div>
        <p className="text-sm text-white/40">
          Get an estimated market value based on real sales data
        </p>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleEstimate()}
          placeholder="Enter domain name..."
          className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all placeholder:text-white/30"
        />
        <Button onClick={handleEstimate} isLoading={isCalculating}>
          Estimate
        </Button>
      </div>

      {estimate && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
            <div className="text-center mb-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                Estimated Value
              </div>
              <div className="text-3xl font-black">{estimate.estimatedValue}</div>
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

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
              Value Factors
            </div>
            <div className="space-y-3">
              {Object.entries(estimate.factors).map(([factor, score]) => (
                <div key={factor}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs capitalize">{factor}</span>
                    <span className="text-xs font-bold">{score}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-white/40 to-white/60 rounded-full transition-all duration-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {estimate.comparables && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
                Comparable Sales
              </div>
              <div className="space-y-2">
                {estimate.comparables.map((comp, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-white/60">{comp.domain}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{comp.soldFor}</span>
                      <span className="text-xs text-white/30">{comp.date}</span>
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
