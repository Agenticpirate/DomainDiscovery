import type { Industry } from '@/lib/industries';

const AFFIXES: Array<['p' | 's', string]> = [
  ['p', 'get'], ['p', 'my'], ['p', 'the'], ['p', 'best'], ['p', 'top'], ['p', 'pro'],
  ['s', 'hub'], ['s', 'hq'], ['s', 'co'], ['s', 'spot'], ['s', 'zone'], ['s', 'now'],
];

export const STATIC_IDEA_COUNT = 24;

/** Deterministic domain suggestions for an industry (no network, so crawlers see them in HTML). */
export function getStaticIdeas(industry: Industry, count = STATIC_IDEA_COUNT): string[] {
  const { keywords, tlds } = industry;
  const seen = new Set<string>();
  const out: string[] = [];
  for (let i = 0; out.length < count && i < count * 3; i++) {
    const [kind, affix] = AFFIXES[i % AFFIXES.length];
    const keyword = keywords[(i + Math.floor(i / AFFIXES.length)) % keywords.length];
    const label = kind === 'p' ? `${affix}${keyword}` : `${keyword}${affix}`;
    if (seen.has(label)) continue;
    seen.add(label);
    out.push(`${label}.${tlds[out.length % tlds.length]}`);
  }
  return out;
}
