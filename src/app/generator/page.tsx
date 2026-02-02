'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { DomainGenerator } from '@/components/generator/DomainGenerator';
import { GeneratorContent } from '@/components/generator/GeneratorContent';

export default function GeneratorPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PageBackground variant="hero" />
      
      <Navigation activeTool="generator" />

      {/* Main Content */}
      <main className="relative pt-28">
        {/* Hero Section */}
        <section className="px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb items={[
              { label: 'Home', href: '/' },
              { label: 'Domain Generator' }
            ]} />
          </div>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                Domain Name Generator
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto mb-8">
              Generate hundreds of creative domain name ideas instantly. Find the perfect name for your website, business, or project.
            </p>
          </div>
        </section>

        {/* Generator */}
        <section className="px-6 pb-16" id="top">
          <div className="max-w-5xl mx-auto">
            <DomainGenerator onSelect={setSelectedDomain} />
          </div>
        </section>

        {/* Educational Content & FAQs */}
        <section className="border-t border-white/5">
          <GeneratorContent />
        </section>
      </main>

      <Footer />
    </div>
  );
}
