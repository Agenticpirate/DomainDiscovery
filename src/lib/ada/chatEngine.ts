/**
 * ADA chat engine: guided intake + SpaceXAI tools + domain ranking pipeline.
 */

import { runAutoPipeline } from '@/lib/agent/pipeline';
import { withHeavySlot } from '@/lib/scale/concurrency';
import { AGENT_DISCLAIMER } from '@/lib/agent/types';
import type { DomainBrief } from '@/lib/agent/types';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';
import { getAdaPublicUrl } from '@/lib/adaConfig';
import { normalizeStrategies } from '@/lib/agent/domainStrategies';
import {
  ADA_CHAT_SYSTEM,
  type ChatClientMessage,
  type ChatDomainResult,
  type ChatRequest,
  type ChatResponse,
} from './chatTypes';
import {
  ADA_CHAT_TOOLS,
  getXaiConfig,
  xaiChatCompletion,
  type XaiChatMessage,
  type XaiToolCall,
} from './spacexai';
import {
  applyIntakeReply,
  emptyIntake,
  formatIntakeSummary,
  intakeQuestion,
  intakeToBriefPartial,
  isKnownTld,
  isReadyToRank,
  isSkip,
  tryParseFullBrief,
  type IntakeState,
} from './intakeSession';

function wantsDomainResearch(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /\b(domain|domains|brand name|brandable|website name|url|tld|available|\.com)\b/.test(t) ||
    /\b(find|suggest|generate|shortlist|rank|name for|names for)\b/.test(t) ||
    /\b(gym|fitness|saas|cafe|clinic|shop|startup)\b/.test(t)
  );
}

function extractBudget(text: string, fallback?: number): number | undefined {
  if (fallback != null && fallback > 0) return fallback;
  const under = text.match(/under\s*\$?\s*(\d{1,5})/i);
  if (under) return Math.min(Number(under[1]), 100000);
  if (/budget|max|\$|usd|dollar/i.test(text)) {
    const m = text.match(/\$?\s*(\d{1,5})/);
    if (m) return Math.min(Number(m[1]), 100000);
  }
  return fallback;
}

function hydrateIntake(partial?: Partial<IntakeState> | null, maxBudgetUsd?: number): IntakeState {
  const base = emptyIntake(maxBudgetUsd);
  if (!partial) return base;
  return {
    ...base,
    ...partial,
    preferredTlds: partial.preferredTlds || base.preferredTlds,
    mustInclude: partial.mustInclude || base.mustInclude,
    avoid: partial.avoid || base.avoid,
    strategies: partial.strategies?.length
      ? normalizeStrategies(partial.strategies)
      : base.strategies,
    skipped: partial.skipped || {},
    step: partial.step || (partial.description ? partial.step || 'extensions' : 'business'),
  };
}

function sanitizePreferredTlds(list?: string[]): string[] | undefined {
  if (!list?.length) return undefined;
  // Allowlist only — never invent .need / .brandable / .domain from prose
  const clean = list
    .map((t) => (t.startsWith('.') ? t.toLowerCase() : `.${t.toLowerCase()}`))
    .filter((t) => isKnownTld(t));
  return clean.length ? Array.from(new Set(clean)).slice(0, 8) : undefined;
}

async function runFindBrandDomains(args: {
  text: string;
  maxBudgetUsd?: number;
  count?: number;
  skipAvailability?: boolean;
  preferredTlds?: string[];
  mustInclude?: string[];
  avoid?: string[];
  strategies?: string[];
}): Promise<ChatDomainResult> {
  const preferredTlds = sanitizePreferredTlds(args.preferredTlds);
  const briefPartial: Partial<DomainBrief> = {
    description: args.text,
    count: Math.min(Math.max(args.count ?? 8, 3), 15),
    maxBudgetUsd: args.maxBudgetUsd,
    preferredTlds,
    mustInclude: args.mustInclude,
    avoid: args.avoid,
    strategies: args.strategies
      ? normalizeStrategies(args.strategies as DomainBrief['strategies'])
      : undefined,
  };

  // Share heavy concurrency pool with agent auto / MCP shortlists
  const result = await withHeavySlot(() =>
    runAutoPipeline({
      text: args.text,
      brief: briefPartial,
      maxBudgetUsd: args.maxBudgetUsd,
      skipAvailability: Boolean(args.skipAvailability),
      sync: true,
    })
  );

  return {
    shortlist: result.shortlist,
    runnersUp: result.runnersUp,
    stats: result.stats,
    brief: result.brief,
    disclaimer: result.disclaimer || AGENT_DISCLAIMER,
  };
}

