/**
 * BYOK (Bring Your Own Key) request context for agent / skill calls.
 *
 * Keys travel only on the request (headers or JSON body). They are never
 * written to disk by this module. Use for:
 *  - LLM invention (Anthropic / OpenAI-compatible)
 *  - Future registrar adapters (register + DNS) with human confirm
 *
 * Free core path does not require any of these.
 */

import { AsyncLocalStorage } from 'node:async_hooks';

export type LlmProviderId = 'anthropic' | 'openai' | 'minimax' | 'xai' | 'openai-compatible';

export type ByokLlm = {
  provider: LlmProviderId;
  apiKey: string;
  model?: string;
  baseUrl?: string;
};

export type ByokRegistrar = {
  /** porkbun | namecheap | cloudflare | dynadot | godaddy | … */
  provider: string;
  apiKey: string;
  secret?: string;
  /** Required for live mutations (not dry-run) */
  humanConfirmToken?: string;
  /** Namecheap API user (defaults to api user) */
  username?: string;
  /** Namecheap ClientIp whitelist */
  clientIp?: string;
  /** Cloudflare account id */
  accountId?: string;
  /** Cloudflare global key email (optional) */
  email?: string;
};

export type ByokContext = {
  llm?: ByokLlm;
  registrar?: ByokRegistrar;
  /** Max registration spend the agent is allowed to authorize (USD) */
  maxBudgetUsd?: number;
};

const storage = new AsyncLocalStorage<ByokContext>();

export function getByokContext(): ByokContext {
  return storage.getStore() || {};
}

