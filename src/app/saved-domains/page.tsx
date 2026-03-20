'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/PageBackground';
import { Button } from '@/components/ui/Button';
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

      <main className="relative pt-20 sm:pt-24">
        {/* Hero Section */}
        <section className="px-3 sm:px-6 pb-5 sm:pb-7">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className={`text-3xl sm:text-5xl md:text-[3.9rem] font-black tracking-tight mb-3 sm:mb-4 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
              <span className={`bg-gradient-to-r ${isLight ? 'from-slate-900 via-slate-800 to-slate-600' : 'from-white via-white to-white/60'} bg-clip-text text-transparent`}>
                Saved Domains
              </span>
            </h1>
            <p className={`text-sm sm:text-base ${isLight ? 'text-slate-500' : 'text-white/50'} max-w-2xl mx-auto mb-5 sm:mb-6 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
              Your privately saved domain names. All data is stored locally on your device for complete privacy.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="px-3 sm:px-6 pb-10 sm:pb-14">
          <div className="max-w-4xl mx-auto">
            {savedDomains.length > 0 ? (
              <>
                {/* Actions Bar */}
                <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6 p-3.5 sm:p-4 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/[0.02] border-white/10'} border rounded-xl`}>
                  <div className="flex items-center gap-3">
                    <div className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/70'}`}>
                      <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{savedDomains.length}</span> saved {savedDomains.length === 1 ? 'domain' : 'domains'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      onClick={handleExportCSV}
                      variant="secondary"
                      size="sm"
                      className="gap-2 w-full sm:w-auto"
                    >
                      <Icons.Download />
                      Export CSV
                    </Button>
                    <Button
                      onClick={handleClearAll}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 w-full sm:w-auto"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                {/* Domains List */}
                <div className="space-y-2.5 sm:space-y-3">
                  {savedDomains.map((item, index) => (
                    <div
                      key={index}
                      className={`group p-3.5 sm:p-4 ${isLight ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md' : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'} border rounded-xl transition-all`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className={`font-mono text-sm sm:text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-white'} mb-1 break-all sm:truncate`}>
                            {item.domain}
                          </div>
                          <div className={`text-xs ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                            Saved {formatDate(item.savedAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button
                            onClick={() => handleBuyDomain(item.domain)}
                            variant="primary"
                            size="sm"
                            className="gap-2 flex-1 sm:flex-none"
                          >
                            <Icons.Globe />
                            Register
                          </Button>
                          <button
                            onClick={() => handleRemoveDomain(item.domain)}
                            className={`p-2 ${isLight ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-white/40 hover:text-red-400 hover:bg-red-400/10'} rounded-lg transition-all`}
                            title="Remove from saved"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
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
              <div className="text-center py-12 sm:py-16">
                <div className={`inline-flex p-4 sm:p-6 rounded-full ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'} border mb-4 sm:mb-6`}>
                  <svg className={`w-12 h-12 ${isLight ? 'text-slate-300' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>No Saved Domains Yet</h3>
                <p className={`${isLight ? 'text-slate-500' : 'text-white/50'} text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto`}>
                  Start searching for domains and save your favorites. All your saved domains will appear here, 
                  stored privately on your device.
                </p>
                <Link href="/">
                  <Button variant="primary" size="lg" className="gap-2">
                    <Icons.Search />
                    Start Searching Domains
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
