import Link from 'next/link';
import { Mandala } from '@/components/ui/Mandala';

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

const QUICK_LINKS = [
  { href: '/', label: 'Domain search' },
  { href: '/generator', label: 'AI generator' },
  { href: '/bulk-search', label: 'Bulk search' },
  { href: '/domain-extensions', label: 'Extensions' },
];

export default function NotFound() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
    >
      {/* On-brand ambient mandala behind the message */}
      <Mandala
        petals={16}
        className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] max-w-[120vw] -translate-x-1/2 -translate-y-1/2 opacity-[0.08]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-[40rem] max-w-[92vw] -translate-x-1/2 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 text-center max-w-lg">
        <div className="eyebrow mb-3">Error 404</div>
        <h1 className="display-2 mb-3" style={{ color: 'var(--text-primary)' }}>
          This page is unregistered
        </h1>
        <p className="mx-auto mb-8 max-w-md text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          The page you&apos;re looking for doesn&apos;t exist or has moved. The good news: your
          next domain is just a search away.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-accent text-[14px]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Start a search
          </Link>
          <Link href="/faq" className="btn-secondary text-[14px]">
            Visit help center
          </Link>
        </div>

        <div className="mt-10">
          <div className="eyebrow mb-3 text-[10px]" style={{ opacity: 0.7 }}>Popular destinations</div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="accent-chip ring-focus-accent">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
