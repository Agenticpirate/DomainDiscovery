import type { Metadata } from 'next';
import { buildSeoPageMetadata } from '@/lib/seo/pageMeta';
import { SeoPageShell } from '@/components/seo/SeoPageShell';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { LEAD_PAGES, getSellingGuides } from '@/lib/leadPages';

export const dynamic = 'force-dynamic';

const path = '/domain-leads';
const title = 'Domain Leads: Find Buyers for Domains You Own';
const description =
  'Guides to finding buyers for a domain: spot businesses using your name, build end-user lead lists and plan outreach with the DomainDiscovery leads tool.';

export function generateMetadata(): Metadata {
  return buildSeoPageMetadata({
    title,
    description,
    path,
    keywords: ['domain leads', 'find domain buyers', 'domain sales leads', 'domain outreach'],
  });
}

export default function DomainLeadsHubPage() {
  const guides = getSellingGuides();
  return (
    <SeoPageShell
      path={path}
      title={title}
      description={description}
      h1="Domain leads for domain sellers"
      intro="Selling a domain starts with finding the right buyer. These guides show how to use the leads tool to find businesses that already use your name."
      crumbs={[{ label: 'Domain leads' }]}
    >
      <RelatedLinks
        title="Guides"
        links={[
          ...LEAD_PAGES.map((p) => ({ href: `/domain-leads/${p.slug}`, label: p.h1, description: p.description })),
        ]}
      />
      <RelatedLinks
        title="Open the tool"
        links={[{ href: '/tools/leads', label: 'Domain leads tool', description: 'Search a keyword and see who uses it across extensions.' }]}
      />
      {guides.length > 0 && (
        <RelatedLinks
          title="Selling guides"
          links={guides.map((g) => ({ href: `/learn/${g.slug}`, label: g.title, description: g.description }))}
        />
      )}
    </SeoPageShell>
  );
}
