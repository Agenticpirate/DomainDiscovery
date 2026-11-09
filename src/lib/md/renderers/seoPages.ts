/** Markdown for the programmatic SEO families: alternatives, domain-leads, domain-name-ideas. */
import {
  ALTERNATIVES,
  ALTERNATIVES_DISCLAIMER,
  CHECK_THEIR_SITE,
  OUR_OFFER,
  getAlternative,
} from '@/lib/alternatives';
import { INDUSTRIES, getIndustry } from '@/lib/industries';
import { getStaticIdeas } from '@/lib/industryIdeas';
import { LEAD_PAGES, getLeadPage, getSellingGuides } from '@/lib/leadPages';
import { getLearnArticles } from '@/lib/learnArticles';
import { bullets, faqBlock, heading, link, listItem, oneLine, page, table, type RelatedLink } from '../format';
import type { MdContext, MdDoc, MdRouteDef } from '../types';

/** Hub titles and descriptions match the metadata of the HTML hubs. */
const ALTERNATIVES_HUB = {
  title: 'Domain Search Tool Alternatives | DomainDiscovery',
  description:
    'Compare domain search tools and see what DomainDiscovery offers instead: bulk search, an AI name generator, WHOIS lookups, price comparison and domain leads.',
};
const LEADS_HUB = {
  title: 'Domain Leads: Find Buyers for Domains You Own',
  description:
    'Guides to finding buyers for a domain: spot businesses using your name, build end-user lead lists and plan outreach with the DomainDiscovery leads tool.',
};
const IDEAS_HUB = {
  title: 'Domain Name Ideas by Industry & Business Type',
  description:
    'Browse domain name ideas for 30 industries, from restaurants and law firms to SaaS and pet care. See sample names, live suggestions and the best extensions.',
};

function hub(
  path: string,
  meta: { title: string; description: string },
  h1: string,
  intro: string,
  body: string[],
  related: RelatedLink[]): MdDoc {
  return {
    ...meta,
    path,
    markdown: page({ title: h1, summary: meta.description, path, body: [intro, ...body].join('\n\n'), related }),
  };
}

function renderAlternativesHub(): MdDoc {
  return hub(
    '/alternatives',
    ALTERNATIVES_HUB,
    'Domain search tool alternatives',
    'Switching tools or looking for a replacement? Pick the service you know to see what DomainDiscovery offers for the same job.',
    [
      heading(2, 'Alternatives'),
      ALTERNATIVES.map((a) => listItem(a.searchTerm, `/alternatives/${a.slug}`, a.focus)).join('\n'),
      ALTERNATIVES_DISCLAIMER,
    ],
    [
      { text: 'Domain name search', href: '/search' },
      { text: 'Bulk domain search', href: '/bulk-search' },
    ]
  );
}

function renderAlternative(ctx: MdContext): MdDoc | null {
  const alt = getAlternative(ctx.params.slug);
  if (!alt) return null;
  const rows = [
    ['What it is', 'Domain search, bulk checks, an AI generator, WHOIS, price comparison and leads.', alt.focus],
    ...OUR_OFFER.map((o) => [o.label, o.text, alt.shutDown ? 'Not applicable: the service has shut down.' : CHECK_THEIR_SITE]),
  ];
  const body = [
    alt.whatItIs,
    heading(2, 'What DomainDiscovery offers'),
    bullets(OUR_OFFER.map((o) => `${link(o.label, o.href)}: ${o.text}`)),
    heading(2, `${alt.name} and DomainDiscovery side by side`),
    table(['Feature', 'DomainDiscovery', alt.name], rows),
    ALTERNATIVES_DISCLAIMER,
    heading(2, 'FAQ'),
    faqBlock(alt.faqs),
  ].join('\n\n');
  return {
    title: alt.title,
    description: alt.description,
    path: ctx.path,
    markdown: page({
      title: alt.shutDown ? `${alt.name} alternative: it has shut down` : `${alt.name} alternative`,
      summary: alt.description,
      path: ctx.path,
      body,
      related: [
        { text: 'All alternatives', href: '/alternatives' },
        ...ALTERNATIVES.filter((a) => a.slug !== alt.slug)
          .slice(0, 3)
          .map((a) => ({ text: a.searchTerm, href: `/alternatives/${a.slug}` })),
      ],
    }),
  };
}

function renderLeadsHub(): MdDoc {
  const guides = getSellingGuides();
  const body = [
    heading(2, 'Guides'),
    LEAD_PAGES.map((p) => listItem(p.h1, `/domain-leads/${p.slug}`, p.description)).join('\n'),
    heading(2, 'Open the tool'),
    listItem('Domain leads tool', '/tools/leads', 'Search a keyword and see who uses it across extensions.'),
    ...(guides.length
      ? [heading(2, 'Selling guides'), guides.map((g) => listItem(g.title, `/learn/${g.slug}`, g.description)).join('\n')]
      : []),
  ];
  return hub(
    '/domain-leads',
    LEADS_HUB,
    'Domain leads for domain sellers',
    'Selling a domain starts with finding the right buyer. These guides show how to use the leads tool to find businesses that already use your name.',
    body,
    [{ text: 'Domain leads tool', href: '/tools/leads' }]
  );
}

