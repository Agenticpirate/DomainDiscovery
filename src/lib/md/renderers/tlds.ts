/** Markdown for the blog hub, the TLD encyclopedia index, and one page per extension. */
import { buildTldBuyingContent } from '@/lib/tldBuyingContent';
import { getTldAboutDetail, getTldAboutIndex, getTldAboutMeta, type TldAboutSummary } from '@/lib/tldAboutData';
import { getTldPriceDetail } from '@/lib/tldPriceData';
import { bullets, faqBlock, heading, listItem, oneLine, page, table } from '../format';
import type { MdContext, MdDoc, MdListItem, MdRouteDef } from '../types';

/** Same title and description as the page metadata of /blog and /blog/tlds. */
const BLOG_META = {
  title: 'Domain Blog & TLD Encyclopedia — Extension Guides',
  description:
    'Domain strategy plus a TLD encyclopedia with registry-level about pages: sponsors, WHOIS/RDAP, and nameserver context from public IANA root zone data.',
};
const TLD_INDEX_META = {
  title: 'TLD Encyclopedia — Domain Extensions & Registry Guides',
  description:
    'Browse domain extensions (TLDs) with registry-oriented about pages: gTLDs, ccTLDs, sponsors, and public DNS root context. Then check availability on DomainDiscovery.',
};

const dotted = (tld: string) => (tld.startsWith('.') ? tld : `.${tld}`);

function summaryLine(t: TldAboutSummary): string {
  const kind = t.typeLabel || t.type;
  return t.sponsor ? `${kind}. Sponsor: ${oneLine(t.sponsor)}` : kind;
}

function tldItem(t: TldAboutSummary): string {
  return listItem(dotted(t.tld), `/blog/tlds/${t.slug}`, summaryLine(t));
}

function renderBlog(): MdDoc {
  const meta = getTldAboutMeta();
  const featured = getTldAboutIndex().slice(0, 24);
  const body = [
    `${meta.count} extension pages built from the IANA Root Zone Database${meta.generatedAt ? `, updated ${meta.generatedAt}` : ''}.`,
    heading(2, 'Featured extensions'),
    featured.map(tldItem).join('\n'),
    heading(2, 'More'),
    bullets([listItem('TLD encyclopedia', '/blog/tlds', 'Every extension with registry details.')]),
  ].join('\n\n');
  return {
    ...BLOG_META,
    path: '/blog',
    lastModified: meta.generatedAt ?? null,
    markdown: page({
      title: BLOG_META.title,
      summary: BLOG_META.description,
      path: '/blog',
      updated: meta.generatedAt,
      body,
      related: [{ text: 'Price comparison', href: '/tools/compare' }],
    }),
  };
}

function renderTldIndex(): MdDoc {
  const meta = getTldAboutMeta();
  const tlds = getTldAboutIndex();
  const groups = [
    { label: 'Generic TLDs (gTLD)', items: tlds.filter((t) => t.type === 'gTLD') },
    { label: 'Country-code TLDs (ccTLD)', items: tlds.filter((t) => t.type === 'ccTLD') },
    { label: 'Other / sponsored', items: tlds.filter((t) => t.type !== 'gTLD' && t.type !== 'ccTLD') },
  ];
  const parts = [
    `${meta.count} extension about pages from the IANA Root Zone Database${meta.generatedAt ? `, updated ${meta.generatedAt}` : ''}.`,
  ];
  for (const g of groups) {
    if (!g.items.length) continue;
    parts.push(heading(2, g.label), g.items.map(tldItem).join('\n'));
  }
  return {
    ...TLD_INDEX_META,
    path: '/blog/tlds',
    lastModified: meta.generatedAt ?? null,
    markdown: page({
      title: TLD_INDEX_META.title,
      summary: TLD_INDEX_META.description,
      path: '/blog/tlds',
      updated: meta.generatedAt,
      body: parts.join('\n\n'),
      related: [{ text: 'Blog', href: '/blog' }, { text: 'Domain extensions browser', href: '/domain-extensions' }],
    }),
  };
}

