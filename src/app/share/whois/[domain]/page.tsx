import type { Metadata } from 'next';
import Link from 'next/link';
import { normalizeShareDomain, buildWhoisSharePath } from '@/lib/whoisShareMeta';
import { WhoisSharePublicCard } from '@/components/domain/WhoisSharePublicCard';
import { getSiteBaseUrl, SITE_BRAND } from '@/lib/seoSiteFacts';
import { Footer } from '@/components/layout/Footer';
import { Navigation } from '@/components/layout/Navigation';

type PageProps = {
  params: Promise<{ domain: string }> | { domain: string };
};

async function loadWhois(domain: string) {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://127.0.0.1:5001');

  try {
    const res = await fetch(
      `${base.replace(/\/$/, '')}/api/domains/whois?domain=${encodeURIComponent(domain)}`,
      { next: { revalidate: 120 } }
    );
    const json = await res.json();
    return json as {
      success?: boolean;
      domain?: string;
      registrar?: string;
      status?: string;
      registrationDate?: string | null;
      expirationDate?: string | null;
      nameServers?: string[];
      dnssec?: boolean;
      available?: boolean;
      error?: string;
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const domain = normalizeShareDomain(decodeURIComponent(resolved.domain || 'example.com'));
  const path = buildWhoisSharePath(domain);
  const title = `WHOIS · ${domain}`;
  const description = `Registry WHOIS card for ${domain} — status, registrar, dates, and name servers via free RDAP.`;

  const origin = getSiteBaseUrl();
  const absoluteUrl = `${origin}${path}`;

  return {
    title,
    description,
    metadataBase: new URL(origin),
    alternates: { canonical: absoluteUrl },
    openGraph: {
      title,
      description,
      url: absoluteUrl,
      siteName: SITE_BRAND.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function WhoisSharePage({ params }: PageProps) {
  const resolved = await Promise.resolve(params);
  const domain = normalizeShareDomain(decodeURIComponent(resolved.domain || 'example.com'));
  const data = await loadWhois(domain);

  const card = {
    domain: data?.domain || domain,
    registrar: data?.registrar || '—',
    status: data?.status || (data?.available ? 'Available / not in RDAP' : 'Lookup unavailable'),
    registrationDate: data?.registrationDate ?? null,
    expirationDate: data?.expirationDate ?? null,
    nameServers: data?.nameServers || [],
    dnssec: data?.dnssec,
    available: data?.available,
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex flex-col">
      <Navigation />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:py-14 pt-20 sm:pt-24">
        <div className="mb-8 text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            DomainDiscovery · shared WHOIS
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{card.domain}</h1>
          <p className="mt-2 text-sm text-white/45">
            Live card · social previews use the image embed automatically
          </p>
        </div>

        <WhoisSharePublicCard data={card} />

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/tools/whois?domain=${encodeURIComponent(card.domain)}`}
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-white/90"
          >
            Open full WHOIS lookup
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-2.5 text-sm font-bold text-white/75 transition hover:border-white/30 hover:text-white"
          >
            DomainDiscovery home
          </Link>
        </div>

        <p className="mt-10 text-center text-[11px] leading-relaxed text-white/30">
          Free public RDAP via IANA bootstrap. Contact fields are often redacted for privacy.
        </p>
      </div>
      <Footer />
    </div>
  );
}
