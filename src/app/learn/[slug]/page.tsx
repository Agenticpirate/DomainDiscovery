import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import {
  getClusterForSlug,
  getLearnArticle,
  getLearnSlugs,
  getRelatedArticles,
  getTrendingArticles,
} from '@/lib/learnArticles';
import { getSiteBaseUrl, SITE_BRAND } from '@/lib/seoSiteFacts';

type PageProps = { params: { slug: string } };

const BASE = getSiteBaseUrl();

export function generateStaticParams() {
  return getLearnSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const article = getLearnArticle(params.slug);
  if (!article) {
    return { title: 'Guide not found' };
  }
  const title =
    article.title.length > 55 ? `${article.title.slice(0, 52)}…` : article.title;
  const description =
    article.description.length > 155
      ? `${article.description.slice(0, 152)}…`
      : article.description;

  return {
    title,
    description,
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      url: `${BASE}/learn/${article.slug}`,
      publishedTime: article.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
    },
    alternates: {
      canonical: `${BASE}/learn/${article.slug}`,
    },
  };
}

export default function LearnArticlePage({ params }: PageProps) {
  const article = getLearnArticle(params.slug);
  if (!article) notFound();

  const related = getRelatedArticles(article, 4);
  const cluster = getClusterForSlug(article.slug);

  const moreTrending = getTrendingArticles(6)
    .filter((a) => a.slug !== article.slug && !related.some((r) => r.slug === a.slug))
    .slice(0, 3);

  const pageUrl = `${BASE}/learn/${article.slug}`;
  const datePublished = article.publishedAt || '2026-07-22';

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished,
    dateModified: datePublished,
    mainEntityOfPage: pageUrl,
    author: {
      '@type': 'Organization',
      name: SITE_BRAND.name,
      alternateName: [...SITE_BRAND.alternateNames],
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_BRAND.name,
      alternateName: [...SITE_BRAND.alternateNames],
      logo: {
        '@type': 'ImageObject',
        url: `${BASE}/logo.png`,
      },
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Learn', item: `${BASE}/learn` },
      { '@type': 'ListItem', position: 3, name: article.title, item: pageUrl },
    ],
  };

  const toolCtas = [
    { href: '/', label: 'Domain search' },
    { href: '/tools/geo', label: 'Geo domains' },
    { href: '/tools/whois', label: 'WHOIS lookup' },
    { href: '/tools/compare', label: 'Price compare' },
    { href: '/generator', label: 'AI generator' },
    { href: '/bulk-search', label: 'Bulk check' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <PageBackground variant="default" />
      <Navigation activeTool="learn" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <main className="relative pt-20 sm:pt-24 px-4 sm:px-6 pb-14">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Learn', href: '/learn' },
              { label: article.title },
            ]}
          />

          <header className="mt-5 sm:mt-7">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/55">
                {article.category}
              </span>
              {article.trending && (
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-200">
                  Trending
                </span>
              )}
              <span className="text-[11px] text-white/35">{article.readTime}</span>
              {article.publishedAt && (
                <span className="text-[11px] text-white/35">Updated {article.publishedAt}</span>
              )}
            </div>
            <div className="text-3xl mb-2" aria-hidden>
              {article.icon}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
              {article.title}
            </h1>
            <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {article.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {article.topics.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] font-semibold text-white/45"
                >
                  {t}
                </span>
              ))}
            </div>
          </header>

          <article className="mt-8 space-y-4">
            {article.sections.map((section) => (
              <section
                key={section.heading}
                className="rounded-2xl border border-white/10 bg-[#0c0c0e] p-5 sm:p-6"
              >
                <h2 className="text-lg sm:text-xl font-bold mb-3">{section.heading}</h2>
                {section.body.map((para, i) => (
                  <p
                    key={i}
                    className="text-[14px] sm:text-[15px] leading-relaxed mb-3 last:mb-0"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {para}
                  </p>
                ))}
              </section>
            ))}
          </article>

          <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <h2 className="text-base font-bold mb-2">Try DomainDiscovery tools</h2>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              DomainDiscovery (Domain Discovery) is free domain name search plus geo lists, WHOIS, bulk
              checks, and price compare — no account required.
            </p>
            <div className="flex flex-wrap gap-2">
              {toolCtas.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="rounded-xl border border-white/15 px-3 py-2 text-xs sm:text-sm font-semibold text-white/85 hover:border-white/30 transition-colors"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/" className="rounded-xl bg-white text-black px-4 py-2.5 text-sm font-bold">
              Search domains
            </Link>
            <Link
              href="/learn"
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80"
            >
              All guides
            </Link>
            <Link
              href="/faq"
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80"
            >
              FAQ
            </Link>
          </div>

          {cluster && (
            <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35 mb-1">
                Topic cluster
              </p>
              <h2 className="text-base sm:text-lg font-bold mb-1">{cluster.title}</h2>
              <p className="text-sm text-white/50 mb-3">{cluster.description}</p>
              <div className="flex flex-wrap gap-2">
                {cluster.hubSlug !== article.slug && (
                  <Link
                    href={`/learn/${cluster.hubSlug}`}
                    className="rounded-full bg-white text-black px-3 py-1.5 text-xs font-bold"
                  >
                    Cluster hub
                  </Link>
                )}
                <Link
                  href={cluster.toolHref}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80"
                >
                  {cluster.toolLabel}
                </Link>
                <Link
                  href="/learn"
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80"
                >
                  All clusters
                </Link>
              </div>
            </section>
          )}

          {(related.length > 0 || moreTrending.length > 0) && (
            <section className="mt-12 border-t border-white/5 pt-8">
              <h2 className="text-lg font-bold mb-3">Continue learning</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {[...related, ...moreTrending]
                  .filter((a, i, arr) => arr.findIndex((x) => x.slug === a.slug) === i)
                  .slice(0, 4)
                  .map((a) => (
                    <Link
                      key={a.slug}
                      href={`/learn/${a.slug}`}
                      className="rounded-xl border border-white/10 bg-[#0c0c0e] p-3.5 hover:border-white/20 transition-colors"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wide text-white/35">
                        {a.category}
                      </div>
                      <div className="mt-1 text-sm font-semibold leading-snug">{a.title}</div>
                    </Link>
                  ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
