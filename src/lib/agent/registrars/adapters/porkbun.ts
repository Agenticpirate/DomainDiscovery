/**
 * Porkbun API v3 adapter
 * Docs: https://porkbun.com/api/json/v3/documentation
 * Guide: https://porkbun.com/llms/guides/register-a-domain
 *
 * Base: https://api.porkbun.com/api/json/v3
 * Auth: apikey + secretapikey (body or X-API-Key / X-Secret-API-Key)
 */

import type {
  AdapterResult,
  RegisterDomainArgs,
  RegistrarAdapter,
  RegistrarCredentials,
  SetDnsArgs,
} from '../types';

const BASE = 'https://api.porkbun.com/api/json/v3';

function authBody(creds: RegistrarCredentials) {
  return {
    apikey: creds.apiKey,
    secretapikey: creds.secret || '',
  };
}

async function porkbunPost(
  path: string,
  creds: RegistrarCredentials,
  body: Record<string, unknown> = {},
  headers: Record<string, string> = {}
) {
  if (!creds.secret) {
    return {
      ok: false as const,
      status: 400,
      data: { status: 'ERROR', code: 'MISSING_SECRET', message: 'Porkbun requires apiKey + secret' },
    };
  }
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': creds.apiKey,
      'X-Secret-API-Key': creds.secret,
      ...headers,
    },
    body: JSON.stringify({ ...authBody(creds), ...body }),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok && data.status === 'SUCCESS', status: res.status, data };
}

export const porkbunAdapter: RegistrarAdapter = {
  id: 'porkbun',
  name: 'Porkbun',

  async checkPrice(creds, domain) {
    const { data } = await porkbunPost(`/domain/checkDomain/${encodeURIComponent(domain)}`, creds);
    const response = data as {
      status?: string;
      response?: { avail?: string; price?: string | number };
      avail?: string;
      price?: string | number;
    };
    // Response shape may nest under response or top-level depending on version
    const avail =
      response.response?.avail ??
      response.avail ??
      (data as { response?: Array<{ avail?: string }> }).response;
    let available = false;
    let priceUsd: number | null = null;
    if (typeof avail === 'string') {
      available = avail.toLowerCase() === 'yes' || avail.toLowerCase() === 'available';
    }
    const priceRaw = response.response?.price ?? response.price;
    if (priceRaw != null) {
      const n = typeof priceRaw === 'number' ? priceRaw : parseFloat(String(priceRaw));
      if (!Number.isNaN(n)) priceUsd = n;
    }
    // Alternate: response array
    const arr = (data as { response?: Array<Record<string, unknown>> }).response;
    if (Array.isArray(arr) && arr[0]) {
      const row = arr[0];
      if (row.avail != null) available = String(row.avail).toLowerCase() === 'yes';
      if (row.price != null) {
        const n = parseFloat(String(row.price));
        if (!Number.isNaN(n)) priceUsd = n;
      }
    }
    return { available, priceUsd, raw: data };
  },

  async registerDomain(creds, args: RegisterDomainArgs): Promise<AdapterResult> {
    const domain = args.domain.toLowerCase().trim();
    const dryRun = args.dryRun !== false;

    // Quote first
    const quote = await this.checkPrice!(creds, domain);
    if (!quote.available && !dryRun) {
      return {
        ok: false,
        provider: 'porkbun',
        domain,
        code: 'DOMAIN_NOT_AVAILABLE',
        message: 'Domain not available for registration at Porkbun.',
        priceUsd: quote.priceUsd,
        raw: quote.raw,
      };
    }

    if (quote.priceUsd != null && args.maxBudgetUsd != null && quote.priceUsd > args.maxBudgetUsd) {
      return {
        ok: false,
        provider: 'porkbun',
        domain,
        code: 'OVER_BUDGET',
        message: `Quoted $${quote.priceUsd} exceeds maxBudgetUsd $${args.maxBudgetUsd}.`,
        priceUsd: quote.priceUsd,
        dryRun,
      };
    }

    if (quote.priceUsd == null && !dryRun) {
      return {
        ok: false,
        provider: 'porkbun',
        domain,
        code: 'PRICE_UNKNOWN',
        message: 'Refusing live register without a clear USD price quote.',
        dryRun: false,
      };
    }

    const costCents = quote.priceUsd != null ? Math.round(quote.priceUsd * 100) : 0;
    const body: Record<string, unknown> = {
      cost: costCents,
      agreeToTerms: args.agreeToTerms === false ? 'no' : 'yes',
    };
    if (dryRun) body.dryRun = true;

    const idempotencyKey =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `ada-${Date.now()}-${domain}`;

    const { ok, data } = await porkbunPost(`/domain/create/${encodeURIComponent(domain)}`, creds, body, {
      'Idempotency-Key': idempotencyKey,
    });

    if (!ok) {
      return {
        ok: false,
        provider: 'porkbun',
        domain,
        dryRun,
        code: String((data as { code?: string }).code || 'REGISTER_FAILED'),
        message: String((data as { message?: string }).message || 'Porkbun register failed'),
        priceUsd: quote.priceUsd,
        raw: data,
      };
    }

    return {
      ok: true,
      provider: 'porkbun',
      domain,
      dryRun,
      priceUsd: quote.priceUsd,
      message: dryRun
        ? `Dry run OK — would register ${domain} for ~$${quote.priceUsd ?? '?'}. No charge.`
        : `Registered ${domain} at Porkbun.`,
      raw: data,
      next: dryRun
        ? ['Re-call register_domain with dryRun:false and x-ada-human-confirm to commit']
        : ['Optionally call set_dns_records', 'Verify with domain get'],
    };
  },

  async setDns(creds, args: SetDnsArgs): Promise<AdapterResult> {
    const domain = args.domain.toLowerCase().trim();
    const dryRun = args.dryRun === true;
    const results: unknown[] = [];

    for (const rec of args.records) {
      const name =
        !rec.name || rec.name === '@' || rec.name === domain
          ? ''
          : rec.name.replace(/\.$/, '').replace(new RegExp(`\\.${domain.replace(/\./g, '\\.')}$`), '');

      const body: Record<string, unknown> = {
        type: rec.type.toUpperCase(),
        content: rec.data,
        ttl: String(rec.ttl ?? 600),
      };
      if (name) body.name = name;
      if (rec.priority != null) body.prio = String(rec.priority);
      if (dryRun) body.dryRun = true;

      const { ok, data } = await porkbunPost(`/dns/create/${encodeURIComponent(domain)}`, creds, body);
      results.push(data);
      if (!ok) {
        return {
          ok: false,
          provider: 'porkbun',
          domain,
          dryRun,
          code: String((data as { code?: string }).code || 'DNS_FAILED'),
          message: String((data as { message?: string }).message || `Failed DNS ${rec.type} ${rec.name}`),
          raw: { results },
        };
      }
    }

    return {
      ok: true,
      provider: 'porkbun',
      domain,
      dryRun,
      message: dryRun
        ? `Dry run OK — would create ${args.records.length} DNS record(s).`
        : `Created ${args.records.length} DNS record(s) at Porkbun.`,
      raw: { results },
    };
  },
};
