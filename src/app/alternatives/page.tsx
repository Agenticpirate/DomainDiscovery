import type { Metadata } from 'next';
import { buildSeoPageMetadata } from '@/lib/seo/pageMeta';
import { SeoPageShell } from '@/components/seo/SeoPageShell';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { ALTERNATIVES, ALTERNATIVES_DISCLAIMER } from '@/lib/alternatives';

export const dynamic = 'force-dynamic';

const path = '/alternatives';
const title = 'Domain Search Tool Alternatives | DomainDiscovery';
const description =
  'Compare domain search tools and see what DomainDiscovery offers instead: bulk search, an AI name generator, WHOIS lookups, price comparison and domain leads.';

export function generateMetadata(): Metadata {
  return buildSeoPageMetadata({
    title,
    description,
    path,
    keywords: ['domain search alternatives', 'domain checker alternatives', 'bulk domain search alternative'],
  });
}

export default function AlternativesHubPage() {
  return (
    <SeoPageShell
      path={path}
      title={title}
      description={description}
      h1="Domain search tool alternatives"
      intro="Switching tools or looking for a replacement? Pick the service you know to see what DomainDiscovery offers for the same job."
      crumbs={[{ label: 'Alternatives' }]}
    >
      <RelatedLinks
        title="Alternatives"
        links={ALTERNATIVES.map((a) => ({
          href: `/alternatives/${a.slug}`,
          label: a.searchTerm,
          description: a.focus,
        }))}
      />
      <section className="mt-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
        <h2 className="text-lg font-bold mb-3">How these pages are written</h2>
        <p className="text-[14px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
          Each page describes what the other service is, then lists what DomainDiscovery offers. We do not publish competitor prices or make claims we cannot verify. For current features and pricing, check the other service directly.
        </p>
        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {ALTERNATIVES_DISCLAIMER}
        </p>
      </section>
      <RelatedLinks
        title="Start with DomainDiscovery"
        links={[
          { href: '/search', label: 'Domain name search', description: 'Check availability across 700+ extensions.' },
          { href: '/bulk-search', label: 'Bulk domain search', description: 'Check up to 1,000 names in one pass.' },
        ]}
      />
    </SeoPageShell>
  );
}
