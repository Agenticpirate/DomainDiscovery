/**
 * Shared research content for ADA industry + registrar docs pages.
 * Keep matrix facts here so /ada/docs/industry and /ada/docs/registrars stay in sync.
 */

export type LayerRow = {
  layer: string;
  name: string;
  question: string;
  what: string;
  who: string;
  protocols: string;
  ada: string;
};

export type RegistrarRow = {
  name: string;
  registerApi: string;
  dnsApi: string;
  domainConnect: string;
  ansLayer: string;
  grade: string;
  notes: string;
};

export type TierRow = {
  tier: string;
  status: string;
  behavior: string;
};

export type PriorityRow = {
  priority: number;
  registrar: string;
  why: string;
};

export const LAYERS: LayerRow[] = [
  {
    layer: 'A',
    name: 'Agent identity (ANS)',
    question: 'Which AI agent is this, and can I trust it?',
    what: 'Agent identity: ANS name, Agent Card, certificates, DNS discovery records',
    who: 'Agent platforms, marketplaces, multi-agent systems',
    protocols: 'DNS TXT/HTTPS/TLSA, PKI/X.509, ACME DNS-01, transparency logs, Agent Cards, MCP/A2A after discovery',
    ada: 'Agent Card live; optional ANS enrollment later',
  },
  {
    layer: 'B',
    name: 'Brand domain automation',
    question: 'Can my agent buy and wire mybrand.com for me?',
    what: 'Classic ICANN domain for a human or organization brand',
    who: 'Founders, agencies, SaaS that spin up brands',
    protocols: 'EPP (behind registrar), REST registrar APIs, RDAP, Domain Connect, DNS CRUD',
    ada: 'Research live; confirmed register + DNS planned with budget hard-stops',
  },
];

export const WHY_NOW: { title: string; body: string }[] = [
  {
    title: 'Agents need a phone book and a passport',
    body: 'Without shared discovery and identity, every agent integration is a custom trust deal. Domains and DNS already provide naming, global resolution, ownership proof, and the same PKI that secures HTTPS.',
  },
  {
    title: 'Domains are the first real-world commit',
    body: 'Name the brand, secure the domain under budget, point DNS, then certs and mail. If steps two and three stay manual, agents stay demos. With safe, budget-capped APIs, agents become operators.',
  },
  {
    title: 'MCP made registrar APIs machine-callable',
    body: 'Tool-calling agents need documented tools—check, rank, register, set_dns—not scraped registrar UIs. Agent Cards replace marketing pages for machines.',
  },
  {
    title: 'Security and fraud pressure',
    body: 'Unattended registration without auth, hard budgets, confirmation, and audit logs enables phishing domain farms and runaway spend. Agent-ready means automation plus constraints.',
  },
  {
    title: 'Standards are converging',
    body: 'GoDaddy ANS, Infoblox DNS-AID, IETF drafts, and Domain Connect show the industry building on DNS rather than inventing a parallel root of trust.',
  },
];

export const PROTOCOLS: { name: string; role: string; layer: 'A' | 'B' | 'Both' }[] = [
  { name: 'EPP', role: 'Registry protocol behind most gTLDs; you use registrar APIs, not raw EPP', layer: 'B' },
  { name: 'Registrar REST/XML APIs', role: 'Availability, create, renew, transfer, contacts, DNS', layer: 'B' },
  { name: 'RDAP / WHOIS', role: 'Public registration research', layer: 'B' },
  { name: 'DNS CRUD APIs', role: 'A/AAAA/CNAME/TXT/MX after purchase', layer: 'B' },
  { name: 'Domain Connect', role: 'Standard app-driven DNS setup at many providers', layer: 'B' },
  { name: 'ACME (DNS-01)', role: 'Prove domain control for TLS and ANS-style enrollment', layer: 'Both' },
  { name: 'MCP', role: 'Tool protocol for LLM agents (DomainDiscovery / ADA)', layer: 'Both' },
  { name: 'A2A', role: 'Agent-to-agent messaging after discovery', layer: 'A' },
  { name: 'Agent Card / ANS', role: 'Machine metadata + optional DNS-published identity', layer: 'A' },
  { name: 'DNSSEC / TLSA / HTTPS SVCB', role: 'Integrity, pinning, and service binding in ANS designs', layer: 'A' },
];

