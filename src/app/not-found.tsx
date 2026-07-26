import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
    >
      <Navigation />
      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">404</div>
          <h2 className="text-xl font-bold mb-2">Page not found</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-lg font-semibold text-sm transition-all"
            style={{
              background: 'var(--btn-primary-bg)',
              color: 'var(--btn-primary-text)',
            }}
          >
            Go home
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
