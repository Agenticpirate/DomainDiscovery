/**
 * Brand naming knowledge for domain generation & ranking.
 *
 * Patterns distilled from:
 * - Real brand patterns (Peloton, CrossFit, OrangeTheory, Planet Fitness, Equinox…)
 * - Fitness / gym naming corpora (iron, forge, pulse, core, strength, apex…)
 * - Marketplace / brandable domain sales patterns (short, evocative, result-oriented
 *   compounds like StriveBolt, Fit.Fast — used as *structure* inspiration, not as
 *   aftermarket targets)
 * - Prefer registrable, on-category names over ultra-premium aftermarket guesses
 *
 * This is rules knowledge, not a trained LLM — keeps names aligned to industry.
 * Open-source free branding pack: openSourceBrandKnowledge.ts + data/brand-knowledge/
 */

import {
  expandKeywordsOpenSource,
  generateOpenSourceLabels,
} from './openSourceBrandKnowledge';

export type VerticalId =
  | 'fitness'
  | 'saas'
  | 'food'
  | 'health'
  | 'finance'
  | 'education'
  | 'ecommerce'
  | 'creative'
  | 'local_services'
  | 'general';

export type VerticalLexicon = {
  id: VerticalId;
  /** Match brief text / keywords */
  triggers: string[];
  /** Core category nouns / brand roots (high signal) */
  roots: string[];
  /** Evocative modifiers (energy, quality, place) */
  modifiers: string[];
  /** Result / outcome words successful brands use */
  results: string[];
  /** Industry-safe suffixes (not random tech glue) */
  suffixes: string[];
  /** Prefer these TLDs after .com */
  tldBoost: string[];
  /** Meta words to ignore when extracting intent */
  noise?: string[];
};

/** Words that describe the *request*, not the brand */
export const REQUEST_META_WORDS = new Set([
  'premium', 'domain', 'domains', 'name', 'names', 'brand', 'brands', 'website',
  'site', 'looking', 'find', 'need', 'want', 'best', 'cheap', 'available',
  'register', 'registration', 'buy', 'purchase', 'suggest', 'suggestion',
  'ideas', 'idea', 'please', 'help', 'ultra', 'good', 'great', 'perfect',
  'unique', 'catchy', 'cool', 'nice', 'awesome', 'business', 'company',
  'startup', 'online', 'digital', 'web', 'url', 'link',
  // budget / style request fluff (not brand concepts)
  'budget', 'max', 'under', 'dollar', 'dollars', 'usd', 'price', 'cost',
  'brandable', 'branding', 'shortlist', 'generate', 'rank', 'ranking',
  'strategy', 'strategies', 'radio', 'test', 'extension', 'extensions',
  'tld', 'tlds', 'professional', 'professionals', 'busy', 'modern', 'simple',
  'prefer', 'preferred', 'include', 'avoid', 'skip', 'default',
  // bare TLD tokens that leak from "prefer .com"
  'com', 'net', 'org', 'io', 'ai', 'co', 'app', 'dev', 'www',
]);

/**
 * Successful brand structure patterns (apply per vertical):
 * 1. Root+Modifier: IronCore, PulseFit
 * 2. Modifier+Root: TrueStrength, ApexGym
 * 3. Result compound: FitFast, LiftMore (result-first)
 * 4. Evocative single: Equinox-style (we approximate with strong roots)
 * 5. Place/community: FitClub, StrengthYard
 * 6. Avoid random tech: getXly, Xify, Xhq unless SaaS vertical
 */
