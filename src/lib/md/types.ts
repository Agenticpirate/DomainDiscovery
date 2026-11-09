import type { LocaleId } from '@/lib/i18n/locales';

/** Sections of llms.txt and the catalog. */
export type MdGroup = 'core' | 'tool' | 'guide' | 'tld' | 'alternative' | 'industry' | 'lead' | 'legal';

export type MdContext = {
  /** HTML path as requested, locale prefix included */
  path: string;
  params: Record<string, string>;
  locale: LocaleId;
};

export type MdDoc = {
  markdown: string;
  title: string;
  /** One-sentence summary, same as the page's meta description where one exists */
  description: string;
  /** HTML path the Markdown stands for */
  path: string;
  /** ISO date of the last real content change, when known */
  lastModified?: string | null;
};

export type MdRenderer = (ctx: MdContext) => Promise<MdDoc | null> | MdDoc | null;

export type MdListItem = { path: string; title: string; description: string };

export type MdRouteDef = {
  /** `/search` or `/learn/[slug]` */
  pattern: string;
  group: MdGroup;
  render: MdRenderer;
  /** Every concrete HTML path this pattern serves */
  list: () => MdListItem[];
};

export type MdRouteInfo = MdListItem & { mdPath: string; group: MdGroup };
