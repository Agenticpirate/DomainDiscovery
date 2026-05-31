'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';

interface WHOISData {
  domain: string;
  registrar: string;
  registrationDate: string;
  expirationDate: string;
  status: string;
  nameServers: string[];
  registrant?: {
    organization?: string;
    country?: string;
  };
}

interface WHOISLookupProps {
  domain?: string;
  /** Show the internal title + subtitle. Off by default since callers provide a page heading. */
  showHeading?: boolean;
}

export function WHOISLookup({ domain: initialDomain, showHeading = false }: WHOISLookupProps) {
  const [domain, setDomain] = useState(initialDomain || '');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<WHOISData | null>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleLookup = async () => {
    if (!domain.trim()) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setData({
      domain: domain,
      registrar: 'GoDaddy.com, LLC',
      registrationDate: '2015-03-15',
      expirationDate: '2026-03-15',
      status: 'clientTransferProhibited',
      nameServers: ['ns1.foundersPrime.com', 'ns2.foundersPrime.com'],
      registrant: {
        organization: 'Privacy Protected',
        country: 'US',
      },
    });
    
    setIsLoading(false);
  };

  return (
    <div className={`glass-card p-3.5 sm:p-4 ${isLight ? 'border-slate-200 shadow-sm' : 'border-white/10'}`}>
      {showHeading && (
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border border-white/10'}`}>
              <Icons.Info />
            </div>
            <h3 className="text-lg font-bold">WHOIS Lookup</h3>
          </div>
          <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
            Get domain ownership and registration details instantly
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-5">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          placeholder="Enter domain name..."
          className={`flex-1 ${isLight ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20' : 'bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-white/30 focus:ring-white/10'} border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 transition-all`}
        />
        <Button onClick={handleLookup} isLoading={isLoading} className="w-full sm:w-auto">
          Lookup
        </Button>
      </div>

      {data && (
        <div className="space-y-4 animate-fade-in">
          <div className={`p-3.5 sm:p-4 rounded-xl ${isLight ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/[0.06]' : 'bg-white/[0.02] border border-white/10 hover:border-white/20'} border`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-white/40'} mb-1`}>
                  Registrar
                </div>
                <div className="text-sm font-semibold break-words">{data.registrar}</div>
              </div>
              <div>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-white/40'} mb-1`}>
                  Status
                </div>
                <div className="text-sm font-semibold break-words">{data.status}</div>
              </div>
              <div>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-white/40'} mb-1`}>
                  Registered
                </div>
                <div className="text-sm font-semibold">{data.registrationDate}</div>
              </div>
              <div>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-white/40'} mb-1`}>
                  Expires
                </div>
                <div className="text-sm font-semibold">{data.expirationDate}</div>
              </div>
            </div>
          </div>

          <div className={`p-3.5 sm:p-4 rounded-xl ${isLight ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/[0.06]' : 'bg-white/[0.02] border border-white/10 hover:border-white/20'} border`}>
            <div className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-white/40'} mb-2`}>
              Name Servers
            </div>
            <div className="space-y-1">
              {data.nameServers.map((ns, i) => (
                <div key={i} className={`text-sm font-mono break-all ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                  {ns}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
