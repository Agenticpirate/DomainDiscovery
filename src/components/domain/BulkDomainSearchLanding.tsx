'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';

// Subtle gradient glow component - more professional look
const GradientGlow: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div 
      className={`absolute rounded-full blur-[100px] ${className}`}
    />
  );
};

// Animated dots grid
const DotsGrid: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`grid grid-cols-8 gap-2 ${className}`}>
      {Array.from({ length: 64 }).map((_, i) => (
        <div 
          key={i} 
          className="w-1.5 h-1.5 rounded-full bg-white/10 animate-pulse"
          style={{ animationDelay: `${i * 50}ms` }}
        />
      ))}
    </div>
  );
};

// Feature card with hover animation
const FeatureCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay?: number;
}> = ({ icon, title, description, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div 
      ref={ref}
      className={`group p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-500 cursor-pointer transform ${
        isLight ? 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/[0.06]' : 'bg-white/[0.02] border border-white/10 hover:border-slate-400/30 hover:bg-white/[0.04]'
      } ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 ${isLight ? 'bg-gradient-to-br from-blue-100 to-indigo-100' : 'bg-gradient-to-br from-slate-400/20 to-slate-500/20'}`}>
        {icon}
      </div>
      <h3 className={`font-semibold text-sm sm:text-lg mb-1 sm:mb-2 transition-colors ${isLight ? 'group-hover:text-blue-600' : 'group-hover:text-slate-300'}`}>{title}</h3>
      <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{description}</p>
    </div>
  );
};

// Step card component
const StepCard: React.FC<{ 
  number: string; 
  title: string; 
  description: string;
  isLast?: boolean;
}> = ({ number, title, description, isLast = false }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`relative group rounded-2xl border p-4 sm:p-5 ${isLight ? 'border-slate-200 bg-white/80 shadow-sm' : 'border-white/10 bg-white/[0.02]'}`}>
      <div className={`absolute right-3 top-2 text-5xl sm:text-6xl font-black transition-colors duration-500 ${isLight ? 'text-slate-100 group-hover:text-blue-100' : 'text-white/[0.03] group-hover:text-slate-400/10'}`}>
        {number}
      </div>
      <div className="relative">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-sm font-bold text-white mb-3 shadow-lg shadow-slate-400/20">
          {number}
        </div>
        <h3 className={`text-lg sm:text-[1.15rem] font-bold mb-2 transition-colors ${isLight ? 'group-hover:text-blue-600' : 'group-hover:text-slate-300'}`}>{title}</h3>
        <p className={`text-sm sm:text-[15px] leading-relaxed max-w-[26rem] ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{description}</p>
      </div>
      {!isLast && (
        <div className="hidden md:block absolute top-1/2 left-full w-8 h-px bg-gradient-to-r from-slate-400/30 via-white/10 to-transparent -translate-x-2" />
      )}
    </div>
  );
};

// Industry solution card
const IndustryCard: React.FC<{
  title: string;
  description: string;
  features: string[];
  icon: string;
}> = ({ title, description, features, icon }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`group p-4 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 ${isLight ? 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md' : 'bg-white/[0.02] border border-white/10 hover:border-slate-400/20 hover:bg-white/[0.04]'}`}>
      <div className="flex items-start justify-between mb-2.5 sm:mb-3">
        <div>
          <span className="text-[22px] sm:text-[28px] mb-2 sm:mb-2.5 block">{icon}</span>
          <h3 className={`text-base sm:text-lg font-bold transition-colors ${isLight ? 'text-slate-900 group-hover:text-blue-600' : 'group-hover:text-slate-300'}`}>{title}</h3>
        </div>
        <svg className={`w-5 h-5 group-hover:translate-x-1 transition-all ${isLight ? 'text-slate-300 group-hover:text-blue-500' : 'text-white/20 group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
      <p className={`mb-3 sm:mb-4 leading-relaxed text-[13px] sm:text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{description}</p>
      <div className="flex flex-wrap gap-1.5">
        {features.map((f, i) => (
          <span key={i} className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] transition-colors ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-500 group-hover:border-blue-300' : 'bg-white/5 border border-white/10 text-white/60 group-hover:border-slate-400/20'}`}>
            {f}
          </span>
        ))}
      </div>
    </div>
  );
};