export const REGISTRARS: RegistrarRow[] = [
  {
    name: 'Porkbun',
    registerApi: 'Yes — API v3 domain create + pricing',
    dnsApi: 'Yes — full DNS CRUD',
    domainConnect: 'No (verify)',
    ansLayer: 'No',
    grade: 'A',
    notes: 'Best first agent adapter; simple JSON keys (BYOK: porkbun)',
  },
  {
    name: 'Namecheap',
    registerApi: 'Yes — domains.create + full method set',
    dnsApi: 'Yes — domains.dns.*',
    domainConnect: 'Not primary list',
    ansLayer: 'No',
    grade: 'A−',
    notes: 'Sandbox + IP whitelist; contacts required (BYOK: namecheap)',
  },
  {
    name: 'Cloudflare Registrar',
    registerApi: 'Yes — Registrar API (search, availability, register)',
    dnsApi: 'Excellent (core product)',
    domainConnect: 'Yes',
    ansLayer: 'No ANS product; DNS can host ANS records',
    grade: 'A',
    notes: 'Register→DNS→certs; at-cost domains (BYOK: cloudflare)',
  },
  {
    name: 'Dynadot',
    registerApi: 'Yes — Domain API',
    dnsApi: 'Yes',
    domainConnect: 'Check current',
    ansLayer: 'No',
    grade: 'A−',
    notes: 'Common in agent automation demos (BYOK: dynadot)',
  },
  {
    name: 'NameSilo',
    registerApi: 'Yes — HTTP API register',
    dnsApi: 'Yes',
    domainConnect: 'Yes',
    ansLayer: 'No',
    grade: 'B+',
    notes: 'Straightforward HTTP API (BYOK: namesilo)',
  },
  {
    name: 'GoDaddy Domains API',
    registerApi: 'Yes — Domains API purchase + DNS',
    dnsApi: 'Yes',
    domainConnect: 'Yes',
    ansLayer: 'Separate product: ANS Registry',
    grade: 'A / dual',
    notes: 'Large install base; OTE sandbox (BYOK: godaddy) — not ANS',
  },
  {
    name: 'Name.com',
    registerApi: 'Yes — Core API v4',
    dnsApi: 'Yes',
    domainConnect: 'Check current',
    ansLayer: 'No',
    grade: 'B+',
    notes: 'Clean REST API for agents (BYOK: namecom)',
  },
  {
    name: 'Gandi',
    registerApi: 'Yes — Domain API',
    dnsApi: 'Yes — LiveDNS',
    domainConnect: 'Check current',
    ansLayer: 'No',
    grade: 'B+',
    notes: 'EU-friendly; PAT tokens (BYOK: gandi)',
  },
  {
    name: 'Amazon Route 53 Domains',
    registerApi: 'Yes — Route 53 Domains API',
    dnsApi: 'Yes — Route 53 hosted zones',
    domainConnect: 'No',
    ansLayer: 'No',
    grade: 'A−',
    notes: 'IAM-scoped; AWS-native agents (BYOK: route53)',
  },
  {
    name: 'OpenSRS (Tucows)',
    registerApi: 'Yes — full reseller API',
    dnsApi: 'Yes (platform)',
    domainConnect: 'Varies',
    ansLayer: 'No',
    grade: 'A (reseller)',
    notes: 'White-label / reseller motion (BYOK: opensrs)',
  },
  {
    name: 'eNom (Tucows)',
    registerApi: 'Yes — legacy reseller API',
    dnsApi: 'Yes',
    domainConnect: 'Partial',
    ansLayer: 'No',
    grade: 'B+',
    notes: 'Hosting control panels; reseller (BYOK: enom)',
  },
  {
    name: 'Internet.bs',
    registerApi: 'Yes — Domain/Register',
    dnsApi: 'Yes — Dns/*',
    domainConnect: 'No',
    ansLayer: 'No',
    grade: 'B+',
    notes: 'Long-standing automation API (BYOK: internetbs)',
  },
  {
    name: 'Njalla',
    registerApi: 'Yes — JSON-RPC add-domain',
    dnsApi: 'Yes — add-record',
    domainConnect: 'No',
    ansLayer: 'No',
    grade: 'B',
    notes: 'Privacy-focused API token (BYOK: njalla)',
  },
  {
    name: 'Spaceship',
    registerApi: 'Yes — evolving developer API',
    dnsApi: 'Yes',
    domainConnect: 'Check current',
    ansLayer: 'No',
    grade: 'B+',
    notes: 'Namecheap group; confirm scopes (BYOK: spaceship)',
  },
  {
    name: 'NameBright',
    registerApi: 'Yes — REST register',
    dnsApi: 'Yes',
    domainConnect: 'No',
    ansLayer: 'No',
    grade: 'B',
    notes: 'Retail + aftermarket portfolio (BYOK: namebright)',
  },
  {
    name: 'HEXONET',
    registerApi: 'Yes — backend / ISP API',
    dnsApi: 'Yes',
    domainConnect: 'Partial',
    ansLayer: 'No',
    grade: 'B+',
    notes: 'Multi-tenant reseller backend (BYOK: hexonet)',
  },
  {
    name: 'CentralNic Reseller',
    registerApi: 'Yes — EPP / HTTPS reseller',
    dnsApi: 'Yes',
    domainConnect: 'Partial',
    ansLayer: 'No',
    grade: 'B+',
    notes: 'Enterprise reseller path (BYOK: centralnic)',
  },
  {
    name: 'IONOS',
    registerApi: 'Varies by tier',
    dnsApi: 'Yes',
    domainConnect: 'Yes',
    ansLayer: 'No',
    grade: 'B',
    notes: 'Strong Domain Connect; register API tier-dependent (BYOK: ionos)',
  },
  {
    name: 'GoDaddy ANS / Agent Registrar',
    registerApi: 'N/A (agent identity, not gTLD create)',
    dnsApi: 'RA provisions discovery DNS records',
    domainConnect: 'Cited in architecture',
    ansLayer: 'Yes — Layer A leader',
    grade: 'Layer A',
    notes: 'Registers AI agents, not customer brand .com domains',
  },
];

