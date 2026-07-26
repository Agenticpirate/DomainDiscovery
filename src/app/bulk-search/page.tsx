'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { BulkDomainSearch } from '@/components/domain/BulkDomainSearch';

export default function BulkSearchPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)' }}>
      {/* No ambient dots on bulk tool — solid surface for results readability */}
      <PageBackground variant="minimal" />

      <Navigation activeTool="bulk" />

      <main className={`${PAGE_MAIN_CLASS} pb-2`}>
        <PageBreadcrumb
          items={[
            { label: 'Search', href: '/' },
            { label: 'Bulk Domain Search' },
          ]}
        />
        <div className="page-gutter">
          <div className="max-w-7xl mx-auto">
            <BulkDomainSearch />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
