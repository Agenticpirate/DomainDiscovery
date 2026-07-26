import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { LearnCatalog } from '@/components/learn/LearnCatalog';
import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import {
  LEARN_CLUSTERS,
  getLearnArticle,
  getLearnArticles,
  getLearnCategories,
  getLearnMeta,
  getTrendingArticles,
} from '@/lib/learnArticles';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';

export const metadata: Metadata = {
  title: 'Domain Name Guides — Naming, SEO, Valuation & DNS',
  description:
    'Free guides on choosing a domain name, brandable vs keyword domains, geo domains, valuation, DNS, auctions, and registration strategy. Learn then search live availability.',
};

export default function LearnPage() {
  const articles = getLearnArticles();
  const categories = getLearnCategories();
  const meta = getLearnMeta();
  const trending = getTrendingArticles(8);

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />
      <Navigation activeTool="learn" />

      <main className={PAGE_MAIN_CLASS}>
        <PageBreadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Learn' }]} />
        <SectionAmbient intensity="page" contentClassName="page-gutter pb-4 sm:pb-7">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>
              {meta.count}+ free guides · naming · SEO · DNS
            </p>
            <h1 className="text-2xl sm:text-5xl md:text-[3.9rem] font-black tracking-tight mb-2 sm:mb-4">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, var(--gradient-hero-from), var(--gradient-hero-from), var(--gradient-hero-to))',
                }}
              >
                Domain name guides that help you choose &amp; rank
              </span>
            </h1>
            <p className="text-xs sm:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Practical education on brandable names, keyword domains, geo domains for local SEO, valuation, auctions,
              DNS, and legal basics — then apply what you learn with free domain name search, WHOIS, and price compare.
            </p>
          </div>
        </SectionAmbient>

        <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.learn} compact />

        {/* Trending strip */}
        <section className="px-3 sm:px-6 pb-5">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm sm:text-base font-bold">Trending now</h2>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Updated {meta.generatedAt}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {trending.map((a) => (
                <Link
                  key={a.slug}
                  href={`/learn/${a.slug}`}
                  className="shrink-0 rounded-xl border border-white/10 bg-[#0c0c0e] px-3 py-2.5 hover:border-white/25 transition-colors max-w-[220px]"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wide text-white/35">{a.category}</div>
                  <div className="mt-0.5 text-[13px] font-semibold leading-snug line-clamp-2">{a.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Phase D topic clusters */}
        <section className="px-3 sm:px-6 pb-6 sm:pb-8" aria-labelledby="learn-clusters-heading">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between gap-3 mb-3">
              <div>
                <h2 id="learn-clusters-heading" className="text-sm sm:text-base font-bold">
                  Start with a topic cluster
                </h2>
                <p className="text-[11px] sm:text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Product-aligned paths — builders first, investing secondary
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {LEARN_CLUSTERS.map((cluster) => {
                const hub = getLearnArticle(cluster.hubSlug);
                return (
                  <div
                    key={cluster.id}
                    className="rounded-xl border border-white/10 bg-[#0c0c0e] p-3.5 sm:p-4 flex flex-col"
                  >
                    <h3 className="text-[13px] sm:text-sm font-bold leading-snug">{cluster.title}</h3>
                    <p className="mt-1 text-[11px] sm:text-xs leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>
                      {cluster.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Link
                        href={`/learn/${cluster.hubSlug}`}
                        className="rounded-lg bg-white text-black px-2.5 py-1.5 text-[11px] font-bold"
                      >
                        {hub?.title ? 'Open hub' : 'Open guide'}
                      </Link>
                      <Link
                        href={cluster.toolHref}
                        className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white/75"
                      >
                        {cluster.toolLabel}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-3 sm:px-6 pb-8 sm:pb-14">
          <div className="max-w-5xl mx-auto">
            <LearnCatalog articles={articles} categories={categories} />
          </div>
        </section>

        <section className="px-3 sm:px-6 pb-8 sm:pb-14">
          <div className="max-w-5xl mx-auto">
            <div className="p-3.5 sm:p-6 border border-white/10 bg-[#0c0c0e] rounded-xl sm:rounded-2xl">
              <h2 className="text-base sm:text-2xl font-bold mb-1.5 sm:mb-3">Ready to apply what you learned?</h2>
              <p className="text-xs sm:text-base mb-3 sm:mb-5" style={{ color: 'var(--text-secondary)' }}>
                Search availability, compare regular registrar prices, or look up live RDAP data.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Link href="/" className="px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm bg-white text-black font-semibold rounded-lg">
                  Search domains
                </Link>
                <Link
                  href="/tools/compare"
                  className="px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm border border-white/15 text-white/80 font-semibold rounded-lg"
                >
                  Price compare
                </Link>
                <Link
                  href="/tools/whois"
                  className="px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm border border-white/15 text-white/80 font-semibold rounded-lg"
                >
                  WHOIS lookup
                </Link>
                <Link
                  href="/blog/tlds"
                  className="px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm border border-white/15 text-white/80 font-semibold rounded-lg"
                >
                  TLD encyclopedia
                </Link>
              </div>
              <p className="mt-4 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {meta.sourceNotes?.[0]}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
