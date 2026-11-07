import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildLocalizedToolMetadata } from '@/lib/i18n/metadata';
import { localeNavHref } from '@/lib/i18n/locales';
import { learnCategoryLabel, learnHubCopy, type LearnClusterId } from '@/lib/i18n/learnHub';
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
  isLearnTranslated,
  localizeLearnArticle,
} from '@/lib/learnArticles';
import { getRequestLocale } from '@/lib/i18n/request';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';
import { AffiliateAdRail } from '@/components/ads/AffiliateAdRail';
import { LearnIntro, LearnTrendingLabel } from '@/components/i18n/LocalizedSectionIntros';

export async function generateMetadata(): Promise<Metadata> {
  const copy = learnHubCopy(await getRequestLocale());
  return buildLocalizedToolMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: '/learn',
    keywords: copy.keywords,
  });
}

/** Always evaluate publishedAt against the current clock (SEO drip unlock). */
export const dynamic = 'force-dynamic';

export default async function LearnPage() {
  const locale = await getRequestLocale();
  const copy = learnHubCopy(locale);
  // Translated guides link to their localized URL; the rest link to the English canonical,
  // so a localized hub never sends crawlers to an unindexed copy.
  const guideHref = (slug: string) =>
    isLearnTranslated(slug, locale) ? localeNavHref(locale, `/learn/${slug}`) : `/learn/${slug}`;
  const all = getLearnArticles();
  // Localized hubs list guides in the visitor's language first; English-only guides follow.
  const ordered =
    locale === 'en'
      ? all
      : [...all.filter((a) => isLearnTranslated(a.slug, locale)), ...all.filter((a) => !isLearnTranslated(a.slug, locale))];
  const articles = ordered.map((article) => ({
    ...localizeLearnArticle(article, locale)!,
    categoryKey: article.category,
    href: guideHref(article.slug),
  }));
  const categories = getLearnCategories();
  const meta = getLearnMeta();
  const trending = getTrendingArticles(8).map((article) => ({
    ...localizeLearnArticle(article, locale)!,
    category: learnCategoryLabel(locale, article.category),
  }));
  const definition = {
    ...SITE_PAGE_DEFINITIONS.learn,
    question: copy.definitionQuestion,
    answer: copy.definitionAnswer,
    learnHref: SITE_PAGE_DEFINITIONS.learn.learnHref
      ? guideHref(SITE_PAGE_DEFINITIONS.learn.learnHref.replace(/^\/learn\//, ''))
      : undefined,
    learnLabel: copy.definitionLink,
  };
  const catalogLabels = {
    all: copy.all,
    trending: copy.trending,
    articles: copy.articles,
    searchPlaceholder: copy.searchPlaceholder,
    noMatch: copy.noMatch,
    categories: Object.fromEntries(categories.map((c) => [c, learnCategoryLabel(locale, c)])),
  };

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />
      <Navigation activeTool="learn" />

      <main className={PAGE_MAIN_CLASS}>
        <PageBreadcrumb items={[{ label: copy.home, href: '/' }, { label: copy.learn }]} />
        <SectionAmbient intensity="hero" contentClassName="page-gutter pb-4 sm:pb-7">
          <div className="max-w-4xl mx-auto text-center">
            <LearnIntro count={meta.count} />
          </div>
        </SectionAmbient>

        <CiteableDefinition definition={definition} eyebrow={copy.definitionEyebrow} compact />

        {/* Trending strip */}
        <section className="px-3 sm:px-6 pb-5">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm sm:text-base font-bold"><LearnTrendingLabel /></h2>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {copy.updated} {meta.generatedAt}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {trending.map((a) => (
                <Link
                  key={a.slug}
                  href={guideHref(a.slug)}
                  className="shrink-0 rounded-xl border border-white/10 bg-[#0a0a0a] px-3 py-2.5 hover:border-white/25 transition-colors max-w-[220px]"
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
                  {copy.clustersHeading}
                </h2>
                <p className="text-[11px] sm:text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {copy.clustersSub}
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {LEARN_CLUSTERS.map((cluster) => {
                const hub = getLearnArticle(cluster.hubSlug);
                const local = copy.clusters[cluster.id as LearnClusterId];
                return (
                  <div
                    key={cluster.id}
                    className="rounded-xl border border-white/10 bg-[#0a0a0a] p-3.5 sm:p-4 flex flex-col"
                  >
                    <h3 className="text-[13px] sm:text-sm font-bold leading-snug">{local?.title ?? cluster.title}</h3>
                    <p className="mt-1 text-[11px] sm:text-xs leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>
                      {local?.description ?? cluster.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Link
                        href={guideHref(cluster.hubSlug)}
                        className="rounded-lg bg-white text-black px-2.5 py-1.5 text-[11px] font-bold"
                      >
                        {hub?.title ? copy.openHub : copy.openGuide}
                      </Link>
                      <Link
                        href={localeNavHref(locale, cluster.toolHref)}
                        className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white/75"
                      >
                        {local?.tool ?? cluster.toolLabel}
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
            <LearnCatalog articles={articles} categories={categories} labels={catalogLabels} />
          </div>
        </section>

        <section className="px-3 sm:px-6 pb-8 sm:pb-14">
          <div className="max-w-5xl mx-auto">
            <div className="p-3.5 sm:p-6 border border-white/10 bg-[#0a0a0a] rounded-xl sm:rounded-2xl">
              <h2 className="text-base sm:text-2xl font-bold mb-1.5 sm:mb-3">{copy.ctaTitle}</h2>
              <p className="text-xs sm:text-base mb-3 sm:mb-5" style={{ color: 'var(--text-secondary)' }}>
                {copy.ctaBody}
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Link href={localeNavHref(locale, '/')} className="px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm bg-white text-black font-semibold rounded-lg">
                  {copy.ctaSearch}
                </Link>
                <Link
                  href={localeNavHref(locale, '/tools/compare')}
                  className="px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm border border-white/15 text-white/80 font-semibold rounded-lg"
                >
                  {copy.ctaCompare}
                </Link>
                <Link
                  href={localeNavHref(locale, '/tools/whois')}
                  className="px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm border border-white/15 text-white/80 font-semibold rounded-lg"
                >
                  {copy.ctaWhois}
                </Link>
                <Link
                  href={localeNavHref(locale, '/blog/tlds')}
                  className="px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm border border-white/15 text-white/80 font-semibold rounded-lg"
                >
                  {copy.ctaTlds}
                </Link>
              </div>
              <p className="mt-4 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {locale === 'en' ? meta.sourceNotes?.[0] : null}
              </p>
            </div>
          </div>
        </section>
        <div className="pt-2 pb-6">
          <AffiliateAdRail placement="learn" variant="auto" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
