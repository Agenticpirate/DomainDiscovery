import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, jsonResponse, corsPreflightResponse } from '@/lib/apiHelpers';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { startAutoJob, type AgentAutoRequest } from '@/lib/agent';
import {
  byokFromBody,
  byokFromHeaders,
  mergeByok,
  runWithByokAsync,
  byokStatus,
} from '@/lib/agent/byokContext';
import { applyScaleHeaders, enforceAgentScale } from '@/lib/scale/gate';

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

/**
 * POST /api/agent/auto
 * Body: { text, brief?, skipAvailability?, sync?, byok?: { llm?, registrar?, maxBudgetUsd? } }
 *
 * Scale: heavy tier (agent + IP rate limit + concurrency shed).
 * Prefer sync:false under load → poll GET /api/agent/jobs/:id
 */
export async function POST(request: NextRequest) {
  if (!FEATURE_FLAGS.domainAgent) {
    return errorResponse('AI Domain Assistant is disabled', 503);
  }

  const gate = await enforceAgentScale(request, { tier: 'heavy', route: 'agent-auto' });
  if (!gate.ok) return gate.response as NextResponse;

  try {
    const body = (await request.json()) as AgentAutoRequest & { byok?: Record<string, unknown> };
    const text = (body.text || body.brief?.description || '').trim();
    if (!text || text.length < 8) {
      return errorResponse('Provide a business description (text) of at least 8 characters', 400);
    }
    if (text.length > 4000) {
      return errorResponse('Description too long (max 4000 characters)', 400);
    }

    const byok = mergeByok(byokFromHeaders(request.headers), byokFromBody(body as Record<string, unknown>));
    const maxBudgetUsd =
      typeof body.maxBudgetUsd === 'number'
        ? body.maxBudgetUsd
        : typeof body.brief?.maxBudgetUsd === 'number'
          ? body.brief.maxBudgetUsd
          : byok.maxBudgetUsd;

    // Under load clients should send sync:false and poll jobs
    const sync = body.sync !== false;

    const { job, result } = await runWithByokAsync(byok, () =>
      startAutoJob({
        text,
        brief: { ...body.brief, maxBudgetUsd },
        maxBudgetUsd,
        skipAvailability: Boolean(body.skipAvailability),
        sync,
      })
    );

    const resp = jsonResponse(
      {
        success: true,
        jobId: job.id,
        status: job.status,
        steps: job.steps,
        result: result ?? job.result ?? null,
        error: job.error ?? null,
        byok: byokStatus(byok),
        scale: {
          agentId: gate.identity.agentId,
          tier: 'heavy',
          remaining: gate.agentRl.remaining,
          async: !sync,
          poll: `/api/agent/jobs/${job.id}`,
        },
      },
      request,
      0
    );
    resp.headers.set('Cache-Control', 'no-store');
    const withHeaders = applyScaleHeaders(resp, gate);
    return withHeaders as NextResponse;
  } catch (error) {
    console.error('agent auto error:', error);
    const status =
      error && typeof error === 'object' && 'statusCode' in error
        ? Number((error as { statusCode?: number }).statusCode) || 500
        : 500;
    const retryAfter =
      error && typeof error === 'object' && 'retryAfter' in error
        ? Number((error as { retryAfter?: number }).retryAfter)
        : undefined;
    const msg = error instanceof Error ? error.message : 'Auto domain agent failed';
    const resp = errorResponse(msg, status);
    if (retryAfter) resp.headers.set('Retry-After', String(retryAfter));
    return resp;
  } finally {
    await gate.release();
  }
}
