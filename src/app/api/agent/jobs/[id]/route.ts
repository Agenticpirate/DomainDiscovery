import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, jsonResponse, corsPreflightResponse } from '@/lib/apiHelpers';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { getAgentJobAsync } from '@/lib/agent';
import { applyScaleHeaders, enforceAgentScale } from '@/lib/scale/gate';

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

/**
 * GET /api/agent/jobs/:id — poll auto job status (light tier)
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  if (!FEATURE_FLAGS.domainAgent) {
    return errorResponse('AI Domain Assistant is disabled', 503);
  }

  const gate = await enforceAgentScale(request, { tier: 'light', route: 'agent-jobs' });
  if (!gate.ok) return gate.response as NextResponse;

  try {
    const id = context.params?.id;
    if (!id || !/^job_[a-z0-9_]+$/i.test(id)) {
      return errorResponse('Invalid job id', 400);
    }

    const job = await getAgentJobAsync(id);
    if (!job) {
      return errorResponse('Job not found or expired', 404);
    }

    const resp = jsonResponse(
      {
        success: true,
        jobId: job.id,
        status: job.status,
        steps: job.steps,
        result: job.result ?? null,
        error: job.error ?? null,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
      request,
      0
    );
    resp.headers.set('Cache-Control', 'no-store');
    return applyScaleHeaders(resp, gate) as NextResponse;
  } finally {
    await gate.release();
  }
}
