/**
 * Agent Card — discoverable metadata for AI agents (ANS-inspired).
 * Hosted at /.well-known/agent-card.json
 */

import { getSiteBaseUrl, SITE_BRAND, SITE_PRODUCT_FACTS } from '@/lib/seoSiteFacts';
import { ADA_BRAND, getAdaPublicUrl } from '@/lib/adaConfig';

export type AgentCard = {
  schemaVersion: string;
  name: string;
  description: string;
  url: string;
  provider: { name: string; url: string; alternateNames?: string[] };
  protocols: string[];
  endpoints: Record<string, string>;
  capabilities: string[];
  tools: { name: string; description: string }[];
  constraints: {
    registersDomains: boolean;
    modifiesDns: boolean;
    humanConfirmForPurchase: boolean;
    inventsPrices: boolean;
  };
  budget: {
    parameter: string;
    currency: string;
    statuses: string[];
    notes: string;
  };
  pricing: { model: string; notes: string };
  security: {
    auth: string[];
    recommendations: string[];
  };
  version: string;
  documentation: Record<string, string>;
  relatedStandards: string[];
};

const TOOLS = [
  { name: 'find_brand_domains', description: 'AUTO: brand brain → Instant Domain check → rank → shortlist under maxBudgetUsd' },
  { name: 'list_agent_skills', description: 'Skill layers L0–L3 + BYOK requirements (LLM / registrar)' },
  {
    name: 'list_agent_registrars',
    description:
      'Registrars with API register/DNS for agents (Porkbun, Namecheap, Cloudflare, GoDaddy, Route 53, …)',
  },
  { name: 'ada_chat', description: 'Conversational domain assistant (POST /api/ada/chat) — humans + agents' },
  { name: 'get_product_facts', description: 'Canonical product facts for agents' },
  { name: 'parse_business_brief', description: 'Free text → structured DomainBrief' },
  { name: 'generate_domain_names', description: 'Candidate names from brief/keywords' },
  { name: 'check_domain_availability', description: 'Live Instant Domain MCP check (max 50)' },
  { name: 'rank_domains', description: 'Score brand fit with explainable breakdown' },
  { name: 'whois_lookup', description: 'Public WHOIS/RDAP registration data' },
  { name: 'generate_geo_domains', description: 'City/country + keyword patterns' },
  { name: 'compare_tld_prices', description: 'Regular-style TLD price research' },
  { name: 'register_domain', description: 'L3 roadmap: BYOK registrar register + human confirm (fail-closed)' },
  { name: 'set_dns_records', description: 'L3 roadmap: BYOK DNS mutation + human confirm (fail-closed)' },
];

/** DomainDiscovery research + MCP agent card */
export function buildDomainDiscoveryAgentCard(): AgentCard {
  const base = getSiteBaseUrl();
  const ada = getAdaPublicUrl();
  return {
    schemaVersion: 'aidomainassistant.agent-card/1.0',
    name: SITE_BRAND.name,
    description: SITE_PRODUCT_FACTS.slice(0, 480),
    url: base,
    provider: {
      name: SITE_BRAND.name,
      url: base,
      alternateNames: [...SITE_BRAND.alternateNames],
    },
    protocols: ['mcp', 'https-jsonrpc', 'rest'],
    endpoints: {
      mcp: `${base}/api/mcp`,
      auto: `${base}/api/agent/auto`,
      chat: `${base}/api/ada/chat`,
      jobs: `${base}/api/agent/jobs/{id}`,
      manifest: `${base}/api/agent/manifest`,
      skills: `${base}/api/agent/skills`,
      health: `${base}/api/agent/health`,
      register: `${base}/api/agent/register`,
      agentCard: `${base}/.well-known/agent-card.json`,
      llms: `${base}/llms.txt`,
      assistantHub: `${base}/assistant`,
      productApp: ada,
      chatUi: `${base}/ada/chat`,
    },
    capabilities: [
      'domain_name_search',
      'brand_domain_ranking',
      'conversational_chat',
      'budget_filter',
      'whois_rdap',
      'geo_domain_lists',
      'tld_price_research',
      'bulk_availability_check',
      'agent_mcp_tools',
      'byok_llm_invent',
      'byok_registrar_opt_in',
    ],
    tools: TOOLS,
    constraints: {
      registersDomains: false,
      modifiesDns: false,
      humanConfirmForPurchase: true,
      inventsPrices: false,
    },
    budget: {
      parameter: 'maxBudgetUsd',
      currency: 'USD',
      statuses: ['within', 'over', 'unknown'],
      notes:
        'Pass maxBudgetUsd on find_brand_domains or POST /api/agent/auto. Price often unknown until registrar checkout.',
    },
    pricing: {
      model: 'research_free_v1',
      notes: 'Domain registration paid at third-party registrar. No auto-purchase in v1.',
    },
    security: {
      auth: ['Bearer AGENT_API_KEY', 'x-agent-api-key', 'AGENT_REQUIRE_AUTH in production'],
      recommendations: [
        'Set AGENT_API_KEY + AGENT_REQUIRE_AUTH=true in production',
        'Never embed registrar API secrets in browser clients long-term',
        'Enforce maxBudgetUsd in agent policies',
        'Treat availability as a snapshot; re-check before pay',
        'Require human confirmation before register/DNS automation',
        'Rate-limit agent callers; use idempotent retries',
        'BYOK LLM: x-ada-llm-provider + x-ada-llm-api-key (request-scoped)',
      ],
    },
    version: '0.3.0',
    documentation: {
      agentHub: `${base}/assistant`,
      integration: `${base}/assistant#integration`,
      security: `${base}/assistant#security`,
      mcp: `${base}/api/mcp`,
      skills: `${base}/api/agent/skills`,
      health: `${base}/api/agent/health`,
      production: 'docs/agent/PRODUCTION.md',
      ada: ada,
      adaDocs: `${ada.endsWith('/ada') ? ada : ada}/docs`.replace(/\/\/docs/, '/docs'),
    },
    relatedStandards: [
      'Model Context Protocol (MCP)',
      'GoDaddy Agent Name Service (ANS) — industry direction for agent discovery and identity',
      'DNS / Domain Connect — future DNS automation pattern',
    ],
  };
}

