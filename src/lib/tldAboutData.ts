import fs from 'fs';
import path from 'path';
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
const ABOUT_DIR = path.join(process.cwd(), 'src/data/tld-about');

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

export function getTldAboutDetail(slug: string): TldAboutDetail | null {
  const normalized = slug.replace(/^\./, '').toLowerCase();
  const filePath = path.join(ABOUT_DIR, `${normalized}.json`);
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as TldAboutDetail;
  } catch {
    return null;
  }
}
