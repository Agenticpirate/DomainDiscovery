import indexData from '@/data/tld-about/index.json';

export type TldAboutSummary = {
  tld: string;
  slug: string;
  type: string;
  typeLabel?: string;
  sponsor?: string | null;
  title?: string;
};

export type TldAboutDetail = {
  tld: string;
  slug: string;
  title: string;
  delegationTitle?: string;
  type: string;
  typeLabel?: string;
  designation?: string;
  sponsor?: string | null;
  sponsorDetail?: string | null;
  administrativeContact?: string | null;
  technicalContact?: string | null;
  registryUrl?: string | null;
  whoisServer?: string | null;
  rdapServer?: string | null;
  registrationDate?: string | null;
  recordUpdated?: string | null;
  nameServers?: { host: string; addresses: string[] }[];
  about: string;
  whoCanRegister: string;
  registrationRestrictions: {
    minLength?: number;
    maxLength?: number;
    canUse?: string;
    cannotUse?: string;
    idns?: string;
    note?: string;
  };
  features: Record<string, string>;
  source: string;
  sourceUrl: string;
  wikipedia?: string | null;
  scrapedAt?: string;
};

type IndexFile = {
  generatedAt: string;
  count: number;
  source: string;
  extensions: TldAboutSummary[];
};

const index = indexData as IndexFile;
export function getTldAboutIndex(): TldAboutSummary[] {
  return index.extensions || [];
}

export function getTldAboutMeta() {
  return {
    generatedAt: index.generatedAt,
    count: index.count || (index.extensions || []).length,
    source: index.source,
  };
}

export function getTldAboutSlugs(): string[] {
  return (index.extensions || []).map((e) => e.slug);
}

export async function getTldAboutDetail(slug: string): Promise<TldAboutDetail | null> {
  const normalized = slug.replace(/^\./, '').toLowerCase();
  if (!/^[a-z0-9-]+$/.test(normalized) || normalized === 'index') return null;
  try {
    // Relative path + extension so both Vite (vinext/Workers) and webpack can bundle the
    // JSON files; an aliased `@/` template import is skipped by Vite and 404s every page.
    const mod = (await import(`../data/tld-about/${normalized}.json`)) as { default: TldAboutDetail };
    return mod.default;
  } catch {
    return null;
  }
}
