import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { buildLocalizedToolMetadata } from '@/lib/i18n/metadata';

const title = 'Domain Leads & Namespace Intelligence — Uncover Domain Buyers';
const description =
  'Instant lead discovery and namespace saturation scanner: find businesses using your brand name on other TLDs, discover newly registered domains (NRDs), and pitch the right buyers.';
const path = '/tools/leads';

export function generateMetadata() {
  return buildLocalizedToolMetadata({
    title,
    description,
    path,
    aiSummary:
      'Domain lead discovery and namespace saturation scanner. Finds businesses using a brand name on other TLDs and newly registered domains so you can pitch the right buyers.',
    keywords: [
      'domain leads',
      'domain sales leads',
      'outbound domain sales',
      'namespace saturation',
      'newly registered domains',
      'NRD feed',
      'domain buyer search',
      'domain portfolio intelligence',
    ],
  });
}

export default function LeadsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolPageJsonLd
        path={path}
        name={title}
        description={description}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/search' },
          { name: 'Domain Leads', path },
        ]}
      />
      {children}
    </>
  );
}

