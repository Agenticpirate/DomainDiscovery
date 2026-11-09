import type { TldPricingDetail } from '@/lib/tldPriceTypes';

export function TldPriceTable({ tld, price }: { tld: string; price: TldPricingDetail }) {
  const rows = [...price.registrars]
    .filter((r) => r.registration.value != null)
    .sort((a, b) => (a.registration.value ?? 0) - (b.registration.value ?? 0))
    .slice(0, 8);
  if (!rows.length) return null;
  const cell = (c: { display: string | null }) => c.display ?? '—';
  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
      <h2 className="text-lg font-bold mb-3">{tld} domain prices by registrar</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              <th scope="col" className="py-2 pr-3">Registrar</th>
              <th scope="col" className="py-2 pr-3">Register</th>
              <th scope="col" className="py-2 pr-3">Renew</th>
              <th scope="col" className="py-2">Transfer</th>
            </tr>
          </thead>
          <tbody style={{ color: 'var(--text-secondary)' }}>
            {rows.map((r) => (
              <tr key={r.registrar} className="border-t border-white/10">
                <th scope="row" className="py-2 pr-3 font-semibold text-white/90">{r.registrar}</th>
                <td className="py-2 pr-3">{cell(r.registration)}</td>
                <td className="py-2 pr-3">{cell(r.renewal)}</td>
                <td className="py-2">{cell(r.transfer)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        Prices change often and may include promotions. Verify at the registrar before buying. Source:{' '}
        <a href={price.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          tld-list.com
        </a>
        .
      </p>
    </section>
  );
}
