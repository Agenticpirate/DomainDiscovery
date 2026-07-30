import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { LearnArticleView } from '@/components/learn/LearnArticleView';
import {
  extractFaqPairs,
  getArticleDefinition,
  getArticleKeyTakeaways,
  getArticleToc,
  getArticleWordCount,
  getClusterForSlug,
  getAllLearnSlugs,
  getLearnArticle,
  getRelatedArticles,
  getTrendingArticles,
  isFaqSection,
} from '@/lib/learnArticles';
import { getSiteBaseUrl, SITE_BRAND } from '@/lib/seoSiteFacts';

type PageProps = { params: { slug: string } };

const BASE = getSiteBaseUrl();

/**
 * Force-dynamic so the date gate (publishedAt ≤ today UTC) unlocks new
 * SEO drip articles every day without waiting on ISR or a redeploy.
 */
export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  // Include scheduled slugs so paths exist; page 404s until publishedAt.
  return getAllLearnSlugs().map((slug) => ({ slug }));
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
  const url = `${BASE}/learn/${article.slug}`;
  const keywords = [
    ...article.topics,
    article.category,
    'domain name',
    'domain search',
    SITE_BRAND.name,
  ];

  return {
    title,
    description,
    keywords,
    authors: [{ name: SITE_BRAND.name, url: BASE }],
    creator: SITE_BRAND.name,
    publisher: SITE_BRAND.name,
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      url,
      publishedTime: article.publishedAt,
      modifiedTime: article.publishedAt,
      section: article.category,
      tags: article.topics,
      siteName: SITE_BRAND.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
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
  const wordCount = getArticleWordCount(article);
  const toc = getArticleToc(article);
  const definition = getArticleDefinition(article);
  const takeaways = getArticleKeyTakeaways(article, 5);

  const faqPairs = article.sections
    .filter(isFaqSection)
    .flatMap((s) => extractFaqPairs(s));

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished,
    dateModified: datePublished,
    wordCount,
    keywords: article.topics.join(', '),
    articleSection: article.category,
    inLanguage: 'en-US',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    author: {
      '@type': 'Organization',
      name: SITE_BRAND.name,
      alternateName: [...SITE_BRAND.alternateNames],
      url: BASE,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_BRAND.name,
      alternateName: [...SITE_BRAND.alternateNames],
      url: BASE,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE}/logo-solid.png?v=20260730logo`,
        width: 512,
        height: 512,
      },
    },
    about: article.topics.map((t) => ({
      '@type': 'Thing',
      name: t,
    })),
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

  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': pageUrl,
    url: pageUrl,
    name: article.title,
    description: article.description,
    datePublished,
    dateModified: datePublished,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_BRAND.name,
      url: BASE,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[data-aeo-definition]', '#key-takeaways', 'h1'],
    },
    hasPart: toc.map((t) => ({
      '@type': 'WebPageElement',
      name: t.heading,
      url: `${pageUrl}#${t.id}`,
    })),
  };

  const faqLd =
    faqPairs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqPairs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        }
      : null;

  /** Crawlable outline for AI agents / non-JS (mirrors TOC). */
  const tocLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Table of contents — ${article.title}`,
    itemListElement: toc.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.heading,
      url: `${pageUrl}#${t.id}`,
    })),
  };

  const toolCtas = [
    { href: '/', label: 'Domain search' },
    { href: '/tools/geo', label: 'Geo domains' },
    { href: '/tools/whois', label: 'WHOIS lookup' },
    { href: '/tools/compare', label: 'Price compare' },
    { href: '/generator', label: 'AI generator' },
    { href: '/bulk-search', label: 'Bulk check' },
  ];

  /**
   * Ambient dots only in blank gutters — never under text/cards.
   * 1) Mask clears the center reading column
   * 2) Solid shell paints over anything left under content
   */
  const PAGE_DOT_CSS = `
/* Clear dots under the article column; keep them only at page edges */
.learn-article-page [data-ambient-dots="single"] {
  -webkit-mask-image: radial-gradient(
    ellipse 78% 92% at 50% 42%,
    transparent 0%,
    transparent 48%,
    rgba(0, 0, 0, 0.35) 68%,
    black 88%
  ) !important;
  mask-image: radial-gradient(
    ellipse 78% 92% at 50% 42%,
    transparent 0%,
    transparent 48%,
    rgba(0, 0, 0, 0.35) 68%,
    black 88%
  ) !important;
  -webkit-mask-repeat: no-repeat !important;
  mask-repeat: no-repeat !important;
  -webkit-mask-size: 100% 100% !important;
  mask-size: 100% 100% !important;
}

/* Opaque reading shell + cards */
.learn-article-page .learn-article-shell {
  background-color: #0a0a0c !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  isolation: isolate;
  position: relative;
  z-index: 1;
}
html.light .learn-article-page .learn-article-shell {
  background-color: #ffffff !important;
  border-color: #e2e8f0 !important;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
}
.learn-article-page .learn-article-shell .learn-plate {
  background-color: #121214 !important;
}
html.light .learn-article-page .learn-article-shell .learn-plate {
  background-color: #f8fafc !important;
}
.learn-article-page .learn-article-shell .learn-plate-deep {
  background-color: #0a0a0c !important;
}
html.light .learn-article-page .learn-article-shell .learn-plate-deep {
  background-color: #ffffff !important;
}
/* Sticky chrome stays opaque */
.learn-article-page .learn-article-sticky {
  background-color: #0a0a0c !important;
}
html.light .learn-article-page .learn-article-sticky {
  background-color: #ffffff !important;
}

.learn-article-page .shine-border::before,
.learn-article-page .shine-border::after {
  display: none !important;
  opacity: 0 !important;
  content: none !important;
}
`;

  return (
    <div
      className="learn-article-page min-h-screen overflow-x-clip"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
    >
      <style dangerouslySetInnerHTML={{ __html: PAGE_DOT_CSS }} />
      <PageBackground variant="default" />
      <Navigation activeTool="learn" />

      {/* JSON-LD — server-rendered for crawlers & LLM fetchers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tocLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      {/* Noscript / crawler-visible outline + definition (GEO/LLM) */}
      <div className="sr-only" aria-hidden="false">
        <h1>{article.title}</h1>
        <p>{definition}</p>
        <h2>Key takeaways</h2>
        <ul>
          {takeaways.map((t) => (
            <li key={t.slice(0, 40)}>{t}</li>
          ))}
        </ul>
        <h2>Table of contents</h2>
        <ol>
          {toc.map((t) => (
            <li key={t.id}>
              <a href={`#${t.id}`}>{t.heading}</a>
            </li>
          ))}
        </ol>
        {faqPairs.map((f) => (
          <div key={f.question}>
            <h3>{f.question}</h3>
            <p>{f.answer}</p>
          </div>
        ))}
      </div>

      <main className={`${PAGE_MAIN_CLASS} pb-4 sm:pb-14`}>
        <PageBreadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Learn', href: '/learn' },
            { label: article.title },
          ]}
        />
        <SectionAmbient
          intensity="hero"
          contentClassName="page-gutter pb-4 sm:pb-8 max-w-full min-w-0 overflow-x-clip"
        >
          <div className="max-w-3xl lg:max-w-5xl mx-auto w-full min-w-0 relative z-[1]">
            <div className="learn-article-shell rounded-xl sm:rounded-2xl border border-white/10 p-3 sm:p-5 md:p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]">
              <LearnArticleView
                article={article}
                cluster={cluster ?? null}
                related={related.map((a) => ({
                  slug: a.slug,
                  title: a.title,
                  category: a.category,
                }))}
                moreTrending={moreTrending.map((a) => ({
                  slug: a.slug,
                  title: a.title,
                  category: a.category,
                }))}
                toolCtas={toolCtas}
              />
            </div>
          </div>
        </SectionAmbient>
      </main>

      <Footer />
    </div>
  );
}