export const VERTICALS: VerticalLexicon[] = [
  {
    id: 'fitness',
    triggers: [
      'gym', 'fitness', 'workout', 'crossfit', 'hiit', 'yoga', 'pilates',
      'strength', 'training', 'trainer', 'athletic', 'athletics', 'bodybuilding',
      'barbell', 'lifting', 'lift', 'cardio', 'boxing', 'martial', 'wellness',
      'exercise', 'sports', 'sport', 'coach', 'coaching', 'personal training',
      'powerlifting', 'calisthenics', 'studio fitness', 'fit club',
    ],
    roots: [
      'fit', 'fitness', 'gym', 'iron', 'steel', 'forge', 'strength', 'strong',
      'lift', 'barbell', 'pulse', 'core', 'muscle', 'power', 'apex', 'titan',
      'grind', 'burn', 'flex', 'form', 'motion', 'move', 'vital', 'peak',
      'prime', 'atlas', 'anvil', 'crucible', 'yard', 'den', 'house', 'lab',
      'club', 'crew', 'tribe', 'base', 'camp', 'ridge', 'summit', 'volt',
      'yoga', 'flow', 'breath', 'balance', 'stretch', 'om', 'mat', 'mindbody',
      'hiit', 'box', 'fight', 'athletic', 'sport',
    ],
    modifiers: [
      'true', 'iron', 'steel', 'apex', 'prime', 'peak', 'max', 'pro', 'elite',
      'daily', 'urban', 'local', 'next', 'bold', 'raw', 'solid', 'swift',
      'steady', 'fierce', 'relentless', 'clean', 'pure', 'total', 'full',
    ],
    results: [
      'strong', 'fit', 'fast', 'lean', 'power', 'gain', 'rise', 'drive',
      'surge', 'boost', 'level', 'transform', 'thrive', 'endure',
    ],
    suffixes: ['fit', 'gym', 'lab', 'club', 'co', 'hq', 'pro', 'house', 'yard', 'den', 'room'],
    tldBoost: ['.com', '.fit', '.club', '.co', '.gym', '.training'],
  },
  {
    id: 'saas',
    triggers: [
      'saas', 'software', 'api', 'platform', 'app', 'devtools', 'developer',
      'automation', 'agent', 'ai tool', 'b2b', 'dashboard', 'workflow',
      'analytics', 'crm', 'cloud',
    ],
    roots: [
      'flow', 'stack', 'sync', 'base', 'hub', 'grid', 'node', 'lane', 'loop',
      'pilot', 'craft', 'forge', 'pulse', 'signal', 'metric', 'ledger', 'orbit',
      'nexus', 'vault', 'layer', 'spark', 'beam', 'relay',
    ],
    modifiers: [
      'open', 'smart', 'auto', 'clear', 'quick', 'true', 'bright', 'north',
      'hyper', 'meta', 'neo', 'soft', 'cloud', 'data',
    ],
    results: ['ship', 'scale', 'grow', 'build', 'launch', 'run', 'ops'],
    suffixes: ['ly', 'io', 'hq', 'lab', 'app', 'ai', 'kit', 'ops', 'hub', 'base'],
    tldBoost: ['.com', '.io', '.ai', '.app', '.dev', '.co'],
  },
  {
    id: 'food',
    triggers: [
      'restaurant', 'cafe', 'coffee', 'bakery', 'food', 'kitchen', 'bistro',
      'bar', 'brewery', 'pizza', 'catering', 'meal', 'dining',
    ],
    roots: [
      'bite', 'fork', 'table', 'hearth', 'oven', 'roast', 'brew', 'bean',
      'crust', 'plate', 'feast', 'harvest', 'grove', 'kitchen', 'pantry',
      'spice', 'salt', 'ember', 'smoke', 'dough',
    ],
    modifiers: [
      'daily', 'local', 'urban', 'true', 'fresh', 'wild', 'golden', 'house',
      'little', 'grand', 'open',
    ],
    results: ['fresh', 'warm', 'share', 'savor', 'taste'],
    suffixes: ['kitchen', 'cafe', 'co', 'house', 'bar', 'table', 'eats'],
    tldBoost: ['.com', '.co', '.menu', '.cafe'],
  },
  {
    id: 'health',
    triggers: [
      'health', 'clinic', 'medical', 'dental', 'dentist', 'doctor',
      'therapy', 'mental health', 'pharmacy', 'wellness clinic', 'hospital',
      'beauty', 'skincare', 'spa',
    ],
    roots: [
      'care', 'health', 'heal', 'vital', 'well', 'pulse', 'clinic', 'path',
      'life', 'balance', 'mind', 'body', 'restore', 'nourish', 'calm', 'glow',
    ],
    modifiers: [
      'true', 'prime', 'clear', 'open', 'kind', 'gentle', 'whole', 'pure',
      'bright', 'steady',
    ],
    results: ['heal', 'thrive', 'restore', 'balance', 'calm'],
    suffixes: ['care', 'health', 'clinic', 'well', 'path', 'life'],
    tldBoost: ['.com', '.health', '.care', '.clinic'],
  },
  {
    id: 'finance',
    triggers: [
      'fintech', 'finance', 'bank', 'payment', 'lending', 'invest', 'crypto',
      'wallet', 'accounting', 'insurance', 'credit',
    ],
    roots: [
      'ledger', 'capital', 'vault', 'mint', 'coin', 'pay', 'fund', 'trust',
      'ridge', 'harbor', 'anchor', 'clear', 'prime', 'folio',
    ],
    modifiers: [
      'open', 'clear', 'true', 'smart', 'secure', 'first', 'north', 'apex',
    ],
    results: ['grow', 'save', 'build', 'secure'],
    suffixes: ['pay', 'capital', 'hq', 'lab', 'fi', 'funds'],
    tldBoost: ['.com', '.io', '.finance', '.co'],
  },
  {
    id: 'education',
    triggers: [
      'school', 'edu', 'education', 'tutor', 'course', 'learn', 'learning',
      'academy', 'training program', 'bootcamp', 'university',
    ],
    roots: [
      'learn', 'skill', 'class', 'academy', 'tutor', 'path', 'spark', 'mind',
      'study', 'campus', 'quest', 'rise', 'bright',
    ],
    modifiers: [
      'open', 'bright', 'next', 'true', 'first', 'smart', 'daily',
    ],
    results: ['learn', 'grow', 'rise', 'master'],
    suffixes: ['learn', 'academy', 'lab', 'ed', 'school', 'path'],
    tldBoost: ['.com', '.edu', '.academy', '.school', '.co'],
  },
  {
    id: 'ecommerce',
    triggers: [
      'shop', 'store', 'ecommerce', 'e-commerce', 'marketplace', 'retail',
      'merch', 'fashion', 'apparel', 'boutique', 'clothing', 'streetwear',
      'wardrobe', 'garment', 'couture', 'ready-to-wear',
    ],
    // Prefer evocative brandable roots over generic cloth/cart/shop mashups
    roots: [
      'loom', 'linen', 'velvet', 'suede', 'drape', 'hem', 'seam', 'form', 'line',
      'atlas', 'nova', 'vera', 'ora', 'lux', 'mode', 'folio', 'atelier', 'frame',
      'cast', 'crest', 'vale', 'mira', 'wren', 'rowan', 'elm', 'ash', 'fern',
      'haven', 'veil', 'silk', 'indigo', 'slate', 'ivory', 'onyx', 'ember',
      'craft', 'supply', 'thread', 'wear',
    ],
    modifiers: [
      'daily', 'urban', 'true', 'prime', 'open', 'fresh', 'soft', 'clean', 'north', 'quiet',
    ],
    results: ['style', 'form', 'wear', 'rise'],
    // Avoid 'shop'/'store'/'cart' as suffixes — they produce unbrandable compounds
    suffixes: ['co', 'line', 'form', 'ware', 'lab', 'studio'],
    tldBoost: ['.com', '.co', '.shop', '.store'],
  },
  {
    id: 'creative',
    triggers: [
      'design', 'studio', 'agency', 'creative', 'photo', 'film', 'media',
      'marketing', 'branding', 'content', 'music', 'audio', 'podcast', 'song',
      'band', 'sound', 'game', 'gaming', 'esports',
    ],
    roots: [
      'studio', 'craft', 'frame', 'lens', 'ink', 'pixel', 'story', 'signal',
      'spark', 'form', 'cast', 'edit', 'canvas', 'sound', 'tone', 'beat',
      'wave', 'echo', 'mix', 'play', 'quest', 'arena',
    ],
    modifiers: [
      'bold', 'true', 'open', 'north', 'wild', 'clear', 'bright',
    ],
    results: ['create', 'craft', 'show', 'tell', 'play'],
    suffixes: ['studio', 'lab', 'co', 'media', 'works', 'hq', 'fm'],
    tldBoost: ['.com', '.studio', '.design', '.co', '.fm', '.music'],
  },
  {
    id: 'local_services',
    triggers: [
      'plumber', 'hvac', 'electrician', 'cleaning', 'lawn', 'roofing',
      'contractor', 'locksmith', 'moving', 'repair', 'handyman',
      'pet', 'pets', 'dog', 'cat', 'grooming', 'groomer', 'veterinary', 'vet',
    ],
    roots: [
      'fix', 'pro', 'crew', 'service', 'works', 'care', 'home', 'house',
      'pipe', 'spark', 'clean', 'move', 'build', 'paw', 'pet', 'bark', 'groom',
    ],
    modifiers: [
      'local', 'quick', 'true', 'pro', 'city', 'metro', 'reliable', 'same day',
    ],
    results: ['fix', 'solve', 'help', 'care'],
    suffixes: ['pro', 'works', 'services', 'crew', 'care'],
    tldBoost: ['.com', '.net', '.co'],
  },
];

