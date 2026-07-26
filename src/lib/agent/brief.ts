/**
 * Parse free-text business descriptions into DomainBrief (rules-first).
 * Industry-aware: strips request meta ("premium domain for…") and expands vertical keywords.
 */

import type { DomainBrief, DomainStyle } from './types';
import {
  REQUEST_META_WORDS,
  detectVertical,
  expandKeywordsForVertical,
  extractConceptWords,
  getVertical,
  type VerticalId,
} from './brandNamingKnowledge';
import {
  DEFAULT_STRATEGIES,
  normalizeStrategies,
  parseStrategiesFromText,
} from './domainStrategies';

const STOP = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'our', 'are', 'is',
  'a', 'an', 'to', 'of', 'in', 'on', 'we', 'us', 'help', 'helps', 'using', 'use',
  'build', 'building', 'make', 'making', 'business', 'company', 'startup', 'app',
  'platform', 'service', 'services', 'online', 'based', 'want', 'need', 'looking',
  'domain', 'name', 'names', 'brand', 'website',
  ...Array.from(REQUEST_META_WORDS),
]);

const TECH_HINTS = ['ai', 'saas', 'software', 'api', 'dev', 'cloud', 'data', 'ml', 'agent', 'automation'];
const LOCAL_HINTS = [
  'local',
  'city',
  'cities',
  'plumber',
  'dentist',
  'clinic',
  'restaurant',
  'lawyer',
  'real estate',
  'hvac',
  'serving',
  'homes',
  'neighborhood',
  'metro',
  'area',
];

function extractKeywords(text: string, limit = 8): string[] {
  return extractConceptWords(text, limit).filter((w) => !STOP.has(w));
}

function hasWord(text: string, word: string): boolean {
  return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text);
}

function isGeoLocalBrief(text: string, vertical: VerticalId): boolean {
  const t = text.toLowerCase();
  if (vertical === 'local_services') return true;
  if (LOCAL_HINTS.some((h) => t.includes(h))) return true;
  // City/place + service phrasing: "serving Austin", "in Dallas", "near Chicago"
  if (/\b(serving|near|in|around)\s+[A-Z][a-z]+/.test(text)) return true;
  if (/\b(multi[- ]?city|multi[- ]?location|local seo|geo domain)\b/i.test(t)) return true;
  return false;
}

function inferStyle(text: string, vertical: VerticalId, style?: DomainStyle): DomainStyle {
  if (style) return style;
  const t = text.toLowerCase();
  // Local / geo first — must win over default brandable strategies later
  if (isGeoLocalBrief(text, vertical)) return 'geo';
  // Fashion / clothing / premium consumer brands → invent brandables (not keyword mashups)
  if (
    /\b(fashion|clothing|apparel|boutique|streetwear|wardrobe|couture|ready[- ]?to[- ]?wear)\b/.test(
      t
    ) ||
    (vertical === 'ecommerce' && /\b(wear|minimal|premium|brand)\b/.test(t))
  ) {
    return 'brandable';
  }
  // Fitness / food / health: mixed inventiveness + keywords
  if (vertical === 'fitness' || vertical === 'food' || vertical === 'health') return 'mixed';
  if (vertical === 'saas' || TECH_HINTS.some((h) => hasWord(t, h))) return 'brandable';
  if (/\b(exact|keyword|seo)\b/.test(t)) return 'keyword';
  if (/\bbrandable\b/.test(t)) return 'brandable';
  return 'mixed';
}

function defaultTlds(style: DomainStyle, vertical: VerticalId, industry?: string): string[] {
  const v = getVertical(vertical);
  const boost = v.tldBoost.map((t) => (t.startsWith('.') ? t : `.${t}`));
  // Always lead with .com for registrable first preference
  const ordered = ['.com', ...boost.filter((t) => t !== '.com')];
  const ind = (industry || '').toLowerCase();
  if (style === 'geo') return ['.com', '.co', '.net', ...ordered.filter((t) => !['.com', '.co', '.net'].includes(t))].slice(0, 5);
  if (ind.includes('ai') || vertical === 'saas') {
    return ['.com', '.ai', '.io', '.co', '.app'];
  }
  return Array.from(new Set(ordered)).slice(0, 6);
}

