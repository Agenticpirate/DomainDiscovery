'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { BulkDomainSearch } from '@/components/domain/BulkDomainSearch';

export default function BulkSearchPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PageBackground variant="hero" />
      
      <Navigation activeTool="bulk" />

      {/* Main Content */}
      <main className="relative pt-28 px-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={[
            { label: 'Search', href: '/' },
            { label: 'Bulk Domain Search' }
          ]} />
        </div>
        <BulkDomainSearch />
      </main>
      <Footer />
    </div>
  );
}
