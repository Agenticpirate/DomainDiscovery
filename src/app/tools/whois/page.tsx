'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { WHOISLookup } from '@/components/domain/WHOISLookup';
import { useTheme } from '@/contexts/ThemeContext';

export default function WhoisPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />
      
      <Navigation activeTool="whois" />

      {/* Main Content */}
      <main className="relative pt-28">
        {/* Hero Section */}
        <section className="px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb items={[
              { label: 'Tools', href: '/' },
              { label: 'WHOIS Lookup' }
            ]} />
          </div>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
              <span className={`bg-gradient-to-r ${isLight ? 'from-slate-900 via-slate-800 to-slate-600' : 'from-white via-white to-white/60'} bg-clip-text text-transparent`}>
                WHOIS Lookup
              </span>
            </h1>
            <p className={`text-lg ${isLight ? 'text-slate-500' : 'text-white/50'} max-w-2xl mx-auto mb-8`}>
              Look up domain ownership history and registrant information instantly.
            </p>
          </div>
        </section>

        {/* WHOIS Tool */}
        <section className="px-6 pb-16">
          <div className="max-w-2xl mx-auto">
            <WHOISLookup />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
