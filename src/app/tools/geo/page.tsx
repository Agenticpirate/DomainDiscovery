'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { GeoDomainGenerator } from '@/components/geo/GeoDomainGenerator';

export default function GeoPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PageBackground variant="hero" />
      
      <Navigation activeTool="geo" />

      {/* Main Content */}
      <main className="relative pt-28">
        {/* Hero Section */}
        <section className="px-6 pb-8">
          <div className="max-w-5xl mx-auto">
            <Breadcrumb items={[
              { label: 'Tools', href: '/' },
              { label: 'Geo Domain Generator' }
            ]} />
          </div>
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                Geo Domain Generator
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto mb-2">
              Generate location-based domain names for local SEO and regional marketing.
            </p>
            <p className="text-sm text-white/40 max-w-xl mx-auto">
              Combine your keyword with 200+ countries and 150+ major cities to find available geo-targeted domains.
            </p>
          </div>
        </section>

        {/* Generator Tool */}
        <section className="px-6 pb-16">
          <div className="max-w-5xl mx-auto">
            <GeoDomainGenerator />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