// Expert tip card
const TipCard: React.FC<{
  number: number;
  title: string;
  description: string;
}> = ({ number, title, description }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`group flex gap-4 p-6 rounded-xl transition-all duration-300 ${isLight ? 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/[0.06]' : 'bg-white/[0.02] border border-white/10 hover:border-slate-400/20 hover:bg-white/[0.04]'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isLight ? 'bg-blue-50 group-hover:bg-blue-100' : 'bg-slate-400/10 group-hover:bg-slate-400/20'}`}>
        <span className={`text-sm font-bold ${isLight ? 'text-blue-500' : 'text-slate-300'}`}>{number}</span>
      </div>
      <div>
        <h4 className={`font-semibold mb-2 transition-colors ${isLight ? 'group-hover:text-blue-600' : 'group-hover:text-slate-300'}`}>{title}</h4>
        <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{description}</p>
      </div>
    </div>
  );
};

// Tool link card
const ToolCard: React.FC<{
  href: string;
  icon: string;
  title: string;
  description: string;
}> = ({ href, icon, title, description }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <Link href={href} className={`group block p-4 sm:p-6 rounded-lg sm:rounded-xl transition-all duration-300 ${isLight ? 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/[0.06]' : 'bg-white/[0.02] border border-white/10 hover:border-slate-400/30 hover:bg-white/[0.04]'}`}>
      <div className="text-2xl sm:text-3xl mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className={`font-semibold text-sm sm:text-base mb-1 sm:mb-2 transition-colors ${isLight ? 'group-hover:text-blue-600' : 'group-hover:text-slate-300'}`}>{title}</h3>
      <p className={`text-[10px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{description}</p>
    </Link>
  );
};

// Domain tag type
interface DomainTag { 
  domain: string; 
  status: 'checking' | 'available' | 'taken' | 'premium' | 'error'; 
  price?: string; 
}

interface BulkSearchSnapshot {
  id: string;
  createdAt: number;
  domains: DomainTag[];
}

// Search input section component
const SearchInputSection: React.FC<{
  input: string;
  setInput: (v: string) => void;
  domains: DomainTag[];
  setDomains: React.Dispatch<React.SetStateAction<DomainTag[]>>;
  onAdd: (text: string) => void;
  onCheck: () => void;
  onReset: () => void;
  onFileUpload: (file: File) => void;
  checking: boolean;
  progress: { done: number; total: number };
  counts: { available: number; taken: number; checking: number };
}> = ({ input, setInput, domains, setDomains, onAdd, onCheck, onReset, onFileUpload, checking, progress, counts }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-0">
      <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-white/20 transition-all backdrop-blur-sm ${isLight ? 'bg-white border border-slate-200 shadow-lg shadow-slate-900/[0.04]' : 'bg-white/[0.03] border border-white/10'}`}>
        {domains.length === 0 ? (
          <div className="relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onPaste={e => { e.preventDefault(); onAdd(e.clipboardData.getData('text')); setInput(''); }}
              onKeyDown={e => { if ((e.key === 'Enter' || e.key === ',') && input.trim()) { e.preventDefault(); onAdd(input); setInput(''); } }}
              placeholder="Type some domains..."
              className={`w-full rounded-lg sm:rounded-xl px-3 sm:px-4 py-3 sm:py-4 focus:outline-none focus:ring-2 min-h-[100px] sm:min-h-[140px] resize-none transition-all text-sm sm:text-base ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20' : 'bg-black/30 border border-white/10 text-white placeholder:text-white/30 focus:border-slate-400/50 focus:ring-slate-400/20'}`}
              autoFocus
            />
            <p className={`mt-2 text-[11px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
              Separate domain names with commas.
            </p>
          </div>
        ) : (
          <div className={`flex flex-wrap gap-2 max-h-64 overflow-y-auto p-3 rounded-xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-black/20 border border-white/5'}`}>
            {domains.map(d => (
              <span key={d.domain} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium select-none ${isLight ? 'bg-white text-slate-700 border border-slate-200' : 'bg-white/5 text-white/80 border border-white/10'}`} style={{ userSelect: 'none' }}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  d.status === 'available' ? 'bg-slate-300 shadow-[0_0_8px_rgba(148,163,184,0.6)] animate-pulse' : 
                  d.status === 'taken' ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]' : 
                  d.status === 'premium' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse' : 
                  'bg-white/40 animate-pulse'
                }`} />
                {d.domain}
                <button onClick={() => setDomains(p => p.filter(x => x.domain !== d.domain))} className="hover:opacity-70 ml-1">×</button>
              </span>
            ))}
          </div>
        )}

        {checking && (
          <div className="mt-4 p-3 bg-slate-400/5 rounded-lg border border-slate-400/20">
            <div className="flex justify-between text-sm mb-2">
              <span className={`flex items-center gap-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-pulse" />
                Checking availability...
              </span>
              <span className={`font-mono ${isLight ? 'text-slate-500' : 'text-white/60'}`}>{progress.done}/{progress.total}</span>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-black/30'}`}>
              <div className="h-full bg-gradient-to-r from-slate-400 to-slate-300 transition-all duration-300" style={{ width: `${(progress.done / Math.max(progress.total, 1)) * 100}%` }} />
            </div>
          </div>
        )}

        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-4 sm:mt-6 pt-3 sm:pt-4 border-t gap-3 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={e => { const f = e.target.files?.[0]; if (f) onFileUpload(f); e.target.value = ''; }} className="hidden" />
            <Button onClick={() => fileRef.current?.click()} variant="secondary" size="sm" className="text-xs sm:text-sm">
              <Icons.Upload />
              Import CSV
            </Button>
            {domains.length > 0 && <Button onClick={onReset} variant="ghost" size="sm" className="text-xs sm:text-sm">Clear</Button>}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {domains.length > 0 && <span className={`text-xs sm:text-sm ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{domains.length} domains</span>}
            <Button onClick={onCheck} disabled={!domains.length} isLoading={checking && counts.checking === domains.length} size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
              Search All
            </Button>
          </div>
        </div>
      </div>

      {domains.length > 0 && counts.available > 0 && (
        <p className={`text-sm mt-4 text-center ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>{counts.available} available • {counts.taken} taken</p>
      )}
    </div>
  );
};

