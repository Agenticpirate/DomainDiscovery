import type { Metadata } from 'next';
import { buildSeoPageMetadata } from '@/lib/seo/pageMeta';
import { SeoPageShell } from '@/components/seo/SeoPageShell';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { INDUSTRIES } from '@/lib/industries';

export const dynamic = 'force-dynamic';

const path = '/domain-name-ideas';
const title = 'Domain Name Ideas by Industry & Business Type';
const description =
  'Browse domain name ideas for 30 industries, from restaurants and law firms to SaaS and pet care. See sample names, live suggestions and the best extensions.';

export function generateMetadata(): Metadata {
  return buildSeoPageMetadata({
    title,
    description,
    path,
    keywords: ['domain name ideas', 'business domain name ideas', 'domain name ideas by industry'],
  });
}

export default function DomainNameIdeasHubPage() {
  return (
    <SeoPageShell
      path={path}
      title={title}
      description={description}
      h1="Domain name ideas by industry"
      intro="Pick your type of business to see sample domain names, live suggestions and the extensions that suit it."
      crumbs={[{ label: 'Domain name ideas' }]}
    >
      <RelatedLinks
        title="Industries"
        links={INDUSTRIES.map((i) => ({
          href: `/domain-name-ideas/${i.slug}`,
          label: `${i.name} domain names`,
          description: `Ideas and tips for a ${i.name.toLowerCase()} business.`,
        }))}
      />
      <RelatedLinks
        title="Start with DomainDiscovery"
        links={[
          { href: '/generator', label: 'Domain name generator', description: 'Turn any keyword into brandable names.' },
          { href: '/bulk-search', label: 'Bulk domain search', description: 'Check many names in one pass.' },
        ]}
      />
    </SeoPageShell>
  );
}
