/**
 * Fast RDAP client using:
 * - Cached IANA bootstrap (https://data.iana.org/rdap/dns.json) for zero-hop TLD→server
 * - Direct registry queries (Verisign, PIR, Identity Digital, etc.)
 * - Short timeouts + parallel race
 * - In-memory response cache for instant repeat lookups
 *
 * No API keys. Free public registry RDAP only.
 */
import bootstrapData from '@/data/rdap-bootstrap.json';

export type RdapEntity = {
  roles?: string[];
  handle?: string;
  vcardArray?: unknown;
  entities?: RdapEntity[];
  publicIds?: { type?: string; identifier?: string }[];
};

export type RdapResponse = {
  objectClassName?: string;
  ldhName?: string;
  unicodeName?: string;
  handle?: string;
  status?: string[];
  events?: { eventAction?: string; eventDate?: string }[];
  entities?: RdapEntity[];
  nameservers?: { ldhName?: string; unicodeName?: string }[];
  secureDNS?: { delegationSigned?: boolean };
  notices?: { title?: string; description?: string[] }[];
  errorCode?: number;
  title?: string;
  description?: string[];
};

export type WhoisPayload = {
  success: true;
  source: string;
  domain: string;
  unicodeName: string | null;
  handle: string | null;
  registrar: string;
  registrarIanaId: string | null;
  registrarUrl: string | null;
  registrarEmail: string | null;
  status: string;
  statuses: string[];
  registrationDate: string | null;
  registrationDateIso: string | null;
  updatedDate: string | null;
  updatedDateIso: string | null;
  expirationDate: string | null;
  expirationDateIso: string | null;
  nameServers: string[];
  dnssec: boolean;
  registrant: {
    name?: string | null;
    organization?: string | null;
    email?: string | null;
    country?: string | null;
    role?: string | null;
  };
  notices: string[];
  latencyMs: number;
  server: string;
};

type FailResult = {
  success: false;
  domain: string;
  error: string;
  available?: boolean;
  latencyMs: number;
};

/** Manual overrides for TLDs missing or incomplete in IANA bootstrap snapshot */
const EXTRA_SERVERS: Record<string, string[]> = {
  io: ['https://rdap.identitydigital.services/rdap/'],
  ac: ['https://rdap.identitydigital.services/rdap/'],
  sh: ['https://rdap.identitydigital.services/rdap/'],
  // common fallbacks when bootstrap lacks an entry
  co: ['https://rdap.identitydigital.services/rdap/'],
  me: ['https://rdap.identitydigital.services/rdap/'],
  us: ['https://rdap.identitydigital.services/rdap/'],
  de: ['https://rdap.denic.de/'],
  nl: ['https://rdap.sidn.nl/'],
  eu: ['https://rdap.eurid.eu/'],
  ca: ['https://rdap.cira.ca/rdap/'],
  au: ['https://rdap.auda.org.au/rdap/'],
  fr: ['https://rdap.nic.fr/'],
  ch: ['https://rdap.nic.ch/'],
  at: ['https://rdap.nic.at/rdap/'],
  be: ['https://rdap.dns.be/'],
  se: ['https://rdap.iis.se/'],
  no: ['https://rdap.norid.no/'],
  fi: ['https://rdap.fi/rdap/rdap/'],
  pl: ['https://rdap.dns.pl/'],
  es: ['https://rdap.nic.es/'],
  it: ['https://rdap.nic.it/'],
  jp: ['https://rdap.jprs.jp/'],
  kr: ['https://rdap.kr/'],
  cn: ['https://rdap.cnnic.cn/rdap/'],
  br: ['https://rdap.registro.br/'],
  mx: ['https://rdap.mx/'],
  nz: ['https://rdap.irs.net.nz/rdap/'],
  za: ['https://rdap.registry.net.za/rdap/'],
};

const BOOTSTRAP_SERVERS: Record<string, string[]> = {
  ...(bootstrapData as { servers: Record<string, string[]> }).servers,
  ...EXTRA_SERVERS,
};

const RESPONSE_CACHE = new Map<string, { expires: number; value: WhoisPayload | FailResult }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const FETCH_TIMEOUT_MS = 2800;

const UA = 'DomainDiscovery/1.0 (+https://localhost; RDAP client)';

export function normalizeDomain(input: string): string | null {
  let value = input.trim().toLowerCase();
  if (!value) return null;

  value = value.replace(/^https?:\/\//, '');
  value = value.replace(/^www\./, '');
  value = value.split('/')[0] ?? value;
  value = value.split('?')[0] ?? value;
  value = value.split('#')[0] ?? value;
  value = value.replace(/\.$/, '');

  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(value)) {
    return null;
  }
  if (value.length > 253) return null;
  return value;
}

