import { SeoPageShell } from '@/components/seo/SeoPageShell';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqJsonLd } from '@/lib/seo/pageMeta';
import { getSiteBaseUrl, SITE_BRAND } from '@/lib/seoSiteFacts';
import { suggestedCitation, type Report } from '@/lib/research/report';

const card = 'mt-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6';

function AnchorLink({ id, label }: { id: string; label: string }) {
  return (
    <a href={`#${id}`} className="text-[12px] underline" style={{ color: 'var(--text-muted)' }}>
      {label}
    </a>
  );
}

export function datasetJsonLd(report: Report, baseUrl: string): Record<string, unknown> {
  const url = `${baseUrl}${report.path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: report.datasetName,
    description: report.description,
    url,
    creator: { '@type': 'Organization', name: SITE_BRAND.name, url: baseUrl },
    dateModified: report.updated,
    variableMeasured: report.variables,
    measurementTechnique: report.technique,
    distribution: [
      { '@type': 'DataDownload', encodingFormat: 'text/markdown', contentUrl: `${url}.md` },
    ],
  };
}

/** Server-rendered research page: findings, tables, methodology, FAQ and citation. */
export function ResearchReportView({ report }: { report: Report }) {
  const baseUrl = getSiteBaseUrl();
  return (
    <SeoPageShell
      path={report.path}
      title={report.title}
      description={report.description}
      h1={report.h1}
      intro={report.intro}
      crumbs={[{ label: 'Research', href: '/research' }, { label: report.h1 }]}
    >
      <JsonLd data={datasetJsonLd(report, baseUrl)} />
      {report.faq.length > 0 && (
        <JsonLd data={faqJsonLd(report.faq.map(({ question, answer }) => ({ question, answer })))} />
      )}

      <p className="mt-3 text-[12px]" style={{ color: 'var(--text-muted)' }}>
        Data as of <time dateTime={report.updated}>{report.updated}</time>.
      </p>

      <section className={card} aria-labelledby="key-findings">
        <h2 id="key-findings" className="text-lg font-bold mb-3">
          Key findings
        </h2>
        <ol className="space-y-4 list-decimal pl-5">
          {report.findings.map((f) => (
            <li key={f.id} id={f.id} className="text-[15px] leading-relaxed scroll-mt-24">
              {f.text}{' '}
              <AnchorLink id={f.id} label="Link to this finding" />
            </li>
          ))}
        </ol>
      </section>

      {report.tables.map((table) => (
        <section key={table.id} id={table.id} className={`${card} scroll-mt-24`}>
          <h2 className="text-lg font-bold mb-3">{table.caption}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr>
                  {table.headers.map((h) => (
                    <th key={h} scope="col" className="py-2 pr-4 font-semibold text-white/80">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={row.join('|')} className="border-t border-white/10">
                    {row.map((cell, i) => (
                      <td key={`${i}-${cell}`} className="py-2 pr-4">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className={card} aria-labelledby="methodology">
        <h2 id="methodology" className="text-lg font-bold mb-3">
          Methodology
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {report.methodology.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      {report.faq.length > 0 && (
        <section className={card} aria-labelledby="faq">
          <h2 id="faq" className="text-lg font-bold mb-3">
            Frequently asked questions
          </h2>
          <div className="space-y-5">
            {report.faq.map((q) => (
              <div key={q.id} id={q.id} className="scroll-mt-24">
                <h3 className="text-[15px] font-semibold">{q.question}</h3>
                <p className="mt-1 text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {q.answer}
                </p>
                <AnchorLink id={q.id} label="Link to this answer" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={card} aria-labelledby="citation">
        <h2 id="citation" className="text-lg font-bold mb-3">
          Suggested citation
        </h2>
        <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {suggestedCitation(report, baseUrl)}
        </p>
        <p className="mt-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
          Markdown version: <a className="underline" href={`${report.path}.md`}>{`${report.path}.md`}</a>
        </p>
      </section>

      <RelatedLinks title="Related" links={report.related} />
    </SeoPageShell>
  );
}
