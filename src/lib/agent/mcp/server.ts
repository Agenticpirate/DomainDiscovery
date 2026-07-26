/**
 * First-party MCP server for AI Domain Assistant / DomainDiscovery (Phase 2).
 * Transports: HTTP POST /api/mcp · stdio via `npm run mcp:server`
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { SITE_BRAND, SITE_PRODUCT_FACTS, getSiteBaseUrl } from '@/lib/seoSiteFacts';
import { ADA_BRAND } from '@/lib/adaConfig';
import {
  toolCheckDomainAvailability,
  toolCompareTldPrices,
  toolFindBrandDomains,
  toolGenerateDomainNames,
  toolGenerateGeoDomains,
  toolGetProductFacts,
  toolListAgentSkills,
  toolListAgentRegistrars,
  toolParseBusinessBrief,
  toolRankDomains,
  toolWhoisLookup,
  zBrief,
  zDomains,
  zFindBrand,
  zGenerate,
  zGeo,
  zRank,
  zTld,
  zWhois,
} from '../tools/registry';
import { toolRegisterDomain, toolSetDnsRecords } from '../skills/registrarStubs';

export const MCP_SERVER_NAME = 'ai-domain-assistant';
export const MCP_SERVER_VERSION = '0.3.0';

export function createDomainDiscoveryMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: MCP_SERVER_NAME,
      version: MCP_SERVER_VERSION,
      title: `${ADA_BRAND.name} · Domain MCP`,
    },
    {
      instructions: [
        `${ADA_BRAND.name} (${SITE_BRAND.name}) helps AI agents find, check, and rank domain names under a budget.`,
        'PRIMARY TOOL: find_brand_domains — one-shot brief → generate → check → rank → shortlist.',
        'Pass maxBudgetUsd when the user has a registration research cap (USD).',
        'Never invent availability — only report what check tools / find_brand_domains return.',
        'NOT a registrar: humans confirm purchase at a third-party registrar. No auto-buy / no DNS changes in v1.',
        'Rankings are research signals, not trademark legal advice. Availability is a snapshot.',
        `HTTP MCP: ${getSiteBaseUrl()}/api/mcp · Agent Card: ${getSiteBaseUrl()}/ada/.well-known/agent-card.json · Docs: ${getSiteBaseUrl()}/ada/docs`,
      ].join(' '),
    }
  );

  server.registerTool(
    'get_product_facts',
    {
      title: 'Product facts',
      description: 'Canonical DomainDiscovery product facts, features, and agent endpoints.',
    },
    async () => toolGetProductFacts()
  );

  server.registerTool(
    'parse_business_brief',
    {
      title: 'Parse business brief',
      description: 'Parse free-text business description into a structured DomainBrief.',
      inputSchema: zBrief,
    },
    async (args) => toolParseBusinessBrief(args)
  );

  server.registerTool(
    'generate_domain_names',
    {
      title: 'Generate domain names',
      description: 'Generate candidate domain names from a business brief or keywords.',
      inputSchema: zGenerate,
    },
    async (args) => toolGenerateDomainNames(args)
  );

  server.registerTool(
    'check_domain_availability',
    {
      title: 'Check domain availability',
      description: 'Live-check availability for up to 50 domains. Returns snapshot only.',
      inputSchema: zDomains,
    },
    async (args) => toolCheckDomainAvailability(args)
  );

  server.registerTool(
    'rank_domains',
    {
      title: 'Rank domains',
      description: 'Score domains for brand fit against a business brief (optional live check).',
      inputSchema: zRank,
    },
    async (args) => toolRankDomains(args)
  );

  server.registerTool(
    'find_brand_domains',
    {
      title: 'Find brand domains (auto)',
      description:
        'AUTO pipeline: parse business brief → generate candidates → check availability → rank → shortlist. Primary tool for agents.',
      inputSchema: zFindBrand,
    },
    async (args) => toolFindBrandDomains(args)
  );

  server.registerTool(
    'whois_lookup',
    {
      title: 'WHOIS / RDAP lookup',
      description: 'Public registration data (registrar, dates, status, nameservers) when available.',
      inputSchema: zWhois,
    },
    async (args) => toolWhoisLookup(args)
  );

  server.registerTool(
    'generate_geo_domains',
    {
      title: 'Generate geo domains',
      description: 'Build city/country + keyword domain patterns for local SEO research.',
      inputSchema: zGeo,
    },
    async (args) => toolGenerateGeoDomains(args)
  );

  server.registerTool(
    'compare_tld_prices',
    {
      title: 'Compare TLD prices',
      description: 'Regular-style registrar price research signals for a TLD.',
      inputSchema: zTld,
    },
    async (args) => toolCompareTldPrices(args)
  );

  server.registerTool(
    'list_agent_skills',
    {
      title: 'List agent skills / layers',
      description:
        'L0 free research, L1 BYOK LLM, L2 guided purchase, L3 registrar BYOK (roadmap). Shows required headers.',
    },
    async () => toolListAgentSkills()
  );

  server.registerTool(
    'list_agent_registrars',
    {
      title: 'List agent-ready registrars',
      description:
        'All registrars with API register/DNS suitable for agents (BYOK ids, priority order, safety constraints).',
    },
    async () => toolListAgentRegistrars()
  );

  server.registerTool(
    'register_domain',
    {
      title: 'Register domain (L3 BYOK)',
      description:
        'Roadmap: register with user registrar keys + human confirm. Fails closed unless ADA_ENABLE_REGISTRAR_MUTATIONS is on and adapter is wired.',
      inputSchema: {
        domain: z.string().min(3),
        years: z.number().int().min(1).max(10).optional(),
        maxBudgetUsd: z.number().positive().optional(),
      },
    },
    async (args) => toolRegisterDomain(args)
  );

  server.registerTool(
    'set_dns_records',
    {
      title: 'Set DNS records (L3 BYOK)',
      description:
        'Roadmap: DNS mutation with BYOK + human confirm. Fails closed by default.',
      inputSchema: {
        domain: z.string().min(3),
        records: z
          .array(
            z.object({
              type: z.string(),
              name: z.string(),
              data: z.string(),
              ttl: z.number().optional(),
            })
          )
          .optional(),
      },
    },
    async (args) => toolSetDnsRecords(args)
  );

  server.registerResource(
    'product-facts',
    'domaindiscovery://facts',
    {
      title: 'DomainDiscovery product facts',
      description: 'Canonical product description for agents',
      mimeType: 'text/plain',
    },
    async () => ({
      contents: [
        {
          uri: 'domaindiscovery://facts',
          mimeType: 'text/plain',
          text: SITE_PRODUCT_FACTS,
        },
      ],
    })
  );

  server.registerPrompt(
    'brand_name_session',
    {
      title: 'Brand name session',
      description: 'How to help a user find brandable domains with DomainDiscovery tools',
    },
    async () => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: [
              'You are helping pick a domain with DomainDiscovery MCP tools.',
              '1) Clarify business, audience, style (brandable/keyword/geo), and preferred TLDs.',
              '2) Call find_brand_domains with a rich text brief.',
              '3) Present shortlist with scores/reasons; prefer available names.',
              '4) For taken/premium names, offer whois_lookup and alternatives via generate_domain_names.',
              '5) Remind the user DomainDiscovery is not a registrar and availability is a snapshot.',
            ].join('\n'),
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'local_business_domains',
    {
      title: 'Local business domains',
      description: 'Geo-focused domain research workflow',
    },
    async () => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: [
              'Help a local multi-location business with domains.',
              'Use generate_geo_domains for city patterns, then check_domain_availability and rank_domains,',
              'or find_brand_domains with style=geo and markets listed.',
              'Warn against thin doorway pages — only suggest domains they will operate.',
            ].join('\n'),
          },
        },
      ],
    })
  );

  return server;
}
