/**
 * Cloudflare Registrar API (beta) + DNS Records API
 * Register docs: https://developers.cloudflare.com/registrar/registrar-api/
 * DNS: POST /zones/{zone_id}/dns_records
 *
 * Auth: Authorization: Bearer <API_TOKEN>
 * Register requires account_id (x-ada-registrar-account-id)
 */

import type {
  AdapterResult,
  RegisterDomainArgs,
  RegistrarAdapter,
  RegistrarCredentials,
  SetDnsArgs,
} from '../types';

const CF = 'https://api.cloudflare.com/client/v4';

function authHeaders(creds: RegistrarCredentials): HeadersInit {
  const h: Record<string, string> = {
    Authorization: `Bearer ${creds.apiKey}`,
    'Content-Type': 'application/json',
  };
  // Optional global key style if email provided
  if (creds.email && creds.secret) {
    h['X-Auth-Email'] = creds.email;
    h['X-Auth-Key'] = creds.secret;
    delete h.Authorization;
  }
  return h;
}

async function cfJson(
  path: string,
  creds: RegistrarCredentials,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const res = await fetch(`${CF}${path}`, {
    ...init,
    headers: {
      ...authHeaders(creds),
      ...(init?.headers || {}),
    },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const success = data.success === true || (res.ok && data.success !== false);
  return { ok: success, status: res.status, data };
}

export const cloudflareAdapter: RegistrarAdapter = {
  id: 'cloudflare',
  name: 'Cloudflare Registrar',

  async checkPrice(creds, domain) {
    if (!creds.accountId) {
      return { available: false, priceUsd: null, raw: { error: 'accountId required' } };
    }
    const { data } = await cfJson(
      `/accounts/${creds.accountId}/registrar/domain-check`,
      creds,
      {
        method: 'POST',
        body: JSON.stringify({ domains: [domain] }),
      }
    );
    const result = data.result as { domains?: Array<Record<string, unknown>> } | undefined;
    const row = result?.domains?.[0];
    if (!row) return { available: false, priceUsd: null, raw: data };
    const available = row.registrable === true;
    let priceUsd: number | null = null;
    const pricing = row.pricing as { registration_cost?: string } | undefined;
    if (pricing?.registration_cost) {
      const n = parseFloat(pricing.registration_cost);
      if (!Number.isNaN(n)) priceUsd = n;
    }
    return { available, priceUsd, raw: data };
  },

  async registerDomain(creds, args: RegisterDomainArgs): Promise<AdapterResult> {
    const domain = args.domain.toLowerCase().trim();
    const dryRun = args.dryRun !== false;

    if (!creds.accountId) {
      return {
        ok: false,
        provider: 'cloudflare',
        domain,
        code: 'ACCOUNT_ID_REQUIRED',
        message: 'Cloudflare requires x-ada-registrar-account-id (account id).',
        dryRun,
      };
    }

    const quote = await this.checkPrice!(creds, domain);
    if (!quote.available) {
      return {
        ok: false,
        provider: 'cloudflare',
        domain,
        dryRun,
        code: 'NOT_REGISTRABLE',
        message: 'Domain not registrable via Cloudflare Registrar API (check TLD support / availability).',
        priceUsd: quote.priceUsd,
        raw: quote.raw,
      };
    }

    if (quote.priceUsd != null && args.maxBudgetUsd != null && quote.priceUsd > args.maxBudgetUsd) {
      return {
        ok: false,
        provider: 'cloudflare',
        domain,
        dryRun,
        code: 'OVER_BUDGET',
        message: `Quoted $${quote.priceUsd} exceeds maxBudgetUsd $${args.maxBudgetUsd}.`,
        priceUsd: quote.priceUsd,
      };
    }

    if (dryRun) {
      return {
        ok: true,
        provider: 'cloudflare',
        domain,
        dryRun: true,
        priceUsd: quote.priceUsd,
        message: `Dry run: ${domain} registrable at ~$${quote.priceUsd ?? '?'}. No charge. Confirm billing profile is set on Cloudflare.`,
        next: ['Re-call with dryRun:false + x-ada-human-confirm to register'],
        raw: quote.raw,
      };
    }

    if (quote.priceUsd == null) {
      return {
        ok: false,
        provider: 'cloudflare',
        domain,
        code: 'PRICE_UNKNOWN',
        message: 'Refusing live register without clear registration_cost from domain-check.',
      };
    }

    const body: Record<string, unknown> = { domain_name: domain };
    if (args.contact) {
      body.contacts = {
        registrant: {
          email: args.contact.email,
          phone: args.contact.phone,
          postal_info: {
            name: `${args.contact.firstName} ${args.contact.lastName}`,
            organization: args.contact.organization || undefined,
            address: {
              street: args.contact.address1,
              city: args.contact.city,
              state: args.contact.state,
              postal_code: args.contact.postalCode,
              country_code: args.contact.country,
            },
          },
        },
      };
    }

    const { ok, status, data } = await cfJson(
      `/accounts/${creds.accountId}/registrar/registrations`,
      creds,
      { method: 'POST', body: JSON.stringify(body) }
    );

    // 201 completed, 202 in progress
    if (ok || status === 201 || status === 202) {
      return {
        ok: true,
        provider: 'cloudflare',
        domain,
        dryRun: false,
        priceUsd: quote.priceUsd,
        message:
          status === 202
            ? `Registration accepted (async) for ${domain}. Poll registration-status.`
            : `Registered ${domain} via Cloudflare Registrar.`,
        raw: data,
        next: ['Set DNS via set_dns_records (zone must exist)', 'Confirm in Cloudflare dashboard'],
      };
    }

    const errors = data.errors as Array<{ message?: string }> | undefined;
    return {
      ok: false,
      provider: 'cloudflare',
      domain,
      dryRun: false,
      code: 'REGISTER_FAILED',
      message: errors?.[0]?.message || `Cloudflare register failed (HTTP ${status})`,
      raw: data,
    };
  },

  async setDns(creds, args: SetDnsArgs): Promise<AdapterResult> {
    const domain = args.domain.toLowerCase().trim();
    const dryRun = args.dryRun === true;

    // Find zone id
    const zones = await cfJson(`/zones?name=${encodeURIComponent(domain)}`, creds);
    const zoneList = (zones.data.result as Array<{ id?: string; name?: string }>) || [];
    const zoneId = zoneList[0]?.id;
    if (!zoneId) {
      return {
        ok: false,
        provider: 'cloudflare',
        domain,
        dryRun,
        code: 'ZONE_NOT_FOUND',
        message: `No Cloudflare zone found for ${domain}. Domain must be on Cloudflare DNS first.`,
        raw: zones.data,
      };
    }

    if (dryRun) {
      return {
        ok: true,
        provider: 'cloudflare',
        domain,
        dryRun: true,
        message: `Dry run: would create ${args.records.length} DNS record(s) on zone ${zoneId}.`,
        next: ['Re-call with dryRun:false + human confirm'],
      };
    }

    const results: unknown[] = [];
    for (const rec of args.records) {
      const name =
        !rec.name || rec.name === '@'
          ? domain
          : rec.name.includes('.')
            ? rec.name
            : `${rec.name}.${domain}`;
      const payload: Record<string, unknown> = {
        type: rec.type.toUpperCase(),
        name,
        content: rec.data,
        ttl: rec.ttl ?? 1, // 1 = automatic
      };
      if (rec.priority != null) payload.priority = rec.priority;

      const { ok, data } = await cfJson(`/zones/${zoneId}/dns_records`, creds, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      results.push(data);
      if (!ok) {
        const errors = data.errors as Array<{ message?: string }> | undefined;
        return {
          ok: false,
          provider: 'cloudflare',
          domain,
          dryRun: false,
          code: 'DNS_FAILED',
          message: errors?.[0]?.message || `Failed to create ${rec.type} ${name}`,
          raw: { results },
        };
      }
    }

    return {
      ok: true,
      provider: 'cloudflare',
      domain,
      dryRun: false,
      message: `Created ${args.records.length} DNS record(s) on Cloudflare zone.`,
      raw: { zoneId, results },
    };
  },
};
