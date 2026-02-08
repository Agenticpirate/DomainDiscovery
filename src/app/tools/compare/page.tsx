'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { PriceComparison } from '@/components/domain/PriceComparison';
import { useTheme } from '@/contexts/ThemeContext';

export default function ComparePage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />
      
      <Navigation activeTool="compare" />

      {/* Main Content */}
      <main className="relative pt-28">
        {/* Hero Section */}
        <section className="px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb items={[
              { label: 'Tools', href: '/' },
              { label: 'Price Comparison' }
            ]} />
          </div>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
              <span className={`bg-gradient-to-r ${isLight ? 'from-slate-900 via-slate-800 to-slate-600' : 'from-white via-white to-white/60'} bg-clip-text text-transparent`}>
                Price Comparison
              </span>
            </h1>
            <p className={`text-lg ${isLight ? 'text-slate-500' : 'text-white/50'} max-w-2xl mx-auto mb-8`}>
              Compare registrar pricing in real time to find the lowest prices.
            </p>
          </div>
        </section>

        {/* Price Comparison */}
        <section className="px-6 pb-16">
          <div className="max-w-2xl mx-auto">
            <PriceComparison domain="example.com" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
