'use client';

import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { BulkDomainSearch } from '@/components/domain/BulkDomainSearch';
import { AffiliateAdRail } from '@/components/ads/AffiliateAdRail';
import { LocalizedDefinition } from '@/components/i18n/LocalizedDefinition';
import { LocalizedGuidePack } from '@/components/i18n/LocalizedGuidePack';
import { useLocale, useT } from '@/components/i18n/LocaleProvider';
export default function BulkSearchPage() {
  const { messages, href } = useLocale();
  const t = useT();
  return (
    <div className="page-x-lock min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--bg-main)' }}>
      <PageBackground variant="hero" />

      <Navigation activeTool="bulk" />

      <main className={`${PAGE_MAIN_CLASS} pb-2`}>
        <PageBreadcrumb
          items={[
            { label: messages.nav.search, href: href('/search') },
            { label: messages.crumbs.bulk },
          ]}
        />
        <div className="page-gutter relative z-[1] w-full">
          <div className="max-w-7xl mx-auto">
            <BulkDomainSearch />
          </div>
        </div>
        <LocalizedDefinition id="bulk" compact />
        <LocalizedGuidePack pack="bulk" />
        <p className="page-gutter pt-4 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
          {t('Comparing tools?')}{' '}
          <Link href="/alternatives" className="underline underline-offset-4">
            {t('See domain search alternatives')}
          </Link>
        </p>
        {/* Big ad banner sits below FAQ / guide content */}
        <div className="pt-6 sm:pt-8 pb-4 sm:pb-6">
          <AffiliateAdRail placement="bulk" variant="billboard" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
