import type { Metadata } from 'next';
import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { buildToolMetadata } from '@/lib/seoSiteFacts';

const title = 'AI Domain Name Generator — Free Brandable Ideas';
const description =
  'Free AI domain name generator: turn a keyword into brandable short names with live availability checks. No account required.';
const path = '/generator';

export const metadata: Metadata = buildToolMetadata({
  title,
  description,
  path,
  keywords: [
    'AI domain name generator',
    'domain name generator',
    'brandable domain names',
    'free domain generator',
  ],
});

export default function GeneratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolPageJsonLd
        path={path}
        name={title}
        description={description}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'AI domain generator', path },
        ]}
      />
      {children}
    </>
  );
}
