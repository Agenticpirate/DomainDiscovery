/**
 * Auto mode pipeline: brief → generate → check → rank → refine.
 */

import { checkDomainAvailabilityViaMCP } from '@/lib/instantDomainMCP';
import { checkDomainsFreeRdap } from '@/lib/ada/freeDomainCheck';
import { useInstantDomainMcp } from '@/lib/ada/freeMode';
import { resolveRegisterUrl } from '@/lib/registrars';
import { parseBusinessBrief } from './brief';
import { generateCandidateDomains } from './generateCandidates';
import { rankDomains } from './ranker';
import { applyBudgetToRanked, sortByBudgetPreference } from './budget';
import { selectForAvailabilityCheck, isGenericKeywordMashup } from './brandBrain';
import type {
  AgentAutoRequest,
  AgentAutoResult,
  AgentJob,
  AgentJobStep,
  DomainBrief,
  RankedDomain,
} from './types';
import { AGENT_DISCLAIMER } from './types';
import {
  getAgentJobDurable,
  getAgentJobMemory,
  saveAgentJob,
  updateAgentJob,
} from '@/lib/scale/jobStore';
import { withHeavySlot } from '@/lib/scale/concurrency';

const CHECK_BATCH = 24;
/** Generate inventives offline; live checks are capped to protect API limits */
const MAX_CANDIDATES = 100;
/** First-pass availability checks (only top inventives) */
const MAX_AVAIL_CHECKS = 40;
/** Extra checks per refine loop when shortlist needs more *available* names */
const REFINE_CHECK = 20;
const MAX_REFINE = 3;

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  return `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

async function checkBatch(
  domains: string[]
): Promise<Map<string, { available: boolean; premium?: boolean; price?: string; buyUrl?: string }>> {
  const map = new Map<string, { available: boolean; premium?: boolean; price?: string; buyUrl?: string }>();
  // Same free Instant Domain MCP stack as main DomainDiscovery site (default ON)
  const preferInstantMcp = useInstantDomainMcp();

  for (let i = 0; i < domains.length; i += CHECK_BATCH) {
    const slice = domains.slice(i, i + CHECK_BATCH);
    try {
      if (preferInstantMcp) {
        const results = await checkDomainAvailabilityViaMCP({ domains: slice });
        if (results.length > 0) {
          for (const r of results) {
            map.set(r.domain.toLowerCase(), {
              available: r.available,
              premium: r.premium,
              price: r.price,
              buyUrl: r.buyUrl,
            });
          }
          continue;
        }
        // MCP empty/down → free RDAP fallback (still no paid key)
        const fallback = await checkDomainsFreeRdap(slice);
        for (const r of fallback) {
          map.set(r.domain.toLowerCase(), {
            available: r.available,
            premium: r.premium,
            price: r.price,
            buyUrl: r.buyUrl,
          });
        }
      } else {
        const results = await checkDomainsFreeRdap(slice);
        for (const r of results) {
          map.set(r.domain.toLowerCase(), {
            available: r.available,
            premium: r.premium,
            price: r.price,
            buyUrl: r.buyUrl,
          });
        }
      }
    } catch {
      // leave unchecked; optional RDAP recovery
      try {
        const fallback = await checkDomainsFreeRdap(slice);
        for (const r of fallback) {
          if (!map.has(r.domain.toLowerCase())) {
            map.set(r.domain.toLowerCase(), {
              available: r.available,
              premium: r.premium,
              price: r.price,
              buyUrl: r.buyUrl,
            });
          }
        }
      } catch {
        /* ignore */
      }
    }
  }
  return map;
}

function attachBuyUrls(ranked: RankedDomain[]): RankedDomain[] {
  return ranked.map((r) => ({
    ...r,
    buyUrl:
      r.buyUrl ||
      (r.available ? resolveRegisterUrl(r.domain, 'Spaceship') : r.buyUrl),
  }));
}

export async function runAutoPipeline(
  request: AgentAutoRequest,
  onStep?: (step: AgentJobStep) => void
): Promise<AgentAutoResult> {
  const started = Date.now();
  const text = request.text || request.brief?.description || '';
  const brief: DomainBrief = parseBusinessBrief(text, request.brief);

  const emit = (step: Omit<AgentJobStep, 'at'>) => {
    const full = { ...step, at: nowIso() };
    onStep?.(full);
  };

  emit({
    id: 'brief',
    label: 'Parsed business brief',
    status: 'done',
    detail: `${brief.style} · ${brief.keywords.slice(0, 5).join(', ')}`,
  });

  emit({ id: 'generate', label: 'Brand brain inventing candidates', status: 'running' });
  let { domains, source } = await generateCandidateDomains(brief, MAX_CANDIDATES);
  // Drop generic mashups before any network spend
  domains = domains.filter((d) => !isGenericKeywordMashup(d.split('.')[0] || d));
  emit({
    id: 'generate',
    label: 'Brand brain inventing candidates',
    status: 'done',
    detail: `${domains.length} inventives (${source})`,
  });

  let checked = new Map<string, { available: boolean; premium?: boolean; price?: string; buyUrl?: string }>();
  let refineLoops = 0;

  if (!request.skipAvailability) {
    // Only check the most brandable / likely-open names — never waste API on clothingthread-style junk
    const toCheck = selectForAvailabilityCheck(domains, MAX_AVAIL_CHECKS);
    emit({
      id: 'check',
      label: 'Checking availability (budget-aware)',
      status: 'running',
      detail: `${toCheck.length} of ${domains.length} inventives`,
    });
    checked = await checkBatch(toCheck);
    // Reorder domains: checked first (so ranker sees availability), then unchecked tail
    const checkedSet = new Set(toCheck.map((d) => d.toLowerCase()));
    domains = [
      ...toCheck,
      ...domains.filter((d) => !checkedSet.has(d.toLowerCase())),
    ];
    emit({
      id: 'check',
      label: 'Checking availability (budget-aware)',
      status: 'done',
      detail: `${checked.size} live checks · API budget saved on ${Math.max(0, domains.length - toCheck.length)} unchecked`,
    });
  } else {
    emit({ id: 'check', label: 'Availability check skipped', status: 'done' });
  }

  const toCandidates = (list: string[]) =>
    list.map((domain) => {
      const meta = checked.get(domain.toLowerCase());
      return {
        domain,
        available: meta ? meta.available : null,
        premium: meta?.premium,
        priceHint: meta?.price,
        buyUrl: meta?.buyUrl,
      };
    });

  emit({ id: 'rank', label: 'Ranking for brand fit', status: 'running' });
  let ranked = rankDomains(toCandidates(domains), brief);

  while (
    !request.skipAvailability &&
    ranked.filter((r) => r.available === true && !r.premium).length < brief.count &&
    refineLoops < MAX_REFINE
  ) {
    refineLoops += 1;
    emit({
      id: `refine_${refineLoops}`,
      label: `Finding more available brandables (pass ${refineLoops})`,
      status: 'running',
    });
    // More inventives only — never re-check generic mashups
    const more = await generateCandidateDomains(
      {
        ...brief,
        style: brief.style === 'keyword' ? brief.style : 'brandable',
        count: Math.min(25, brief.count + refineLoops * 2),
      },
      50 + refineLoops * 20
    );
    const already = new Set(domains.map((d) => d.toLowerCase()));
    const alreadyChecked = new Set(Array.from(checked.keys()));
    const fresh = more.domains
      .filter((d) => !already.has(d.toLowerCase()))
      .filter((d) => !isGenericKeywordMashup(d.split('.')[0] || d));
    // Prefer never-checked inventives for the API budget
    const uncheckedFresh = fresh.filter((d) => !alreadyChecked.has(d.toLowerCase()));
    const freshToCheck = selectForAvailabilityCheck(uncheckedFresh, REFINE_CHECK);
    domains = [...domains, ...fresh].slice(0, MAX_CANDIDATES + 40);
    const newChecked = await checkBatch(freshToCheck);
    Array.from(newChecked.entries()).forEach(([k, v]) => checked.set(k, v));
    ranked = rankDomains(toCandidates(domains), brief);
    const openN = ranked.filter((r) => r.available === true && !r.premium).length;
    emit({
      id: `refine_${refineLoops}`,
      label: `Finding more available brandables (pass ${refineLoops})`,
      status: 'done',
      detail: `+${freshToCheck.length} checks · ${openN} available open`,
    });
  }

  ranked = attachBuyUrls(ranked);

  const maxBudget =
    request.maxBudgetUsd ??
    brief.maxBudgetUsd ??
    undefined;
  ranked = sortByBudgetPreference(applyBudgetToRanked(ranked, maxBudget));
  if (maxBudget) {
    emit({
      id: 'budget',
      label: `Budget filter (≤ $${maxBudget})`,
      status: 'done',
      detail: `${ranked.filter((r) => r.budgetStatus === 'within').length} within · ${ranked.filter((r) => r.budgetStatus === 'over').length} over · ${ranked.filter((r) => r.budgetStatus === 'unknown').length} unknown price`,
    });
  }

  emit({ id: 'rank', label: 'Ranking for brand fit', status: 'done', detail: `${ranked.length} ranked` });

  // Shortlist policy: AVAILABLE inventives only when possible.
  // Brandable mode refuses to pad shortlist with unchecked keyword leftovers.
  const openReg = ranked.filter((r) => r.available === true && !r.premium);
  const openPrem = ranked.filter((r) => r.available === true && r.premium);
  const brandableMode =
    brief.style === 'brandable' || (brief.strategies || []).includes('brandable');
  const rest = ranked.filter((r) => r.available !== true && r.available !== false);
  const taken = ranked.filter((r) => r.available === false);
  let pool: RankedDomain[];
  if (openReg.length >= brief.count) {
    pool = openReg;
  } else if (openReg.length + openPrem.length >= brief.count) {
    pool = [...openReg, ...openPrem];
  } else if (brandableMode && openReg.length > 0) {
    // Prefer real available brandables; only then lightly pad with unchecked inventives
    pool = [...openReg, ...openPrem, ...rest];
  } else if (brandableMode) {
    // No confirmed available yet — show best inventives as candidates (availability unknown)
    pool = [...openReg, ...openPrem, ...rest];
  } else {
    pool = [...openReg, ...openPrem, ...rest, ...taken];
  }

  // Prefer within-budget in shortlist; still keep available-first order
  const preferBudget = (list: RankedDomain[]) => {
    if (!maxBudget) return list;
    const within = list.filter((r) => r.budgetStatus === 'within');
    const unknown = list.filter((r) => r.budgetStatus === 'unknown');
    const over = list.filter((r) => r.budgetStatus === 'over');
    return [...within, ...unknown, ...over];
  };
  // Diversify shortlist: avoid 8× same compound family (barbell*, iron*, …)
  const diversify = (list: RankedDomain[], n: number): RankedDomain[] => {
    const picked: RankedDomain[] = [];
    const usedPrefix = new Map<string, number>();
    const usedToken = new Map<string, number>();
    const tokens = [
      'barbell', 'iron', 'steel', 'strength', 'fitness', 'forge', 'pulse', 'core',
      'lift', 'gym', 'yoga', 'flow', 'breath', 'apex', 'prime', 'peak', 'true',
      'clothing', 'cloth', 'cart', 'rack', 'shop', 'store', 'wear', 'thread',
      'fashion', 'apparel', 'minimal',
    ];
    const keysOf = (domain: string): string[] => {
      const lab = (domain.split('.')[0] || domain).toLowerCase();
      const keys = [lab.slice(0, 5)];
      for (const t of tokens) {
        if (lab.includes(t)) keys.push(`t:${t}`);
      }
      return keys;
    };
    const canTake = (domain: string, maxToken = 2, maxPrefix = 2) => {
      for (const k of keysOf(domain)) {
        if (k.startsWith('t:')) {
          if ((usedToken.get(k) || 0) >= maxToken) return false;
        } else if ((usedPrefix.get(k) || 0) >= maxPrefix) {
          return false;
        }
      }
      return true;
    };
    const mark = (domain: string) => {
      for (const k of keysOf(domain)) {
        const map = k.startsWith('t:') ? usedToken : usedPrefix;
        map.set(k, (map.get(k) || 0) + 1);
      }
    };
    // Pass 1: strict diversity (max 2 per brand token family)
    for (const r of list) {
      if (picked.some((p) => p.domain === r.domain)) continue;
      if (!canTake(r.domain, 2, 2)) continue;
      mark(r.domain);
      picked.push(r);
      if (picked.length >= n) break;
    }
    // Pass 2: allow more prefix reuse, still hard-cap token families at 2
    if (picked.length < n) {
      for (const r of list) {
        if (picked.some((p) => p.domain === r.domain)) continue;
        if (!canTake(r.domain, 2, 4)) continue;
        mark(r.domain);
        picked.push(r);
        if (picked.length >= n) break;
      }
    }
    // Pass 3: score order only if still short
    if (picked.length < n) {
      for (const r of list) {
        if (picked.some((p) => p.domain === r.domain)) continue;
        picked.push(r);
        if (picked.length >= n) break;
      }
    }
    return picked;
  };

  const shortlist = diversify(
    preferBudget(pool).filter((r, i, arr) => arr.findIndex((x) => x.domain === r.domain) === i),
    brief.count
  );

  const shortlistSet = new Set(shortlist.map((s) => s.domain));
  const runnersUp = ranked.filter((r) => !shortlistSet.has(r.domain) && r.budgetStatus !== 'over').slice(0, 10);
  const overBudget = ranked.filter((r) => r.budgetStatus === 'over' && !shortlistSet.has(r.domain)).slice(0, 8);
  const rejected = ranked
    .filter((r) => r.breakdown.riskFlags.length > 0 || r.score < 40)
    .filter((r) => !shortlistSet.has(r.domain))
    .slice(0, 8);

  const availableCount = ranked.filter((r) => r.available === true).length;
  const withinBudgetCount = ranked.filter((r) => r.budgetStatus === 'within').length;

  return {
    brief: { ...brief, maxBudgetUsd: maxBudget },
    shortlist,
    runnersUp,
    rejected,
    overBudget,
    stats: {
      candidatesGenerated: domains.length,
      candidatesChecked: checked.size,
      availableCount,
      durationMs: Date.now() - started,
      refineLoops,
      maxBudgetUsd: maxBudget,
      withinBudgetCount,
    },
    nextActions: [
      'Re-check availability at registrar checkout before paying.',
      'Save favorites to your local shortlist on DomainDiscovery.',
      'Run WHOIS on aftermarket/premium names before negotiating.',
      'Compare renewal prices on /tools/compare for your chosen TLD.',
    ],
    disclaimer: AGENT_DISCLAIMER,
  };
}

export async function startAutoJob(
  request: AgentAutoRequest
): Promise<{ job: AgentJob; result?: AgentAutoResult }> {
  const id = newId();
  const job: AgentJob = {
    id,
    status: 'running',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    steps: [],
  };
  await saveAgentJob(job);

  const onStep = (step: AgentJobStep) => {
    // Fire-and-forget step persistence (durable when Redis is up)
    void updateAgentJob(id, (j) => {
      const idx = j.steps.findIndex((s) => s.id === step.id);
      if (idx >= 0) j.steps[idx] = step;
      else j.steps.push(step);
    });
  };

  const sync = request.sync !== false;

  const run = () => withHeavySlot(() => runAutoPipeline(request, onStep));

  if (sync) {
    try {
      const result = await run();
      job.status = 'completed';
      job.result = result;
      job.updatedAt = nowIso();
      await saveAgentJob(job);
      return { job, result };
    } catch (e) {
      job.status = 'failed';
      job.error = e instanceof Error ? e.message : 'Auto job failed';
      job.updatedAt = nowIso();
      await saveAgentJob(job);
      throw e;
    }
  }

  void (async () => {
    try {
      const result = await run();
      job.status = 'completed';
      job.result = result;
    } catch (e) {
      job.status = 'failed';
      job.error = e instanceof Error ? e.message : 'Auto job failed';
    }
    job.updatedAt = nowIso();
    await saveAgentJob(job);
  })();

  return { job };
}

/** Async durable read (Redis + memory). Prefer this in routes. */
export async function getAgentJobAsync(id: string): Promise<AgentJob | null> {
  return getAgentJobDurable(id);
}

/** Memory-first sync read (use getAgentJobAsync across instances). */
export function getAgentJob(id: string): AgentJob | null {
  return getAgentJobMemory(id);
}