export const DOMAIN_CONNECT_PROVIDERS = [
  'Cloudflare',
  'GoDaddy',
  'IONOS',
  'NameSilo',
  'WordPress.com',
  'Vercel',
  'Plesk',
  'Domain Chief',
  'Glauca Digital',
] as const;

export const TIERS: TierRow[] = [
  {
    tier: '0 — Research',
    status: 'Live',
    behavior: 'Check, rank, budget filter, WHOIS, geo, prices — no purchase',
  },
  {
    tier: '1 — Guided purchase',
    status: 'Near',
    behavior: 'Deep-link / Domain Connect to registrar; human pays',
  },
  {
    tier: '2 — API register + DNS',
    status: 'Roadmap',
    behavior: 'User-linked keys; human confirm + server-side budget hard-stop',
  },
  {
    tier: '3 — Agent identity (ANS)',
    status: 'Track',
    behavior: 'Optional registration of ADA as a discoverable agent identity',
  },
];

export const ADAPTER_PRIORITY: PriorityRow[] = [
  { priority: 1, registrar: 'Porkbun', why: 'JSON API v3; fastest path for agents (BYOK: porkbun)' },
  { priority: 2, registrar: 'Namecheap', why: 'Sandbox + full create/DNS; builders (BYOK: namecheap)' },
  { priority: 3, registrar: 'Cloudflare', why: 'Register + best DNS + certs (BYOK: cloudflare)' },
  { priority: 4, registrar: 'Dynadot', why: 'Proven in agent automation demos (BYOK: dynadot)' },
  { priority: 5, registrar: 'NameSilo', why: 'Simple HTTP API + Domain Connect (BYOK: namesilo)' },
  { priority: 6, registrar: 'Name.com', why: 'Clean REST Core API v4 (BYOK: namecom)' },
  { priority: 7, registrar: 'GoDaddy Domains API', why: 'Scale + Domain Connect; not ANS (BYOK: godaddy)' },
  { priority: 8, registrar: 'Amazon Route 53 Domains', why: 'AWS-native agents + IAM (BYOK: route53)' },
  { priority: 9, registrar: 'Gandi', why: 'EU + LiveDNS (BYOK: gandi)' },
  { priority: 10, registrar: 'OpenSRS / eNom / HEXONET', why: 'Reseller / white-label platforms' },
];

