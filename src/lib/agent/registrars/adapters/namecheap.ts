/**
 * Namecheap XML API adapter
 * Docs: https://www.namecheap.com/support/api/methods/domains/create/
 * DNS: https://www.namecheap.com/support/api/methods/domains-dns/set-hosts/
 *
 * Production: https://api.namecheap.com/xml.response
 * Sandbox: https://api.sandbox.namecheap.com/xml.response
 */

import type {
  AdapterResult,
  RegisterDomainArgs,
  RegistrantContact,
  RegistrarAdapter,
  RegistrarCredentials,
  SetDnsArgs,
} from '../types';

function baseUrl(): string {
  const sandbox = (process.env.NAMECHEAP_SANDBOX || '').toLowerCase();
  if (sandbox === '1' || sandbox === 'true') {
    return 'https://api.sandbox.namecheap.com/xml.response';
  }
  return 'https://api.namecheap.com/xml.response';
}

function splitDomain(domain: string): { sld: string; tld: string } {
  const parts = domain.toLowerCase().trim().split('.');
  if (parts.length < 2) return { sld: domain, tld: 'com' };
  const tld = parts.slice(1).join('.');
  const sld = parts[0];
  return { sld, tld };
}

function contactParams(prefix: string, c: RegistrantContact): Record<string, string> {
  return {
    [`${prefix}FirstName`]: c.firstName,
    [`${prefix}LastName`]: c.lastName,
    [`${prefix}Address1`]: c.address1,
    [`${prefix}City`]: c.city,
    [`${prefix}StateProvince`]: c.state,
    [`${prefix}PostalCode`]: c.postalCode,
    [`${prefix}Country`]: c.country,
    [`${prefix}Phone`]: c.phone.startsWith('+') ? c.phone : `+${c.phone}`,
    [`${prefix}EmailAddress`]: c.email,
    [`${prefix}OrganizationName`]: c.organization || c.firstName,
  };
}

async function namecheapCall(
  creds: RegistrarCredentials,
  command: string,
  extra: Record<string, string>
): Promise<{ ok: boolean; xml: string; error?: string }> {
  const user = creds.username || creds.apiKey;
  const clientIp = creds.clientIp || process.env.NAMECHEAP_CLIENT_IP || '';
  if (!clientIp) {
    return {
      ok: false,
      xml: '',
      error: 'Namecheap requires ClientIp (x-ada-registrar-client-ip or NAMECHEAP_CLIENT_IP)',
    };
  }

  const params = new URLSearchParams({
    ApiUser: user,
    ApiKey: creds.apiKey,
    UserName: user,
    ClientIp: clientIp,
    Command: command,
    ...extra,
  });

  const res = await fetch(`${baseUrl()}?${params.toString()}`, { method: 'GET' });
  const xml = await res.text();
  const ok = /Status="OK"/i.test(xml) && !/<Errors>\s*<Error/i.test(xml);
  let error: string | undefined;
  const errMatch = xml.match(/<Error[^>]*>([^<]+)<\/Error>/i);
  if (errMatch) error = errMatch[1];
  return { ok, xml, error };
}

function defaultContact(args: RegisterDomainArgs): RegistrantContact | null {
  if (args.contact) return args.contact;
  // Optional env-level contact for automation accounts
  const email = process.env.NAMECHEAP_CONTACT_EMAIL?.trim();
  if (!email) return null;
  return {
    firstName: process.env.NAMECHEAP_CONTACT_FIRST || 'Domain',
    lastName: process.env.NAMECHEAP_CONTACT_LAST || 'Owner',
    email,
    phone: process.env.NAMECHEAP_CONTACT_PHONE || '+1.5555555555',
    address1: process.env.NAMECHEAP_CONTACT_ADDRESS || '1 Main St',
    city: process.env.NAMECHEAP_CONTACT_CITY || 'Austin',
    state: process.env.NAMECHEAP_CONTACT_STATE || 'TX',
    postalCode: process.env.NAMECHEAP_CONTACT_POSTAL || '78701',
    country: process.env.NAMECHEAP_CONTACT_COUNTRY || 'US',
    organization: process.env.NAMECHEAP_CONTACT_ORG || undefined,
  };
}

