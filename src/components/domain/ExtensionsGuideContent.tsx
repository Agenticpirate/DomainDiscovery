'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { Icons } from '@/components/ui/Icons';
import { PremiumFaqGrid } from '@/components/sections/PremiumFaqGrid';

/** Industry match — rephrased from public TLD education content */
const INDUSTRY_TABS: Record<string, { tld: string; blurb: string }[]> = {
  Technology: [
    { tld: '.tech', blurb: 'Signals you build technology products at a glance.' },
    { tld: '.dev', blurb: 'Developer-first, startup-friendly, widely recognized.' },
    { tld: '.io', blurb: 'Familiar to engineers — reads as modern web work.' },
    { tld: '.ai', blurb: 'Default choice for AI products and research brands.' },
    { tld: '.app', blurb: 'Clear intent for software and product experiences.' },
    { tld: '.cloud', blurb: 'Fits SaaS, infrastructure, and cloud platforms.' },
  ],
  Retail: [
    { tld: '.shop', blurb: 'Instant retail cue for stores and catalogs.' },
    { tld: '.store', blurb: 'Straightforward commerce branding.' },
    { tld: '.online', blurb: 'Broad e-commerce and digital storefronts.' },
    { tld: '.market', blurb: 'Marketplace and multi-seller platforms.' },
    { tld: '.sale', blurb: 'Promotional and deal-driven brands.' },
  ],
  Finance: [
    { tld: '.finance', blurb: 'Direct industry signal for money products.' },
    { tld: '.money', blurb: 'Consumer-friendly fintech positioning.' },
    { tld: '.capital', blurb: 'Investment, funds, and advisory brands.' },
    { tld: '.fund', blurb: 'Asset management and wealth contexts.' },
  ],
  Creative: [
    { tld: '.design', blurb: 'Studios, agencies, and product design teams.' },
    { tld: '.art', blurb: 'Artists, galleries, and visual portfolios.' },
    { tld: '.studio', blurb: 'Creative shops and production houses.' },
    { tld: '.media', blurb: 'Publishers, producers, and content brands.' },
  ],
  Health: [
    { tld: '.health', blurb: 'Healthtech and wellness platforms.' },
    { tld: '.care', blurb: 'Care providers and patient-facing products.' },
    { tld: '.clinic', blurb: 'Local practices and specialty clinics.' },
    { tld: '.fitness', blurb: 'Training, gyms, and active lifestyle brands.' },
  ],
};

const TRUST_TLDS = [
  { tld: '.com', score: 95, note: 'Most trusted worldwide' },
  { tld: '.org', score: 82, note: 'Nonprofits & open communities' },
  { tld: '.net', score: 79, note: 'Tech & network services' },
  { tld: '.co', score: 74, note: 'Short startup alternative' },
  { tld: '.io', score: 71, note: 'Modern tech recognition' },
];

const MEMORABLE_EXAMPLES = ['.app', '.com', '.io', '.dev', '.ai', '.org', '.net', '.co'];

const COUNTRY_TLDS = [
  { tld: '.uk', blurb: 'Widely used for UK audiences and local SEO.' },
  { tld: '.us', blurb: 'Best fit for audiences in the United States.' },
  { tld: '.de', blurb: 'Popular for German businesses; signals local presence.' },
  { tld: '.ca', blurb: 'Trusted by Canadian users; light residency rules.' },
  { tld: '.in', blurb: 'Strong recognition across India and South Asia.' },
  { tld: '.au', blurb: 'Trusted ending for Australian brands and shops.' },
  { tld: '.fr', blurb: 'Natural choice for French-speaking markets.' },
  { tld: '.jp', blurb: 'Established presence for Japan-focused products.' },
];

const SEO_ROWS = [
  { tld: '.com', ctr: '4.8%', type: 'gTLD' },
  { tld: '.org', ctr: '3.9%', type: 'gTLD' },
  { tld: '.net', ctr: '3.4%', type: 'gTLD' },
  { tld: '.io', ctr: '3.2%', type: 'ccTLD*' },
  { tld: '.ai', ctr: '3.1%', type: 'ccTLD*' },
  { tld: '.co', ctr: '3.0%', type: 'ccTLD*' },
];

const COST_OWNERSHIP = [
  { tld: '.com', first: '$9–12', renew: '$14–18', five: '~$65–85' },
  { tld: '.org', first: '$10–13', renew: '$14–17', five: '~$66–81' },
  { tld: '.io', first: '$32–45', renew: '$45–60', five: '~$212–285' },
  { tld: '.ai', first: '$50–80', renew: '$50–90', five: '~$250–440' },
  { tld: '.xyz', first: '$1–2', renew: '$12–14', five: '~$49–58' },
  { tld: '.app', first: '$12–16', renew: '$18–22', five: '~$84–104' },
];

