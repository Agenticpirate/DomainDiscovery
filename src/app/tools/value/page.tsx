'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { DomainValueEstimate } from '@/components/domain/DomainValueEstimate';
import { useTheme } from '@/contexts/ThemeContext';

export default function ValuePage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />
      
      <Navigation activeTool="value" />

      {/* Main Content */}
      <main className="relative pt-28">
        {/* Hero Section */}
        <section className="px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb items={[
              { label: 'Tools', href: '/' },
              { label: 'Domain Value Estimator' }
            ]} />
          </div>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
              <span className={`bg-gradient-to-r ${isLight ? 'from-slate-900 via-slate-800 to-slate-600' : 'from-white via-white to-white/60'} bg-clip-text text-transparent`}>
                Domain Value Estimator
              </span>
            </h1>
            <p className={`text-lg ${isLight ? 'text-slate-500' : 'text-white/50'} max-w-2xl mx-auto mb-8`}>
              Estimate how much a domain might be worth using real market data.
            </p>
          </div>
        </section>

        {/* Value Estimator */}
        <section className="px-6 pb-16">
          <div className="max-w-2xl mx-auto">
            <DomainValueEstimate />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
