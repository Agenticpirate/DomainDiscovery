/**
 * Shared tool handlers for MCP + REST agents (Phase 2).
 * Availability is never invented — only from check tools / pipeline.
 */

import { z } from 'zod';
import { checkDomainAvailabilityViaMCP } from '@/lib/instantDomainMCP';
import { lookupWhois } from '@/lib/rdapClient';
import { generateGeoDomains, getCities, getCountries } from '@/services/geoService';
import { getTldPriceDetail } from '@/lib/tldPriceData';
import { SITE_BRAND, SITE_FEATURES, SITE_PRODUCT_FACTS, getSiteBaseUrl } from '@/lib/seoSiteFacts';
import { parseBusinessBrief } from '../brief';
import { generateCandidateDomains } from '../generateCandidates';
import { rankDomains } from '../ranker';
import { runAutoPipeline } from '../pipeline';
import type { DomainBrief } from '../types';
import { skillsManifest } from '../skills/catalog';
import { byokStatus } from '../byokContext';
import { toolRegisterDomain, toolSetDnsRecords } from '../skills/registrarStubs';
import { agentRegistrarsManifest } from '../registrars/agentReadyRegistrars';

export const MAX_CHECK_DOMAINS = 50;
export const MAX_GENERATE = 80;
export const MAX_GEO = 100;

export function jsonToolResult(data: unknown, isError = false) {
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  return {
    content: [{ type: 'text' as const, text }],
    structuredContent: typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : { result: data },
    isError,
  };
}

function briefFromArgs(args: {
  text?: string;
  description?: string;
  businessName?: string;
  style?: DomainBrief['style'];
  keywords?: string[];
  preferredTlds?: string[];
  markets?: string[];
  count?: number;
  industry?: string;
}): DomainBrief {
  const text = (args.text || args.description || '').trim();
  if (!text && !args.businessName) {
    throw new Error('Provide text (business description) or businessName');
  }
  return parseBusinessBrief(text || args.businessName || '', {
    businessName: args.businessName,
    description: text || undefined,
    style: args.style,
    keywords: args.keywords,
    preferredTlds: args.preferredTlds,
    markets: args.markets,
    count: args.count,
    industry: args.industry,
  });
}

export async function toolGetProductFacts() {
  return jsonToolResult({
    name: SITE_BRAND.name,
    alternateNames: SITE_BRAND.alternateNames,
    domain: SITE_BRAND.domain,
    tagline: SITE_BRAND.tagline,
    baseUrl: getSiteBaseUrl(),
    facts: SITE_PRODUCT_FACTS,
    features: SITE_FEATURES,
    agentEndpoints: {
      auto: `${getSiteBaseUrl()}/api/agent/auto`,
      mcp: `${getSiteBaseUrl()}/api/mcp`,
      manifest: `${getSiteBaseUrl()}/api/agent/manifest`,
    },
    notes: [
      'Not a domain registrar — checkout is at third-party registrars.',
      'Availability is a snapshot; re-check before paying.',
      'Rankings are research signals, not trademark legal advice.',
    ],
  });
}

export async function toolParseBusinessBrief(args: {
  text: string;
  style?: DomainBrief['style'];
  count?: number;
  preferredTlds?: string[];
  markets?: string[];
  industry?: string;
  businessName?: string;
  keywords?: string[];
}) {
  const brief = briefFromArgs(args);
  return jsonToolResult({ brief });
}

export async function toolGenerateDomainNames(args: {
  text?: string;
  description?: string;
  businessName?: string;
  style?: DomainBrief['style'];
  keywords?: string[];
  preferredTlds?: string[];
  markets?: string[];
  count?: number;
  limit?: number;
}) {
  const brief = briefFromArgs({ ...args, count: args.count ?? 10 });
  const limit = Math.min(Math.max(args.limit ?? 40, 5), MAX_GENERATE);
  const { domains, source } = await generateCandidateDomains(brief, limit);
  return jsonToolResult({ brief, domains, source, count: domains.length });
}

