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
  title: 'TLD Encyclopedia — Domain Extensions & Registry Guides',
  description:
    'Browse domain extensions (TLDs) with registry-oriented about pages: gTLDs, ccTLDs, sponsors, and public DNS root context. Then check availability on DomainDiscovery.',
  alternates: { canonical: '/blog/tlds' },
  openGraph: {
    title: 'TLD Encyclopedia — Domain Extensions & Registry Guides',
    description:
      'Browse domain extensions (TLDs) with registry-oriented about pages: gTLDs, ccTLDs, sponsors, and public DNS root context. Then check availability on DomainDiscovery.',
    url: '/blog/tlds',
  },
};

export default function BlogTldsPage() {
  const meta = getTldAboutMeta();
  const tlds = getTldAboutIndex();

  const groups = [
    { key: 'gTLD', label: 'Generic TLDs (gTLD)' },
    { key: 'ccTLD', label: 'Country-code TLDs (ccTLD)' },
    { key: 'other', label: 'Other / sponsored' },
  ] as const;

  const grouped = {
    gTLD: tlds.filter((t) => t.type === 'gTLD'),
    ccTLD: tlds.filter((t) => t.type === 'ccTLD'),
    other: tlds.filter((t) => t.type !== 'gTLD' && t.type !== 'ccTLD'),
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <PageBackground variant="default" />
      <Navigation />

      <main className={`${PAGE_MAIN_CLASS} pb-14`}>
        <PageBreadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: 'TLD encyclopedia' },
          ]}
        />
        <SectionAmbient intensity="hero" className="w-full" contentClassName="page-gutter relative z-[1]">
        <div className="max-w-6xl mx-auto">
          <header className="mt-2 sm:mt-4 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">TLD encyclopedia</h1>
            <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              {meta.count} extension about pages from the IANA Root Zone Database
              {meta.generatedAt ? ` · updated ${meta.generatedAt}` : ''}.
            </p>
          </header>

          {groups.map((group) => {
            const items = grouped[group.key];
            if (!items.length) return null;
            return (
              <section key={group.key} className="mt-10">
                <h2 className="text-lg font-bold mb-3">
                  {group.label}{' '}
                  <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                    ({items.length})
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {items.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/blog/tlds/${item.slug}`}
                      className="rounded-lg border border-white/10 bg-[#0c0c0e] px-3 py-2.5 hover:border-white/25 transition-colors"
                    >
                      <div className="font-black tracking-tight">{item.tld}</div>
                      {item.sponsor && (
                        <div className="mt-0.5 text-[11px] line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                          {item.sponsor}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
        </SectionAmbient>
      </main>

      <Footer />
    </div>
  );
}
