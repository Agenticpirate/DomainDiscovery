'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { DomainLeadsView } from '@/components/leads/DomainLeadsView';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { useTheme } from '@/contexts/ThemeContext';
import { ds } from '@/lib/ds';

export default function LeadsPage() {
  const { messages, href } = useLocale();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;

  return (
    <div className={`page-x-lock min-h-screen ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-black text-white'}`}>
      <PageBackground variant="hero" />
      <Navigation activeTool="leads" />

      <main className={`${PAGE_MAIN_CLASS} pb-10 sm:pb-14`}>
        <PageBreadcrumb
          items={[
            { label: messages.nav.tools || 'Tools', href: href('/') },
            { label: messages.crumbs?.leads || 'Domain Leads' },
          ]}
        />

        {/* Hero Section with subtle ambient bubble field */}
        <SectionAmbient
          intensity="hero"
          className="w-full"
          contentClassName="page-gutter pt-2 sm:pt-4 pb-4 sm:pb-6"
        >
          <div className="max-w-3xl mx-auto text-center">
            {/* Dedicated Domain Leads Brand Badge */}
            <div className={`${ds.badgeInk} relative isolate mb-2 hidden sm:inline-flex`}>
              <span className="relative z-[1] inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <span>330M+ Registered Domains · Real-Time Outbound Lead Discovery</span>
              </span>
            </div>

            <h1 className="text-[1.35rem] sm:text-3xl md:text-4xl font-semibold tracking-tight leading-[1.08] mb-1 sm:mb-2">
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage: isLight
                    ? 'linear-gradient(to right, #0a0a0a, #434a4d)'
                    : 'linear-gradient(to right, #fff, #fff, rgba(255,255,255,0.65))',
                }}
              >
                Find Qualified Buyers for Your Domains
              </span>
            </h1>
            <p className={`hidden sm:block text-[13px] sm:text-[14px] leading-relaxed max-w-xl mx-auto ${ds.body}`}>
              Discover commercial companies operating on alternative extensions (.co, .io, .ai, ccTLDs) who need to upgrade to the definitive .com. Filter active developed websites from parked pages and pitch qualified buyers.
            </p>
          </div>
        </SectionAmbient>

        <div className="page-gutter pt-2 sm:pt-4 pb-3 sm:pb-5">
          <div className="max-w-6xl mx-auto space-y-12">
            <DomainLeadsView />
            <nav aria-label="Domain lead guides" className="text-center text-[13px]">
              <Link href="/domain-leads" className="underline underline-offset-4 opacity-80 hover:opacity-100">
                Domain lead guides
              </Link>
              <span className="mx-2 opacity-40">·</span>
              <Link href="/domain-leads/find-domain-buyers" className="underline underline-offset-4 opacity-80 hover:opacity-100">
                How to find domain buyers
              </Link>
            </nav>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
