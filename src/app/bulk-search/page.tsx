'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { BulkDomainSearch } from '@/components/domain/BulkDomainSearch';
import { SeoGuidePack } from '@/components/seo/SeoGuidePack';
import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import { TOOL_GUIDE_PACKS } from '@/components/seo/toolGuidePacks';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';
import { useTheme } from '@/contexts/ThemeContext';

export default function BulkSearchPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="min-h-screen">
      <PageBackground variant="hero" />
      
      <Navigation activeTool="bulk" />

      {/* Main Content — same max width as rest of site */}
      <main className="relative pt-14 sm:pt-20 px-3 sm:px-4 pb-2">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={[
            { label: 'Search', href: '/' },
            { label: 'Bulk Domain Search' }
          ]} />
        </div>
        <div className="max-w-7xl mx-auto">
          <BulkDomainSearch />
        </div>
      </main>
      <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.bulk} compact />
      <SeoGuidePack {...TOOL_GUIDE_PACKS.bulk} />
      <Footer />
    </div>
  );
}
