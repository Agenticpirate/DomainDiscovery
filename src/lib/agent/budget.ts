/**
 * Budget helpers — research filter only (not payment processing).
 */

import type { BudgetStatus, RankedDomain } from './types';

/** Parse price strings like "$12.99", "12.99 USD", "€10" → number or null */
export function parsePriceUsd(priceHint?: string | null): number | null {
  if (!priceHint || typeof priceHint !== 'string') return null;
  const cleaned = priceHint.replace(/,/g, '').trim();
  // Prefer $ amounts
  const dollar = cleaned.match(/\$\s*(\d+(?:\.\d+)?)/);
  if (dollar) return parseFloat(dollar[1]);
  const usd = cleaned.match(/(\d+(?:\.\d+)?)\s*USD/i);
  if (usd) return parseFloat(usd[1]);
  const plain = cleaned.match(/^(\d+(?:\.\d+)?)$/);
  if (plain) return parseFloat(plain[1]);
  return null;
}

export function budgetStatusFor(
  priceUsd: number | null | undefined,
  maxBudgetUsd?: number | null
): BudgetStatus {
  if (maxBudgetUsd == null || maxBudgetUsd <= 0) return 'unknown';
  if (priceUsd == null || Number.isNaN(priceUsd)) return 'unknown';
  return priceUsd <= maxBudgetUsd ? 'within' : 'over';
}

export function applyBudgetToRanked(
  ranked: RankedDomain[],
  maxBudgetUsd?: number | null
): RankedDomain[] {
  return ranked.map((r) => {
    const priceUsd = r.priceUsd ?? parsePriceUsd(r.priceHint);
    const budgetStatus = budgetStatusFor(priceUsd, maxBudgetUsd);
    const reasons = [...r.reasons];
    if (maxBudgetUsd && maxBudgetUsd > 0) {
      if (budgetStatus === 'within' && priceUsd != null) {
        reasons.unshift(`Within budget (≤ $${maxBudgetUsd}).`);
      } else if (budgetStatus === 'over' && priceUsd != null) {
        reasons.unshift(`Over budget: ~$${priceUsd} > $${maxBudgetUsd}.`);
      } else if (budgetStatus === 'unknown') {
        reasons.unshift(`Price unknown — re-check at registrar (budget cap $${maxBudgetUsd}).`);
      }
    }
    return {
      ...r,
      priceUsd: priceUsd ?? null,
      budgetStatus,
      reasons: reasons.slice(0, 6),
    };
  });
}

/** Prefer within-budget available, then unknown, then over */
export function sortByBudgetPreference(ranked: RankedDomain[]): RankedDomain[] {
  const rank = (b?: BudgetStatus) => (b === 'within' ? 0 : b === 'unknown' ? 1 : 2);
  return [...ranked].sort((a, b) => {
    const av = Number(b.available === true) - Number(a.available === true);
    if (av !== 0) return av;
    const br = rank(a.budgetStatus) - rank(b.budgetStatus);
    if (br !== 0) return br;
    return b.score - a.score;
  });
}