function formatDomainSummary(domains: ChatDomainResult): string {
  const lines: string[] = [];
  const b = domains.brief;
  const industry = b?.industry || b?.keywords?.slice(0, 4).join(', ') || 'your brief';
  lines.push(`**Ranked shortlist** for ${industry}`);
  if (b?.preferredTlds?.length) lines.push(`Extensions: ${b.preferredTlds.join(' ')}`);
  if (b?.mustInclude?.length) lines.push(`Include: ${b.mustInclude.join(', ')}`);
  if (b?.avoid?.length) lines.push(`Avoid: ${b.avoid.join(', ')}`);
  if (b?.strategies?.length) {
    lines.push(`Strategies: ${b.strategies.map((s) => s.replace(/_/g, ' ')).join(', ')}`);
  }
  lines.push('');

  if (!domains.shortlist.length) {
    lines.push('No strong candidates — loosen avoid list or try more extensions.');
  } else {
    domains.shortlist.forEach((d, i) => {
      const flags = [
        d.available === true ? 'available' : d.available === false ? 'taken' : 'unchecked',
        d.premium ? 'premium' : null,
        d.budgetStatus && d.budgetStatus !== 'within' ? `budget:${d.budgetStatus}` : null,
        `score ${d.score}`,
      ]
        .filter(Boolean)
        .join(' · ');
      lines.push(`${i + 1}. **${d.domain}** — ${flags}`);
      if (d.reasons?.[0]) lines.push(`   ${d.reasons[0]}`);
      if (d.reasons?.[1]) lines.push(`   ${d.reasons[1]}`);
    });
  }

  lines.push('');
  lines.push(
    '_Research only — not a registrar. Re-check at checkout. Ranking follows your strategies (radio test, available-first, etc.)._'
  );
  return lines.join('\n');
}

function agentAccessBlurb(topic: string): string {
  const base = getSiteBaseUrl();
  const ada = getAdaPublicUrl();
  const all = `**How AI agents interact with AI Domain Assistant**

### MCP
\`${base}/api/mcp\` → tool \`find_brand_domains\` with text, preferredTlds, mustInclude, avoid, strategies, maxBudgetUsd

### REST
\`POST ${base}/api/agent/auto\` with brief object including preferredTlds / mustInclude / avoid / strategies

### Chat
\`POST ${base}/api/ada/chat\` multi-turn intake or skipIntake:true with full brief
UI: \`${ada}/chat\`

### Strategies
available_first, radio_test, brandable, keyword_exact, short, easy_spell, no_hyphen, no_numbers, geo_local, com_priority, premium_ok`;

  if (topic === 'all') return all;
  return all;
}

async function executeTool(
  name: string,
  argsJson: string,
  defaults: { maxBudgetUsd?: number; skipAvailability?: boolean }
): Promise<{ text: string; domains?: ChatDomainResult }> {
  let args: Record<string, unknown> = {};
  try {
    args = JSON.parse(argsJson || '{}') as Record<string, unknown>;
  } catch {
    args = {};
  }

  if (name === 'find_brand_domains') {
    const text = String(args.text || '').trim();
    if (text.length < 4) {
      return { text: 'Need a longer business brief.' };
    }
    const domains = await runFindBrandDomains({
      text,
      maxBudgetUsd:
        typeof args.maxBudgetUsd === 'number' ? args.maxBudgetUsd : defaults.maxBudgetUsd,
      count: typeof args.count === 'number' ? args.count : 8,
      skipAvailability:
        typeof args.skipAvailability === 'boolean'
          ? args.skipAvailability
          : defaults.skipAvailability,
      preferredTlds: Array.isArray(args.preferredTlds)
        ? (args.preferredTlds as string[])
        : undefined,
      mustInclude: Array.isArray(args.mustInclude) ? (args.mustInclude as string[]) : undefined,
      avoid: Array.isArray(args.avoid) ? (args.avoid as string[]) : undefined,
      strategies: Array.isArray(args.strategies) ? (args.strategies as string[]) : undefined,
    });
    return { text: JSON.stringify(domains), domains };
  }

  if (name === 'explain_agent_access') {
    return { text: agentAccessBlurb(String(args.topic || 'all')) };
  }

  return { text: `Unknown tool: ${name}` };
}

function briefIsComplete(intake: IntakeState): boolean {
  return (
    intake.step === 'ready' &&
    intake.description.trim().length >= 8 &&
    (intake.preferredTlds.length > 0 || Boolean(intake.skipped.extensions))
  );
}

/**
 * Rules path: multi-turn intake then rank.
 */
