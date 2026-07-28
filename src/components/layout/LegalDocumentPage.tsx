'use client';

import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { useTheme } from '@/contexts/ThemeContext';

export type LegalSection = {
  id?: string;
  heading: string;
  body?: string[];
  bullets?: string[];
};

export type LegalRelatedLink = { label: string; href: string };

export type LegalDocumentPageProps = {
  /** When true, omit DomainDiscovery nav/footer (ADA shell already wraps) */
  bare?: boolean;
  brandName: string;
  title: string;
  description: string;
  lastUpdated: string;
  effectiveDate?: string;
  contactEmail: string;
  sections: LegalSection[];
  relatedLinks?: LegalRelatedLink[];
  cta?: { href: string; label: string };
};

/** Opaque plate — ambient dots never show through legal cards/text */
function SolidPlate({
  isLight,
  children,
  className = '',
  tone = 'surface',
}: {
  isLight: boolean;
  children: React.ReactNode;
  className?: string;
  tone?: 'surface' | 'inset' | 'hero' | 'notice';
}) {
  const fill =
    tone === 'hero'
      ? isLight
        ? '#ffffff'
        : '#050505'
      : tone === 'notice'
        ? isLight
          ? '#fffbeb'
          : '#12100c'
        : tone === 'inset'
          ? isLight
            ? '#f8fafc'
            : '#121214'
          : isLight
            ? '#ffffff'
            : '#0c0c0e';
  const border =
    tone === 'notice'
      ? isLight
        ? 'border-amber-200'
        : 'border-amber-500/30'
      : isLight
        ? 'border-slate-200'
        : 'border-white/10';

  return (
    <div
      className={`relative isolate overflow-hidden border ${border} ${className}`}
      style={{ backgroundColor: fill }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ backgroundColor: fill }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

export function LegalDocumentPage({
  bare = false,
  brandName,
  title,
  description,
  lastUpdated,
  effectiveDate,
  contactEmail,
  sections,
  relatedLinks,
  cta,
}: LegalDocumentPageProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;

  const ink = isLight ? 'text-slate-900' : 'text-white';
  const muted = isLight ? 'text-slate-600' : 'text-white/60';
  const faint = isLight ? 'text-slate-600' : 'text-white/50';
  const chipFill = isLight ? '#ffffff' : '#121214';

  const documentBody = (
    <>
      {/* Hero — solid plate under title / meta so dots stay behind type */}
      <section className="relative z-10 px-3 sm:px-6 pb-4 sm:pb-6">
        <div className="max-w-3xl mx-auto">
          <SolidPlate isLight={isLight} tone="hero" className="rounded-3xl p-5 sm:p-8">
            <p className={`text-[10px] font-bold uppercase tracking-[0.16em] mb-2 ${faint}`}>
              {brandName} · Legal
            </p>
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 ${ink}`}>
              {title}
            </h1>
            <p className={`text-sm sm:text-base leading-relaxed ${faint}`}>{description}</p>
            <div
              className={`mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold ${faint}`}
            >
              <span>Last updated: {lastUpdated}</span>
              {effectiveDate && <span>Effective: {effectiveDate}</span>}
              <a
                href={`mailto:${contactEmail}`}
                className="underline underline-offset-2 hover:opacity-80"
              >
                {contactEmail}
              </a>
            </div>
          </SolidPlate>
        </div>
      </section>

      <section className="relative z-10 px-3 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {/* Important notice */}
          <SolidPlate
            isLight={isLight}
            tone="notice"
            className="shine-border rounded-2xl p-4 sm:p-5"
          >
            <p
              className={`text-xs sm:text-sm font-bold mb-1 ${
                isLight ? 'text-amber-900' : 'text-[#c4a574]'
              }`}
            >
              Important
            </p>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isLight ? 'text-amber-950' : 'text-white/70'
              }`}
            >
              This document is provided for transparency about how {brandName} operates. It is not
              legal advice. If you need advice for your situation, consult a qualified attorney. By
              using the service, you agree to the Terms of Use and this Privacy Policy (as
              applicable).
            </p>
          </SolidPlate>

          {/* TOC */}
          <SolidPlate
            isLight={isLight}
            className="shine-border rounded-2xl p-4 sm:p-5"
          >
            <nav aria-label="On this page">
              <p className={`text-[10px] font-bold uppercase tracking-[0.14em] mb-2 ${faint}`}>
                On this page
              </p>
              <ol className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {sections.map((s, i) => {
                  const id = s.id || `section-${i + 1}`;
                  return (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className={`text-[12px] font-semibold transition ${
                          isLight
                            ? 'text-slate-700 hover:text-slate-900'
                            : 'text-white/65 hover:text-white'
                        }`}
                      >
                        {i + 1}. {s.heading}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </SolidPlate>

          {sections.map((section, i) => {
            const id = section.id || `section-${i + 1}`;
            return (
              <article key={id} id={id} className="scroll-mt-24">
                <SolidPlate isLight={isLight} className="shine-border rounded-2xl p-4 sm:p-6">
                  <h2 className={`text-lg sm:text-xl font-bold mb-3 ${ink}`}>
                    {i + 1}. {section.heading}
                  </h2>
                  <div className="space-y-3">
                    {(section.body || []).map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 48)}
                        className={`text-sm sm:text-[15px] leading-relaxed ${muted}`}
                      >
                        {paragraph}
                      </p>
                    ))}
                    {section.bullets && section.bullets.length > 0 && (
                      <ul
                        className={`list-disc pl-5 space-y-1.5 text-sm sm:text-[15px] leading-relaxed ${muted}`}
                      >
                        {section.bullets.map((b) => (
                          <li key={b.slice(0, 64)}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </SolidPlate>
              </article>
            );
          })}

          {relatedLinks && relatedLinks.length > 0 && (
            <SolidPlate isLight={isLight} className="shine-border rounded-2xl p-4 sm:p-5">
              <p className={`text-sm font-bold mb-2 ${ink}`}>Related legal pages</p>
              <div className="flex flex-wrap gap-2">
                {relatedLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`relative isolate rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                      isLight
                        ? 'border-slate-200 text-slate-700 hover:border-slate-300'
                        : 'border-white/12 text-white/70 hover:border-white/25'
                    }`}
                    style={{ backgroundColor: chipFill }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </SolidPlate>
          )}

          {cta && (
            <SolidPlate
              isLight={isLight}
              tone="inset"
              className="shine-border rounded-2xl p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className={`text-base font-bold ${ink}`}>Questions?</div>
                  <p className={`text-sm ${faint}`}>
                    Email{' '}
                    <a
                      href={`mailto:${contactEmail}`}
                      className="underline underline-offset-2 font-semibold"
                    >
                      {contactEmail}
                    </a>
                  </p>
                </div>
                <Link
                  href={cta.href}
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    isLight
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-white text-black hover:bg-white/90'
                  }`}
                >
                  {cta.label}
                </Link>
              </div>
            </SolidPlate>
          )}
        </div>
      </section>
    </>
  );

  if (bare) {
    // ADA shell already provides intensity=hero bubble ambient (center-clear).
    // All sections below use SolidPlate so dots never show through text/badges.
    return (
      <main className="relative z-10 pt-8 sm:pt-10 pb-12 sm:pb-16">{documentBody}</main>
    );
  }

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />
      <Navigation />
      <main className={`${PAGE_MAIN_CLASS} pb-12 sm:pb-16`}>
        <PageBreadcrumb items={[{ label: 'Home', href: '/' }, { label: title }]} />
        <SectionAmbient intensity="hero" className="w-full min-h-[50vh]" contentClassName="page-gutter">
          <div className="relative z-10">{documentBody}</div>
        </SectionAmbient>
      </main>
      <Footer />
    </div>
  );
}
