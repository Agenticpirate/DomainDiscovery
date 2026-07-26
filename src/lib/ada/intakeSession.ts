/**
 * Guided discovery intake for ADA chat — collect brief prefs before ranking.
 *
 * Steps:
 * 1. business description
 * 2. preferred TLDs / extensions
 * 3. keywords to include
 * 4. keywords to avoid
 * 5. naming strategies (radio test, brandable, keyword, short, …)
 * 6. budget (optional if already set)
 * 7. ready → run ranking
 */

import type { DomainBrief, DomainStyle } from '@/lib/agent/types';
import {
  DEFAULT_STRATEGIES,
  DOMAIN_STRATEGIES,
  normalizeStrategies,
  parseStrategiesFromText,
  type DomainNamingStrategy,
} from '@/lib/agent/domainStrategies';

export type IntakeStep =
  | 'business'
  | 'extensions'
  | 'include'
  | 'avoid'
  | 'strategies'
  | 'budget'
  | 'ready';

export type IntakeState = {
  step: IntakeStep;
  description: string;
  preferredTlds: string[];
  mustInclude: string[];
  avoid: string[];
  strategies: DomainNamingStrategy[];
  maxBudgetUsd?: number;
  style?: DomainStyle;
  markets?: string[];
  /** User said skip / use defaults */
  skipped: Partial<Record<IntakeStep, boolean>>;
};

export const INTAKE_STEPS: IntakeStep[] = [
  'business',
  'extensions',
  'include',
  'avoid',
  'strategies',
  'budget',
  'ready',
];

export function emptyIntake(maxBudgetUsd?: number): IntakeState {
  return {
    step: 'business',
    description: '',
    preferredTlds: [],
    mustInclude: [],
    avoid: [],
    strategies: [...DEFAULT_STRATEGIES],
    maxBudgetUsd,
    skipped: {},
  };
}

