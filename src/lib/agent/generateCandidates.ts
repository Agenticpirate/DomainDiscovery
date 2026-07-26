/**
 * Industry-aware candidate domain generation.
 * Brand Brain invents true brandables (offline + optional Anthropic);
 * generic keyword mashups are filtered so we don't waste availability checks.
 */

import {
  generateDomainVariationsViaMCP,
  searchDomainsViaMCP,
} from '@/lib/instantDomainMCP';
import { useInstantDomainMcp } from '@/lib/ada/freeMode';
import type { DomainBrief } from './types';
import { primaryStem, resolveVertical } from './brief';
import {
  generateVerticalLabels,
  getVertical,
  REQUEST_META_WORDS,
  scoreIndustryFit,
} from './brandNamingKnowledge';
import {
  inventOfflineBrandables,
  inventWithAnthropic,
  isGenericKeywordMashup,
  labelsToDomains,
  scoreInventedBrandability,
} from './brandBrain';

function normalizeLabel(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24);
}

function withTlds(label: string, tlds: string[]): string[] {
  const clean = normalizeLabel(label);
  if (clean.length < 3) return [];
  if (REQUEST_META_WORDS.has(clean)) return [];
  if (isGenericKeywordMashup(clean)) return [];
  return tlds.map((t) => {
    const tld = t.startsWith('.') ? t : `.${t}`;
    return `${clean}${tld}`;
  });
}

/**
 * Build candidates: vertical patterns first, then geo/mustInclude, light MCP seeds.
 * Sorted so highest industry-fit labels pair with .com first.
 */
function combinatorial(brief: DomainBrief, stem: string, limit: number): string[] {
  const vertical = resolveVertical(brief);
  const v = getVertical(vertical);
  const tlds = brief.preferredTlds.length
    ? brief.preferredTlds
    : v.tldBoost;
  // Always try .com first for registrable preference
  const orderedTlds = Array.from(
    new Set(['.com', ...tlds.map((t) => (t.startsWith('.') ? t : `.${t}`))])
  );

  const kws = brief.keywords
    .map(normalizeLabel)
    .filter((k) => k.length >= 2 && !REQUEST_META_WORDS.has(k));

  const labels = generateVerticalLabels(vertical, kws, stem, Math.min(limit * 2, 120));

  // Geo markets
  if (brief.style === 'geo' && brief.markets?.length) {
    for (const market of brief.markets.slice(0, 8)) {
      const m = normalizeLabel(market);
      if (!m) continue;
      for (const s of [stem, ...kws.slice(0, 3)]) {
        labels.push(`${m}${s}`, `${s}${m}`);
      }
    }
  }

  for (const m of brief.mustInclude || []) {
    const x = normalizeLabel(m);
    if (x) labels.push(x);
  }

  // Dedupe labels, rank by industry fit
  const uniqueLabels = Array.from(new Set(labels.map(normalizeLabel).filter(Boolean)));
  uniqueLabels.sort(
    (a, b) => scoreIndustryFit(b, vertical, kws) - scoreIndustryFit(a, vertical, kws)
  );

  const out: string[] = [];
  const seen = new Set<string>();
  const avoid = (brief.avoid || []).map(normalizeLabel).filter(Boolean);

  for (const label of uniqueLabels) {
    if (avoid.some((a) => a && label.includes(a))) continue;
    if (isGenericKeywordMashup(label)) continue;
    // Drop weak off-category labels early (keeps gym list from becoming "getpremiumly.com")
    const fit = scoreIndustryFit(label, vertical, kws);
    const invent = scoreInventedBrandability(label);
    // For brandable style, require inventiveness; industry fit alone is not enough
    if (brief.style === 'brandable') {
      if (invent < 45 && fit < 55) continue;
      if (isGenericKeywordMashup(label)) continue;
    } else if (fit < 28 && vertical !== 'general') {
      continue;
    }

    // Prefer .com first, then a few alternates — increases chance of available registrable hits
    const tldSlice =
      invent >= 55 || fit >= 50
        ? orderedTlds.slice(0, 3)
        : orderedTlds.slice(0, 2);

    for (const domain of withTlds(label, tldSlice)) {
      const low = domain.toLowerCase();
      if (seen.has(low)) continue;
      seen.add(low);
      out.push(low);
      if (out.length >= limit) return out;
    }
  }

  return out;
}

