import type { FaqItem } from '@/lib/seo/pageMeta';

/**
 * Compact data for the /alternatives pages. Keep claims neutral and factual:
 * no competitor prices, no ranking language, nothing we cannot verify.
 */
export type Alternative = {
  name: string;
  slug: string;
  /** Short phrase people search for, used in H1, title and keywords */
  searchTerm: string;
  /** Page title (rendered as-is, <= 60 chars) */
  title: string;
  description: string;
  /** Neutral one-paragraph description of the other service */
  whatItIs: string;
  /** What the competitor is mainly used for (comparison table, first row) */
  focus: string;
  /** True when the service is reported as closed */
  shutDown?: boolean;
  faqs: FaqItem[];
};

export const ALTERNATIVES_DISCLAIMER =
  'DomainDiscovery is not affiliated with, endorsed by or sponsored by any service named on these pages. All product names and trademarks belong to their owners and are used only to identify the service being discussed.';

export const CHECK_THEIR_SITE = 'Check their site for current features and pricing.';

/** What DomainDiscovery offers, taken from SITE_FEATURES in seoSiteFacts.ts. */
export const OUR_OFFER: { label: string; href: string; text: string }[] = [
  { label: 'Bulk domain search', href: '/bulk-search', text: 'Check up to 1,000 names in one pass.' },
  { label: 'AI domain name generator', href: '/generator', text: 'Brandable ideas from a keyword, with live availability checks.' },
  { label: 'WHOIS / RDAP lookup', href: '/tools/whois', text: 'Public registration data for a domain.' },
  { label: 'Registrar price comparison', href: '/tools/compare', text: 'Registration and renewal prices by extension.' },
  { label: 'Domain leads', href: '/tools/leads', text: 'Find businesses using your name on other extensions.' },
];

