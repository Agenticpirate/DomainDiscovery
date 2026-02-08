'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { Badge } from '../ui/Badge';
import { BulkDomainSearchLanding } from './BulkDomainSearchLanding';

const REGISTRARS = [
  { 
    name: 'GoDaddy', 
    getUrl: (d: string) => `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(d)}`,
    logo: 'https://cdn.brandfetch.io/godaddy.com/w/400/h/400/theme/dark/icon.jpeg?t=1734679526802'
  },
  { 
    name: 'Namecheap', 
    getUrl: (d: string) => `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(d)}`,
    logo: 'https://cdn.brandfetch.io/namecheap.com/w/400/h/400/theme/dark/icon.jpeg?t=1734679526802'
  },
  { 
    name: 'Porkbun', 
    getUrl: (d: string) => `https://porkbun.com/checkout/search?q=${encodeURIComponent(d)}`,
    logo: 'https://porkbun.com/favicon.ico'
  },
  { 
    name: 'Cloudflare', 
    getUrl: (d: string) => `https://www.cloudflare.com/products/registrar/`,
    logo: 'https://cdn.brandfetch.io/cloudflare.com/w/400/h/400/theme/dark/icon.jpeg?t=1734679526802'
  },
  { 
    name: 'Google Domains', 
    getUrl: (d: string) => `https://domains.google.com/registrar/search?searchTerm=${encodeURIComponent(d)}`,
    logo: 'https://www.gstatic.com/images/branding/product/1x/domains_48dp.png'
  },
];

interface DomainTag { domain: string; status: 'checking' | 'available' | 'taken' | 'premium' | 'error'; price?: string; }
type FilterType = 'all' | 'available' | 'taken' | 'premium';

