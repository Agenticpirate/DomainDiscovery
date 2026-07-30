import type { Metadata } from 'next';
import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { buildToolMetadata } from '@/lib/seoSiteFacts';

const title = 'WHOIS Lookup — Free RDAP Domain Ownership Check';
const description =
  'Free WHOIS / RDAP lookup: registration dates, registrar, name servers, and ownership signals. Research domains before you buy or brand.';
const path = '/tools/whois';

export const metadata: Metadata = buildToolMetadata({
  title,
  description,
  path,
  keywords: ['WHOIS lookup', 'RDAP lookup', 'domain ownership', 'domain registration data'],
});

export default function WhoisLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolPageJsonLd
        path={path}
        name={title}
        description={description}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/search' },
          { name: 'WHOIS lookup', path },
        ]}
      />
      {children}
    </>
  );
}
