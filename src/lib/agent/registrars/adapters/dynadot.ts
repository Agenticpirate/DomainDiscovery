/**
 * Dynadot API3
 * https://www.dynadot.com/domain/api-commands
 * JSON: https://api.dynadot.com/api3.json?key=KEY&command=register&domain=...&duration=1
 * Sandbox: https://api-sandbox.dynadot.com/api3.json
 */

import type {
  AdapterResult,
  RegisterDomainArgs,
  RegistrarAdapter,
  RegistrarCredentials,
  SetDnsArgs,
} from '../types';

function base(): string {
  const sandbox = (process.env.DYNADOT_SANDBOX || '').toLowerCase();
  if (sandbox === '1' || sandbox === 'true') return 'https://api-sandbox.dynadot.com/api3.json';
  return 'https://api.dynadot.com/api3.json';
}

async function dynadot(
  creds: RegistrarCredentials,
  command: string,
  extra: Record<string, string> = {}
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const params = new URLSearchParams({
    key: creds.apiKey,
    command,
    ...extra,
  });
  const res = await fetch(`${base()}?${params.toString()}`);
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  // Responses nest under CommandResponse / SearchResponse etc.
  const status =
    (data.SearchResponse as { ResponseCode?: string })?.ResponseCode ||
    (data.RegisterResponse as { ResponseCode?: string })?.ResponseCode ||
    (data.SetDnsResponse as { ResponseCode?: string })?.ResponseCode ||
    (data.Response as { ResponseCode?: string })?.ResponseCode ||
    data.ResponseCode;
  const ok = String(status || '') === '0' || data.Status === 'success';
  return { ok, data };
}

export const dynadotAdapter: RegistrarAdapter = {
  id: 'dynadot',
  name: 'Dynadot',

  async checkPrice(creds, domain) {
    const { data } = await dynadot(creds, 'search', { domain });
    const search = data.SearchResponse as {
      SearchHeader?: { Status?: string };
      SearchResults?: Array<{ DomainName?: string; Available?: string; Price?: string }>;
      SearchResult?: { DomainName?: string; Available?: string; Price?: string };
    };
    let available = false;
    let priceUsd: number | null = null;
    const results = search?.SearchResults
      ? search.SearchResults
      : search?.SearchResult
        ? [search.SearchResult]
        : [];
    for (const row of results) {
      if (
        !row.DomainName ||
        row.DomainName.toLowerCase() === domain.toLowerCase() ||
        results.length === 1
      ) {
        available = String(row.Available || '').toLowerCase() === 'yes';
        if (row.Price) {
          const n = parseFloat(String(row.Price).replace(/[^0-9.]/g, ''));
          if (!Number.isNaN(n)) priceUsd = n;
        }
      }
    }
    return { available, priceUsd, raw: data };
  },

  async registerDomain(creds, args: RegisterDomainArgs): Promise<AdapterResult> {
    const domain = args.domain.toLowerCase().trim();
    const dryRun = args.dryRun !== false;
    const years = Math.min(Math.max(args.years ?? 1, 1), 10);

    const quote = await this.checkPrice!(creds, domain);
    if (!quote.available) {
      return {
        ok: false,
        provider: 'dynadot',
        domain,
        dryRun,
        code: 'NOT_AVAILABLE',
        message: 'Domain not available at Dynadot.',
        priceUsd: quote.priceUsd,
        raw: quote.raw,
      };
    }
    if (quote.priceUsd != null && args.maxBudgetUsd != null && quote.priceUsd > args.maxBudgetUsd) {
      return {
        ok: false,
        provider: 'dynadot',
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
        provider: 'dynadot',
        domain,
        dryRun: true,
        priceUsd: quote.priceUsd,
        message: `Dry run: ${domain} available at Dynadot for ~$${quote.priceUsd ?? '?'}/${years}y. No charge.`,
        next: ['Re-call with dryRun:false + x-ada-human-confirm'],
        raw: quote.raw,
      };
    }

    const { ok, data } = await dynadot(creds, 'register', {
      domain,
      duration: String(years),
      currency: 'USD',
    });
    if (!ok) {
      const reg = data.RegisterResponse as { Error?: string; Status?: string } | undefined;
      return {
        ok: false,
        provider: 'dynadot',
        domain,
        dryRun: false,
        code: 'REGISTER_FAILED',
        message: reg?.Error || reg?.Status || 'Dynadot register failed',
        priceUsd: quote.priceUsd,
        raw: data,
      };
    }
    return {
      ok: true,
      provider: 'dynadot',
      domain,
      dryRun: false,
      priceUsd: quote.priceUsd,
      message: `Registered ${domain} at Dynadot.`,
      raw: data,
      next: ['Configure DNS via set_dns_records or Dynadot dashboard'],
    };
  },

  async setDns(creds, args: SetDnsArgs): Promise<AdapterResult> {
    const domain = args.domain.toLowerCase().trim();
    const dryRun = args.dryRun === true;

    if (dryRun) {
      return {
        ok: true,
        provider: 'dynadot',
        domain,
        dryRun: true,
        message: `Dry run: would set_dns on ${domain} with ${args.records.length} record(s). Note: Dynadot set_dns may replace existing records.`,
      };
    }

    // Dynadot set_dns uses main_record / subparams — map common A/CNAME
    const mainA = args.records.find((r) => r.type.toUpperCase() === 'A' && (!r.name || r.name === '@'));
    const www = args.records.find(
      (r) => r.type.toUpperCase() === 'A' && (r.name === 'www' || r.name?.startsWith('www'))
    );
    const extra: Record<string, string> = { domain };
    if (mainA) {
      extra.main_record_type0 = 'a';
      extra.main_record0 = mainA.data;
    }
    if (www) {
      extra.subdomain0 = 'www';
      extra.sub_record_type0 = 'a';
      extra.sub_record0 = www.data;
    }
    // Fallback: first record as main
    if (!mainA && args.records[0]) {
      extra.main_record_type0 = args.records[0].type.toLowerCase();
      extra.main_record0 = args.records[0].data;
    }

    const { ok, data } = await dynadot(creds, 'set_dns', extra);
    if (!ok) {
      const resp = data.SetDnsResponse as { Error?: string } | undefined;
      return {
        ok: false,
        provider: 'dynadot',
        domain,
        dryRun: false,
        code: 'DNS_FAILED',
        message: resp?.Error || 'Dynadot set_dns failed',
        raw: data,
      };
    }
    return {
      ok: true,
      provider: 'dynadot',
      domain,
      dryRun: false,
      message: `Updated DNS on ${domain} via Dynadot set_dns.`,
      raw: data,
    };
  },
};