export const ADAPTER_CHECKLIST = [
  'Check price + availability for a TLD',
  'Register a free name for N years against prepaid balance or authorized payment',
  'Set DNS (A/AAAA/CNAME/TXT/MX) or nameservers',
  'Idempotently retry without double-billing',
  'List / renew domains in the account',
] as const;

export const RISKS = [
  {
    risk: 'API keys = full account power',
    mitigation: 'Scoped keys where possible; encrypt at rest; clear revoke UX',
  },
  {
    risk: 'Phishing / brand-abuse domain farms',
    mitigation: 'Rate limits, confirm step, future KYC-style gates',
  },
  {
    risk: 'TLD policy documents (some ccTLDs)',
    mitigation: 'Surface manual TLD paths in UI',
  },
  {
    risk: 'Premium / aftermarket ≠ create API',
    mitigation: 'Separate UX path; never treat marketplace as domains.create',
  },
  {
    risk: 'Price drift',
    mitigation: 'Always re-quote immediately before charge',
  },
  {
    risk: 'ANS still evolving',
    mitigation: 'Do not over-claim interoperability; Agent Card first',
  },
] as const;

export const SOURCES = [
  {
    label: 'GoDaddy ANS Registry (agentic marketplace)',
    href: 'https://www.godaddy.com/resources/news/building-trust-at-internet-scale-godaddys-agent-name-service-registry-for-the-agentic-ai-marketplace',
  },
  {
    label: 'GoDaddy: Building ANS with a One System approach',
    href: 'https://www.godaddy.com/resources/news/building-the-agent-name-service-using-a-one-system-approach',
  },
  {
    label: 'Infoblox + GoDaddy: DNS-AID and ANS open standards',
    href: 'https://www.infoblox.com/news/news-events/press-releases/infoblox-and-godaddy-support-open-standards-for-ai-agent-discovery-identity-and-verification/',
  },
  {
    label: 'ANS overview (ansinfo.ai)',
    href: 'https://ansinfo.ai/',
  },
  {
    label: 'Cloudflare Registrar API',
    href: 'https://developers.cloudflare.com/registrar/registrar-api/',
  },
  {
    label: 'Porkbun API v3',
    href: 'https://porkbun.com/api/json/v3/documentation',
  },
  {
    label: 'Namecheap API — domains.create',
    href: 'https://www.namecheap.com/support/api/methods/domains/create/',
  },
  {
    label: 'Domain Connect DNS Providers',
    href: 'https://www.domainconnect.org/dns-providers/',
  },
  {
    label: 'GoDaddy Domains API',
    href: 'https://developer.godaddy.com/',
  },
] as const;

export const POSITIONING =
  'AI Domain Assistant is the domain layer for agentic brands — research, budget, rank, and (soon) confirmed registration/DNS via registrars that expose full automation APIs — while agent identity standards (ANS) reuse domains as the trust root.';
