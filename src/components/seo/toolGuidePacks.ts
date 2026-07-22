import type { SeoGuidePackProps } from './SeoGuidePack';

/** Phase C — AEO/GEO packs keyed by tool surface */
export const TOOL_GUIDE_PACKS = {
  search: {
    eyebrow: 'Domain search FAQ',
    title: 'Domain name search — quick answers',
    intro:
      'Straight answers about availability checks. For a full walkthrough, open the domain name search guide.',
    items: [
      {
        question: 'What is domain name search?',
        answer:
          'Domain name search checks whether a web address (like yourbrand.com) is free to register, already owned, or labeled premium. You type a name and review results across one or more extensions (TLDs).',
        detail:
          'On DomainDiscovery, search is free and does not require an account. Registration and payment still happen at a registrar.',
      },
      {
        question: 'How does live availability work?',
        answer:
          'The tool queries live data sources and caches so results update as you type or submit a name. Treat every result as a snapshot — names can change hands quickly.',
        detail:
          'Always re-check at registrar checkout before you pay. Network issues can leave some lookups unresolved; retry those names.',
      },
      {
        question: 'What do free, registered, and premium mean?',
        answer:
          'Available/free usually means standard registration is possible. Registered means another party holds it. Premium may mean higher registry pricing or aftermarket listings — confirm the final price on the registrar page.',
      },
      {
        question: 'What if my .com is taken?',
        answer:
          'Try alternate TLDs, brandable twists via the AI generator, or geo patterns for local markets. Do not force an awkward spelling just to force a keyword into the hostname.',
      },
    ],
    learnMore: {
      href: '/learn/domain-name-search-guide',
      label: 'Full domain search guide',
    },
    related: [
      { href: '/generator', label: 'AI generator' },
      { href: '/tools/geo', label: 'Geo domains' },
      { href: '/learn/how-to-register-a-domain', label: 'How to register' },
    ],
  },

  geo: {
    eyebrow: 'Geo domains FAQ',
    title: 'Geo domain generator — local SEO answers',
    intro:
      'City and country domain lists for multi-market brands. Population filters use city-proper style figures, not metro guesses.',
    items: [
      {
        question: 'What is a geo domain?',
        answer:
          'A geo domain pairs a place (city, region, or country) with a brand or service keyword — for example a city plus “plumber.” Marketers use them for local landing pages, call tracking, and franchise territories.',
        detail:
          'They support local SEO when content and operations are real. Thin doorway pages that only swap city names usually underperform.',
      },
      {
        question: 'City proper vs metro population — why does it matter?',
        answer:
          'City-proper counts the administrative city; metro counts a wider urban area. Tokyo’s city-proper figure is much smaller than its metro total. DomainDiscovery shows populations in millions using city-proper oriented data so filters stay consistent.',
        detail:
          'A 5M minimum can drop most U.S. cities under city-proper rules. Use Any or 500K–1M when building U.S. lists.',
      },
      {
        question: 'How do I use the geo domain generator?',
        answer:
          'Enter a niche keyword, pick a country or city set, choose pattern order and TLDs, generate names, live-check free/premium/registered, then export CSV for your workflow.',
      },
      {
        question: 'Should every city get its own domain?',
        answer:
          'Only if you will support each market with unique proof (services, reviews, staff, projects). Many brands do better with one primary domain plus strong local pages.',
      },
    ],
    learnMore: {
      href: '/learn/geo-domains-local-seo',
      label: 'Geo domains for local SEO',
    },
    related: [
      { href: '/bulk-search', label: 'Bulk check lists' },
      { href: '/learn/cctld-local-seo', label: 'ccTLDs & local SEO' },
      { href: '/', label: 'Domain search' },
    ],
  },

  whois: {
    eyebrow: 'WHOIS FAQ',
    title: 'WHOIS / RDAP lookup — what you are seeing',
    intro:
      'Public registration data for research and due diligence. Privacy services often hide personal contacts.',
    items: [
      {
        question: 'What is WHOIS lookup?',
        answer:
          'WHOIS lookup retrieves public registration data for a domain — registrar, dates, name servers, status, and sometimes contacts. Modern systems often use RDAP under the hood while products still say “WHOIS.”',
      },
      {
        question: 'Why is contact data missing or redacted?',
        answer:
          'Privacy and redaction policies reduce spam and protect personal data. Missing contacts usually mean policy redaction, not a broken lookup. You can still see registrar, dates, and nameservers on many names.',
      },
      {
        question: 'Is WHOIS proof of trademark ownership?',
        answer:
          'No. Registration data is not a trademark clearance. For serious brands, run proper trademark checks in your markets in addition to domain research.',
      },
      {
        question: 'How should I use WHOIS before buying?',
        answer:
          'Check age, registrar, and status on interesting names, inspect any live site, then confirm availability and price. Use escrow for aftermarket deals.',
      },
    ],
    learnMore: {
      href: '/learn/whois-lookup-guide',
      label: 'Full WHOIS guide',
    },
    related: [
      { href: '/learn/whois-privacy-guide', label: 'WHOIS privacy' },
      { href: '/', label: 'Domain search' },
      { href: '/tools/compare', label: 'Price compare' },
    ],
  },

  bulk: {
    eyebrow: 'Bulk search FAQ',
    title: 'Bulk domain search — quick answers',
    intro:
      'Screen up to 1,000 names per pass. Best after you already have a candidate list from brainstorming or geo export.',
    items: [
      {
        question: 'When should I use bulk domain search?',
        answer:
          'Use bulk when you already have many candidates — spreadsheets, franchise city patterns, or geo generator exports. Use single search when exploring one brand idea interactively.',
      },
      {
        question: 'What is the limit?',
        answer:
          'DomainDiscovery bulk search checks up to 1,000 domains per pass in batches. Split larger portfolios by priority (must-have vs speculative).',
      },
      {
        question: 'Are bulk results final?',
        answer:
          'No. They are research snapshots. Re-check winners at registrar checkout. Retry any error or timeout rows before discarding them.',
      },
      {
        question: 'How do I prepare a clean list?',
        answer:
          'Deduplicate, normalize casing, use name.tld format when possible, and remove URLs with paths. Sort high-priority names first.',
      },
    ],
    learnMore: {
      href: '/learn/bulk-domain-search-guide',
      label: 'Bulk search guide',
    },
    related: [
      { href: '/tools/geo', label: 'Build geo lists' },
      { href: '/generator', label: 'AI generator' },
      { href: '/tools/whois', label: 'WHOIS' },
    ],
  },

  generator: {
    eyebrow: 'AI generator FAQ',
    title: 'AI domain name generator — quick answers',
    intro:
      'Turn a keyword into brandable candidates with live availability. Human judgment still decides the brand.',
    items: [
      {
        question: 'How does the AI domain generator work?',
        answer:
          'You provide a seed keyword or topic. The generator proposes brandable strings and DomainDiscovery checks live availability so you can shortlist free options faster than typing every variant by hand.',
      },
      {
        question: 'Will AI guarantee a trademark-safe name?',
        answer:
          'No. Generators do not replace trademark clearance. Filter for spelling, culture, and legal risk before you register.',
      },
      {
        question: 'What makes a strong generated name?',
        answer:
          'It passes the radio test (easy to say and type), fits your tone, works in email, and is available on a TLD you will actually use. Availability alone is not enough.',
      },
      {
        question: 'AI generator vs geo generator — which do I use?',
        answer:
          'Use AI for abstract brandables. Use the geo domain generator when the pattern is place + service for local markets.',
      },
    ],
    learnMore: {
      href: '/learn/ai-domain-name-generator-guide',
      label: 'AI generator guide',
    },
    related: [
      { href: '/', label: 'Domain search' },
      { href: '/tools/keyword', label: 'Keyword domains' },
      { href: '/learn/choosing-domain', label: 'How to choose a domain' },
    ],
  },

  compare: {
    eyebrow: 'Pricing FAQ',
    title: 'Domain price comparison — what this tool shows',
    intro:
      'Research regular retail pricing by TLD before checkout. The registrar cart is still the final authority.',
    items: [
      {
        question: 'What does price comparison show?',
        answer:
          'Side-by-side regular registration pricing signals for TLDs across registrars. Use it after you know which name and extension you want.',
      },
      {
        question: 'Why do prices differ by registrar?',
        answer:
          'Retail markups, promotions, and add-on bundles differ. Year-one discounts often hide higher renewals — compare multi-year cost when you can.',
      },
      {
        question: 'Does DomainDiscovery sell the domain?',
        answer:
          'No. Comparison is free research. You complete purchase and billing at the registrar you choose.',
      },
      {
        question: 'What about premium names?',
        answer:
          'Registry premium and aftermarket prices can differ from standard TLD tables. Always open the live listing for the final number.',
      },
    ],
    learnMore: {
      href: '/learn/domain-price-comparison-guide',
      label: 'Price comparison guide',
    },
    related: [
      { href: '/learn/how-to-register-a-domain', label: 'How to register' },
      { href: '/', label: 'Domain search' },
      { href: '/domain-extensions', label: 'Browse TLDs' },
    ],
  },

  extensions: {
    eyebrow: 'TLD FAQ',
    title: 'Domain extensions (TLDs) — quick answers',
    intro:
      'Choose an extension for brand fit and market, then verify availability. Browse 1,600+ options here.',
    items: [
      {
        question: 'What is a TLD?',
        answer:
          'A TLD (top-level domain) is the part after the final dot — .com, .org, .ai, or a country code like .uk. It sits at the top of the DNS hierarchy for that namespace.',
      },
      {
        question: 'Which extension should I choose?',
        answer:
          'Prefer .com for global consumer brands when available. Consider .ai, .io, .app, or .dev for category fit. Use a ccTLD when you truly operate in that country and customers expect it.',
      },
      {
        question: 'Does a keyword TLD improve SEO by itself?',
        answer:
          'No. Helpful content and technical quality matter far more than the extension string. A weak site on a clever TLD still underperforms a strong brand site.',
      },
      {
        question: 'How do I go from browsing to registering?',
        answer:
          'Shortlist TLDs here, run domain name search for your string, compare prices, then complete checkout at a registrar.',
      },
    ],
    learnMore: {
      href: '/learn/what-is-a-tld-domain-extension',
      label: 'What is a TLD? full guide',
    },
    related: [
      { href: '/blog/tlds', label: 'TLD encyclopedia' },
      { href: '/', label: 'Domain search' },
      { href: '/tools/compare', label: 'Price compare' },
    ],
  },
} satisfies Record<string, SeoGuidePackProps>;

export type ToolGuideKey = keyof typeof TOOL_GUIDE_PACKS;
