'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb } from '@/components/ui/Breadcrumb';
import { PAGE_MAIN_CLASS } from '@/components/ui/pageChrome';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { BulkDomainSearch } from '@/components/domain/BulkDomainSearch';
import { AffiliateAdRail } from '@/components/ads/AffiliateAdRail';
import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import { SeoGuidePack } from '@/components/seo/SeoGuidePack';
import { TOOL_GUIDE_PACKS } from '@/components/seo/toolGuidePacks';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';

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
        <SectionAmbient
          intensity="soft"
          className="w-full"
          contentClassName="page-gutter relative z-[1]"
        >
          <div className="max-w-7xl mx-auto">
            <BulkDomainSearch />
          </div>
        </SectionAmbient>
        <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.bulk} compact />
        <SeoGuidePack {...TOOL_GUIDE_PACKS.bulk} />
        {/* Big ad banner sits below FAQ / guide content */}
        <div className="pt-6 sm:pt-8 pb-4 sm:pb-6">
          <AffiliateAdRail placement="bulk" variant="billboard" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