export const ALTERNATIVES: Alternative[] = [
  {
    name: 'Lean Domain Search',
    slug: 'lean-domain-search',
    searchTerm: 'Lean Domain Search alternative',
    title: 'Lean Domain Search Alternative (Shut Down)',
    description:
      'Lean Domain Search has shut down. See what DomainDiscovery offers for finding domains: bulk search, an AI name generator, WHOIS, price comparison and leads.',
    whatItIs:
      'Lean Domain Search was a domain name search tool that suggested names from keywords. The service has shut down, so people who used it are looking for a replacement.',
    focus: 'Keyword-based domain name suggestions (service has shut down).',
    shutDown: true,
    faqs: [
      {
        question: 'Is Lean Domain Search still available?',
        answer: 'The service has shut down. If you need to confirm its status, check the original site directly.',
      },
      {
        question: 'What can I use instead of Lean Domain Search?',
        answer:
          'DomainDiscovery lets you search one name across 1,600+ extensions, generate ideas from a keyword and check many names at once.',
      },
      {
        question: 'Does DomainDiscovery suggest names from a keyword?',
        answer: 'Yes. The AI domain generator turns a keyword into brandable ideas and checks availability as it goes.',
      },
    ],
  },
  {
    name: 'Instant Domain Search',
    slug: 'instant-domain-search',
    searchTerm: 'Instant Domain Search alternative',
    title: 'Instant Domain Search Alternative | DomainDiscovery',
    description:
      'Looking for an Instant Domain Search alternative? DomainDiscovery checks availability across 1,600+ extensions and adds bulk search, WHOIS and price comparison.',
    whatItIs:
      'Instant Domain Search is a domain availability tool known for showing results as you type. Check its site for its current features and pricing.',
    focus: 'Fast, as-you-type domain availability checks.',
    faqs: [
      {
        question: 'Is DomainDiscovery an Instant Domain Search alternative?',
        answer:
          'Both let you check whether a domain name is available. DomainDiscovery also offers bulk checks, an AI generator, WHOIS lookups and price comparison.',
      },
      {
        question: 'How many extensions does DomainDiscovery check?',
        answer: 'Search covers more than 1,600 top-level domains.',
      },
      {
        question: 'Can I check many names at once?',
        answer: 'Yes. Bulk search accepts up to 1,000 names in one pass.',
      },
    ],
  },
  {
    name: 'GoDaddy Bulk Domain Search',
    slug: 'godaddy-bulk-domain-search',
    searchTerm: 'GoDaddy bulk domain search alternative',
    title: 'GoDaddy Bulk Domain Search Alternative',
    description:
      'Need a GoDaddy bulk domain search alternative? Check up to 1,000 names at once on DomainDiscovery, then compare registrar prices and look up WHOIS data.',
    whatItIs:
      'GoDaddy is a domain registrar and hosting company, and its site includes a bulk domain search page. Check its site for current features and pricing.',
    focus: 'Bulk availability search offered by a registrar.',
    faqs: [
      {
        question: 'Can I check many domains without a registrar account?',
        answer: 'DomainDiscovery bulk search does not require an account. Paste your list and run the check.',
      },
      {
        question: 'How many names can I check at once?',
        answer: 'Up to 1,000 names per pass in bulk search.',
      },
      {
        question: 'Does DomainDiscovery register domains?',
        answer: 'No. It shows availability and links you to registrars. Compare registration and renewal prices before you buy.',
      },
    ],
  },
  {
    name: 'Namecheap Beast Mode',
    slug: 'namecheap-beast-mode',
    searchTerm: 'Namecheap Beast Mode alternative',
    title: 'Namecheap Beast Mode Alternative | DomainDiscovery',
    description:
      'A Namecheap Beast Mode alternative for bulk domain checks. Screen up to 1,000 names on DomainDiscovery and compare registrar prices by extension.',
    whatItIs:
      'Beast Mode is the name of a bulk search feature on the Namecheap registrar site. Check its site for how it works today and for current pricing.',
    focus: 'Bulk domain search inside a registrar.',
    faqs: [
      {
        question: 'What is a Beast Mode alternative?',
        answer:
          'It is another way to screen a long list of domain names at once. DomainDiscovery bulk search handles up to 1,000 names per pass.',
      },
      {
        question: 'Can I compare registrar prices?',
        answer: 'Yes. The price comparison tool lists registration and renewal prices by extension.',
      },
      {
        question: 'Do I need to sign up?',
        answer: 'No account is needed to run searches on DomainDiscovery.',
      },
    ],
  },
  {
    name: 'Nameboy',
    slug: 'nameboy',
    searchTerm: 'Nameboy alternative',
    title: 'Nameboy Alternative | DomainDiscovery',
    description:
      'Looking for a Nameboy alternative? DomainDiscovery turns a keyword into domain ideas with live availability checks, plus bulk search and WHOIS.',
    whatItIs:
      'Nameboy is a domain name generator that suggests names from keywords. Check its site for its current features.',
    focus: 'Domain name ideas from keywords.',
    faqs: [
      {
        question: 'Does DomainDiscovery generate domain names?',
        answer: 'Yes. The AI domain generator creates brandable ideas from a keyword and checks whether they are free.',
      },
      {
        question: 'Can I check availability for the ideas?',
        answer: 'Generated names are checked live, so you see which ones are available.',
      },
      {
        question: 'Is there a geo-based generator?',
        answer: 'Yes. The geo domain generator builds city and country patterns for local SEO lists.',
      },
    ],
  },
  {
    name: 'Namelix',
    slug: 'namelix',
    searchTerm: 'Namelix alternative',
    title: 'Namelix Alternative | DomainDiscovery',
    description:
      'A Namelix alternative for finding domains. DomainDiscovery generates ideas with AI, checks availability live and adds bulk search, WHOIS and price comparison.',
    whatItIs:
      'Namelix is an AI-powered business name generator that also shows matching domains. Check its site for current features and pricing.',
    focus: 'AI-generated business names with matching domains.',
    faqs: [
      {
        question: 'Is DomainDiscovery a Namelix alternative?',
        answer:
          'Both can help you find a name. DomainDiscovery starts from domains: generate ideas, check availability, then compare registrar prices.',
      },
      {
        question: 'Does it check availability while generating?',
        answer: 'Yes. The AI generator runs live checks on its suggestions.',
      },
      {
        question: 'Can I look up who owns a taken name?',
        answer: 'The WHOIS / RDAP tool shows public registration data for a domain.',
      },
    ],
  },
  {
    name: 'Porkbun Domain Search',
    slug: 'porkbun-domain-search',
    searchTerm: 'Porkbun domain search alternative',
    title: 'Porkbun Domain Search Alternative',
    description:
      'A Porkbun domain search alternative. Check names across 1,600+ extensions on DomainDiscovery, search in bulk and compare registrar prices side by side.',
    whatItIs:
      'Porkbun is a domain registrar, and its site includes a domain search box. Check its site for current features and pricing.',
    focus: 'Domain search and registration at a registrar.',
    faqs: [
      {
        question: 'Can I compare registrars on DomainDiscovery?',
        answer: 'Yes. The price comparison tool shows registration and renewal prices by extension across registrars.',
      },
      {
        question: 'Why use a search tool before a registrar?',
        answer:
          'A search tool lets you check many names and extensions first, then choose where to register based on price.',
      },
      {
        question: 'How many extensions can I search?',
        answer: 'More than 1,600 top-level domains.',
      },
    ],
  },
  {
    name: 'Domainr',
    slug: 'domainr',
    searchTerm: 'Domainr alternative',
    title: 'Domainr Alternative | DomainDiscovery',
    description:
      'Looking for a Domainr alternative? DomainDiscovery searches 1,600+ extensions and adds bulk search, an AI generator, WHOIS and price comparison.',
    whatItIs:
      'Domainr is a domain search service that also offers an API for developers. Check its site for current features and pricing.',
    focus: 'Domain search and a developer API.',
    faqs: [
      {
        question: 'Is DomainDiscovery an alternative to Domainr?',
        answer:
          'Both help you check domain availability. DomainDiscovery is built around a web interface with bulk search, a generator, WHOIS and price comparison.',
      },
      {
        question: 'Does DomainDiscovery show creative extensions?',
        answer: 'Search covers more than 1,600 extensions, and the extension browser explains each one.',
      },
      {
        question: 'Where can I read about each extension?',
        answer: 'The TLD encyclopedia lists extensions with registry details and, where available, pricing.',
      },
    ],
  },
];

export function getAlternative(slug: string): Alternative | undefined {
  return ALTERNATIVES.find((a) => a.slug === slug);
}

export function getAlternativeSlugs(): string[] {
  return ALTERNATIVES.map((a) => a.slug);
}
