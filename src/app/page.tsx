import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import HomePageClient from './HomePageClient';

const title = 'Domain Name Search — Free Instant Availability | DomainDiscovery';
const description =
  'Free domain name search with live availability across 1,600+ TLDs. AI domain generator, bulk checker, geo domains, WHOIS lookup, and registrar price comparison — no account required.';

/**
 * Server shell so homepage WebPage + BreadcrumbList JSON-LD is in the initial HTML
 * for Google + non-JS AI crawlers. Interactive UI stays in HomePageClient.
 */
export default function HomePage() {
  return (
    <>
      <ToolPageJsonLd
        path="/"
        name={title}
        description={description}
        breadcrumbs={[{ name: 'Home', path: '/' }]}
      />
      <HomePageClient />
    </>
  );
}
