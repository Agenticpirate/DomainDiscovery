import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { getTldAboutDetail, getTldAboutSlugs } from '@/lib/tldAboutData';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return getTldAboutSlugs().map((slug) => ({ slug }));
}

export default function TldAboutPage({ params }: PageProps) {
  const detail = getTldAboutDetail(params.slug);
  if (!detail) notFound();

  const features = Object.entries(detail.features || {}).filter(([k]) => k !== 'note');
  const restrictions = detail.registrationRestrictions || {};

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <PageBackground variant="default" />
      <Navigation />

      <main className="relative pt-20 sm:pt-24 px-4 sm:px-6 pb-14">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: 'TLD encyclopedia', href: '/blog/tlds' },
              { label: detail.tld },
            ]}
          />

          <header className="mt-5 sm:mt-7">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/55">
                {detail.type}
              </span>
              {detail.typeLabel && (
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {detail.typeLabel}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{detail.title}</h1>
            {detail.sponsor && (
              <p className="mt-3 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                Registry / sponsor: <strong className="text-white/90">{detail.sponsor}</strong>
              </p>
            )}
          </header>

          {/* About */}
          <section className="mt-8 rounded-2xl border border-white/10 bg-[#0c0c0e] p-5 sm:p-6">
            <h2 className="text-lg font-bold mb-3">About {detail.tld} domains</h2>
            {detail.about.split('\n\n').map((para, i) => (
              <p key={i} className="text-[14px] sm:text-[15px] leading-relaxed mb-3 last:mb-0" style={{ color: 'var(--text-secondary)' }}>
                {para}
              </p>
            ))}
          </section>

          {/* Who can register */}
          <section className="mt-4 rounded-2xl border border-white/10 bg-[#0c0c0e] p-5 sm:p-6">
            <h2 className="text-lg font-bold mb-3">Who can register {detail.tld} domains?</h2>
            <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {detail.whoCanRegister}
            </p>
          </section>

          {/* Restrictions */}
          <section className="mt-4 rounded-2xl border border-white/10 bg-[#0c0c0e] p-5 sm:p-6">
            <h2 className="text-lg font-bold mb-3">Registration restrictions</h2>
            {restrictions.note && (
              <p className="text-[12px] mb-4" style={{ color: 'var(--text-muted)' }}>
                {restrictions.note}
              </p>
            )}
            <dl className="space-y-3 text-[14px]">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Length
                </dt>
                <dd className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {restrictions.minLength ?? 1} – {restrictions.maxLength ?? 63} characters (label before {detail.tld})
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Can use
                </dt>
                <dd className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {restrictions.canUse}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Cannot use
                </dt>
                <dd className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {restrictions.cannotUse}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  IDNs
                </dt>
                <dd className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {restrictions.idns}
                </dd>
              </div>
            </dl>
          </section>

          {/* Features */}
          <section className="mt-4 rounded-2xl border border-white/10 bg-[#0c0c0e] p-5 sm:p-6">
            <h2 className="text-lg font-bold mb-3">Features</h2>
            {detail.features?.note && (
              <p className="text-[12px] mb-4" style={{ color: 'var(--text-muted)' }}>
                {detail.features.note}
              </p>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              {features.map(([key, value]) => (
                <div key={key} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="mt-1 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Registry technical */}
          <section className="mt-4 rounded-2xl border border-white/10 bg-[#0c0c0e] p-5 sm:p-6">
            <h2 className="text-lg font-bold mb-3">Registry information</h2>
            <dl className="space-y-2.5 text-[13px]">
              {[
                ['Sponsor / manager', detail.sponsor],
                ['Registration services', detail.registryUrl],
                ['WHOIS server', detail.whoisServer],
                ['RDAP server', detail.rdapServer],
                ['Root zone registration', detail.registrationDate],
                ['Record last updated', detail.recordUpdated],
              ].map(([label, value]) =>
                value ? (
                  <div key={label as string} className="flex flex-col sm:flex-row sm:gap-3">
                    <dt className="sm:w-44 shrink-0 font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {label}
                    </dt>
                    <dd className="break-all" style={{ color: 'var(--text-secondary)' }}>
                      {typeof value === 'string' && value.startsWith('http') ? (
                        <a href={value} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                ) : null
              )}
            </dl>

            {detail.nameServers && detail.nameServers.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-bold mb-2">Name servers</h3>
                <ul className="space-y-1.5 font-mono text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                  {detail.nameServers.map((ns) => (
                    <li key={ns.host}>
                      {ns.host}
                      {ns.addresses?.length ? (
                        <span className="block sm:inline sm:ml-2 text-[11px] opacity-70">
                          {ns.addresses.join(' · ')}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={`/tools/whois?domain=example${detail.tld}`}
              className="rounded-xl bg-white text-black px-4 py-2.5 text-sm font-bold hover:bg-white/90"
            >
              WHOIS lookup
            </Link>
            <Link
              href="/tools/compare"
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/[0.05]"
            >
              Compare prices
            </Link>
            <Link
              href="/blog/tlds"
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/[0.05]"
            >
              All extensions
            </Link>
          </div>

          <p className="mt-8 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Source: {detail.source}.{' '}
            <a href={detail.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              View IANA delegation record
            </a>
            . Registrar-specific rules (e.g. GoDaddy transfer policies) can differ from registry policy and are not
            scraped here.
            {detail.scrapedAt ? ` Cataloged ${detail.scrapedAt.slice(0, 10)}.` : ''}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
