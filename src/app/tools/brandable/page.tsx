'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { BrandableDomainFinder } from '@/components/domain/BrandableDomainFinder';
import { useTheme } from '@/contexts/ThemeContext';

export default function BrandablePage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />
      
      <Navigation activeTool="brandable" />

      {/* Main Content */}
      <main className="relative pt-[4.75rem] sm:pt-24">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 pb-5 sm:pb-7">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb items={[
              { label: 'Tools', href: '/' },
              { label: 'Brandable Domains' }
            ]} />
          </div>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl md:text-[3.9rem] font-black tracking-tight mb-3">
              <span className={`bg-gradient-to-r ${isLight ? 'from-slate-900 via-slate-800 to-slate-600' : 'from-white via-white to-white/60'} bg-clip-text text-transparent`}>
                Brandable Domains
              </span>
            </h1>
            <p className={`text-sm sm:text-base ${isLight ? 'text-slate-500' : 'text-white/50'} max-w-2xl mx-auto mb-5 sm:mb-6`}>
              Discover unique, memorable brandable domain names for your business.
            </p>
          </div>
        </section>

        {/* Brandable Finder */}
        <section className="px-4 sm:px-6 pb-12 sm:pb-14">
          <div className="max-w-2xl mx-auto">
            <BrandableDomainFinder onSelect={setSelectedDomain} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
