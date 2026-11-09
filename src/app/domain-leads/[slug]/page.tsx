import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildSeoPageMetadata } from '@/lib/seo/pageMeta';
import { SeoPageShell } from '@/components/seo/SeoPageShell';
import { FaqSection } from '@/components/seo/FaqSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { LEAD_PAGES, getLeadPage, getLeadPageSlugs, getSellingGuides } from '@/lib/leadPages';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getLeadPageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const page = getLeadPage(slug);
  if (!page) return { title: 'Page not found' };
  return buildSeoPageMetadata({
    title: page.title,
    description: page.description,
    path: `/domain-leads/${page.slug}`,
    keywords: page.keywords,
  });
}

export default async function DomainLeadPage(props: PageProps) {
  const { slug } = await props.params;
  const page = getLeadPage(slug);
  if (!page) notFound();
  const guides = getSellingGuides();

  return (
    <SeoPageShell
      path={`/domain-leads/${page.slug}`}
      title={page.title}
      description={page.description}
      h1={page.h1}
      intro={page.intro}
      crumbs={[{ label: 'Domain leads', href: '/domain-leads' }, { label: page.h1 }]}
    >
      <div className="mt-6">
        <Link
          href="/tools/leads"
          className="inline-block rounded-xl border border-white/15 bg-white px-5 py-3 text-[15px] font-semibold text-black hover:bg-white/90"
        >
          Open the domain leads tool
        </Link>
      </div>

      <section className="mt-8 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
        <h2 className="text-lg font-bold mb-3">How it works</h2>
        <ol className="space-y-3 text-[14px]">
          {page.steps.map((step, i) => (
            <li key={step.heading} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 text-[12px] font-bold">
                {i + 1}
              </span>
              <div>
                <div className="font-semibold text-white/90">{step.heading}</div>
                <p className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <FaqSection items={page.faqs} />

      {guides.length > 0 && (
        <RelatedLinks
          title="Guides on selling domains"
          links={guides.map((g) => ({ href: `/learn/${g.slug}`, label: g.title, description: g.description }))}
        />
      )}
      <RelatedLinks
        title="Related"
        links={[
          { href: '/domain-leads', label: 'All domain lead guides' },
          ...LEAD_PAGES.filter((p) => p.slug !== page.slug).map((p) => ({ href: `/domain-leads/${p.slug}`, label: p.h1 })),
          { href: '/tools/whois', label: 'WHOIS lookup', description: 'Public registration data for a domain.' },
        ]}
      />
    </SeoPageShell>
  );
}
