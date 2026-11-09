import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildSeoPageMetadata } from '@/lib/seo/pageMeta';
import { SeoPageShell } from '@/components/seo/SeoPageShell';
import { FaqSection } from '@/components/seo/FaqSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import {
  ALTERNATIVES,
  ALTERNATIVES_DISCLAIMER,
  CHECK_THEIR_SITE,
  OUR_OFFER,
  getAlternative,
  getAlternativeSlugs,
} from '@/lib/alternatives';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAlternativeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const alt = getAlternative(slug);
  if (!alt) return { title: 'Page not found' };
  return buildSeoPageMetadata({
    title: alt.title,
    description: alt.description,
    path: `/alternatives/${alt.slug}`,
    keywords: [alt.searchTerm.toLowerCase(), `${alt.name} alternative`, 'domain search tool'],
  });
}

export default async function AlternativePage(props: PageProps) {
  const { slug } = await props.params;
  const alt = getAlternative(slug);
  if (!alt) notFound();

  const rows: { feature: string; ours: string; theirs: string }[] = [
    { feature: 'What it is', ours: 'Domain search, bulk checks, an AI generator, WHOIS, price comparison and leads.', theirs: alt.focus },
    ...OUR_OFFER.map((o) => ({ feature: o.label, ours: o.text, theirs: alt.shutDown ? 'Not applicable: the service has shut down.' : CHECK_THEIR_SITE })),
  ];

  return (
    <SeoPageShell
      path={`/alternatives/${alt.slug}`}
      title={alt.title}
      description={alt.description}
      h1={alt.shutDown ? `${alt.name} alternative: it has shut down` : `${alt.name} alternative`}
      intro={alt.whatItIs}
      crumbs={[{ label: 'Alternatives', href: '/alternatives' }, { label: alt.name }]}
    >
      <section className="mt-8 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
        <h2 className="text-lg font-bold mb-3">What DomainDiscovery offers</h2>
        <ul className="space-y-2 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
          {OUR_OFFER.map((o) => (
            <li key={o.href}>
              <Link href={o.href} className="font-semibold text-white/90 hover:underline">
                {o.label}
              </Link>
              : {o.text}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/search"
            className="rounded-xl border border-white/15 bg-white px-4 py-2.5 text-[14px] font-semibold text-black hover:bg-white/90"
          >
            Search a domain
          </Link>
          <Link
            href="/bulk-search"
            className="rounded-xl border border-white/15 bg-black px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-white/[0.05]"
          >
            Try bulk search
          </Link>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
        <h2 className="text-lg font-bold mb-3">{alt.name} and DomainDiscovery side by side</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <caption className="sr-only">Comparison of {alt.name} and DomainDiscovery</caption>
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                <th scope="col" className="py-2 pr-3 font-bold">Feature</th>
                <th scope="col" className="py-2 pr-3 font-bold">DomainDiscovery</th>
                <th scope="col" className="py-2 font-bold">{alt.name}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature} className="border-b border-white/5 align-top last:border-0">
                  <th scope="row" className="py-2.5 pr-3 font-semibold text-white/90">{row.feature}</th>
                  <td className="py-2.5 pr-3" style={{ color: 'var(--text-secondary)' }}>{row.ours}</td>
                  <td className="py-2.5" style={{ color: 'var(--text-secondary)' }}>{row.theirs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {ALTERNATIVES_DISCLAIMER}
        </p>
      </section>

      <FaqSection items={alt.faqs} />
      <RelatedLinks
        title="Related"
        links={[
          { href: '/alternatives', label: 'All alternatives', description: 'Other domain search tools.' },
          ...ALTERNATIVES.filter((a) => a.slug !== alt.slug)
            .slice(0, 3)
            .map((a) => ({ href: `/alternatives/${a.slug}`, label: a.searchTerm })),
        ]}
      />
    </SeoPageShell>
  );
}
