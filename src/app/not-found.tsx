import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PAGE_MAIN_CLASS } from '@/components/ui/pageLayout';
import { Owl } from '@/components/ui/Owl';

export const metadata: Metadata = {
  title: { absolute: 'Page not found | DomainDiscovery' },
  description: 'This page does not exist. Search a domain name or open one of the free DomainDiscovery tools.',
  robots: { index: false, follow: true },
};

const LINKS: { href: string; label: string; hint: string }[] = [
  { href: '/generator', label: 'AI name generator', hint: 'Brandable ideas from a keyword' },
  { href: '/bulk-search', label: 'Bulk search', hint: 'Check up to 1,000 names' },
  { href: '/domain-extensions', label: 'Domain extensions', hint: 'Browse every TLD' },
  { href: '/tools/whois', label: 'WHOIS lookup', hint: 'Owner, dates, name servers' },
];

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
    >
      <Navigation />
      <main className={`${PAGE_MAIN_CLASS} flex flex-1 items-center justify-center px-4 pb-16 sm:pb-24`}>
        <div className="w-full max-w-xl pt-10 text-center sm:pt-16">
          <Owl mood="lost" interactive className="mx-auto mb-5 block h-16 w-16 sm:h-20 sm:w-20" />
          <p className="inline-flex items-center gap-2 rounded-full border border-ds-hairline px-3 py-1 text-[12px] font-semibold tracking-wide text-ds-body">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" aria-hidden />
            404 · Not found
          </p>
          <h1 className="mt-4 text-[2rem] font-bold leading-[1.05] tracking-[-0.04em] text-ds-ink sm:text-[3rem]">
            This page isn&apos;t registered.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ds-body">
            The link may be old or mistyped. Search for a domain instead, or jump to a tool.
          </p>

          <form action="/search" method="get" role="search" className="mx-auto mt-7 flex w-full max-w-md items-center gap-1.5 rounded-2xl border border-ds-hairline bg-ds-canvas p-1.5">
            <label htmlFor="nf-q" className="sr-only">
              Domain name
            </label>
            <input
              id="nf-q"
              name="q"
              type="search"
              inputMode="url"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="Search domains"
              className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-[16px] text-ds-ink outline-none placeholder:text-ds-mute"
            />
            <button
              type="submit"
              className="btn-brand inline-flex min-h-11 shrink-0 items-center rounded-xl px-4 text-[14px] font-semibold"
            >
              Search
            </button>
          </form>

          <ul className="mx-auto mt-6 grid max-w-md grid-cols-1 gap-2 text-left min-[420px]:grid-cols-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex min-h-14 flex-col justify-center rounded-xl border border-ds-hairline px-3.5 py-2.5 transition-colors hover:border-ds-mute"
                >
                  <span className="text-[14px] font-semibold text-ds-ink">{l.label}</span>
                  <span className="text-[12px] text-ds-mute">{l.hint}</span>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/"
            className="mt-6 inline-flex min-h-11 items-center gap-1 text-[14px] font-semibold text-ds-ink underline decoration-ds-mute underline-offset-4"
          >
            Back to home →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
