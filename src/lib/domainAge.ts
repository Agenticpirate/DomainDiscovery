import type { WhoisPayload } from '@/lib/rdapClient';

export type AgeSummary = {
  registrationDate: string | null;
  expirationDate: string | null;
  ageYears: number | null;
  ageDays: number | null;
  daysUntilExpiry: number | null;
  status: string;
};

const DAY_MS = 86_400_000;

function parse(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}

export function summarizeAge(
  whois: Pick<WhoisPayload, 'registrationDateIso' | 'expirationDateIso'>,
  now: Date
): AgeSummary {
  const created = parse(whois.registrationDateIso);
  const expires = parse(whois.expirationDateIso);
  const nowMs = now.getTime();

  const ageDays = created !== null ? Math.max(0, Math.floor((nowMs - created) / DAY_MS)) : null;
  const ageYears = ageDays !== null ? Math.round((ageDays / 365.25) * 10) / 10 : null;
  const daysUntilExpiry = expires !== null ? Math.ceil((expires - nowMs) / DAY_MS) : null;

  let status: string;
  if (daysUntilExpiry === null) status = 'Expiry date not published by the registry.';
  else if (daysUntilExpiry < 0) status = `Expired ${-daysUntilExpiry} days ago; it may be in a grace or redemption period.`;
  else if (daysUntilExpiry <= 30) status = `Expires soon, in ${daysUntilExpiry} days.`;
  else status = `Active, expires in ${daysUntilExpiry} days.`;

  return {
    registrationDate: whois.registrationDateIso,
    expirationDate: whois.expirationDateIso,
    ageYears,
    ageDays,
    daysUntilExpiry,
    status,
  };
}
