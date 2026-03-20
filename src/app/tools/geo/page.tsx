'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { GeoDomainGenerator } from '@/components/geo/GeoDomainGenerator';
import { useTheme } from '@/contexts/ThemeContext';

export default function GeoPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="min-h-screen">
      <PageBackground variant="hero" />
      
      <Navigation activeTool="geo" />

      {/* Main Content */}
      <main className="relative pt-20 sm:pt-24">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 pb-5 sm:pb-7">
          <div className="max-w-5xl mx-auto">
            <Breadcrumb items={[
              { label: 'Tools', href: '/' },
              { label: 'Geo Domain Generator' }
            ]} />
          </div>
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl md:text-[3.9rem] font-black tracking-tight mb-3">
              <span className={`bg-gradient-to-r ${isLight ? 'from-slate-900 via-slate-800 to-slate-600' : 'from-white via-white to-white/60'} bg-clip-text text-transparent`}>
                Geo Domain Generator
              </span>
            </h1>
            <p className={`text-sm sm:text-base ${isLight ? 'text-slate-500' : 'text-white/50'} max-w-2xl mx-auto mb-2`}>
              Generate location-based domain names for local SEO and regional marketing.
            </p>
            <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-white/40'} max-w-xl mx-auto`}>
              Combine your keyword with 200+ countries and 150+ major cities to find available geo-targeted domains.
            </p>
          </div>
        </section>

        {/* Generator Tool */}
        <section className="px-4 sm:px-6 pb-12 sm:pb-14">
          <div className="max-w-5xl mx-auto">
            <GeoDomainGenerator />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
