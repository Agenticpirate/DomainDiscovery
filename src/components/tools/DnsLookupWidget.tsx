'use client';

import { ToolDomainForm } from './ToolDomainForm';
import { useDomainTool } from './useDomainTool';
import { ErrorNote, ResultCard } from './ToolResult';
import { DNS_TYPES, type DnsRecord } from '@/lib/dnsTypes';

type DnsResponse = { domain: string; type: string; status: number; records: DnsRecord[]; resolver: string };

export function DnsLookupWidget() {
  const { domain, data, error, loading, submit, params } = useDomainTool<DnsResponse>('/api/domains/dns', ['type']);
  const type = (params.get('type') || 'A').toUpperCase();

  return (
    <div>
      <ToolDomainForm id="dns-domain" initial={domain} buttonLabel="Look up" loading={loading} onSubmit={(d) => submit(d, { type })}>
        <label htmlFor="dns-type" className="sr-only">
          Record type
        </label>
        <select
          id="dns-type"
          value={type}
          onChange={(e) => domain && submit(domain, { type: e.target.value })}
          className="rounded-xl border border-white/15 bg-black px-3 py-3 text-[15px] text-white outline-none focus:border-white/40"
        >
          {DNS_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </ToolDomainForm>
      {error && <ErrorNote message={error} />}
      {data && (
        <ResultCard>
          <p className="text-lg font-bold">
            {data.type} records for {data.domain}
          </p>
          {data.records.length === 0 ? (
            <p className="mt-2 text-sm text-white/60">
              {data.status === 3 ? 'This domain does not exist (NXDOMAIN).' : `No ${data.type} records found.`}
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="text-white/50">
                    <th className="py-2 pr-4 font-semibold">Type</th>
                    <th className="py-2 pr-4 font-semibold">Value</th>
                    <th className="py-2 font-semibold">TTL</th>
                  </tr>
                </thead>
                <tbody>
                  {data.records.map((r, i) => (
                    <tr key={`${r.data}-${i}`} className="border-t border-white/10">
                      <td className="py-2 pr-4 font-mono text-white/70">{r.type}</td>
                      <td className="py-2 pr-4 break-all font-mono text-white/90">{r.data}</td>
                      <td className="py-2 font-mono text-white/70">{r.ttl}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-[11px] text-white/40">Resolved via {data.resolver} (DNS over HTTPS).</p>
        </ResultCard>
      )}
    </div>
  );
}
