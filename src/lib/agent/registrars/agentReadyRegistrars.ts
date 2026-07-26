/**
 * Registrars that support (or partially support) agent / API-driven domain registration.
 *
 * Scope: Layer B — brand domains (register + DNS), not Layer A agent identity (ANS).
 * Status is product-facing for ADA L3 adapters:
 *  - planned  → interface ready, adapter not shipped
 *  - partial  → API exists but limited scope / partner access
 *  - live     → wired in ADA (none yet — research only in v1)
 *
 * Facts are research snapshots; always re-verify against registrar developer docs
 * before shipping a production adapter.
 */

export type RegistrarAgentCapability = {
  id: string;
  name: string;
  /** Official / developer API surface */
  api: string;
  docsUrl?: string;
  registerApi: boolean;
  dnsApi: boolean | 'partial';
  domainConnect: boolean | 'partial' | 'unknown';
  /** Sandbox / test mode for safe agent development */
  sandbox: boolean | 'partial' | 'unknown';
  /** Good first targets for ADA L3 */
  agentFit: 'excellent' | 'strong' | 'good' | 'limited' | 'reseller' | 'identity-only';
  /** ADA adapter status */
  adaStatus: 'live' | 'planned' | 'partial' | 'not-planned';
  grade: string;
  notes: string;
  /** BYOK header value for x-ada-registrar */
  byokId: string;
  authModel: string;
  regions?: string;
};

/**
 * Registrars with documented register (and usually DNS) APIs agents can call
 * with user-linked credentials.
 */
