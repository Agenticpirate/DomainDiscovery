import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isIndexableLocalePath,
  isLocaleId,
  isLocaleNavigablePath,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  stripLocalePrefix,
} from '@/lib/i18n/locales';

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
  const host = request.headers.get('host') || request.nextUrl.host || '';
  const isLocal =
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    host.includes('0.0.0.0') ||
    host.endsWith('.local');

  // Enforce HTTPS in production: redirect all plain HTTP requests to HTTPS immediately
  if (process.env.NODE_ENV === 'production' && !isLocal) {
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const cfVisitor = request.headers.get('cf-visitor');
    const isHttp =
      forwardedProto === 'http' ||
      (cfVisitor ? cfVisitor.includes('"scheme":"http"') : false) ||
      request.url.startsWith('http://');

    if (isHttp) {
      const httpsUrl = request.nextUrl.clone();
      httpsUrl.protocol = 'https:';
      httpsUrl.host = host;
      return NextResponse.redirect(httpsUrl, 301);
    }
  }

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
    return handleLocale(request);
  }

  // ADA host: rewrite clean URLs under /ada app tree
  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? '/ada' : `/ada${pathname}`;
  return NextResponse.rewrite(url);
}

function isCrawler(request: NextRequest): boolean {
  const ua = request.headers.get('user-agent') || '';
  if (!ua) return true;
  return /bot|crawler|spider|slurp|facebookexternalhit|preview|bingpreview|applebot|duckduckbot|baiduspider|yandex|semrush|ahrefs|petalbot|gptbot|claudebot|google-extended|ccbot/i.test(ua);
}

function localeCookie(response: NextResponse, locale: string) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

function handleLocale(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split('/')[1] || '';
  const localeFromPath = isLocaleId(segment) ? segment : null;
  const incoming = request.headers.get('x-dd-locale');

  // Next runs middleware again after a rewrite. The bare path has no locale
  // prefix, but the first pass already set x-dd-locale. Keep that header.
  if (!localeFromPath && incoming && isLocaleId(incoming)) {
    return NextResponse.next();
  }

  const bare = stripLocalePrefix(pathname);

  // People who already picked a language stay on it when a link omits the prefix.
  // Crawlers are left on the English URL so search engines do not cache a personal redirect.
  if (
    !localeFromPath &&
    (request.method === 'GET' || request.method === 'HEAD') &&
    !isCrawler(request) &&
    isLocaleNavigablePath(bare)
  ) {
    const remembered = request.cookies.get(LOCALE_COOKIE)?.value;
    if (remembered && remembered !== 'en' && isLocaleId(remembered)) {
      const dest = request.nextUrl.clone();
      dest.pathname = bare === '/' ? `/${remembered}` : `/${remembered}${bare}`;
      const redirect = NextResponse.redirect(dest, 307);
      redirect.headers.set('Cache-Control', 'private, no-store');
      redirect.headers.set('Vary', 'Cookie');
      localeCookie(redirect, remembered);
      return redirect;
    }
  }

  const locale = localeFromPath ?? 'en';

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-dd-locale', locale);
  requestHeaders.set('x-dd-path', bare);

  if (locale === 'en') {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    // Files and APIs must not clear a language the visitor already chose.
    if (!isCrawler(request) && isLocaleNavigablePath(bare)) localeCookie(response, 'en');
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = bare;
  const response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  if (!isCrawler(request)) localeCookie(response, locale);
  if (!isIndexableLocalePath(bare)) {
    response.headers.set('X-Robots-Tag', 'noindex, follow');
  }
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?)$).*)',
  ],
};
