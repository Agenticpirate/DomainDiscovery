'use client';

import { ToolDomainForm } from './ToolDomainForm';
import { useDomainTool } from './useDomainTool';
import { ErrorNote, ResultCard } from './ToolResult';
import type { ValueFactor } from '@/lib/domainValue';

type ValueResponse = {
  domain: string;
  low: number;
  high: number;
  midpoint: number;
  score: number;
  factors: ValueFactor[];
  disclaimer: string;
};

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

export function ValueEstimatorWidget() {
  const { domain, data, error, loading, submit } = useDomainTool<ValueResponse>('/api/domains/value');

  return (
    <div>
      <ToolDomainForm id="value-domain" initial={domain} buttonLabel="Estimate value" loading={loading} onSubmit={(d) => submit(d)} />
      {error && <ErrorNote message={error} />}
      {data && (
        <ResultCard>
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">Estimated value range for {data.domain}</p>
          <p className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">
            {usd(data.low)} – {usd(data.high)}
          </p>
          <p className="mt-1 text-sm text-white/60">
            Midpoint {usd(data.midpoint)} · Score {data.score}/100
          </p>
          <p className="mt-3 rounded-xl border border-white/15 bg-black px-3 py-2 text-[13px] text-white/80">{data.disclaimer}</p>
          <ul className="mt-4 space-y-2">
            {data.factors.map((f) => (
              <li key={f.label} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-[13px]">
                <span className="font-semibold text-white/90">
                  {f.effect === 'positive' ? '+ ' : f.effect === 'negative' ? '− ' : ''}
                  {f.label}
                </span>
                <span className="block text-white/60">{f.detail}</span>
              </li>
            ))}
          </ul>
        </ResultCard>
      )}
    </div>
  );
}
