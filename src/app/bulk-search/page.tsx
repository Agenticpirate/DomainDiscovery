'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { BulkDomainSearch } from '@/components/domain/BulkDomainSearch';

export default function BulkSearchPage() {
  return (
    <div className="min-h-screen">
      <PageBackground variant="hero" />
      
      <Navigation activeTool="bulk" />

      {/* Main Content — ambient field on tool surface */}
      <main className={`${PAGE_MAIN_CLASS} pb-2`}>
        <PageBreadcrumb items={[
          { label: 'Search', href: '/' },
          { label: 'Bulk Domain Search' }
        ]} />
        <SectionAmbient intensity="page" contentClassName="page-gutter">
          <div className="max-w-7xl mx-auto">
            <BulkDomainSearch />
          </div>
        </SectionAmbient>
      </main>
      <Footer />
    </div>
  );
}