async function rulesEngine(req: ChatRequest): Promise<ChatResponse> {
  const last = [...req.messages].reverse().find((m) => m.role === 'user');
  const text = last?.content?.trim() || '';
  if (!text) {
    return {
      success: false,
      message: 'Send a message describing your brand or domain needs.',
      engine: 'rules',
      error: 'empty',
    };
  }

  const lower = text.toLowerCase();
  if (/\b(mcp|agent card|how do agents|integrate|integration)\b/.test(lower)) {
    return {
      success: true,
      message: agentAccessBlurb('all'),
      engine: 'rules',
      suggestions: ['Start domain intake', 'Gym under $20 with radio test'],
      actions: [{ type: 'explain_agent_access', detail: 'all' }],
      intake: req.intake ? hydrateIntake(req.intake, req.maxBudgetUsd) : null,
    };
  }

  // Agent with full params / skipIntake → rank immediately
  if (req.skipIntake || req.client === 'agent') {
    const full = tryParseFullBrief(text);
    if (req.skipIntake || (full && text.length > 40) || wantsDomainResearch(text)) {
      const domains = await runFindBrandDomains({
        text,
        maxBudgetUsd: extractBudget(text, req.maxBudgetUsd),
        preferredTlds: full?.preferredTlds,
        mustInclude: full?.mustInclude,
        avoid: full?.avoid,
        strategies: full?.strategies,
        skipAvailability: req.skipAvailability,
      });
      return {
        success: true,
        message: formatDomainSummary(domains),
        engine: 'rules',
        domains,
        actions: [{ type: 'find_brand_domains', detail: 'direct' }],
        intake: null,
        awaitingIntake: false,
        suggestions: ['Tighten avoid list', 'Add radio test strategy', 'Prefer .com only'],
      };
    }
  }

  let intake = hydrateIntake(req.intake, req.maxBudgetUsd);

  // Fresh start
  if (!req.intake || (!intake.description && intake.step === 'business')) {
    if (wantsDomainResearch(text) || text.length >= 8) {
      // Rich one-shot with all prefs?
      const full = tryParseFullBrief(text);
      const hasRich =
        full &&
        ((full.preferredTlds && full.preferredTlds.length > 0) ||
          (full.mustInclude && full.mustInclude.length > 0) ||
          (full.strategies && full.strategies.length > 0));

      if (hasRich && /include:|avoid:|strategy|\.com/i.test(text)) {
        const domains = await runFindBrandDomains({
          text,
          maxBudgetUsd: extractBudget(text, req.maxBudgetUsd),
          preferredTlds: full!.preferredTlds,
          mustInclude: full!.mustInclude,
          avoid: full!.avoid,
          strategies: full!.strategies,
          skipAvailability: req.skipAvailability,
        });
        return {
          success: true,
          message: formatDomainSummary(domains),
          engine: 'rules',
          domains,
          intake: null,
          awaitingIntake: false,
          actions: [{ type: 'find_brand_domains', detail: 'oneshot_rich' }],
        };
      }

      intake = applyIntakeReply(emptyIntake(req.maxBudgetUsd), text);
      const q = intakeQuestion(intake);
      return {
        success: true,
        message: q.message,
        engine: 'rules',
        suggestions: q.suggestions,
        intake,
        awaitingIntake: true,
        actions: [{ type: 'intake', detail: intake.step }],
      };
    }

    const q = intakeQuestion(emptyIntake(req.maxBudgetUsd));
    return {
      success: true,
      message: `I'm **AI Domain Assistant**. I'll collect preferred extensions, include/avoid keywords, and ranking strategies (including the **radio test**), then shortlist available-first names.\n\n${q.message}`,
      engine: 'rules',
      suggestions: q.suggestions,
      intake: emptyIntake(req.maxBudgetUsd),
      awaitingIntake: true,
    };
  }

  // Continuing intake
  if (intake.step === 'ready') {
    if (isReadyToRank(text) || isSkip(text) || /^go$/i.test(text)) {
      const partial = intakeToBriefPartial(intake);
      const domains = await runFindBrandDomains({
        text: partial.description || text,
        maxBudgetUsd: partial.maxBudgetUsd ?? req.maxBudgetUsd,
        preferredTlds: partial.preferredTlds,
        mustInclude: partial.mustInclude,
        avoid: partial.avoid,
        strategies: partial.strategies,
        skipAvailability: req.skipAvailability,
      });
      return {
        success: true,
        message: formatDomainSummary(domains),
        engine: 'rules',
        domains,
        intake: null,
        awaitingIntake: false,
        actions: [{ type: 'find_brand_domains', detail: 'after_intake' }],
        suggestions: ['Run again with short strategy', 'Change TLDs to .com only'],
      };
    }
    if (/extension|tld/i.test(text)) {
      intake = { ...intake, step: 'extensions' };
    } else if (/strateg/i.test(text)) {
      intake = { ...intake, step: 'strategies' };
    } else if (/include/i.test(text)) {
      intake = { ...intake, step: 'include' };
    } else if (/avoid/i.test(text)) {
      intake = { ...intake, step: 'avoid' };
    } else {
      // Treat as new business restart
      intake = applyIntakeReply(emptyIntake(req.maxBudgetUsd), text);
    }
  } else {
    intake = applyIntakeReply(intake, text);
  }

  if (briefIsComplete(intake) && intake.step === 'ready') {
    const q = intakeQuestion(intake);
    return {
      success: true,
      message: q.message,
      engine: 'rules',
      suggestions: q.suggestions,
      intake,
      awaitingIntake: true,
      actions: [{ type: 'intake', detail: 'ready' }],
    };
  }

  const q = intakeQuestion(intake);
  return {
    success: true,
    message: q.message,
    engine: 'rules',
    suggestions: q.suggestions,
    intake,
    awaitingIntake: true,
    actions: [{ type: 'intake', detail: intake.step }],
  };
}