const GENERAL: VerticalLexicon = {
  id: 'general',
  triggers: [
    'solar', 'green', 'eco', 'energy', 'renewable', 'sustainable', 'organic',
    'travel', 'voyage', 'tourism', 'hotel', 'security', 'cyber', 'event',
    'wedding', 'parent', 'baby', 'auto', 'car', 'vehicle',
  ],
  roots: [
    'form', 'forge', 'pulse', 'north', 'ridge', 'harbor', 'clear', 'true', 'prime', 'apex',
    'green', 'eco', 'solar', 'leaf', 'terra', 'bloom', 'earth', 'volt', 'charge',
  ],
  modifiers: ['true', 'open', 'clear', 'north', 'bold', 'prime', 'next', 'daily', 'pure'],
  results: ['grow', 'rise', 'build', 'start', 'charge', 'power'],
  suffixes: ['co', 'hq', 'lab', 'hub', 'base', 'eco', 'energy'],
  tldBoost: ['.com', '.co', '.io', '.app', '.green', '.eco', '.energy'],
};

export function detectVertical(text: string, keywords: string[] = []): VerticalId {
  const blob = `${text} ${keywords.join(' ')}`.toLowerCase();
  let best: { id: VerticalId; score: number } = { id: 'general', score: 0 };
  for (const v of VERTICALS) {
    let score = 0;
    for (const t of v.triggers) {
      if (blob.includes(t)) score += t.includes(' ') ? 3 : 2;
    }
    if (score > best.score) best = { id: v.id, score };
  }
  // GENERAL has its own triggers (green/solar/travel…) — score them so we don't
  // mis-route energy brands into medical "health".
  let generalScore = 0;
  for (const t of GENERAL.triggers) {
    if (blob.includes(t)) generalScore += 2;
  }
  if (generalScore > best.score) return 'general';
  return best.id;
}

