import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { ToolPageJsonLd } from '@/components/seo/JsonLd';

type Crumb = { label: string; href?: string };

type Props = {
  path: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  /** Visible breadcrumb trail; the last item is the current page */
  crumbs: Crumb[];
  children: React.ReactNode;
};

/** Server-rendered page frame for the static SEO landing pages (alternatives, domain leads). */
export function SeoPageShell({ path, title, description, h1, intro, crumbs, children }: Props) {
  const jsonLdCrumbs = [
    { name: 'Home', path: '/' },
    ...crumbs.map((c, i) => ({
      name: c.label,
      path: c.href ?? (i === crumbs.length - 1 ? path : undefined),
    })),
  ];
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <ToolPageJsonLd path={path} name={title} description={description} breadcrumbs={jsonLdCrumbs} />
      <PageBackground variant="default" />
      <Navigation />
      <main className={`${PAGE_MAIN_CLASS} pb-14`}>
        <PageBreadcrumb items={[{ label: 'Home', href: '/' }, ...crumbs]} />
        <SectionAmbient intensity="hero" className="w-full" contentClassName="page-gutter relative z-[1]">
          <div className="max-w-3xl mx-auto">
            <header className="mt-2 sm:mt-4">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{h1}</h1>
              <p className="mt-3 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                {intro}
              </p>
            </header>
            {children}
          </div>
        </SectionAmbient>
      </main>
      <Footer />
    </div>
  );
}
