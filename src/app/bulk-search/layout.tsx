import type { Metadata } from 'next';
import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { buildToolMetadata } from '@/lib/seoSiteFacts';

const title = 'Bulk Domain Search — Check Up to 1,000 Domains';
const description =
  'Bulk domain availability checker for portfolios and agencies. Paste up to 1,000 names and screen free vs registered in batches.';
const path = '/bulk-search';

export const metadata: Metadata = buildToolMetadata({
  title,
  description,
  path,
  keywords: [
    'bulk domain search',
    'bulk domain checker',
    'check multiple domains',
    'domain portfolio checker',
  ],
});

export default function BulkSearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolPageJsonLd
        path={path}
        name={title}
        description={description}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Bulk domain search', path },
        ]}
      />
      {children}
    </>
  );
}