const PRICE_TABLE = [
  { tld: '.xyz', first: '$1–$2', renew: '$12–$14' },
  { tld: '.online', first: '$1–$3', renew: '$30–$40' },
  { tld: '.shop', first: '$1–$3', renew: '$30–$35' },
  { tld: '.site', first: '$1–$3', renew: '$30–$35' },
  { tld: '.store', first: '$1–$4', renew: '$35–$40' },
  { tld: '.info', first: '$3–$5', renew: '$18–$22' },
  { tld: '.me', first: '$5–$10', renew: '$18–$22' },
  { tld: '.com', first: '$9–$12', renew: '$14–$18' },
  { tld: '.org', first: '$10–$13', renew: '$14–$17' },
  { tld: '.co', first: '$10–$25', renew: '$25–$35' },
  { tld: '.dev', first: '$12–$15', renew: '$16–$20' },
  { tld: '.net', first: '$12–$15', renew: '$16–$19' },
  { tld: '.app', first: '$12–$16', renew: '$18–$22' },
  { tld: '.io', first: '$32–$45', renew: '$45–$60' },
  { tld: '.ai', first: '$50–$80', renew: '$50–$90' },
];

const TLD_TYPES = [
  {
    title: 'Generic TLDs (gTLDs)',
    badge: '22+ classics',
    body: 'The most common endings — .com, .net, .org, and .info. Open to anyone worldwide and the most recognized domain name endings. .com remains the most popular choice for businesses.',
    bodyMobile: 'Most common endings — .com, .net, .org, .info. Open worldwide; .com stays the business default.',
    examples: ['.com', '.net', '.org', '.info'],
  },
  {
    title: 'Country code TLDs (ccTLDs)',
    badge: '250+',
    body: 'Two-letter endings for countries — .uk, .de, .ca, .us. Some ccTLDs such as .io and .ai are adopted globally by tech and AI companies far beyond their original regions.',
    bodyMobile: 'Two-letter country endings — .uk, .de, .ca, .us. Some (.io, .ai) are used globally by tech brands.',
    examples: ['.us', '.uk', '.in', '.de', '.ca'],
  },
  {
    title: 'Industry & new gTLDs',
    badge: '1,200+',
    body: 'Hundreds of newer endings launched since 2012 — .app, .dev, .shop, .tech, .online. Pick a URL ending that describes your industry or purpose for sharper branding.',
    bodyMobile: 'Newer endings since 2012 — .app, .dev, .shop, .tech. Pick one that matches your industry.',
    examples: ['.app', '.dev', '.me', '.shop', '.tech'],
  },
];
/** Spotlight cards with illustrative registration scale + example brands */
const SPOTLIGHTS = [
  {
    tld: '.com',
    type: 'gTLD',
    blurb: 'The most popular and universally trusted domain extension worldwide.',
    registrations: '307M+',
    examples: ['stripe.com', 'figma.com'],
  },
  {
    tld: '.net',
    type: 'gTLD',
    blurb: 'Versatile extension for technology companies and network services.',
    registrations: '24M+',
    examples: ['verizon.net', 'behance.net'],
  },
  {
    tld: '.org',
    type: 'gTLD',
    blurb: 'Trusted extension for nonprofits, open-source, and community organizations.',
    registrations: '21M+',
    examples: ['wikipedia.org', 'mozilla.org'],
  },
  {
    tld: '.info',
    type: 'gTLD',
    blurb: 'Ideal for informational sites, knowledge bases, and reference properties.',
    registrations: '12M+',
    examples: ['worldometers.info'],
  },
  {
    tld: '.co',
    type: 'ccTLD',
    blurb: 'Short, memorable alternative to .com — popular with startups.',
    registrations: '7M+',
    examples: ['vsco.co', 'carrd.co'],
  },
  {
    tld: '.ai',
    type: 'ccTLD',
    blurb: 'Go-to extension for AI companies. Originally Anguilla’s country code.',
    registrations: '1M+',
    examples: ['perplexity.ai', 'claude.ai'],
  },
  {
    tld: '.io',
    type: 'ccTLD',
    blurb: 'Engineer-friendly ending associated with modern products and APIs.',
    registrations: 'Growing',
    examples: ['github.io'],
  },
  {
    tld: '.app',
    type: 'New gTLD',
    blurb: 'HTTPS-first extension built for applications and product brands.',
    registrations: 'Growing',
    examples: ['flutter.dev'],
  },
];

const STEPS = [
  {
    n: '1',
    title: 'Check all TLDs at once',
    body: 'Enter any name above and instantly see which extensions are available. No need to check registrars one by one.',
    bodyMobile: 'Type a name above — see every extension’s availability instantly.',
  },
  {
    n: '2',
    title: 'Filter by category & intent',
    body: 'Narrow to Featured, Technology, Country, or industry groups so you only scan endings that fit your brand.',
    bodyMobile: 'Filter Featured, Tech, Country, or industry groups that fit your brand.',
  },
  {
    n: '3',
    title: 'Compare prices & renewals',
    body: 'Review first-year vs renewal ranges, then open Price Compare to weigh registrars before you buy.',
    bodyMobile: 'Check year-1 vs renewals, then open Price Compare before you buy.',
  },
  {
    n: '4',
    title: 'Get smart alternatives',
    body: 'If .com is taken, try .io, .co, .ai, or industry TLDs — or use the AI generator for creative variants.',
    bodyMobile: 'If .com is taken, try .io, .ai, or industry TLDs — or use the AI generator.',
  },
];