const ActionDropdown: React.FC<{ domain: string; available: boolean }> = ({ domain, available }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-1">
        {available ? (
          <>
            <Button onClick={() => window.open(REGISTRARS[0].getUrl(domain), '_blank')} variant="primary" size="sm" className="text-[11px] px-2 py-0.5">Register</Button>
            <button onClick={() => setOpen(!open)} className="p-1 text-neutral-600 hover:text-neutral-400 rounded hover:bg-neutral-800">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </>
        ) : (
          <Button onClick={() => window.open(`https://who.is/whois/${domain}`, '_blank')} variant="ghost" size="sm" className="text-[11px] px-2 py-0.5">WHOIS</Button>
        )}
      </div>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50 py-2">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40 border-b border-white/5 mb-1">Register at:</div>
          {REGISTRARS.map(r => (
            <a 
              key={r.name} 
              href={r.getUrl(domain)} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors" 
              onClick={() => setOpen(false)}
            >
              <img 
                src={r.logo} 
                alt={r.name} 
                className="w-5 h-5 rounded object-contain bg-white/5 p-0.5" 
                onError={(e) => { 
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-5 h-5 rounded bg-white/10 flex items-center justify-center text-[8px] font-bold text-white/40';
                  fallback.textContent = r.name.charAt(0);
                  target.parentNode?.insertBefore(fallback, target);
                }} 
              />
              <span>{r.name}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const checkDomainsInstant = async (domains: string[], onResult: (d: string, a: boolean, p?: boolean) => void): Promise<void> => {
  try {
    const res = await fetch('/api/domains/instant-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domains }) });
    if (res.ok) { const data = await res.json(); for (const r of data) onResult(r.domain, r.available, r.premium); return; }
  } catch (e) { console.error(e); }
  for (const d of domains) onResult(d, false);
};

function getPrice(tld: string): string {
  const p: Record<string, string> = { com: '$12.99', net: '$14.99', org: '$13.99', ai: '$89.99', io: '$49.99', co: '$29.99', app: '$19.99', dev: '$15.99', xyz: '$9.99', tech: '$39.99' };
  return p[tld] || '$19.99';
}

// Results View Component
const ResultsView: React.FC<{
  domains: DomainTag[];
  filter: FilterType;
  setFilter: (f: FilterType) => void;
  sortAZ: boolean;
  setSortAZ: (v: boolean) => void;
  tldFilter: string[];
  setTldFilter: (v: string[]) => void;
  showTlds: boolean;
  setShowTlds: (v: boolean) => void;
  progress: { done: number; total: number };
  reset: () => void;
  exportCSV: () => void;
  exportPDF: () => void;
}> = ({ domains, filter, setFilter, sortAZ, setSortAZ, tldFilter, setTldFilter, showTlds, setShowTlds, progress, reset, exportCSV, exportPDF }) => {
  const tlds = Array.from(new Set(domains.map(d => d.domain.split('.').pop() || ''))).sort();
  
  const filtered = useCallback(() => {
    let list = [...domains];
    if (filter === 'available') list = list.filter(d => d.status === 'available');
    else if (filter === 'taken') list = list.filter(d => d.status === 'taken');
    else if (filter === 'premium') list = list.filter(d => d.status === 'premium');
    if (tldFilter.length) list = list.filter(d => tldFilter.includes(d.domain.split('.').pop() || ''));
    list.sort((a, b) => sortAZ ? a.domain.localeCompare(b.domain) : a.domain.length - b.domain.length);
    return list;
  }, [domains, filter, tldFilter, sortAZ]);

  const results = filtered();
  const counts = { 
    all: domains.length, 
    available: domains.filter(d => d.status === 'available').length, 
    taken: domains.filter(d => d.status === 'taken').length, 
    premium: domains.filter(d => d.status === 'premium').length, 
    checking: domains.filter(d => d.status === 'checking').length 
  };

  return (
    <div className="flex gap-6 w-full max-w-7xl mx-auto">
      {/* Sidebar */}
      <div className="w-48 shrink-0 space-y-6">
        <Button onClick={reset} variant="ghost" size="sm" className="justify-start gap-2 -ml-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          New bulk search
        </Button>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Display</div>
          {[
            { k: 'all', l: 'All domains', c: counts.all, color: 'bg-white/20' },
            { k: 'available', l: 'Available', c: counts.available, color: 'bg-emerald-500' },
            { k: 'taken', l: 'Taken', c: counts.taken, color: 'bg-red-500/60' },
            { k: 'premium', l: 'Premium', c: counts.premium, color: 'bg-amber-500' },
          ].map(x => (
            <button
              key={x.k}
              onClick={() => setFilter(x.k as FilterType)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${filter === x.k ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${x.color}`} />
                {x.l}
              </span>
              <span className="text-xs text-white/40">{x.c}</span>
            </button>
          ))}
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Filters</div>
          <button onClick={() => setShowTlds(!showTlds)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
            <span>TLDs</span>
            {tldFilter.length > 0 && <Badge variant="success" size="sm">{tldFilter.length}</Badge>}
          </button>
          {showTlds && tlds.length > 0 && (
            <div className="pl-4 py-2 space-y-1 border-l border-white/10 ml-3 mt-2">
              {tlds.map(t => (
                <label key={t} className="flex items-center gap-2 text-xs text-white/50 cursor-pointer hover:text-white">
                  <input type="checkbox" checked={tldFilter.includes(t)} onChange={e => setTldFilter(e.target.checked ? [...tldFilter, t] : tldFilter.filter(x => x !== t))} className="w-3 h-3 rounded border-white/20 bg-transparent text-emerald-500 focus:ring-0" />
                  .{t}
                </label>
              ))}
            </div>
          )}
          <button onClick={() => setSortAZ(!sortAZ)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
            Sort: {sortAZ ? 'A-Z' : 'Length'}
          </button>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Actions</div>
          <p className="text-xs text-white/40 mb-3 italic">Click domain names to register</p>
          <Button onClick={reset} variant="ghost" size="sm" className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Reset
          </Button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-white/50">{results.length} domains</span>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-emerald-400">{counts.available} available</span>
            <span className="text-white/40">{counts.taken} taken</span>
          </div>
        </div>

        {counts.checking > 0 && (
          <div className="h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300" style={{ width: `${(progress.done / Math.max(progress.total, 1)) * 100}%` }} />
          </div>
        )}

        <div 
          className="grid grid-cols-2 gap-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 select-none"
          onContextMenu={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
        >
          {results.map(d => (
            <div key={d.domain} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg hover:border-white/10 hover:bg-white/[0.04] transition-all group">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  d.status === 'checking' ? 'bg-white/40 animate-pulse' :
                  d.status === 'available' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse' : 
                  d.status === 'premium' ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse' : 
                  'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.6)]'
                }`} />
                <a 
                  href={`https://www.godaddy.com/domainsearch/find?domainToCheck=${d.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm truncate text-white/90 hover:text-emerald-400 transition-colors cursor-pointer"
                  title="Register on GoDaddy"
                >
                  {d.domain}
                </a>
                {d.status === 'premium' && <Badge variant="warning" size="sm">Premium</Badge>}
                {d.price && <span className="text-white/50 text-xs font-medium">{d.price}</span>}
              </div>
              <ActionDropdown domain={d.domain} available={d.status === 'available' || d.status === 'premium'} />
            </div>
          ))}
        </div>
        {results.length === 0 && <div className="text-center py-16 text-white/40">No domains match your filter</div>}
      </div>
    </div>
  );
};

export const BulkDomainSearch: React.FC<{ onSelect?: (d: string) => void }> = () => {
  const [input, setInput] = useState('');
  const [domains, setDomains] = useState<DomainTag[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortAZ, setSortAZ] = useState(true);
  const [tldFilter, setTldFilter] = useState<string[]>([]);
  const [showTlds, setShowTlds] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [checking, setChecking] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const fileRef = useRef<HTMLInputElement>(null);
  const checkRef = useRef(false);

  // Prevent context menu on domain names
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('select-none') || target.closest('.select-none')) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', preventContextMenu);
    return () => document.removeEventListener('contextmenu', preventContextMenu);
  }, []);

  const parse = (t: string) => {
    const out: string[] = [];
    for (let l of t.split(/[\n,;\s]+/).map(x => x.trim().toLowerCase())) {
      if (!l) continue;
      l = l.replace(/^https?:\/\//, '').split('/')[0];
      if (!/\.[a-z]{2,}$/.test(l)) l += '.com';
      if (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/.test(l) && !out.includes(l)) out.push(l);
    }
    return out.slice(0, 1000);
  };

  const add = useCallback((t: string) => {
    const names = parse(t), existing = domains.map(d => d.domain);
    const newOnes: DomainTag[] = names.filter(n => !existing.includes(n)).map(d => ({ domain: d, status: 'checking' }));
    if (newOnes.length) { setDomains([...domains, ...newOnes].slice(0, 1000)); checkBg(newOnes.map(d => d.domain)); }
  }, [domains]);

  const checkBg = async (list: string[]) => {
    if (checkRef.current) return;
    checkRef.current = true; setChecking(true); setProgress({ done: 0, total: list.length });
    let done = 0;
    await checkDomainsInstant(list, (d, a, p) => {
      done++; setProgress(x => ({ ...x, done }));
      setDomains(prev => prev.map(x => x.domain === d ? { ...x, status: p ? 'premium' : a ? 'available' : 'taken', price: a ? getPrice(d.split('.').pop() || 'com') : undefined } : x));
    });
    checkRef.current = false; setChecking(false);
  };

  const reset = () => { setDomains([]); setShowResults(false); setInput(''); setFilter('all'); setSortAZ(true); setTldFilter([]); setShowTlds(false); setProgress({ done: 0, total: 0 }); checkRef.current = false; setChecking(false); };

  const exportCSV = () => {
    const csv = ['Domain,Status,Price', ...domains.map(d => `${d.domain},${d.status},${d.price || ''}`)].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `domains-${Date.now()}.csv`; a.click();
  };

  const exportPDF = () => {
    // Create a simple HTML structure for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Domain Search Results</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; background: #fff; color: #000; }
          h1 { color: #000; margin-bottom: 10px; }
          .meta { color: #666; margin-bottom: 30px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: bold; }
          td { padding: 10px 12px; border-bottom: 1px solid #eee; }
          .available { color: #10b981; font-weight: bold; }
          .taken { color: #ef4444; }
          .premium { color: #f59e0b; font-weight: bold; }
          .checking { color: #6b7280; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <h1>Domain Search Results</h1>
        <div class="meta">
          Generated on ${new Date().toLocaleString()}<br>
          Total Domains: ${domains.length} | Available: ${counts.available} | Taken: ${counts.taken}
        </div>
        <table>
          <thead>
            <tr>
              <th>Domain Name</th>
              <th>Status</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${domains.map(d => `
              <tr>
                <td>${d.domain}</td>
                <td class="${d.status}">${d.status.toUpperCase()}</td>
                <td>${d.price || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          Report generated by DomainsDiscovery.com
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `domains-report-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const counts = { all: domains.length, available: domains.filter(d => d.status === 'available').length, taken: domains.filter(d => d.status === 'taken').length, premium: domains.filter(d => d.status === 'premium').length, checking: domains.filter(d => d.status === 'checking').length };

  // Show results view
  if (showResults) {
    return <ResultsView domains={domains} filter={filter} setFilter={setFilter} sortAZ={sortAZ} setSortAZ={setSortAZ} tldFilter={tldFilter} setTldFilter={setTldFilter} showTlds={showTlds} setShowTlds={setShowTlds} progress={progress} reset={reset} exportCSV={exportCSV} exportPDF={exportPDF} />;
  }

  // File upload handler
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => add(ev.target?.result as string);
    reader.readAsText(file);
  };

  // Landing Page View - Show the new enhanced landing page with search functionality
  return (
    <BulkDomainSearchLanding 
      onStartSearch={() => setShowResults(true)}
      input={input}
      setInput={setInput}
      domains={domains}
      setDomains={setDomains}
      onAdd={add}
      onCheck={() => domains.length > 0 && setShowResults(true)}
      onReset={reset}
      onFileUpload={handleFileUpload}
      checking={checking}
      progress={progress}
      counts={counts}
    />
  );
};