export function getVertical(id: VerticalId): VerticalLexicon {
  return VERTICALS.find((v) => v.id === id) || GENERAL;
}

/** Expand user keywords with vertical lexicon (capped). */
export function expandKeywordsForVertical(
  keywords: string[],
  vertical: VerticalId,
  limit = 12
): string[] {
  const v = getVertical(vertical);
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (w: string) => {
    const x = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (x.length < 2 || seen.has(x) || REQUEST_META_WORDS.has(x)) return;
    seen.add(x);
    out.push(x);
  };
  // User concepts first (yoga before generic iron/steel)
  for (const k of keywords) push(k);
  // Roots that match user language
  for (const r of v.roots) {
    if (keywords.some((k) => k.includes(r) || r.includes(k))) push(r);
  }
  // Related roots that share a concept family with user keywords
  const conceptBlob = keywords.join(' ');
  const yogaMode = /\byoga\b|pilates|stretch|mindful/.test(conceptBlob);
  const liftMode = /\bgym\b|strength|lift|barbell|crossfit|powerlifting/.test(conceptBlob);
  if (yogaMode) {
    for (const r of ['yoga', 'flow', 'breath', 'balance', 'mat', 'stretch', 'calm', 'flex', 'form']) {
      push(r);
    }
  } else if (liftMode) {
    for (const r of ['gym', 'iron', 'strength', 'forge', 'lift', 'barbell', 'steel']) push(r);
  } else if (/\bhiit\b|cardio|burn|bootcamp/.test(conceptBlob)) {
    for (const r of ['burn', 'pulse', 'hiit', 'volt', 'surge', 'grind']) push(r);
  } else {
    for (const r of v.roots.slice(0, 6)) push(r);
  }
  // Modifiers — skip heavy lift modifiers for yoga
  const mods =
    yogaMode && !liftMode
      ? v.modifiers.filter((m) => !['iron', 'steel', 'fierce', 'relentless', 'raw'].includes(m))
      : v.modifiers;
  for (const m of mods.slice(0, 4)) push(m);

  // Open-source branding pack (semantic neighbors + industry banks + free affix ecosystem)
  for (const w of expandKeywordsOpenSource(keywords, vertical, limit)) push(w);

  return out.slice(0, limit);
}