export async function toolCheckDomainAvailability(args: { domains: string[] }) {
  const domains = Array.from(
    new Set(
      (args.domains || [])
        .map((d) => d.toLowerCase().trim())
        .filter((d) => d.includes('.') && d.length < 80)
    )
  ).slice(0, MAX_CHECK_DOMAINS);

  if (domains.length === 0) {
    return jsonToolResult({ error: 'Provide at least one domain (e.g. example.com)' }, true);
  }

  try {
    const results = await checkDomainAvailabilityViaMCP({ domains });
    return jsonToolResult({
      checked: results.length,
      results,
      note: 'Snapshot only — re-check at registrar checkout.',
    });
  } catch (e) {
    return jsonToolResult(
      {
        error: e instanceof Error ? e.message : 'Availability check failed',
        domains,
      },
      true
    );
  }
}

export async function toolRankDomains(args: {
  domains: string[];
  text?: string;
  description?: string;
  style?: DomainBrief['style'];
  keywords?: string[];
  preferredTlds?: string[];
  checkAvailability?: boolean;
}) {
  const brief = briefFromArgs({
    text: args.text || args.description || 'brand naming project',
    style: args.style,
    keywords: args.keywords,
    preferredTlds: args.preferredTlds,
  });

  const domains = Array.from(
    new Set((args.domains || []).map((d) => d.toLowerCase().trim()).filter((d) => d.includes('.')))
  ).slice(0, MAX_CHECK_DOMAINS);

  if (domains.length === 0) {
    return jsonToolResult({ error: 'Provide domains to rank' }, true);
  }

  let meta = new Map<string, { available?: boolean; premium?: boolean; priceHint?: string; buyUrl?: string }>();
  if (args.checkAvailability !== false) {
    try {
      const checked = await checkDomainAvailabilityViaMCP({ domains });
      for (const r of checked) {
        meta.set(r.domain.toLowerCase(), {
          available: r.available,
          premium: r.premium,
          priceHint: r.price,
          buyUrl: r.buyUrl,
        });
      }
    } catch {
      // rank without availability
    }
  }

  const ranked = rankDomains(
    domains.map((domain) => {
      const m = meta.get(domain);
      return {
        domain,
        available: m?.available ?? null,
        premium: m?.premium,
        priceHint: m?.priceHint,
        buyUrl: m?.buyUrl,
      };
    }),
    brief
  );

  return jsonToolResult({ brief, ranked, count: ranked.length });
}

export async function toolFindBrandDomains(args: {
  text: string;
  count?: number;
  style?: DomainBrief['style'];
  preferredTlds?: string[];
  markets?: string[];
  industry?: string;
  businessName?: string;
  keywords?: string[];
  mustInclude?: string[];
  avoid?: string[];
  strategies?: DomainBrief['strategies'];
  skipAvailability?: boolean;
  maxBudgetUsd?: number;
}) {
  const text = (args.text || '').trim();
  if (text.length < 8) {
    return jsonToolResult({ error: 'text must be at least 8 characters (business description)' }, true);
  }

  try {
    const result = await runAutoPipeline({
      text,
      brief: {
        count: args.count,
        style: args.style,
        preferredTlds: args.preferredTlds,
        markets: args.markets,
        industry: args.industry,
        businessName: args.businessName,
        keywords: args.keywords,
        mustInclude: args.mustInclude,
        avoid: args.avoid,
        strategies: args.strategies,
        maxBudgetUsd: args.maxBudgetUsd,
      },
      maxBudgetUsd: args.maxBudgetUsd,
      skipAvailability: Boolean(args.skipAvailability),
      sync: true,
    });
    return jsonToolResult(result);
  } catch (e) {
    return jsonToolResult(
      { error: e instanceof Error ? e.message : 'find_brand_domains failed' },
      true
    );
  }
}

export async function toolWhoisLookup(args: { domain: string }) {
  const domain = (args.domain || '').trim();
  if (!domain) return jsonToolResult({ error: 'domain is required' }, true);
  try {
    const result = await lookupWhois(domain);
    return jsonToolResult(result, result.success === false);
  } catch (e) {
    return jsonToolResult({ error: e instanceof Error ? e.message : 'WHOIS failed' }, true);
  }
}

