import { NextRequest } from 'next/server';
import { jsonResponse, corsPreflightResponse } from '@/lib/apiHelpers';
import { skillsManifest } from '@/lib/agent/skills/catalog';
import { byokFromHeaders, byokStatus } from '@/lib/agent/byokContext';
import { useInstantDomainMcp } from '@/lib/ada/freeMode';
import { agentRegistrarsManifest } from '@/lib/agent/registrars/agentReadyRegistrars';

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

/**
 * GET /api/agent/skills — discover ADA skill layers + BYOK requirements.
 * Agents call this before connecting tools so users can attach keys (BYOK).
 */
export async function GET(request: NextRequest) {
  const byok = byokFromHeaders(request.headers);
  const body = {
    ...skillsManifest(),
    registrars: agentRegistrarsManifest(),
    runtime: {
      instantDomainMcp: useInstantDomainMcp(),
      registrarMutations:
        (process.env.ADA_ENABLE_REGISTRAR_MUTATIONS || '').toLowerCase() === 'true',
      byok: byokStatus(byok),
    },
    connect: {
      mcp: '/api/mcp',
      auto: '/api/agent/auto',
      chat: '/api/ada/chat',
      agentCard: '/ada/.well-known/agent-card.json',
      skills: '/api/agent/skills',
      cursor: {
        mcpServers: {
          'ai-domain-assistant': {
            url: 'http://localhost:5001/api/mcp',
            headers: {
              // Optional L1 LLM:
              // 'x-ada-llm-provider': 'anthropic',
              // 'x-ada-llm-api-key': '<user key>',
              // Optional L3 registrar (when enabled):
              // 'x-ada-registrar': 'porkbun',
              // 'x-ada-registrar-api-key': '<user key>',
              // 'x-ada-registrar-secret': '<user secret>',
              // 'x-ada-human-confirm': '<token>',
            },
          },
        },
      },
    },
  };
  const resp = jsonResponse(body, request, 60);
  resp.headers.set('Cache-Control', 'public, max-age=60');
  return resp;
}
