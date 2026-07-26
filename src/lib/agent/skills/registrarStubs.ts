/**
 * L3 registrar register + DNS tools.
 * Wired adapters: porkbun, namecheap, cloudflare (from public API docs).
 * Still requires ADA_ENABLE_REGISTRAR_MUTATIONS=true + BYOK + human confirm.
 * Default dryRun=true so agents rehearse without charging.
 */

import { getByokContext } from '../byokContext';
import { jsonToolResult } from '../tools/registry';
import {
  getRegistrarByByokId,
  listBrandDomainApiRegistrars,
  listPriorityAdapters,
} from '../registrars/agentReadyRegistrars';
import { getWiredAdapter, listWiredAdapterIds } from '../registrars/dispatch';
import type { DnsRecordInput, RegistrantContact } from '../registrars/types';

function registrarEnabled(): boolean {
  const v = (process.env.ADA_ENABLE_REGISTRAR_MUTATIONS || '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function supportedByokIds(): string[] {
  return listBrandDomainApiRegistrars().map((r) => r.byokId);
}

function credsFromByok() {
  const byok = getByokContext();
  const r = byok.registrar;
  if (!r) return null;
  return {
    apiKey: r.apiKey,
    secret: r.secret,
    username: (r as { username?: string }).username,
    clientIp: (r as { clientIp?: string }).clientIp,
    accountId: (r as { accountId?: string }).accountId,
    email: (r as { email?: string }).email,
  };
}

export async function toolRegisterDomain(args: {
  domain: string;
  years?: number;
  maxBudgetUsd?: number;
  dryRun?: boolean;
  agreeToTerms?: boolean;
  contact?: RegistrantContact;
}) {
  const domain = (args.domain || '').trim().toLowerCase();
  if (!domain.includes('.')) {
    return jsonToolResult({ error: 'domain required (e.g. example.com)' }, true);
  }

  const wired = listWiredAdapterIds();
  if (!registrarEnabled()) {
    return jsonToolResult(
      {
        ok: false,
        code: 'tier3_disabled',
        message:
          'Register is disabled. Set ADA_ENABLE_REGISTRAR_MUTATIONS=true to enable L3 adapters (still needs BYOK + human confirm).',
        domain,
        wiredAdapters: wired,
        priorityRegistrars: listPriorityAdapters().slice(0, 8).map((r) => ({
          byokId: r.byokId,
          name: r.name,
        })),
        allByokIds: supportedByokIds(),
        next: [
          'Call find_brand_domains for available shortlist',
          'Call list_agent_registrars for full matrix',
          'Enable mutations flag + pass BYOK + dryRun first, then dryRun:false with human confirm',
        ],
        constraints: { registersDomains: false, humanConfirmForPurchase: true },
      },
      true
    );
  }

  const byok = getByokContext();
  if (!byok.registrar?.apiKey || !byok.registrar.provider) {
    return jsonToolResult(
      {
        ok: false,
        code: 'byok_registrar_required',
        message:
          'Provide x-ada-registrar + x-ada-registrar-api-key (+ secret/account as required). Keys are never stored.',
        wiredAdapters: wired,
        supportedByokIds: supportedByokIds(),
      },
      true
    );
  }

  const dryRun = args.dryRun !== false;
  if (!dryRun && !byok.registrar.humanConfirmToken) {
    return jsonToolResult(
      {
        ok: false,
        code: 'human_confirm_required',
        message:
          'Live register requires x-ada-human-confirm. First call with dryRun:true (default), then commit with confirm token.',
        domain,
      },
      true
    );
  }

  const meta = getRegistrarByByokId(byok.registrar.provider);
  if (!meta || !meta.registerApi || meta.agentFit === 'identity-only') {
    return jsonToolResult(
      {
        ok: false,
        code: 'unsupported_registrar',
        message: `“${byok.registrar.provider}” is not a supported brand-domain API registrar.`,
        supportedByokIds: supportedByokIds(),
      },
      true
    );
  }

  const adapter = getWiredAdapter(byok.registrar.provider);
  if (!adapter) {
    return jsonToolResult(
      {
        ok: false,
        code: 'adapter_not_wired',
        message: `Catalog lists ${meta.name}, but no live adapter code yet. Wired now: ${wired.join(', ')}.`,
        registrar: { byokId: meta.byokId, name: meta.name, docsUrl: meta.docsUrl },
        domain,
      },
      true
    );
  }

  const creds = credsFromByok()!;
  const maxBudget = args.maxBudgetUsd ?? byok.maxBudgetUsd;
  try {
    const result = await adapter.registerDomain(creds, {
      domain,
      years: args.years,
      maxBudgetUsd: maxBudget,
      dryRun,
      agreeToTerms: args.agreeToTerms !== false,
      contact: args.contact,
    });
    return jsonToolResult(result, !result.ok);
  } catch (e) {
    return jsonToolResult(
      {
        ok: false,
        code: 'ADAPTER_EXCEPTION',
        message: e instanceof Error ? e.message : 'Register adapter threw',
        provider: adapter.id,
        domain,
      },
      true
    );
  }
}

export async function toolSetDnsRecords(args: {
  domain: string;
  records?: DnsRecordInput[];
  dryRun?: boolean;
}) {
  const domain = (args.domain || '').trim().toLowerCase();
  const records = args.records || [];

  if (!registrarEnabled()) {
    return jsonToolResult(
      {
        ok: false,
        code: 'tier3_disabled',
        message: 'DNS mutation disabled. Set ADA_ENABLE_REGISTRAR_MUTATIONS=true.',
        domain,
        wiredAdapters: listWiredAdapterIds(),
      },
      true
    );
  }

  const byok = getByokContext();
  if (!byok.registrar?.apiKey || !byok.registrar.provider) {
    return jsonToolResult(
      {
        ok: false,
        code: 'byok_registrar_required',
        message: 'DNS changes require BYOK registrar keys.',
      },
      true
    );
  }

  const dryRun = args.dryRun === true;
  if (!dryRun && !byok.registrar.humanConfirmToken) {
    return jsonToolResult(
      {
        ok: false,
        code: 'human_confirm_required',
        message: 'Live DNS mutation requires x-ada-human-confirm. Prefer dryRun:true first.',
      },
      true
    );
  }

  if (!records.length) {
    return jsonToolResult({ error: 'records[] required' }, true);
  }

  const adapter = getWiredAdapter(byok.registrar.provider);
  if (!adapter) {
    return jsonToolResult(
      {
        ok: false,
        code: 'adapter_not_wired',
        message: `No DNS adapter for “${byok.registrar.provider}”. Wired: ${listWiredAdapterIds().join(', ')}`,
      },
      true
    );
  }

  const creds = credsFromByok()!;
  try {
    const result = await adapter.setDns(creds, { domain, records, dryRun });
    return jsonToolResult(result, !result.ok);
  } catch (e) {
    return jsonToolResult(
      {
        ok: false,
        code: 'ADAPTER_EXCEPTION',
        message: e instanceof Error ? e.message : 'DNS adapter threw',
        provider: adapter.id,
        domain,
      },
      true
    );
  }
}