const REGISTRAR_COVERAGE = [
  { name: 'Dynadot', share: '77%', note: 'Broad TLD catalog' },
  { name: 'GoDaddy', share: '70%', note: 'Wide consumer coverage' },
  { name: 'Namecheap', share: '64%', note: 'Popular for developers' },
  { name: 'Spaceship', share: '58%', note: 'Growing catalog' },
  { name: 'Hostinger', share: '56%', note: 'Hosting + domains' },
  { name: 'Wix', share: '51%', note: 'Site builders' },
];

type FaqIcon = 'globe' | 'star' | 'layers' | 'dollar' | 'sparkles' | 'search' | 'info' | 'shield' | 'magic' | 'clock';

const FAQS: { q: string; a: string; icon: FaqIcon }[] = [
  {
    icon: 'globe',
    q: 'What is a domain extension?',
    a: 'A domain extension (TLD) is the suffix after the final dot — .com, .net, .org. Also called a domain ending or URL extension. ICANN has delegated 1,500+; DomainDiscovery surfaces the ones that matter for brands — free and private.',
  },
  {
    icon: 'star',
    q: 'What are the most popular domain extensions?',
    a: 'Leaders: .com, .net, .org, .info, .co. .com still holds a huge share worldwide. .io, .ai, .app, and .dev grew fast with tech and startups. Use the checker above to test them all at once.',
  },
  {
    icon: 'layers',
    q: 'How many domain extensions are there?',
    a: 'Over 1,500 TLDs are delegated by ICANN. The catalog expanded after 2012 new gTLDs. DomainDiscovery organizes 1,000+ of the most relevant so you can search without noise.',
  },
  {
    icon: 'dollar',
    q: 'What are the cheapest domain extensions?',
    a: 'First-year promos on .xyz, .online, .site, .store, and .shop can start under a few dollars — renewals often hit $30+. Classic .com (~$9–12/yr) often wins long-term. Always check renewal; use Price Compare.',
  },
  {
    icon: 'sparkles',
    q: 'Which domain extensions are best for SEO?',
    a: 'Search engines treat gTLDs equally for ranking. Users still click .com more from trust. Country codes (.uk, .de, .ca) help local visibility. Pick a memorable name, then build content and links.',
  },
  {
    icon: 'search',
    q: 'How do I check if a domain extension is available?',
    a: 'Type a brand name in the search box above. Live Available vs Taken streams across the catalog. Use full search, Bulk Domain Search, or alternatives — free, no account.',
  },
  {
    icon: 'info',
    q: 'What is the difference between a domain extension and a TLD?',
    a: 'Same thing: the last label after the final dot. “Domain extension” is everyday language; “TLD” is the ICANN/registrar term. Also “domain endings” or “URL extensions.”',
  },
  {
    icon: 'shield',
    q: 'Can I register a domain with any extension?',
    a: 'Most gTLDs are open. Some ccTLDs (.us, .eu, .ca) may need residency. Restricted TLDs (.bank, .pharmacy) need verification — your registrar shows rules at checkout.',
  },
  {
    icon: 'magic',
    q: 'What if the .com version of my domain is taken?',
    a: 'Try .io, .co, .ai, or an industry TLD. Check the same keyword across extensions here, use the AI Domain Generator for variants, or Price Compare your shortlist.',
  },
  {
    icon: 'clock',
    q: 'What are new domain extensions?',
    a: 'New gTLDs are endings ICANN approved since 2012 — .app, .dev, .shop, .tech, .online, and brand TLDs. Browse Industry categories or popular TLD chips to explore them live.',
  },
];

const FAQ_ICONS: Record<FaqIcon, React.ReactNode> = {
  globe: <Icons.Globe />,
  star: <Icons.Star />,
  layers: <Icons.Layers />,
  dollar: <Icons.Dollar />,
  sparkles: <Icons.Sparkles />,
  search: <Icons.Search className="w-4 h-4" />,
  info: <Icons.Info />,
  shield: <Icons.Shield />,
  magic: <Icons.Magic />,
  clock: <Icons.Clock />,
};

const POPULAR_LINKS = [
  '.com',
  '.ai',
  '.io',
  '.net',
  '.org',
  '.info',
  '.app',
  '.co',
  '.me',
  '.online',
  '.xyz',
  '.dev',
];

