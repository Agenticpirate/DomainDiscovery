import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, jsonResponse, corsPreflightResponse } from '@/lib/apiHelpers';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import {
  byokFromBody,
  byokFromHeaders,
  mergeByok,
  runWithByokAsync,
  byokStatus,
} from '@/lib/agent/byokContext';
import { toolRegisterDomain, toolSetDnsRecords } from '@/lib/agent/skills/registrarStubs';
import { listWiredAdapterIds } from '@/lib/agent/registrars/dispatch';
import type { DnsRecordInput, RegistrantContact } from '@/lib/agent/registrars/types';
import { applyScaleHeaders, enforceAgentScale } from '@/lib/scale/gate';
import { withHeavySlot } from '@/lib/scale/concurrency';

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

/**
 * POST /api/agent/register
 * Browser-friendly wrapper around L3 register / DNS tools.
 *
 * Body:
 * {
 *   action: "register" | "dns",
 *   domain: string,
 *   dryRun?: boolean,          // default true for register
 *   years?: number,
 *   maxBudgetUsd?: number,
 *   records?: DnsRecordInput[],
 *   contact?: RegistrantContact,
 *   byok: {
 *     registrar: {
 *       provider: "porkbun" | "namecheap" | "cloudflare" | "namesilo" | "dynadot",
 *       apiKey: string,
 *       secret?: string,
 *       accountId?: string,
 *       clientIp?: string,
 *       username?: string,
 *       humanConfirmToken?: string
 *     }
 *   }
 * }
 *
 * Prefer dryRun:true first. Live needs humanConfirmToken + ADA_ENABLE_REGISTRAR_MUTATIONS=true.
 */
export async function POST(request: NextRequest) {
  if (!FEATURE_FLAGS.domainAgent) {
    return errorResponse('AI Domain Assistant is disabled', 503);
  }

  const gate = await enforceAgentScale(request, { tier: 'heavy', route: 'agent-register' });
  if (!gate.ok) return gate.response as NextResponse;

  try {
    const body = (await request.json()) as {
      action?: string;
      domain?: string;
      dryRun?: boolean;
      years?: number;
      maxBudgetUsd?: number;
      records?: DnsRecordInput[];
      contact?: RegistrantContact;
      byok?: Record<string, unknown>;
      humanConfirmToken?: string;
    };

    const action = (body.action || 'register').toLowerCase();
    const domain = (body.domain || '').trim().toLowerCase();
    if (!domain.includes('.')) {
      return errorResponse('domain required (e.g. example.com)', 400);
    }

    const bodyForByok = { ...body } as Record<string, unknown>;
    if (body.humanConfirmToken && body.byok && typeof body.byok === 'object') {
      const reg = (body.byok as { registrar?: Record<string, unknown> }).registrar;
      if (reg && !reg.humanConfirmToken) {
        (body.byok as { registrar: Record<string, unknown> }).registrar = {
          ...reg,
          humanConfirmToken: body.humanConfirmToken,
        };
      }
    }

    const byok = mergeByok(byokFromHeaders(request.headers), byokFromBody(bodyForByok));

    const result = await withHeavySlot(() =>
      runWithByokAsync(byok, async () => {
        if (action === 'dns') {
          return toolSetDnsRecords({
            domain,
            records: body.records || [],
            dryRun: body.dryRun === true,
          });
        }
        return toolRegisterDomain({
          domain,
          years: body.years,
          maxBudgetUsd: body.maxBudgetUsd ?? byok.maxBudgetUsd,
          dryRun: body.dryRun !== false,
          contact: body.contact,
          agreeToTerms: true,
        });
      })
    );

    const structured =
      (result as { structuredContent?: Record<string, unknown> }).structuredContent || result;

    const resp = jsonResponse(
      {
        success: !(result as { isError?: boolean }).isError,
        action,
        domain,
        wiredAdapters: listWiredAdapterIds(),
        byok: byokStatus(byok),
        result: structured,
        scale: { agentId: gate.identity.agentId, tier: 'heavy' },
      },
      request,
      0
    );
    resp.headers.set('Cache-Control', 'no-store');
    return applyScaleHeaders(resp, gate) as NextResponse;
  } catch (e) {
    console.error('agent register error:', e);
    const status =
      e && typeof e === 'object' && 'statusCode' in e
        ? Number((e as { statusCode?: number }).statusCode) || 500
        : 500;
    return errorResponse(e instanceof Error ? e.message : 'Register failed', status);
  } finally {
    await gate.release();
  }
}
