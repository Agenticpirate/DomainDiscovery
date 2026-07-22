/**
 * Phase D — Expand thin learn articles to competitive depth.
 * Preserves slug/title/category/icon/topics/trending; rewrites thin sections.
 * Run: node scripts/expand-learn-phase-d.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const FILE = path.join(ROOT, 'src/data/learn-articles.json');
const MIN_WORDS = 800;
const KEEP_IF_ABOVE = 850; // don't clobber solid pillars unless enriching

function words(sections) {
  return sections
    .flatMap((s) => [s.heading, ...(s.body || [])])
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function readTime(w) {
  const mins = Math.max(6, Math.min(18, Math.round(w / 160)));
  return `${mins} min read`;
}

function toolLinks(cat, slug) {
  const base = [
    'Use free domain name search on DomainDiscovery (/) to check live availability before you pay a registrar.',
    'Compare regular registrar pricing on /tools/compare — promo first-year prices often differ from renewals.',
    'Look up ownership and dates with WHOIS/RDAP on /tools/whois when you need due diligence.',
  ];
  if (/geo|local|city|cctld/i.test(slug + cat)) {
    base.push(
      'Build city and country name lists with the geo domain generator at /tools/geo, then export CSV for bulk checks.'
    );
  }
  if (/bulk|list|portfolio|monitor/i.test(slug + cat)) {
    base.push('Paste up to 100 names into bulk search at /bulk-search to check a shortlist in one pass.');
  }
  if (/generat|brand|name|naming|radio|smile/i.test(slug + cat)) {
    base.push('Brainstorm brandable alternatives with the AI domain generator at /generator when .com is taken.');
  }
  if (/tld|extension|gtld|cctld/i.test(slug + cat)) {
    base.push('Browse 1,600+ extensions in the domain extensions catalog at /domain-extensions and the TLD encyclopedia at /blog/tlds.');
  }
  return base;
}

function p(...paras) {
  return paras.filter(Boolean);
}

/** Category playbooks: return array of {heading, body[]} */
function categoryPlaybook(article) {
  const { title, slug, category, description, topics } = article;
  const topicLine = (topics || []).slice(0, 4).join(', ') || category;
  const tools = toolLinks(category, slug);
  const cat = category;

  const commonClose = [
    {
      heading: 'How DomainDiscovery helps',
      body: p(
        `DomainDiscovery (Domain Discovery / Domains Discovery) is a free research layer for domain name search, registration planning, and due diligence — not a registrar checkout. ${description}`,
        tools.join(' ')
      ),
    },
    {
      heading: 'Common mistakes to avoid',
      body: p(
        `People researching “${title}” often skip renewal math, trademark checks, or DNS ownership after purchase. A cheap first year can hide an expensive second year.`,
        'Another mistake is treating availability snapshots as permanent. Re-check at registrar checkout, enable lock and recovery email, and document who controls the account.',
        'Avoid doorway-style multi-domain spam if your goal is search visibility. One strong site with clear content usually beats dozens of thin pages on near-identical names.'
      ),
    },
    {
      heading: 'Practical checklist',
      body: p(
        `Before you act on ${topicLine}: (1) define the job of the domain (brand, campaign, local, email), (2) search availability across realistic TLDs, (3) scan trademarks in your markets, (4) compare register vs renew pricing, (5) plan DNS and email, (6) set lock + auto-renew policy, (7) record account ownership.`,
        'Write the decision down. Teams that register “in the moment” often forget why a name exists and let renewals pile up.'
      ),
    },
    {
      heading: 'Next steps',
      body: p(
        `Apply this guide: run a live domain name search for your shortlist, open related Learn guides in the ${cat} cluster, and only then complete registration at a registrar you trust.`,
        'If you are still choosing between options, generate brandable alternates, test geo patterns for local markets, and use WHOIS on any aftermarket targets before you negotiate.'
      ),
    },
  ];

  // Category-specific core sections (unique framing)
  const cores = {
    Beginner: [
      {
        heading: `What “${title}” means in plain language`,
        body: p(
          description,
          'A domain name is a human-readable address that maps to infrastructure on the internet. Registration is a time-limited license through a registrar under registry rules — you renew to keep control, and you can lose the name if you let it expire or transfer carelessly.',
          'Beginners should separate three jobs: (1) choosing a name people can say and type, (2) checking availability and policy, (3) completing setup (DNS, email, lock) so the name actually works for a site or inbox.'
        ),
      },
      {
        heading: 'Step-by-step for first-time buyers',
        body: p(
          '1) Write 5–15 candidates. 2) Run domain name search across .com and 1–2 realistic alternates. 3) Eliminate hard spellings and trademark collisions. 4) Compare first-year vs renewal at two registrars. 5) Register with accurate account recovery. 6) Turn on registrar lock. 7) Point nameservers or DNS records when the site is ready. 8) Configure SPF/DKIM if you send email.',
          'Do not buy ten speculative names on day one unless you have a written portfolio plan. Focus on the name you will put on invoices, ads, and email signatures.'
        ),
      },
      {
        heading: 'Register vs aftermarket vs premium',
        body: p(
          'Standard registration is for names still free at registry prices. Aftermarket means buying from a current owner (marketplace, broker, or private deal) — expect escrow and longer timelines. Premium can mean registry premium pricing or a high aftermarket ask; always confirm the final checkout number.',
          'If a perfect .com is taken, evaluate: negotiate, wait for expiry (risky), pick a strong brandable, or use a fitting alternate TLD you will actually brand.'
        ),
      },
      {
        heading: 'Security and ownership basics',
        body: p(
          'Use a unique password and 2FA on the registrar account. Enable domain lock (clientTransferProhibited-style status). Keep WHOIS privacy where appropriate, but ensure your account email is real and monitored — privacy does not replace account security.',
          'Document which person or company owns the registrar login. Employer-funded domains should not sit only in a personal Gmail if someone leaves the team.'
        ),
      },
    ],
    Tools: [
      {
        heading: `Using tools for: ${title}`,
        body: p(
          description,
          'Domain tools save time when they sit in a workflow: discover → filter → verify → price → register or pass. Spreadsheet chaos usually means missing renewals or double-buying near-duplicates.',
          'DomainDiscovery focuses on free research surfaces: live search, bulk checks, geo list building, AI name ideas, WHOIS/RDAP, and regular-price comparison — then you complete purchase at a registrar.'
        ),
      },
      {
        heading: 'Recommended workflow',
        body: p(
          'Start with a clear input (keyword, brand stem, or city list). Generate or paste candidates. Live-check availability in priority TLD order. Tag free / taken / premium. Export or copy survivors. Compare prices. Run WHOIS on aftermarket targets. Only then open a registrar cart.',
          'Cap each session. Checking thousands of random strings without a use case creates noise and decision fatigue.'
        ),
      },
      {
        heading: 'Limits and honesty',
        body: p(
          'Availability is a snapshot. Network issues can leave rows unresolved — retry those names. Premium flags and prices can differ by source; the registrar cart is authoritative for what you pay today.',
          'Bulk and geo tools are for operators who will support the names. They are not a license to spam thin local pages.'
        ),
      },
      {
        heading: 'When to add monitoring',
        body: p(
          'Monitor names you already own (expiry, DNS changes) and shortlists you cannot buy yet. Monitoring services differ from one-off search: they alert over time. Start simple — calendar renewals — before paying for complex watch lists.'
        ),
      },
    ],
    Naming: [
      {
        heading: `Naming principles behind “${title}”`,
        body: p(
          description,
          'Strong names are easy to say, spell, and remember. They fit the product story without painting you into a tiny niche you will outgrow — unless exact-match SEO is an explicit, measured strategy.',
          'Test candidates out loud (radio test), in a noisy café, and as an email local-part. If people ask “how do you spell that?” twice, keep iterating.'
        ),
      },
      {
        heading: 'Brandable vs keyword tradeoffs',
        body: p(
          'Brandables carry identity and trademark potential; keywords explain the offer faster in ads and directories. Many modern companies use a brandable primary domain plus clear messaging on the page — not the reverse.',
          'Exact-match domains are less of a magic SEO ranking lever than they were a decade ago. Content quality, links, and usefulness dominate. A clunky keyword domain can still hurt conversion if customers distrust it.'
        ),
      },
      {
        heading: 'Length, hyphens, and numbers',
        body: p(
          'Shorter is easier until it becomes cryptic. Hyphens reduce type-in traffic and look less premium in many markets. Numbers force “word or digit?” confusion unless the number is the brand (e.g. a known product code).',
          'Domain hacks (.io, .ai, country codes used as words) can work for technical audiences; validate with non-technical customers before you print packaging.'
        ),
      },
      {
        heading: 'Generate, filter, then commit',
        body: p(
          'Use structured brainstorming or an AI domain name generator, then filter with availability, trademark, and pronunciation gates. Commit to one primary public name so marketing spend compounds.',
          tools[0] + ' ' + (tools.find((t) => t.includes('generator')) || tools[1])
        ),
      },
    ],
    Technical: [
      {
        heading: `Technical overview: ${title}`,
        body: p(
          description,
          'Domains and DNS are separate layers. The domain is the name registration; DNS records tell the internet where to send web and email traffic. Misconfigured DNS is the most common “my domain is broken” cause after a transfer or redesign.',
          'Learn the minimum viable set: A/AAAA or CNAME for the site, MX for mail, TXT for verification and email auth, nameserver delegation when you use a DNS host.'
        ),
      },
      {
        heading: 'DNS, nameservers, and propagation',
        body: p(
          'Nameservers are the servers authoritative for your zone. Changing them or lowering TTLs affects how fast updates spread. Propagation is not a single global switch — resolvers cache records until TTL expiry.',
          'When troubleshooting, check the registrar’s listed nameservers, the DNS host’s zone file, and public resolvers. Avoid changing nameservers and every record at once if you can sequence safer steps.'
        ),
      },
      {
        heading: 'Email authentication and HTTPS',
        body: p(
          'SPF, DKIM, and DMARC reduce spoofing and improve deliverability when set correctly. HTTPS (TLS certificates) encrypts browser sessions; most hosts automate certificates, but custom DNS can break issuance if HTTP-01 or DNS-01 challenges fail.',
          'Treat email and HTTPS as launch requirements, not later polish — especially for login and checkout flows.'
        ),
      },
      {
        heading: 'Transfers, locks, and WHOIS/RDAP',
        body: p(
          'Transfers use auth/EPP codes and unlock status windows. Registrar lock blocks unwanted transfer attempts. WHOIS/RDAP shows public registration data; privacy services often redact personal contacts while still listing registrar and dates.',
          tools[2]
        ),
      },
    ],
    TLDs: [
      {
        heading: `Understanding extensions: ${title}`,
        body: p(
          description,
          'A TLD (top-level domain) is the label after the final dot — .com, .org, .ai, or a country code like .de. Registries set policy and wholesale pricing; registrars retail names to the public.',
          'Choose extensions for audience fit, eligibility, price stability, and brand pronunciation — not because a string looks trendy this week.'
        ),
      },
      {
        heading: 'gTLD vs ccTLD decisions',
        body: p(
          'Generic TLDs are usually global. Country-code TLDs can signal local presence and may help country-targeted SEO when the business is truly local — but some ccTLDs are marketed as generic (policies vary). Trustee services exist where local presence is required; read the rules before you buy.',
          'New gTLDs expand choice and also expand renewal price variance. Always check year-two pricing.'
        ),
      },
      {
        heading: 'SEO myths vs reality',
        body: p(
          'A keyword inside the TLD does not guarantee rankings. Helpful content, technical health, and reputation matter more. ccTLDs can be a geographic signal for that country; use hreflang and proper localization when you operate multi-country sites.',
          'Avoid registering dozens of near-duplicate TLD variants as doorway pages. Protect the brand with a sensible defensive set, then invest in one primary experience.'
        ),
      },
      {
        heading: 'Browse before you bulk-buy',
        body: p(
          tools.find((t) => t.includes('extensions')) || tools[0],
          'Shortlist 1–3 extensions you will actually print on ads and email. Consistency beats collecting every string that was free on a Tuesday.'
        ),
      },
    ],
    Business: [
      {
        heading: `Business use case: ${title}`,
        body: p(
          description,
          'Companies use domains for primary brands, product lines, campaigns, local markets, and defensive registrations. Each name should map to an owner, budget, and success metric — or it becomes silent renewal debt.',
          'Local and multi-location brands often evaluate geo domains and ccTLDs. Those work when operations, reviews, and content are real in each market — not when pages only swap city names.'
        ),
      },
      {
        heading: 'Portfolio and governance',
        body: p(
          'Centralize registrar access, billing, and renewal calendars. Document which legal entity owns what. For agencies, clarify whether client domains sit in client accounts (preferred) or agency accounts with a transfer plan.',
          'Set a review cadence: quarterly prune unused names, update DNS owners, and re-check trademark risk for new product lines.'
        ),
      },
      {
        heading: 'Local SEO and geo patterns',
        body: p(
          'Geo domains can support call tracking and landing pages when each market has unique proof. Pair them with Google Business profiles, real NAP consistency, and service-area honesty.',
          'Use /tools/geo on DomainDiscovery to generate city patterns, filter by population style figures, live-check, and export — then only develop markets you will staff or serve.'
        ),
      },
      {
        heading: 'Buying and risk controls',
        body: p(
          'Prefer escrow for high-value aftermarket purchases. Verify WHOIS history, archive snapshots, and trademark clearance. For joint ventures, write down who pays renewals and who can transfer.'
        ),
      },
    ],
    SEO: [
      {
        heading: `SEO angle: ${title}`,
        body: p(
          description,
          'Domains influence branding and click-through; rankings still depend on content relevance, experience, links, and technical quality. HTTPS is baseline. International setups need clear country/language targeting — not duplicate doorway hosts.',
          'Pick a primary canonical host (www or apex) and stick to it with redirects.'
        ),
      },
      {
        heading: 'What to do on-domain vs on-page',
        body: p(
          'On-domain: sensible name, correct TLD strategy, clean DNS, fast hosting, HTTPS, logical URL structure. On-page: answer the query, use clear headings, internal links, and original evidence.',
          'Do not expect a new domain to outrank established competitors overnight. Measure impressions and queries in Search Console after launch.'
        ),
      },
      {
        heading: 'Multi-domain SEO risks',
        body: p(
          'Spreading thin content across many domains usually underperforms one strong domain with well-structured local or product pages. If you use multiple domains, give each a distinct purpose and audience.',
          'Aged domains with spam history can harm more than help — check history before you buy for “SEO juice.”'
        ),
      },
      {
        heading: 'Practical workflow',
        body: p(
          'Search availability → verify history/WHOIS for used names → build content outline first → launch with analytics and Search Console → iterate. Tools on DomainDiscovery support the research half of that loop.'
        ),
      },
    ],
    Security: [
      {
        heading: `Security focus: ${title}`,
        body: p(
          description,
          'Domain security is account security plus registry status plus DNS integrity. Attackers target transfers, DNS hijacks, and lookalike domains for phishing.',
          'Minimum baseline: unique registrar password, 2FA, domain lock, monitored recovery email, least-privilege access for contractors.'
        ),
      },
      {
        heading: 'Locks, DNSSEC, and privacy',
        body: p(
          'Registrar lock reduces unauthorized transfers. DNSSEC adds cryptographic validation of DNS responses when supported end-to-end. WHOIS privacy hides personal contacts from public scrapers but does not stop account takeover.',
          'For high-value brands, consider registry lock services and formal change-control for DNS edits.'
        ),
      },
      {
        heading: 'Brand protection and lookalikes',
        body: p(
          'Defensive registrations on obvious typos and key TLDs can reduce abuse, but infinite variants exist. Prioritize high-traffic spellings and the TLDs your customers actually type.',
          'Monitor phishing reports and certificate transparency where relevant. Educate staff not to approve unexpected transfer or DNS emails.'
        ),
      },
      {
        heading: 'Incident checklist',
        body: p(
          'If compromised: change registrar passwords, re-enable lock, audit nameservers and A/MX records, rotate email credentials, notify stakeholders, and document the timeline. Keep offline copies of auth codes and account numbers.'
        ),
      },
    ],
    Investing: [
      {
        heading: `Investor framing: ${title}`,
        body: p(
          description,
          'Domain investing is speculative. Liquidity varies widely; most names never sell at retail fantasies. Treat it like inventory business: acquisition cost, holding cost (renewals), and realistic end-user demand.',
          'DomainDiscovery is built primarily for builders and researchers checking availability — not as a buy signal for speculative portfolios. Do your own research.'
        ),
      },
      {
        heading: 'Acquisition discipline',
        body: p(
          'Hand-regs, expired auctions, and private purchases each have different risk. Cap bids with wholesale comps when available. Avoid emotional bidding on names you cannot explain to a real buyer persona.',
          'Track every name’s renew date and thesis in a sheet. Orphan names without a thesis are how portfolios quietly drain cash.'
        ),
      },
      {
        heading: 'Sales and pricing reality',
        body: p(
          'BIN, make-offer, landers, brokers, and outbound each have costs and compliance rules (especially email outreach). End users buy stories and fit — not your cost basis.',
          'Premium renewals on registry-priced names can erase thin margins. Model year-two costs before you celebrate a “cheap” win.'
        ),
      },
      {
        heading: 'Risk controls',
        body: p(
          'Trademark landmines, sanctions/compliance issues, and marketplace fees matter. When in doubt, skip the name. Diversify only if you can afford renewals through a dry sales year.'
        ),
      },
    ],
    Sales: [
      {
        heading: `Selling domains: ${title}`,
        body: p(
          description,
          'Domain sales succeed when a real end user has a timing need (launch, rebrand, funding, campaign). Price and channel should match buyer type — startups differ from local SMBs and enterprises.',
          'Use clear landers, verified escrow for larger deals, and honest descriptions. Overclaiming “SEO value” damages trust.'
        ),
      },
      {
        heading: 'Channels and process',
        body: p(
          'Marketplaces, brokers, inbound landers, and careful outbound each convert differently. Track inquiries, offers, and time-to-close. Keep transfer steps documented so deals do not die in EPP limbo.',
          'Commissions and payment rails should be agreed before negotiation heat rises.'
        ),
      },
      {
        heading: 'Negotiation basics',
        body: p(
          'Anchor with comparable sales when you have them, but listen for budget and urgency. Be ready to walk. Financing/LTO can close deals but increases default and admin risk.'
        ),
      },
      {
        heading: 'Compliance notes',
        body: p(
          'Outbound email must respect applicable anti-spam laws and platform rules. Do not impersonate trademark owners. Keep records of consent and opt-outs where required.'
        ),
      },
    ],
    Aftermarket: [
      {
        heading: `Aftermarket guide: ${title}`,
        body: p(
          description,
          'The aftermarket covers auctions, expired drops, fixed-price listings, and brokered deals. Fees, timelines, and transfer mechanics differ by venue — read each platform’s rules before you bid.',
          'Always re-check trademark risk and name history. A cheap win with toxic backlinks or legal baggage is not a win.'
        ),
      },
      {
        heading: 'Auction and drop realities',
        body: p(
          'Expired auctions and drop-catching are competitive. Budget for fees and renewals. Have payment methods ready; failed payment can cost the name and penalties.',
          'Fast-transfer networks can speed delivery when both sides are enrolled — confirm eligibility early.'
        ),
      },
      {
        heading: 'Escrow and transfer',
        body: p(
          'Use reputable escrow for significant sums. Confirm unlock status, auth codes, and 60-day transfer locks after recent changes. Screenshot agreements.',
          tools[2]
        ),
      },
      {
        heading: 'When to walk away',
        body: p(
          'Walk if the seller refuses escrow, pressure is extreme, history looks spammy, or the name only works as a trademark trap. Another inventory item will appear; legal problems linger.'
        ),
      },
    ],
    Valuation: [
      {
        heading: `Valuation approach: ${title}`,
        body: p(
          description,
          'Domain valuation is an estimate, not a guarantee. Appraisals and automated tools can miss brand fit, trademark risk, and liquidity. Use multiple signals: comparable sales, length/clarity, extension strength, and realistic buyer pool.',
          'Retail ask prices are not the same as wholesale liquidation prices.'
        ),
      },
      {
        heading: 'Signals that matter',
        body: p(
          'Memorability, spellability, .com vs alternate TLD, commercial intent of the keyword, and evidence of end-user sales in the niche. Type-in traffic is rare for most names and should be measured, not assumed.',
          'DIY appraisal: list 5 comps, adjust for extension and length, stress-test with “who buys this in 12 months?”'
        ),
      },
      {
        heading: 'Tool limits',
        body: p(
          'Automated appraisals can be directionally useful and also wildly off for brandables. Sales databases help when comps exist; thin categories need human judgment.',
          'Never publish fake precision. Ranges with assumptions beat fake exact dollars.'
        ),
      },
      {
        heading: 'Using valuation in decisions',
        body: p(
          'Buyers: set a max based on business ROI, not appraisal vanity. Sellers: price for the channel you will actually use. Investors: mark inventory conservatively for planning.'
        ),
      },
    ],
    Legal: [
      {
        heading: `Legal basics: ${title}`,
        body: p(
          description,
          'This guide is educational, not legal advice. Domain disputes often involve trademarks, bad-faith registration claims, and jurisdiction-specific rules. When money or brand risk is material, consult a qualified attorney.',
          'UDRP and related processes exist for clear abusive registrations; they are not free do-overs for every failed negotiation.'
        ),
      },
      {
        heading: 'Trademark risk hygiene',
        body: p(
          'Search trademarks in your target markets before you register or bid. Avoid famous marks and confusingly similar strings in related goods/services. “I added a hyphen” is not a strategy.',
          'Defensive registrations of your own brand are different from targeting someone else’s mark.'
        ),
      },
      {
        heading: 'Privacy and data',
        body: p(
          'WHOIS privacy, GDPR-era redaction, and registrar data processing affect what the public can see. Compliance obligations still exist for accurate account data with your registrar.'
        ),
      },
      {
        heading: 'Practical safe path',
        body: p(
          'Choose original brandables when possible, document legitimate use, keep records of registration dates, and avoid patterns that look like bulk trademark targeting.'
        ),
      },
    ],
    Registrars: [
      {
        heading: `Registrar guide: ${title}`,
        body: p(
          description,
          'Registrars retail domain registrations and often sell DNS, email, and hosting add-ons. Compare renewal prices, transfer policies, security features (2FA, lock), and support quality — not only the advertised first-year teaser.',
          'DomainDiscovery’s price compare tool focuses on regular-style pricing research; always confirm live cart totals.'
        ),
      },
      {
        heading: 'What good registrar UX includes',
        body: p(
          'Clear DNS UI, reliable WHOIS privacy controls, straightforward auth codes, transparent fees, and account security. Cheap registrars that make transfers painful can cost more in time than they save.'
        ),
      },
      {
        heading: 'Transfers and pushes',
        body: p(
          'Transfers move a domain between registrars; pushes move between accounts at the same registrar. Know which path your buyer or client needs. Watch 60-day locks after registration or previous transfer.'
        ),
      },
      {
        heading: 'Choosing for teams',
        body: p(
          'Enterprises may prioritize security and support SLAs; startups may prioritize price and API access. Document the choice so renewals do not surprise finance.'
        ),
      },
    ],
    Expired: [
      {
        heading: `Expired domains: ${title}`,
        body: p(
          description,
          'Expired and deleting names can be valuable or toxic. Check archive history, backlink profile quality, trademark conflicts, and whether the prior use matches your plans.',
          'SEO “aged domain” shortcuts often disappoint when history is spammy or irrelevant.'
        ),
      },
      {
        heading: 'Research workflow',
        body: p(
          'List candidates → review historical snapshots → inspect links → WHOIS/RDAP history where available → trademark scan → max bid including fees → catch or auction plan → post-acquire DNS cleanup.'
        ),
      },
      {
        heading: 'Risk flags',
        body: p(
          'Pharmaceutical spam, malware associations, hacked link networks, or prior brand impersonation are common red flags. When unclear, skip — inventory is plentiful.'
        ),
      },
      {
        heading: 'After you acquire',
        body: p(
          'Change passwords/locks, set clean DNS, disavow only with care if you understand the process, and rebuild with original content. Do not cloak or bait-and-switch users from prior expectations in deceptive ways.'
        ),
      },
    ],
    Monetization: [
      {
        heading: `Monetization: ${title}`,
        body: p(
          description,
          'Parking and type-in strategies depend on residual traffic. Most modern names earn little without development or a sale. Measure traffic before you assume parking revenue.',
          'Policy changes at parking providers and browsers can erase monetization models quickly.'
        ),
      },
      {
        heading: 'Parking vs development',
        body: p(
          'Parking is passive and usually low yield. Development costs time but can create real leads or content assets. Choose based on skills and capital, not forum hype.'
        ),
      },
      {
        heading: 'Ethics and compliance',
        body: p(
          'Avoid deceptive ads, trademark-infringing landers, and malware-adjacent networks. Short-term clicks are not worth long-term brand or legal damage.'
        ),
      },
      {
        heading: 'Measurement',
        body: p(
          'Track visits, revenue, and sale inquiries separately. Kill names that only cost renewals without a thesis.'
        ),
      },
    ],
    Community: [
      {
        heading: `Learning from the community: ${title}`,
        body: p(
          description,
          'Domain forums, podcasts, and sales reports teach patterns — and also amplify survivorship bias. Treat anecdotes as prompts for research, not guarantees.',
          'Cross-check “comparable sales” and beware of performance theater.'
        ),
      },
      {
        heading: 'How to use industry media',
        body: p(
          'Sales charts help calibrate wholesale vs retail expectations. Interviews reveal negotiation tactics. Still run your own numbers for renewals and opportunity cost.'
        ),
      },
      {
        heading: 'Building judgment',
        body: p(
          'Keep a personal deal journal: what you bought, why, outcome. Over a year your notes beat generic tips. Pair community learning with live availability checks and clean portfolio hygiene.'
        ),
      },
      {
        heading: 'Stay practical',
        body: p(
          tools[0],
          'Use education to make fewer, better registrations — not more impulsive ones.'
        ),
      },
    ],
    Trends: [
      {
        heading: `Trend context: ${title}`,
        body: p(
          description,
          'Domain markets move with startup funding, new TLD fashion, AI product waves, and liquidity cycles. Trends create opportunity and overcrowding at the same time.',
          'Prefer durable brand and utility over pure hype strings you cannot explain to a buyer.'
        ),
      },
      {
        heading: 'Budgeting in the current market',
        body: p(
          'Startups should budget for a primary domain and a small defensive set — not endless variants. Investors should stress-test renewal obligations if sales slow.'
        ),
      },
      {
        heading: 'Separating signal from noise',
        body: p(
          'Headline sales are outliers. Median outcomes are quieter. Build process: research, acquire selectively, develop or sell with patience.'
        ),
      },
      {
        heading: 'Apply trends carefully',
        body: p(
          'If a trend hits your niche (for example AI product naming), still apply radio test, trademark hygiene, and renewal math. Tools on DomainDiscovery help you check availability quickly while you decide.'
        ),
      },
    ],
    Strategy: [
      {
        heading: `Strategy: ${title}`,
        body: p(
          description,
          'Domain strategy aligns names with product architecture: primary brand, products, regions, and campaigns. Too many domains dilute analytics and brand memory; too few can block launches or invite confusion.',
          'Write a one-page map: which hostname serves which audience.'
        ),
      },
      {
        heading: 'Multi-domain architecture',
        body: p(
          'Use separate domains when legal entities, languages, or products truly need separation. Otherwise prefer paths and subfolders on one strong domain for SEO cohesion.',
          'Rebrands need redirect plans, email cutovers, and a freeze on vanity purchases during the transition.'
        ),
      },
      {
        heading: 'Public building and narrative',
        body: p(
          'If you build in public, a clear domain and consistent handle set reduce friction. Document the story on the site so inbound interest lands somewhere durable.'
        ),
      },
      {
        heading: 'Execution checklist',
        body: p(
          'Map domains → owners → DNS → analytics → renewal budget. Review twice a year. Search availability early for upcoming product names so marketing is not blocked at launch week.'
        ),
      },
    ],
    Development: [
      {
        heading: `Development angle: ${title}`,
        body: p(
          description,
          'Developing domains into content or lead-gen sites requires real user value. Thin doorway pages underperform and can violate search quality expectations.',
          'Start from audience problems, not from the keyword alone.'
        ),
      },
      {
        heading: 'Content site basics',
        body: p(
          'Pick a niche you can cover with original experience. Technical SEO, internal links, and honest claims matter. Monetize only after there is a reason to visit.'
        ),
      },
      {
        heading: 'Lead generation ethics',
        body: p(
          'If you generate leads, be transparent about the business, comply with privacy and advertising rules, and do not harvest data deceptively. Match page content to what ads promise.'
        ),
      },
      {
        heading: 'Stack and measurement',
        body: p(
          'Use reliable hosting, HTTPS, analytics, and conversion events. Retire projects that cannot justify renewals and time.'
        ),
      },
    ],
    Pricing: [
      {
        heading: `Pricing topic: ${title}`,
        body: p(
          description,
          'Domain pricing has layers: registry wholesale, registrar retail, premium registry tiers, aftermarket asks, and promotional first-year discounts. Renewal price is the number that matters for holding costs.',
          'Compare regular pricing across registrars and read the fine print on redemptions and transfers.'
        ),
      },
      {
        heading: 'Premium vs standard',
        body: p(
          'Standard names use normal schedules. Premium names may carry higher create and/or renew prices set by registries or aftermarket owners. Confirm both years before celebrating a “deal.”'
        ),
      },
      {
        heading: 'How to compare fairly',
        body: p(
          'Normalize currency, include ICANN/fees when shown, and separate optional privacy or hosting bundles. Use /tools/compare on DomainDiscovery as a research aid, then verify in live carts.'
        ),
      },
      {
        heading: 'Budget tips',
        body: p(
          'Pay for the primary name you will brand; be conservative on speculative extras. Set calendar reminders 30 days before renewals.'
        ),
      },
    ],
  };

  const core = cores[cat] || [
    {
      heading: `Overview: ${title}`,
      body: p(
        description,
        `This guide covers practical decision-making around ${topicLine} for founders, marketers, and domain researchers.`,
        'You will get definitions, a workflow, risk notes, and clear next steps you can apply with free research tools.'
      ),
    },
    {
      heading: 'Key concepts',
      body: p(
        'Separate name selection, availability checking, legal hygiene, pricing, and technical setup. Mixing them into one rushed checkout is how teams buy the wrong name twice.',
        'Write requirements first: audience, geography, speech/spelling, and whether the name must match an existing trademarked brand.'
      ),
    },
    {
      heading: 'Workflow you can copy',
      body: p(
        'Research → shortlist → live domain name search → filter → price check → WHOIS if needed → register or negotiate → lock and configure DNS.',
        tools.join(' ')
      ),
    },
    {
      heading: 'Risks and tradeoffs',
      body: p(
        'Every choice trades memorability, cost, legal risk, and operational complexity. Make tradeoffs explicit so stakeholders do not relitigate them after money is spent.'
      ),
    },
  ];

  // Topic-specific extra section for uniqueness
  const topicExtra = {
    heading: `Deep dive for “${title}”`,
    body: p(
      `When people search for guidance on ${title.toLowerCase()}, they usually need both a definition and a decision rule. Definition: ${description}`,
      `Decision rule: if the name or process does not support a clear user-facing job in the next 90 days, park the idea on a shortlist instead of spending on impulse registrations.`,
      `Related topics on DomainDiscovery Learn include ${topicLine}. Cross-link those guides after you finish this page so you build a coherent mental model rather than collecting trivia.`,
      `Examples help: a local plumber may prioritize a clear service + city pattern and a reliable phone conversion path; a SaaS startup may prioritize a brandable .com/.ai and global pronunciation; an investor may prioritize liquidity and renewal math. Same industry articles — different success metrics.`
    ),
  };

  const faq = {
    heading: `FAQ: ${title}`,
    body: p(
      `Q: Is this relevant if I only need one domain? A: Yes. The same hygiene — availability, pricing, lock, DNS — applies to a single registration.`,
      `Q: Does DomainDiscovery register domains? A: DomainDiscovery helps you search and research; registration and payment happen at a registrar.`,
      `Q: How often should I re-check availability? A: Re-check immediately before checkout. Valuable names can change status quickly.`,
      `Q: What if my preferred name is taken? A: Try brandable alternates, fitting TLDs, geo patterns for local use, or a legitimate aftermarket path with escrow — not lookalike trademark traps.`
    ),
  };

  return [...core, topicExtra, ...commonClose, faq];
}

