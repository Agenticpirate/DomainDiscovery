
import React from 'react';
import { DomainResult } from '../../types';
import { Button } from '../ui/Button';

interface DomainCardProps {
  result: DomainResult;
}

export const DomainCard: React.FC<DomainCardProps> = ({ result }) => {
  return (
    <div className="glass-card p-6 border-white/5 hover:border-white/20 transition-all duration-500 group">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold font-mono tracking-tight group-hover:text-white transition-colors">
            {result.domain}
          </h3>
          <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-bold">Standard Registry</p>
        </div>
        <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
          result.available 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-white/5 text-white/40 border border-white/5'
        }`}>
          {result.available ? 'Available' : 'Taken'}
        </div>
      </div>
      
      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Est. Value</p>
          <p className="text-lg font-bold text-white">
            {result.available ? result.price : '—'}
          </p>
        </div>
        
        {result.available ? (
          <Button variant="primary" size="sm">
            Buy
          </Button>
        ) : (
          <Button variant="secondary" size="sm">
            Details
          </Button>
        )}
      </div>
    </div>
  );
};
