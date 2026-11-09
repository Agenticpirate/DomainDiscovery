import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SeoPageShell } from '@/components/seo/SeoPageShell';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildSeoPageMetadata } from '@/lib/seo/pageMeta';
import { getCheapExtensions, getPriceDataDate } from '@/lib/research';
import { CHEAP_MAX_PRICE, CHEAP_MIN_LIST_SIZE, CHEAP_MIN_REGISTRARS } from '@/lib/research/domainPriceStudy';
import { formatInt, formatUsd, median } from '@/lib/research/report';

export const dynamic = 'force-dynamic';

const path = '/cheapest-domain-extensions';

function copy() {
  const rows = getCheapExtensions();
  const updated = getPriceDataDate();
  const year = new Date(`${updated}T00:00:00Z`).getUTCFullYear();
  const n = rows.length;
  const title = `${formatInt(n)} Cheapest Domain Extensions Under $${CHEAP_MAX_PRICE} (${year})`;
  const prices = rows.map((r) => r.cheapestRegistration.value as number);
  const top3 = rows.slice(0, 3).map((r) => `${r.tld} (${formatUsd(r.cheapestRegistration.value as number)})`);
  const summary = `${formatInt(n)} domain extensions have a lowest listed registration price under $${CHEAP_MAX_PRICE} at ${CHEAP_MIN_REGISTRARS} or more registrars, ranked by that price. The median is ${formatUsd(median(prices) ?? 0)} and the three cheapest are ${top3.join(', ')}. Prices checked ${updated}.`;
  return { rows, updated, title, summary };
}

export function generateMetadata(): Metadata {
  const { rows, title, summary } = copy();
  if (rows.length === 0) return {};
  return buildSeoPageMetadata({ title, description: summary, path });
}

export default function CheapestExtensionsPage() {
  const { rows, updated, title, summary } = copy();
  // Below the minimum size the list is not worth a page: send visitors to the parent.
  if (rows.length < CHEAP_MIN_LIST_SIZE) redirect('/domain-extensions');

  return (
    <SeoPageShell
      path={path}
      title={title}
      description={summary}
      h1={title}
      intro={summary}
      crumbs={[{ label: 'Domain extensions', href: '/domain-extensions' }, { label: 'Cheapest' }]}
    >
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: title,
          numberOfItems: rows.length,
          itemListElement: rows.map((r, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: r.tld,
          })),
        }}
      />
      <section className="mt-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr>
                <th scope="col" className="py-2 pr-4 font-semibold text-white/80">#</th>
                <th scope="col" className="py-2 pr-4 font-semibold text-white/80">Extension</th>
                <th scope="col" className="py-2 pr-4 font-semibold text-white/80">Lowest registration</th>
                <th scope="col" className="py-2 pr-4 font-semibold text-white/80">Registrar</th>
                <th scope="col" className="py-2 pr-4 font-semibold text-white/80">Lowest renewal</th>
                <th scope="col" className="py-2 pr-4 font-semibold text-white/80">Registrars</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.tld} className="border-t border-white/10">
                  <td className="py-2 pr-4">{i + 1}</td>
                  <td className="py-2 pr-4 font-semibold">{r.tld}</td>
                  <td className="py-2 pr-4">{formatUsd(r.cheapestRegistration.value as number)}</td>
                  <td className="py-2 pr-4">{r.cheapestRegistration.registrar ?? 'n/a'}</td>
                  <td className="py-2 pr-4">
                    {r.cheapestRenewal.value != null ? formatUsd(r.cheapestRenewal.value) : 'n/a'}
                  </td>
                  <td className="py-2 pr-4">{r.offers.filter((o) => o.registration != null).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          How this list is built: extensions with a listed registration price under ${CHEAP_MAX_PRICE} and prices from at least {CHEAP_MIN_REGISTRARS} registrars, ranked by lowest registration price, then by number of registrars. Prices are from the {updated} dataset and can change. Renewal is often higher than the first-year price, so check it before you buy.
        </p>
      </section>
      <RelatedLinks
        title="Related"
        links={[
          { href: '/research/domain-prices', label: 'Domain extension price statistics' },
          { href: '/tools/compare', label: 'Compare registrar prices' },
          { href: '/domain-extensions', label: 'Browse all domain extensions' },
        ]}
      />
    </SeoPageShell>
  );
}