function renderLead(ctx: MdContext): MdDoc | null {
  const lead = getLeadPage(ctx.params.slug);
  if (!lead) return null;
  const guides = getSellingGuides();
  const body = [
    lead.intro,
    listItem('Open the domain leads tool', '/tools/leads'),
    heading(2, 'How it works'),
    lead.steps.map((s, i) => `${i + 1}. **${oneLine(s.heading)}**: ${oneLine(s.text)}`).join('\n'),
    heading(2, 'FAQ'),
    faqBlock(lead.faqs),
    ...(guides.length
      ? [heading(2, 'Guides on selling domains'), guides.map((g) => listItem(g.title, `/learn/${g.slug}`, g.description)).join('\n')]
      : []),
  ].join('\n\n');
  return {
    title: lead.title,
    description: lead.description,
    path: ctx.path,
    markdown: page({
      title: lead.h1,
      summary: lead.description,
      path: ctx.path,
      body,
      related: [
        { text: 'All domain lead guides', href: '/domain-leads' },
        ...LEAD_PAGES.filter((p) => p.slug !== lead.slug).map((p) => ({ text: p.h1, href: `/domain-leads/${p.slug}` })),
        { text: 'WHOIS lookup', href: '/tools/whois' },
      ],
    }),
  };
}

function renderIdeasHub(): MdDoc {
  return hub(
    '/domain-name-ideas',
    IDEAS_HUB,
    'Domain name ideas by industry',
    'Pick your type of business to see sample domain names, live suggestions and the extensions that suit it.',
    [
      heading(2, 'Industries'),
      INDUSTRIES.map((i) =>
        listItem(`${i.name} domain names`, `/domain-name-ideas/${i.slug}`, `Ideas and tips for a ${i.name.toLowerCase()} business.`)
      ).join('\n'),
    ],
    [
      { text: 'Domain name generator', href: '/generator' },
      { text: 'Bulk domain search', href: '/bulk-search' },
    ]
  );
}

function renderIndustry(ctx: MdContext): MdDoc | null {
  const industry = getIndustry(ctx.params.slug);
  if (!industry) return null;
  const lower = industry.name.toLowerCase();
  const guide = industry.learnSlug ? getLearnArticles().find((a) => a.slug === industry.learnSlug) : undefined;
  const body = [
    `Sample domain names for a ${lower} business, live suggestions from our generator and tips for choosing a name that fits.`,
    heading(2, 'Sample names'),
    getStaticIdeas(industry)
      .map((domain) => `- ${link(domain, `/search?q=${encodeURIComponent(domain)}`)}`)
      .join('\n'),
    'These are examples. Select a name to check whether it is available.',
    heading(2, 'Tips'),
    bullets(industry.tips),
    heading(2, 'Recommended extensions'),
    industry.tlds.map((tld) => listItem(`.${tld}`, `/blog/tlds/${tld}`, `About .${tld} domains, rules and prices.`)).join('\n'),
    heading(2, 'FAQ'),
    faqBlock(industry.faqs),
  ].join('\n\n');
  return {
    title: industry.title,
    description: industry.description,
    path: ctx.path,
    markdown: page({
      title: `${industry.name} domain name ideas`,
      summary: industry.description,
      path: ctx.path,
      body,
      related: [
        ...(guide ? [{ text: guide.title, href: `/learn/${guide.slug}` }] : []),
        { text: 'Domain name generator', href: '/generator' },
        { text: 'Bulk domain search', href: '/bulk-search' },
        { text: 'All industries', href: '/domain-name-ideas' },
        ...INDUSTRIES.filter((i) => i.slug !== industry.slug)
          .slice(0, 4)
          .map((i) => ({ text: `${i.name} domain names`, href: `/domain-name-ideas/${i.slug}` })),
      ],
    }),
  };
}

export const SEO_ROUTES: MdRouteDef[] = [
  {
    pattern: '/alternatives',
    group: 'core',
    render: renderAlternativesHub,
    list: () => [{ path: '/alternatives', ...ALTERNATIVES_HUB }],
  },
  {
    pattern: '/alternatives/[slug]',
    group: 'alternative',
    render: renderAlternative,
    list: () => ALTERNATIVES.map((a) => ({ path: `/alternatives/${a.slug}`, title: a.title, description: a.description })),
  },
  {
    pattern: '/domain-leads',
    group: 'core',
    render: renderLeadsHub,
    list: () => [{ path: '/domain-leads', ...LEADS_HUB }],
  },
  {
    pattern: '/domain-leads/[slug]',
    group: 'lead',
    render: renderLead,
    list: () => LEAD_PAGES.map((p) => ({ path: `/domain-leads/${p.slug}`, title: p.title, description: p.description })),
  },
  {
    pattern: '/domain-name-ideas',
    group: 'core',
    render: renderIdeasHub,
    list: () => [{ path: '/domain-name-ideas', ...IDEAS_HUB }],
  },
  {
    pattern: '/domain-name-ideas/[slug]',
    group: 'industry',
    render: renderIndustry,
    list: () => INDUSTRIES.map((i) => ({ path: `/domain-name-ideas/${i.slug}`, title: i.title, description: i.description })),
  },
];
