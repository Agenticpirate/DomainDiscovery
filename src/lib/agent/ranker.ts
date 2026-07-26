/**
 * Deterministic domain ranker — industry fit + available-first.
 * Availability is never invented here; pass checked status from tools.
 *
 * Policy:
 * 1. Available-to-register domains outrank aftermarket / premium
 * 2. Off-category names (weak industry fit) are penalized hard
 * 3. Ultra-premium aftermarket is deprioritized unless budgetHint === premium_ok
 */

import type { DomainBrief, RankedDomain, ScoreBreakdown } from './types';
import { detectVertical, scoreIndustryFit, REQUEST_META_WORDS } from './brandNamingKnowledge';
import {
  isGenericKeywordMashup,
  scoreInventedBrandability,
} from './brandBrain';
import {
  normalizeStrategies,
  scoreEasySpell,
  scoreRadioTest,
  type DomainNamingStrategy,
} from './domainStrategies';

const FAMOUS_BRAND_FRAGMENTS = [
  'google', 'amazon', 'apple', 'microsoft', 'facebook', 'meta', 'netflix',
  'tesla', 'uber', 'airbnb', 'openai', 'chatgpt', 'instagram', 'tiktok',
  'youtube', 'twitter', 'linkedin', 'paypal', 'stripe', 'shopify',
  'peloton', 'crossfit', 'equinox', 'planetfitness',
];

function labelOf(domain: string): string {
  const d = domain.toLowerCase().trim();
  const i = d.indexOf('.');
  return i === -1 ? d : d.slice(0, i);
}