export function parseList(text: string): string[] {
  return text
    .split(/[,;\n|/]+/)
    .map((s) => s.trim().toLowerCase().replace(/^#+/, ''))
    .map((s) => s.replace(/[^a-z0-9.-]/g, ''))
    .filter((s) => s.length >= 1 && s !== 'none' && s !== 'skip' && s !== 'n/a' && s !== '-');
}

/**
 * Real / common TLDs only — never treat prose words ("need", "brandable", "domain") as extensions.
 * Accepts: ".com", "com", "tlds: .io .ai", "prefer .com and .fit"
 */
const KNOWN_TLDS = new Set(
  [
    'com', 'net', 'org', 'io', 'ai', 'co', 'app', 'dev', 'xyz', 'me', 'us', 'uk', 'ca', 'au',
    'de', 'fr', 'in', 'info', 'biz', 'pro', 'shop', 'store', 'online', 'site', 'tech', 'cloud',
    'fit', 'gym', 'club', 'health', 'care', 'clinic', 'life', 'live', 'world', 'global',
    'agency', 'studio', 'design', 'media', 'blog', 'news', 'tv', 'fm', 'music', 'art',
    'finance', 'money', 'bank', 'capital', 'fund', 'edu', 'academy', 'school', 'training',
    'green', 'eco', 'energy', 'solar', 'earth', 'bio', 'organic', 'farm',
    'food', 'cafe', 'menu', 'bar', 'kitchen', 'restaurant',
    'travel', 'tours', 'hotel', 'vacations',
    'gg', 'to', 'cc', 'tv', 'ly', 'so', 'is', 'at', 'it', 'nl', 'se', 'no', 'es', 'mx', 'br',
    'jp', 'kr', 'cn', 'sg', 'hk', 'nz', 'za', 'ie', 'ch', 'be', 'pl', 'pt',
    'digital', 'solutions', 'services', 'group', 'company', 'ltd', 'inc',
    'space', 'zone', 'today', 'now', 'one', 'website', 'web', 'link',
    'game', 'games', 'esports', 'bet', 'casino',
    'law', 'legal', 'attorney', 'doctor', 'dental', 'vet',
    'home', 'house', 'realty', 'homes', 'properties',
    'work', 'works', 'tools', 'systems', 'network', 'networks',
  ].map((t) => t.toLowerCase())
);

/** False positives that look like TLDs but are English words in briefs */
const TLD_FALSE_POSITIVES = new Set([
  'need', 'want', 'find', 'name', 'names', 'brand', 'brands', 'domain', 'domains',
  'brandable', 'premium', 'budget', 'max', 'under', 'with', 'from', 'that', 'this',
  'for', 'the', 'and', 'any', 'all', 'best', 'good', 'great', 'busy', 'professional',
  'professionals', 'business', 'company', 'startup', 'website', 'available', 'register',
  'include', 'avoid', 'strategy', 'strategies', 'radio', 'test', 'short', 'keyword',
  'please', 'help', 'looking', 'suggest', 'generate', 'shortlist', 'rank',
]);

export function isKnownTld(token: string): boolean {
  const t = token.toLowerCase().replace(/^\./, '').replace(/[^a-z0-9]/g, '');
  if (!t || t.length < 2 || t.length > 14) return false;
  if (TLD_FALSE_POSITIVES.has(t)) return false;
  return KNOWN_TLDS.has(t);
}

export function parseTlds(text: string): string[] {
  const raw = text.toLowerCase();
  if (/\b(any|default|skip|none|whatever)\b/.test(raw) && !/\.[a-z]{2,}/.test(raw)) {
    return [];
  }

  const tlds: string[] = [];
  const push = (token: string) => {
    const bare = token.toLowerCase().replace(/^\./, '').replace(/[^a-z0-9]/g, '');
    if (!isKnownTld(bare)) return;
    const t = `.${bare}`;
    if (!tlds.includes(t)) tlds.push(t);
  };

  // 1) Explicit dotted extensions: .com .io .fit
  const dotted = raw.match(/\.(?:[a-z]{2,14})\b/g) || [];
  for (const token of dotted) {
    push(token);
  }

  // 2) Labeled lists: "tlds: com, io" / "extensions: com and fit"
  const labeled = raw.match(
    /(?:tlds?|extensions?|prefer(?:red)?(?:\s+extensions?)?)\s*[:=]?\s*([a-z0-9.,\s/.+-]{2,80})/i
  );
  if (labeled?.[1]) {
    for (const part of labeled[1].split(/[\s,;/|]+/)) {
      if (part) push(part);
    }
  }

  // 3) "prefer .com and .ai" already covered by dotted match
  // Bare words only when clearly listed after "only" pattern with known tlds
  // Never scan all prose words (that produced .need .brandable .domain).

  return tlds.slice(0, 8);
}

export function isSkip(text: string): boolean {
  return /^(skip|none|n\/a|na|default|any|whatever|no preference|nope|-)$/i.test(text.trim());
}

export function isReadyToRank(text: string): boolean {
  return /\b(rank|search|find|go|ready|done|generate|shortlist|run|start)\b/i.test(text);
}

/** Apply user reply to current step; advance */
export function applyIntakeReply(state: IntakeState, reply: string): IntakeState {
  const text = reply.trim();
  const next = { ...state, skipped: { ...state.skipped } };

  switch (state.step) {
    case 'business': {
      next.description = text.slice(0, 2000);
      // Pull strategy hints from first message
      const hinted = parseStrategiesFromText(text);
      if (hinted.length) next.strategies = normalizeStrategies([...next.strategies, ...hinted]);
      const budget = text.match(/under\s*\$?\s*(\d{1,5})|\$\s*(\d{1,5})/i);
      if (budget) {
        next.maxBudgetUsd = Math.min(Number(budget[1] || budget[2]), 100000);
      }
      next.step = 'extensions';
      break;
    }
    case 'extensions': {
      if (isSkip(text)) {
        next.skipped.extensions = true;
        next.preferredTlds = ['.com', '.co', '.io', '.ai'];
      } else {
        const tlds = parseTlds(text);
        next.preferredTlds = tlds.length ? tlds : ['.com'];
      }
      next.step = 'include';
      break;
    }
    case 'include': {
      if (isSkip(text)) {
        next.skipped.include = true;
        next.mustInclude = [];
      } else {
        next.mustInclude = parseList(text).map((s) => s.replace(/^\./, '')).slice(0, 8);
      }
      next.step = 'avoid';
      break;
    }
    case 'avoid': {
      if (isSkip(text)) {
        next.skipped.avoid = true;
        next.avoid = [];
      } else {
        next.avoid = parseList(text).map((s) => s.replace(/^\./, '')).slice(0, 12);
      }
      next.step = 'strategies';
      break;
    }
    case 'strategies': {
      if (isSkip(text)) {
        next.skipped.strategies = true;
        next.strategies = [...DEFAULT_STRATEGIES];
      } else {
        const fromText = parseStrategiesFromText(text);
        // Also map labels like "1,3,5" or strategy short names
        const byLabel = DOMAIN_STRATEGIES.filter(
          (s) =>
            text.toLowerCase().includes(s.id.replace(/_/g, ' ')) ||
            text.toLowerCase().includes(s.short.toLowerCase()) ||
            text.toLowerCase().includes(s.label.toLowerCase())
        ).map((s) => s.id);
        const nums = text.match(/\b(\d{1,2})\b/g);
        if (nums) {
          for (const n of nums) {
            const idx = Number(n) - 1;
            if (DOMAIN_STRATEGIES[idx]) byLabel.push(DOMAIN_STRATEGIES[idx].id);
          }
        }
        next.strategies = normalizeStrategies(
          fromText.length || byLabel.length ? [...fromText, ...byLabel] : DEFAULT_STRATEGIES
        );
      }
      next.step = next.maxBudgetUsd ? 'ready' : 'budget';
      break;
    }
    case 'budget': {
      if (isSkip(text)) {
        next.skipped.budget = true;
      } else {
        const m = text.match(/(\d{1,5})/);
        if (m) next.maxBudgetUsd = Math.min(Number(m[1]), 100000);
      }
      next.step = 'ready';
      break;
    }
    case 'ready':
      break;
  }

  return next;
}

export function intakeQuestion(state: IntakeState): { message: string; suggestions: string[] } {
  switch (state.step) {
    case 'business':
      return {
        message:
          "Let's build a proper domain brief.\n\n**1/5 — Business**\nWhat does the business do? (industry, audience, product)",
        suggestions: [
          'Gym for busy professionals',
          'Yoga studio in Austin',
          'B2B SaaS analytics for ecommerce',
        ],
      };
    case 'extensions':
      return {
        message:
          `Got it: “${state.description.slice(0, 80)}${state.description.length > 80 ? '…' : ''}”\n\n**2/5 — Preferred extensions (TLDs)**\nWhich endings should we prioritize? e.g. \`.com .io .ai\` or type **skip** for defaults (.com first).`,
        suggestions: ['.com', '.com .co .io', '.com .ai .app', 'skip'],
      };
    case 'include':
      return {
        message:
          `**3/5 — Keywords to include**\nWords that should appear in the domain when possible (comma-separated). Type **none** or **skip** if open.`,
        suggestions: ['fit, strength', 'yoga, flow', 'none', 'skip'],
      };
    case 'avoid':
      return {
        message:
          `**4/5 — Keywords to avoid**\nWords or fragments to never use (comma-separated). Type **none** or **skip**.`,
        suggestions: ['cheap, xxx, free', 'none', 'skip'],
      };
    case 'strategies':
      return {
        message:
          `**5/5 — Naming strategies** (pick several)\nThese drive ranking:\n\n` +
          DOMAIN_STRATEGIES.map((s, i) => `${i + 1}. **${s.label}** — ${s.description}`).join(
            '\n'
          ) +
          `\n\nReply with numbers or names (e.g. \`1 2 3 7\` or \`radio test, brandable, short\`). Type **skip** for defaults (available-first + radio + brandable + .com).`,
        suggestions: [
          'radio test, brandable, short',
          '1 2 3 5 7 8',
          'keyword, .com priority',
          'skip',
        ],
      };
    case 'budget':
      return {
        message:
          `**Budget**\nMax registration research budget in USD? (e.g. \`20\`). Type **skip** if unknown.`,
        suggestions: ['15', '20', '50', 'skip'],
      };
    case 'ready':
      return {
        message: formatIntakeSummary(state) + `\n\nReply **rank** to generate the shortlist, or change any preference.`,
        suggestions: ['rank', 'change extensions', 'change strategies'],
      };
  }
}

export function formatIntakeSummary(state: IntakeState): string {
  const lines = [
    '**Brief ready**',
    `• Business: ${state.description.slice(0, 120)}${state.description.length > 120 ? '…' : ''}`,
    `• Extensions: ${(state.preferredTlds.length ? state.preferredTlds : ['.com']).join(' ')}`,
    `• Include: ${state.mustInclude.length ? state.mustInclude.join(', ') : '—'}`,
    `• Avoid: ${state.avoid.length ? state.avoid.join(', ') : '—'}`,
    `• Strategies: ${state.strategies.map((s) => s.replace(/_/g, ' ')).join(', ')}`,
    `• Budget: ${state.maxBudgetUsd != null ? `$${state.maxBudgetUsd}` : 'not set'}`,
  ];
  return lines.join('\n');
}

export function intakeToBriefPartial(state: IntakeState): Partial<DomainBrief> {
  return {
    description: state.description,
    preferredTlds: state.preferredTlds.length ? state.preferredTlds : ['.com', '.co', '.io'],
    mustInclude: state.mustInclude,
    avoid: state.avoid,
    strategies: state.strategies,
    maxBudgetUsd: state.maxBudgetUsd,
    style: state.style,
    markets: state.markets,
    count: 10,
  };
}

/** Merge free-form “I want X” without full intake when user dumps everything at once */
export function tryParseFullBrief(text: string): Partial<IntakeState> | null {
  const tlds = parseTlds(text);
  const includeM = text.match(/include[sd]?:?\s*([^.!\n]+)/i);
  const avoidM = text.match(/avoid:?\s*([^.!\n]+)/i);
  const strategies = parseStrategiesFromText(text);
  // Only treat as "rich" if we have real TLDs, include/avoid lists, or named strategies —
  // not when strategies alone fire from the word "brandable" in normal prose.
  const hasRealTlds = tlds.length > 0;
  const hasInclude = Boolean(includeM?.[1]?.trim());
  const hasAvoid = Boolean(avoidM?.[1]?.trim());
  const hasExplicitStrategy =
    strategies.length > 0 &&
    /\b(radio\s*test|available[_\s-]?first|keyword|no[_\s-]?hyphen|no[_\s-]?numbers|com[_\s-]?priority|premium[_\s-]?ok|geo[_\s-]?local|easy[_\s-]?spell)\b/i.test(
      text
    );

  if (!hasRealTlds && !hasInclude && !hasAvoid && !hasExplicitStrategy) return null;

  return {
    // undefined preferredTlds → pipeline uses vertical defaults (.com first)
    preferredTlds: hasRealTlds ? tlds : undefined,
    mustInclude: hasInclude ? parseList(includeM![1]) : [],
    avoid: hasAvoid ? parseList(avoidM![1]) : [],
    strategies: hasExplicitStrategy ? normalizeStrategies(strategies) : undefined,
  };
}