export const namecheapAdapter: RegistrarAdapter = {
  id: 'namecheap',
  name: 'Namecheap',

  async registerDomain(creds, args: RegisterDomainArgs): Promise<AdapterResult> {
    const domain = args.domain.toLowerCase().trim();
    const dryRun = args.dryRun !== false;
    const years = Math.min(Math.max(args.years ?? 1, 1), 10);
    const contact = defaultContact(args);

    if (!contact) {
      return {
        ok: false,
        provider: 'namecheap',
        domain,
        code: 'CONTACT_REQUIRED',
        message:
          'Namecheap register requires contact (byok.registrar.contact or NAMECHEAP_CONTACT_* env).',
        dryRun,
      };
    }

    if (dryRun) {
      // Check availability only — no create
      const check = await namecheapCall(creds, 'namecheap.domains.check', {
        DomainList: domain,
      });
      const available = /Available="true"/i.test(check.xml);
      return {
        ok: check.ok,
        provider: 'namecheap',
        domain,
        dryRun: true,
        code: available ? 'DRY_RUN_AVAILABLE' : 'DRY_RUN_UNAVAILABLE',
        message: available
          ? `Dry run: ${domain} appears available at Namecheap. Pass dryRun:false + human confirm to register (${years}y).`
          : `Dry run: ${domain} not available or check failed: ${check.error || 'see raw'}`,
        raw: check.xml.slice(0, 2000),
        next: available
          ? ['Re-call with dryRun:false and x-ada-human-confirm to commit']
          : ['Pick another domain from find_brand_domains'],
      };
    }

    const params: Record<string, string> = {
      DomainName: domain,
      Years: String(years),
      AddFreeWhoisguard: 'yes',
      WGEnabled: 'yes',
      ...contactParams('Registrant', contact),
      ...contactParams('Tech', contact),
      ...contactParams('Admin', contact),
      ...contactParams('AuxBilling', contact),
    };

    const result = await namecheapCall(creds, 'namecheap.domains.create', params);
    if (!result.ok) {
      return {
        ok: false,
        provider: 'namecheap',
        domain,
        dryRun: false,
        code: 'REGISTER_FAILED',
        message: result.error || 'Namecheap domains.create failed',
        raw: result.xml.slice(0, 2000),
      };
    }

    return {
      ok: true,
      provider: 'namecheap',
      domain,
      dryRun: false,
      message: `Registered ${domain} at Namecheap for ${years} year(s).`,
      raw: result.xml.slice(0, 2000),
      next: ['Call set_dns_records if needed', 'Verify in Namecheap dashboard'],
    };
  },

  async setDns(creds, args: SetDnsArgs): Promise<AdapterResult> {
    const domain = args.domain.toLowerCase().trim();
    const dryRun = args.dryRun === true;
    const { sld, tld } = splitDomain(domain);

    if (dryRun) {
      return {
        ok: true,
        provider: 'namecheap',
        domain,
        dryRun: true,
        message: `Dry run: would replace all hosts on ${domain} with ${args.records.length} record(s) via setHosts.`,
        next: ['Re-call with dryRun:false + human confirm'],
      };
    }

    // setHosts replaces ALL records — document clearly
    const extra: Record<string, string> = { SLD: sld, TLD: tld };
    args.records.forEach((rec, i) => {
      const n = i + 1;
      const host =
        !rec.name || rec.name === '@' || rec.name === domain
          ? '@'
          : rec.name.replace(/\.$/, '').replace(new RegExp(`\\.${domain.replace(/\./g, '\\.')}$`), '');
      extra[`HostName${n}`] = host;
      extra[`RecordType${n}`] = rec.type.toUpperCase();
      extra[`Address${n}`] = rec.data;
      extra[`TTL${n}`] = String(rec.ttl ?? 1800);
      if (rec.priority != null) extra[`MXPref${n}`] = String(rec.priority);
      else if (rec.type.toUpperCase() === 'MX') extra[`MXPref${n}`] = '10';
    });

    const result = await namecheapCall(creds, 'namecheap.domains.dns.setHosts', extra);
    if (!result.ok) {
      return {
        ok: false,
        provider: 'namecheap',
        domain,
        dryRun: false,
        code: 'DNS_FAILED',
        message: result.error || 'Namecheap setHosts failed (note: setHosts replaces ALL hosts)',
        raw: result.xml.slice(0, 2000),
      };
    }

    return {
      ok: true,
      provider: 'namecheap',
      domain,
      dryRun: false,
      message: `Set ${args.records.length} host record(s) on ${domain} (full replace).`,
      raw: result.xml.slice(0, 2000),
    };
  },
};
