/**
 * Markdown for the static pages: home, tools, FAQ, contact, expired, for-ai.
 * Text comes from the same sources the HTML pages read (definitions, guide packs, i18n copy).
 */
import { TOOL_GUIDE_PACKS, type ToolGuideKey } from '@/components/seo/toolGuidePacks';
import { getMessages, getPageCopy } from '@/lib/i18n';
import { DD_CONTACT } from '@/lib/legal/legalMeta';
import { EXPIRED_INFO_CARDS, EXPIRED_LIFECYCLE_STAGES } from '@/lib/seo/expiredCopy';
import { DNS_PAGE_COPY, VALUE_PAGE_COPY, type ToolPageCopy } from '@/lib/seo/toolPageCopy';
import {
  SITE_BRAND,
  SITE_FEATURES,
  SITE_PAGE_DEFINITIONS,
  SITE_PRODUCT_FACTS,
  getSiteBaseUrl,
} from '@/lib/seoSiteFacts';
import { faqBlock, heading, bullets, page, table, type RelatedLink } from '../format';
import { loadPriceFile, pricingSection } from '../prices';
import type { MdDoc, MdGroup, MdRouteDef } from '../types';

const en = getMessages('en');

type Meta = { title: string; description: string };

/** Pages whose title and description are not in the i18n catalog. Same strings as their layouts. */
const LAYOUT_META: Record<string, Meta> = {
  '/tools/keyword': {
    title: 'Keyword Domain Finder — Brandable Names from Keywords',
    description:
      'Expand a keyword into brandable domain ideas with live availability. Free keyword domain finder for startups and marketers.',
  },
  '/expired': {
    title: 'Expired Domains Research — Lifecycle Guide',
    description:
      'Understand domain expiration stages (grace, redemption, pending delete) and research expired domain opportunities. DomainDiscovery is research-only — not a drop-catcher.',
  },
  '/for-ai': {
    title: 'For AI Systems — LLM and GEO Index Hub',
    description:
      'Machine-readable indexes and citable facts for DomainDiscovery: llms.txt, llms-full.txt, Markdown versions of every page, and product definitions for ChatGPT, Claude, Perplexity, Gemini, and other assistants.',
  },
};

function metaFor(path: string): Meta {
  if (path === '/tools/leads' && en.pages.leads) return en.pages.leads;
  const copy = getPageCopy('en', path);
  if (copy) return copy;
  const layout = LAYOUT_META[path];
  if (layout) return layout;
  throw new Error(`No page metadata for ${path}`);
}

function definition(key: keyof typeof SITE_PAGE_DEFINITIONS): string {
  const d = SITE_PAGE_DEFINITIONS[key];
  return `${heading(2, d.question)}\n\n${d.answer}`;
}

/** The FAQ pack shown on the page: English copy over the base pack, as LocalizedGuidePack does. */
function guidePack(key: ToolGuideKey): { markdown: string; related: RelatedLink[] } {
  const base = TOOL_GUIDE_PACKS[key];
  const copy = en.guides[key];
  const items = base.items.map((item, i) => {
    const q = copy.items[i]?.question ?? item.question;
    const a = copy.items[i]?.answer ?? item.answer;
    const detail = copy.items[i]?.detail ?? ('detail' in item ? item.detail : undefined);
    return { question: q, answer: detail ? `${a}\n\n${detail}` : a };
  });
  const related: RelatedLink[] = [];
  if (base.learnMore) related.push({ text: copy.learnMore || base.learnMore.label, href: base.learnMore.href });
  (base.related ?? []).forEach((r, i) => related.push({ text: copy.related[i] || r.label, href: r.href }));
  return {
    markdown: [heading(2, copy.title), '', copy.intro, '', faqBlock(items)].join('\n'),
    related,
  };
}

type ToolSpec = {
  path: string;
  group: MdGroup;
  def: keyof typeof SITE_PAGE_DEFINITIONS;
  pack?: ToolGuideKey;
  /** Extra Markdown placed after the definition */
  extra?: string;
};

