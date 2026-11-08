import { Suspense } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { FaqSection } from '@/components/seo/FaqSection';
import { RelatedLinks, type RelatedLink } from '@/components/seo/RelatedLinks';
import type { FaqItem } from '@/lib/seo/pageMeta';

type Props = {
  path: string;
  crumb: string;
  metaTitle: string;
  description: string;
  h1: string;
  intro: string;
  notice?: string;
  widget: React.ReactNode;
  explainer: { heading: string; paragraphs: string[] };
  faqs: FaqItem[];
  related: RelatedLink[];
};

/** Server-rendered shell shared by the SEO tool landing pages. The widget is a client component. */
export function ToolPageShell(p: Props) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <ToolPageJsonLd
        path={p.path}
        name={p.metaTitle}
        description={p.description}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/search' },
          { name: p.crumb, path: p.path },
        ]}
      />
      <PageBackground variant="default" />
      <Navigation />
      <main className={`${PAGE_MAIN_CLASS} pb-14`}>
        <PageBreadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Tools', href: '/search' }, { label: p.crumb }]} />
        <SectionAmbient intensity="hero" className="w-full" contentClassName="page-gutter relative z-[1]">
          <div className="max-w-3xl mx-auto">
            <header className="mt-2 sm:mt-4">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{p.h1}</h1>
              <p className="mt-3 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                {p.intro}
              </p>
              {p.notice && (
                <p className="mt-4 rounded-xl border border-white/15 bg-[#0a0a0a] px-4 py-3 text-[13px] font-semibold text-white/85">
                  {p.notice}
                </p>
              )}
            </header>
            <Suspense fallback={<div className="mt-6 text-sm text-white/50">Loading…</div>}>{p.widget}</Suspense>
            <section className="mt-8 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
              <h2 className="text-lg font-bold mb-3">{p.explainer.heading}</h2>
              {p.explainer.paragraphs.map((para) => (
                <p key={para} className="text-[14px] sm:text-[15px] leading-relaxed mb-3 last:mb-0" style={{ color: 'var(--text-secondary)' }}>
                  {para}
                </p>
              ))}
            </section>
            <FaqSection items={p.faqs} />
            <RelatedLinks title="Related tools" links={p.related} />
          </div>
        </SectionAmbient>
      </main>
      <Footer />
    </div>
  );
}
