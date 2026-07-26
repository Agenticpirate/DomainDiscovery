'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import type { LearnArticle, LearnClusterHub } from '@/lib/learnArticles';
import {
  extractFaqPairs,
  getArticleDefinition,
  getArticleKeyTakeaways,
  getArticleToc,
  isFaqSection,
} from '@/lib/learnArticles';
import { SITE_BRAND } from '@/lib/seoSiteFacts';

export type LearnArticleViewProps = {
  article: LearnArticle;
  cluster?: LearnClusterHub | null;
  related: Array<Pick<LearnArticle, 'slug' | 'title' | 'category'>>;
  moreTrending: Array<Pick<LearnArticle, 'slug' | 'title' | 'category'>>;
  toolCtas: Array<{ href: string; label: string }>;
};

/**
 * Mobile-first Learn article body:
 * - Sticky collapsible TOC (mobile) + sidebar TOC (desktop)
 * - Answer-first definition + key takeaways (AEO/GEO)
 * - Proper FAQ markup (not Q/A dump in a paragraph)
 * - Compact solid plates; theme-aware
 * Desktop layout preserved as two-column when space allows.
 */
export function LearnArticleView({
  article,
  cluster,
  related,
  moreTrending,
  toolCtas,
}: LearnArticleViewProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;

  const toc = useMemo(() => getArticleToc(article), [article]);
  const definition = useMemo(() => getArticleDefinition(article), [article]);
  const takeaways = useMemo(() => getArticleKeyTakeaways(article, 5), [article]);

  // Fully opaque fills — ambient dots only in page gutters, never through text/cards
  const solid = isLight ? '#ffffff' : '#0a0a0c';
  const solidInset = isLight ? '#f8fafc' : '#121214';
  // learn-plate / learn-plate-deep also forced opaque via page CSS
  const plate = `learn-plate border ${
    isLight
      ? 'border-slate-200 shadow-sm shadow-slate-900/[0.03]'
      : 'border-white/10'
  }`;
  const plateSoft = `learn-plate border ${
    isLight ? 'border-slate-200' : 'border-white/10'
  }`;
  const muted = isLight ? 'text-slate-500' : 'text-white/45';
  const secondary = isLight ? 'text-slate-600' : 'text-white/60';
  const chip = isLight
    ? 'bg-slate-100 text-slate-600 border-slate-200'
    : 'text-white/55 border-white/10';

  // Active section for TOC highlight
  useEffect(() => {
    if (typeof window === 'undefined' || toc.length === 0) return;
    const nodes = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => !!el);
    if (!nodes.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.25, 0.5] }
    );
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [toc]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTocOpen(false);
    setActiveId(id);
    if (typeof history !== 'undefined') {
      history.replaceState(null, '', `#${id}`);
    }
  };

  const continueLinks = useMemo(() => {
    const all = [...related, ...moreTrending];
    return all.filter((a, i, arr) => arr.findIndex((x) => x.slug === a.slug) === i).slice(0, 4);
  }, [related, moreTrending]);

  return (
    <div className="learn-article relative w-full min-w-0 max-w-full">
      {/* —— Compact hero (parent shell is solid — no dots through title) —— */}
      <header className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <span
            className={`rounded-full border px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide ${chip}`}
            style={!isLight ? { backgroundColor: solidInset } : undefined}
          >
            {article.category}
          </span>
          {article.trending && (
            <span
              className={`rounded-full border px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide ${
                isLight
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-amber-500/30 text-amber-200'
              }`}
              style={!isLight ? { backgroundColor: solidInset } : undefined}
            >
              Trending
            </span>
          )}
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] sm:text-[11px] ${muted}`}
            style={{ backgroundColor: isLight ? '#f8fafc' : solidInset, borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}
          >
            {article.readTime}
          </span>
          {article.publishedAt && (
            <time
              dateTime={article.publishedAt}
              className={`rounded-full border px-2 py-0.5 text-[10px] sm:text-[11px] ${muted}`}
              style={{ backgroundColor: isLight ? '#f8fafc' : solidInset, borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}
            >
              Updated {article.publishedAt}
            </time>
          )}
        </div>

        <p className="text-2xl sm:text-3xl mb-1 sm:mb-2" aria-hidden>
          {article.icon}
        </p>
        <h1 className="text-[1.45rem] sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.12] break-words">
          {article.title}
        </h1>
        <p
          className={`mt-2 sm:mt-3 text-[13px] sm:text-base leading-snug sm:leading-relaxed break-words ${secondary}`}
        >
          {article.description}
        </p>

        {/* E-E-A-T strip */}
        <div
          className={`mt-3 sm:mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-[11px] ${muted}`}
        >
          <span>
            By <strong className={isLight ? 'text-slate-800' : 'text-white/80'}>{SITE_BRAND.name}</strong>
          </span>
          <span aria-hidden>·</span>
          <span>Educational guide · free tools</span>
          <span aria-hidden className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Research, not registrar checkout</span>
        </div>

        <div className="mt-2.5 sm:mt-3 flex flex-wrap gap-1 sm:gap-1.5">
          {article.topics.map((t) => (
            <span
              key={t}
              className={`rounded-md border px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold ${chip}`}
              style={!isLight ? { backgroundColor: solidInset } : undefined}
            >
              {t}
            </span>
          ))}
        </div>
      </header>

      {/* —— Mobile sticky TOC (opaque — no glass bleed) —— */}
      <div
        className={`learn-article-sticky sm:hidden sticky top-[3.25rem] z-30 mt-3 -mx-1 px-1 py-1.5 border-b ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}
      >
        <button
          type="button"
          onClick={() => setTocOpen((v) => !v)}
          aria-expanded={tocOpen}
          className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left ${
            isLight ? 'border-slate-200' : 'border-white/10'
          }`}
          style={{ backgroundColor: solidInset }}
        >
          <span className="min-w-0">
            <span className={`block text-[9px] font-bold uppercase tracking-wider ${muted}`}>
              On this page
            </span>
            <span className="block text-[12px] font-semibold truncate">
              {toc.find((t) => t.id === activeId)?.heading || toc[0]?.heading || 'Contents'}
            </span>
          </span>
          <span
            className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold transition-transform ${
              tocOpen ? 'rotate-45' : ''
            } ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-white/70'}`}
            aria-hidden
          >
            +
          </span>
        </button>
        {tocOpen && (
          <nav
            aria-label="Table of contents"
            className={`mt-1.5 max-h-[55vh] overflow-y-auto rounded-xl border p-2 ${
              isLight ? 'border-slate-200' : 'border-white/10'
            }`}
            style={{ backgroundColor: solid }}
          >
            <ol className="space-y-0.5">
              {toc.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => scrollToId(item.id)}
                    className={`w-full text-left rounded-lg px-2.5 py-1.5 text-[12px] font-medium leading-snug break-words ${
                      activeId === item.id
                        ? isLight
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-black'
                        : isLight
                          ? 'text-slate-700 hover:bg-slate-50'
                          : 'text-white/70 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="opacity-50 tabular-nums mr-1.5 text-[10px]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {item.heading}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>

      <div className="mt-4 sm:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_13.5rem] lg:gap-8 lg:items-start">
        <div className="min-w-0 max-w-full">
          {/* —— AEO: answer-first definition —— */}
          <section
            className={`rounded-xl sm:rounded-2xl border p-3.5 sm:p-5 mb-3 sm:mb-5 ${plate}`}
            style={{ backgroundColor: solidInset }}
            data-aeo-definition="article"
            aria-labelledby="article-definition"
          >
            <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] mb-1 ${muted}`}>
              Quick answer
            </p>
            <h2 id="article-definition" className="text-[14px] sm:text-lg font-bold tracking-tight mb-1.5 sm:mb-2">
              What this guide covers
            </h2>
            <p className={`text-[12.5px] sm:text-[14px] leading-relaxed break-words ${secondary}`}>
              {definition}
            </p>
          </section>

          {/* —— Key takeaways (citable list) —— */}
          {takeaways.length > 0 && (
            <section
              className={`rounded-xl sm:rounded-2xl border p-3.5 sm:p-5 mb-3 sm:mb-5 ${plateSoft}`}
              style={{ backgroundColor: isLight ? '#f1f5f9' : solidInset }}
              aria-labelledby="key-takeaways"
            >
              <h2 id="key-takeaways" className="text-[13px] sm:text-base font-bold mb-2">
                Key takeaways
              </h2>
              <ul className="space-y-1.5 sm:space-y-2">
                {takeaways.map((t, i) => (
                  <li key={i} className="flex gap-2 min-w-0">
                    <span
                      className={`mt-0.5 shrink-0 flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black ${
                        isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={`text-[12px] sm:text-[13.5px] leading-snug break-words ${secondary}`}>
                      {t}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* —— Article body —— */}
          <article className="space-y-3 sm:space-y-4" itemScope itemType="https://schema.org/Article">
            <meta itemProp="headline" content={article.title} />
            <meta itemProp="description" content={article.description} />
            {article.publishedAt && (
              <meta itemProp="datePublished" content={article.publishedAt} />
            )}

            {article.sections.map((section, sIdx) => {
              const tocItem = toc[sIdx];
              const id = tocItem?.id || `section-${sIdx}`;
              const faqPairs = isFaqSection(section) ? extractFaqPairs(section) : [];

              if (faqPairs.length > 0) {
                return (
                  <section
                    key={id}
                    id={id}
                    className={`scroll-mt-28 sm:scroll-mt-24 rounded-xl sm:rounded-2xl border p-3.5 sm:p-6 min-w-0 overflow-hidden ${plate}`}
                    style={{ backgroundColor: solidInset }}
                    aria-labelledby={`${id}-h`}
                  >
                    <h2 id={`${id}-h`} className="text-[15px] sm:text-xl font-bold mb-2.5 sm:mb-3 break-words">
                      {section.heading}
                    </h2>
                    <div className="space-y-2 sm:space-y-2.5" itemScope itemType="https://schema.org/FAQPage">
                      {faqPairs.map((faq, fi) => (
                        <div
                          key={fi}
                          className={`rounded-lg sm:rounded-xl border p-2.5 sm:p-3.5 min-w-0 ${
                            isLight ? 'border-slate-100' : 'border-white/[0.06]'
                          }`}
                          style={{ backgroundColor: solid }}
                          itemScope
                          itemProp="mainEntity"
                          itemType="https://schema.org/Question"
                        >
                          <h3
                            className="text-[12.5px] sm:text-[14px] font-bold leading-snug break-words"
                            itemProp="name"
                          >
                            {faq.question}
                          </h3>
                          <div
                            itemScope
                            itemProp="acceptedAnswer"
                            itemType="https://schema.org/Answer"
                            className="mt-1"
                          >
                            <p
                              className={`text-[12px] sm:text-[13.5px] leading-relaxed break-words ${secondary}`}
                              itemProp="text"
                            >
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              return (
                <section
                  key={id}
                  id={id}
                  className={`scroll-mt-28 sm:scroll-mt-24 rounded-xl sm:rounded-2xl border p-3.5 sm:p-6 min-w-0 overflow-hidden ${plate}`}
                  style={{ backgroundColor: solidInset }}
                  aria-labelledby={`${id}-h`}
                >
                  <h2 id={`${id}-h`} className="text-[15px] sm:text-xl font-bold mb-2 sm:mb-3 break-words">
                    {section.heading}
                  </h2>
                  {section.body.map((para, i) => (
                    <p
                      key={i}
                      className={`text-[13px] sm:text-[15px] leading-relaxed mb-2.5 sm:mb-3 last:mb-0 break-words ${secondary}`}
                    >
                      {para}
                    </p>
                  ))}
                </section>
              );
            })}
          </article>

          {/* —— Tools CTA —— */}
          <section
            className={`mt-4 sm:mt-8 rounded-xl sm:rounded-2xl border p-3.5 sm:p-6 ${plateSoft}`}
            style={{ backgroundColor: isLight ? '#f1f5f9' : solidInset }}
            aria-labelledby="try-tools"
          >
            <h2 id="try-tools" className="text-[14px] sm:text-base font-bold mb-1 sm:mb-2">
              Try DomainDiscovery tools
            </h2>
            <p className={`text-[12px] sm:text-sm mb-2.5 sm:mb-3 break-words ${secondary}`}>
              {SITE_BRAND.name} is free domain name search plus geo lists, WHOIS, bulk checks, and price
              compare — no account required.
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {toolCtas.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className={`rounded-lg sm:rounded-xl border px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm font-semibold transition-colors ${
                    isLight
                      ? 'border-slate-200 text-slate-800 hover:border-slate-300'
                      : 'border-white/15 text-white/85 hover:border-white/30'
                  }`}
                  style={{ backgroundColor: solid }}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </section>

          {/* —— Primary actions —— */}
          <div className="mt-4 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2">
            <Link
              href="/"
              className={`rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-sm font-bold ${
                isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
              }`}
            >
              Search domains
            </Link>
            <Link
              href="/learn"
              className={`rounded-xl border px-3.5 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-sm font-semibold ${
                isLight
                  ? 'border-slate-200 text-slate-800'
                  : 'border-white/15 text-white/80'
              }`}
              style={{ backgroundColor: solidInset }}
            >
              All guides
            </Link>
            <Link
              href="/faq"
              className={`rounded-xl border px-3.5 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-sm font-semibold ${
                isLight
                  ? 'border-slate-200 text-slate-800'
                  : 'border-white/15 text-white/80'
              }`}
              style={{ backgroundColor: solidInset }}
            >
              FAQ
            </Link>
          </div>

          {cluster && (
            <section
              className={`mt-6 sm:mt-10 rounded-xl sm:rounded-2xl border p-3.5 sm:p-5 ${plate}`}
              style={{ backgroundColor: solidInset }}
              aria-labelledby="topic-cluster"
            >
              <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] mb-1 ${muted}`}>
                Topic cluster
              </p>
              <h2 id="topic-cluster" className="text-[14px] sm:text-lg font-bold mb-1 break-words">
                {cluster.title}
              </h2>
              <p className={`text-[12px] sm:text-sm mb-2.5 sm:mb-3 break-words ${secondary}`}>
                {cluster.description}
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {cluster.hubSlug !== article.slug && (
                  <Link
                    href={`/learn/${cluster.hubSlug}`}
                    className={`rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-bold ${
                      isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
                    }`}
                  >
                    Cluster hub
                  </Link>
                )}
                <Link
                  href={cluster.toolHref}
                  className={`rounded-full border px-3 py-1.5 text-[11px] sm:text-xs font-semibold ${
                    isLight
                      ? 'border-slate-200 text-slate-700'
                      : 'border-white/15 text-white/80'
                  }`}
                  style={{ backgroundColor: solid }}
                >
                  {cluster.toolLabel}
                </Link>
                <Link
                  href="/learn"
                  className={`rounded-full border px-3 py-1.5 text-[11px] sm:text-xs font-semibold ${
                    isLight
                      ? 'border-slate-200 text-slate-700'
                      : 'border-white/15 text-white/80'
                  }`}
                  style={{ backgroundColor: solid }}
                >
                  All clusters
                </Link>
              </div>
            </section>
          )}

          {continueLinks.length > 0 && (
            <section
              className={`mt-8 sm:mt-12 border-t pt-6 sm:pt-8 ${
                isLight ? 'border-slate-200' : 'border-white/5'
              }`}
              aria-labelledby="continue-learning"
            >
              <h2 id="continue-learning" className="text-[15px] sm:text-lg font-bold mb-2.5 sm:mb-3">
                Continue learning
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {continueLinks.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/learn/${a.slug}`}
                    className={`rounded-xl border p-3 sm:p-3.5 transition-colors min-w-0 ${
                      isLight
                        ? 'border-slate-200 hover:border-slate-300'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{ backgroundColor: solidInset }}
                  >
                    <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wide ${muted}`}>
                      {a.category}
                    </div>
                    <div className="mt-0.5 text-[13px] sm:text-sm font-semibold leading-snug break-words">
                      {a.title}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* —— Desktop sticky TOC —— */}
        <aside className="hidden lg:block sticky top-24 self-start">
          <nav
            aria-label="Table of contents"
            className={`rounded-2xl border p-3.5 ${plate}`}
            style={{ backgroundColor: solidInset }}
          >
            <p className={`text-[10px] font-bold uppercase tracking-[0.14em] mb-2 ${muted}`}>
              On this page
            </p>
            <ol className="space-y-0.5">
              {toc.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => scrollToId(item.id)}
                    className={`w-full text-left rounded-lg px-2 py-1.5 text-[11.5px] font-medium leading-snug transition-colors ${
                      activeId === item.id
                        ? isLight
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-black'
                        : isLight
                          ? 'text-slate-600 hover:bg-slate-50'
                          : 'text-white/55 hover:bg-white/[0.05] hover:text-white/80'
                    }`}
                  >
                    <span className="opacity-40 tabular-nums mr-1 text-[10px]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {item.heading}
                  </button>
                </li>
              ))}
            </ol>
            <div className={`mt-3 pt-3 border-t ${isLight ? 'border-slate-100' : 'border-white/8'}`}>
              <Link
                href="/"
                className={`block text-center rounded-xl px-3 py-2 text-[12px] font-bold ${
                  isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
                }`}
              >
                Search domains
              </Link>
            </div>
          </nav>
        </aside>
      </div>

      {/* —— Mobile sticky bottom CTA (opaque) —— */}
      <div
        className={`learn-article-sticky sm:hidden fixed bottom-0 inset-x-0 z-40 border-t px-3 py-2 safe-pb ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}
      >
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Link
            href="/"
            className={`flex-1 text-center rounded-xl py-2.5 text-[12px] font-bold ${
              isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
            }`}
          >
            Search domains
          </Link>
          <Link
            href={cluster?.toolHref || '/generator'}
            className={`flex-1 text-center rounded-xl border py-2.5 text-[12px] font-semibold ${
              isLight
                ? 'border-slate-200 text-slate-800'
                : 'border-white/15 text-white/85'
            }`}
            style={{ backgroundColor: solidInset }}
          >
            {cluster?.toolLabel || 'AI generator'}
          </Link>
        </div>
      </div>
      {/* Spacer so sticky CTA doesn't cover content */}
      <div className="sm:hidden h-16" aria-hidden />
    </div>
  );
}