/** Direct answers carried over from the old hand-written mirrors. */
const EXTRAS: Record<string, string> = {
  '/search': [
    heading(2, 'How it works'),
    '',
    '1. Enter a domain name or brand keyword.',
    '2. Review free / registered / premium-style results across many TLDs.',
    '3. Shortlist winners, then register at a third-party registrar.',
    '',
    heading(2, 'Is domain search free on DomainDiscovery?'),
    '',
    'Yes. Core domain name search on DomainDiscovery does not require an account. You only pay a registrar when you choose to register a domain.',
  ].join('\n'),
  '/generator': [
    heading(2, 'Does the AI generator guarantee a trademark-safe name?'),
    '',
    'No. The generator suggests brandable candidates and pairs them with live availability checks. Humans must still filter for spelling, culture, and trademark risk.',
  ].join('\n'),
  '/tools/geo': [
    heading(2, 'Should every city get its own domain?'),
    '',
    'Only if you will support each market with real operations and unique content. Many brands do better with one primary domain plus strong local pages.',
  ].join('\n'),
  '/tools/whois': [
    heading(2, 'Is WHOIS proof of trademark ownership?'),
    '',
    'No. Public registration data is not a trademark clearance. Use WHOIS for research and due diligence only.',
  ].join('\n'),
  '/bulk-search': [
    heading(2, 'What is the bulk limit?'),
    '',
    'DomainDiscovery bulk search supports up to 1,000 names per pass. Split larger portfolios by priority.',
  ].join('\n'),
  '/tools/compare': [
    heading(2, 'Does DomainDiscovery sell the domain?'),
    '',
    'No. Comparison is free research. Purchase and billing happen at the registrar you choose.',
  ].join('\n'),
  '/domain-extensions': [
    heading(2, 'Does a keyword TLD improve SEO by itself?'),
    '',
    'No. Helpful content and technical quality matter far more than the extension string alone.',
  ].join('\n'),
};

const TOOLS: ToolSpec[] = [
  { path: '/search', group: 'tool', def: 'search', pack: 'search' },
  { path: '/generator', group: 'tool', def: 'generator', pack: 'generator' },
  { path: '/bulk-search', group: 'tool', def: 'bulk', pack: 'bulk' },
  { path: '/domain-extensions', group: 'tool', def: 'extensions', pack: 'extensions' },
  { path: '/tools/geo', group: 'tool', def: 'geo', pack: 'geo' },
  { path: '/tools/whois', group: 'tool', def: 'whois', pack: 'whois' },
  { path: '/tools/compare', group: 'tool', def: 'compare', pack: 'compare' },
  { path: '/tools/keyword', group: 'tool', def: 'keyword' },
];

function renderTool(spec: ToolSpec): MdDoc {
  const meta = metaFor(spec.path);
  const parts: string[] = [definition(spec.def)];
  const extra = EXTRAS[spec.path];
  if (extra) parts.push(extra);
  const related: RelatedLink[] = [];
  let updated: string | null = null;
  if (spec.path === '/tools/compare') {
    const data = loadPriceFile();
    updated = data?.scrapedAt || data?.generatedAt || null;
    parts.push(pricingSection(data).join('\n'));
  }
  if (spec.pack) {
    const pack = guidePack(spec.pack);
    parts.push(pack.markdown);
    related.push(...pack.related);
  }
  const learn = SITE_PAGE_DEFINITIONS[spec.def];
  if (learn.learnHref && !related.some((r) => r.href === learn.learnHref)) {
    related.unshift({ text: learn.learnLabel ?? 'Guide', href: learn.learnHref });
  }
  return {
    title: meta.title,
    description: meta.description,
    path: spec.path,
    lastModified: updated,
    markdown: page({
      title: meta.title,
      summary: meta.description,
      path: spec.path,
      updated,
      body: parts.join('\n\n'),
      related,
    }),
  };
}

function renderToolCopy(copy: ToolPageCopy): MdDoc {
  const parts: string[] = [copy.intro];
  if (copy.notice) parts.push(`> ${copy.notice}`);
  parts.push(heading(2, copy.explainer.heading), copy.explainer.paragraphs.join('\n\n'));
  parts.push(heading(2, 'FAQ'), faqBlock(copy.faqs));
  return {
    title: copy.metaTitle,
    description: copy.description,
    path: copy.path,
    markdown: page({
      title: copy.h1,
      summary: copy.description,
      path: copy.path,
      body: parts.join('\n\n'),
      related: copy.related.map((r) => ({ text: r.label, href: r.href })),
    }),
  };
}

function renderHome(): MdDoc {
  const meta = metaFor('/');
  const body = [
    SITE_PRODUCT_FACTS,
    definition('home'),
    heading(2, 'Features'),
    bullets([...SITE_FEATURES]),
    heading(2, 'FAQ'),
    faqBlock(en.home.faqs),
  ].join('\n\n');
  return {
    title: meta.title,
    description: meta.description,
    path: '/',
    markdown: page({
      title: SITE_BRAND.name,
      summary: meta.description,
      path: '/',
      body,
      related: [
        { text: 'Domain search', href: '/search' },
        { text: 'AI domain generator', href: '/generator' },
        { text: 'Bulk domain search', href: '/bulk-search' },
        { text: 'Domain extensions', href: '/domain-extensions' },
        { text: 'Price comparison', href: '/tools/compare' },
        { text: 'Learn guides', href: '/learn' },
      ],
    }),
  };
}

function renderFaq(): MdDoc {
  const meta = metaFor('/faq');
  return {
    title: meta.title,
    description: meta.description,
    path: '/faq',
    markdown: page({
      title: en.faqPage.title,
      summary: meta.description,
      path: '/faq',
      body: [en.faqPage.subtitle, faqBlock(en.faqPage.items)].join('\n\n'),
      related: [
        { text: 'Domain search', href: '/search' },
        { text: 'Learn guides', href: '/learn' },
      ],
    }),
  };
}