/**
 * Core concept words from brief — strips request meta ("premium domain for a gym" → gym).
 */
export function extractConceptWords(text: string, limit = 8): string[] {
  const raw = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !REQUEST_META_WORDS.has(w));

  const freq = new Map<string, number>();
  for (const w of raw) freq.set(w, (freq.get(w) || 0) + 1);

  // Boost vertical triggers present in text
  const vertical = detectVertical(text);
  const v = getVertical(vertical);
  for (const t of v.triggers) {
    if (!t.includes(' ') && text.toLowerCase().includes(t)) {
      freq.set(t, (freq.get(t) || 0) + 5);
    }
  }

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([w]) => w)
    .slice(0, limit);
}

/**
 * Score how well a label fits a vertical (0–100).
 * Used by ranker to kill random off-category names.
 */
export function scoreIndustryFit(label: string, vertical: VerticalId, keywords: string[]): number {
  const lab = label.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!lab) return 0;
  const v = getVertical(vertical);
  let score = 15; // base — not zero so pure brandables aren't dead, but low

  const hit = (word: string, weight: number) => {
    const w = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (w.length >= 3 && lab.includes(w)) score += weight;
  };

  for (const r of v.roots) hit(r, 18);
  for (const m of v.modifiers) hit(m, 8);
  for (const r of v.results) hit(r, 12);
  for (const s of v.suffixes) {
    if (lab.endsWith(s) && lab.length > s.length + 2) score += 10;
  }
  for (const k of keywords) hit(k, 22);

  // Penalize SaaS glue on non-SaaS verticals (the "random name" problem)
  if (vertical !== 'saas' && vertical !== 'general') {
    const techGlue = ['ify', 'ly', 'ai', 'io', 'stack', 'ops'];
    for (const g of techGlue) {
      if (lab.endsWith(g) && !v.suffixes.includes(g)) score -= 18;
    }
    const techPrefix = ['get', 'try', 'use', 'hey'];
    for (const p of techPrefix) {
      if (lab.startsWith(p) && lab.length > p.length + 2) score -= 12;
    }
  }

  // Reward multi-token brand compounds common in real brands
  let rootHits = 0;
  for (const r of v.roots) {
    if (r.length >= 3 && lab.includes(r)) rootHits += 1;
  }
  if (rootHits >= 2) score += 15;
  if (rootHits === 1 && lab.length <= 12) score += 8;

  return Math.max(0, Math.min(100, score));
}

/**
 * Generate on-category label stems (no TLD) using brand structure patterns.
 */
