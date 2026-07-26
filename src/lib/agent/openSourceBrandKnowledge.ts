/**
 * Open-source / free branding knowledge loader for ADA.
 *
 * Sources (see src/data/brand-knowledge/SOURCES.md):
 * - In-repo generator-keywords affixes & semantic maps
 * - Curated industry banks (corpora-style, free)
 * - Public-domain Latin/Greek brand roots
 * - Positive modifiers & radio-friendly syllables
 *
 * No paid APIs. No model fine-tuning.
 */

import branding from '@/data/brand-knowledge/open-source-branding.json';

/** Mirrors agent vertical ids (avoid circular import with brandNamingKnowledge). */
export type BrandVerticalId =
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

export type OpenSourceBrandPack = {
  version: number;
  brandableLatinRoots: string[];
  brandableGreekRoots: string[];
  positiveModifiers: string[];
  resultVerbs: string[];
  radioFriendlySyllables: string[];
  industryBanks: Record<string, string[]>;
  topPrefixes: string[];
  topSuffixes: string[];
  seedBanks: Record<string, string[]>;
  semanticNeighbors: Record<string, string[]>;
  affixPolicy: {
    preferForSaas: string[];
    preferForBrandable: string[];
    avoidForFitness: string[];
    maxPrefixesPerCandidate: number;
    maxSuffixesPerCandidate: number;
  };
};

const pack = branding as unknown as OpenSourceBrandPack;

const VERTICAL_TO_BANK: Record<BrandVerticalId, string[]> = {
  fitness: ['fitness'],
  saas: ['saas'],
  food: ['food'],
  health: ['health', 'beauty'],
  finance: ['finance'],
  education: ['education'],
  ecommerce: ['ecommerce'],
  creative: ['creative', 'music'],
  local_services: ['realestate', 'legal', 'security'],
  general: ['saas', 'creative', 'ecommerce'],
};

export function getOpenSourceBrandPack(): OpenSourceBrandPack {
  return pack;
}

