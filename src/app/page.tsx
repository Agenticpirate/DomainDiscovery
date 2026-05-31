'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { PageBackground } from '@/components/ui/PageBackground';
import { HomePageContent } from '@/components/home/HomePageContent';
import { Hero } from '@/components/home/Hero';
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

      <main id="top" className="relative pt-[3.5rem] sm:pt-[4.45rem]">
        
        {showMainSearch && (
          <Hero
            searchQuery={searchQuery}
            onSearch={handleHeroSearch}
            onClear={handleHeroClear}
          />
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
              <div className="max-w-5xl mx-auto">
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
