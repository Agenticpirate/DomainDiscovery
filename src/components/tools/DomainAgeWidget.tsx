'use client';

import { ToolDomainForm } from './ToolDomainForm';
import { useDomainTool } from './useDomainTool';
import { ErrorNote, ResultCard } from './ToolResult';

type AgeResponse = {
  domain: string;
  registrar: string;
  registrationDate: string | null;
  expirationDate: string | null;
  ageYears: number | null;
  ageDays: number | null;
  daysUntilExpiry: number | null;
  status: string;
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : 'Not published';

export function DomainAgeWidget() {
  const { domain, data, error, loading, submit } = useDomainTool<AgeResponse>('/api/domains/age');

  const rows: [string, string][] = data
    ? [
        ['Age', data.ageYears !== null ? `${data.ageYears} years (${data.ageDays?.toLocaleString('en-US')} days)` : 'Not published'],
        ['Registered', fmt(data.registrationDate)],
        ['Expires', fmt(data.expirationDate)],
        ['Days until expiry', data.daysUntilExpiry !== null ? String(data.daysUntilExpiry) : 'Not published'],
        ['Registrar', data.registrar || 'Not published'],
      ]
    : [];

  return (
    <div>
      <ToolDomainForm id="age-domain" initial={domain} buttonLabel="Check age" loading={loading} onSubmit={(d) => submit(d)} />
      {error && <ErrorNote message={error} />}
      {data && (
        <ResultCard>
          <p className="text-lg font-bold">{data.domain}</p>
          <p className="mt-1 text-sm text-white/70">{data.status}</p>
          <dl className="mt-4 space-y-2.5 text-[14px]">
            {rows.map(([label, value]) => (
              <div key={label} className="flex flex-col sm:flex-row sm:gap-3">
                <dt className="sm:w-44 shrink-0 font-semibold text-white/50">{label}</dt>
                <dd className="text-white/85">{value}</dd>
              </div>
            ))}
          </dl>
        </ResultCard>
      )}
    </div>
  );
}
