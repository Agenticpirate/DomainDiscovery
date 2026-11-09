import type { FaqItem } from '@/lib/seo/pageMeta';
import { getLearnArticles, type LearnArticle } from '@/lib/learnArticles';

/** Landing pages for domain sellers. Steps describe only what /tools/leads actually does. */
export type LeadPage = {
  slug: string;
  /** Page title (rendered as-is, <= 60 chars) */
  title: string;
  h1: string;
  description: string;
  intro: string;
  steps: { heading: string; text: string }[];
  faqs: FaqItem[];
  keywords: string[];
};

export const LEAD_PAGES: LeadPage[] = [
  {
    slug: 'find-domain-buyers',
    title: 'Find Domain Buyers: Spot Businesses Using Your Name',
    h1: 'Find domain buyers for your names',
    description:
      'Find likely buyers for a domain you own. Enter a keyword, see who has registered it on other extensions and which sites are live, then pitch the right owner.',
    intro:
      'The most likely buyer of a domain is a business already using the same name on a different extension. The leads tool lists those registrations so you can see who might want the .com.',
    steps: [
      { heading: 'Enter your keyword', text: 'Type the name you own or want to sell, and choose how it should match: contains, starts with, ends with or exact.' },
      { heading: 'Review the namespace', text: 'See the extensions where that name is registered, so you know how crowded the namespace is.' },
      { heading: 'Filter to developed sites', text: 'Switch on the developed-domains filter to keep sites with live content and set aside unused registrations.' },
      { heading: 'Export your shortlist', text: 'Download the results as CSV or a PDF report to work from outside the tool.' },
    ],
    faqs: [
      { question: 'How do I find who might buy my domain?', answer: 'Search your keyword in the leads tool and look at businesses that use the name on other extensions. They have the clearest reason to want the matching name.' },
      { question: 'Does the tool give me owner contact details?', answer: 'It shows registered domains and whether a site is live. For ownership data on a specific name, use the WHOIS / RDAP lookup, which shows public registration records.' },
      { question: 'Can I export the results?', answer: 'Yes. Results export as CSV or a PDF report.' },
    ],
    keywords: ['find domain buyers', 'who wants to buy my domain', 'domain buyer search'],
  },
  {
    slug: 'domain-end-user-leads',
    title: 'Domain End-User Leads: Find Companies Ready to Upgrade',
    h1: 'Domain end-user leads, from live namespaces',
    description:
      'Build a list of end-user leads for a domain. See live businesses on .co, .io, .ai and country extensions that may want to move to the matching .com name.',
    intro:
      'End users pay more for a domain than other investors do, because the name is part of their brand. The leads tool helps you find companies running a real site on an alternative extension.',
    steps: [
      { heading: 'Search a brand keyword', text: 'Enter a keyword or a list of keywords to scan the namespace for each one.' },
      { heading: 'Sort by extension', text: 'Group results by category or extension to find companies on .co, .io, .ai or country domains.' },
      { heading: 'Keep active websites', text: 'Use the developed-domains filter to show sites with live HTTP content.' },
      { heading: 'Check new registrations', text: 'A recently registered domains feed shows newly registered names that match your keyword.' },
    ],
    faqs: [
      { question: 'What is an end-user lead?', answer: 'A business or person who would use the domain for their own site, as opposed to a reseller who would hold it for resale.' },
      { question: 'Can I search more than one keyword?', answer: 'Yes. The tool accepts several keywords and reports the namespace for each.' },
      { question: 'How do I know if a site is active?', answer: 'The developed filter marks domains that return live website content, as opposed to parked or unused registrations.' },
    ],
    keywords: ['domain end user leads', 'end user domain buyers', 'domain sales leads'],
  },
  {
    slug: 'domain-outreach',
    title: 'Domain Outreach: Research Buyers Before You Pitch',
    h1: 'Research buyers before your domain outreach',
    description:
      'Prepare domain outreach with facts. Check which businesses use your name on other extensions, confirm owners with WHOIS and export a list to work from.',
    intro:
      'Good outreach starts with research. The leads tool shows who is using your keyword, so your message goes to people with a reason to reply.',
    steps: [
      { heading: 'Map the namespace', text: 'Search your keyword and see the extensions where it is registered and developed.' },
      { heading: 'Pick the strongest matches', text: 'Narrow the list with match type and the developed filter to the businesses closest to your name.' },
      { heading: 'Confirm ownership', text: 'Open the WHOIS / RDAP lookup for a candidate domain to see public registration data.' },
      { heading: 'Export and plan', text: 'Export the list as CSV and plan your contact outside the tool.' },
    ],
    faqs: [
      { question: 'Does DomainDiscovery send outreach emails for me?', answer: 'No. The tool finds and organizes leads. You contact owners yourself, using your own email or marketplace.' },
      { question: 'Where should I list the domain?', answer: 'Our selling guides cover marketplaces, pricing and when a broker makes sense. See the links below.' },
      { question: 'Is the lead list private?', answer: 'Searches run in the tool and exports download to your device.' },
    ],
    keywords: ['domain outreach', 'domain selling outreach', 'pitch domain buyers'],
  },
  {
    slug: 'domain-sales-leads',
    title: 'Domain Sales Leads: Find Buyers for Your Portfolio',
    h1: 'Domain sales leads for your portfolio',
    description:
      'Generate domain sales leads for a portfolio. Scan many keywords at once, filter live sites and export results to prioritize which names to pitch first.',
    intro:
      'If you hold many names, you need to know which ones have buyers. The leads tool scans keywords in bulk and shows where each namespace is active.',
    steps: [
      { heading: 'Add your keywords', text: 'Enter several keywords from your portfolio and run one scan.' },
      { heading: 'Compare namespaces', text: 'See how many extensions have the name registered and how many of them are developed.' },
      { heading: 'Rank your names', text: 'Names with several live sites on other extensions are often the ones to pitch first.' },
      { heading: 'Export the results', text: 'Save the matrix as CSV or a PDF report for your records.' },
    ],
    faqs: [
      { question: 'Can I scan my whole portfolio?', answer: 'You can enter multiple keywords and review each namespace in the results. For availability checks on a long list of names, use bulk search.' },
      { question: 'Does a crowded namespace mean a sale?', answer: 'Not by itself. It shows demand signals, but price and timing still decide whether a buyer pays.' },
      { question: 'What if I have not bought the name yet?', answer: 'Check it first with domain search, and use the value estimator for a rough price range.' },
    ],
    keywords: ['domain sales leads', 'domain portfolio leads', 'sell domain portfolio'],
  },
];

export function getLeadPage(slug: string): LeadPage | undefined {
  return LEAD_PAGES.find((p) => p.slug === slug);
}

export function getLeadPageSlugs(): string[] {
  return LEAD_PAGES.map((p) => p.slug);
}

const SELLING_GUIDE_SLUGS = [
  'how-to-sell-a-domain-name-for-maximum-profit',
  'domain-name-broker-do-you-need-one-to-sell-a-domain',
  'domain-flipping-guide',
  'domain-flipping-in-2026-is-it-still-profitable',
];

/** Selling guides that are published today, resolved through the Learn data (never hardcoded hrefs). */
export function getSellingGuides(): LearnArticle[] {
  const published = getLearnArticles();
  return SELLING_GUIDE_SLUGS.map((slug) => published.find((a) => a.slug === slug)).filter(
    (a): a is LearnArticle => Boolean(a),
  );
}