export async function toolGenerateGeoDomains(args: {
  keyword: string;
  countryCode?: string;
  tlds?: string[];
  limit?: number;
}) {
  const keyword = (args.keyword || '').trim();
  if (!keyword) return jsonToolResult({ error: 'keyword is required' }, true);

  const limit = Math.min(Math.max(args.limit ?? 40, 1), MAX_GEO);
  const tlds = (args.tlds?.length ? args.tlds : ['.com']).map((t) =>
    t.startsWith('.') ? t : `.${t}`
  );

  let locations = args.countryCode
    ? getCities(args.countryCode.toUpperCase())
    : getCountries().slice(0, 30);

  if (locations.length === 0) {
    locations = getCountries().slice(0, 20);
  }

  const generated = generateGeoDomains(keyword, locations.slice(0, 80), tlds).slice(0, limit);
  return jsonToolResult({
    keyword,
    tlds,
    count: generated.length,
    domains: generated.map((g) => ({
      domain: g.domain,
      location: g.location.name,
      population: g.location.population,
      countryCode: g.location.countryCode,
    })),
  });
}

export async function toolCompareTldPrices(args: { tld: string }) {
  const tld = (args.tld || '').trim();
  if (!tld) return jsonToolResult({ error: 'tld is required (e.g. com or .ai)' }, true);
  const detail = getTldPriceDetail(tld);
  if (!detail) {
    return jsonToolResult({ error: `No price data for ${tld}`, tld }, true);
  }
  return jsonToolResult({
    tld: detail.tld,
    summary: detail.pricingSummary,
    registrars: detail.registrars.slice(0, 12),
    note: 'Regular-style research prices — confirm at registrar checkout.',
  });
}

export async function toolListAgentSkills() {
  return jsonToolResult({
    ...skillsManifest(),
    byokStatus: byokStatus(),
    note: 'Pass BYOK via headers on MCP/REST calls. Free L0 works with zero keys.',
  });
}

export async function toolListAgentRegistrars() {
  return jsonToolResult({
    ...agentRegistrarsManifest(),
    note: 'Use x-ada-registrar: <byokId> with user-linked keys for L3. Research only in ADA v1 — mutations fail closed.',
  });
}

/** Catalog for manifest / docs */
export const AGENT_TOOL_CATALOG = [
  {
    name: 'get_product_facts',
    description: 'Canonical DomainDiscovery product facts for agents',
    handler: toolGetProductFacts,
  },
  {
    name: 'parse_business_brief',
    description: 'Parse free text into a structured DomainBrief',
    handler: toolParseBusinessBrief,
  },
  {
    name: 'generate_domain_names',
    description: 'Generate candidate domain names from a business brief',
    handler: toolGenerateDomainNames,
  },
  {
    name: 'check_domain_availability',
    description: 'Live-check availability for a list of domains (max 50)',
    handler: toolCheckDomainAvailability,
  },
  {
    name: 'rank_domains',
    description: 'Score and rank domains for brand fit against a brief',
    handler: toolRankDomains,
  },
  {
    name: 'find_brand_domains',
    description:
      'AUTO: parse brief → generate → check availability → rank → shortlist for a business',
    handler: toolFindBrandDomains,
  },
  {
    name: 'whois_lookup',
    description: 'Public WHOIS/RDAP registration data for a domain',
    handler: toolWhoisLookup,
  },
  {
    name: 'generate_geo_domains',
    description: 'Generate city/country + keyword domain patterns',
    handler: toolGenerateGeoDomains,
  },
  {
    name: 'compare_tld_prices',
    description: 'Regular-style registrar price signals for a TLD',
    handler: toolCompareTldPrices,
  },
  {
    name: 'list_agent_skills',
    description:
      'List ADA skill layers (L0 free research, L1 BYOK LLM, L2 guided purchase, L3 registrar BYOK). Shows required headers for BYOK.',
    handler: toolListAgentSkills,
  },
  {
    name: 'list_agent_registrars',
    description:
      'List registrars that support API register/DNS for agents (Porkbun, Namecheap, Cloudflare, GoDaddy, Route 53, …) with BYOK ids and adapter status.',
    handler: toolListAgentRegistrars,
  },
  {
    name: 'register_domain',
    description:
      'L3 roadmap: register a domain with user BYOK registrar keys + human confirm. Disabled by default; fails closed.',
    handler: toolRegisterDomain,
  },
  {
    name: 'set_dns_records',
    description:
      'L3 roadmap: set DNS with user BYOK registrar keys + human confirm. Disabled by default; fails closed.',
    handler: toolSetDnsRecords,
  },
] as const;

