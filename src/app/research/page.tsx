import type { Metadata } from 'next';
import { SeoPageShell } from '@/components/seo/SeoPageShell';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { buildSeoPageMetadata } from '@/lib/seo/pageMeta';
import { getReports } from '@/lib/research';

export const dynamic = 'force-dynamic';

const path = '/research';
const title = 'Domain Name Research & Statistics | DomainDiscovery';
const description =
  'Original statistics from the DomainDiscovery datasets: domain extension prices, renewal markups, WHOIS privacy and extension types. Every number links to its method.';

export function generateMetadata(): Metadata {
  return buildSeoPageMetadata({
    title,
    description,
    path,
    keywords: ['domain statistics', 'domain extension statistics', 'domain price research'],
  });
}

export default function ResearchHubPage() {
  const reports = getReports();
  return (
    <SeoPageShell
      path={path}
      title={title}
      description={description}
      h1="Domain name research"
      intro="Statistics counted from the datasets behind DomainDiscovery. Each report states its source, its denominator and when the data was collected."
      crumbs={[{ label: 'Research' }]}
    >
      <RelatedLinks
        title="Reports"
        links={reports.map((r) => ({
          href: r.path,
          label: r.h1,
          description: `${r.summary} (data as of ${r.updated})`,
        }))}
      />
    </SeoPageShell>
  );
}
