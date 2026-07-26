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

/**
 * Host-based routing for aidomainassistant.com → /ada/*
 * Local path /ada always works without special Host.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Already under /ada — leave as-is
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

  // ADA host: rewrite everything (including /.well-known/agent-card.json) under /ada
  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? '/ada' : `/ada${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Include .well-known JSON; exclude static assets under /_next and common files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?)$).*)',
  ],
};
