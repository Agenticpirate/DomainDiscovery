'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { DomainExtensionsView } from '@/components/domain/DomainExtensionsView';
import { useTheme } from '@/contexts/ThemeContext';

export default function DomainExtensionsPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="min-h-screen">
      <PageBackground variant="hero" />
      
      <Navigation activeTool="extensions" />

      {/* Main Content */}
      <main className="relative pt-28">
        {/* Hero Section */}
        <section className="px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb items={[
              { label: 'Search', href: '/' },
              { label: 'Domain Extensions' }
            ]} />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
              <span className={`bg-gradient-to-r ${isLight ? 'from-slate-900 via-slate-800 to-slate-600' : 'from-white via-white to-white/60'} bg-clip-text text-transparent`}>
                Domain Extensions
              </span>
            </h1>
            <p className={`text-lg ${isLight ? 'text-slate-500' : 'text-white/50'} max-w-2xl mb-8`}>
              Explore hundreds of TLD options. Find the perfect extension for your brand.
            </p>
          </div>
        </section>

        {/* Extensions View */}
        <section className="px-6 pb-16">
          <div className="max-w-7xl mx-auto">
            <DomainExtensionsView />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