/** Hand-expanded priority overrides for product-critical slugs (extra uniqueness). */
const OVERRIDES = {
  'domains-for-beginners': (a) => [
    {
      heading: 'What is a domain name?',
      body: p(
        'A domain name is the address people type to reach your website or email — for example yourbrand.com. It is easier to remember than raw server addresses. When you “own” a domain, you control a registration for a period of time through a registrar, subject to registry policies and renewal.',
        'Beginners often confuse domains with websites and hosting. The domain is the name; hosting is where files live; DNS connects the name to the host. You can register a domain before you launch a site.'
      ),
    },
    {
      heading: 'The first-week checklist',
      body: p(
        'Day 1: list name ideas and eliminate hard spellings. Day 2: run domain name search on DomainDiscovery and note free vs taken. Day 3: quick trademark search in your country. Day 4: compare register and renewal prices. Day 5: register with 2FA and lock. Day 6: set DNS or temporary lander. Day 7: create email or forwarding and document account ownership.',
        'You do not need a huge portfolio. One primary domain used everywhere beats five neglected experiments.'
      ),
    },
    {
      heading: 'How to choose your first domain',
      body: p(
        'Prefer clear pronunciation, simple spelling, and a TLD your audience trusts (.com still leads for many global consumer brands). Avoid hyphens and numbers unless they are truly part of the brand.',
        'If the perfect .com is taken, consider a strong brandable, a relevant alternate TLD you will actually market, or a legitimate purchase — not a confusing lookalike of a famous brand.'
      ),
    },
    {
      heading: 'Registration without panic',
      body: p(
        'Use a reputable registrar, read renewal pricing, and turn off unnecessary bundles if you do not need them. Enable auto-renew only if your payment method stays valid; still keep a calendar reminder.',
        a.description
      ),
    },
    {
      heading: 'After you buy',
      body: p(
        'Lock the domain, verify the account email, and point DNS when ready. Add SPF/DKIM before major email campaigns. Keep screenshots of receipts and auth-related settings.',
        'Learn more with our guides on how to register a domain, domain registration explained, and safe purchase checklists — then practice with free search on DomainDiscovery.'
      ),
    },
    {
      heading: 'How DomainDiscovery helps beginners',
      body: p(
        'Search live availability, browse extensions, generate alternates, check WHOIS, and compare regular prices — without creating an account for research. When you are ready, complete purchase at your chosen registrar.',
        'Next: read the domain name search guide and how-to-register guide in the Beginner cluster.'
      ),
    },
    {
      heading: 'FAQ for absolute beginners',
      body: p(
        'Q: Can I move my domain later? A: Usually yes via transfer, subject to locks and policies. Q: Do I need hosting immediately? A: No. Q: Is privacy protection required? A: Optional in many cases; account security is still required. Q: Are free domains safe? A: “Free” often means limited use or bundled conditions — read terms.'
      ),
    },
  ],
  'how-to-buy-a-domain': (a) => [
    {
      heading: 'How to buy a domain step by step',
      body: p(
        a.description,
        'Buying a domain means completing a registration (if available) or an aftermarket purchase (if owned). The happy path for a free name: choose → check availability → pick registrar → checkout → secure account → configure DNS.'
      ),
    },
    {
      heading: 'Step 1–3: choose, search, filter',
      body: p(
        'Write candidates, then run domain name search across your primary TLD and one backup. Filter out spelling risks and trademark conflicts. Save a shortlist of 3, not 30.',
        'Use DomainDiscovery search and, if needed, the AI generator for brandable backups.'
      ),
    },
    {
      heading: 'Step 4–5: price and registrar',
      body: p(
        'Compare first-year and renewal prices. Watch premium registry pricing. Prefer registrars with 2FA, clear DNS UI, and honest support. Promo prices are fine if renewals are acceptable.'
      ),
    },
    {
      heading: 'Step 6–7: checkout and security',
      body: p(
        'Register with accurate owner data as required. Enable lock and 2FA immediately. Store login in a password manager. Add a second trusted recovery path for teams.'
      ),
    },
    {
      heading: 'Step 8: make it work',
      body: p(
        'Point nameservers or records to your host, issue HTTPS, and set email authentication if you send mail. Test www vs apex redirects.',
        'If the name is aftermarket-only, use escrow, verify history, and never pay only via informal peer-to-peer for large sums.'
      ),
    },
    {
      heading: 'Common buying mistakes',
      body: p(
        'Skipping renewal math, buying lookalike trademarks, forgetting who owns the account, and delaying lock. Another mistake: registering before basic trademark hygiene.'
      ),
    },
    {
      heading: 'Next steps',
      body: p(
        'Open free domain name search, complete the safe purchase checklist guide, and read register vs aftermarket if your .com is taken.'
      ),
    },
    {
      heading: 'FAQ',
      body: p(
        'Q: How long does registration take? A: Often minutes for standard available names. Q: Can I get a refund? A: Policies vary; many registrations are non-refundable. Q: Should I buy multiple TLDs? A: Only with a defensive or market reason.'
      ),
    },
  ],
  'dns-guide': (a) => [
    {
      heading: 'What is DNS?',
      body: p(
        'DNS (Domain Name System) translates domain names into addresses and service targets computers need. When you type a domain, resolvers look up records published by your authoritative nameservers.',
        a.description
      ),
    },
    {
      heading: 'Essential record types',
      body: p(
        'A/AAAA map a name to IPv4/IPv6. CNAME aliases one name to another. MX routes email. TXT holds verification and email auth data. NS delegates to nameservers. SRV and others exist for specialized services.',
        'You rarely need every type on day one. Web + email covers most launches.'
      ),
    },
    {
      heading: 'Nameservers vs records',
      body: p(
        'Nameservers define who answers DNS queries for your domain. Records live in that zone. Changing hosts often means either updating records at the same DNS provider or switching nameservers to the new host’s DNS.'
      ),
    },
    {
      heading: 'TTLs and propagation',
      body: p(
        'TTL is how long resolvers cache a record. Lower TTLs before a planned change; raise them later for efficiency. “Propagation” complaints are often cache waiting to expire.'
      ),
    },
    {
      heading: 'Troubleshooting workflow',
      body: p(
        'Confirm registrar nameserver settings → inspect zone at DNS host → query public resolvers → check local cache → verify HTTPS and firewall. Change one variable at a time.'
      ),
    },
    {
      heading: 'Security notes',
      body: p(
        'Protect the registrar and DNS accounts equally. Consider DNSSEC where supported. Monitor unexpected NS changes.'
      ),
    },
    {
      heading: 'How this ties to domains',
      body: p(
        'Registration without DNS configuration means the name exists but does not serve your site. After any transfer, re-verify records. Use WHOIS/RDAP to confirm registrar when you inherit a domain.'
      ),
    },
    {
      heading: 'FAQ',
      body: p(
        'Q: How long do DNS changes take? A: From minutes to 48 hours depending on TTL and caches. Q: Should I use www? A: Pick one canonical host and redirect. Q: Can DNS fix a taken domain? A: No — availability is a registration issue.'
      ),
    },
  ],
  'local-business-domains': (a) => [
    {
      heading: 'Domains for local businesses',
      body: p(
        a.description,
        'Local customers need clarity and trust: a name they can hear on the phone, type on mobile, and recognize on invoices. SEO success still depends on real reviews, accurate business info, and useful pages — not the domain alone.'
      ),
    },
    {
      heading: 'Naming patterns that work',
      body: p(
        'Brand + city, service + city, or a strong brandable with city landing pages. Avoid unreadable compression. If you serve many cities, one primary domain with location pages often beats dozens of thin microsites.'
      ),
    },
    {
      heading: 'When geo domains help',
      body: p(
        'Geo domains help when you will fund unique proof per market: staff, projects, photos, offers. Use DomainDiscovery’s geo generator to build lists, then only develop cities you truly serve.'
      ),
    },
    {
      heading: 'ccTLD vs .com for local',
      body: p(
        'A country-code TLD can reinforce local identity when customers expect it. Multi-country operators need a deliberate architecture (ccTLDs vs subfolders) and consistent NAP data.'
      ),
    },
    {
      heading: 'Launch checklist',
      body: p(
        'Register → lock → Google Business Profile consistency → HTTPS site → call tracking if needed → citation accuracy → collect reviews. Track calls and forms, not only rankings.'
      ),
    },
    {
      heading: 'Tools',
      body: p(
        'Search availability, generate geo lists at /tools/geo, bulk-check at /bulk-search, compare prices, and read geo-domains-local-seo plus cctld-local-seo guides.'
      ),
    },
    {
      heading: 'Mistakes',
      body: p(
        'Doorway pages for cities you do not serve, buying every TLD, and ignoring mobile page speed. Another mistake: ranking for a city then routing calls to an unstaffed number.'
      ),
    },
    {
      heading: 'FAQ',
      body: p(
        'Q: Do I need a city domain? A: Not always — many win with a brand domain and strong local pages. Q: Should I buy misspellings? A: Only a few high-risk typos if budget allows.'
      ),
    },
  ],
};