export const AGENT_READY_REGISTRARS: RegistrarAgentCapability[] = [
  {
    id: 'porkbun',
    name: 'Porkbun',
    api: 'API v3 (domain create, pricing, DNS CRUD)',
    docsUrl: 'https://porkbun.com/api/json/v3/documentation',
    registerApi: true,
    dnsApi: true,
    domainConnect: false,
    sandbox: false,
    agentFit: 'excellent',
    adaStatus: 'live',
    grade: 'A',
    notes:
      'ADA adapter WIRED (dryRun + Idempotency-Key). Enable with ADA_ENABLE_REGISTRAR_MUTATIONS=true + BYOK.',
    byokId: 'porkbun',
    authModel: 'API key + secret',
  },
  {
    id: 'namecheap',
    name: 'Namecheap',
    api: 'XML API (namecheap.domains.create, dns.setHosts, …)',
    docsUrl: 'https://www.namecheap.com/support/api/intro/',
    registerApi: true,
    dnsApi: true,
    domainConnect: false,
    sandbox: true,
    agentFit: 'excellent',
    adaStatus: 'live',
    grade: 'A−',
    notes:
      'ADA adapter WIRED (check dry-run + create + setHosts). Needs ClientIp whitelist + contact fields.',
    byokId: 'namecheap',
    authModel: 'API user + key + ClientIp whitelist',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Registrar',
    api: 'Registrar API (beta) + Zones / DNS API',
    docsUrl: 'https://developers.cloudflare.com/registrar/registrar-api/',
    registerApi: true,
    dnsApi: true,
    domainConnect: true,
    sandbox: 'partial',
    agentFit: 'excellent',
    adaStatus: 'live',
    grade: 'A',
    notes:
      'ADA adapter WIRED (domain-check + registrations + DNS). Needs account id + Registrar write token. Beta TLD set.',
    byokId: 'cloudflare',
    authModel: 'API token (scoped) + account id',
  },
  {
    id: 'dynadot',
    name: 'Dynadot',
    api: 'Domain API (search, register, DNS)',
    docsUrl: 'https://www.dynadot.com/domain/api3.html',
    registerApi: true,
    dnsApi: true,
    domainConnect: 'unknown',
    sandbox: 'unknown',
    agentFit: 'strong',
    adaStatus: 'live',
    grade: 'A−',
    notes: 'ADA adapter WIRED (search dry-run + register + set_dns).',
    byokId: 'dynadot',
    authModel: 'API key',
  },
  {
    id: 'namesilo',
    name: 'NameSilo',
    api: 'HTTP API (register, DNS, portfolio)',
    docsUrl: 'https://www.namesilo.com/api-reference',
    registerApi: true,
    dnsApi: true,
    domainConnect: true,
    sandbox: false,
    agentFit: 'strong',
    adaStatus: 'live',
    grade: 'B+',
    notes: 'ADA adapter WIRED (checkRegisterAvailability + registerDomain + dnsAddRecord).',
    byokId: 'namesilo',
    authModel: 'API key',
  },
  {
    id: 'godaddy',
    name: 'GoDaddy Domains API',
    api: 'Domains API (v1) — availability, purchase, DNS',
    docsUrl: 'https://developer.godaddy.com/doc/endpoint/domains',
    registerApi: true,
    dnsApi: true,
    domainConnect: true,
    sandbox: true,
    agentFit: 'strong',
    adaStatus: 'planned',
    grade: 'A',
    notes:
      'Large install base; production keys/policy review; separate from GoDaddy ANS (agent identity).',
    byokId: 'godaddy',
    authModel: 'API key + secret (OTE sandbox available)',
  },
  {
    id: 'opensrs',
    name: 'OpenSRS (Tucows)',
    api: 'Reseller / full domain lifecycle API',
    docsUrl: 'https://opensrs.com/',
    registerApi: true,
    dnsApi: true,
    domainConnect: 'partial',
    sandbox: true,
    agentFit: 'reseller',
    adaStatus: 'planned',
    grade: 'A (reseller)',
    notes: 'Best for white-label / reseller motion under your brand.',
    byokId: 'opensrs',
    authModel: 'Reseller credentials',
    regions: 'Global reseller',
  },
  {
    id: 'namecom',
    name: 'Name.com',
    api: 'Core API v4 (domains, DNS, transfers)',
    docsUrl: 'https://www.name.com/api-docs',
    registerApi: true,
    dnsApi: true,
    domainConnect: 'unknown',
    sandbox: true,
    agentFit: 'good',
    adaStatus: 'planned',
    grade: 'B+',
    notes: 'Clean REST API; good agent fit for indie + SMB brands.',
    byokId: 'namecom',
    authModel: 'username + API token',
  },
  {
    id: 'gandi',
    name: 'Gandi',
    api: 'LiveDNS + Domain API',
    docsUrl: 'https://api.gandi.net/docs/',
    registerApi: true,
    dnsApi: true,
    domainConnect: 'unknown',
    sandbox: 'partial',
    agentFit: 'good',
    adaStatus: 'planned',
    grade: 'B+',
    notes: 'Strong EU presence; PAT tokens; LiveDNS is agent-friendly.',
    byokId: 'gandi',
    authModel: 'Personal Access Token',
    regions: 'EU-heavy',
  },
  {
    id: 'hover',
    name: 'Hover (Tucows retail)',
    api: 'Limited / partner-oriented vs OpenSRS reseller',
    registerApi: true,
    dnsApi: true,
    domainConnect: 'unknown',
    sandbox: 'unknown',
    agentFit: 'limited',
    adaStatus: 'partial',
    grade: 'B',
    notes: 'Prefer OpenSRS for automation; Hover is more retail UX.',
    byokId: 'hover',
    authModel: 'Varies / partner',
  },
  {
    id: 'enom',
    name: 'eNom (Tucows)',
    api: 'Legacy reseller API (still widely used)',
    registerApi: true,
    dnsApi: true,
    domainConnect: 'partial',
    sandbox: true,
    agentFit: 'reseller',
    adaStatus: 'planned',
    grade: 'B+',
    notes: 'Reseller-centric; common in hosting control panels.',
    byokId: 'enom',
    authModel: 'Reseller UID + password / API token',
  },
  {
    id: 'internetbs',
    name: 'Internet.bs',
    api: 'HTTP API (Domain/Register, Dns/*)',
    docsUrl: 'https://internetbs.net/en/domain-name-registrations/api/',
    registerApi: true,
    dnsApi: true,
    domainConnect: false,
    sandbox: true,
    agentFit: 'good',
    adaStatus: 'planned',
    grade: 'B+',
    notes: 'Long-standing automation API; test account available.',
    byokId: 'internetbs',
    authModel: 'API key + password',
  },
  {
    id: 'njalla',
    name: 'Njalla',
    api: 'JSON-RPC API (add-domain, add-record, …)',
    docsUrl: 'https://njal.la/api/',
    registerApi: true,
    dnsApi: true,
    domainConnect: false,
    sandbox: false,
    agentFit: 'good',
    adaStatus: 'planned',
    grade: 'B',
    notes: 'Privacy-focused; API token; good for privacy-conscious agents.',
    byokId: 'njalla',
    authModel: 'API token',
  },
  {
    id: 'spaceship',
    name: 'Spaceship (Namecheap group)',
    api: 'Developer API (domains + DNS) — evolving',
    docsUrl: 'https://www.spaceship.com/',
    registerApi: true,
    dnsApi: true,
    domainConnect: 'unknown',
    sandbox: 'unknown',
    agentFit: 'good',
    adaStatus: 'planned',
    grade: 'B+',
    notes: 'Modern stack; confirm current public API scopes before shipping adapter.',
    byokId: 'spaceship',
    authModel: 'API key',
  },
  {
    id: 'namebright',
    name: 'NameBright',
    api: 'REST API (portfolio, register, DNS)',
    docsUrl: 'https://api.namebright.com/',
    registerApi: true,
    dnsApi: true,
    domainConnect: false,
    sandbox: 'partial',
    agentFit: 'good',
    adaStatus: 'planned',
    grade: 'B',
    notes: 'Aftermarket + retail; useful for agents handling portfolio ops.',
    byokId: 'namebright',
    authModel: 'OAuth / API credentials',
  },
  {
    id: 'hexonet',
    name: 'HEXONET',
    api: 'Backend API (ISPConfig-style domain ops)',
    docsUrl: 'https://wiki.hexonet.net/',
    registerApi: true,
    dnsApi: true,
    domainConnect: 'partial',
    sandbox: true,
    agentFit: 'reseller',
    adaStatus: 'planned',
    grade: 'B+',
    notes: 'Registrar backend / reseller; strong for multi-tenant platforms.',
    byokId: 'hexonet',
    authModel: 'Entity + login + password / session',
  },
  {
    id: 'centralnic',
    name: 'CentralNic Reseller (RRPproxy)',
    api: 'EPP / HTTPS reseller APIs',
    docsUrl: 'https://kb.centralnicreseller.com/',
    registerApi: true,
    dnsApi: true,
    domainConnect: 'partial',
    sandbox: true,
    agentFit: 'reseller',
    adaStatus: 'planned',
    grade: 'B+',
    notes: 'Enterprise reseller path; not consumer API-key simple.',
    byokId: 'centralnic',
    authModel: 'Reseller EPP / API credentials',
  },
  {
    id: 'ionos',
    name: 'IONOS',
    api: 'Cloud / domain APIs vary by product tier',
    registerApi: true,
    dnsApi: true,
    domainConnect: true,
    sandbox: 'unknown',
    agentFit: 'limited',
    adaStatus: 'partial',
    grade: 'B',
    notes: 'Strong Domain Connect; full agent register path depends on account tier.',
    byokId: 'ionos',
    authModel: 'API key / OAuth (product-dependent)',
    regions: 'EU-heavy',
  },
  {
    id: 'route53',
    name: 'Amazon Route 53 Domains',
    api: 'AWS Route 53 Domains + Route 53 DNS',
    docsUrl: 'https://docs.aws.amazon.com/Route53/latest/APIReference/API_Operations_Amazon_Route_53_Domains.html',
    registerApi: true,
    dnsApi: true,
    domainConnect: false,
    sandbox: 'partial',
    agentFit: 'strong',
    adaStatus: 'planned',
    grade: 'A−',
    notes: 'IAM-scoped; excellent for AWS-native agents; register + hosted zones.',
    byokId: 'route53',
    authModel: 'AWS access key / IAM role',
    regions: 'Global (AWS)',
  },
  {
    id: 'google-domains-squarespace',
    name: 'Squarespace Domains (ex-Google Domains)',
    api: 'Limited public register API for third-party agents',
    registerApi: false,
    dnsApi: 'partial',
    domainConnect: 'unknown',
    sandbox: false,
    agentFit: 'limited',
    adaStatus: 'not-planned',
    grade: 'C',
    notes: 'After Google→Squarespace move, agent automation is limited; prefer other registrars.',
    byokId: 'squarespace',
    authModel: 'N/A / limited',
  },
  {
    id: 'godaddy-ans',
    name: 'GoDaddy ANS / Agent Registrar',
    api: 'ANS — agent identity registration (not gTLD brand create)',
    docsUrl: 'https://www.godaddy.com/',
    registerApi: false,
    dnsApi: true,
    domainConnect: 'partial',
    sandbox: 'unknown',
    agentFit: 'identity-only',
    adaStatus: 'partial',
    grade: 'Layer A',
    notes:
      'Registers AI agent identities (Layer A), not customer brand .com domains. Keep separate from Domains API.',
    byokId: 'godaddy-ans',
    authModel: 'ANS enrollment / platform credentials',
  },
];