/** AI Domain Assistant product agent card */
export function buildAdaAgentCard(): AgentCard {
  const base = getSiteBaseUrl();
  const ada = getAdaPublicUrl();
  const card = buildDomainDiscoveryAgentCard();
  const adaDocs = ada.endsWith('/ada') ? `${ada}/docs` : `${ada}/docs`;
  const adaApp = ada.endsWith('/ada') ? `${ada}/app` : `${ada}/app`;
  const adaCard =
    process.env.NODE_ENV !== 'production' || ada.includes('localhost')
      ? `${base}/ada/.well-known/agent-card.json`
      : `https://www.aidomainassistant.com/.well-known/agent-card.json`;

  return {
    ...card,
    name: ADA_BRAND.name,
    description: ADA_BRAND.description,
    url: ada.includes('localhost') ? `${base}/ada` : `https://www.aidomainassistant.com`,
    provider: {
      name: ADA_BRAND.name,
      url: ada.includes('localhost') ? `${base}/ada` : `https://www.aidomainassistant.com`,
      alternateNames: [SITE_BRAND.name, ...SITE_BRAND.alternateNames],
    },
    endpoints: {
      ...card.endpoints,
      productApp: ada.includes('localhost') ? `${base}/ada` : `https://www.aidomainassistant.com`,
      app: adaApp.includes('localhost') ? `${base}/ada/app` : 'https://www.aidomainassistant.com/app',
      chat: ada.includes('localhost') ? `${base}/api/ada/chat` : 'https://www.aidomainassistant.com/api/ada/chat',
      chatUi: ada.includes('localhost') ? `${base}/ada/chat` : 'https://www.aidomainassistant.com/chat',
      docs: adaDocs.includes('localhost') ? `${base}/ada/docs` : 'https://www.aidomainassistant.com/docs',
      agentCard: adaCard,
      researchApis: base,
    },
    documentation: {
      docs: adaDocs.includes('localhost') ? `${base}/ada/docs` : 'https://www.aidomainassistant.com/docs',
      security: (adaDocs.includes('localhost') ? `${base}/ada/docs` : 'https://www.aidomainassistant.com/docs') + '#security',
      integration:
        (adaDocs.includes('localhost') ? `${base}/ada/docs` : 'https://www.aidomainassistant.com/docs') + '#integration',
      chat: ada.includes('localhost') ? `${base}/ada/chat` : 'https://www.aidomainassistant.com/chat',
      domainDiscoveryHub: `${base}/assistant`,
      mcp: `${base}/api/mcp`,
      trainingModel: 'hybrid-vertical-lexicons+deterministic-ranker+optional-spacexai-nlu',
    },
  };
}
