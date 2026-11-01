import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { buildLocalizedToolMetadata } from '@/lib/i18n/metadata';

const title = 'AI Domain Name Generator — Free Brandable Ideas';
const description =
  'Free AI domain name generator: turn a keyword into brandable short names with live availability checks. No account required.';
const path = '/generator';

export function generateMetadata() {
  return buildLocalizedToolMetadata({
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
}

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
