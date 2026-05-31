import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { PriceComparison } from '@/components/domain/PriceComparison';
import { getAllTldPriceDetails, getTldPriceDatasetMeta, getTldPriceDetail, getTldPriceSummaryList } from '@/lib/tldPriceData';

export default function ComparePage() {
  const summaries = getTldPriceSummaryList();
  const details = getAllTldPriceDetails();
  const meta = getTldPriceDatasetMeta();
  const initialDetail = getTldPriceDetail('.com');

  if (!initialDetail) {
    throw new Error('TLD comparison dataset is unavailable.');
  }

  return (
    <div className="min-h-screen">
      <PageBackground variant="default" />
      <Navigation activeTool="compare" />

      <main className="relative pt-[4.75rem] sm:pt-24">
        <section className="px-4 pb-4 sm:px-6 sm:pb-8">
          <div className="mx-auto max-w-6xl">
            <Breadcrumb items={[{ label: 'Tools', href: '/' }, { label: 'Price Comparison' }]} />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-xl sm:text-5xl md:text-[3.9rem] font-black tracking-tight">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(to right, var(--gradient-hero-from), var(--gradient-hero-from), var(--gradient-hero-to))',
                }}
              >
                Price Comparison
              </span>
            </h1>
            <p
              className="mx-auto mt-1.5 sm:mt-3 max-w-3xl text-[11px] sm:text-base leading-snug sm:leading-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span className="sm:hidden">Live regular prices across 10 registrars. No promo codes.</span>
              <span className="hidden sm:inline">Live top-TLD pricing data verified against TLD-List for a curated set of the most frequently registered extensions across the selected 10 registrars. Promo-code discounts are stripped out so the numbers shown are the regular listed prices.</span>
            </p>
          </div>
        </section>

        <section className="px-4 pb-12 sm:px-6 sm:pb-14">
          <div className="mx-auto max-w-6xl">
            <PriceComparison
              summaries={summaries}
              details={details}
              initialDetail={initialDetail}
              generatedAt={meta.generatedAt}
              sourceName={meta.sourceName}
              sourceUrl={meta.sourceUrl}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
