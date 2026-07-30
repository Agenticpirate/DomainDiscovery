import type { Metadata } from 'next';
import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { buildToolMetadata } from '@/lib/seoSiteFacts';

const title = 'Keyword Domain Finder — Brandable Names from Keywords';
const description =
  'Expand a keyword into brandable domain ideas with live availability. Free keyword domain finder for startups and marketers.';
const path = '/tools/keyword';

export const metadata: Metadata = buildToolMetadata({
  title,
  description,
  path,
  keywords: [
    'keyword domain finder',
    'keyword domain generator',
    'brandable domains',
    'domain ideas from keywords',
  ],
});

export default function KeywordLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolPageJsonLd
        path={path}
        name={title}
        description={description}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/search' },
          { name: 'Keyword domain finder', path },
        ]}
      />
      {children}
    </>
  );
}
