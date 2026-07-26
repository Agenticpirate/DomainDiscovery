/**
 * Paid LLM client for ADA chat.
 *
 * Providers:
 * 1) Anthropic Messages API (native)
 *    ANTHROPIC_API_KEY=sk-ant-…
 *    ANTHROPIC_MODEL=claude-sonnet-4-5
 *
 * 2) OpenAI-compatible (xAI / MiniMax / etc.)
 *    XAI_API_KEY=…  XAI_BASE_URL=https://api.minimaxi.com/v1  XAI_MODEL=…
 *
 * Requires ADA_ALLOW_PAID_LLM=true. Free rules engine is default when off.
 */

import { allowPaidLlm } from './freeMode';
import { getByokContext } from '@/lib/agent/byokContext';

export type XaiChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: XaiToolCall[];
  tool_call_id?: string;
  name?: string;
};

export type XaiToolCall = {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
};

export type XaiToolDef = {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type XaiChatCompletion = {
  choices?: Array<{
    message?: {
      role?: string;
      content?: string | null;
      tool_calls?: XaiToolCall[];
    };
    finish_reason?: string;
  }>;
  error?: { message?: string; type?: string };
  type?: string;
};

function firstEnv(...names: string[]): string {
  for (const n of names) {
    const v = process.env[n]?.trim();
    if (v) return v;
  }
  return '';
}

function defaultOpenAiModel(baseUrl: string): string {
  if (/minimax/i.test(baseUrl)) return 'MiniMax-Text-01';
  if (/x\.ai/i.test(baseUrl)) return 'grok-4.5';
  return 'gpt-4o-mini';
}

export type LlmProvider = 'anthropic' | 'minimax' | 'xai' | 'openai-compatible';

export function getXaiConfig() {
  // ── BYOK (per-request agent keys) wins over server env ──
  const byok = getByokContext().llm;
  if (byok?.apiKey) {
    if (byok.provider === 'anthropic') {
      return {
        apiKey: byok.apiKey,
        model: byok.model || 'claude-sonnet-4-5',
        baseUrl: (byok.baseUrl || 'https://api.anthropic.com').replace(/\/$/, ''),
        enabled: true, // user opted in by sending the key
        provider: 'anthropic' as LlmProvider,
        source: 'byok' as const,
      };
    }
    const baseUrl = (
      byok.baseUrl ||
      (byok.provider === 'minimax'
        ? 'https://api.minimaxi.com/v1'
        : byok.provider === 'xai'
          ? 'https://api.x.ai/v1'
          : 'https://api.openai.com/v1')
    ).replace(/\/$/, '');
    const provider: LlmProvider =
      byok.provider === 'minimax'
        ? 'minimax'
        : byok.provider === 'xai'
          ? 'xai'
          : 'openai-compatible';
    return {
      apiKey: byok.apiKey,
      model: byok.model || defaultOpenAiModel(baseUrl),
      baseUrl,
      enabled: true,
      provider,
      source: 'byok' as const,
    };
  }

  const anthropicKey = firstEnv('ANTHROPIC_API_KEY', 'CLAUDE_API_KEY');
  const openaiKey = firstEnv('XAI_API_KEY', 'MINIMAX_API_KEY', 'OPENAI_API_KEY');

  // Prefer Anthropic when its key is present
  if (anthropicKey) {
    const model =
      firstEnv('ANTHROPIC_MODEL', 'CLAUDE_MODEL', 'XAI_MODEL') || 'claude-sonnet-4-5';
    const baseUrl = (
      firstEnv('ANTHROPIC_BASE_URL') || 'https://api.anthropic.com'
    ).replace(/\/$/, '');
    const enabled = allowPaidLlm() && Boolean(anthropicKey);
    return {
      apiKey: anthropicKey,
      model,
      baseUrl,
      enabled,
      provider: 'anthropic' as LlmProvider,
      source: 'env' as const,
    };
  }

  const baseUrl =
    firstEnv('XAI_BASE_URL', 'MINIMAX_BASE_URL', 'OPENAI_BASE_URL', 'OPENAI_API_BASE').replace(
      /\/$/,
      ''
    ) || 'https://api.x.ai/v1';
  const model =
    firstEnv('XAI_MODEL', 'MINIMAX_MODEL', 'OPENAI_MODEL') || defaultOpenAiModel(baseUrl);
  const enabled = allowPaidLlm() && Boolean(openaiKey);
  const provider: LlmProvider = /minimax/i.test(baseUrl)
    ? 'minimax'
    : /x\.ai/i.test(baseUrl)
      ? 'xai'
      : 'openai-compatible';

  return { apiKey: openaiKey, model, baseUrl, enabled, provider, source: 'env' as const };
}

/** Convert OpenAI-style tools → Anthropic tools */
function toAnthropicTools(tools: XaiToolDef[]) {
  return tools.map((t) => ({
    name: t.function.name,
    description: t.function.description,
    input_schema: t.function.parameters?.type
      ? t.function.parameters
      : {
          type: 'object',
          properties: (t.function.parameters as { properties?: unknown })?.properties || {},
          required: (t.function.parameters as { required?: string[] })?.required || [],
        },
  }));
}

/**
 * Flatten OpenAI-style history into Anthropic messages.
 * System is returned separately. Tool results become user tool_result blocks.
 */
function toAnthropicMessages(messages: XaiChatMessage[]): {
  system: string;
  messages: Array<{ role: 'user' | 'assistant'; content: unknown }>;
} {
  let system = '';
  const out: Array<{ role: 'user' | 'assistant'; content: unknown }> = [];

  for (const m of messages) {
    if (m.role === 'system') {
      system = (system ? system + '\n\n' : '') + (m.content || '');
      continue;
    }

    if (m.role === 'tool') {
      const block = {
        type: 'tool_result',
        tool_use_id: m.tool_call_id || 'tool',
        content: m.content || '',
      };
      const last = out[out.length - 1];
      if (last && last.role === 'user' && Array.isArray(last.content)) {
        (last.content as unknown[]).push(block);
      } else {
        out.push({ role: 'user', content: [block] });
      }
      continue;
    }

    if (m.role === 'assistant' && m.tool_calls?.length) {
      const content: unknown[] = [];
      if (m.content) content.push({ type: 'text', text: m.content });
      for (const tc of m.tool_calls) {
        let input: Record<string, unknown> = {};
        try {
          input = JSON.parse(tc.function.arguments || '{}') as Record<string, unknown>;
        } catch {
          input = {};
        }
        content.push({
          type: 'tool_use',
          id: tc.id,
          name: tc.function.name,
          input,
        });
      }
      out.push({ role: 'assistant', content });
      continue;
    }

    if (m.role === 'user' || m.role === 'assistant') {
      out.push({
        role: m.role,
        content: m.content || '',
      });
    }
  }

  // Anthropic requires alternating user/assistant; merge consecutive same roles
  const merged: Array<{ role: 'user' | 'assistant'; content: unknown }> = [];
  for (const msg of out) {
    const prev = merged[merged.length - 1];
    if (prev && prev.role === msg.role) {
      const a = prev.content;
      const b = msg.content;
      if (typeof a === 'string' && typeof b === 'string') {
        prev.content = `${a}\n\n${b}`;
      } else {
        const arrA = Array.isArray(a) ? a : [{ type: 'text', text: String(a || '') }];
        const arrB = Array.isArray(b) ? b : [{ type: 'text', text: String(b || '') }];
        prev.content = [...arrA, ...arrB];
      }
    } else {
      merged.push({ ...msg });
    }
  }

  // Must start with user
  if (merged.length && merged[0].role !== 'user') {
    merged.unshift({ role: 'user', content: 'Continue.' });
  }

  return { system, messages: merged };
}

async function anthropicChatCompletion(params: {
  messages: XaiChatMessage[];
  tools?: XaiToolDef[];
  temperature?: number;
  maxTokens?: number;
  apiKey: string;
  model: string;
  baseUrl: string;
}): Promise<XaiChatCompletion> {
  const { system, messages } = toAnthropicMessages(params.messages);

  const body: Record<string, unknown> = {
    model: params.model,
    max_tokens: params.maxTokens ?? 1400,
    temperature: params.temperature ?? 0.35,
    messages,
  };
  if (system) body.system = system;
  if (params.tools?.length) {
    body.tools = toAnthropicTools(params.tools);
  }

  const res = await fetch(`${params.baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': params.apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as {
    content?: Array<{
      type?: string;
      text?: string;
      id?: string;
      name?: string;
      input?: Record<string, unknown>;
    }>;
    stop_reason?: string;
    error?: { message?: string; type?: string };
  };

  if (!res.ok) {
    throw new Error(data.error?.message || `anthropic HTTP ${res.status}`);
  }

  const blocks = data.content || [];
  const textParts = blocks.filter((b) => b.type === 'text').map((b) => b.text || '');
  const toolUses = blocks.filter((b) => b.type === 'tool_use');

  const tool_calls: XaiToolCall[] | undefined = toolUses.length
    ? toolUses.map((b) => ({
        id: b.id || `tool_${Math.random().toString(36).slice(2, 9)}`,
        type: 'function' as const,
        function: {
          name: b.name || 'unknown',
          arguments: JSON.stringify(b.input || {}),
        },
      }))
    : undefined;

  return {
    choices: [
      {
        message: {
          role: 'assistant',
          content: textParts.join('\n').trim() || null,
          tool_calls,
        },
        finish_reason: data.stop_reason === 'tool_use' ? 'tool_calls' : data.stop_reason,
      },
    ],
  };
}

async function openAiCompatibleChatCompletion(params: {
  messages: XaiChatMessage[];
  tools?: XaiToolDef[];
  temperature?: number;
  maxTokens?: number;
  apiKey: string;
  model: string;
  baseUrl: string;
  provider: string;
}): Promise<XaiChatCompletion> {
  const body: Record<string, unknown> = {
    model: params.model,
    messages: params.messages,
    temperature: params.temperature ?? 0.4,
    max_tokens: params.maxTokens ?? 1200,
  };
  if (params.tools?.length) {
    body.tools = params.tools;
    body.tool_choice = 'auto';
  }

  const res = await fetch(params.baseUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + params.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  let data: XaiChatCompletion = {};
  try {
    data = (await res.json()) as XaiChatCompletion;
  } catch {
    throw new Error(`${params.provider} HTTP ${res.status}: non-JSON response`);
  }

  if (!res.ok) {
    const nested =
      (data as { error?: { message?: string } }).error?.message ||
      (data as { message?: string }).message;
    throw new Error(nested || `${params.provider} HTTP ${res.status}`);
  }
  return data;
}

export async function xaiChatCompletion(params: {
  messages: XaiChatMessage[];
  tools?: XaiToolDef[];
  temperature?: number;
  maxTokens?: number;
}): Promise<XaiChatCompletion> {
  const { apiKey, model, baseUrl, enabled, provider } = getXaiConfig();
  if (!enabled) {
    throw new Error('Paid LLM not configured (set ADA_ALLOW_PAID_LLM=true and API key)');
  }

  if (provider === 'anthropic') {
    return anthropicChatCompletion({
      ...params,
      apiKey,
      model,
      baseUrl,
    });
  }

  return openAiCompatibleChatCompletion({
    ...params,
    apiKey,
    model,
    baseUrl,
    provider,
  });
}

const STRATEGY_ENUM = [
  'available_first',
  'radio_test',
  'brandable',
  'keyword_exact',
  'short',
  'easy_spell',
  'no_hyphen',
  'no_numbers',
  'geo_local',
  'com_priority',
  'premium_ok',
];

/** Domain tools exposed to the LLM for ADA chat */
export const ADA_CHAT_TOOLS: XaiToolDef[] = [
  {
    type: 'function',
    function: {
      name: 'find_brand_domains',
      description:
        'Generate, check availability, and rank domains. Only call when you have business text AND preferably preferredTlds, mustInclude/avoid (or explicit none), and strategies (or defaults). Pass radio_test for phone-friendly names.',
      parameters: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Business brief: industry, audience, product.',
          },
          preferredTlds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Preferred extensions e.g. [".com",".io"]',
          },
          mustInclude: {
            type: 'array',
            items: { type: 'string' },
            description: 'Keywords that should appear in the domain when possible',
          },
          avoid: {
            type: 'array',
            items: { type: 'string' },
            description: 'Keywords/fragments to never use',
          },
          strategies: {
            type: 'array',
            items: { type: 'string', enum: STRATEGY_ENUM },
            description:
              'Ranking strategies: available_first, radio_test, brandable, keyword_exact, short, easy_spell, no_hyphen, no_numbers, geo_local, com_priority, premium_ok',
          },
          maxBudgetUsd: {
            type: 'number',
            description: 'Hard research budget for registration (e.g. 20).',
          },
          count: {
            type: 'number',
            description: 'Shortlist size (3–15). Default 8.',
          },
          skipAvailability: {
            type: 'boolean',
            description: 'If true, rank without live checks. Default false.',
          },
        },
        required: ['text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'explain_agent_access',
      description:
        'Explain how external AI agents connect via MCP, REST auto, Agent Card, and chat API.',
      parameters: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            enum: ['mcp', 'rest', 'chat', 'agent_card', 'all'],
          },
        },
        required: ['topic'],
      },
    },
  },
];
