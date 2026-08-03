'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { useTheme } from '@/contexts/ThemeContext';

export default function PremiumPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const solid = isLight ? '#ffffff' : '#0a0a0c';

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />

      <Navigation activeTool="premium" />

      <main className={`${PAGE_MAIN_CLASS} pb-10`}>
        <PageBreadcrumb
          items={[
            { label: 'Tools', href: '/tools/keyword' },
            { label: 'Premium Domains' },
          ]}
        />
        <SectionAmbient intensity="hero" className="w-full" contentClassName="relative z-[1]">
          <section className="page-gutter pb-5 sm:pb-7">
            <div
              className={`relative isolate overflow-hidden max-w-4xl mx-auto text-center rounded-2xl sm:rounded-3xl border p-5 sm:p-8 ${
                isLight ? 'border-slate-200' : 'border-white/10'
              }`}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{ backgroundColor: solid }}
              />
              <div className="relative z-[1]">
                <h1 className="text-3xl sm:text-5xl md:text-[3.9rem] font-black tracking-tight mb-3">
                  <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                    Premium Domains
                  </span>
                </h1>
                <p
                  className={`text-sm sm:text-base ${
                    isLight ? 'text-slate-500' : 'text-white/50'
                  } max-w-2xl mx-auto`}
                >
                  Discover premium domains available for sale or aftermarket auction.
                </p>
              </div>
            </div>
          </section>

          <section className="page-gutter pb-12 sm:pb-14">
            <div className="max-w-2xl mx-auto">
              <div
                className={`relative isolate overflow-hidden p-6 sm:p-8 border rounded-2xl text-center ${
                  isLight ? 'border-slate-200 shadow-sm' : 'border-amber-500/20'
                }`}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[inherit]"
                  style={{ backgroundColor: solid }}
                />
                <div className="relative z-[1]">
                  <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">⭐</div>
                  <h2
                    className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    Coming Soon
                  </h2>
                  <p className={`${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                    We&apos;re curating a collection of premium domains from top marketplaces. Check
                    back soon to discover high-value domains for your business.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </SectionAmbient>
      </main>

      <Footer />
    </div>
  );
}
