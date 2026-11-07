import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { buildLocalizedToolMetadata } from '@/lib/i18n/metadata';

const title = 'Geo Domain Generator — City & Country Domains for Local SEO';
const description =
  'Free geo domain generator: combine any niche with cities and countries, check live availability, and export CSV. Built for local SEO and multi-market lists.';
const path = '/tools/geo';

export function generateMetadata() {
  return buildLocalizedToolMetadata({
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
}

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