/** Only registrars that can actually create brand domains via API (Layer B). */
export function listBrandDomainApiRegistrars(): RegistrarAgentCapability[] {
  return AGENT_READY_REGISTRARS.filter(
    (r) => r.registerApi && r.agentFit !== 'identity-only' && r.adaStatus !== 'not-planned'
  );
}

/** Recommended first adapters for ADA L3. */
export function listPriorityAdapters(): RegistrarAgentCapability[] {
  const order = [
    'porkbun',
    'namecheap',
    'cloudflare',
    'dynadot',
    'namesilo',
    'namecom',
    'godaddy',
    'route53',
    'gandi',
    'opensrs',
  ];
  const map = new Map(AGENT_READY_REGISTRARS.map((r) => [r.id, r]));
  return order.map((id) => map.get(id)).filter(Boolean) as RegistrarAgentCapability[];
}

export function getRegistrarByByokId(id: string): RegistrarAgentCapability | undefined {
  const key = id.toLowerCase().trim();
  return AGENT_READY_REGISTRARS.find((r) => r.byokId === key || r.id === key);
}

export function agentRegistrarsManifest() {
  const brand = listBrandDomainApiRegistrars();
  return {
    version: '1.0',
    scope: 'Registrars with API surfaces agents can use for brand domain register and/or DNS',
    count: brand.length,
    note: 'Research snapshot — verify live developer docs before production. ADA L3 adapters are planned; mutations fail closed until enabled.',
    byokHeader: 'x-ada-registrar: <byokId>',
    priorityOrder: listPriorityAdapters().map((r) => ({
      byokId: r.byokId,
      name: r.name,
      agentFit: r.agentFit,
      adaStatus: r.adaStatus,
    })),
    registrars: brand.map((r) => ({
      id: r.id,
      byokId: r.byokId,
      name: r.name,
      api: r.api,
      docsUrl: r.docsUrl,
      registerApi: r.registerApi,
      dnsApi: r.dnsApi,
      domainConnect: r.domainConnect,
      sandbox: r.sandbox,
      agentFit: r.agentFit,
      adaStatus: r.adaStatus,
      grade: r.grade,
      authModel: r.authModel,
      notes: r.notes,
      regions: r.regions,
    })),
    identityOnly: AGENT_READY_REGISTRARS.filter((r) => r.agentFit === 'identity-only').map((r) => ({
      name: r.name,
      notes: r.notes,
    })),
    notRecommended: AGENT_READY_REGISTRARS.filter((r) => r.adaStatus === 'not-planned').map((r) => ({
      name: r.name,
      notes: r.notes,
    })),
    safety: {
      humanConfirmRequired: true,
      hardBudgetStop: true,
      usesUserLinkedKeysOnly: true,
      registersDomainsInAdaV1: false,
    },
  };
}