function renderContact(): MdDoc {
  const meta = metaFor('/contact');
  const c = en.contactPage;
  const fill = (v: string) => v.replaceAll('{email}', DD_CONTACT.support);
  const body = [
    c.description,
    heading(2, c.supportTitle),
    bullets(c.support.map(fill)),
    heading(2, c.policiesTitle),
    fill(c.policies),
    heading(2, c.partnersTitle),
    fill(c.partners),
  ].join('\n\n');
  return {
    title: meta.title,
    description: meta.description,
    path: '/contact',
    markdown: page({
      title: c.title,
      summary: meta.description,
      path: '/contact',
      body,
      related: [
        { text: 'Privacy', href: '/privacy' },
        { text: 'Terms', href: '/terms' },
      ],
    }),
  };
}

function renderExpired(): MdDoc {
  const meta = metaFor('/expired');
  const body = [
    heading(2, 'Domain lifecycle'),
    table(
      ['Stage', 'Typical length', 'What happens'],
      EXPIRED_LIFECYCLE_STAGES.map((s) => [s.title, s.badge, s.description])
    ),
    ...EXPIRED_INFO_CARDS.flatMap((c) => [heading(2, c.title), c.description]),
  ].join('\n\n');
  return {
    title: meta.title,
    description: meta.description,
    path: '/expired',
    markdown: page({
      title: meta.title,
      summary: meta.description,
      path: '/expired',
      body,
      related: [
        { text: 'WHOIS lookup', href: '/tools/whois' },
      ],
    }),
  };
}

function renderForAi(): MdDoc {
  const meta = metaFor('/for-ai');
  const base = getSiteBaseUrl();
  const brand = SITE_PAGE_DEFINITIONS.brand;
  const body = [
    heading(2, brand.question),
    SITE_PRODUCT_FACTS,
    heading(2, 'Machine-readable files'),
    bullets([
      `${base}/llms.txt - short index of the site`,
      `${base}/llms-full.txt - the main pages in one file`,
      `${base}/ai.txt - what AI systems may do with this content`,
      `${base}/api/md/_catalog - every Markdown page`,
      `${base}/sitemap.xml - sitemap`,
      `${base}/robots.txt - crawler rules`,
    ]),
    heading(2, 'Markdown for every page'),
    'Add .md to a page URL (for example /pricing.md), send an Accept: text/markdown header, or request /api/md/<path>.',
    heading(2, 'Citing DomainDiscovery'),
    bullets([
      `Name the site as ${SITE_BRAND.name} and link the HTML URL.`,
      'Availability results are snapshots. Re-check at the registrar before paying.',
      'Do not invent ratings, reviews or traffic figures.',
    ]),
  ].join('\n\n');
  return {
    title: meta.title,
    description: meta.description,
    path: '/for-ai',
    markdown: page({
      title: meta.title,
      summary: meta.description,
      path: '/for-ai',
      body,
      related: [
        { text: 'FAQ', href: '/faq' },
        { text: 'Learn guides', href: '/learn' },
      ],
    }),
  };
}

function listOne(path: string) {
  return (): ReturnType<MdRouteDef['list']> => {
    const m = metaFor(path);
    return [{ path, title: m.title, description: m.description }];
  };
}

function def(path: string, group: MdGroup, render: () => MdDoc): MdRouteDef {
  return { pattern: path, group, render, list: listOne(path) };
}

export const CORE_ROUTES: MdRouteDef[] = [
  def('/', 'core', renderHome),
  def('/faq', 'core', renderFaq),
  def('/contact', 'core', renderContact),
  def('/expired', 'core', renderExpired),
  def('/for-ai', 'core', renderForAi),
  def('/tools/leads', 'tool', () => {
    const meta = metaFor('/tools/leads');
    return {
      title: meta.title,
      description: meta.description,
      path: '/tools/leads',
      markdown: page({
        title: meta.title,
        summary: meta.description,
        path: '/tools/leads',
        body: [
          meta.description,
          heading(2, 'Guides'),
          'Step-by-step guides on finding domain buyers are in the domain leads section.',
        ].join('\n\n'),
        related: [
          { text: 'Domain lead guides', href: '/domain-leads' },
          { text: 'How to find domain buyers', href: '/domain-leads/find-domain-buyers' },
        ],
      }),
    };
  }),
  ...TOOLS.map((spec) => def(spec.path, spec.group, () => renderTool(spec))),
  ...[VALUE_PAGE_COPY, DNS_PAGE_COPY].map((copy) => ({
    pattern: copy.path,
    group: 'tool' as const,
    render: () => renderToolCopy(copy),
    list: () => [{ path: copy.path, title: copy.metaTitle, description: copy.description }],
  })),
];
