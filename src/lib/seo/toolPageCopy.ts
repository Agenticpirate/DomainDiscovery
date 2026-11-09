import type { FaqItem } from '@/lib/seo/pageMeta';
import type { RelatedLink } from '@/components/seo/RelatedLinks';

/**
 * Copy for the SEO tool landing pages (value, DNS, domain age). Lives here, not in the page files,
 * so the Markdown renderers read the same text the HTML pages show.
*/
export type ToolPageCopy = {
  path: string;
  crumb: string;
  metaTitle: string;
  description: string;
  h1: string;
  intro: string;
  notice?: string;
  explainer: { heading: string; paragraphs: string[] };
  faqs: FaqItem[];
  related: RelatedLink[];
};

export const VALUE_PAGE_COPY: ToolPageCopy = {
  path: '/tools/value',
  crumb: "Domain value",
  metaTitle: 'Domain Value Estimator: What Is My Domain Worth?',
  description:
    'Free domain value estimator. Get an estimated price range from length, extension and keywords. A rough estimate, not a professional appraisal.',
  h1: "How much is my domain worth?",
  intro: "Enter a domain to see an estimated price range based on name length, extension, keywords and, when available, how long it has been registered.",
  notice: "This is an estimate, not a professional appraisal. Actual sale prices depend on buyers and negotiation.",
  explainer: {
        heading: 'How the estimate works',
        paragraphs: [
          'The estimator scores public signals: the extension (.com, .ai and .io tend to resell best), the length of the name, whether it is a common word, and whether it has hyphens or digits. Older registrations add a small bonus when the registry publishes a creation date.',
          'It does not see traffic, revenue, backlinks, trademarks or recent comparable sales, all of which can move a price a lot. Use the range as a starting point for research, not as a quote.',
        ],
  },
  faqs: [
        {
          question: 'How accurate is this domain value estimate?',
          answer:
            'It is a rough range from a fixed formula, not an appraisal. Two similar names can sell for very different prices depending on the buyer and the use case.',
        },
        {
          question: 'What makes a domain more valuable?',
          answer:
            'Short names, dictionary words, a high-demand extension such as .com, and no hyphens or numbers usually help. Existing traffic and brand fit matter too, but this tool cannot measure them.',
        },
        {
          question: 'Should I sell my domain at the estimated price?',
          answer:
            'Treat the range as a rough guide. Compare recent sales of similar names and consider a professional appraisal before setting a price.',
        },
  ],
  related: [
        { href: '/tools/domain-age', label: 'Domain age checker', description: 'See when a domain was registered and when it expires.' },
        { href: '/tools/whois', label: 'WHOIS lookup', description: 'Registrar, dates and name servers.' },
        { href: '/search', label: 'Domain name search', description: 'Check availability across 1,600+ extensions.' },
        { href: '/tools/compare', label: 'Compare registrar prices', description: 'Registration and renewal prices by extension.' },
  ],
};

export const DNS_PAGE_COPY: ToolPageCopy = {
  path: '/tools/dns',
  crumb: "DNS lookup",
  metaTitle: 'DNS Lookup: A, MX, NS, TXT & CNAME Records',
  description:
    'Free DNS lookup tool. Check A, AAAA, MX, NS, TXT, CNAME, SOA and CAA records for any domain using DNS over HTTPS.',
  h1: "DNS lookup",
  intro: "Look up the DNS records for any public domain: where it points, which servers handle its email and who runs its name servers.",
  explainer: {
        heading: 'What the record types mean',
        paragraphs: [
          'A and AAAA records map a name to an IPv4 or IPv6 address. MX records list the mail servers, NS records name the authoritative name servers, and CNAME records alias one name to another.',
          'TXT records carry text such as SPF and domain verification values, SOA holds zone details like the serial number, and CAA limits which certificate authorities may issue certificates. Results come from a public DNS-over-HTTPS resolver, so cached answers may lag a recent change.',
        ],
  },
  faqs: [
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
  ],
  related: [
        { href: '/tools/whois', label: 'WHOIS lookup', description: 'Registrar, dates and name servers.' },
        { href: '/tools/domain-age', label: 'Domain age checker', description: 'Registration age and expiry date.' },
        { href: '/search', label: 'Domain name search', description: 'Check availability across 1,600+ extensions.' },
        { href: '/tools/value', label: 'Domain value estimator', description: 'Estimated price range for a name.' },
  ],
};

export const DOMAIN_AGE_PAGE_COPY: ToolPageCopy = {
  path: '/tools/domain-age',
  crumb: "Domain age",
  metaTitle: 'Domain Age Checker: Registration & Expiry Date',
  description:
    'Check how old a domain is and when it expires. Free domain age and expiration date checker using public RDAP registry data.',
  h1: "Domain age and expiration date checker",
  intro: "Find out when a domain was first registered, how old it is and how many days are left before it expires.",
  explainer: {
        heading: 'Why domain age and expiry matter',
        paragraphs: [
          'Age shows how long a name has been registered. It can hint at history, but a long-registered domain is not automatically better, and registries may reset dates after a transfer or drop.',
          'The expiration date tells you when a registration lapses. Expired names usually pass through a grace period before they are released, so the exact drop date can differ from the date shown. Data comes from public RDAP records and some registries publish limited dates.',
        ],
  },
  faqs: [
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
  ],
  related: [
        { href: '/tools/whois', label: 'WHOIS lookup', description: 'Full registration record for a domain.' },
        { href: '/tools/dns', label: 'DNS lookup', description: 'A, MX, NS and TXT records.' },
        { href: '/tools/value', label: 'Domain value estimator', description: 'Estimated price range for a name.' },
        { href: '/expired', label: 'Expired domains', description: 'Browse names that are dropping.' },
  ],
};