export const ExtensionsGuideContent: React.FC = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [industryTab, setIndustryTab] = useState<keyof typeof INDUSTRY_TABS>('Technology');
  const [showAllPrices, setShowAllPrices] = useState(false);

  React.useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;

  // Solid plates so ambient dots only show in page gutters — never through text/cards
  const panel = isLight
    ? 'bg-white border border-slate-200 shadow-sm shadow-slate-900/[0.03]'
    : 'bg-[#0a0a0c] border border-white/10';

  const chip = isLight
    ? 'bg-slate-50 border border-slate-200 text-slate-700'
    : 'bg-[#121214] border border-white/10 text-white/75';

  const priceRows = showAllPrices ? PRICE_TABLE : PRICE_TABLE.slice(0, 8);

  return (
    <div className="ext-guide mt-5 sm:mt-14 space-y-5 sm:space-y-14 w-full min-w-0 max-w-full">
      {/* —— How to choose —— */}
      <section className="border-t pt-5 sm:pt-12" style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)' }}>
        <div className="text-center max-w-2xl mx-auto mb-3 sm:mb-7">
          <p
            className={`inline-flex text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1.5 sm:mb-2 px-2 py-0.5 rounded-full border ${
              isLight ? 'border-slate-200 bg-white text-slate-500' : 'border-white/10 text-white/45'
            }`}
            style={isLight ? undefined : { backgroundColor: '#0a0a0c' }}
          >
            Guides & education
          </p>
          <h2 className="text-[0.95rem] sm:text-2xl font-black tracking-tight mb-1 sm:mb-1.5">
            How to choose the right domain extension
          </h2>
          <p className="text-[11px] sm:text-[14px] leading-snug sm:leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
            <span className="sm:hidden">Match brand, audience, and budget — not only what’s free.</span>
            <span className="hidden sm:inline">
              The best TLD matches your brand, audience, and budget — not only what is free on day one. Use these
              principles while you search above.
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4 w-full min-w-0">
          {/* Industry */}
          <div className={`shine-border rounded-xl sm:rounded-2xl p-3 sm:p-5 md:col-span-2 min-w-0 max-w-full overflow-hidden ${panel}`}>
            <h3 className="text-[13px] sm:text-[15px] font-bold mb-1">Match your brand and industry</h3>
            <p className="text-[11px] sm:text-[12px] leading-relaxed mb-2.5 sm:mb-3" style={{ color: 'var(--text-tertiary)' }}>
              Pick your field and surface TLDs that best signal what you do at a glance.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-2.5 sm:mb-3">
              {(Object.keys(INDUSTRY_TABS) as (keyof typeof INDUSTRY_TABS)[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setIndustryTab(tab)}
                  className={`rounded-full px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold border transition-colors ${
                    industryTab === tab
                      ? isLight
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-black border-white'
                      : isLight
                        ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        : 'bg-[#121214] text-white/55 border-white/10 hover:border-white/20'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <ul className="grid sm:grid-cols-2 gap-1.5 sm:gap-2">
              {INDUSTRY_TABS[industryTab].map((item) => (
                <li key={item.tld} className="flex gap-2 items-start min-w-0">
                  <Link
                    href={`/search?q=brand${item.tld}`}
                    className={`shrink-0 font-mono text-[11px] sm:text-[12px] font-black px-2 py-0.5 rounded-md ${chip}`}
                  >
                    {item.tld}
                  </Link>
                  <span className="text-[11px] sm:text-[12px] leading-snug pt-0.5 min-w-0" style={{ color: 'var(--text-secondary)' }}>
                    {item.blurb}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust */}
          <div className={`shine-border rounded-xl sm:rounded-2xl p-3 sm:p-5 min-w-0 max-w-full overflow-hidden ${panel}`}>
            <h3 className="text-[13px] sm:text-[15px] font-bold mb-1">Prioritize recognition and trust</h3>
            <p className="text-[11px] sm:text-[12px] leading-relaxed mb-2.5 sm:mb-3" style={{ color: 'var(--text-tertiary)' }}>
              <span className="sm:hidden">Legacy TLDs like .com carry the most trust — weigh recognition vs newer options.</span>
              <span className="hidden sm:inline">
                Legacy TLDs like .com and .org carry decades of familiarity. Weigh brand recognition against newer
                options.
              </span>
            </p>
            <div className="space-y-2 sm:space-y-2.5">
              {TRUST_TLDS.map((item) => (
                <div key={item.tld} className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span
                    className={`font-mono text-[11px] sm:text-[12px] font-black w-10 sm:w-12 shrink-0 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {item.tld}
                  </span>
                  <div
                    className="flex-1 min-w-0 h-1.5 rounded-full overflow-hidden"
                    style={{ background: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)' }}
                  >
                    <div
                      className={`h-full rounded-full ${isLight ? 'bg-slate-800' : 'bg-white/80'}`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span
                    className="trust-note text-[9px] sm:text-[10px] sm:w-[7.5rem] shrink-0 text-right tabular-nums"
                    style={{ color: 'var(--text-tertiary)' }}
                    title={`${item.score} · ${item.note}`}
                  >
                    <span className="sm:hidden">{item.score}</span>
                    <span className="hidden sm:inline">
                      {item.score} · {item.note}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Short */}
          <div className={`shine-border rounded-xl sm:rounded-2xl p-3 sm:p-5 min-w-0 max-w-full overflow-hidden ${panel}`}>
            <h3 className="text-[13px] sm:text-[15px] font-bold mb-1">Keep it short and memorable</h3>
            <p className="text-[11px] sm:text-[12px] leading-relaxed mb-2.5 sm:mb-3" style={{ color: 'var(--text-tertiary)' }}>
              <span className="sm:hidden">Shorter TLDs are easier to type, say, and share.</span>
              <span className="hidden sm:inline">
                Shorter extensions are easier to type, speak, and share. Two- and three-letter TLDs are often the sweet
                spot.
              </span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {MEMORABLE_EXAMPLES.map((tld) => (
                <span
                  key={tld}
                  className={`font-mono text-[11px] sm:text-[12px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg ${chip}`}
                >
                  brand{tld}
                </span>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className={`shine-border rounded-xl sm:rounded-2xl p-3 sm:p-5 min-w-0 max-w-full overflow-hidden ${panel}`}>
            <h3 className="text-[13px] sm:text-[15px] font-bold mb-1">Consider your audience’s location</h3>
            <p className="text-[11px] sm:text-[12px] leading-relaxed mb-2.5 sm:mb-3" style={{ color: 'var(--text-tertiary)' }}>
              <span className="sm:hidden">Country-code TLDs boost local trust and regional SEO.</span>
              <span className="hidden sm:inline">
                Country-code TLDs boost local trust and regional SEO. Some require residency or a local presence.
              </span>
            </p>
            <ul className="space-y-1.5 sm:space-y-2">
              {COUNTRY_TLDS.map((item) => (
                <li key={item.tld} className="flex gap-2 sm:gap-2.5 items-start min-w-0">
                  <span className={`shrink-0 font-mono text-[11px] sm:text-[12px] font-black px-2 py-0.5 rounded-md ${chip}`}>
                    {item.tld}
                  </span>
                  <span className="text-[11px] sm:text-[12px] leading-snug pt-0.5 min-w-0" style={{ color: 'var(--text-secondary)' }}>
                    {item.blurb}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* SEO */}
          <div className={`shine-border rounded-xl sm:rounded-2xl p-3 sm:p-5 min-w-0 max-w-full overflow-hidden ${panel}`}>
            <h3 className="text-[13px] sm:text-[15px] font-bold mb-1">Think about SEO impact</h3>
            <p className="text-[11px] sm:text-[12px] leading-relaxed mb-2.5 sm:mb-3" style={{ color: 'var(--text-tertiary)' }}>
              <span className="sm:hidden">gTLDs rank evenly — CTR still follows familiarity.</span>
              <span className="hidden sm:inline">
                Search engines rank gTLDs evenly — click-through still varies with user familiarity and perceived
                authority.
              </span>
            </p>
            <div className="overflow-x-auto -mx-0.5 px-0.5">
              <table className="w-full text-left text-[11px] sm:text-[12px]">
                <thead>
                  <tr style={{ color: 'var(--text-tertiary)' }}>
                    <th className="font-semibold pb-2 pr-3">TLD</th>
                    <th className="font-semibold pb-2 pr-3">Type</th>
                    <th className="font-semibold pb-2">Avg. CTR*</th>
                  </tr>
                </thead>
                <tbody>
                  {SEO_ROWS.map((row) => (
                    <tr
                      key={row.tld}
                      className={isLight ? 'border-t border-slate-100' : 'border-t border-white/[0.06]'}
                    >
                      <td className="py-2 pr-3 font-mono font-bold">{row.tld}</td>
                      <td className="py-2 pr-3" style={{ color: 'var(--text-tertiary)' }}>
                        {row.type}
                      </td>
                      <td className="py-2 font-semibold">{row.ctr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
                *Illustrative familiarity metrics — not a ranking guarantee. *ccTLDs often used globally.
              </p>
            </div>
          </div>

          {/* Cost ownership */}
          <div className={`shine-border rounded-xl sm:rounded-2xl p-3 sm:p-5 md:col-span-2 min-w-0 max-w-full overflow-hidden ${panel}`}>
            <h3 className="text-[13px] sm:text-[15px] font-bold mb-1">Compare long-term costs</h3>
            <p className="text-[11px] sm:text-[12px] leading-relaxed mb-2.5 sm:mb-3" style={{ color: 'var(--text-tertiary)' }}>
              <span className="sm:hidden">Don’t chase first-year promos — renewals compound. Project full ownership cost.</span>
              <span className="hidden sm:inline">
                First-year promos can be misleading — renewal pricing compounds year after year. Project the full cost of
                ownership before you commit.
              </span>
            </p>
            <div className="overflow-x-auto -mx-0.5 px-0.5">
              <table className="w-full text-left text-[11px] sm:text-[12px] min-w-0 sm:min-w-[28rem]">
                <thead>
                  <tr style={{ color: 'var(--text-tertiary)' }}>
                    <th className="font-semibold pb-2 pr-2 sm:pr-3">
                      <span className="sm:hidden">Ext</span>
                      <span className="hidden sm:inline">Extension</span>
                    </th>
                    <th className="font-semibold pb-2 pr-2 sm:pr-3">
                      <span className="sm:hidden">Year 1</span>
                      <span className="hidden sm:inline">First year</span>
                    </th>
                    <th className="font-semibold pb-2 pr-2 sm:pr-3">
                      <span className="sm:hidden">Renew</span>
                      <span className="hidden sm:inline">Renewal</span>
                    </th>
                    <th className="font-semibold pb-2">
                      <span className="sm:hidden">~5y*</span>
                      <span className="hidden sm:inline">~5y total*</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COST_OWNERSHIP.map((row) => (
                    <tr
                      key={row.tld}
                      className={isLight ? 'border-t border-slate-100' : 'border-t border-white/[0.06]'}
                    >
                      <td className="py-1.5 sm:py-2 pr-2 sm:pr-3 font-mono font-bold">{row.tld}</td>
                      <td className="py-1.5 sm:py-2 pr-2 sm:pr-3">{row.first}</td>
                      <td className="py-1.5 sm:py-2 pr-2 sm:pr-3">{row.renew}</td>
                      <td className="py-1.5 sm:py-2 font-semibold">{row.five}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[9px] sm:text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
                *Approx. registrar ranges (2026). Verify live pricing at checkout.
              </p>
            </div>
            <Link
              href="/tools/compare"
              className={`inline-flex mt-2.5 sm:mt-3 text-[11px] sm:text-[12px] font-semibold ${
                isLight ? 'text-slate-800 hover:text-black' : 'text-white/80 hover:text-white'
              }`}
            >
              Open price comparison →
            </Link>
          </div>
        </div>
      </section>

      {/* —— Popular TLD jump links —— */}
      <section className={`shine-border rounded-xl sm:rounded-2xl p-3 sm:p-6 min-w-0 max-w-full overflow-hidden ${panel}`}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="min-w-0">
            <h2 className="text-[0.95rem] sm:text-xl font-black tracking-tight mb-1">Search domains by TLD extensions</h2>
            <p className="text-[11px] sm:text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
              <span className="sm:hidden">Check any ending live — pick one and search.</span>
              <span className="hidden sm:inline">
                Each ending can be checked live with availability and pricing context. Pick any extension and start
                searching.
              </span>
            </p>
          </div>
          <a
            href="#extensions-search"
            className={`text-[11px] sm:text-[12px] font-semibold shrink-0 ${
              isLight ? 'text-slate-700 hover:text-slate-900' : 'text-white/70 hover:text-white'
            }`}
          >
            <span className="sm:hidden">Search all →</span>
            <span className="hidden sm:inline">Search all extensions →</span>
          </a>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {POPULAR_LINKS.map((tld) => (
            <Link
              key={tld}
              href={`/search?q=example${tld}`}
              className={`shine-border font-mono text-[11px] sm:text-[13px] font-black px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border transition-all ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-white'
                  : 'bg-[#0c0c0e] border-white/10 text-white hover:bg-[#121214]'
              }`}
            >
              {tld}
            </Link>
          ))}
        </div>
      </section>

      {/* —— TLD families —— */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-3 sm:mb-6">
          <h2 className="text-[0.95rem] sm:text-2xl font-black tracking-tight mb-1 sm:mb-1.5">Types of domain extensions</h2>
          <p className="text-[11px] sm:text-[14px] leading-snug sm:leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
            <span className="sm:hidden">Generics, country codes, and industry endings — shortlist faster.</span>
            <span className="hidden sm:inline">
              Understanding TLD families helps you shortlist faster — classic generics, country codes, and industry
              endings.
            </span>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 w-full min-w-0">
          {TLD_TYPES.map((block) => (
            <div
              key={block.title}
              className={`shine-border rounded-xl sm:rounded-2xl p-3 sm:p-5 min-w-0 max-w-full overflow-hidden ${panel}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2 min-w-0">
                <h3 className="text-[12px] sm:text-[14px] font-bold leading-snug min-w-0 break-words">{block.title}</h3>
                <span className={`shrink-0 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide px-1.5 sm:px-2 py-0.5 rounded-full ${chip}`}>
                  {block.badge}
                </span>
              </div>
              <p
                className="text-[11px] sm:text-[12px] leading-snug sm:leading-relaxed mb-2 sm:mb-3 break-words"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <span className="sm:hidden">{block.bodyMobile}</span>
                <span className="hidden sm:inline">{block.body}</span>
              </p>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {block.examples.map((tld) => (
                  <Link
                    key={tld}
                    href={`/search?q=name${tld}`}
                    className={`font-mono text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${
                      isLight
                        ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                        : 'bg-[#121214] text-white/80 hover:bg-[#16161a]'
                    }`}
                  >
                    {tld}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* —— Spotlight cards (like IDS feature cards) —— */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-3 sm:mb-5">
          <div className="min-w-0">
            <h2 className="text-[0.95rem] sm:text-2xl font-black tracking-tight mb-1">Featured domain endings</h2>
            <p className="text-[11px] sm:text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
              <span className="sm:hidden">What popular TLDs are known for — scale &amp; examples.</span>
              <span className="hidden sm:inline">
                What each popular TLD is known for — plus illustrative registration scale and example brands.
              </span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full min-w-0">
          {SPOTLIGHTS.map((s) => (
            <div key={s.tld} className={`shine-border rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col min-w-0 max-w-full overflow-hidden ${panel}`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Link
                  href={`/search?q=brand${s.tld}`}
                  className="font-mono text-lg font-black tracking-tight hover:opacity-80"
                >
                  {s.tld}
                </Link>
                <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${chip}`}>
                  {s.type}
                </span>
              </div>
              <p className="text-[12px] leading-relaxed mb-3 flex-1" style={{ color: 'var(--text-tertiary)' }}>
                {s.blurb}
              </p>
              <div
                className={`text-[11px] font-semibold mb-2 tabular-nums ${
                  isLight ? 'text-slate-700' : 'text-white/70'
                }`}
              >
                {s.registrations}{' '}
                <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
                  registered scale*
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {s.examples.map((ex) => (
                  <span
                    key={ex}
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      isLight ? 'bg-slate-50 text-slate-500' : 'bg-[#121214] text-white/40'
                    }`}
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
          *Registration figures are approximate industry estimates for context, not live WHOIS counts.
        </p>
      </section>

      {/* —— Pricing ranges table —— */}
      <section className={`shine-border rounded-xl sm:rounded-2xl p-3 sm:p-6 min-w-0 max-w-full overflow-hidden ${panel}`}>
        <h2 className="text-[0.95rem] sm:text-xl font-black tracking-tight mb-1">Extension pricing ranges</h2>
        <p className="text-[11px] sm:text-[13px] mb-3 sm:mb-4" style={{ color: 'var(--text-tertiary)' }}>
          <span className="sm:hidden">Approx. year-1 &amp; renewal ranges. Always check renewals.</span>
          <span className="hidden sm:inline">
            Approximate first-year and renewal ranges across major registrars. Promo pricing is common — always check
            renewals before you register.
          </span>
        </p>
        <div className="overflow-x-auto -mx-0.5 px-0.5">
          <table className="w-full text-left text-[11px] sm:text-[12px] min-w-0 sm:min-w-[22rem]">
            <thead>
              <tr style={{ color: 'var(--text-tertiary)' }}>
                <th className="font-semibold pb-2 pr-3 sm:pr-4">
                  <span className="sm:hidden">Ext</span>
                  <span className="hidden sm:inline">Extension</span>
                </th>
                <th className="font-semibold pb-2 pr-3 sm:pr-4">
                  <span className="sm:hidden">Year 1</span>
                  <span className="hidden sm:inline">First year</span>
                </th>
                <th className="font-semibold pb-2">Renewal</th>
              </tr>
            </thead>
            <tbody>
              {priceRows.map((row) => (
                <tr
                  key={row.tld}
                  className={isLight ? 'border-t border-slate-100' : 'border-t border-white/[0.06]'}
                >
                  <td className="py-1.5 sm:py-2.5 pr-3 sm:pr-4">
                    <Link href={`/search?q=name${row.tld}`} className="font-mono font-bold hover:underline">
                      {row.tld}
                    </Link>
                  </td>
                  <td className="py-1.5 sm:py-2.5 pr-3 sm:pr-4">{row.first}</td>
                  <td className="py-1.5 sm:py-2.5 font-semibold">{row.renew}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-2.5 sm:mt-3">
          <button
            type="button"
            onClick={() => setShowAllPrices((v) => !v)}
            className={`text-[11px] sm:text-[12px] font-semibold ${
              isLight ? 'text-slate-700 hover:text-black' : 'text-white/70 hover:text-white'
            }`}
          >
            {showAllPrices ? 'Show fewer' : (
              <>
                <span className="sm:hidden">Show all {PRICE_TABLE.length}</span>
                <span className="hidden sm:inline">Show all {PRICE_TABLE.length} extensions</span>
              </>
            )}
          </button>
          <Link
            href="/tools/compare"
            className={`text-[11px] sm:text-[12px] font-semibold ${
              isLight ? 'text-slate-700 hover:text-black' : 'text-white/70 hover:text-white'
            }`}
          >
            <span className="sm:hidden">Compare →</span>
            <span className="hidden sm:inline">Compare registrars →</span>
          </Link>
        </div>
      </section>

      {/* —— How it works —— */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-3 sm:mb-6">
          <h2 className="text-[0.95rem] sm:text-2xl font-black tracking-tight mb-1 sm:mb-1.5">
            Search every extension with DomainDiscovery
          </h2>
          <p className="text-[11px] sm:text-[14px] leading-snug sm:leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
            Free, private, real-time — no accounts or tracking.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full min-w-0">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className={`shine-border rounded-xl sm:rounded-2xl p-3 sm:p-4 min-w-0 max-w-full overflow-hidden ${panel}`}
            >
              <div
                className={`inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg text-[11px] sm:text-[12px] font-black mb-1.5 sm:mb-2.5 ${
                  isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
                }`}
              >
                {step.n}
              </div>
              <h3 className="text-[12px] sm:text-[13px] font-bold mb-0.5 sm:mb-1 break-words">{step.title}</h3>
              <p
                className="text-[11px] sm:text-[12px] leading-snug sm:leading-relaxed break-words"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <span className="sm:hidden">{step.bodyMobile}</span>
                <span className="hidden sm:inline">{step.body}</span>
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-3.5 sm:mt-5">
          <Link
            href="/bulk-search"
            className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-[12px] font-semibold border ${
              isLight ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-black border-white'
            }`}
          >
            <span className="sm:hidden">Bulk Search</span>
            <span className="hidden sm:inline">Bulk Domain Search</span>
          </Link>
          <Link
            href="/generator"
            className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-[12px] font-semibold border ${
              isLight
                ? 'bg-white text-slate-800 border-slate-200'
                : 'bg-[#121214] text-white border-white/15'
            }`}
          >
            <span className="sm:hidden">AI Generator</span>
            <span className="hidden sm:inline">AI Domain Generator</span>
          </Link>
          <Link
            href="/tools/compare"
            className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-[12px] font-semibold border ${
              isLight
                ? 'bg-white text-slate-800 border-slate-200'
                : 'bg-[#121214] text-white border-white/15'
            }`}
          >
            Price Compare
          </Link>
        </div>
      </section>

      {/* —— Registrar coverage (rephrased) —— */}
      <section className={`shine-border rounded-xl sm:rounded-2xl p-3 sm:p-6 min-w-0 max-w-full overflow-hidden ${panel}`}>
        <h2 className="text-[0.95rem] sm:text-xl font-black tracking-tight mb-1 break-words">
          Where people register domains
        </h2>
        <p className="text-[11px] sm:text-[13px] mb-2.5 sm:mb-4 break-words" style={{ color: 'var(--text-tertiary)' }}>
          <span className="sm:hidden">Major registrars cover hundreds of TLDs — compare live deals on your shortlist.</span>
          <span className="hidden sm:inline">
            Major registrars support hundreds of TLDs. Coverage changes as providers add or drop extensions — use Price
            Compare for live deals on your shortlist.
          </span>
        </p>
        {/* Mobile: compact list rows. Desktop: multi-column cards. */}
        <div className="flex flex-col gap-1.5 sm:hidden w-full min-w-0">
          {REGISTRAR_COVERAGE.map((r) => (
            <div
              key={r.name}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 border min-w-0 ${
                isLight ? 'bg-slate-50 border-slate-100' : 'bg-[#121214] border-white/[0.06]'
              }`}
            >
              <div className="min-w-0 flex-1 text-[12px] font-bold truncate">{r.name}</div>
              <div className="shrink-0 text-[12px] font-black tabular-nums">{r.share}</div>
              <div
                className="shrink-0 max-w-[38%] text-[9px] text-right truncate"
                style={{ color: 'var(--text-muted)' }}
              >
                {r.note}
              </div>
            </div>
          ))}
        </div>
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {REGISTRAR_COVERAGE.map((r) => (
            <div
              key={r.name}
              className={`rounded-xl px-3 py-2.5 text-center border min-w-0 ${
                isLight ? 'bg-slate-50 border-slate-100' : 'bg-[#121214] border-white/[0.06]'
              }`}
            >
              <div className="text-[12px] font-bold truncate">{r.name}</div>
              <div className="text-[11px] font-black mt-0.5 tabular-nums">{r.share}</div>
              <div className="text-[9px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                {r.note}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] sm:text-[10px] mt-2.5 sm:mt-3 break-words" style={{ color: 'var(--text-muted)' }}>
          Shares reflect approximate catalog breadth — not DomainDiscovery rankings.
        </p>
      </section>

      {/* Homepage FAQ design system — full width mobile accordion; desktop grid unchanged */}
      <div className="scroll-mt-24 w-full min-w-0 max-w-full overflow-x-hidden">
        <PremiumFaqGrid
          id="extension-faqs"
          title="Domain extension FAQs"
          subtitle="TLDs, pricing, SEO, and availability — short answers."
          items={FAQS.map((f) => ({
            question: f.q,
            answer: f.a,
            icon: FAQ_ICONS[f.icon],
          }))}
          maxWidthClass="max-w-none sm:max-w-4xl"
          className="!mb-0 !px-0 !mx-0 w-full max-w-full"
        />
      </div>

      {/* —— Bottom CTA —— */}
      <section
        className={`ext-guide-cta shine-border rounded-xl sm:rounded-2xl p-4 sm:p-7 text-center ${
          isLight ? 'bg-white border border-slate-200 shadow-sm' : 'bg-[#0c0c0e] border border-white/10'
        }`}
      >
        <h2 className="text-[0.95rem] sm:text-xl font-black mb-1 sm:mb-1.5">Ready to find your perfect domain ending?</h2>
        <p className="text-[11px] sm:text-[13px] mb-3 sm:mb-4 max-w-lg mx-auto" style={{ color: 'var(--text-tertiary)' }}>
          <span className="sm:hidden">Search 1,000+ extensions free — live availability, private by default.</span>
          <span className="hidden sm:inline">
            Search 1,000+ extensions with live availability — free, private, and built for speed. Compare prices and
            register when you are ready.
          </span>
        </p>
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
          <a
            href="#extensions-search"
            className={`rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-[13px] font-bold ${
              isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
            }`}
          >
            Search all extensions
          </a>
          <Link
            href="/"
            className={`rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-[13px] font-semibold border ${
              isLight
                ? 'bg-white text-slate-800 border-slate-200'
                : 'bg-transparent text-white border-white/15'
            }`}
          >
            <span className="sm:hidden">Back to home</span>
            <span className="hidden sm:inline">Back to home search</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
