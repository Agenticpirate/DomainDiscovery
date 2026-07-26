import { NextRequest, NextResponse } from 'next/server';
import { getClientIP, getGenerateRateLimiter, rateLimitResponse } from '@/lib/rateLimiter';
import { errorResponse, jsonResponse, corsPreflightResponse } from '@/lib/apiHelpers';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { runAdaChat } from '@/lib/ada/chatEngine';
import type { ChatRequest } from '@/lib/ada/chatTypes';
import { runAdaChatStream, streamToSseResponse } from '@/lib/ada/chatStream';
import { getSession, upsertSession } from '@/lib/ada/sessionStore';
import {
  byokFromBody,
  byokFromHeaders,
  mergeByok,
  runWithByokAsync,
} from '@/lib/agent/byokContext';
import { applyScaleHeaders, enforceAgentScale } from '@/lib/scale/gate';

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

/**
 * POST /api/ada/chat
 * Body: { messages, maxBudgetUsd?, intake?, skipIntake?, client?, sessionId?, stream? }
 *
 * stream: true  → Server-Sent Events (status / token / result / done)
 * stream: false → JSON ChatResponse (default)
 *
 * GET /api/ada/chat?sessionId=… → session snapshot (no messages content dump for privacy: meta only)
 */
export async function GET(request: NextRequest) {
  if (!FEATURE_FLAGS.domainAgent) {
    return errorResponse('AI Domain Assistant is disabled', 503);
  }
  const sessionId = request.nextUrl.searchParams.get('sessionId') || '';
  if (!sessionId) return errorResponse('sessionId required', 400);
  const s = getSession(sessionId);
  if (!s) return errorResponse('Session not found or expired', 404);
  return jsonResponse(
    {
      success: true,
      sessionId: s.id,
      turnCount: s.turnCount,
      updatedAt: s.updatedAt,
      intakeStep: s.intake?.step ?? null,
      lastEngine: s.lastEngine ?? null,
      lastShortlist: s.lastShortlist ?? [],
      messageCount: s.messages.length,
    },
    request,
    0
  );
}

export async function POST(request: NextRequest) {
  if (!FEATURE_FLAGS.domainAgent) {
    return errorResponse('AI Domain Assistant is disabled', 503);
  }

  try {
    const body = (await request.json()) as ChatRequest & { stream?: boolean };
    const client = body.client || 'web';
    const wantStream =
      body.stream === true ||
      request.nextUrl.searchParams.get('stream') === '1' ||
      (request.headers.get('accept') || '').includes('text/event-stream');

    // Agent/MCP clients: full scale gate (auth + per-agent quotas).
    // Browser web UI: IP rate limit only (open chat UX).
    let scaleGate: Awaited<ReturnType<typeof enforceAgentScale>> | null = null;
    let ipRemaining = 0;

    if (client === 'agent' || client === 'mcp') {
      scaleGate = await enforceAgentScale(request, { tier: 'heavy', route: 'ada-chat' });
      if (!scaleGate.ok) return scaleGate.response as NextResponse;
      ipRemaining = scaleGate.agentRl.remaining;
    } else {
      const ip = getClientIP(request);
      const rl = getGenerateRateLimiter().check(`ada-chat:${ip}`);
      if (!rl.allowed) return rateLimitResponse(rl);
      ipRemaining = rl.remaining;
      // Web UI stays open (IP-limited). Agent clients use enforceAgentScale above.
    }

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return errorResponse('messages[] is required', 400);
    }
    if (body.messages.length > 40) {
      return errorResponse('Too many messages (max 40)', 400);
    }
    for (const m of body.messages) {
      if (!m || (m.role !== 'user' && m.role !== 'assistant')) {
        return errorResponse('Each message needs role user|assistant', 400);
      }
      if (typeof m.content !== 'string' || m.content.length > 8000) {
        return errorResponse('Invalid message content', 400);
      }
    }

    let intake = body.intake ?? null;
    if (body.sessionId && !intake) {
      const existing = getSession(body.sessionId);
      if (existing?.intake) intake = existing.intake;
    }

    const byok = mergeByok(
      byokFromHeaders(request.headers),
      byokFromBody(body as unknown as Record<string, unknown>)
    );

    const chatReq: ChatRequest = {
      messages: body.messages,
      maxBudgetUsd:
        typeof body.maxBudgetUsd === 'number' && body.maxBudgetUsd > 0
          ? Math.min(body.maxBudgetUsd, 100000)
          : byok.maxBudgetUsd,
      skipAvailability: Boolean(body.skipAvailability),
      client,
      sessionId: body.sessionId,
      intake,
      skipIntake: Boolean(body.skipIntake),
    };

    try {
      return await runWithByokAsync(byok, async () => {
        if (wantStream) {
          const resp = streamToSseResponse(runAdaChatStream(chatReq));
          resp.headers.set('X-RateLimit-Remaining', String(ipRemaining));
          if (scaleGate && scaleGate.ok) {
            resp.headers.set('X-ADA-Agent-Id', scaleGate.identity.agentId);
            resp.headers.set('X-ADA-Scale-Tier', 'heavy');
          }
          return resp;
        }

        const result = await runAdaChat(chatReq);
        const session = upsertSession(body.sessionId || result.sessionId, {
          messages: body.messages,
          intake: result.intake ?? null,
          maxBudgetUsd: chatReq.maxBudgetUsd,
          lastResponse: result,
        });

        const resp = jsonResponse(
          {
            ...result,
            sessionId: session.id,
          },
          request,
          0
        );
        resp.headers.set('Cache-Control', 'no-store');
        resp.headers.set('X-RateLimit-Remaining', String(ipRemaining));
        resp.headers.set('X-ADA-Engine', result.engine);
        resp.headers.set('X-ADA-Session', session.id);
        if (result.awaitingIntake) resp.headers.set('X-ADA-Intake', '1');
        if (scaleGate && scaleGate.ok) {
          return applyScaleHeaders(resp, scaleGate) as NextResponse;
        }
        return resp;
      });
    } finally {
      if (scaleGate && scaleGate.ok) await scaleGate.release();
    }
  } catch (error) {
    console.error('ada chat error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Chat failed', 500);
  }
}
