'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface Registrar {
  name: string;
  price: string;
  priceValue: number;
  features?: string[];
  recommended?: boolean;
}

interface PriceComparisonProps {
  domain: string;
  registrars?: Registrar[];
}

const DEFAULT_REGISTRARS: Registrar[] = [
  {
    name: 'Namecheap',
    price: '$10.98',
    priceValue: 10.98,
    features: ['Free WHOIS privacy', 'Free SSL'],
    recommended: true,
  },
  {
    name: 'GoDaddy',
    price: '$12.99',
    priceValue: 12.99,
    features: ['24/7 Support'],
  },
  {
    name: 'Google Domains',
    price: '$12.00',
    priceValue: 12.0,
    features: ['Free privacy', 'Email forwarding'],
  },
  {
    name: 'Hover',
    price: '$14.99',
    priceValue: 14.99,
    features: ['Clean interface', 'No upsells'],
  },
];

export function PriceComparison({ domain, registrars = DEFAULT_REGISTRARS }: PriceComparisonProps) {
  const sortedRegistrars = [...registrars].sort((a, b) => a.priceValue - b.priceValue);

  return (
    <div className="glass-card p-6 border-white/10">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-1">Price Comparison</h3>
        <p className="text-sm text-white/40">
          Compare prices for <span className="font-mono text-white/60">{domain}</span>
        </p>
      </div>

      <div className="space-y-3">
        {sortedRegistrars.map((registrar, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl border transition-all ${
              registrar.recommended
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-white/[0.02] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-bold">{registrar.name}</span>
                {registrar.recommended && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    Best Value
                  </span>
                )}
              </div>
              <span className="text-lg font-bold">{registrar.price}</span>
            </div>
            {registrar.features && (
              <div className="flex flex-wrap gap-2 mb-3">
                {registrar.features.map((feature, j) => (
                  <span key={j} className="text-xs text-white/40">
                    • {feature}
                  </span>
                ))}
              </div>
            )}
            <Button
              variant={registrar.recommended ? 'primary' : 'secondary'}
              size="sm"
              className="w-full"
            >
              Buy at {registrar.name}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
