import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { buildLocalizedToolMetadata } from '@/lib/i18n/metadata';

const title = 'Domain Extensions (TLDs) — Browse 1,600+ Options';
const description =
  'Browse 1,600+ domain extensions and TLDs — from .com and .ai to country codes. Find the right extension, then check availability.';
const path = '/domain-extensions';

export function generateMetadata() {
  return buildLocalizedToolMetadata({
  title,
  description,
  path,
  keywords: [
    'domain extensions',
    'TLD list',
    'top level domains',
    'domain extensions list',
    'new gTLDs',
  ],
});
}

export default function DomainExtensionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolPageJsonLd
        path={path}
        name={title}
        description={description}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Domain extensions', path },
        ]}
      />
      {children}
    </>
  );
}
