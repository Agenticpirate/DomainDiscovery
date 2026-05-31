'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/PageBackground';
import { Icons } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/contexts/ThemeContext';

interface SavedDomain {
  domain: string;
  savedAt: number;
}

export default function SavedDomainsPage() {
  const [savedDomains, setSavedDomains] = useState<SavedDomain[]>([]);
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    setMounted(true);
    loadSavedDomains();
  }, []);

  const loadSavedDomains = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('saved_domains');
      if (saved) {
        const domains = JSON.parse(saved);
        const domainsWithTimestamps = domains.map((domain: string | SavedDomain) => {
          if (typeof domain === 'string') {
            return { domain, savedAt: Date.now() };
          }
          return domain;
        });
        setSavedDomains(domainsWithTimestamps);
      }
    } catch (error) {
      console.error('Failed to load saved domains:', error);
      showToast('Failed to load saved domains', 'error');
    }
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    const newSaved = savedDomains.filter(d => d.domain !== domainToRemove);
    setSavedDomains(newSaved);
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('saved_domains', JSON.stringify(newSaved.map(d => d.domain)));
      window.dispatchEvent(new Event('savedDomainsUpdated'));
      showToast(`Removed ${domainToRemove} from saved domains`, 'success');
    } catch (error) {
      console.error('Failed to remove domain:', error);
      showToast('Failed to remove domain', 'error');
    }
  };

  const handleClearAll = () => {
    if (typeof window === 'undefined') return;
    
    if (confirm('Are you sure you want to clear all saved domains? This action cannot be undone.')) {
      setSavedDomains([]);
      try {
        localStorage.setItem('saved_domains', JSON.stringify([]));
        window.dispatchEvent(new Event('savedDomainsUpdated'));
        showToast('All saved domains cleared', 'success');
      } catch (error) {
        console.error('Failed to clear domains:', error);
        showToast('Failed to clear domains', 'error');
      }
    }
  };

  const handleExportCSV = () => {
    const csv = savedDomains.map(d => d.domain).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saved-domains-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Domains exported successfully', 'success');
  };

  const handleBuyDomain = (domain: string) => {
    window.open(`https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`, '_blank');
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen">
      <PageBackground variant="hero" />
      
      <Navigation />

      <main className="relative pt-[4.75rem] sm:pt-24">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 pb-4 sm:pb-7">
          <div className="max-w-4xl mx-auto text-center">
            <div className={`inline-flex items-center gap-1.5 mb-3 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
              <span className="accent-chip text-[10px]">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Private · stored on your device
              </span>
            </div>
            <h1 className={`text-2xl sm:text-5xl md:text-[3.6rem] font-black tracking-tight mb-2 sm:mb-4 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
              <span className={`bg-gradient-to-r ${isLight ? 'from-slate-900 via-slate-800 to-slate-600' : 'from-white via-white to-white/60'} bg-clip-text text-transparent`}>
                Saved Domains
              </span>
            </h1>
            <p className={`text-[13px] sm:text-base ${isLight ? 'text-slate-500' : 'text-white/50'} max-w-xl mx-auto ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
              Your privately saved domain names, kept locally on your device.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="px-3 sm:px-6 pb-10 sm:pb-14">
          <div className="max-w-4xl mx-auto">
            {savedDomains.length > 0 ? (
              <>
                {/* Actions Bar */}
                <div className={`flex items-center justify-between gap-3 mb-4 sm:mb-5 px-3.5 py-2.5 sm:px-4 sm:py-3 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/[0.02] border-white/10'} border rounded-xl`}>
                  <div className={`text-[13px] sm:text-sm ${isLight ? 'text-slate-500' : 'text-white/60'}`}>
                    <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{savedDomains.length}</span> saved {savedDomains.length === 1 ? 'domain' : 'domains'}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportCSV}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${isLight ? 'border-slate-200 text-slate-700 hover:bg-slate-50' : 'border-white/10 text-white/70 hover:bg-white/5'}`}
                    >
                      <Icons.Download />
                      Export
                    </button>
                    <button
                      onClick={handleClearAll}
                      className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${isLight ? 'text-red-500 hover:bg-red-50' : 'text-red-400 hover:bg-red-400/10'}`}
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                {/* Domains List */}
                <div className="space-y-2 sm:space-y-2.5">
                  {savedDomains.map((item, index) => (
                    <div
                      key={index}
                      className={`group flex items-center justify-between gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-xl border transition-all ${isLight ? 'bg-white border-slate-200 hover:border-[var(--accent-border)] hover:shadow-md' : 'bg-white/[0.02] border-white/10 hover:border-[var(--accent-border)] hover:bg-white/[0.04]'}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-2 h-2 rounded-full shrink-0 bg-[var(--accent)]" />
                        <div className="min-w-0">
                          <div className={`font-mono text-[13px] sm:text-base font-semibold ${isLight ? 'text-slate-900' : 'text-white'} truncate`}>
                            {item.domain}
                          </div>
                          <div className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                            Saved {formatDate(item.savedAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => { navigator.clipboard.writeText(item.domain); showToast('Copied to clipboard', 'success', 1500); }}
                          className={`hidden sm:inline-flex p-2 rounded-lg transition-colors ${isLight ? 'text-slate-300 hover:text-slate-600 hover:bg-slate-100' : 'text-white/25 hover:text-white/60 hover:bg-white/5'}`}
                          aria-label="Copy domain"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                        <button
                          onClick={() => handleBuyDomain(item.domain)}
                          className="btn-accent px-3 py-1.5 text-[12px]"
                        >
                          <Icons.Globe />
                          Register
                        </button>
                        <button
                          onClick={() => handleRemoveDomain(item.domain)}
                          className={`p-2 rounded-lg transition-all ${isLight ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-white/40 hover:text-red-400 hover:bg-red-400/10'}`}
                          aria-label={`Remove ${item.domain}`}
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Privacy Notice */}
                <div className={`mt-6 sm:mt-8 p-3.5 sm:p-4 ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/5 border-emerald-500/20'} border rounded-xl`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 ${isLight ? 'bg-emerald-100' : 'bg-emerald-500/10'} rounded-lg`}>
                      <svg className={`w-5 h-5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isLight ? 'text-emerald-600' : 'text-emerald-400'} mb-1`}>Your Privacy is Protected</h3>
                      <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-white/60'} leading-relaxed`}>
                        All saved domains are stored locally in your browser. We don&apos;t track, store, or share your saved domains. 
                        Your data remains private and will persist until you manually clear your browser cache.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className={`relative overflow-hidden rounded-2xl border px-6 py-12 sm:py-16 text-center ${isLight ? 'bg-white border-slate-200' : 'bg-white/[0.02] border-white/10'}`}>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-40 rounded-full"
                  style={{ background: 'radial-gradient(ellipse at center, var(--accent-glow), transparent 70%)', filter: 'blur(60px)' }}
                />
                <div className="relative">
                  <div className={`inline-flex p-4 rounded-2xl mb-4 ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-[var(--accent-tint)] border-[var(--accent-border)]'} border`}>
                    <svg className="w-9 h-9 text-[var(--accent-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>No saved domains yet</h3>
                  <p className={`${isLight ? 'text-slate-500' : 'text-white/50'} text-[13px] sm:text-sm mb-6 max-w-sm mx-auto leading-relaxed`}>
                    Tap the bookmark on any domain to save it here. Everything stays private, stored only on your device.
                  </p>
                  <Link href="/" className="btn-accent inline-flex px-5 py-2.5 text-sm">
                    <Icons.Search />
                    Start searching domains
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
