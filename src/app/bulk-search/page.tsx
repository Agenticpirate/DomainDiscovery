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
    <div className="page-x-lock min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--bg-main)' }}>
      <PageBackground variant="minimal" />

      <Navigation activeTool="bulk" />

      <main className={`${PAGE_MAIN_CLASS} pb-2`}>
        <PageBreadcrumb
          items={[
            { label: 'Search', href: '/' },
            { label: 'Bulk Domain Search' },
          ]}
        />
        <SectionAmbient intensity="hero" className="w-full" contentClassName="page-gutter relative z-[1]">
          <div className="max-w-7xl mx-auto">
            <BulkDomainSearch />
          </div>
        </SectionAmbient>
      </main>
      <Footer />
    </div>
  );
}