async function renderTld(ctx: MdContext): Promise<MdDoc | null> {
  const detail = await getTldAboutDetail(ctx.params.slug);
  if (!detail) return null;
  const tld = dotted(detail.tld);
  const price = getTldPriceDetail(detail.tld);
  const content = buildTldBuyingContent(detail, price);
  const restrictions = detail.registrationRestrictions || {};
  const features = Object.entries(detail.features || {}).filter(([k]) => k !== 'note');

  const parts: string[] = [];
  parts.push(
    bullets([
      `Type: ${detail.typeLabel ? `${detail.type} (${detail.typeLabel})` : detail.type}`,
      ...(detail.sponsor ? [`Registry / sponsor: ${oneLine(detail.sponsor)}`] : []),
    ])
  );

  if (price && content.hasPrice) {
    const cell = (c: { display: string | null }) => c.display ?? '—';
    const rows = [...price.registrars]
      .filter((r) => r.registration.value != null)
      .sort((a, b) => (a.registration.value ?? 0) - (b.registration.value ?? 0))
      .slice(0, 8);
    if (rows.length) {
      parts.push(
        heading(2, `${tld} registration prices`),
        table(
          ['Registrar', 'Register', 'Renew', 'Transfer'],
          rows.map((r) => [r.registrar, cell(r.registration), cell(r.renewal), cell(r.transfer)])
        ),
        'Prices change often and may include promotions. Verify at the registrar before buying. Source: tld-list.com.'
      );
    }
  }

  parts.push(heading(2, `About ${detail.tld} domains`), ...detail.about.split('\n\n').map((p) => p.trim()).filter(Boolean));
  parts.push(heading(2, `Who can register ${detail.tld} domains?`), detail.whoCanRegister);

  const restrictionLines = [
    `Length: ${restrictions.minLength ?? 1} – ${restrictions.maxLength ?? 63} characters (label before ${detail.tld})`,
    ...(restrictions.canUse ? [`Can use: ${restrictions.canUse}`] : []),
    ...(restrictions.cannotUse ? [`Cannot use: ${restrictions.cannotUse}`] : []),
    ...(restrictions.idns ? [`IDNs: ${restrictions.idns}`] : []),
  ];
  parts.push(heading(2, 'Registration restrictions'));
  if (restrictions.note) parts.push(restrictions.note);
  parts.push(bullets(restrictionLines));

  if (features.length) {
    parts.push(heading(2, 'Features'));
    if (detail.features?.note) parts.push(detail.features.note);
    parts.push(
      table(
        ['Feature', 'Value'],
        features.map(([k, v]) => [k.replace(/([A-Z])/g, ' $1').trim(), String(v)])
      )
    );
  }

  const registry = [
    ['Sponsor / manager', detail.sponsor],
    ['Registration services', detail.registryUrl],
    ['WHOIS server', detail.whoisServer],
    ['RDAP server', detail.rdapServer],
    ['Root zone registration', detail.registrationDate],
    ['Record last updated', detail.recordUpdated],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  parts.push(heading(2, 'Registry information'), bullets(registry.map(([k, v]) => `${k}: ${oneLine(v)}`)));
  if (detail.nameServers?.length) {
    parts.push(
      heading(3, 'Name servers'),
      bullets(detail.nameServers.map((ns) => (ns.addresses?.length ? `${ns.host} (${ns.addresses.join(', ')})` : ns.host)))
    );
  }

  parts.push(heading(2, 'FAQ'), faqBlock(content.faqs));
  parts.push(
    `Source: ${detail.source} (${detail.sourceUrl}). Registrar-specific rules (for example GoDaddy transfer policies) can differ from registry policy and are not scraped here.`
  );

  const updated = detail.scrapedAt ? detail.scrapedAt.slice(0, 10) : null;
  return {
    title: content.title,
    description: content.description,
    path: ctx.path,
    lastModified: updated,
    markdown: page({
      title: content.h1,
      summary: content.description,
      path: ctx.path,
      updated,
      body: parts.join('\n\n'),
      related: [
        { text: 'WHOIS lookup', href: '/tools/whois' },
        { text: 'Compare prices', href: '/tools/compare' },
        { text: 'All extensions', href: '/blog/tlds' },
      ],
    }),
  };
}

function listTlds(): MdListItem[] {
  return getTldAboutIndex().map((t) => ({
    path: `/blog/tlds/${t.slug}`,
    title: `${dotted(t.tld)} domain`,
    description: summaryLine(t),
  }));
}

export const TLD_ROUTES: MdRouteDef[] = [
  {
    pattern: '/blog',
    group: 'core',
    render: renderBlog,
    list: () => [{ path: '/blog', ...BLOG_META }],
  },
  {
    pattern: '/blog/tlds',
    group: 'core',
    render: renderTldIndex,
    list: () => [{ path: '/blog/tlds', ...TLD_INDEX_META }],
  },
  { pattern: '/blog/tlds/[slug]', group: 'tld', render: renderTld, list: listTlds },
];