/** Pick best industry bank key(s) by keyword overlap (free corpora-style banks). */
export function detectIndustryBankKeys(blob: string, limit = 2): string[] {
  const text = blob.toLowerCase();
  const scored: { key: string; score: number }[] = [];
  for (const [key, words] of Object.entries(pack.industryBanks || {})) {
    let score = 0;
    if (text.includes(key)) score += 6;
    for (const w of words) {
      if (w.length >= 3 && text.includes(w)) score += 2;
    }
    if (score > 0) scored.push({ key, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.key);
}

/** Industry root words from free curated banks + seed banks */
export function getIndustryWordBank(
  vertical: BrandVerticalId,
  contextKeywords: string[] = []
): string[] {
  const blob = contextKeywords.join(' ');
  const detected = detectIndustryBankKeys(blob, 2);
  const keys = Array.from(
    new Set([...(detected.length ? detected : []), ...(VERTICAL_TO_BANK[vertical] || [])])
  );
  // If still empty, don't dump saas defaults onto pet/green brands
  if (!keys.length) {
    keys.push(...detectIndustryBankKeys(blob + ' general', 1));
  }

  const out: string[] = [];
  const seen = new Set<string>();
  const push = (w: string) => {
    const x = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (x.length < 2 || seen.has(x)) return;
    seen.add(x);
    out.push(x);
  };

  for (const k of keys) {
    for (const w of pack.industryBanks[k] || []) push(w);
  }

  // Map vertical → generator seed banks
  const seedKey =
    vertical === 'fitness' || vertical === 'health'
      ? 'health'
      : vertical === 'saas'
        ? 'tech'
        : vertical === 'ecommerce'
          ? 'ecommerce'
          : vertical === 'finance'
            ? 'finance'
            : vertical === 'education'
              ? 'education'
              : vertical === 'creative'
                ? 'creative'
                : vertical === 'food'
                  ? 'lifestyle'
                  : detected[0] === 'pets' || detected[0] === 'green'
                    ? 'lifestyle'
                    : 'business';

  for (const w of pack.seedBanks[seedKey] || []) push(w);
  if (vertical === 'saas') {
    for (const w of pack.seedBanks.trending || []) push(w);
  }

  return out;
}

/** Semantic neighbors for a keyword (from free generator semantic map) */
export function getSemanticNeighbors(keyword: string, limit = 12): string[] {
  const k = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!k) return [];
  const direct = pack.semanticNeighbors[k];
  if (direct?.length) return direct.slice(0, limit);

  // Fuzzy: any key contained in keyword or vice versa
  for (const [key, vals] of Object.entries(pack.semanticNeighbors)) {
    if (k.includes(key) || key.includes(k)) return (vals || []).slice(0, limit);
  }
  return [];
}

/**
 * Expand user keywords with open-source semantic + industry banks.
 */
export function expandKeywordsOpenSource(
  keywords: string[],
  vertical: BrandVerticalId,
  limit = 16
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (w: string) => {
    const x = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (x.length < 2 || seen.has(x)) return;
    seen.add(x);
    out.push(x);
  };

  for (const k of keywords) push(k);
  for (const k of keywords.slice(0, 4)) {
    for (const n of getSemanticNeighbors(k, 6)) push(n);
  }
  for (const w of getIndustryWordBank(vertical, keywords).slice(0, 14)) push(w);
  for (const m of pack.positiveModifiers.slice(0, 4)) push(m);

  return out.slice(0, limit);
}

/**
 * Generate brandable labels using free affixes + latin/greek roots + industry words.
 */
export function generateOpenSourceLabels(
  vertical: BrandVerticalId,
  keywords: string[],
  stem: string,
  limit = 80
): string[] {
  const labels: string[] = [];
  const seen = new Set<string>();
  const add = (raw: string) => {
    const x = raw.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
    if (x.length < 4 || x.length > 16 || seen.has(x)) return;
    seen.add(x);
    labels.push(x);
  };

  const industry = getIndustryWordBank(vertical, [stem, ...keywords]);
  const concepts = Array.from(
    new Set(
      [stem, ...keywords, ...industry.slice(0, 12)]
        .map((s) => s.toLowerCase().replace(/[^a-z0-9]/g, ''))
        .filter((s) => s.length >= 3)
    )
  ).slice(0, 14);

  const mods = pack.positiveModifiers.slice(0, 14);
  const verbs = pack.resultVerbs.slice(0, 12);
  const latin = pack.brandableLatinRoots.slice(0, 16);
  const greek = pack.brandableGreekRoots.slice(0, 12);

  const policy = pack.affixPolicy;
  let prefixes = pack.topPrefixes.slice(0, policy.maxPrefixesPerCandidate);
  let suffixes = pack.topSuffixes.slice(0, policy.maxSuffixesPerCandidate);

  if (vertical === 'saas') {
    prefixes = Array.from(new Set([...policy.preferForSaas, ...prefixes])).slice(0, 12);
    suffixes = Array.from(new Set([...policy.preferForBrandable, ...suffixes])).slice(0, 12);
  }
  if (vertical === 'fitness' || vertical === 'health' || vertical === 'food') {
    // Avoid SaaS-y glue for non-tech verticals
    const avoid = new Set(policy.avoidForFitness);
    prefixes = prefixes.filter((p) => !avoid.has(p));
    suffixes = suffixes.filter((s) => !avoid.has(s) && !['ify', 'stack', 'ops'].includes(s));
  }

  // Pattern A: concept alone
  for (const c of concepts) add(c);

  // Pattern B: modifier + concept
  for (const m of mods) {
    for (const c of concepts.slice(0, 6)) {
      add(`${m}${c}`);
      add(`${c}${m}`);
    }
  }

  // Pattern C: open-source affixes (Lean Domain Search style)
  for (const c of concepts.slice(0, 5)) {
    for (const p of prefixes.slice(0, 8)) add(`${p}${c}`);
    for (const s of suffixes.slice(0, 10)) {
      if (!c.endsWith(s)) add(`${c}${s}`);
    }
  }

  // Pattern D: industry compound pairs
  for (let i = 0; i < Math.min(industry.length, 10); i++) {
    for (let j = 0; j < Math.min(industry.length, 10); j++) {
      if (i === j) continue;
      if (industry[i].length + industry[j].length <= 14) {
        add(`${industry[i]}${industry[j]}`);
      }
    }
  }

  // Pattern E: result verbs
  for (const v of verbs) {
    for (const c of concepts.slice(0, 4)) {
      add(`${c}${v}`);
      add(`${v}${c}`);
    }
  }

  // Pattern F: Latin/Greek brandable blends (public-domain roots)
  for (const root of [...latin.slice(0, 8), ...greek.slice(0, 6)]) {
    for (const c of concepts.slice(0, 3)) {
      if (c !== root) {
        add(`${root}${c}`);
        add(`${c}${root}`);
      }
    }
    for (const m of mods.slice(0, 4)) add(`${m}${root}`);
  }

  // Pattern G: radio-friendly short inventeds (syllable pairs)
  const syl = pack.radioFriendlySyllables;
  for (let i = 0; i < 12; i++) {
    const a = syl[i % syl.length];
    const b = syl[(i * 3 + 1) % syl.length];
    const c = concepts[i % Math.max(concepts.length, 1)] || 'co';
    if (c.length <= 6) add(`${a}${b}${c.slice(0, 4)}`);
  }

  return labels.slice(0, limit);
}

export function openSourceKnowledgeStats() {
  return {
    version: pack.version,
    prefixes: pack.topPrefixes?.length || 0,
    suffixes: pack.topSuffixes?.length || 0,
    industries: Object.keys(pack.industryBanks || {}).length,
    semanticKeys: Object.keys(pack.semanticNeighbors || {}).length,
    latinRoots: pack.brandableLatinRoots?.length || 0,
    greekRoots: pack.brandableGreekRoots?.length || 0,
  };
}
