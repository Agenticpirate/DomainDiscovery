/**
 * AI Domain Assistant chat protocol (humans + external agents).
 */

import type { AgentAutoResult, RankedDomain } from '@/lib/agent/types';
import type { IntakeState } from './intakeSession';

export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

export type ChatMessage = {
  role: ChatRole;
  content: string;
  toolCallId?: string;
  name?: string;
};

export type ChatClientMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatRequest = {
  messages: ChatClientMessage[];
  maxBudgetUsd?: number;
  skipAvailability?: boolean;
  client?: 'web' | 'agent' | 'mcp';
  sessionId?: string;
  /**
   * Guided intake state (multi-turn discovery).
   * Server merges replies; client may persist between turns.
   */
  intake?: Partial<IntakeState> | null;
  /** Force skip intake and rank immediately (agents with full brief) */
  skipIntake?: boolean;
};

export type ChatDomainResult = {
  shortlist: RankedDomain[];
  runnersUp?: RankedDomain[];
  stats?: AgentAutoResult['stats'];
  brief?: AgentAutoResult['brief'];
  disclaimer: string;
};

export type ChatResponse = {
  success: boolean;
  message: string;
  engine: 'spacexai' | 'rules' | 'hybrid';
  domains?: ChatDomainResult;
  suggestions?: string[];
  actions?: { type: string; detail: string }[];
  sessionId?: string;
  /** Updated intake for multi-turn discovery */
  intake?: IntakeState | null;
  /** true when still collecting prefs */
  awaitingIntake?: boolean;
  error?: string;
};

export const ADA_CHAT_SYSTEM = `You are AI Domain Assistant (ADA) on aidomainassistant.com — a domain research co-pilot for founders and AI agents.

## Mission
Help users find brandable domain names that match their business. Research only — never register domains, invent prices, or give trademark legal advice.

## Discovery flow (required for incomplete briefs)
Before calling find_brand_domains, collect (or confirm) when missing:
1. Business description
2. Preferred extensions / TLDs (.com, .io, …)
3. Keywords to INCLUDE in the name
4. Keywords to AVOID
5. Naming strategies — especially the **radio test** (easy to say/spell over the phone), plus brandable, keyword/SEO, short, no hyphen, no numbers, .com priority, available-first, geo, premium OK
6. Budget (maxBudgetUsd) when relevant

If the user already provided everything in one message, call find_brand_domains with full parameters.
If incomplete, ask the next missing question clearly (one step at a time). Do not invent prefs.

## Ranking strategies (pass as strategies array)
available_first, radio_test, brandable, keyword_exact, short, easy_spell, no_hyphen, no_numbers, geo_local, com_priority, premium_ok

## Tools
- find_brand_domains: pass text, preferredTlds, mustInclude, avoid, strategies, maxBudgetUsd, count
- explain_agent_access: MCP / REST / chat integration

## Constraints
- Prefer AVAILABLE registrable names over ultra-premium aftermarket unless premium_ok.
- Industry-aligned names (gym ≠ random getXly tech glue).
- Not a registrar; human confirms purchase.
- Be premium, clear, honest.`;
