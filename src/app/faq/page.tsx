import { SiteFaqPage } from '@/components/sections/SiteFaqPage';
import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { buildLocalizedToolMetadata } from '@/lib/i18n/metadata';

const title = 'Domain Search FAQ — Availability, Registration & Tools';
const description =
  'FAQ for DomainDiscovery (Domain Discovery): domain name search, availability, registration, geo domains, WHOIS, bulk checks, pricing, and privacy.';
const path = '/faq';

export function generateMetadata() {
  return buildLocalizedToolMetadata({
  title,
  description,
  path,
  keywords: ['domain search FAQ', 'domain registration FAQ', 'WHOIS FAQ', 'DomainDiscovery help'],
});
}

export default function FAQPage() {
  return (
    <>
      <ToolPageJsonLd
        path={path}
        name={title}
        description={description}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'FAQ', path },
        ]}
      />
      <SiteFaqPage />
    </>
  );
}
