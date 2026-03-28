'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { PageBackground } from '@/components/ui/PageBackground';
import { HomePageContent } from '@/components/home/HomePageContent';
import { SearchInterface } from '@/components/domain/SearchInterface';
import { useTheme } from '@/contexts/ThemeContext';

import { DomainGenerator } from '@/components/generator/DomainGenerator';
import { BrandableDomainFinder } from '@/components/domain/BrandableDomainFinder';
import { KeywordDomainFinder } from '@/components/domain/KeywordDomainFinder';
import { WHOISLookup } from '@/components/domain/WHOISLookup';
import { BulkDomainSearch } from '@/components/domain/BulkDomainSearch';
import { DomainExtensionsView } from '@/components/domain/DomainExtensionsView';

type ToolType = 'search' | 'extensions' | 'generator' | 'bulk' | 'brandable' | 'keyword' | 'whois' | 'geo' | 'learn';

export default function Home() {
  const [activeTool, setActiveTool] = useState<ToolType>('search');
  const [mounted, setMounted] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();
  const isLight = mounted ? theme === 'light' : false;
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        router.push('/search');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  const launchSearchPage = () => {
    router.push('/search');
  };

  const handleHeroSearch = (query: string) => {
    const normalized = query.trim();
    if (!normalized) return;
    setSearchQuery(normalized);
    router.push(`/search?q=${encodeURIComponent(normalized)}`);
  };

  const handleHeroClear = () => {
    setSearchQuery('');
  };

  const showMainSearch = activeTool === 'search';
  const showToolHeader = !showMainSearch && activeTool !== 'bulk' && activeTool !== 'extensions';

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <PageBackground variant="hero" />
      
      <Navigation activeTool={activeTool} onToolSelect={(tool) => setActiveTool(tool as ToolType)} />

      <main className="relative pt-[3.5rem] sm:pt-[4.45rem]">
        
        {showMainSearch && (
          <section className="px-3 sm:px-6 pt-3 sm:pt-5 pb-0 sm:pb-2.5">
            <div className="max-w-[56rem] mx-auto text-center">
              <h1 className="text-[2rem] leading-[1.05] sm:text-[3.7rem] md:text-[4.35rem] font-black tracking-tight mb-1 sm:mb-1.5 animate-slide-up">
                <span className="block bg-clip-text text-transparent" style={{
                  backgroundImage: isLight
                    ? 'linear-gradient(to right, #0f172a, #1e293b, #475569)'
                    : 'linear-gradient(to right, #fff, #fff, rgba(255,255,255,0.6))'
                }}>
                  Find Your Perfect Domain
                </span>
                <span className="block text-[0.85rem] sm:text-[1.5rem] md:text-[1.95rem] mt-0.5 font-bold" style={{ color: 'var(--gradient-subtitle)' }}>in Seconds</span>
              </h1>
              <p className="hidden sm:block text-[12px] sm:text-[14px] max-w-[40rem] mx-auto mb-2.5 sm:mb-3.5" style={{ color: 'var(--text-tertiary)' }}>
                Search millions of domains with instant results. Compare prices across registrars. Register in one click.
              </p>
              <p className="sm:hidden text-[11px] max-w-[26rem] mx-auto mb-2 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                1,600+ TLDs · Real-time results · Compare prices
              </p>

              <div className="max-w-[54rem] mx-auto animate-fade-in">
                <SearchInterface
                  initialQuery={searchQuery}
                  placeholder="Search domain names..."
                  onSearch={handleHeroSearch}
                  onClear={handleHeroClear}
                  autoFocus
                  showRecentSearches={false}
                  debounceMs={180}
                />
              </div>

              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 sm:mt-2.5">
                <Link
                  href="/tools/compare"
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold transition-all ${
                    isLight
                      ? 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      : 'border border-white/10 bg-white/[0.03] text-white/80 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <Icons.Dollar />
                  Compare prices
                </Link>
                <Link
                  href="/bulk-search"
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold transition-all ${
                    isLight
                      ? 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      : 'border border-white/10 bg-white/[0.03] text-white/80 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <Icons.Layers />
                  Bulk check
                </Link>
                <Link
                  href="/domain-extensions"
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold transition-all ${
                    isLight
                      ? 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      : 'border border-white/10 bg-white/[0.03] text-white/80 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <Icons.Globe />
                  Extensions
                </Link>
              </div>

              <div className="max-w-[52rem] mx-auto mt-2 sm:mt-3.5">
                <div className={`grid grid-cols-4 gap-0 sm:gap-2.5 px-1 py-1 sm:p-3.5 rounded-lg sm:rounded-2xl ${
                  isLight ? 'bg-white/70 border border-slate-200/60 shadow-sm backdrop-blur-sm' : 'bg-white/[0.02] border border-white/10 backdrop-blur-sm'
                }`}>
                  {[
                    { value: '20M+', label: 'Searches' },
                    { value: '50K+', label: 'Users' },
                    { value: '1,600+', label: 'TLDs' },
                    { value: '99.9%', label: 'Uptime' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center px-1 py-1 sm:p-2 rounded-md sm:rounded-xl">
                      <div className="text-[0.8rem] sm:text-[1.5rem] font-black mb-0 leading-tight" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                      <div className="text-[8px] sm:text-xs font-medium leading-tight" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTool === 'extensions' && (
          <section className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl sm:text-5xl md:text-6xl font-black tracking-tight mb-2 sm:mb-4">
                <span className="bg-clip-text text-transparent" style={{
                  backgroundImage: isLight
                    ? 'linear-gradient(to right, #111827, #111827, rgba(17,24,39,0.6))'
                    : 'linear-gradient(to right, #fff, #fff, rgba(255,255,255,0.6))'
                }}>
                  Domain Extensions
                </span>
              </h1>
              <p className="text-sm sm:text-lg max-w-2xl mb-4 sm:mb-8" style={{ color: 'var(--text-tertiary)' }}>
                Explore 200+ domain extensions across all categories. Find the perfect TLD for your website.
              </p>
            </div>
          </section>
        )}

        {showToolHeader && (
          <section className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-1 sm:mb-2">
                {activeTool === 'generator' && 'AI Domain Generator'}
                {activeTool === 'brandable' && 'Find Brandable Domains'}
                {activeTool === 'keyword' && 'Keyword-Based Domains'}
                {activeTool === 'whois' && 'WHOIS Lookup'}
                {activeTool === 'geo' && 'Geo Domain Finder'}
                {activeTool === 'learn' && 'Learn About Domains'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {activeTool === 'generator' && 'Generate creative, brandable domain names using AI'}
                {activeTool === 'brandable' && 'Discover unique, memorable names for your business'}
                {activeTool === 'keyword' && 'Find domains based on specific keywords for better SEO'}
                {activeTool === 'whois' && 'Look up domain ownership and registration details'}
                {activeTool === 'geo' && 'Find location-based domains for local businesses'}
                {activeTool === 'learn' && 'Guides and best practices for domain investing'}
              </p>
            </div>
          </section>
        )}

        <section className={`pb-6 sm:pb-12 ${activeTool === 'bulk' ? 'px-2 sm:px-4' : 'px-3 sm:px-6'}`}>
          <div className={activeTool === 'bulk' ? 'w-full' : activeTool === 'extensions' ? 'max-w-7xl mx-auto' : 'max-w-5xl mx-auto'}>
            
            {activeTool === 'generator' && (
              <div className="max-w-2xl mx-auto">
                <DomainGenerator onSelect={setSelectedDomain} />
              </div>
            )}

            {activeTool === 'brandable' && (
              <div className="max-w-2xl mx-auto">
                <BrandableDomainFinder onSelect={setSelectedDomain} />
              </div>
            )}

            {activeTool === 'keyword' && (
              <div className="max-w-2xl mx-auto">
                <KeywordDomainFinder onSelect={setSelectedDomain} />
              </div>
            )}

            {activeTool === 'whois' && (
              <div className="max-w-2xl mx-auto">
                <WHOISLookup domain={selectedDomain} />
              </div>
            )}



            {activeTool === 'bulk' && (
              <BulkDomainSearch onSelect={setSelectedDomain} />
            )}

            {activeTool === 'extensions' && (
              <DomainExtensionsView searchQuery="" />
            )}



            {activeTool === 'geo' && (
              <div className="text-center py-16">
                <div className="inline-flex p-6 rounded-full mb-6" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                  <Icons.Globe />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Geo Domain Finder</h3>
                <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--text-muted)' }}>
                  Find location-based domains for local businesses and regional marketing.
                </p>
                <Button variant="secondary">Find Geo Domains</Button>
              </div>
            )}

            {activeTool === 'learn' && (
              <div className="text-center py-16">
                <div className="inline-flex p-6 rounded-full mb-6" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                  <Icons.Info />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Learn About Domains</h3>
                <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--text-muted)' }}>
                  Guides, tutorials, and best practices for domain investing and management.
                </p>
                <Button variant="secondary">Browse Guides</Button>
              </div>
            )}
          </div>
        </section>

        {showMainSearch && (
          <HomePageContent />
        )}
      </main>

      <Footer />
    </div>
  );
}
