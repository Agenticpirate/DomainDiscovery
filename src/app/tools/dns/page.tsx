import type { Metadata } from 'next';
import { buildSeoPageMetadata } from '@/lib/seo/pageMeta';
import { ToolPageShell } from '@/components/tools/ToolPageShell';
import { DnsLookupWidget } from '@/components/tools/DnsLookupWidget';

export const dynamic = 'force-dynamic';

const path = '/tools/dns';
const metaTitle = 'DNS Lookup: A, MX, NS, TXT & CNAME Records';
const description =
  'Free DNS lookup tool. Check A, AAAA, MX, NS, TXT, CNAME, SOA and CAA records for any domain using DNS over HTTPS.';

export function generateMetadata(): Metadata {
  return buildSeoPageMetadata({
    title: metaTitle,
    description,
    path,
    keywords: ['DNS lookup', 'DNS records checker', 'MX record lookup', 'NS lookup', 'TXT record lookup'],
  });
}

export default function DnsLookupPage() {
  return (
    <ToolPageShell
      path={path}
      crumb="DNS lookup"
      metaTitle={metaTitle}
      description={description}
      h1="DNS lookup"
      intro="Look up the DNS records for any public domain: where it points, which servers handle its email and who runs its name servers."
      widget={<DnsLookupWidget />}
      explainer={{
        heading: 'What the record types mean',
        paragraphs: [
          'A and AAAA records map a name to an IPv4 or IPv6 address. MX records list the mail servers, NS records name the authoritative name servers, and CNAME records alias one name to another.',
          'TXT records carry text such as SPF and domain verification values, SOA holds zone details like the serial number, and CAA limits which certificate authorities may issue certificates. Results come from a public DNS-over-HTTPS resolver, so cached answers may lag a recent change.',
        ],
      }}
      faqs={[
        {
          question: 'How do I look up DNS records for a domain?',
          answer: 'Enter the domain, pick a record type such as A or MX, and run the lookup. The records and their TTL appear below.',
        },
        {
          question: 'Why do my DNS changes not show up yet?',
          answer:
            'Resolvers cache records for the TTL value. A change can take from minutes to a day to be visible everywhere, depending on the old TTL.',
        },
        {
          question: 'Which record types are supported?',
          answer: 'A, AAAA, MX, NS, TXT, CNAME, SOA and CAA. IP addresses and local names are not accepted.',
        },
      ]}
      related={[
        { href: '/tools/whois', label: 'WHOIS lookup', description: 'Registrar, dates and name servers.' },
        { href: '/tools/domain-age', label: 'Domain age checker', description: 'Registration age and expiry date.' },
        { href: '/search', label: 'Domain name search', description: 'Check availability across 1,600+ extensions.' },
        { href: '/tools/value', label: 'Domain value estimator', description: 'Estimated price range for a name.' },
      ]}
    />
  );
}
