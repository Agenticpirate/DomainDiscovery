import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildSeoPageMetadata } from '@/lib/seo/pageMeta';
import { SeoPageShell } from '@/components/seo/SeoPageShell';
import { FaqSection } from '@/components/seo/FaqSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { LiveIdeas } from '@/components/industry/LiveIdeas';
import { INDUSTRIES, getIndustry, getIndustrySlugs } from '@/lib/industries';
import { getStaticIdeas } from '@/lib/industryIdeas';
import { getLearnArticles } from '@/lib/learnArticles';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getIndustrySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const industry = getIndustry(slug);
  if (!industry) return { title: 'Page not found' };
  return buildSeoPageMetadata({
    title: industry.title,
    description: industry.description,
    path: `/domain-name-ideas/${industry.slug}`,
    keywords: [
      `${industry.name.toLowerCase()} domain name ideas`,
      `${industry.name.toLowerCase()} business names`,
      `${industry.name.toLowerCase()} domain names`,
    ],
  });
}

export default async function IndustryIdeasPage(props: PageProps) {
  const { slug } = await props.params;
  const industry = getIndustry(slug);
  if (!industry) notFound();

  const ideas = getStaticIdeas(industry);
  const guide = industry.learnSlug ? getLearnArticles().find((a) => a.slug === industry.learnSlug) : undefined;
  const lower = industry.name.toLowerCase();

  return (
    <SeoPageShell
      path={`/domain-name-ideas/${industry.slug}`}
      title={industry.title}
      description={industry.description}
      h1={`${industry.name} domain name ideas`}
      intro={`Sample domain names for a ${lower} business, live suggestions from our generator and tips for choosing a name that fits.`}
      crumbs={[{ label: 'Domain name ideas', href: '/domain-name-ideas' }, { label: industry.name }]}
    >
      <section className="mt-8 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
        <h2 className="text-lg font-bold mb-3">Sample {lower} domain names</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ideas.map((domain) => (
            <li key={domain}>
              <Link
                href={`/search?q=${encodeURIComponent(domain)}`}
                className="block truncate rounded-xl border border-white/10 bg-black px-3 py-2 text-[13px] font-mono hover:bg-white/[0.05]"
              >
                {domain}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[12px]" style={{ color: 'var(--text-muted)' }}>
          These are examples. Select a name to check whether it is available.
        </p>
      </section>

      <LiveIdeas keyword={industry.keywords[0]} />

      <section className="mt-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
        <h2 className="text-lg font-bold mb-3">Tips for naming a {lower} business</h2>
        <ul className="list-disc pl-5 space-y-2 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
          {industry.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <RelatedLinks
        title="Recommended extensions"
        links={industry.tlds.map((tld) => ({
          href: `/blog/tlds/${tld}`,
          label: `.${tld}`,
          description: `About .${tld} domains, rules and prices.`,
        }))}
      />

      <FaqSection items={industry.faqs} />

      <RelatedLinks
        title="Keep exploring"
        links={[
          ...(guide ? [{ href: `/learn/${guide.slug}`, label: guide.title, description: guide.description }] : []),
          { href: '/generator', label: 'Domain name generator', description: 'Use your own keyword.' },
          { href: '/bulk-search', label: 'Bulk domain search', description: 'Check many names at once.' },
          { href: '/domain-name-ideas', label: 'All industries' },
          ...INDUSTRIES.filter((i) => i.slug !== industry.slug)
            .slice(0, 4)
            .map((i) => ({ href: `/domain-name-ideas/${i.slug}`, label: `${i.name} domain names` })),
        ]}
      />
    </SeoPageShell>
  );
}
