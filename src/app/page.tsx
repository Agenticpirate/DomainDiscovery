'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { PageBackground } from '@/components/ui/PageBackground';
import { SearchInterface } from '@/components/domain/SearchInterface';
import { ResultsList, DomainResult } from '@/components/domain/ResultsList';
import { searchDomains } from '@/services/instantDomainService';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useToast } from '@/components/ui/Toast';
import { HomePageContent } from '@/components/home/HomePageContent';

// Tool Components
import { DomainGenerator } from '@/components/generator/DomainGenerator';
import { BrandableDomainFinder } from '@/components/domain/BrandableDomainFinder';
import { KeywordDomainFinder } from '@/components/domain/KeywordDomainFinder';
import { WHOISLookup } from '@/components/domain/WHOISLookup';
import { DomainValueEstimate } from '@/components/domain/DomainValueEstimate';
import { PriceComparison } from '@/components/domain/PriceComparison';
import { BulkDomainSearch } from '@/components/domain/BulkDomainSearch';
import { DomainExtensionsView } from '@/components/domain/DomainExtensionsView';

type ToolType = 'search' | 'extensions' | 'generator' | 'premium' | 'bulk' | 'expired' | 'brandable' | 'keyword' | 'whois' | 'value' | 'compare' | 'geo' | 'learn';