function inferIndustryLabel(vertical: VerticalId, text: string): string | undefined {
  if (vertical !== 'general') {
    const map: Record<VerticalId, string> = {
      fitness: 'fitness & gym',
      saas: 'software / saas',
      food: 'food & hospitality',
      health: 'health & care',
      finance: 'finance',
      education: 'education',
      ecommerce: 'ecommerce',
      creative: 'creative / agency',
      local_services: 'local services',
      general: 'general',
    };
    return map[vertical];
  }
  const words = extractConceptWords(text, 3);
  return words[0];
}

export function parseBusinessBrief(text: string, partial?: Partial<DomainBrief>): DomainBrief {
  const description = (partial?.description || text || '').trim();
  if (!description) {
    throw new Error('Business description is required');
  }

  const baseKeywords =
    partial?.keywords && partial.keywords.length > 0
      ? partial.keywords.map((k) => k.toLowerCase().trim()).filter((k) => k && !REQUEST_META_WORDS.has(k))
      : extractKeywords(description);

  const vertical = detectVertical(description, baseKeywords);
  const keywords = expandKeywordsForVertical(baseKeywords, vertical, 12);

  // Ensure at least one real concept remains (e.g. gym) even if user only said "premium domain for a gym"
  if (keywords.length === 0) {
    const fallback = extractConceptWords(description, 5);
    keywords.push(...fallback);
  }

  const style = inferStyle(description, vertical, partial?.style);
  // Only keep real extensions — never accept prose-as-TLD junk from chat parsers
  const SAFE_TLD =
    /^\.(com|net|org|io|ai|co|app|dev|xyz|me|us|uk|ca|au|de|fr|in|info|biz|pro|shop|store|online|site|tech|cloud|fit|gym|club|health|care|clinic|life|live|world|global|agency|studio|design|media|blog|news|tv|fm|music|art|finance|money|bank|capital|fund|edu|academy|school|training|green|eco|energy|solar|earth|bio|organic|farm|food|cafe|menu|bar|kitchen|restaurant|travel|tours|hotel|gg|to|cc|ly|so|is|at|it|nl|se|no|es|mx|br|jp|kr|cn|sg|hk|nz|za|ie|ch|be|pl|pt|digital|solutions|services|group|company|space|zone|today|now|one|website|web|link|game|games|esports|law|legal|home|house|realty|homes|properties|work|works|tools|systems|network|networks)$/i;

  const cleanedPartialTlds = (partial?.preferredTlds || [])
    .map((t) => (t.startsWith('.') ? t.toLowerCase() : `.${t.toLowerCase()}`))
    .filter((t) => SAFE_TLD.test(t));

  const preferredTlds =
    cleanedPartialTlds.length > 0
      ? Array.from(new Set(cleanedPartialTlds)).slice(0, 8)
      : defaultTlds(style, vertical, partial?.industry);

  const count = Math.min(Math.max(partial?.count ?? 10, 3), 25);

  const fromText = parseStrategiesFromText(description);
  let strategies = normalizeStrategies(
    partial?.strategies?.length
      ? partial.strategies
      : fromText.length
        ? fromText
        : style === 'brandable'
          ? ['brandable', 'short', 'radio_test', 'available_first', 'com_priority', 'no_hyphen', 'no_numbers']
          : style === 'geo'
            ? ['geo_local', 'available_first', 'com_priority', 'keyword_exact', 'short']
            : DEFAULT_STRATEGIES
  );

  // Geo briefs: keep geo_local primary — do not let default brandable strategies flip style
  if (style === 'geo') {
    strategies = normalizeStrategies(
      Array.from(
        new Set([
          'geo_local',
          'available_first',
          'com_priority',
          'keyword_exact',
          ...strategies.filter((s) => s !== 'brandable'),
        ])
      )
    );
  } else if (style === 'brandable' || strategies.includes('brandable')) {
    // Fashion / brandable briefs: stack inventiveness strategies
    strategies = normalizeStrategies(
      Array.from(
        new Set([
          'brandable',
          'short',
          'radio_test',
          'available_first',
          'com_priority',
          'no_hyphen',
          'no_numbers',
          ...strategies,
        ])
      )
    );
  }

  // Default budget: standard = prefer registerable, not ultra-premium aftermarket
  const budgetHint =
    partial?.budgetHint ||
    (strategies.includes('premium_ok') ? 'premium_ok' : 'standard');

  // Resolve style from strategies only when inference wasn't already geo
  // (DEFAULT_STRATEGIES includes brandable and must not override local/geo briefs)
  let resolvedStyle = style;
  if (!partial?.style && style !== 'geo') {
    if (strategies.includes('geo_local')) resolvedStyle = 'geo';
    else if (strategies.includes('keyword_exact')) resolvedStyle = 'keyword';
    else if (strategies.includes('brandable') && style === 'brandable') resolvedStyle = 'brandable';
    else resolvedStyle = style;
  }

  const mustInclude = (partial?.mustInclude || [])
    .map((k) => k.toLowerCase().trim().replace(/[^a-z0-9-]/g, ''))
    .filter((k) => k.length >= 2)
    .slice(0, 8);
  const avoid = (partial?.avoid || [])
    .map((k) => k.toLowerCase().trim().replace(/[^a-z0-9-]/g, ''))
    .filter((k) => k.length >= 2)
    .slice(0, 12);

  return {
    businessName: partial?.businessName?.trim() || undefined,
    description: description.slice(0, 2000),
    audience: partial?.audience?.trim() || undefined,
    industry: partial?.industry?.trim() || inferIndustryLabel(vertical, description),
    keywords: Array.from(new Set(keywords)).slice(0, 12),
    style: resolvedStyle,
    markets: partial?.markets,
    preferredTlds,
    mustInclude: mustInclude.length ? mustInclude : undefined,
    avoid: avoid.length ? avoid : undefined,
    strategies,
    maxLabelLength: partial?.maxLabelLength ?? (strategies.includes('short') ? 10 : undefined),
    budgetHint,
    count,
    maxBudgetUsd:
      partial?.maxBudgetUsd != null && partial.maxBudgetUsd > 0
        ? Math.min(partial.maxBudgetUsd, 100000)
        : undefined,
  };
}

