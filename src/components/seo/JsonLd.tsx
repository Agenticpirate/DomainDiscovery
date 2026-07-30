import {
  getBreadcrumbListJsonLd,
  getWebPageJsonLd,
  type BreadcrumbItem,
} from '@/lib/seoSiteFacts';

/**
 * Server-rendered JSON-LD. Prefer this over client injection so Googlebot
 * and non-JS AI crawlers see schema in the initial HTML.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

/** Convenience: WebPage + BreadcrumbList for a tool surface */
export function ToolPageJsonLd({
  path,
  name,
  description,
  breadcrumbs,
}: {
  path: string;
  name: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
}) {
  return (
    <>
      <JsonLd data={getWebPageJsonLd({ path, name, description })} />
      <JsonLd data={getBreadcrumbListJsonLd(breadcrumbs)} />
    </>
  );
}
