/**
 * Brand Brain — invents true brandable labels and protects availability API budget.
 *
 * Layers:
 * 1) Offline knowledge (Latin/Greek roots, syllables, fashion/brand patterns) — always on
 * 2) Optional Anthropic invention when ADA_ALLOW_PAID_LLM + ANTHROPIC_API_KEY
 * 3) Filters that kill generic keyword mashups (clothingthread, cartcloth…)
 * 4) Prioritize likely-available inventives for live checks (don't burn API on junk)
 *
 * Never invents availability — only invents *names*; availability comes from check tools.
 */

import { getOpenSourceBrandPack } from './openSourceBrandKnowledge';
import { REQUEST_META_WORDS, type VerticalId } from './brandNamingKnowledge';
import type { DomainBrief } from './types';
import { allowPaidLlm } from '@/lib/ada/freeMode';
import { getXaiConfig, xaiChatCompletion } from '@/lib/ada/spacexai';

/** Generic industry tokens that make terrible "brandables" when mashed together */
export const GENERIC_INDUSTRY_TOKENS = new Set([
  'clothing',
  'clothes',
  'cloth',
  'apparel',
  'fashion',
  'wear',
  'shop',
  'store',
  'cart',
  'rack',
  'market',
  'mart',
  'goods',
  'thread',
  'stitch',
  'boutique',
  'outlet',
  'sale',
  'discount',
  'brand',
  'company',
  'business',
  'online',
  'digital',
  'premium',
  'minimal',
  'modern',
  'young',
  'clean',
  'audience',
  'professional',
  'professionals',
  'everyday',
  'domain',
  'name',
  'names',
  // fitness generics (same problem family)
  'fitness',
  'gym',
  'workout',
  // food
  'food',
  'restaurant',
  'cafe',
]);

const FASHION_EVOCATIVE = [
  'loom',
  'lumen',
  'velvet',
  'linen',
  'suede',
  'drape',
  'hem',
  'seam',
  'atlas',
  'nova',
  'vera',
  'ora',
  'lux',
  'form',
  'line',
  'edge',
  'north',
  'ridge',
  'harbor',
  'coast',
  'slate',
  'ivory',
  'onyx',
  'sable',
  'ember',
  'folio',
  'atelier',
  'studio',
  'frame',
  'cast',
  'mode',
  'modus',
  'forma',
  'aure',
  'solace',
  'haven',
  'veil',
  'silk',
  'merino',
  'cash',
  'calico',
  'indigo',
  'sable',
  'crest',
  'vale',
  'mira',
  'lira',
  'kith',
  'wren',
  'rowan',
  'elm',
  'ash',
  'pine',
  'oak',
  'fern',
  'moss',
  'river',
  'field',
  'grove',
  'meadow',
];

function normalizeLabel(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 22);
}

/** Split label into likely compound halves (greedy from generic token list + mid-split). */
function compoundHalves(label: string): [string, string] | null {
  const lab = normalizeLabel(label);
  if (lab.length < 6) return null;
  // Prefer known token boundaries
  const genericTokens = Array.from(GENERIC_INDUSTRY_TOKENS).sort((a, b) => b.length - a.length);
  for (const tok of genericTokens) {
    if (tok.length < 3) continue;
    if (lab.startsWith(tok) && lab.length - tok.length >= 3) {
      return [tok, lab.slice(tok.length)];
    }
    if (lab.endsWith(tok) && lab.length - tok.length >= 3) {
      return [lab.slice(0, lab.length - tok.length), tok];
    }
  }
  // Mid split for even lengths
  const mid = Math.floor(lab.length / 2);
  for (const i of [mid, mid - 1, mid + 1, mid - 2, mid + 2]) {
    if (i < 3 || i > lab.length - 3) continue;
    return [lab.slice(0, i), lab.slice(i)];
  }
  return null;
}

/**
 * True if both halves are generic industry tokens → "clothingthread", "cartcloth".
 * These look unprofessional and are often taken; never prefer them as brandables.
 */