/**
 * Primary stem for generation — never "premium" or request meta.
 * Prefer business name → strongest concept keyword → vertical root.
 */
export function primaryStem(brief: DomainBrief): string {
  if (brief.businessName) {
    const n = brief.businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (n.length >= 3 && !REQUEST_META_WORDS.has(n)) return n.slice(0, 16);
  }

  const vertical = detectVertical(brief.description, brief.keywords);
  const v = getVertical(vertical);

  // Prefer keywords that match vertical roots/triggers
  for (const k of brief.keywords) {
    const clean = k.replace(/[^a-z0-9]/g, '');
    if (clean.length < 3 || REQUEST_META_WORDS.has(clean)) continue;
    if (v.roots.includes(clean) || v.triggers.some((t) => t === clean || t.includes(clean))) {
      return clean.slice(0, 16);
    }
  }

  for (const k of brief.keywords) {
    const clean = k.replace(/[^a-z0-9]/g, '');
    if (clean.length >= 3 && !REQUEST_META_WORDS.has(clean)) return clean.slice(0, 16);
  }

  const concepts = extractConceptWords(brief.description, 5);
  if (concepts[0]) return concepts[0].slice(0, 16);

  // Vertical default root
  if (v.roots[0]) return v.roots[0].slice(0, 16);
  return 'brand';
}

export function resolveVertical(brief: DomainBrief): VerticalId {
  return detectVertical(brief.description, brief.keywords);
}
