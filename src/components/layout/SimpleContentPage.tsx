'use client';

import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/PageBackground';
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
}

export function SimpleContentPage({
  activeTool,
  title,
  description,
  sections,
  cta,
}: SimpleContentPageProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />
      <Navigation activeTool={activeTool} />

      <main className="relative pt-20 sm:pt-24 pb-10 sm:pb-14">
        <section className="px-3 sm:px-6 pb-6 sm:pb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-3 sm:mb-4">
              {title}
            </h1>
            <p className={`text-sm sm:text-lg max-w-2xl mx-auto ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              {description}
            </p>
          </div>
        </section>

        <section className="px-3 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            {sections.map((section) => (
              <article
                key={section.heading}
                className={`shine-border group ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-white/[0.02] border-white/10'
                } border rounded-2xl p-4 sm:p-6`}
              >
                <h2 className={`text-lg sm:text-xl font-bold mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {section.heading}
                </h2>
                <div className="space-y-3">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/60'}`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}

            {cta && (
              <div
                className={`shine-border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/10'
                } border rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}
              >
                <div>
                  <div className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Continue exploring
                  </div>
                  <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                    Jump back into the core tools.
                  </p>
                </div>
                <Link
                  href={cta.href}
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-black hover:bg-white/90'
                  }`}
                >
                  {cta.label}
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
