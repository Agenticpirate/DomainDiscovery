/**
 * Deterministic heuristic domain value estimate. Pure: same input, same output.
 * This is a rough range from public signals, not an appraisal.
 */

export const VALUE_DISCLAIMER =
  'Estimate, not a professional appraisal. Real prices depend on buyers, traffic, trademarks and negotiation.';

export type ValueFactor = { label: string; effect: 'positive' | 'negative' | 'neutral'; detail: string };

export type DomainValueEstimate = {
  domain: string;
  low: number;
  high: number;
  midpoint: number;
  score: number;
  factors: ValueFactor[];
  disclaimer: string;
};

const TLD_BASE: Record<string, number> = {
  com: 1500,
  ai: 1200,
  io: 900,
  co: 500,
  net: 400,
  org: 400,
  app: 350,
  dev: 300,
};
const DEFAULT_TLD_BASE = 80;

const COMMON_WORDS = new Set(
  (
    'ace air app art auto bank bar bay bike bio blog blue book box brain brand build buy cafe car card care cash chat city ' +
    'cloud club code coin cool craft credit crypto data deal design dev dog doc domain drive eco edu energy fast film fit ' +
    'fix flow food fresh fun game gift gold good green grow health home host hub idea jobs kids lab law learn legal life ' +
    'link live loan love mail map market media money music net news nice note online open page pay pet photo pixel play ' +
    'plus pro quick rent rocket safe sale school search shop smart snap soft solar space sport star start stock store ' +
    'studio sun swift tax team tech time tour toy trade travel tree trip trust video view web wine wise work world yoga zen zone'
  ).split(' ')
);

const AGE_BONUS_PER_YEAR = 0.04;
const AGE_BONUS_CAP = 1.5;

function lengthMultiplier(len: number): number {
  if (len <= 3) return 8;
  if (len === 4) return 5;
  if (len === 5) return 3;
  if (len === 6) return 2;
  if (len === 7) return 1.3;
  if (len === 8) return 1;
  if (len <= 10) return 0.7;
  if (len <= 14) return 0.4;
  return 0.2;
}

function roundNice(n: number): number {
  if (n < 100) return Math.max(10, Math.round(n / 5) * 5);
  if (n < 1000) return Math.round(n / 10) * 10;
  if (n < 10000) return Math.round(n / 50) * 50;
  return Math.round(n / 500) * 500;
}

/** `domain` must already be normalized (lowercase, e.g. "example.com"). */
export function estimateDomainValue(domain: string, opts: { ageYears?: number | null } = {}): DomainValueEstimate {
  const labels = domain.toLowerCase().split('.').filter(Boolean);
  const tld = labels.length > 1 ? labels[labels.length - 1] : '';
  const sld = labels.length > 1 ? labels[labels.length - 2] : labels[0] ?? '';
  const factors: ValueFactor[] = [];

  const tldBase = TLD_BASE[tld] ?? DEFAULT_TLD_BASE;
  let value = tldBase;
  factors.push(
    TLD_BASE[tld]
      ? { label: `.${tld} extension`, effect: 'positive', detail: 'High-demand extension with a deep resale market.' }
      : { label: `.${tld || 'unknown'} extension`, effect: 'negative', detail: 'Lower-demand extension; fewer end-user buyers.' }
  );

  const len = sld.length;
  const lenMult = lengthMultiplier(len);
  value *= lenMult;
  factors.push({
    label: `${len} character name`,
    effect: lenMult > 1 ? 'positive' : lenMult < 1 ? 'negative' : 'neutral',
    detail: lenMult > 1 ? 'Short names are scarce and easy to remember.' : lenMult < 1 ? 'Longer names are harder to type and recall.' : 'Average length.',
  });

  if (sld.includes('-')) {
    value *= 0.4;
    factors.push({ label: 'Hyphen in name', effect: 'negative', detail: 'Hyphens are harder to say aloud and lower resale appeal.' });
  }
  if (/\d/.test(sld)) {
    value *= 0.5;
    factors.push({ label: 'Digits in name', effect: 'negative', detail: 'Numbers are easily misheard and usually reduce brandability.' });
  }
  if (COMMON_WORDS.has(sld)) {
    value *= 2.5;
    factors.push({ label: 'Common dictionary word', effect: 'positive', detail: 'Real words are brandable and attract more buyers.' });
  }

  const age = opts.ageYears;
  if (typeof age === 'number' && age > 0) {
    const mult = Math.min(AGE_BONUS_CAP, 1 + age * AGE_BONUS_PER_YEAR);
    value *= mult;
    factors.push({ label: `Registered ${age.toFixed(1)} years ago`, effect: 'positive', detail: 'Older registrations add a small credibility bonus.' });
  }

  const midpoint = roundNice(value);
  const low = roundNice(value * 0.6);
  const high = roundNice(value * 1.6);
  const score = Math.round(Math.min(100, Math.max(0, (Math.log10(Math.max(midpoint, 1)) - 1) * 25)));

  return { domain: labels.join('.'), low, high, midpoint, score, factors, disclaimer: VALUE_DISCLAIMER };
}