export function isGenericKeywordMashup(label: string): boolean {
  const lab = normalizeLabel(label);
  if (!lab || lab.length < 6) return false;
  if (GENERIC_INDUSTRY_TOKENS.has(lab)) return true;

  // Whole label is two generics concatenated
  const genericTokens = Array.from(GENERIC_INDUSTRY_TOKENS);
  for (let i = 0; i < genericTokens.length; i++) {
    const a = genericTokens[i];
    if (a.length < 3 || !lab.startsWith(a)) continue;
    const rest = lab.slice(a.length);
    if (rest.length >= 3 && GENERIC_INDUSTRY_TOKENS.has(rest)) return true;
  }

  const halves = compoundHalves(lab);
  if (!halves) return false;
  const [a, b] = halves;
  if (GENERIC_INDUSTRY_TOKENS.has(a) && GENERIC_INDUSTRY_TOKENS.has(b)) return true;
  // clothing + anything dictionary-ish that's also in generic set loosely
  if (
    (a === 'clothing' || a === 'clothes' || a === 'cloth' || a === 'fashion' || a === 'apparel') &&
    b.length >= 4
  ) {
    // clothingthread, clothingminimal, clothingyoung
    if (GENERIC_INDUSTRY_TOKENS.has(b) || REQUEST_META_WORDS.has(b)) return true;
    if (['thread', 'minimal', 'young', 'clean', 'modern', 'premium', 'daily'].includes(b)) {
      return true;
    }
  }
  return false;
}

/** Offline brandability 0–100 (no network). */
export function scoreInventedBrandability(label: string): number {
  const lab = normalizeLabel(label);
  if (lab.length < 4 || lab.length > 14) return 10;
  if (isGenericKeywordMashup(lab)) return 5;
  if (REQUEST_META_WORDS.has(lab)) return 0;
  if (GENERIC_INDUSTRY_TOKENS.has(lab)) return 15;

  let score = 55;
  // Ideal brandable length
  if (lab.length >= 5 && lab.length <= 9) score += 25;
  else if (lab.length >= 4 && lab.length <= 11) score += 12;
  else score -= 15;

  if (lab.includes('-') || /\d/.test(lab)) score -= 40;

  const vowels = (lab.match(/[aeiouy]/g) || []).length;
  const ratio = vowels / lab.length;
  if (ratio >= 0.28 && ratio <= 0.55) score += 15;
  else if (vowels === 0) score -= 25;

  if (/[bcdfghjklmnpqrstvwxz]{4,}/i.test(lab)) score -= 18;
  if (/(.)\1{2,}/.test(lab)) score -= 12;

  // Invented feel: not a single common English industry word
  if (!GENERIC_INDUSTRY_TOKENS.has(lab) && lab.length <= 10) score += 8;

  // Soft consonant-vowel alternation bonus
  let alt = 0;
  for (let i = 1; i < lab.length; i++) {
    const a = /[aeiouy]/.test(lab[i - 1]);
    const b = /[aeiouy]/.test(lab[i]);
    if (a !== b) alt += 1;
  }
  if (alt / (lab.length - 1) >= 0.55) score += 10;

  return Math.max(0, Math.min(100, score));
}

function addLabel(out: string[], seen: Set<string>, raw: string, max: number) {
  if (out.length >= max) return;
  const x = normalizeLabel(raw);
  if (x.length < 4 || x.length > 12) return;
  if (seen.has(x)) return;
  if (REQUEST_META_WORDS.has(x)) return;
  if (isGenericKeywordMashup(x)) return;
  if (scoreInventedBrandability(x) < 42) return;
  seen.add(x);
  out.push(x);
}

/**
 * Offline invention — no API. Syllable blends + Latin/Greek + fashion evocatives.
 */