function expandArticle(article) {
  const w = words(article.sections || []);
  if (w >= KEEP_IF_ABOVE && !OVERRIDES[article.slug]) {
    // Light enrichment: ensure FAQ-ish last section exists; keep body
    return {
      ...article,
      readTime: readTime(w),
      description:
        article.description.length >= 120
          ? article.description
          : `${article.description} Practical guide for domain name search, registration planning, and due diligence with DomainDiscovery tools.`,
    };
  }

  let sections;
  if (OVERRIDES[article.slug]) {
    sections = OVERRIDES[article.slug](article);
  } else {
    sections = categoryPlaybook(article);
  }

  // If still short, pad with structured extras unique to slug
  let w2 = words(sections);
  if (w2 < MIN_WORDS) {
    sections = [
      ...sections,
      {
        heading: `Implementation notes for ${article.title}`,
        body: p(
          `Implementing ideas from “${article.title}” works best in weekly cycles: research on Monday, shortlist on Tuesday, verification on Wednesday, purchase decisions on Thursday, DNS/email on Friday.`,
          `Document decisions in a shared note: candidate names, TLD choices, registrar, renewal dates, and the business purpose. This prevents duplicate buys and forgotten renewals.`,
          `Metrics to watch after launch: direct traffic, branded search queries, email deliverability, and conversion rate on landing pages that use the domain in ads.`,
          `If you collaborate with freelancers, grant least-privilege access and remove it when contracts end. Domain control is business control.`,
          `For international ideas, confirm language meaning and pronunciation in target markets. A clever English domain hack can be awkward or negative elsewhere.`,
          `Revisit this guide when you rebrand, expand to a new country, or consolidate a portfolio — the constraints change even if the definitions do not.`
        ),
      },
      {
        heading: 'Examples and scenarios',
        body: p(
          `Scenario A — Solo founder: pick one primary domain, enable lock/2FA, launch a single site, and ignore speculative extras until product-market fit.`,
          `Scenario B — Multi-location service business: primary brand domain plus selective city pages or geo names only where teams operate; use geo tools to plan, not to spam.`,
          `Scenario C — Acquiring a used name: escrow, history check, WHOIS/RDAP, clean DNS, and a content plan that is not deceptive relative to prior use.`,
          `Scenario D — Portfolio cleanup: export all names, tag purpose, drop names without a thesis, and renegotiate which team budget pays renewals.`,
          `These scenarios all use the same research loop available on DomainDiscovery: domain name search, optional bulk or geo generation, WHOIS, and price comparison before registrar checkout.`
        ),
      },
    ];
    w2 = words(sections);
  }

  // Final pad if needed (edge cases)
  while (words(sections) < MIN_WORDS) {
    sections.push({
      heading: `Extra considerations (${sections.length + 1})`,
      body: p(
        `Additional detail for ${article.title}: align stakeholders early, budget for renewals, and keep written ownership records.`,
        `When comparing alternatives, score each candidate on speech clarity, spelling, trademark risk, TLD fit, and cost of five-year ownership — not only day-one availability.`,
        `Educational content cannot replace professional legal advice for disputes or complex trademark questions. Escalate when risk is material.`,
        `Return to free domain name search whenever a new candidate appears so you do not rely on outdated screenshots from chats.`
      ),
    });
    if (sections.length > 16) break;
  }

  const finalWords = words(sections);
  let description = article.description || '';
  if (description.length < 130) {
    description = `${description} Learn practical steps, risks, and DomainDiscovery workflows for domain name search and registration research.`.trim();
  }

  return {
    ...article,
    description,
    readTime: readTime(finalWords),
    publishedAt: article.publishedAt || '2026-07-22',
    sections,
  };
}

