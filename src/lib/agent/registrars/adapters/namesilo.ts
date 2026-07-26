/**
 * NameSilo HTTP API
 * https://www.namesilo.com/api-reference
 * GET https://www.namesilo.com/api/{op}?version=1&type=json&key=KEY&...
 */

import type {
  AdapterResult,
  RegisterDomainArgs,
  RegistrarAdapter,
  RegistrarCredentials,
  SetDnsArgs,
} from '../types';

const BASE = 'https://www.namesilo.com/api';

async function nsGet(
  op: string,
  creds: RegistrarCredentials,
  extra: Record<string, string> = {}
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const params = new URLSearchParams({
    version: '1',
    type: 'json',
    key: creds.apiKey,
    ...extra,
  });
  const res = await fetch(`${BASE}/${op}?${params.toString()}`);
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const reply = data.reply as { code?: string | number; detail?: string } | undefined;
  const code = reply?.code != null ? String(reply.code) : '';
  // NameSilo success codes are typically 300
  const ok = code === '300' || code === '301' || code === '302';
  return { ok, data };
}

export const namesiloAdapter: RegistrarAdapter = {
  id: 'namesilo',
  name: 'NameSilo',

  async checkPrice(creds, domain) {
    const { data } = await nsGet('checkRegisterAvailability', creds, { domains: domain });
    const reply = data.reply as {
      available?: { domain?: Array<Record<string, unknown>> | Record<string, unknown> };
      unavailable?: unknown;
    };
    let available = false;
    let priceUsd: number | null = null;
    const avail = reply?.available?.domain;
    const rows = Array.isArray(avail) ? avail : avail ? [avail] : [];
    for (const row of rows) {
      if (String(row.domain || '').toLowerCase() === domain.toLowerCase() || rows.length === 1) {
        available = true;
        if (row.price != null) {
          const n = parseFloat(String(row.price));
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
        provider: 'namesilo',
        domain,
        dryRun,
        code: 'NOT_AVAILABLE',
        message: 'Domain not available at NameSilo.',
        priceUsd: quote.priceUsd,
        raw: quote.raw,
      };
    }
    if (quote.priceUsd != null && args.maxBudgetUsd != null && quote.priceUsd > args.maxBudgetUsd) {
      return {
        ok: false,
        provider: 'namesilo',
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
        provider: 'namesilo',
        domain,
        dryRun: true,
        priceUsd: quote.priceUsd,
        message: `Dry run: ${domain} available at NameSilo for ~$${quote.priceUsd ?? '?'}/${years}y. No charge.`,
        next: ['Re-call with dryRun:false + x-ada-human-confirm'],
        raw: quote.raw,
      };
    }

    if (quote.priceUsd == null) {
      return {
        ok: false,
        provider: 'namesilo',
        domain,
        code: 'PRICE_UNKNOWN',
        message: 'Refusing live register without a price from checkRegisterAvailability.',
      };
    }

    const { ok, data } = await nsGet('registerDomain', creds, {
      domain,
      years: String(years),
      private: '1',
      auto_renew: '0',
    });
    const reply = data.reply as { detail?: string; code?: string | number } | undefined;
    if (!ok) {
      return {
        ok: false,
        provider: 'namesilo',
        domain,
        dryRun: false,
        code: String(reply?.code || 'REGISTER_FAILED'),
        message: reply?.detail || 'NameSilo registerDomain failed',
        priceUsd: quote.priceUsd,
        raw: data,
      };
    }
    return {
      ok: true,
      provider: 'namesilo',
      domain,
      dryRun: false,
      priceUsd: quote.priceUsd,
      message: `Registered ${domain} at NameSilo.`,
      raw: data,
      next: ['Call set_dns_records if needed'],
    };
  },

  async setDns(creds, args: SetDnsArgs): Promise<AdapterResult> {
    const domain = args.domain.toLowerCase().trim();
    const dryRun = args.dryRun === true;
    if (dryRun) {
      return {
        ok: true,
        provider: 'namesilo',
        domain,
        dryRun: true,
        message: `Dry run: would add ${args.records.length} DNS record(s) via dnsAddRecord.`,
      };
    }
    const results: unknown[] = [];
    for (const rec of args.records) {
      const host =
        !rec.name || rec.name === '@' || rec.name === domain
          ? ''
          : rec.name.replace(/\.$/, '').replace(new RegExp(`\\.${domain.replace(/\./g, '\\.')}$`), '');
      const { ok, data } = await nsGet('dnsAddRecord', creds, {
        domain,
        rrtype: rec.type.toUpperCase(),
        rrhost: host,
        rrvalue: rec.data,
        rrttl: String(rec.ttl ?? 3600),
        ...(rec.priority != null ? { rrdistance: String(rec.priority) } : {}),
      });
      results.push(data);
      if (!ok) {
        const reply = data.reply as { detail?: string } | undefined;
        return {
          ok: false,
          provider: 'namesilo',
          domain,
          dryRun: false,
          code: 'DNS_FAILED',
          message: reply?.detail || `Failed DNS ${rec.type}`,
          raw: { results },
        };
      }
    }
    return {
      ok: true,
      provider: 'namesilo',
      domain,
      dryRun: false,
      message: `Added ${args.records.length} DNS record(s) at NameSilo.`,
      raw: { results },
    };
  },
};
