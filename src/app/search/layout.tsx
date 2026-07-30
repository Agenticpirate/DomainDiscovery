import type { Metadata } from 'next';
import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { buildToolMetadata } from '@/lib/seoSiteFacts';

const title = 'Domain Availability Checker — Instant Domain Search';
const description =
  'Instant domain availability checker across popular TLDs. Type a name, see live free or taken results, and explore brandable alternatives.';
const path = '/search';

export const metadata: Metadata = buildToolMetadata({
  title,
  description,
  path,
  keywords: [
    'domain availability checker',
    'instant domain search',
    'check domain availability',
    'domain name search',
  ],
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolPageJsonLd
        path={path}
        name={title}
        description={description}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Domain search', path },
        ]}
      />
      {children}
    </>
  );
}