/** Longest-suffix match against IANA bootstrap (RFC 7484 style). */
export function resolveRdapServers(domain: string): string[] {
  const labels = domain.toLowerCase().split('.');
  for (let i = 0; i < labels.length; i++) {
    const suffix = labels.slice(i).join('.');
    const bases = BOOTSTRAP_SERVERS[suffix];
    if (bases?.length) {
      return bases.map((b) => b.replace(/\/?$/, '/'));
    }
  }
  return [];
}

function buildDomainUrls(domain: string): string[] {
  const bases = resolveRdapServers(domain);
  const urls = bases.map((base) => `${base}domain/${encodeURIComponent(domain)}`);

  // Bootstrap redirects as last-resort (slower hop) — only if no direct server
  if (urls.length === 0) {
    urls.push(
      `https://rdap.org/domain/${encodeURIComponent(domain)}`,
      `https://www.rdap.net/domain/${encodeURIComponent(domain)}`
    );
  }

  // For gTLDs on Verisign, add known-fast path if missing
  if (domain.endsWith('.com') && !urls.some((u) => u.includes('verisign.com/com'))) {
    urls.unshift(`https://rdap.verisign.com/com/v1/domain/${encodeURIComponent(domain)}`);
  }
  if (domain.endsWith('.net') && !urls.some((u) => u.includes('verisign.com/net'))) {
    urls.unshift(`https://rdap.verisign.com/net/v1/domain/${encodeURIComponent(domain)}`);
  }

  return Array.from(new Set(urls));
}

function vcardField(entity: RdapEntity | undefined, field: string): string | null {
  if (!entity?.vcardArray || !Array.isArray(entity.vcardArray)) return null;
  const rows = entity.vcardArray[1];
  if (!Array.isArray(rows)) return null;

  for (const row of rows) {
    if (!Array.isArray(row) || row.length < 4) continue;
    if (row[0] === field) {
      const value = row[3];
      if (typeof value === 'string' && value.trim()) return value.trim();
      if (Array.isArray(value)) {
        const joined = value.filter((v) => typeof v === 'string' && v.trim()).join(', ');
        if (joined) return joined;
      }
    }
  }
  return null;
}

function findEntitiesByRole(entities: RdapEntity[] | undefined, role: string): RdapEntity[] {
  if (!entities?.length) return [];
  const hits: RdapEntity[] = [];
  const walk = (list: RdapEntity[]) => {
    for (const entity of list) {
      if ((entity.roles || []).map((r) => r.toLowerCase()).includes(role.toLowerCase())) {
        hits.push(entity);
      }
      if (entity.entities?.length) walk(entity.entities);
    }
  };
  walk(entities);
  return hits;
}

function extractRegistrar(entities: RdapEntity[] | undefined) {
  const primary = findEntitiesByRole(entities, 'registrar')[0];
  if (!primary) return { name: null as string | null, ianaId: null as string | null, url: null as string | null, email: null as string | null };
  return {
    name: vcardField(primary, 'fn') || vcardField(primary, 'org') || primary.handle || null,
    ianaId:
      primary.publicIds?.find((p) => /iana/i.test(p.type || ''))?.identifier ||
      primary.publicIds?.[0]?.identifier ||
      null,
    url: vcardField(primary, 'url'),
    email: vcardField(primary, 'email'),
  };
}

function extractRegistrant(entities: RdapEntity[] | undefined) {
  for (const role of ['registrant', 'administrative', 'technical'] as const) {
    const match = findEntitiesByRole(entities, role)[0];
    if (!match) continue;
    const name = vcardField(match, 'fn');
    const organization = vcardField(match, 'org');
    const email = vcardField(match, 'email');
    let country: string | null = null;
    if (match.vcardArray && Array.isArray(match.vcardArray)) {
      const rows = match.vcardArray[1];
      if (Array.isArray(rows)) {
        for (const row of rows) {
          if (Array.isArray(row) && row[0] === 'adr' && Array.isArray(row[3])) {
            const c = row[3][6];
            if (typeof c === 'string' && c.trim()) country = c.trim();
          }
        }
      }
    }
    if (name || organization || email || country) {
      return { role, name, organization, email, country };
    }
  }
  return null;
}

function eventDate(events: RdapResponse['events'], action: string): string | null {
  if (!events?.length) return null;
  const hit = events.find((e) => (e.eventAction || '').toLowerCase() === action.toLowerCase());
  return hit?.eventDate || null;
}

function formatDisplayDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