// Main landing component
export const BulkDomainSearchLanding: React.FC<{ 
  onStartSearch: () => void;
  input?: string;
  setInput?: (v: string) => void;
  domains?: DomainTag[];
  setDomains?: React.Dispatch<React.SetStateAction<DomainTag[]>>;
  onAdd?: (text: string) => void;
  onCheck?: () => void;
  onReset?: () => void;
  onFileUpload?: (file: File) => void;
  checking?: boolean;
  progress?: { done: number; total: number };
  counts?: { available: number; taken: number; checking: number };
  showSearchInput?: boolean;
  recentSearches?: BulkSearchSnapshot[];
  onLoadPreviousSearch?: (snapshot: BulkSearchSnapshot) => void;
  onDeletePreviousSearch?: (snapshotId: string) => void;
}> = ({ 
  onStartSearch, 
  input = '', 
  setInput = () => {}, 
  domains = [], 
  setDomains = () => {},
  onAdd = () => {},
  onCheck = () => {},
  onReset = () => {},
  onFileUpload = () => {},
  checking = false,
  progress = { done: 0, total: 0 },
  counts = { available: 0, taken: 0, checking: 0 },
  showSearchInput = false,
  recentSearches = [],
  onLoadPreviousSearch = () => {},
  onDeletePreviousSearch = () => {},
}) => {
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToSearch = () => {
    if (searchRef.current) {
      searchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const formatRecentTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getSnapshotCounts = (domainsToCount: DomainTag[]) => ({
    available: domainsToCount.filter((domain) => domain.status === 'available').length,
    premium: domainsToCount.filter((domain) => domain.status === 'premium').length,
    taken: domainsToCount.filter((domain) => domain.status === 'taken').length,
  });

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative text-center pb-6 sm:pb-12 pt-2 sm:pt-6">
        {/* Subtle background gradient - professional look */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-slate-500/[0.07] via-slate-400/[0.05] to-transparent rounded-full blur-3xl" />
          <GradientGlow className="w-[600px] h-[300px] bg-slate-400/[0.08] top-20 left-1/4 -translate-x-1/2" />
          <GradientGlow className="w-[500px] h-[250px] bg-slate-500/[0.06] top-32 right-1/4 translate-x-1/2" />
        </div>

        <div className={`relative transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-2xl sm:text-5xl md:text-7xl font-black tracking-tight mb-2 sm:mb-6">
            <span className={`bg-gradient-to-r bg-clip-text text-transparent ${isLight ? 'from-slate-900 via-slate-800 to-slate-600' : 'from-white via-white to-white/60'}`}>
              Bulk domain search
            </span>
          </h1>
          <p className={`text-sm sm:text-lg md:text-xl max-w-2xl mx-auto mb-4 sm:mb-10 leading-relaxed px-3 sm:px-4 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
            Check availability for up to 1,000 domains at once with instant results. 
            The fastest way to find your perfect domain.
          </p>

          {/* Search Input Section */}
          <div ref={searchRef} className="mb-4 sm:mb-8">
            <SearchInputSection
              input={input}
              setInput={setInput}
              domains={domains}
              setDomains={setDomains}
              onAdd={onAdd}
              onCheck={onCheck}
              onReset={onReset}
              onFileUpload={onFileUpload}
              checking={checking}
              progress={progress}
              counts={counts}
            />
          </div>

          {recentSearches.length > 0 && (
            <div className="mx-auto max-w-5xl px-2 sm:px-0">
              <div className={`rounded-2xl border p-3 sm:p-4 text-left ${isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-white/10 bg-white/[0.03]'}`}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className={`text-sm sm:text-base font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Recent bulk searches</h3>
                    <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                      Resume a previous domain set without pasting the same list again.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={scrollToSearch}
                    className={`text-xs sm:text-sm font-medium ${isLight ? 'text-blue-600 hover:text-blue-700' : 'text-slate-300 hover:text-white'}`}
                  >
                    Add a new list
                  </button>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {recentSearches.slice(0, 6).map((snapshot) => {
                    const snapshotCounts = getSnapshotCounts(snapshot.domains);
                    return (
                      <div
                        key={snapshot.id}
                        className={`rounded-xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50/70' : 'border-white/10 bg-black/20'}`}
                      >
                        <button type="button" onClick={() => onLoadPreviousSearch(snapshot)} className="w-full text-left">
                          <div className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white/90'}`}>
                            {snapshot.domains.length} domains
                          </div>
                          <div className={`mt-1 text-xs ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
                            {snapshotCounts.available} available • {snapshotCounts.premium} premium • {snapshotCounts.taken} taken
                          </div>
                          <div className={`mt-2 text-xs ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                            Saved {formatRecentTime(snapshot.createdAt)}
                          </div>
                        </button>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <Button onClick={() => onLoadPreviousSearch(snapshot)} variant="secondary" size="sm" className="flex-1 text-xs">
                            Load search
                          </Button>
                          <button
                            type="button"
                            onClick={() => onDeletePreviousSearch(snapshot.id)}
                            className={`text-xs ${isLight ? 'text-slate-400 hover:text-red-500' : 'text-white/35 hover:text-red-400'}`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section: The most advanced bulk domain search tool */}
      <section className={`py-8 sm:py-16 border-t relative ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="text-center mb-6 sm:mb-14">
            <h2 className={`text-xl sm:text-3xl md:text-5xl font-black mb-2 sm:mb-6 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              The most advanced bulk<br />domain search tool
            </h2>
            <p className={`max-w-2xl mx-auto text-sm sm:text-lg leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              Check thousands of domains instantly with our powerful bulk search engine. 
              Get real-time availability, pricing, and registration options.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <FeatureCard 
              icon={<svg className={`w-6 h-6 ${isLight ? 'text-blue-500' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              title="Lightning Fast"
              description="Check up to 1,000 domains in seconds with parallel processing technology"
              delay={0}
            />
            <FeatureCard 
              icon={<svg className={`w-6 h-6 ${isLight ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>}
              title="Smart Filtering"
              description="Filter by availability, TLD, price range, and more with advanced options"
              delay={100}
            />
            <FeatureCard 
              icon={<svg className={`w-6 h-6 ${isLight ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              title="CSV Import/Export"
              description="Import domain lists and export results for analysis and sharing"
              delay={200}
            />
            <FeatureCard 
              icon={<svg className={`w-6 h-6 ${isLight ? 'text-blue-500' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              title="Price Comparison"
              description="See pricing across multiple registrars instantly in one view"
              delay={300}
            />
          </div>

          {/* Visual Demo */}
          <div className="mt-8 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-10 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-400/20 to-slate-600/20 rounded-3xl blur-xl" />
              <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 sm:p-8 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-4 right-4">
                  <DotsGrid className="opacity-50" />
                </div>
                
                <div className="space-y-3 relative">
                  {[
                    { domain: 'foundersPrime.com', available: true, price: '$12.99' },
                    { domain: 'yStartups.com', available: false },
                    { domain: 'foundersBlog.com', available: true, price: '$12.99' },
                    { domain: 'startupHub.io', available: false },
                    { domain: 'ventureList.co', available: true, price: '$29.99' },
                  ].map((d, i) => (
                    <div 
                      key={d.domain} 
                      className="flex items-center justify-between p-2.5 sm:p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:border-white/10 transition-all animate-fade-in"
                      style={{ animationDelay: `${i * 150}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-3 h-3 rounded-full ${
                          d.available 
                            ? 'bg-slate-300 shadow-[0_0_12px_rgba(148,163,184,0.8)] animate-pulse' 
                            : 'bg-red-400/60'
                        }`} />
                        <span className="font-mono text-xs sm:text-sm text-white/90">{d.domain}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {d.price && <span className="text-[11px] sm:text-xs text-white/40">{d.price}</span>}
                        <span className={`text-[11px] sm:text-xs font-medium ${d.available ? 'text-slate-300' : 'text-white/30'}`}>
                          {d.available ? 'Available' : 'Taken'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className={`text-xl sm:text-3xl font-bold mb-4 sm:mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>Real-time availability checking</h3>
              <p className={`mb-5 sm:mb-8 text-sm sm:text-lg leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                Our bulk search tool checks domain availability in real-time, giving you instant results with accurate status information and pricing.
              </p>
              <ul className="space-y-4">
                {[
                  'Instant availability status with visual indicators',
                  'Premium domain detection and pricing',
                  'Multi-TLD support (500+ extensions)',
                  'Accurate pricing from top registrars'
                ].map((item, i) => (
                  <li key={i} className={`flex items-center gap-3 sm:gap-4 text-sm sm:text-base ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                    <span className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full flex items-center justify-center shrink-0 ${isLight ? 'bg-blue-100' : 'bg-slate-400/20'}`}>
                      <svg className={`w-3.5 h-3.5 ${isLight ? 'text-blue-500' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Powerful bulk domain search features */}
      <section className={`py-8 sm:py-16 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="text-center mb-6 sm:mb-14">
            <h2 className={`text-xl sm:text-3xl md:text-5xl font-black mb-2 sm:mb-6 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Powerful bulk domain<br />search features
            </h2>
            <p className={`max-w-2xl mx-auto text-sm sm:text-lg ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              Everything you need to find and register multiple domains efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[
              { icon: <svg className={`w-6 h-6 ${isLight ? 'text-blue-500' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, title: 'Smart Parsing', desc: 'Automatically parse domains from any format - CSV, text, URLs, or mixed input' },
              { icon: <svg className={`w-6 h-6 ${isLight ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>, title: 'TLD Filtering', desc: 'Filter results by specific TLDs like .com, .io, .ai, and hundreds more' },
              { icon: <svg className={`w-6 h-6 ${isLight ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, title: 'Availability Stats', desc: 'See real-time statistics on available, taken, and premium domains' },
              { icon: <svg className={`w-6 h-6 ${isLight ? 'text-blue-500' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>, title: 'Export Results', desc: 'Download your results as CSV or PDF for further analysis or sharing' },
              { icon: <svg className={`w-6 h-6 ${isLight ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>, title: 'Batch Processing', desc: 'Process large lists efficiently with optimized batch checking' },
              { icon: <svg className={`w-6 h-6 ${isLight ? 'text-blue-500' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>, title: 'One-Click Register', desc: 'Register available domains instantly with your preferred registrar' },
            ].map((f, i) => (
              <FeatureCard 
                key={i}
                icon={f.icon}
                title={f.title}
                description={f.desc}
                delay={i * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section: Bulk domain search made simple */}
      <section className={`py-6 sm:py-10 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="text-center mb-4 sm:mb-7">
            <h2 className={`text-xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Bulk domain search made simple
            </h2>
            <p className={`max-w-2xl mx-auto text-sm sm:text-base ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              Three easy steps to check hundreds of domains
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-8">
            <StepCard 
              number="01" 
              title="Enter domains" 
              description="Type, paste, or import your list of domains in any format. We support CSV, TXT, and direct input."
            />
            <StepCard 
              number="02" 
              title="Check availability" 
              description="Our system checks all domains instantly in parallel with real-time status updates."
            />
            <StepCard 
              number="03" 
              title="Register or export" 
              description="Register available domains with one click or export results for later analysis."
              isLast
            />
          </div>

          {/* Code Example */}
          <div className="bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 bg-white/[0.02]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="text-xs sm:text-sm text-white/40 ml-2 font-mono">domains.txt</span>
            </div>
            <pre className="p-3.5 sm:p-5 text-[11px] sm:text-sm font-mono text-white/70 overflow-x-auto leading-relaxed">
              <code>{`# Paste your domains in any format
FoundersPrime.com
YStartups.com, FoundersBlog.com
StartupHub.io VentureList.co

# Or import from CSV
domain1.com, domain2.net, domain3.org

# URLs are automatically parsed
https://example.com/page → example.com`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Section: Bulk domain search solutions by industry */}
      <section className={`py-6 sm:py-10 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="text-center mb-4 sm:mb-7">
            <h2 className={`text-xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Bulk domain search solutions by industry
            </h2>
            <p className={`max-w-2xl mx-auto text-sm sm:text-base ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              Tailored solutions for different business needs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <IndustryCard 
              icon="💼"
              title="Domain Investors"
              description="Find valuable domains in bulk for your portfolio. Check availability across multiple TLDs and identify premium opportunities."
              features={['Portfolio management', 'Value estimation', 'Expiry tracking']}
            />
            <IndustryCard 
              icon="🏢"
              title="Agencies & Brands"
              description="Secure brand variations and protect your clients. Check all possible domain combinations efficiently."
              features={['Brand protection', 'Competitor analysis', 'Multi-client support']}
            />
            <IndustryCard 
              icon="🚀"
              title="Startups"
              description="Find the perfect domain for your new venture. Check multiple name ideas simultaneously."
              features={['Name brainstorming', 'TLD comparison', 'Budget-friendly options']}
            />
            <IndustryCard 
              icon="🏛️"
              title="Enterprise"
              description="Manage large domain portfolios with ease. Bulk operations for corporate domain management."
              features={['API access', 'Team collaboration', 'Audit trails']}
            />
          </div>
        </div>
      </section>

      {/* Section: Master bulk domain searching: expert tips */}
      <section className={`py-8 sm:py-16 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-16 items-start">
            <div className="lg:col-span-2">
              <h2 className={`text-xl sm:text-3xl md:text-5xl font-black mb-2 sm:mb-6 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Master bulk<br />domain<br />searching:<br />
                <span className={isLight ? 'text-blue-500' : 'text-slate-300'}>expert tips</span>
              </h2>
              <p className={`mb-5 sm:mb-8 text-sm sm:text-lg leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                Learn how to maximize your bulk domain search efficiency with these professional strategies.
              </p>
              <Button variant="secondary" size="lg" className="group">
                View all tips
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </div>

            <div className="lg:col-span-3 space-y-4">
              <TipCard 
                number={1}
                title="Use keyword variations"
                description="Generate multiple variations of your target keywords to find available alternatives. Try prefixes, suffixes, and compound words."
              />
              <TipCard 
                number={2}
                title="Check multiple TLDs"
                description="Don't limit yourself to .com. Many great domains are available in .io, .ai, .co, and other modern TLDs."
              />
              <TipCard 
                number={3}
                title="Export and analyze"
                description="Export your results to CSV for deeper analysis. Track availability changes over time and identify patterns."
              />
              <TipCard 
                number={4}
                title="Act fast on good finds"
                description="Available domains can be registered by others at any time. When you find a good one, register it quickly."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section: Complete your domain search toolkit */}
      <section className={`py-8 sm:py-16 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className={`text-xl sm:text-3xl md:text-5xl font-black mb-2 sm:mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Complete your domain<br />search toolkit
            </h2>
            <p className={`max-w-2xl mx-auto text-sm sm:text-lg ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              Explore our other powerful domain tools
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <ToolCard href="/" icon="🔍" title="Domain Search" description="Find available domains instantly with real-time checking" />
            <ToolCard href="/generator" icon="✨" title="AI Generator" description="Generate creative domain names with AI assistance" />
            <ToolCard href="/tools/whois" icon="📋" title="WHOIS Lookup" description="Check domain ownership and registration details" />
            <ToolCard href="/tools/compare" icon="💵" title="Price Compare" description="Compare pricing across multiple registrars" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-8 sm:py-16 border-t relative ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-t from-slate-500/[0.05] via-slate-400/[0.03] to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto px-3 sm:px-6 text-center relative">
          <h2 className={`text-xl sm:text-3xl md:text-5xl font-black mb-2 sm:mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Start your bulk domain search now
          </h2>
          <p className={`mb-6 sm:mb-10 max-w-xl mx-auto text-sm sm:text-lg leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
            Check availability for hundreds of domains in seconds. No account required. Completely free.
          </p>
          <Button 
            onClick={onStartSearch}
            size="lg"
            className="px-6 sm:px-12 py-3 sm:py-4 text-sm sm:text-lg shadow-lg shadow-slate-400/20 hover:shadow-slate-400/40 transition-all"
          >
            Start Bulk Search
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Button>
        </div>
      </section>
    </div>
  );
};
