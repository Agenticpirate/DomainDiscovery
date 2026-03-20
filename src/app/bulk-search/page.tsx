'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { BulkDomainSearch } from '@/components/domain/BulkDomainSearch';
import { useTheme } from '@/contexts/ThemeContext';

export default function BulkSearchPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="min-h-screen">
      <PageBackground variant="hero" />
      
      <Navigation activeTool="bulk" />

      {/* Main Content */}
      <main className="relative pt-20 sm:pt-24 px-4">
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