export function runWithByok<T>(ctx: ByokContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

export async function runWithByokAsync<T>(ctx: ByokContext, fn: () => Promise<T>): Promise<T> {
  return storage.run(ctx, fn);
}

/** Read BYOK from HTTP headers (preferred for agents). */
export function byokFromHeaders(headers: Headers): ByokContext {
  const llmKey =
    headers.get('x-ada-llm-api-key')?.trim() ||
    headers.get('x-llm-api-key')?.trim() ||
    '';
  const llmProvider = (
    headers.get('x-ada-llm-provider')?.trim() ||
    headers.get('x-llm-provider')?.trim() ||
    ''
  ).toLowerCase();
  const llmModel = headers.get('x-ada-llm-model')?.trim() || headers.get('x-llm-model')?.trim() || undefined;
  const llmBase =
    headers.get('x-ada-llm-base-url')?.trim() || headers.get('x-llm-base-url')?.trim() || undefined;

  const regKey =
    headers.get('x-ada-registrar-api-key')?.trim() ||
    headers.get('x-registrar-api-key')?.trim() ||
    '';
  const regProvider =
    headers.get('x-ada-registrar')?.trim() ||
    headers.get('x-registrar-provider')?.trim() ||
    '';
  const regSecret =
    headers.get('x-ada-registrar-secret')?.trim() ||
    headers.get('x-registrar-secret')?.trim() ||
    undefined;
  const humanConfirm =
    headers.get('x-ada-human-confirm')?.trim() ||
    headers.get('x-human-confirm-token')?.trim() ||
    undefined;
  const regUsername =
    headers.get('x-ada-registrar-username')?.trim() ||
    headers.get('x-registrar-username')?.trim() ||
    undefined;
  const regClientIp =
    headers.get('x-ada-registrar-client-ip')?.trim() ||
    headers.get('x-registrar-client-ip')?.trim() ||
    undefined;
  const regAccountId =
    headers.get('x-ada-registrar-account-id')?.trim() ||
    headers.get('x-registrar-account-id')?.trim() ||
    undefined;
  const regEmail =
    headers.get('x-ada-registrar-email')?.trim() ||
    headers.get('x-registrar-email')?.trim() ||
    undefined;

  const budgetRaw = headers.get('x-ada-max-budget-usd')?.trim();
  const maxBudgetUsd = budgetRaw && !Number.isNaN(Number(budgetRaw)) ? Number(budgetRaw) : undefined;

  const ctx: ByokContext = {};
  if (llmKey) {
    ctx.llm = {
      provider: normalizeLlmProvider(llmProvider || 'anthropic'),
      apiKey: llmKey,
      model: llmModel,
      baseUrl: llmBase,
    };
  }
  if (regKey && regProvider) {
    ctx.registrar = {
      provider: regProvider.toLowerCase(),
      apiKey: regKey,
      secret: regSecret,
      humanConfirmToken: humanConfirm,
      username: regUsername,
      clientIp: regClientIp,
      accountId: regAccountId,
      email: regEmail,
    };
  }
  if (maxBudgetUsd && maxBudgetUsd > 0) ctx.maxBudgetUsd = maxBudgetUsd;
  return ctx;
}

/** Merge body.byok over headers (body wins for explicit agent payloads). */
export function byokFromBody(body: Record<string, unknown> | undefined | null): ByokContext {
  if (!body || typeof body !== 'object') return {};
  const raw = body.byok as Record<string, unknown> | undefined;
  if (!raw || typeof raw !== 'object') return {};

  const ctx: ByokContext = {};
  const llm = raw.llm as Record<string, unknown> | undefined;
  if (llm && typeof llm.apiKey === 'string' && llm.apiKey.trim()) {
    ctx.llm = {
      provider: normalizeLlmProvider(String(llm.provider || 'anthropic')),
      apiKey: llm.apiKey.trim(),
      model: typeof llm.model === 'string' ? llm.model : undefined,
      baseUrl: typeof llm.baseUrl === 'string' ? llm.baseUrl : undefined,
    };
  }
  const reg = raw.registrar as Record<string, unknown> | undefined;
  if (reg && typeof reg.apiKey === 'string' && reg.apiKey.trim() && typeof reg.provider === 'string') {
    ctx.registrar = {
      provider: String(reg.provider).toLowerCase(),
      apiKey: String(reg.apiKey).trim(),
      secret: typeof reg.secret === 'string' ? reg.secret : undefined,
      humanConfirmToken:
        typeof reg.humanConfirmToken === 'string' ? reg.humanConfirmToken : undefined,
      username: typeof reg.username === 'string' ? reg.username : undefined,
      clientIp: typeof reg.clientIp === 'string' ? reg.clientIp : undefined,
      accountId: typeof reg.accountId === 'string' ? reg.accountId : undefined,
      email: typeof reg.email === 'string' ? reg.email : undefined,
    };
  }
  if (typeof raw.maxBudgetUsd === 'number' && raw.maxBudgetUsd > 0) {
    ctx.maxBudgetUsd = raw.maxBudgetUsd;
  }
  return ctx;
}

export function mergeByok(a: ByokContext, b: ByokContext): ByokContext {
  return {
    llm: b.llm || a.llm,
    registrar: b.registrar || a.registrar,
    maxBudgetUsd: b.maxBudgetUsd ?? a.maxBudgetUsd,
  };
}

function normalizeLlmProvider(p: string): LlmProviderId {
  const x = p.toLowerCase();
  if (x === 'anthropic' || x === 'claude') return 'anthropic';
  if (x === 'minimax') return 'minimax';
  if (x === 'xai' || x === 'grok') return 'xai';
  if (x === 'openai' || x === 'openai-compatible') return x as LlmProviderId;
  return 'openai-compatible';
}

/** Redacted snapshot for logs / skill status (never leaks secrets). */
export function byokStatus(ctx: ByokContext = getByokContext()) {
  return {
    llm: ctx.llm
      ? { configured: true, provider: ctx.llm.provider, model: ctx.llm.model || null }
      : { configured: false },
    registrar: ctx.registrar
      ? {
          configured: true,
          provider: ctx.registrar.provider,
          humanConfirm: Boolean(ctx.registrar.humanConfirmToken),
        }
      : { configured: false },
    maxBudgetUsd: ctx.maxBudgetUsd ?? null,
  };
}