export type AgentToolName = (typeof AGENT_TOOL_CATALOG)[number]['name'];

export async function invokeAgentTool(name: string, args: Record<string, unknown>) {
  const tool = AGENT_TOOL_CATALOG.find((t) => t.name === name);
  if (!tool) {
    return jsonToolResult({ error: `Unknown tool: ${name}` }, true);
  }
  const { toolTier } = await import('@/lib/scale/gate');
  const { withHeavySlot } = await import('@/lib/scale/concurrency');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const run = () => tool.handler(args as any);
  if (toolTier(name) === 'heavy') {
    try {
      return await withHeavySlot(run);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Service busy';
      return jsonToolResult({ error: msg, code: 'SERVICE_BUSY' }, true);
    }
  }
  return run();
}

// Zod shapes for MCP registerTool inputSchema
export const zFindBrand = {
  text: z.string().min(8).describe('Business description'),
  count: z.number().int().min(3).max(25).optional().describe('Shortlist size'),
  style: z.enum(['brandable', 'keyword', 'mixed', 'geo']).optional(),
  preferredTlds: z.array(z.string()).optional().describe('Preferred TLDs e.g. .com .io'),
  markets: z.array(z.string()).optional(),
  industry: z.string().optional(),
  businessName: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  mustInclude: z.array(z.string()).optional().describe('Words to include in domain'),
  avoid: z.array(z.string()).optional().describe('Words to never use'),
  strategies: z
    .array(
      z.enum([
        'available_first',
        'radio_test',
        'brandable',
        'keyword_exact',
        'short',
        'easy_spell',
        'no_hyphen',
        'no_numbers',
        'geo_local',
        'com_priority',
        'premium_ok',
      ])
    )
    .optional()
    .describe('Ranking strategies including radio_test'),
  skipAvailability: z.boolean().optional(),
  maxBudgetUsd: z.number().positive().optional().describe('Max registration budget in USD'),
};

export const zDomains = {
  domains: z.array(z.string()).min(1).max(MAX_CHECK_DOMAINS),
};

export const zRank = {
  domains: z.array(z.string()).min(1).max(MAX_CHECK_DOMAINS),
  text: z.string().optional(),
  description: z.string().optional(),
  style: z.enum(['brandable', 'keyword', 'mixed', 'geo']).optional(),
  keywords: z.array(z.string()).optional(),
  preferredTlds: z.array(z.string()).optional(),
  checkAvailability: z.boolean().optional(),
};

export const zBrief = {
  text: z.string().min(1),
  style: z.enum(['brandable', 'keyword', 'mixed', 'geo']).optional(),
  count: z.number().int().optional(),
  preferredTlds: z.array(z.string()).optional(),
  markets: z.array(z.string()).optional(),
  industry: z.string().optional(),
  businessName: z.string().optional(),
  keywords: z.array(z.string()).optional(),
};

export const zGenerate = {
  ...zBrief,
  text: z.string().optional(),
  description: z.string().optional(),
  limit: z.number().int().optional(),
};

export const zWhois = { domain: z.string().min(3) };
export const zGeo = {
  keyword: z.string().min(1),
  countryCode: z.string().optional(),
  tlds: z.array(z.string()).optional(),
  limit: z.number().int().optional(),
};
export const zTld = { tld: z.string().min(2) };
