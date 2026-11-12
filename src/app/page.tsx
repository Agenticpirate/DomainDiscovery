import { FaqPageJsonLd, ToolPageJsonLd } from '@/components/seo/JsonLd';
import HomePageClient from './HomePageClient';

const title = 'Domain Name Search — Free Instant Availability | DomainDiscovery';
const description =
  'Free domain name search across 700+ TLDs with live availability. AI name generator, bulk checker, WHOIS lookup, and registrar price comparison. No signup.';

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
      <FaqPageJsonLd source="home" path="/" />
      <HomePageClient />
    </>
  );
}
