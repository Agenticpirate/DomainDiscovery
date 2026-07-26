/**
 * ADA Agent Skills — optional layers on top of free research core.
 *
 * Layer model:
 *  L0 Free research     — Instant Domain MCP + brand brain offline + RDAP fallback
 *  L1 BYOK LLM          — user Anthropic/OpenAI key for better inventives
 *  L2 Guided purchase   — deep-links / Domain Connect (human pays)
 *  L3 Registrar BYOK    — register + DNS with user keys + human confirm (opt-in)
 */

export type SkillLayer = 'L0' | 'L1' | 'L2' | 'L3';

export type AgentSkill = {
  id: string;
  name: string;
  layer: SkillLayer;
  status: 'live' | 'optional' | 'roadmap';
  description: string;
  tools: string[];
  /** What the connecting agent must supply */
  requires: {
    byok?: Array<'llm' | 'registrar'>;
    headers?: string[];
    humanConfirm?: boolean;
    envOptional?: string[];
  };
  /** Hard product constraints */
  constraints: string[];
};

export const AGENT_SKILLS: AgentSkill[] = [
  {
    id: 'brandable_research',
    name: 'Brandable domain research',
    layer: 'L0',
    status: 'live',
    description:
      'Invent brandable names (offline brand brain), check availability via Instant Domain Search MCP, rank under budget. No user API keys required.',
    tools: ['find_brand_domains', 'generate_domain_names', 'check_domain_availability', 'rank_domains'],
    requires: {
      envOptional: ['ADA_USE_INSTANT_DOMAIN_MCP (default ON)'],
    },
    constraints: [
      'Does not register domains',
      'Does not modify DNS',
      'Availability is a snapshot',
      'Only checks top inventives to save Instant Domain / RDAP limits',
    ],
  },
  {
    id: 'availability_instant_domain',
    name: 'Instant Domain availability',
    layer: 'L0',
    status: 'live',
    description:
      'Live availability via Instant Domain Search MCP (same free stack as DomainDiscovery). Falls back to public RDAP if MCP is empty/down.',
    tools: ['check_domain_availability', 'find_brand_domains'],
    requires: {},
    constraints: ['Snapshot only — re-check at registrar checkout'],
  },
  {
    id: 'byok_llm_invent',
    name: 'BYOK LLM brand invention',
    layer: 'L1',
    status: 'optional',
    description:
      'Optional layer: agent supplies Anthropic / OpenAI-compatible key so brand brain invents higher-quality labels. Free offline inventives still run without keys.',
    tools: ['find_brand_domains'],
    requires: {
      byok: ['llm'],
      headers: [
        'x-ada-llm-provider: anthropic|openai|minimax|xai',
        'x-ada-llm-api-key: <user key>',
        'x-ada-llm-model: <optional>',
        'x-ada-llm-base-url: <optional for openai-compatible>',
      ],
    },
    constraints: [
      'Keys stay on the request only (not stored by ADA)',
      'LLM invents labels only — never invents availability',
      'Falls back to offline brain if key missing/fails',
    ],
  },
  {
    id: 'guided_purchase',
    name: 'Guided purchase links',
    layer: 'L2',
    status: 'live',
    description:
      'Returns registrar buy URLs for available shortlist names. Human completes checkout.',
    tools: ['find_brand_domains'],
    requires: {},
    constraints: ['Human pays at registrar', 'No card data on ADA'],
  },
  {
    id: 'registrar_register_dns',
    name: 'Registrar register + DNS (BYOK)',
    layer: 'L3',
    status: 'roadmap',
    description:
      'Optional layer: user-linked registrar API keys + human-confirm token → register + DNS under maxBudgetUsd. Supports agent-ready registrars (Porkbun, Namecheap, Cloudflare, Dynadot, NameSilo, GoDaddy Domains, Name.com, Gandi, Route 53, OpenSRS, eNom, Internet.bs, Njalla, Spaceship, NameBright, HEXONET, CentralNic, IONOS). Disabled by default.',
    tools: ['list_agent_registrars', 'register_domain', 'set_dns_records'],
    requires: {
      byok: ['registrar'],
      humanConfirm: true,
      headers: [
        'x-ada-registrar: porkbun|namecheap|cloudflare|dynadot|namesilo|godaddy|namecom|gandi|route53|opensrs|enom|internetbs|njalla|spaceship|namebright|hexonet|centralnic|ionos',
        'x-ada-registrar-api-key: <key>',
        'x-ada-registrar-secret: <secret if required>',
        'x-ada-human-confirm: <one-time confirm token>',
        'x-ada-max-budget-usd: <hard stop>',
      ],
    },
    constraints: [
      'OFF until ADA_ENABLE_REGISTRAR_MUTATIONS=true and per-registrar adapter is wired',
      'Requires human confirm token per mutation',
      'Hard budget stop — refuse if price unknown or over cap',
      'Idempotent retries; no double-register',
      'Never use ADA server registrar accounts for customer brands',
      'GoDaddy ANS is identity-only — not brand domain create',
    ],
  },
];

export function getSkill(id: string): AgentSkill | undefined {
  return AGENT_SKILLS.find((s) => s.id === id);
}

export function skillsManifest() {
  return {
    product: 'AI Domain Assistant',
    version: '0.3.0',
    layers: {
      L0: 'Free research core (Instant Domain + brand brain + RDAP)',
      L1: 'BYOK LLM invention (optional)',
      L2: 'Guided purchase deep-links',
      L3: 'Registrar BYOK register + DNS (roadmap, human confirm)',
    },
    skills: AGENT_SKILLS,
    byok: {
      llm: {
        headers: ['x-ada-llm-provider', 'x-ada-llm-api-key', 'x-ada-llm-model', 'x-ada-llm-base-url'],
        body: { byok: { llm: { provider: 'anthropic', apiKey: '…', model: 'claude-sonnet-4-5' } } },
      },
      registrar: {
        headers: [
          'x-ada-registrar',
          'x-ada-registrar-api-key',
          'x-ada-registrar-secret',
          'x-ada-human-confirm',
          'x-ada-max-budget-usd',
        ],
        status: 'roadmap',
      },
    },
    availability: {
      primary: 'Instant Domain Search MCP',
      fallback: 'Public RDAP',
      env: 'ADA_USE_INSTANT_DOMAIN_MCP (default true)',
    },
  };
}