async function spacexaiEngine(req: ChatRequest): Promise<ChatResponse> {
  // Still prefer structured intake for incomplete web chats
  if (req.client !== 'agent' && !req.skipIntake) {
    const intake = hydrateIntake(req.intake, req.maxBudgetUsd);
    const last = [...req.messages].reverse().find((m) => m.role === 'user')?.content || '';
    if (!req.intake || intake.step !== 'ready' || !isReadyToRank(last)) {
      // Use rules intake for consistency; SpaceXAI only when ready or tool-heavy
      if (!req.intake || (intake.step !== 'ready' && last)) {
        return rulesEngine(req);
      }
    }
  }

  const history: XaiChatMessage[] = [
    { role: 'system', content: ADA_CHAT_SYSTEM },
    ...req.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-12)
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content.slice(0, 4000),
      })),
  ];

  let domains: ChatDomainResult | undefined;
  const actions: { type: string; detail: string }[] = [];
  let lastContent = '';

  for (let round = 0; round < 3; round++) {
    const completion = await xaiChatCompletion({
      messages: history,
      tools: ADA_CHAT_TOOLS,
      temperature: 0.35,
      maxTokens: 1400,
    });

    const msg = completion.choices?.[0]?.message;
    if (!msg) break;

    const toolCalls = msg.tool_calls as XaiToolCall[] | undefined;
    if (toolCalls?.length) {
      history.push({
        role: 'assistant',
        content: msg.content || null,
        tool_calls: toolCalls,
      });

      for (const tc of toolCalls) {
        const result = await executeTool(tc.function.name, tc.function.arguments, {
          maxBudgetUsd: req.maxBudgetUsd,
          skipAvailability: req.skipAvailability,
        });
        actions.push({ type: tc.function.name, detail: 'ok' });
        if (result.domains) domains = result.domains;
        history.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: result.text.slice(0, 12000),
        });
      }
      continue;
    }

    lastContent = (msg.content || '').trim();
    break;
  }

  if (domains && lastContent) {
    lastContent = `${lastContent}\n\n${formatDomainSummary(domains)}`;
  } else if (domains) {
    lastContent = formatDomainSummary(domains);
  }
  if (!lastContent) {
    lastContent =
      'Tell me about your business — then preferred TLDs, include/avoid keywords, and strategies (radio test, brandable, short…).';
  }

  return {
    success: true,
    message: lastContent,
    engine: domains ? 'hybrid' : 'spacexai',
    domains,
    actions,
    intake: req.intake ? hydrateIntake(req.intake, req.maxBudgetUsd) : null,
    awaitingIntake: !domains,
    suggestions: domains
      ? ['Change strategies', 'Prefer .com only', 'Add avoid list']
      : ['Start: gym for professionals', 'Explain radio test'],
  };
}

export async function runAdaChat(req: ChatRequest): Promise<ChatResponse> {
  const messages = (req.messages || []).filter(
    (m): m is ChatClientMessage =>
      (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
  );

  if (!messages.length) {
    return {
      success: false,
      message: 'messages[] required',
      engine: 'rules',
      error: 'invalid_request',
    };
  }

  const payload: ChatRequest = { ...req, messages };
  const { enabled } = getXaiConfig(); // false in free mode (default)

  try {
    // Default path: rules engine — zero LLM cost
    if (!enabled) {
      return await rulesEngine(payload);
    }
    // Optional paid LLM path (ADA_ALLOW_PAID_LLM=true + XAI_API_KEY only)
    if (req.skipIntake || req.client === 'agent') {
      return await spacexaiEngine(payload);
    }
    if (req.intake && hydrateIntake(req.intake).step === 'ready') {
      const last = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
      if (isReadyToRank(last)) {
        return await spacexaiEngine({ ...payload, skipIntake: true });
      }
    }
    return await rulesEngine(payload);
  } catch (e) {
    console.error('ADA chat engine error, falling back to rules:', e);
    const fallback = await rulesEngine(payload);
    return {
      ...fallback,
      engine: 'rules',
      message:
        fallback.message +
        '\n\n_Used free ranking engine (no paid LLM)._',
    };
  }
}