function main() {
  const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const before = data.articles.map((a) => words(a.sections || []));
  const expanded = data.articles.map(expandArticle);
  const after = expanded.map((a) => words(a.sections || []));

  const sorted = [...after].sort((x, y) => x - y);
  const median = sorted[Math.floor(sorted.length / 2)];
  const thin = after.filter((w) => w < MIN_WORDS).length;

  data.articles = expanded;
  data.count = expanded.length;
  data.generatedAt = new Date().toISOString().slice(0, 10);
  data.sourceNotes = [
    ...(data.sourceNotes || []).slice(0, 2),
    'Phase D: expanded thin Learn articles toward competitive on-page depth with category playbooks + product CTAs.',
  ];

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');

  console.log('Articles:', expanded.length);
  console.log('Before median:', [...before].sort((a, b) => a - b)[Math.floor(before.length / 2)]);
  console.log('After median:', median);
  console.log('After min/max:', Math.min(...after), Math.max(...after));
  console.log(`Under ${MIN_WORDS}:`, thin);
  console.log('Avg words:', Math.round(after.reduce((s, w) => s + w, 0) / after.length));
  // sample
  const samples = ['how-to-buy-a-domain', 'dns-guide', 'domain-investing', 'domain-name-search-guide'];
  for (const s of samples) {
    const a = expanded.find((x) => x.slug === s);
    console.log(s, a ? words(a.sections) : 'missing', a?.readTime);
  }
}

main();
