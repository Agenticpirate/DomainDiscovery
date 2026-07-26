import type { AgentAutoResult, AgentJobStep, DomainStyle } from '@/lib/agent/types';
import type { DomainNamingStrategy } from '@/lib/agent/domainStrategies';
import { DEFAULT_STRATEGIES } from '@/lib/agent/domainStrategies';

/** Display / input currency for the research budget (converted to USD for the API) */
export type BudgetCurrency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';

export const BUDGET_CURRENCIES: {
  code: BudgetCurrency;
  label: string;
  symbol: string;
  /** Approximate units of currency per 1 USD — research filter only */
  toUsd: number;
}[] = [
  { code: 'USD', label: 'US Dollar', symbol: '$', toUsd: 1 },
  { code: 'EUR', label: 'Euro', symbol: '€', toUsd: 1.08 },
  { code: 'GBP', label: 'British Pound', symbol: '£', toUsd: 1.27 },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', toUsd: 0.012 },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$', toUsd: 0.74 },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$', toUsd: 0.66 },
];

export function budgetToUsd(amount: number, currency: BudgetCurrency): number {
  const row = BUDGET_CURRENCIES.find((c) => c.code === currency) || BUDGET_CURRENCIES[0];
  return Math.max(1, Math.round(amount * row.toUsd * 100) / 100);
}

export type AssistantFormState = {
  text: string;
  style: DomainStyle;
  count: number;
  preferredTlds: string[];
  markets: string;
  liveCheck: boolean;
  /** Max registration budget in the selected currency */
  maxBudgetUsd: number;
  /** Currency for maxBudgetUsd input (converted to USD server-side) */
  budgetCurrency: BudgetCurrency;
  /** Comma-separated keywords to include */
  mustInclude: string;
  /** Comma-separated keywords to avoid */
  avoid: string;
  /** Active ranking / registration strategies */
  strategies: DomainNamingStrategy[];
};

export type AssistantRunState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  steps: AgentJobStep[];
  result: AgentAutoResult | null;
  error: string | null;
  jobId: string | null;
};

export const DEFAULT_FORM: AssistantFormState = {
  text: '',
  style: 'mixed',
  count: 10,
  preferredTlds: ['.com', '.ai', '.io', '.co'],
  markets: '',
  liveCheck: true,
  maxBudgetUsd: 20,
  budgetCurrency: 'USD',
  mustInclude: '',
  avoid: '',
  strategies: [...DEFAULT_STRATEGIES],
};

export const EXAMPLE_PROMPTS = [
  'AI scheduling SaaS for dental clinics that need automated appointments',
  'Eco-friendly meal kit delivery for busy families in major US cities',
  'Local plumber serving Austin homes with emergency and remodel services',
  'B2B analytics platform for e-commerce brands tracking ad spend ROI',
];

export const TLD_OPTIONS = ['.com', '.ai', '.io', '.co', '.app', '.dev', '.net'];