function toPayload(domain: string, data: RdapResponse, server: string, latencyMs: number): WhoisPayload {
  const registrar = extractRegistrar(data.entities);
  const registrant = extractRegistrant(data.entities);
  const createdIso = eventDate(data.events, 'registration') || eventDate(data.events, 'registered');
  const updatedIso =
    eventDate(data.events, 'last changed') ||
    eventDate(data.events, 'last update of RDAP database') ||
    eventDate(data.events, 'last update');
  const expiresIso = eventDate(data.events, 'expiration') || eventDate(data.events, 'expiry');
  const nameServers = (data.nameservers || [])
    .map((ns) => (ns.ldhName || ns.unicodeName || '').replace(/\.$/, '').toLowerCase())
    .filter(Boolean);
  const statuses = (data.status || []).map((s) => s.replace(/_/g, ' '));

  return {
    success: true,
    source: 'RDAP (IANA bootstrap → registry)',
    domain: (data.ldhName || domain).toLowerCase(),
    unicodeName: data.unicodeName || null,
    handle: data.handle || null,
    registrar: registrar.name || 'Unknown',
    registrarIanaId: registrar.ianaId,
    registrarUrl: registrar.url,
    registrarEmail: registrar.email,
    status: statuses[0] || 'unknown',
    statuses,
    registrationDate: formatDisplayDate(createdIso),
    registrationDateIso: createdIso,
    updatedDate: formatDisplayDate(updatedIso),
    updatedDateIso: updatedIso,
    expirationDate: formatDisplayDate(expiresIso),
    expirationDateIso: expiresIso,
    nameServers,
    dnssec: Boolean(data.secureDNS?.delegationSigned),
    registrant: registrant
      ? {
          name: registrant.name,
          organization: registrant.organization,
          email: registrant.email,
          country: registrant.country,
          role: registrant.role,
        }
      : {
          organization: 'Redacted / privacy protected',
          country: null,
        },
    notices: (data.notices || [])
      .slice(0, 3)
      .map((n) => n.title || n.description?.join(' ') || '')
      .filter(Boolean),
    latencyMs,
    server,
  };
}

async function fetchJsonWithTimeout(url: string, timeoutMs: number): Promise<{
  status: number;
  data: RdapResponse | null;
  server: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/rdap+json, application/json',
        'User-Agent': UA,
      },
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
    });

    if (response.status === 404) {
      return { status: 404, data: null, server: url };
    }
    if (!response.ok) {
      return { status: response.status, data: null, server: url };
    }

    const data = (await response.json()) as RdapResponse;
    if (data.errorCode || data.objectClassName === 'error') {
      return { status: data.errorCode || 400, data: null, server: url };
    }
    return { status: 200, data, server: url };
  } catch {
    return { status: 0, data: null, server: url };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Race the first 2 direct registry URLs. Fail fast.
 */
export async function lookupWhois(rawDomain: string): Promise<WhoisPayload | FailResult> {
  const started = Date.now();
  const domain = normalizeDomain(rawDomain);
  if (!domain) {
    return {
      success: false,
      domain: rawDomain,
      error: 'Enter a valid domain name (e.g. example.com).',
      latencyMs: Date.now() - started,
    };
  }

  const cached = RESPONSE_CACHE.get(domain);
  if (cached && cached.expires > Date.now()) {
    const value = { ...cached.value, latencyMs: 0 } as WhoisPayload | FailResult;
    if (value.success) {
      return { ...value, latencyMs: 0, source: `${value.server} (cache)` };
    }
    return { ...value, latencyMs: 0 };
  }

  const urls = buildDomainUrls(domain);

  type Hit = { status: number; data: RdapResponse | null; server: string };
  let hit: Hit | null = null;
  let sawNotFound = false;

  // Race first two registry URLs for split-second responses
  const primary = urls.slice(0, 2);
  if (primary.length > 0) {
    const raced = await Promise.all(primary.map((url) => fetchJsonWithTimeout(url, FETCH_TIMEOUT_MS)));
    for (const result of raced) {
      if (result.status === 200 && result.data) {
        hit = result;
        break;
      }
      if (result.status === 404) sawNotFound = true;
    }
  }

  // Sequential fallback only if race missed
  if (!hit) {
    for (const url of urls.slice(2)) {
      const result = await fetchJsonWithTimeout(url, FETCH_TIMEOUT_MS);
      if (result.status === 200 && result.data) {
        hit = result;
        break;
      }
      if (result.status === 404) sawNotFound = true;
    }
  }

  const latencyMs = Date.now() - started;

  if (!hit?.data) {
    if (sawNotFound) {
      const fail: FailResult = {
        success: false,
        domain,
        error: 'Domain not found in RDAP — it may be available to register, or this TLD has no public RDAP.',
        available: true,
        latencyMs,
      };
      RESPONSE_CACHE.set(domain, { expires: Date.now() + 60_000, value: fail });
      return fail;
    }
    return {
      success: false,
      domain,
      error: 'No RDAP server responded in time. Try again — some registries are slow or offline.',
      latencyMs,
    };
  }

  const payload = toPayload(domain, hit.data, hit.server, latencyMs);
  RESPONSE_CACHE.set(domain, { expires: Date.now() + CACHE_TTL_MS, value: payload });
  return payload;
}
