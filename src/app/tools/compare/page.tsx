import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { PriceComparison } from '@/components/domain/PriceComparison';
import { SeoGuidePack } from '@/components/seo/SeoGuidePack';
import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import { TOOL_GUIDE_PACKS } from '@/components/seo/toolGuidePacks';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';
import {
  getTldMatrixRowsPreview,
  getTldPriceDatasetMeta,
  getTldPriceDetailSlim,
} from '@/lib/tldPriceData';
import { ComparePageClientChrome } from './ComparePageClientChrome';

/**
 * Server Component — heavy 6MB price JSON never enters the client bundle.
 * First paint ships only a priority matrix preview (~80 TLDs); full matrix loads async.
 */
export default function ComparePage() {
  const matrixPreview = getTldMatrixRowsPreview(80);
  const meta = getTldPriceDatasetMeta();
  const initialDetail = getTldPriceDetailSlim('.com');

  if (!initialDetail) {
    throw new Error('TLD comparison dataset is unavailable.');
  }

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />
      <Navigation activeTool="compare" />

      <main className={`${PAGE_MAIN_CLASS} pb-10 sm:pb-14`}>
        <PageBreadcrumb items={[{ label: 'Tools', href: '/' }, { label: 'Price Comparison' }]} />

        <ComparePageClientChrome
          extensionCount={meta.extensionCount}
          generatedAt={meta.generatedAt}
        />

        <section className="max-w-7xl mx-auto">
          <PriceComparison
            matrixRows={matrixPreview}
            loadFullMatrix
            totalExtensionCount={meta.extensionCount}
            initialDetail={initialDetail}
            generatedAt={meta.generatedAt}
            sourceName={meta.sourceName}
            sourceUrl={meta.sourceUrl}
          />
        </section>

        <CompareHowItWorks />

        <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.compare} compact />
        <SeoGuidePack {...TOOL_GUIDE_PACKS.compare} />

        <section className="mt-6 sm:mt-10 max-w-3xl mx-auto px-4 text-center text-[12px] sm:text-sm opacity-60">
          <p>
            Prefer to check availability first?{' '}
            <Link href="/search" className="font-semibold underline underline-offset-2">
              Domain search
            </Link>{' '}
            ·{' '}
            <Link href="/domain-extensions" className="font-semibold underline underline-offset-2">
              Browse TLDs
            </Link>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function CompareHowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Regular prices only',
      description:
        'When a registrar lists a promo and a regular price, we keep the regular figure for fair comparison.',
      descriptionMobile: 'Promo + regular listed? We keep the regular figure for fair compare.',
    },
    {
      step: '02',
      title: 'Reg · renew · transfer',
      description:
        'Toggle the matrix between registration, renewal, and transfer so the cheapest long-term pick is obvious.',
      descriptionMobile: 'Toggle reg / renew / transfer so the long-term pick is obvious.',
    },
    {
      step: '03',
      title: 'Popular extensions first',
      description:
        'We pin high-demand TLDs at the top and load more as you scroll — so mobile stays fast.',
      descriptionMobile: 'Popular TLDs first · load more as you go — stays fast on mobile.',
    },
    {
      step: '04',
      title: 'Top 10 registrars',
      description:
        'Spaceship, GoDaddy, Namecheap, Porkbun, Dynadot, NameSilo, Sav, Cloudflare, Hostinger, and Unstoppable.',
      descriptionMobile: 'Spaceship, GoDaddy, Namecheap, Porkbun, Dynadot, Sav, CF, and more.',
    },
  ];

  return (
    <section className="mt-6 sm:mt-14 py-5 sm:py-12 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-0.5">
        <div className="text-center mb-3 sm:mb-8">
          <p
            className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 sm:mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Clear numbers
          </p>
          <h2 className="text-[1.05rem] sm:text-3xl md:text-4xl font-black mb-1 sm:mb-3 leading-tight tracking-tight">
            How we compare domain prices
          </h2>
          <p
            className="max-w-xl mx-auto text-[11px] sm:text-[15px] leading-snug sm:leading-relaxed px-1"
            style={{ color: 'var(--text-secondary, #94a3b8)' }}
          >
            <span className="sm:hidden">Regular list prices — so renewals never surprise you.</span>
            <span className="hidden sm:inline">
              First-year deals look cheap. We show regular list prices so renewals never surprise you.
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {steps.map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-white/10 bg-[var(--bg-elevated,#0c0c0e)] p-3 sm:p-5"
            >
              <div className="text-[10px] font-black tabular-nums opacity-40 mb-1">{item.step}</div>
              <h3 className="text-sm sm:text-base font-bold mb-1">{item.title}</h3>
              <p className="text-[11px] sm:text-[13px] leading-relaxed opacity-60">
                <span className="sm:hidden">{item.descriptionMobile}</span>
                <span className="hidden sm:inline">{item.description}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
