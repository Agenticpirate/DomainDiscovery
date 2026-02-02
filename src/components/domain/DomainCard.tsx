import React from 'react';
import { Button } from '../ui/Button';

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
  return (
    <div className="relative glass-card p-6 border-white/10 hover:border-white/20 transition-all duration-500 group overflow-hidden">
      {/* Subtle white glow on hover */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-all duration-500" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold font-mono tracking-tight group-hover:text-white transition-colors mb-1">
              {result.domain}
            </h3>
            <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">
              Standard Registry
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              result.available
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-white/5 text-white/40 border border-white/10'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${result.available ? 'bg-emerald-400 animate-pulse' : 'bg-white/40'}`} />
            {result.available ? 'Available' : 'Taken'}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">
              Est. Value
            </p>
            <p className="text-2xl font-black text-white">
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
