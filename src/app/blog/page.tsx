import Link from 'next/link';
import type { Metadata } from 'next';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { getTldAboutIndex, getTldAboutMeta } from '@/lib/tldAboutData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Domain Blog & TLD Encyclopedia — Extension Guides',
  description:
    'Domain strategy plus a TLD encyclopedia with registry-level about pages: sponsors, WHOIS/RDAP, and nameserver context from public IANA root zone data.',
};

export default function BlogPage() {
  const meta = getTldAboutMeta();
  const tlds = getTldAboutIndex();
  const featured = tlds.slice(0, 24);
  const byType = {
    gTLD: tlds.filter((t) => t.type === 'gTLD').length,
    ccTLD: tlds.filter((t) => t.type === 'ccTLD').length,
    other: tlds.filter((t) => t.type !== 'gTLD' && t.type !== 'ccTLD').length,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <PageBackground variant="default" />
      <Navigation />

      <main className={`${PAGE_MAIN_CLASS} pb-14`}>
        <PageBreadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />
        <SectionAmbient intensity="hero" contentClassName="page-gutter">
        <div className="max-w-6xl mx-auto">
          <header className="mt-2 sm:mt-4 max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
              TLD encyclopedia · domain strategy
            </p>
            <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight">
              Domain blog &amp; TLD encyclopedia
            </h1>
            <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Research domain extensions before you register: registry sponsors, WHOIS/RDAP endpoints, and nameserver
              context drawn from the public IANA Root Zone Database — plus strategy notes for buyers and local SEO teams.
            </p>
          </header>
        </div>
        </SectionAmbient>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl border overflow-hidden border-white/10 bg-white/[0.08]">
            {[
              { value: String(meta.count), label: 'TLD about pages' },
              { value: String(byType.gTLD), label: 'gTLDs' },
              { value: String(byType.ccTLD), label: 'ccTLDs' },
              { value: meta.generatedAt || '—', label: 'Catalog date' },
            ].map((s) => (
              <div key={s.label} className="bg-[#0c0c0e] px-3 py-4 text-center">
                <div className="text-lg sm:text-xl font-black tabular-nums">{s.value}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Featured TLD guides */}
          <section className="mt-10">
            <div className="flex items-end justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">About domain extensions</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  Who runs the registry, WHOIS/RDAP servers, and registration norms.
                </p>
              </div>
              <Link
                href="/blog/tlds"
                className="text-xs sm:text-sm font-semibold shrink-0 hover:underline underline-offset-4"
                style={{ color: 'var(--text-secondary)' }}
              >
                View all →
              </Link>
            </div>

            {featured.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#0c0c0e] p-6 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                TLD about catalog is still building. Run{' '}
                <code className="text-white/70">python3 scripts/scrape_tld_about.py --priority-only</code> to seed
                pages.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {featured.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/blog/tlds/${item.slug}`}
                    className="group rounded-xl border border-white/10 bg-[#0c0c0e] px-3.5 py-3 hover:border-white/25 hover:bg-[#121214] transition-colors"
                  >
                    <div className="text-base font-black tracking-tight group-hover:text-white">{item.tld}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                      {item.type}
                    </div>
                    {item.sponsor && (
                      <div className="mt-1.5 text-[12px] line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>
                        {item.sponsor}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Editorial placeholders */}
          <section className="mt-12 border-t border-white/5 pt-10">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-3">Strategy notes</h2>
            <p className="text-sm max-w-2xl mb-5" style={{ color: 'var(--text-tertiary)' }}>
              Product updates, naming frameworks, and registrar comparisons. Editorial posts expand alongside the TLD
              encyclopedia.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                {
                  href: '/learn/choosing-domain',
                  title: 'Choosing a domain',
                  body: 'Practical guide to brandable names, TLDs, and availability.',
                },
                {
                  href: '/learn/domain-extensions',
                  title: 'Domain extensions explained',
                  body: 'How gTLDs, ccTLDs, and new extensions differ for founders.',
                },
                {
                  href: '/tools/compare',
                  title: 'Price comparison',
                  body: 'Regular registration, renewal, and transfer prices across registrars.',
                },
                {
                  href: '/tools/whois',
                  title: 'WHOIS lookup',
                  body: 'Live RDAP data plus free status-change email watches.',
                },
              ].map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded-xl border border-white/10 bg-[#0c0c0e] p-4 hover:border-white/20 transition-colors"
                >
                  <div className="font-bold">{card.title}</div>
                  <p className="mt-1 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                    {card.body}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
