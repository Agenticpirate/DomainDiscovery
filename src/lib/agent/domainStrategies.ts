/**
 * Domain registration / naming strategies used by ADA chat + ranker.
 * "Radio test" = can you say it over the phone and the other person types it correctly?
 */

export type DomainNamingStrategy =
  | 'available_first'
  | 'radio_test'
  | 'brandable'
  | 'keyword_exact'
  | 'short'
  | 'easy_spell'
  | 'no_hyphen'
  | 'no_numbers'
  | 'geo_local'
  | 'premium_ok'
  | 'com_priority';

export type StrategyMeta = {
  id: DomainNamingStrategy;
  label: string;
  short: string;
  description: string;
  /** How ranker weights this strategy */
  rankHint: string;
};

export const DOMAIN_STRATEGIES: StrategyMeta[] = [
  {
    id: 'available_first',
    label: 'Available to register first',
    short: 'Open names',
    description: 'Prefer domains you can register now over aftermarket / ultra-premium.',
    rankHint: 'Boost available non-premium; demote taken/premium',
  },
  {
    id: 'radio_test',
    label: 'Radio test',
    short: 'Radio',
    description:
      'Say it once over the phone — the other person should spell it without asking. Short, phonetic, no awkward letter clusters.',
    rankHint: 'Pronounceable, vowel balance, no triple consonants, no digits',
  },
  {
    id: 'brandable',
    label: 'Brandable',
    short: 'Brand',
    description: 'Invented or compound names that feel like a brand (Stripe, Peloton energy).',
    rankHint: 'Brandability score weight up; pure dictionary keyword less required',
  },
  {
    id: 'keyword_exact',
    label: 'Keyword / SEO',
    short: 'Keyword',
    description: 'Include clear industry or service words for search clarity.',
    rankHint: 'Keyword + mustInclude hits heavily weighted',
  },
  {
    id: 'short',
    label: 'Short names',
    short: 'Short',
    description: 'Prefer 4–10 character labels when possible.',
    rankHint: 'Length score weight up; penalize long compounds',
  },
  {
    id: 'easy_spell',
    label: 'Easy to spell',
    short: 'Spell',
    description: 'Avoid creative misspellings and confusing letter doubles.',
    rankHint: 'Penalize repeated letters, rare digraphs, leetspeak',
  },
  {
    id: 'no_hyphen',
    label: 'No hyphens',
    short: 'No -',
    description: 'Reject or demote hyphenated names.',
    rankHint: 'Hard penalty for hyphens',
  },
  {
    id: 'no_numbers',
    label: 'No numbers',
    short: 'No #',
    description: 'Reject or demote digits in the name.',
    rankHint: 'Hard penalty for digits',
  },
  {
    id: 'geo_local',
    label: 'Geo / local',
    short: 'Geo',
    description: 'City or region + niche patterns for local businesses.',
    rankHint: 'Boost market tokens in label',
  },
  {
    id: 'com_priority',
    label: '.com priority',
    short: '.com',
    description: 'Strongly prefer .com over alternate TLDs.',
    rankHint: 'Extra boost for .com preferred list order',
  },
  {
    id: 'premium_ok',
    label: 'Premium aftermarket OK',
    short: 'Premium OK',
    description: 'Allow high-value aftermarket names if budget allows.',
    rankHint: 'Reduce premium demotion',
  },
];

export const DEFAULT_STRATEGIES: DomainNamingStrategy[] = [
  'available_first',
  'radio_test',
  'brandable',
  'com_priority',
  'no_hyphen',
  'no_numbers',
];

export function strategyById(id: DomainNamingStrategy): StrategyMeta | undefined {
  return DOMAIN_STRATEGIES.find((s) => s.id === id);
}

export function normalizeStrategies(
  input?: DomainNamingStrategy[] | string[]
): DomainNamingStrategy[] {
  if (!input?.length) return [...DEFAULT_STRATEGIES];
  const allowed = new Set(DOMAIN_STRATEGIES.map((s) => s.id));
  const out: DomainNamingStrategy[] = [];
  for (const raw of input) {
    const id = String(raw).toLowerCase().replace(/\s+/g, '_') as DomainNamingStrategy;
    if (allowed.has(id) && !out.includes(id)) out.push(id);
  }
  if (!out.includes('available_first')) out.unshift('available_first');
  return out.length ? out : [...DEFAULT_STRATEGIES];
}

/** Simple pronounceability / radio-test score 0–100 */
export function scoreRadioTest(label: string): number {
  let score = 72;
  const lab = label.toLowerCase();
  if (lab.length < 3) return 20;
  if (lab.length > 14) score -= 25;
  else if (lab.length > 11) score -= 12;
  else if (lab.length >= 5 && lab.length <= 9) score += 12;

  if (lab.includes('-')) score -= 40;
  if (/\d/.test(lab)) score -= 35;
  if (/(.)\1{2,}/.test(lab)) score -= 20;
  if (/[bcdfghjklmnpqrstvwxz]{4,}/i.test(lab)) score -= 25;
  if (/[bcdfghjklmnpqrstvwxz]{3}/i.test(lab)) score -= 10;

  const vowels = (lab.match(/[aeiouy]/g) || []).length;
  const ratio = vowels / lab.length;
  if (ratio < 0.18) score -= 25;
  else if (ratio > 0.55) score -= 8;
  else score += 12;

  // Syllable-ish chunks (vowel groups)
  const chunks = lab.replace(/[^a-z]/g, '').split(/[aeiouy]+/).filter(Boolean);
  if (chunks.length >= 2 && chunks.length <= 4) score += 8;

  // Hard-to-spell letter pairs over phone
  if (/ph|ough|eigh|que|x{2}|yy/i.test(lab)) score -= 15;

  return Math.max(0, Math.min(100, score));
}

export function scoreEasySpell(label: string): number {
  let score = 80;
  if (/[0-9]/.test(label)) score -= 30;
  if (label.includes('-')) score -= 25;
  if (/(.)\1{1,}/.test(label) && !/ll|ss|ee|oo|tt|ff/.test(label)) score -= 10;
  if (/q[^u]|x{2}|zz|yy/i.test(label)) score -= 15;
  if (label.length <= 10) score += 10;
  return Math.max(0, Math.min(100, score));
}

/** Parse strategy mentions from free text */
export function parseStrategiesFromText(text: string): DomainNamingStrategy[] {
  const t = text.toLowerCase();
  const found: DomainNamingStrategy[] = [];
  const add = (s: DomainNamingStrategy) => {
    if (!found.includes(s)) found.push(s);
  };

  if (/\bradio\b|phone test|pronounce|say it|spoken/.test(t)) add('radio_test');
  if (/\bbrandable\b|invented|coined/.test(t)) add('brandable');
  if (/\bkeyword\b|\bseo\b|exact match|exact-match/.test(t)) add('keyword_exact');
  if (/\bshort\b|minimal|tiny name/.test(t)) add('short');
  if (/\beasy to spell\b|spellable|simple spelling/.test(t)) add('easy_spell');
  if (/\bno hyphen|without hyphen|no dash/.test(t)) add('no_hyphen');
  if (/\bno number|without number|no digit/.test(t)) add('no_numbers');
  if (/\bgeo\b|local seo|city name|location/.test(t)) add('geo_local');
  if (/\b\.com only\b|prefer \.com|com priority|only \.com/.test(t)) add('com_priority');
  if (/\bpremium ok\b|aftermarket|buy premium|premium fine/.test(t)) add('premium_ok');
  if (/\bavailable first\b|registrable|not premium|avoid aftermarket/.test(t)) add('available_first');

  return found;
}
