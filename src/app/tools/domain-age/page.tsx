import type { Metadata } from 'next';
import { buildSeoPageMetadata } from '@/lib/seo/pageMeta';
import { ToolPageShell } from '@/components/tools/ToolPageShell';
import { DomainAgeWidget } from '@/components/tools/DomainAgeWidget';

export const dynamic = 'force-dynamic';

const path = '/tools/domain-age';
const metaTitle = 'Domain Age Checker: Registration & Expiry Date';
const description =
  'Check how old a domain is and when it expires. Free domain age and expiration date checker using public RDAP registry data.';

export function generateMetadata(): Metadata {
  return buildSeoPageMetadata({
    title: metaTitle,
    description,
    path,
    keywords: ['domain age checker', 'domain expiration date', 'domain expiry checker', 'when was a domain registered'],
  });
}

export default function DomainAgePage() {
  return (
    <ToolPageShell
      path={path}
      crumb="Domain age"
      metaTitle={metaTitle}
      description={description}
      h1="Domain age and expiration date checker"
      intro="Find out when a domain was first registered, how old it is and how many days are left before it expires."
      widget={<DomainAgeWidget />}
      explainer={{
        heading: 'Why domain age and expiry matter',
        paragraphs: [
          'Age shows how long a name has been registered. It can hint at history, but a long-registered domain is not automatically better, and registries may reset dates after a transfer or drop.',
          'The expiration date tells you when a registration lapses. Expired names usually pass through a grace period before they are released, so the exact drop date can differ from the date shown. Data comes from public RDAP records and some registries publish limited dates.',
        ],
      }}
      faqs={[
        {
          question: 'How do I check the age of a domain?',
          answer: 'Enter the domain above. The tool reads the registration date from public RDAP data and works out the age from it.',
        },
        {
          question: 'Does domain age affect SEO?',
          answer:
            'Search engines have said age alone is not a ranking factor. An older domain may have built up links and history, but content and relevance matter more.',
        },
        {
          question: 'What happens when a domain expires?',
          answer:
            'Most registrars give the owner a grace period to renew, followed by a redemption period at a higher fee. After that the name is deleted and can be registered by anyone. Timelines vary by registry and registrar.',
        },
      ]}
      related={[
        { href: '/tools/whois', label: 'WHOIS lookup', description: 'Full registration record for a domain.' },
        { href: '/tools/dns', label: 'DNS lookup', description: 'A, MX, NS and TXT records.' },
        { href: '/tools/value', label: 'Domain value estimator', description: 'Estimated price range for a name.' },
        { href: '/expired', label: 'Expired domains', description: 'Browse names that are dropping.' },
      ]}
    />
  );
}