export default function Home() {
  const [activeTool, setActiveTool] = useState<ToolType>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<DomainResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [savedDomains, setSavedDomains] = useState<string[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
    // Load saved domains from localStorage
    try {
      const saved = localStorage.getItem('saved_domains');
      if (saved) {
        setSavedDomains(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load saved domains:', error);
    }

    // Keyboard shortcut: "/" to focus search
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          showToast('Press "/" to focus search anytime', 'info', 2000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showToast]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setSearchQuery(query);
    const cleanQuery = query.toLowerCase().replace(/\s+/g, '');
    const tlds = ['.com', '.net', '.org', '.ai', '.io', '.co', '.app', '.xyz'];
    const apiResults = await searchDomains(cleanQuery, tlds);
    
    // Convert API results to DomainResult format
    const formattedResults: DomainResult[] = apiResults.map(r => ({
      domain: r.domain,
      availability: r.available ? 'available' : 'unavailable',
      tld: r.tld,
      pricing: r.price ? {
        amount: parseFloat(r.price.replace(/[^0-9.]/g, '')),
        currency: '$',
        registrar: r.registrar || 'GoDaddy',
      } : undefined,
      premium: r.premium,
    }));
    
    setResults(formattedResults);
    setIsLoading(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
  };

  const handleDomainBuy = (domain: string) => {
    // Open registrar link
    window.open(`https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`, '_blank');
  };

  const handleDomainWhois = (domain: string) => {
    // Open WHOIS lookup
    window.open(`https://who.is/whois/${domain}`, '_blank');
  };

  const handleDomainSave = (domain: string) => {
    const isSaved = savedDomains.includes(domain);
    const newSaved = isSaved
      ? savedDomains.filter(d => d !== domain)
      : [...savedDomains, domain];
    
    setSavedDomains(newSaved);
    try {
      localStorage.setItem('saved_domains', JSON.stringify(newSaved));
      // Dispatch custom event to update navigation badge
      window.dispatchEvent(new Event('savedDomainsUpdated'));
      showToast(
        isSaved ? `Removed ${domain} from saved domains` : `Saved ${domain} to your list`,
        'success',
        2500
      );
    } catch (error) {
      console.error('Failed to save domain:', error);
      showToast('Failed to save domain. Please try again.', 'error');
    }
  };

  // Check if we should show the main search interface
  const showMainSearch = activeTool === 'search';
  const showToolHeader = !showMainSearch && activeTool !== 'bulk' && activeTool !== 'extensions';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Enhanced Background with Grid and Gradient Glows */}
      <PageBackground variant="hero" />
      
      <Navigation activeTool={activeTool} onToolSelect={(tool) => setActiveTool(tool as ToolType)} />

      {/* Main Content */}
      <main className="relative pt-28">
        
        {/* Hero Section - Only show for search tools */}
        {showMainSearch && (
          <section className="px-6 pb-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className={`text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
                <span className="block bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                  Find Your Perfect Domain
                </span>
                <span className="block text-white/50 text-3xl sm:text-4xl md:text-5xl mt-2">in Seconds</span>
              </h1>
              <p className={`text-lg text-white/50 max-w-2xl mx-auto mb-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
                Search millions of domains with instant results. Compare prices across registrars. Register in one click.
              </p>

              {/* Search Bar */}
              <div className={`max-w-2xl mx-auto ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
                <SearchInterface
                  initialQuery={searchQuery}
                  placeholder="Try: coffee shop, tech startup, or FoundersPrime.com"
                  onSearch={handleSearch}
                  onClear={handleClear}
                  autoFocus={true}
                  showRecentSearches={true}
                  debounceMs={150}
                  isLoading={isLoading}
                />
              </div>

              {/* Trust Indicators */}
              <div className="max-w-4xl mx-auto mt-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4">
                    <div className="text-2xl sm:text-3xl font-black text-white mb-1">2M+</div>
                    <div className="text-xs text-white/50">Domains Searched</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-2xl sm:text-3xl font-black text-white mb-1">50K+</div>
                    <div className="text-xs text-white/50">Active Users</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-2xl sm:text-3xl font-black text-white mb-1">1,600+</div>
                    <div className="text-xs text-white/50">TLD Extensions</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-2xl sm:text-3xl font-black text-white mb-1">99.9%</div>
                    <div className="text-xs text-white/50">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Extensions Hero */}
        {activeTool === 'extensions' && (
          <section className="px-6 pb-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
                <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                  Domain Extensions
                </span>
              </h1>
              <p className="text-lg text-white/50 max-w-2xl mb-8">
                Explore 200+ domain extensions across all categories. Find the perfect TLD for your website.
              </p>
            </div>
          </section>
        )}

        {/* Tool Header - For non-search tools */}
        {showToolHeader && (
          <section className="px-6 pb-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                {activeTool === 'generator' && 'AI Domain Generator'}
                {activeTool === 'brandable' && 'Find Brandable Domains'}
                {activeTool === 'keyword' && 'Keyword-Based Domains'}
                {activeTool === 'whois' && 'WHOIS Lookup'}
                {activeTool === 'value' && 'Domain Value Estimator'}
                {activeTool === 'compare' && 'Price Comparison'}
                {activeTool === 'premium' && 'Premium Domains'}
                {activeTool === 'expired' && 'Expired Domains'}
                {activeTool === 'geo' && 'Geo Domain Finder'}
                {activeTool === 'learn' && 'Learn About Domains'}
              </h1>
              <p className="text-sm text-white/50">
                {activeTool === 'generator' && 'Generate creative, brandable domain names using AI'}
                {activeTool === 'brandable' && 'Discover unique, memorable names for your business'}
                {activeTool === 'keyword' && 'Find domains based on specific keywords for better SEO'}
                {activeTool === 'whois' && 'Look up domain ownership and registration details'}
                {activeTool === 'value' && 'Estimate domain market value based on real data'}
                {activeTool === 'compare' && 'Compare prices across top registrars'}
                {activeTool === 'premium' && 'Discover high-value domains for sale'}
                {activeTool === 'expired' && 'Find expired and expiring domain names'}
                {activeTool === 'geo' && 'Find location-based domains for local businesses'}
                {activeTool === 'learn' && 'Guides and best practices for domain investing'}
              </p>
            </div>
          </section>
        )}

        {/* Results Section */}
        {showMainSearch && (isLoading || results.length > 0) && (
          <section className="px-6 pb-16">
            <div className="max-w-6xl mx-auto">
              {isLoading ? (
                <div className="space-y-4">
                  <SkeletonLoader variant="domain" count={6} />
                </div>
              ) : (
                <ResultsList
                  results={results}
                  isLoading={isLoading}
                  sortBy="relevance"
                  filterBy="all"
                  onDomainBuy={handleDomainBuy}
                  onDomainWhois={handleDomainWhois}
                  onDomainSave={handleDomainSave}
                  savedDomains={savedDomains}
                  emptyStateMessage="No domains found. Try a different search term."
                />
              )}
            </div>
          </section>
        )}

        {/* Tool Content Section */}
        <section className={`pb-16 ${activeTool === 'bulk' ? 'px-4' : 'px-6'}`}>
          <div className={activeTool === 'bulk' ? 'w-full' : activeTool === 'extensions' ? 'max-w-7xl mx-auto' : 'max-w-5xl mx-auto'}>
            
            {/* Tool Components */}
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

            {activeTool === 'value' && (
              <div className="max-w-2xl mx-auto">
                <DomainValueEstimate domain={selectedDomain} />
              </div>
            )}

            {activeTool === 'compare' && (
              <div className="max-w-2xl mx-auto">
                <PriceComparison domain={selectedDomain || 'FoundersPrime.com'} />
              </div>
            )}

            {activeTool === 'bulk' && (
              <BulkDomainSearch onSelect={setSelectedDomain} />
            )}

            {activeTool === 'extensions' && (
              <DomainExtensionsView searchQuery={searchQuery} />
            )}

            {activeTool === 'premium' && (
              <div className="text-center py-16">
                <div className="inline-flex p-6 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                  <Icons.Star />
                </div>
                <h3 className="text-lg font-semibold text-white/70 mb-2">Premium Domains</h3>
                <p className="text-sm text-white/40 max-w-md mx-auto mb-6">
                  Discover high-value premium domains available for sale or aftermarket auction.
                </p>
                <Button variant="secondary">Browse Premium Marketplace</Button>
              </div>
            )}

            {activeTool === 'expired' && (
              <div className="text-center py-16">
                <div className="inline-flex p-6 rounded-full bg-white/5 border border-white/10 mb-6">
                  <Icons.Clock />
                </div>
                <h3 className="text-lg font-semibold text-white/70 mb-2">Expired Domains</h3>
                <p className="text-sm text-white/40 max-w-md mx-auto mb-6">
                  Find expired and expiring domain names with AI-powered search tools.
                </p>
                <Button variant="secondary">Search Expired Domains</Button>
              </div>
            )}

            {activeTool === 'geo' && (
              <div className="text-center py-16">
                <div className="inline-flex p-6 rounded-full bg-white/5 border border-white/10 mb-6">
                  <Icons.Globe />
                </div>
                <h3 className="text-lg font-semibold text-white/70 mb-2">Geo Domain Finder</h3>
                <p className="text-sm text-white/40 max-w-md mx-auto mb-6">
                  Find location-based domains for local businesses and regional marketing.
                </p>
                <Button variant="secondary">Find Geo Domains</Button>
              </div>
            )}

            {activeTool === 'learn' && (
              <div className="text-center py-16">
                <div className="inline-flex p-6 rounded-full bg-white/5 border border-white/10 mb-6">
                  <Icons.Info />
                </div>
                <h3 className="text-lg font-semibold text-white/70 mb-2">Learn About Domains</h3>
                <p className="text-sm text-white/40 max-w-md mx-auto mb-6">
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
