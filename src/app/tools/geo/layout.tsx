import type { Metadata } from 'next';
import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { buildToolMetadata } from '@/lib/seoSiteFacts';

const title = 'Geo Domain Generator — City & Country Domains for Local SEO';
const description =
  'Free geo domain generator: combine any niche with cities and countries, live-check availability, and export CSV. Built for local SEO and multi-market domain lists.';
const path = '/tools/geo';

export const metadata: Metadata = buildToolMetadata({
  title,
  description,
  path,
  keywords: [
    'geo domain generator',
    'local SEO domains',
    'city domain names',
    'geo domains',
  ],
});

export default function GeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolPageJsonLd
        path={path}
        name={title}
        description={description}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/search' },
          { name: 'Geo domain generator', path },
        ]}
      />
      {children}
    </>
  );
}
