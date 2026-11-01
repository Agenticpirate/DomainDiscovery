import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { buildLocalizedToolMetadata } from '@/lib/i18n/metadata';

const title = 'Domain Availability Checker — Instant Domain Search';
const description =
  'Instant domain availability checker across popular TLDs. Type a name, see live free or taken results, and explore brandable alternatives.';
const path = '/search';

export function generateMetadata() {
  return buildLocalizedToolMetadata({
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
}

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
