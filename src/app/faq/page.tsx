import type { Metadata } from 'next';
import { SiteFaqPage } from '@/components/sections/SiteFaqPage';
import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { buildToolMetadata } from '@/lib/seoSiteFacts';

const title = 'Domain Search FAQ — Availability, Registration & Tools';
const description =
  'FAQ for DomainDiscovery (Domain Discovery): domain name search, availability, registration, geo domains, WHOIS, bulk checks, pricing, and privacy.';
const path = '/faq';

export const metadata: Metadata = buildToolMetadata({
  title,
  description,
  path,
  keywords: ['domain search FAQ', 'domain registration FAQ', 'WHOIS FAQ', 'DomainDiscovery help'],
});

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
