import type { Metadata } from 'next';
import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { buildToolMetadata } from '@/lib/seoSiteFacts';

const title = 'Premium Domains — Marketplace Coming Soon';
const description =
  'Premium domain marketplace for DomainDiscovery is coming soon. Meanwhile use free domain search, bulk check, and AI generator to find brandable names.';
const path = '/premium';

export const metadata: Metadata = buildToolMetadata({
  title,
  description,
  path,
});

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolPageJsonLd
        path={path}
        name={title}
        description={description}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Premium domains', path },
        ]}
      />
      {children}
    </>
  );
}
