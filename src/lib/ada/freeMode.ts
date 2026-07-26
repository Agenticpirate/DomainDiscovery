/**
 * Cost posture for AI Domain Assistant.
 *
 * FREE by default for:
 * - Chat NLU / ranking (local rules + vertical knowledge — no paid LLM)
 * - Availability + domain data: Instant Domain Search MCP (same free stack as main site)
 *
 * Paid LLM is OFF unless explicitly enabled:
 *   ADA_ALLOW_PAID_LLM=true + one of:
 *     ANTHROPIC_API_KEY  (native Claude Messages API)
 *     XAI_API_KEY | MINIMAX_API_KEY | OPENAI_API_KEY  (OpenAI-compatible)
 *
 * Instant Domain MCP is ON by default (matches DomainDiscovery search/bulk tools).
 * Disable only if needed: ADA_USE_INSTANT_DOMAIN_MCP=false → falls back to public RDAP.
 */

function envTrue(name: string): boolean {
  const v = (process.env[name] || '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function envFalse(name: string): boolean {
  const v = (process.env[name] || '').trim().toLowerCase();
  return v === '0' || v === 'false' || v === 'no' || v === 'off';
}

function hasLlmApiKey(): boolean {
  return Boolean(
    process.env.ANTHROPIC_API_KEY?.trim() ||
      process.env.CLAUDE_API_KEY?.trim() ||
      process.env.XAI_API_KEY?.trim() ||
      process.env.MINIMAX_API_KEY?.trim() ||
      process.env.OPENAI_API_KEY?.trim()
  );
}

/** Prefer free product posture (no paid LLM). Default true. */
export function isAdaFreeMode(): boolean {
  if (envFalse('ADA_FREE_MODE')) return false;
  // If paid LLM is explicitly allowed and a key is present, free mode is off
  if (envTrue('ADA_ALLOW_PAID_LLM') && hasLlmApiKey()) return false;
  return true;
}

/** Paid OpenAI-compatible LLM — off unless explicitly allowed + key present. */
export function allowPaidLlm(): boolean {
  if (!envTrue('ADA_ALLOW_PAID_LLM')) return false;
  return hasLlmApiKey();
}

/**
 * Instant Domain Search MCP — same free service as main DomainDiscovery site.
 * Default ON. Set ADA_USE_INSTANT_DOMAIN_MCP=false to force RDAP-only.
 */
export function useInstantDomainMcp(): boolean {
  if (envFalse('ADA_USE_INSTANT_DOMAIN_MCP')) return false;
  // Legacy opt-in still honored if someone set it
  if (envTrue('ADA_ALLOW_EXTERNAL_MCP')) return true;
  return true; // default: same as main website
}

/** @deprecated use useInstantDomainMcp */
export function allowExternalDomainMcp(): boolean {
  return useInstantDomainMcp();
}

export function freeModeBanner(): string {
  return useInstantDomainMcp()
    ? 'No paid LLM keys. Availability via Instant Domain Search MCP (same free stack as DomainDiscovery). Ranking is local.'
    : 'No paid LLM keys. Availability via free public RDAP. Ranking is local.';
}