export function inventOfflineBrandables(brief: DomainBrief, vertical: VerticalId, limit = 40): string[] {
  const pack = getOpenSourceBrandPack();
  const out: string[] = [];
  const seen = new Set<string>();

  const concepts = [
    ...brief.keywords,
    ...(brief.businessName ? [brief.businessName] : []),
  ]
    .map(normalizeLabel)
    .filter((c) => c.length >= 3 && !GENERIC_INDUSTRY_TOKENS.has(c) && !REQUEST_META_WORDS.has(c))
    .slice(0, 6);

  const latin = pack.brandableLatinRoots || [];
  const greek = pack.brandableGreekRoots || [];
  const syllables = pack.radioFriendlySyllables || [];
  const mods = pack.positiveModifiers || [];
  const fashionish =
    vertical === 'ecommerce' ||
    /fashion|cloth|apparel|wear|boutique|streetwear|minimal/i.test(brief.description);

  const evocative = fashionish
    ? [...FASHION_EVOCATIVE, ...latin.slice(0, 20), ...syllables.slice(0, 30)]
    : [...latin.slice(0, 24), ...greek.slice(0, 16), ...syllables.slice(0, 40), ...mods.slice(0, 12)];

  // Prefer *blends* first (more inventable + more likely available than velvet.com alone)
  // Pattern A: fashion/latin coined blends
  if (fashionish) {
    const prefixes = [
      'vel', 'lux', 'ora', 'nov', 'sol', 'aur', 'lin', 'mer', 'kith', 'wren', 'elm',
      'nor', 'cal', 'sil', 'ari', 'elio', 'mio', 'lumo', 'vero', 'feno',
    ];
    const suffixes = [
      'ora', 'ara', 'elle', 'ette', 'ium', 'ique', 'line', 'form', 'mode', 'ware',
      'way', 'ly', 'en', 'is', 'us', 'a', 'o', 'ia', 'eo',
    ];
    for (const p of prefixes) {
      for (const s of suffixes) {
        if (p === s) continue;
        addLabel(out, seen, `${p}${s}`, limit * 2);
      }
    }
  }

  // Pattern B: syllable blends (true inventeds) — primary offline brain
  const syl = syllables.length
    ? syllables
    : ['ka', 'lo', 'ri', 'ne', 'va', 'to', 'mi', 'ra', 'so', 'lu', 've', 'no', 'qi', 'za'];
  for (let i = 0; i < syl.length && out.length < limit * 2; i++) {
    for (let j = 0; j < Math.min(syl.length, 14); j++) {
      if (i === j) continue;
      addLabel(out, seen, `${syl[i]}${syl[j]}`, limit * 2);
      const k = (i + j + 3) % syl.length;
      addLabel(out, seen, `${syl[i]}${syl[j]}${syl[k]}`.slice(0, 10), limit * 2);
    }
  }

  // Pattern C: concept stem fragment + evocative (not full "clothing")
  for (const c of concepts) {
    const stem = c.slice(0, Math.min(4, c.length));
    if (stem.length < 3) continue;
    for (const e of evocative.slice(0, 20)) {
      if (e.length < 3) continue;
      addLabel(out, seen, `${stem}${e}`.slice(0, 11), limit * 2);
      addLabel(out, seen, `${e.slice(0, 4)}${stem}`, limit * 2);
      if (e.length >= 3) addLabel(out, seen, `${c.slice(0, 3)}${e.slice(-4)}`, limit * 2);
    }
  }

  // Pattern D: latin + positive modifier blends
  for (const l of latin.slice(0, 16)) {
    for (const m of mods.slice(0, 8)) {
      addLabel(out, seen, `${m}${l}`.slice(0, 12), limit * 2);
      addLabel(out, seen, `${l}${m}`.slice(0, 12), limit * 2);
    }
  }

  // Pattern E: short evocatives alone (lower priority — often taken)
  for (const e of evocative) {
    if (e.length >= 5 && e.length <= 8) addLabel(out, seen, e, limit * 2);
  }

  // Prefer longer inventives (6–9) over bare dictionary words
  out.sort((a, b) => {
    const sa =
      scoreInventedBrandability(a) +
      (a.length >= 6 && a.length <= 9 ? 8 : 0) +
      (GENERIC_INDUSTRY_TOKENS.has(a) ? -40 : 0);
    const sb =
      scoreInventedBrandability(b) +
      (b.length >= 6 && b.length <= 9 ? 8 : 0) +
      (GENERIC_INDUSTRY_TOKENS.has(b) ? -40 : 0);
    // Prefer non-dictionary-looking blends: has no exact fashion dictionary word
    const da = FASHION_EVOCATIVE.includes(a) ? -6 : 0;
    const db = FASHION_EVOCATIVE.includes(b) ? -6 : 0;
    return sb + db - (sa + da);
  });
  return out.slice(0, limit);
}

/**
 * Anthropic (or other paid LLM) invents brandable labels only — no availability claims.
 * Returns [] if LLM disabled/unavailable (offline path continues).
 */