export function generateVerticalLabels(
  vertical: VerticalId,
  keywords: string[],
  stem: string,
  limit = 80
): string[] {
  const v = getVertical(vertical);
  const labels: string[] = [];
  const seen = new Set<string>();
  const add = (raw: string) => {
    const x = raw.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 22);
    if (x.length < 4 || x.length > 18 || seen.has(x)) return;
    // Reject pure meta
    if (REQUEST_META_WORDS.has(x)) return;
    seen.add(x);
    labels.push(x);
  };

  // User/stem keywords first — avoid flooding yoga briefs with iron/steel compounds
  const userConcepts = [stem, ...keywords.filter((k) => !REQUEST_META_WORDS.has(k))]
    .map((s) => s.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter((s) => s.length >= 3);
  const uniqUser = Array.from(new Set(userConcepts)).slice(0, 8);

  // Only mix in vertical roots that relate to user language (or top defaults if thin brief)
  let relatedRoots = v.roots.filter((r) =>
    uniqUser.some((u) => u.includes(r) || r.includes(u) || u === stem)
  );

  // Fitness sub-modes: don't mix iron/barbell into yoga briefs (and vice versa)
  const userBlob = uniqUser.join(' ');
  if (vertical === 'fitness') {
    const yogaMode = /\byoga|pilates|stretch|mindful|breath|om|mat\b/.test(userBlob);
    const liftMode = /\bgym|strength|lift|barbell|crossfit|powerlifting|iron|steel\b/.test(userBlob);
    const yogaRoots = new Set([
      'yoga', 'flow', 'breath', 'balance', 'stretch', 'om', 'mat', 'mindbody', 'calm', 'flex', 'form', 'motion', 'vital',
    ]);
    const liftRoots = new Set([
      'gym', 'iron', 'steel', 'forge', 'strength', 'strong', 'lift', 'barbell', 'muscle', 'power', 'apex', 'titan',
      'grind', 'burn', 'anvil', 'crucible', 'volt', 'flex', 'core', 'pulse',
    ]);
    if (yogaMode && !liftMode) {
      relatedRoots = relatedRoots.filter((r) => yogaRoots.has(r) || yogaRoots.has(r));
      // Prefer calm lexicon as fallback
      relatedRoots = Array.from(new Set([...relatedRoots, ...Array.from(yogaRoots)])).slice(0, 12);
    } else if (liftMode && !yogaMode) {
      relatedRoots = relatedRoots.filter((r) => !yogaRoots.has(r) || liftRoots.has(r));
      relatedRoots = Array.from(
        new Set([...relatedRoots.filter((r) => liftRoots.has(r) || !yogaRoots.has(r)), ...Array.from(liftRoots)])
      ).slice(0, 12);
    }
  }

  const fallbackRoots = relatedRoots.length >= 3 ? relatedRoots.slice(0, 10) : v.roots.slice(0, 8);
  const uniqConcept = Array.from(new Set([...uniqUser, ...fallbackRoots])).slice(0, 12);

  const mods = v.modifiers.slice(0, 10);
  const results = v.results.slice(0, 8);
  const suffixes = v.suffixes.slice(0, 8);

  // Pattern 1: concept alone (if brandable length)
  for (const c of uniqUser) add(c);

  // Pattern 2: modifier + user concept first (TrueYoga, ApexGym)
  for (const m of mods) {
    for (const c of uniqUser.slice(0, 6)) {
      add(`${m}${c}`);
      if (c.length >= 4) add(`${c}${m}`);
    }
  }

  // Pattern 3: compounds — prefer user×user, then user×related root
  const compoundPool = Array.from(new Set([...uniqUser, ...fallbackRoots.slice(0, 8)]));
  for (let i = 0; i < compoundPool.length; i++) {
    for (let j = 0; j < compoundPool.length; j++) {
      if (i === j) continue;
      // Require at least one side to be a user concept when we have them
      if (uniqUser.length >= 2) {
        const aUser = uniqUser.includes(compoundPool[i]);
        const bUser = uniqUser.includes(compoundPool[j]);
        if (!aUser && !bUser) continue;
      }
      if (compoundPool[i].length + compoundPool[j].length > 16) continue;
      add(`${compoundPool[i]}${compoundPool[j]}`);
    }
  }

  // Pattern 4: result-first (FitFast energy — structure only)
  for (const r of results) {
    for (const c of uniqConcept.slice(0, 5)) {
      add(`${c}${r}`);
      add(`${r}${c}`);
    }
  }

  // Pattern 5: concept + industry suffix (FitLab, StrengthClub)
  for (const c of uniqConcept.slice(0, 6)) {
    for (const s of suffixes) {
      if (!c.endsWith(s)) add(`${c}${s}`);
    }
  }

  // Pattern 6: keyword pairs from user only
  for (let i = 0; i < keywords.length; i++) {
    for (let j = i + 1; j < keywords.length; j++) {
      const a = keywords[i].replace(/[^a-z0-9]/g, '');
      const b = keywords[j].replace(/[^a-z0-9]/g, '');
      if (a.length >= 3 && b.length >= 3) {
        add(`${a}${b}`);
        add(`${b}${a}`);
      }
    }
  }

  // Pattern 7: "crazy brandable" clips + portmanteaus (still on-vertical)
  // e.g. iron+fit → irnfit energy; strength → strenx; pulse+pro → pulspro
  const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s);
  const brandParticles = [
    'xo', 'zy', 'ly', 'ra', 'no', 'vi', 'ku', 'za', 'lo', 'ry', 'en', 'ix', 'ux', 'or', 'ar',
  ];
  for (const c of uniqConcept.slice(0, 8)) {
    if (c.length >= 5) {
      add(`${clip(c, 4)}ly`);
      add(`${clip(c, 5)}x`);
      add(`${clip(c, 4)}ora`);
      add(`${clip(c, 4)}ify`);
      add(`go${clip(c, 5)}`);
      add(`${clip(c, 6)}hq`);
    }
    for (const p of brandParticles.slice(0, 8)) {
      if (c.length >= 4 && c.length + p.length <= 12) {
        add(`${clip(c, 5)}${p}`);
        add(`${p}${clip(c, 5)}`);
      }
    }
  }
  // Portmanteau pairs (first half + second half of two strong roots)
  for (let i = 0; i < Math.min(uniqConcept.length, 6); i++) {
    for (let j = 0; j < Math.min(uniqConcept.length, 6); j++) {
      if (i === j) continue;
      const a = uniqConcept[i];
      const b = uniqConcept[j];
      if (a.length < 4 || b.length < 4) continue;
      const left = Math.ceil(a.length * 0.55);
      const right = Math.ceil(b.length * 0.55);
      add(`${a.slice(0, left)}${b.slice(-right)}`);
      add(`${a.slice(0, left)}${b.slice(0, right)}`);
    }
  }
  // Unexpected but sticky: double-concept + place energy
  for (const c of uniqUser.slice(0, 5)) {
    for (const place of ['yard', 'lab', 'den', 'house', 'room', 'base', 'camp', 'forge', 'works']) {
      if (v.roots.includes(place) || v.suffixes.includes(place) || place.length <= 5) {
        add(`${c}${place}`);
      }
    }
  }

  // SaaS-only tech glue (don't pollute gym names)
  if (vertical === 'saas') {
    for (const c of uniqConcept.slice(0, 4)) {
      for (const s of ['ly', 'ify', 'hq', 'app', 'ai']) add(`${c}${s}`);
      for (const p of ['get', 'try', 'use']) add(`${p}${c}`);
    }
  }

  // Open-source free branding patterns (affixes, latin/greek roots, corpora industries)
  for (const lab of generateOpenSourceLabels(vertical, keywords, stem, Math.min(limit, 90))) {
    add(lab);
  }

  // Prefer higher industry-fit labels first
  labels.sort((a, b) => scoreIndustryFit(b, vertical, keywords) - scoreIndustryFit(a, vertical, keywords));

  let out = labels.slice(0, limit);

  // Hard filter: yoga-mode must not surface powerlifting compounds
  const yogaMode = /\byoga|pilates|stretch|mindful|breath|om\b/.test(userBlob);
  const liftMode = /\bgym|strength|lift|barbell|crossfit|powerlifting|iron|steel\b/.test(userBlob);
  if (vertical === 'fitness' && yogaMode && !liftMode) {
    const banned = /iron|steel|barbell|anvil|crucible|titan|grind|powerlift/;
    out = out.filter((lab) => !banned.test(lab));
    // refill from remaining labels if filter emptied the slice
    if (out.length < Math.min(20, limit)) {
      const more = labels.filter((lab) => !banned.test(lab) && !out.includes(lab));
      out = [...out, ...more].slice(0, limit);
    }
  }

  return out;
}
