import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isAdaHost(host: string): boolean {
  const h = host.toLowerCase().split(':')[0];
  const configured = (process.env.NEXT_PUBLIC_ADA_HOST || '')
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split(':')[0];
  if (configured && (h === configured || h === `www.${configured.replace(/^www\./, '')}`)) {
    return true;
  }
  return (
    h === 'aidomainassistant.com' ||
    h === 'www.aidomainassistant.com' ||
    h === 'assistant.localhost' ||
    h === 'ada.localhost'
  );
}

function adaPublicBase(): string {
  if (process.env.NEXT_PUBLIC_ADA_URL) {
    return process.env.NEXT_PUBLIC_ADA_URL.replace(/\/$/, '').replace(/\/ada$/, '');
  }
  return 'https://www.aidomainassistant.com';
}

/**
 * - aidomainassistant.com → rewrite clean paths to /ada/* app routes
 * - domainsdiscovery.com/ada/* → permanent redirect to dedicated ADA domain (prod)
 * - Local monorepo keeps /ada/* for development
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Production DomainDiscovery: send /ada traffic to dedicated product site
  if (
    process.env.NODE_ENV === 'production' &&
    !isAdaHost(host) &&
    (pathname === '/ada' || pathname.startsWith('/ada/'))
  ) {
    const rest = pathname === '/ada' || pathname === '/ada/' ? '/' : pathname.replace(/^\/ada/, '') || '/';
    const dest = new URL(rest, `${adaPublicBase()}/`);
    dest.search = request.nextUrl.search;
    return NextResponse.redirect(dest, 308);
  }

  // Already under /ada — leave as-is (local monorepo + internal rewrites)
  if (pathname === '/ada' || pathname.startsWith('/ada/')) {
    return NextResponse.next();
  }

  // API & Next internals always pass through
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  if (!isAdaHost(host)) {
    return NextResponse.next();
  }

  // ADA host: rewrite clean URLs under /ada app tree
  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? '/ada' : `/ada${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?)$).*)',
  ],
};
