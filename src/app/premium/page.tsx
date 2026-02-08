'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/PageBackground';
import { useTheme } from '@/contexts/ThemeContext';

export default function PremiumPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />
      
      <Navigation activeTool="premium" />

      {/* Main Content */}
      <main className="relative pt-28">
        {/* Hero Section */}
        <section className="px-6 pb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                Premium Domains
              </span>
            </h1>
            <p className={`text-lg ${isLight ? 'text-slate-500' : 'text-white/50'} max-w-2xl mx-auto mb-8`}>
              Discover premium domains available for sale or aftermarket auction.
            </p>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="px-6 pb-16">
          <div className="max-w-2xl mx-auto">
            <div className={`p-12 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/[0.02] border-amber-500/20'} border rounded-2xl text-center`}>
              <div className="text-6xl mb-6">⭐</div>
              <h2 className={`text-2xl font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Coming Soon</h2>
              <p className={`${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                We're curating a collection of premium domains from top marketplaces. 
                Check back soon to discover high-value domains for your business.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
