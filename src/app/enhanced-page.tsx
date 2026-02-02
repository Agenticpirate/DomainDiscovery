'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { DomainSearchBar } from '@/components/domain/DomainSearchBar';
import { DomainResultsList } from '@/components/domain/DomainResultsList';
import { TLDFilter } from '@/components/domain/TLDFilter';
import { PriceComparison } from '@/components/domain/PriceComparison';
import { WHOISLookup } from '@/components/domain/WHOISLookup';
import { DomainValueEstimate } from '@/components/domain/DomainValueEstimate';
import { DomainGenerator } from '@/components/generator/DomainGenerator';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { searchDomains } from '@/services/instantDomainService';

type ToolType = 'search' | 'generator' | 'whois' | 'value' | 'bulk';

interface DomainResult {
  domain: string;
  available: boolean;
  tld: string;
  price?: string;
  registrar?: string;
  premium?: boolean;
  seo?: {
    traffic?: number;
    backlinks?: number;
    authority?: number;
  };
}

export default function EnhancedHome() {
  const [activeTool, setActiveTool] = useState<ToolType>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<DomainResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedTLDs, setSelectedTLDs] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time search (< 25ms like Instant Domain Search)
  useEffect(() => {
    if (searchQuery.trim() && activeTool === 'search') {
      const timer = setTimeout(() => {
        handleRealtimeSearch();
      }, 25);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [searchQuery, activeTool, selectedTLDs]);

  const handleRealtimeSearch = async () => {
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase().replace(/\s+/g, '');
    const allTlds = ['.com', '.net', '.org', '.ai', '.io', '.co', '.app', '.xyz', '.dev', '.tech'];
    const tlds = selectedTLDs.length > 0 ? selectedTLDs : allTlds;

    // Use real API service (falls back to mock if no API configured)
    const apiResults = await searchDomains(query, tlds);
    setResults(apiResults);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    handleRealtimeSearch();
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

      <Navigation activeTool={activeTool} onToolSelect={(tool) => setActiveTool(tool as ToolType)} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-6">
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center space-y-6">
            <h1
              className={`text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] ${
                mounted ? 'animate-slide-up' : 'opacity-0'
              }`}
            >
              <span className="block bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                Find Available Domains
              </span>
              <span className="block text-white/50 text-3xl sm:text-4xl lg:text-5xl mt-2">Instantly</span>
            </h1>

            <p
              className={`text-lg text-white/50 max-w-2xl mx-auto ${
                mounted ? 'animate-fade-in' : 'opacity-0'
              } [animation-delay:200ms]`}
            >
              Search millions of domains in real-time. Check 1,600+ extensions, compare prices, and register instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Main Search Section */}
      <section className="relative pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`${mounted ? 'animate-fade-in' : 'opacity-0'} [animation-delay:400ms]`}>
            <DomainSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              isLoading={isLoading}
              showInstantIndicator={true}
            />
          </div>

          {/* Real-time Results */}
          {results.length > 0 && (
            <div className="mt-6">
              <DomainResultsList
                results={results.slice(0, 12)}
                isLoading={false}
                onRegister={(domain) => setSelectedDomain(domain)}
                onViewDetails={(domain) => setSelectedDomain(domain)}
              />
            </div>
          )}
        </div>
      </section>

      {/* Tools Section */}
      <section className="relative py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Tool */}
            <div className="lg:col-span-2">
              {activeTool === 'generator' && <DomainGenerator onSelect={setSelectedDomain} />}
              {activeTool === 'whois' && <WHOISLookup domain={selectedDomain} />}
              {activeTool === 'value' && <DomainValueEstimate domain={selectedDomain} />}
              {activeTool === 'search' && results.length === 0 && (
                <div className="glass-card p-12 border-white/10 text-center">
                  <div className="mb-6 inline-flex p-8 rounded-full bg-white/5 border border-white/10">
                    <Icons.Search />
                  </div>
                  <h3 className="text-xl font-bold text-white/80 mb-2">Start Your Search</h3>
                  <p className="text-sm text-white/40 max-w-md mx-auto">
                    Enter a domain name above to check availability across 1,600+ extensions in real-time.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Filters & Tools */}
            <div className="space-y-6">
              <TLDFilter onSelect={setSelectedTLDs} />
              {selectedDomain && <PriceComparison domain={selectedDomain} />}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Complete Domain Intelligence
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Everything you need to find, evaluate, and register the perfect domain name.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card p-8 border-white/10 hover:border-white/20 transition-all duration-500">
              <div className="inline-flex p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
                <Icons.Search />
              </div>
              <h3 className="text-2xl font-bold mb-2">Instant Search</h3>
              <p className="text-white/50 text-sm mb-4">
                Real-time results in under 25ms. See availability as you type across all major extensions.
              </p>
              <div className="text-xs text-white/30">1,600+ TLDs supported</div>
            </div>

            <div className="glass-card p-8 border-white/10 hover:border-white/20 transition-all duration-500">
              <div className="inline-flex p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
                <Icons.Magic />
              </div>
              <h3 className="text-2xl font-bold mb-2">AI Generator</h3>
              <p className="text-white/50 text-sm mb-4">
                Generate creative, brandable names using advanced AI. Get instant suggestions tailored to your needs.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => setActiveTool('generator')}
              >
                Try Generator
              </Button>
            </div>

            <div className="glass-card p-8 border-white/10 hover:border-white/20 transition-all duration-500">
              <div className="inline-flex p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
                <Icons.Dollar />
              </div>
              <h3 className="text-2xl font-bold mb-2">Price Comparison</h3>
              <p className="text-white/50 text-sm mb-4">
                Compare prices across top registrars in real-time. Find the best deals instantly.
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Namecheap</span>
                  <span className="font-bold text-emerald-400">$10.98</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">GoDaddy</span>
                  <span className="font-bold">$12.99</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 border-white/10 hover:border-white/20 transition-all duration-500">
              <div className="inline-flex p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
                <Icons.Info />
              </div>
              <h3 className="text-2xl font-bold mb-2">WHOIS Lookup</h3>
              <p className="text-white/50 text-sm mb-4">
                Access domain ownership details, registration dates, and expiration information instantly.
              </p>
              <Button variant="secondary" size="sm" className="w-full" onClick={() => setActiveTool('whois')}>
                Lookup Domain
              </Button>
            </div>

            <div className="glass-card p-8 border-white/10 hover:border-white/20 transition-all duration-500">
              <div className="inline-flex p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
                <Icons.Dollar />
              </div>
              <h3 className="text-2xl font-bold mb-2">Value Estimates</h3>
              <p className="text-white/50 text-sm mb-4">
                Get estimated market values based on real sales data, traffic, and SEO metrics.
              </p>
              <Button variant="secondary" size="sm" className="w-full" onClick={() => setActiveTool('value')}>
                Estimate Value
              </Button>
            </div>

            <div className="glass-card p-8 border-white/10 hover:border-white/20 transition-all duration-500">
              <div className="inline-flex p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
                <Icons.Layers />
              </div>
              <h3 className="text-2xl font-bold mb-2">Premium Domains</h3>
              <p className="text-white/50 text-sm mb-4">
                Discover high-value premium domains with existing traffic, backlinks, and authority.
              </p>
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Premium marketplace</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Choose the Perfect Domain</h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Follow these best practices to select a domain that drives traffic and builds your brand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Keep It Short',
                desc: 'Shorter domains are easier to remember and type. Aim for 6-14 characters when possible.',
              },
              {
                title: 'Make It Memorable',
                desc: 'Choose names that stick. Avoid complex spellings or confusing word combinations.',
              },
              {
                title: 'Stay Relevant',
                desc: 'Your domain should reflect your brand and content. Make expectations clear.',
              },
              {
                title: 'Think Long-Term',
                desc: 'Select a domain that grows with your business. Avoid trendy terms that may date.',
              },
            ].map((tip, i) => (
              <div
                key={i}
                className="p-6 bg-white/[0.02] rounded-xl hover:bg-white/[0.04] transition-all duration-300"
              >
                <h3 className="text-lg font-bold mb-2">{tip.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-10 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-black text-lg">
                  D
                </div>
                <span className="text-2xl font-black tracking-tighter">DomainsDiscovery</span>
              </div>
              <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                The ultimate domain intelligence platform. Find, evaluate, and register domains instantly.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-sm uppercase tracking-widest text-white/60">Tools</h5>
              <ul className="space-y-4 text-sm text-white/40">
                <li className="hover:text-white cursor-pointer transition-colors">Domain Search</li>
                <li className="hover:text-white cursor-pointer transition-colors">AI Generator</li>
                <li className="hover:text-white cursor-pointer transition-colors">WHOIS Lookup</li>
                <li className="hover:text-white cursor-pointer transition-colors">Value Estimator</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-sm uppercase tracking-widest text-white/60">Company</h5>
              <ul className="space-y-4 text-sm text-white/40">
                <li className="hover:text-white cursor-pointer transition-colors">About</li>
                <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
                <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-sm uppercase tracking-widest text-white/60">Legal</h5>
              <ul className="space-y-4 text-sm text-white/40">
                <li className="hover:text-white cursor-pointer transition-colors">Privacy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Terms</li>
                <li className="hover:text-white cursor-pointer transition-colors">Security</li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold text-white/20 uppercase tracking-widest">
            <p>© 2025 DomainsDiscovery. All Rights Reserved.</p>
            <div className="flex gap-8">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