export async function inventWithAnthropic(
  brief: DomainBrief,
  limit = 16
): Promise<{ labels: string[]; source: string }> {
  const cfg = getXaiConfig();
  // BYOK or server paid LLM — offline brain always still runs as fallback
  if (!cfg.enabled) {
    return { labels: [], source: 'llm-off' };
  }
  // allowPaidLlm gate only applies to server env keys; BYOK is user-opted
  if (cfg.source !== 'byok' && !allowPaidLlm()) {
    return { labels: [], source: 'llm-off' };
  }

  try {
    const system = [
      'You invent premium brandable domain *labels* (no TLD) for real consumer brands.',
      'Rules:',
      '- Invented / evocative names like Everlane, Glossier, Allbirds style (structure only — do not copy those brands).',
      '- 5–10 letters, easy to say and spell (radio test).',
      '- NO keyword mashups: never clothing+thread, cart+cloth, shop+rack, brand+minimal, etc.',
      '- NO hyphens, NO numbers, NO dictionary two-word concatenations of industry nouns.',
      '- Prefer unique coined words with soft vowels.',
      '- Output ONLY a JSON array of strings, e.g. ["velora","lumenline","orastudio"]. No markdown.',
    ].join('\n');

    const user = [
      `Business: ${brief.description}`,
      brief.industry ? `Industry: ${brief.industry}` : '',
      brief.keywords?.length ? `Keywords (inspiration only, do not glue them): ${brief.keywords.join(', ')}` : '',
      `Style: ${brief.style}`,
      `Count: ${limit}`,
      'Return JSON array of invented labels only.',
    ]
      .filter(Boolean)
      .join('\n');

    const completion = await xaiChatCompletion({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.85,
      maxTokens: 400,
    });

    const text = (completion.choices?.[0]?.message?.content || '').trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return { labels: [], source: 'llm-parse-fail' };
    const parsed = JSON.parse(jsonMatch[0]) as unknown;
    if (!Array.isArray(parsed)) return { labels: [], source: 'llm-parse-fail' };

    const labels: string[] = [];
    const seen = new Set<string>();
    for (const item of parsed) {
      if (typeof item !== 'string') continue;
      const x = normalizeLabel(item);
      if (x.length < 4 || x.length > 12) continue;
      if (isGenericKeywordMashup(x)) continue;
      if (scoreInventedBrandability(x) < 40) continue;
      if (seen.has(x)) continue;
      seen.add(x);
      labels.push(x);
      if (labels.length >= limit) break;
    }
    return { labels, source: `llm:${cfg.provider}` };
  } catch {
    return { labels: [], source: 'llm-error' };
  }
}

/**
 * Select domains to spend availability API budget on.
 * Prefer high brandability inventives; skip mashups and obvious long dictionary compounds.
 */
export function selectForAvailabilityCheck(domains: string[], maxCheck: number): string[] {
  const scored = domains
    .map((d) => {
      const label = d.split('.')[0] || d;
      let s = scoreInventedBrandability(label);
      if (isGenericKeywordMashup(label)) s = 0;
      // Prefer .com first for same label quality
      if (d.endsWith('.com')) s += 4;
      // Prefer shorter for availability likelihood
      if (label.length >= 6 && label.length <= 10) s += 3;
      return { d, s };
    })
    .filter((x) => x.s >= 40)
    .sort((a, b) => b.s - a.s);

  const out: string[] = [];
  const seenLabel = new Set<string>();
  for (const { d } of scored) {
    const lab = d.split('.')[0];
    // At most 2 TLDs per label to save checks
    const countForLabel = out.filter((x) => x.split('.')[0] === lab).length;
    if (countForLabel >= 2) continue;
    if (!seenLabel.has(lab) || countForLabel < 2) {
      out.push(d);
      seenLabel.add(lab);
    }
    if (out.length >= maxCheck) break;
  }
  return out;
}

/** Attach TLDs to labels with brandable policy (.com first). */
export function labelsToDomains(labels: string[], tlds: string[], limit: number): string[] {
  const ordered = Array.from(
    new Set([
      '.com',
      ...tlds.map((t) => (t.startsWith('.') ? t.toLowerCase() : `.${t.toLowerCase()}`)),
    ])
  ).slice(0, 4);

  const out: string[] = [];
  const seen = new Set<string>();
  for (const lab of labels) {
    const x = normalizeLabel(lab);
    if (!x || isGenericKeywordMashup(x)) continue;
    // Only first 2 TLDs for inventives to save check budget
    for (const tld of ordered.slice(0, 2)) {
      const d = `${x}${tld}`;
      if (seen.has(d)) continue;
      seen.add(d);
      out.push(d);
      if (out.length >= limit) return out;
    }
  }
  return out;
}
