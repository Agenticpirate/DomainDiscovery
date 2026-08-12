'use client';

import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { PageBreadcrumb } from '@/components/ui/Breadcrumb';
import { PAGE_MAIN_CLASS } from '@/components/ui/pageChrome';
import { useTheme } from '@/contexts/ThemeContext';

interface SimpleContentPageProps {
  activeTool?: string;
  title: string;
  description: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
  cta?: {
    href: string;
    label: string;
  };
  /** Optional trail for page guide alignment */
  breadcrumbLabel?: string;
}

export function SimpleContentPage({
  activeTool,
  title,
  description,
  sections,
  cta,
  breadcrumbLabel,
}: SimpleContentPageProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const solid = isLight ? '#ffffff' : '#0a0a0c';

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />
      <Navigation activeTool={activeTool} />

      <main className={`${PAGE_MAIN_CLASS} pb-10 sm:pb-14`}>
        <PageBreadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: breadcrumbLabel || title },
          ]}
        />
        <SectionAmbient intensity="hero" className="w-full" contentClassName="page-gutter pb-6 sm:pb-8">
          <div className="relative z-[1] max-w-4xl mx-auto">
            {/* Hero plate — bubbles clear under title */}
            <div
              className={`relative isolate overflow-hidden rounded-2xl sm:rounded-3xl border p-5 sm:p-8 mb-4 sm:mb-6 text-center ${
                isLight ? 'border-slate-200' : 'border-white/10'
              }`}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{ backgroundColor: solid }}
              />
              <div className="relative z-[1]">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-3 sm:mb-4">
                  {title}
                </h1>
                <p
                  className={`text-sm sm:text-lg max-w-2xl mx-auto ${
                    isLight ? 'text-slate-500' : 'text-white/50'
                  }`}
                >
                  {description}
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {sections.map((section) => (
                <article
                  key={section.heading}
                  className={`relative isolate overflow-hidden shine-border border rounded-2xl p-4 sm:p-6 ${
                    isLight ? 'border-slate-200' : 'border-white/10'
                  }`}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit]"
                    style={{ backgroundColor: solid }}
                  />
                  <div className="relative z-[1]">
                    <h2
                      className={`text-lg sm:text-xl font-bold mb-3 ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {section.heading}
                    </h2>
                    <div className="space-y-3">
                      {section.body.map((paragraph) => (
                        <p
                          key={paragraph}
                          className={`text-sm sm:text-base leading-relaxed ${
                            isLight ? 'text-slate-600' : 'text-white/60'
                          }`}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </article>
              ))}

              {cta && (
                <div
                  className={`relative isolate overflow-hidden shine-border border rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    isLight ? 'border-slate-200' : 'border-white/10'
                  }`}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit]"
                    style={{ backgroundColor: isLight ? '#f8fafc' : '#0a0a0c' }}
                  />
                  <div className="relative z-[1]">
                    <div
                      className={`text-base sm:text-lg font-bold ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      Continue exploring
                    </div>
                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                      Jump back into the core tools.
                    </p>
                  </div>
                  <Link
                    href={cta.href}
                    className={`relative z-[1] inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isLight
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : 'bg-white text-black hover:bg-white/90'
                    }`}
                  >
                    {cta.label}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </SectionAmbient>
      </main>

      <Footer />
    </div>
  );
}
