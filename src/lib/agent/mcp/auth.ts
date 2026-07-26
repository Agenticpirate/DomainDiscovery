/**
 * Agent API authentication + identity (scale-aware).
 *
 * Backed by `@/lib/scale/agentKeys` for multi-key / per-agent quotas.
 * Kept as the stable import path for existing routes.
 */

import {
  authorizeAgentIdentity,
  agentAuthStatus as scaleAuthStatus,
  getMasterAgentApiKey,
  isAgentAuthRequired as scaleAuthRequired,
  anyAgentKeyConfigured,
  type AgentIdentity,
} from '@/lib/scale/agentKeys';

export type { AgentIdentity };

export function getAgentApiKey(): string | null {
  return getMasterAgentApiKey();
}

export function isAgentAuthRequired(): boolean {
  return scaleAuthRequired();
}

/**
 * Backward-compatible authorize — adds identity when ok.
 */
export function authorizeAgentRequest(
  request: Request
):
  | { ok: true; identity: AgentIdentity }
  | { ok: false; status: number; error: string } {
  return authorizeAgentIdentity(request);
}

/** Auth status for health/manifest (never leaks the key). */
export function agentAuthStatus() {
  return scaleAuthStatus();
}

export function hasAgentCredentials(): boolean {
  return anyAgentKeyConfigured();
}
