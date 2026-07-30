import type { Metadata } from 'next';
import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { buildToolMetadata } from '@/lib/seoSiteFacts';

const title = 'Expired Domains Research — Lifecycle Guide';
const description =
  'Understand domain expiration stages (grace, redemption, pending delete) and research expired domain opportunities. DomainDiscovery is research-only — not a drop-catcher.';
const path = '/expired';

export const metadata: Metadata = buildToolMetadata({
  title,
  description,
  path,
  keywords: ['expired domains', 'domain expiration', 'domain lifecycle', 'pending delete'],
});

export default function ExpiredLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolPageJsonLd
        path={path}
        name={title}
        description={description}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Expired domains research', path },
        ]}
      />
      {children}
    </>
  );
}
