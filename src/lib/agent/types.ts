/**
 * AI Domain Assistant — shared types for auto mode, chat, and MCP tools.
 */

import type { DomainNamingStrategy } from './domainStrategies';

export type DomainStyle = 'brandable' | 'keyword' | 'mixed' | 'geo';

export type BudgetHint = 'cheap' | 'standard' | 'premium_ok';

export type { DomainNamingStrategy };

export type DomainBrief = {
  businessName?: string;
  /** Free-text description of what the business does */
  description: string;
  audience?: string;
  industry?: string;
  keywords: string[];
  style: DomainStyle;
  /** Countries / cities for geo mode */
  markets?: string[];
  preferredTlds: string[];
  /** Words that should appear in the domain when possible */
  mustInclude?: string[];
  /** Words / fragments to never use */
  avoid?: string[];
  /**
   * Naming / registration strategies that drive ranking
   * (radio test, brandable, keyword, short, available_first, …)
   */
  strategies?: DomainNamingStrategy[];
  /** Soft max label length when strategy includes short */
  maxLabelLength?: number;
  budgetHint?: BudgetHint;
  /** Target shortlist size (available-first) */
  count: number;
  /** Max registration budget in USD (research filter; not a payment) */
  maxBudgetUsd?: number;
};

export type BudgetStatus = 'within' | 'over' | 'unknown';


export type ScoreBreakdown = {
  brandability: number;
  length: number;
  tldFit: number;
  keywordFit: number;
  availabilityBoost: number;
  riskFlags: string[];
};

export type RankedDomain = {
  domain: string;
  available: boolean | null;
  premium?: boolean;
  priceHint?: string;
  /** Parsed annual/create price when known */
  priceUsd?: number | null;
  budgetStatus?: BudgetStatus;
  score: number;
  breakdown: ScoreBreakdown;
  reasons: string[];
  buyUrl?: string;
};

export type AgentJobStatus = 'queued' | 'running' | 'completed' | 'failed';

export type AgentJobStep = {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  detail?: string;
  at: string;
};

export type AgentAutoResult = {
  brief: DomainBrief;
  shortlist: RankedDomain[];
  runnersUp: RankedDomain[];
  rejected: RankedDomain[];
  overBudget: RankedDomain[];
  stats: {
    candidatesGenerated: number;
    candidatesChecked: number;
    availableCount: number;
    durationMs: number;
    refineLoops: number;
    maxBudgetUsd?: number;
    withinBudgetCount: number;
  };
  nextActions: string[];
  disclaimer: string;
};

export type AgentJob = {
  id: string;
  status: AgentJobStatus;
  createdAt: string;
  updatedAt: string;
  steps: AgentJobStep[];
  result?: AgentAutoResult;
  error?: string;
};

export type AgentAutoRequest = {
  /** Free-text business brief (preferred for auto mode) */
  text?: string;
  /** Structured brief override / merge */
  brief?: Partial<DomainBrief>;
  /** Max registration budget USD (filters / flags results) */
  maxBudgetUsd?: number;
  /** Skip live availability (rank only) — tests / offline */
  skipAvailability?: boolean;
  /** Sync response (no job poll) — default true for small jobs */
  sync?: boolean;
};

export const AGENT_DISCLAIMER =
  'Availability is a snapshot and can change. DomainDiscovery is not a registrar — registration and payment happen at a third-party registrar. Rankings are research signals, not legal trademark advice.';