export async function generateCandidateDomains(
  brief: DomainBrief,
  limit = 60
): Promise<{ domains: string[]; source: string }> {
  const stem = primaryStem(brief);
  const vertical = resolveVertical(brief);
  const preferBrandable =
    brief.style === 'brandable' ||
    /fashion|cloth|apparel|wear|boutique|streetwear|minimal.*wear|clothing/i.test(
      brief.description
    );

  // ── Brand Brain: offline inventives (always free) ──
  const offlineLabels = inventOfflineBrandables(
    brief,
    vertical,
    preferBrandable ? Math.max(limit, 48) : 24
  );
  const tlds = brief.preferredTlds.length
    ? brief.preferredTlds
    : getVertical(vertical).tldBoost;
  const fromBrain = labelsToDomains(offlineLabels, tlds, Math.max(limit, 40));

  // ── Optional Anthropic invention (when paid LLM configured) ──
  const llm = await inventWithAnthropic(brief, preferBrandable ? 18 : 10);
  const fromLlm = labelsToDomains(llm.labels, tlds, 36);

  // ── Classic vertical compounds (filtered hard) ──
  const local = combinatorial(brief, stem, Math.max(limit, preferBrandable ? 40 : 80));

  // Instant Domain MCP — only seed with *inventive* labels to avoid flooding with taken generics
  const fromMcp: string[] = [];
  if (useInstantDomainMcp()) {
    try {
      const v = getVertical(vertical);
      const inventiveSeeds = Array.from(
        new Set(
          [
            ...offlineLabels.slice(0, 8),
            ...llm.labels.slice(0, 6),
            ...local
              .slice(0, 8)
              .map((d) => d.split('.')[0])
              .filter((l) => scoreInventedBrandability(l) >= 50 && !isGenericKeywordMashup(l)),
          ].filter((s) => s && s.length >= 4 && s.length <= 11 && !REQUEST_META_WORDS.has(s))
        )
      ).slice(0, 6);

      if (inventiveSeeds.length) {
        const variationBatches = await Promise.all(
          inventiveSeeds.slice(0, 4).map((seed) =>
            generateDomainVariationsViaMCP({ keyword: seed, count: 10 }).catch(() => [])
          )
        );
        for (const vars of variationBatches) {
          for (const item of vars) {
            if (!item.domain) continue;
            const low = item.domain.toLowerCase();
            const label = low.split('.')[0] || '';
            if (isGenericKeywordMashup(label)) continue;
            if (scoreInventedBrandability(label) < 42) continue;
            // Prefer already-available hits from Instant Domain
            if (item.available === true || scoreInventedBrandability(label) >= 55) {
              fromMcp.push(low);
            }
          }
        }

        // Search only inventive seeds (not "clothing") — saves API + better brandables
        const searchTlds = (brief.preferredTlds?.length ? brief.preferredTlds : v.tldBoost)
          .map((t) => (t.startsWith('.') ? t : `.${t}`))
          .slice(0, 3);
        const searchBatches = await Promise.all(
          inventiveSeeds.slice(0, 4).map((q) =>
            searchDomainsViaMCP({ query: q, tlds: searchTlds }).catch(() => [])
          )
        );
        for (const hits of searchBatches) {
          for (const item of hits) {
            if (!item.domain) continue;
            const low = item.domain.toLowerCase();
            const label = low.split('.')[0] || '';
            if (isGenericKeywordMashup(label)) continue;
            // Only keep if Instant Domain says available OR strong inventiveness
            if (item.available === true) {
              fromMcp.push(low);
            } else if (
              item.available !== false &&
              scoreInventedBrandability(label) >= 60 &&
              label.length <= 10
            ) {
              fromMcp.push(low);
            }
          }
        }
      }
    } catch {
      // MCP down — brain + local still fine
    }
  }

  // Merge: LLM inventives → offline brain → MCP available hits → filtered vertical
  // Brandable style deprioritizes keyword compounds
  const merged = preferBrandable
    ? [...fromLlm, ...fromBrain, ...fromMcp, ...local]
    : [...fromLlm, ...local, ...fromBrain, ...fromMcp];

  const seen = new Set<string>();
  const scored: { d: string; s: number }[] = [];
  for (const d of merged) {
    const low = d.toLowerCase();
    if (!low.includes('.') || seen.has(low)) continue;
    const tld = low.slice(low.indexOf('.'));
    if (tld.length > 12) continue;
    const label = low.split('.')[0];
    if ((brief.avoid || []).some((a) => label.includes(normalizeLabel(a)))) continue;
    if (isGenericKeywordMashup(label)) continue;
    seen.add(low);
    let s = scoreInventedBrandability(label);
    if (preferBrandable) s += low.endsWith('.com') ? 3 : 0;
    scored.push({ d: low, s });
  }

  scored.sort((a, b) => b.s - a.s);
  const domains = scored.slice(0, limit).map((x) => x.d);

  const parts = [
    llm.labels.length ? llm.source : null,
    offlineLabels.length ? 'brain-offline' : null,
    fromMcp.length ? 'mcp-inventive' : null,
    'vertical-filtered',
  ].filter(Boolean);

  return {
    domains,
    source: parts.join('+') || 'vertical-local',
  };
}