function tldOf(domain: string): string {
  const d = domain.toLowerCase().trim();
  const i = d.indexOf('.');
  return i === -1 ? '' : d.slice(i);
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function scoreLength(label: string): number {
  const len = label.length;
  if (len >= 5 && len <= 10) return 100;
  if (len >= 4 && len <= 12) return 90;
  if (len >= 3 && len <= 14) return 75;
  if (len <= 16) return 55;
  if (len <= 20) return 35;
  return 15;
}

function scoreBrandability(label: string): number {
  // Prefer Brand Brain inventiveness; kill generic industry mashups hard
  if (isGenericKeywordMashup(label)) return 8;
  let score = scoreInventedBrandability(label);
  if (label.includes('-')) score -= 35;
  if (/\d/.test(label)) score -= 25;
  // Meta labels are never brandable for a real business
  if (REQUEST_META_WORDS.has(label)) score -= 40;
  return clamp(score);
}

function scoreTldFit(tld: string, brief: DomainBrief): number {
  const preferred = brief.preferredTlds.map((t) => (t.startsWith('.') ? t : `.${t}`).toLowerCase());
  const t = tld.startsWith('.') ? tld.toLowerCase() : `.${tld.toLowerCase()}`;
  if (preferred.includes(t)) {
    if (t === '.com') return 100;
    if (t === '.fit' || t === '.club' || t === '.gym') return 90;
    if (t === '.ai' || t === '.io') return 88;
    return 85;
  }
  if (t === '.com') return 92; // always strong for registrable brands
  if (['.co', '.app', '.dev', '.net', '.org'].includes(t)) return 70;
  if (brief.style === 'geo' && t.length === 3) return 75;
  return 40;
}

function scoreKeywordFit(label: string, brief: DomainBrief): number {
  const tokens = new Set(
    [
      ...brief.keywords,
      brief.businessName || '',
      brief.industry || '',
      ...brief.description.toLowerCase().split(/[^a-z0-9]+/),
    ]
      .map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter((t) => t.length >= 3 && !REQUEST_META_WORDS.has(t))
  );

  let hits = 0;
  for (const t of Array.from(tokens)) {
    if (t.length >= 3 && label.includes(t)) hits += 1;
  }

  if (brief.style === 'brandable') {
    // True brandables often have ZERO keyword hits — that is good (Everlane-style)
    // Only lightly reward keyword glue; mashups are penalized elsewhere
    if (hits === 0) return 72;
    if (hits === 1) return 58; // one keyword is ok; two glued industry nouns is worse
    return 35;
  }

  if (hits === 0) return 18;
  if (hits === 1) return 82;
  if (hits === 2) return 95;
  return 90;
}

function hasStrategy(strategies: DomainNamingStrategy[], id: DomainNamingStrategy): boolean {
  return strategies.includes(id);
}

/**
 * Available-to-register first. Premium aftermarket is demoted unless premium_ok strategy.
 */
function availabilityBoost(
  available: boolean | null,
  premium: boolean | undefined,
  budgetHint: DomainBrief['budgetHint'],
  strategies: DomainNamingStrategy[]
): number {
  const premiumOk =
    budgetHint === 'premium_ok' || hasStrategy(strategies, 'premium_ok');
  if (available === true && !premium) return 100;
  if (available === true && premium) {
    return premiumOk ? 70 : 45;
  }
  if (premium && available !== true) {
    return premiumOk ? 42 : 18;
  }
  if (available === false) return 12;
  return 48;
}

/** Extra score from active naming strategies (0–100 blended later) */
function scoreStrategyFit(
  label: string,
  tld: string,
  brief: DomainBrief,
  strategies: DomainNamingStrategy[]
): { score: number; notes: string[] } {
  const notes: string[] = [];
  let sum = 0;
  let n = 0;
  const add = (v: number, note?: string) => {
    sum += v;
    n += 1;
    if (note && v >= 70) notes.push(note);
  };

  if (hasStrategy(strategies, 'radio_test')) {
    const r = scoreRadioTest(label);
    add(r, r >= 75 ? 'Passes radio test (easy to say/spell aloud).' : undefined);
  }
  if (hasStrategy(strategies, 'easy_spell')) {
    add(scoreEasySpell(label));
  }
  if (hasStrategy(strategies, 'short')) {
    const maxLen = brief.maxLabelLength || 10;
    if (label.length <= maxLen) add(100, `Short label (${label.length} chars).`);
    else if (label.length <= maxLen + 3) add(55);
    else add(20);
  }
  if (hasStrategy(strategies, 'brandable')) {
    add(scoreBrandability(label));
  }
  if (hasStrategy(strategies, 'keyword_exact')) {
    add(scoreKeywordFit(label, brief));
  }
  if (hasStrategy(strategies, 'com_priority')) {
    add(tld === '.com' ? 100 : 35, tld === '.com' ? '.com priority match.' : undefined);
  }
  if (hasStrategy(strategies, 'geo_local') && brief.markets?.length) {
    let geo = 30;
    for (const m of brief.markets) {
      const x = m.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (x.length >= 3 && label.includes(x)) {
        geo = 100;
        notes.push(`Includes market “${m}”.`);
        break;
      }
    }
    add(geo);
  }
  if (hasStrategy(strategies, 'no_hyphen')) {
    add(label.includes('-') ? 0 : 100);
  }
  if (hasStrategy(strategies, 'no_numbers')) {
    add(/\d/.test(label) ? 0 : 100);
  }

  if (n === 0) return { score: 50, notes };
  return { score: clamp(Math.round(sum / n)), notes };
}

function collectRiskFlags(
  domain: string,
  brief: DomainBrief,
  industryFit: number
): string[] {
  const label = labelOf(domain);
  const flags: string[] = [];
  if (label.includes('-')) flags.push('hyphen');
  if (/\d/.test(label)) flags.push('numbers');
  if (label.length > 18) flags.push('very_long');
  if (label.length < 3) flags.push('too_short');
  if (industryFit < 30) flags.push('off_category');
  if (REQUEST_META_WORDS.has(label)) flags.push('meta_name');
  for (const brand of FAMOUS_BRAND_FRAGMENTS) {
    if (label.includes(brand)) {
      flags.push(`lookalike:${brand}`);
      break;
    }
  }
  for (const a of brief.avoid || []) {
    const x = a.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (x && label.includes(x)) flags.push(`avoid:${x}`);
  }
  return flags;
}

function buildReasons(
  domain: string,
  breakdown: ScoreBreakdown,
  available: boolean | null,
  premium: boolean | undefined,
  industryFit: number,
  strategyNotes: string[]
): string[] {
  const reasons: string[] = [];
  const label = labelOf(domain);
  const tld = tldOf(domain);

  if (available === true && !premium) {
    reasons.push('Available to register (snapshot) — first preference over aftermarket.');
  } else if (available === true && premium) {
    reasons.push('Listed available but may be registry-premium pricing — confirm cost.');
  } else if (premium) {
    reasons.push('Aftermarket / premium sale — not first preference; confirm price.');
  } else if (available === false) {
    reasons.push('Likely registered — aftermarket or pick an available alternate.');
  } else {
    reasons.push('Availability not checked.');
  }

  for (const n of strategyNotes.slice(0, 2)) reasons.push(n);

  if (isGenericKeywordMashup(label)) {
    reasons.push('Generic industry mashup — weak as a brandable name.');
  }
  if (industryFit >= 70) reasons.push('Strong category fit for this business type.');
  else if (industryFit >= 45) reasons.push('Reasonable alignment with industry language.');
  else if (industryFit < 30 && breakdown.brandability >= 70) {
    reasons.push('Invented brandable feel — not a keyword mashup.');
  } else if (industryFit < 30) {
    reasons.push('Weak category fit — may feel random for this business.');
  }

  if (breakdown.length >= 90) reasons.push(`Strong length (${label.length} chars).`);
  else if (breakdown.length < 50) reasons.push('Longer name may be harder to type and remember.');

  if (breakdown.brandability >= 85) reasons.push('Clean invented brandable pattern.');
  if (breakdown.keywordFit >= 80) reasons.push('Aligns with business keywords.');
  if (tld === '.com') reasons.push('.com — default trust TLD for most brands.');
  if (breakdown.tldFit >= 90 && tld !== '.com') reasons.push(`${tld} matches preferred extensions.`);

  for (const f of breakdown.riskFlags) {
    if (f.startsWith('lookalike:')) reasons.push('Risk: may resemble a well-known brand — review carefully.');
    if (f === 'hyphen') reasons.push('Hyphens reduce type-in and look less premium.');
    if (f === 'numbers') reasons.push('Numbers can confuse spelling (word vs digit).');
    if (f === 'off_category') reasons.push('Name language does not match the business category.');
    if (f === 'meta_name') reasons.push('Looks like a request word, not a brand.');
    if (f.startsWith('avoid:')) reasons.push(`Contains avoided term (${f.slice(6)}).`);
  }

  return reasons.slice(0, 7);
}

export function scoreDomain(
  domain: string,
  brief: DomainBrief,
  meta?: { available?: boolean | null; premium?: boolean; priceHint?: string; buyUrl?: string }
): RankedDomain {
  const label = labelOf(domain);
  const tld = tldOf(domain);
  const available = meta?.available ?? null;
  const premium = meta?.premium;
  const strategies = normalizeStrategies(brief.strategies);
  const vertical = detectVertical(brief.description, brief.keywords);
  const industryFit = scoreIndustryFit(label, vertical, brief.keywords);
  const riskFlags = collectRiskFlags(domain, brief, industryFit);
  const strategyFit = scoreStrategyFit(label, tld, brief, strategies);

  // Strategy hard filters (still ranked low rather than dropped for transparency)
  if (hasStrategy(strategies, 'no_hyphen') && label.includes('-')) {
    riskFlags.push('hyphen');
  }
  if (hasStrategy(strategies, 'no_numbers') && /\d/.test(label)) {
    riskFlags.push('numbers');
  }

  const premiumOk =
    brief.budgetHint === 'premium_ok' || hasStrategy(strategies, 'premium_ok');

  const breakdown: ScoreBreakdown = {
    brandability: scoreBrandability(label),
    length: scoreLength(label),
    tldFit: scoreTldFit(tld, brief),
    keywordFit: scoreKeywordFit(label, brief),
    availabilityBoost: availabilityBoost(available, premium, brief.budgetHint, strategies),
    riskFlags,
  };

  // Weights: brandable style → inventiveness + available; keyword style → industry language
  const brandableMode =
    brief.style === 'brandable' || hasStrategy(strategies, 'brandable');
  const keywordW = hasStrategy(strategies, 'keyword_exact')
    ? 0.22
    : brandableMode
      ? 0.06
      : 0.12;
  const brandW = brandableMode ? 0.28 : hasStrategy(strategies, 'brandable') ? 0.14 : 0.1;
  const availW = hasStrategy(strategies, 'available_first') ? 0.26 : 0.18;
  const strategyW = 0.14;
  const industryW = brandableMode ? 0.08 : 0.16;
  const tldW = hasStrategy(strategies, 'com_priority') ? 0.1 : 0.08;
  const lengthW = hasStrategy(strategies, 'short') ? 0.1 : 0.06;

  let score =
    breakdown.brandability * brandW +
    breakdown.length * lengthW +
    breakdown.tldFit * tldW +
    breakdown.keywordFit * keywordW +
    industryFit * industryW +
    breakdown.availabilityBoost * availW +
    strategyFit.score * strategyW;

  score -= riskFlags.length * 7;
  if (riskFlags.some((f) => f.startsWith('lookalike:'))) score -= 22;
  if (riskFlags.includes('off_category') && !brandableMode) score -= 25;
  if (riskFlags.includes('meta_name')) score -= 30;
  if (riskFlags.some((f) => f.startsWith('avoid:'))) score -= 35;
  // Hard kill generic mashups (clothingthread, cartcloth…)
  if (isGenericKeywordMashup(label)) score -= 55;

  if (premium && available !== true && !premiumOk) {
    score -= 18;
  }
  if (available === true && !premium && tld === '.com') {
    score += hasStrategy(strategies, 'com_priority') ? 12 : 8;
  }

  // mustInclude boosts
  let mustHits = 0;
  for (const m of brief.mustInclude || []) {
    const x = m.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (x && label.includes(x)) {
      mustHits += 1;
      score += hasStrategy(strategies, 'keyword_exact') ? 14 : 10;
    }
  }
  // Missing required include words when strategy is keyword_exact
  if (
    hasStrategy(strategies, 'keyword_exact') &&
    (brief.mustInclude?.length || 0) > 0 &&
    mustHits === 0
  ) {
    score -= 20;
  }

  score = clamp(Math.round(score));

  return {
    domain: domain.toLowerCase(),
    available,
    premium,
    priceHint: meta?.priceHint,
    score,
    breakdown,
    reasons: buildReasons(
      domain,
      breakdown,
      available,
      premium,
      industryFit,
      strategyFit.notes
    ),
    buyUrl: meta?.buyUrl,
  };
}

export function rankDomains(
  candidates: Array<{
    domain: string;
    available?: boolean | null;
    premium?: boolean;
    priceHint?: string;
    buyUrl?: string;
  }>,
  brief: DomainBrief
): RankedDomain[] {
  const seen = new Set<string>();
  const ranked: RankedDomain[] = [];

  for (const c of candidates) {
    const d = c.domain.toLowerCase().trim();
    if (!d || !d.includes('.') || seen.has(d)) continue;
    seen.add(d);
    ranked.push(
      scoreDomain(d, brief, {
        available: c.available ?? null,
        premium: c.premium,
        priceHint: c.priceHint,
        buyUrl: c.buyUrl,
      })
    );
  }

  ranked.sort((a, b) => {
    // 1) Available non-premium first
    const aOpen = a.available === true && !a.premium ? 1 : 0;
    const bOpen = b.available === true && !b.premium ? 1 : 0;
    if (bOpen !== aOpen) return bOpen - aOpen;

    // 2) Any available next
    const av = Number(b.available === true) - Number(a.available === true);
    if (av !== 0) return av;

    // 3) Non-premium before aftermarket premium (unless premium_ok strategy)
    const strategies = normalizeStrategies(brief.strategies);
    const premiumOk =
      brief.budgetHint === 'premium_ok' || strategies.includes('premium_ok');
    if (!premiumOk) {
      const ap = a.premium ? 1 : 0;
      const bp = b.premium ? 1 : 0;
      if (ap !== bp) return ap - bp;
    }

    // 4) Score
    return b.score - a.score;
  });

  return ranked;
}
