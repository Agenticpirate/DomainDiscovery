import { NextRequest, NextResponse } from 'next/server';
import { confirmWatch } from '@/lib/domainWatchStore';
import { appBaseUrl } from '@/lib/emailSender';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function htmlPage(title: string, body: string, isLight = true) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
      font-family:Inter,system-ui,sans-serif;background:${isLight ? '#f8fafc' : '#050505'};color:${isLight ? '#0f172a' : '#fff'};}
    .card{max-width:440px;margin:24px;padding:28px;border-radius:18px;
      border:1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,.1)'};
      background:${isLight ? '#fff' : '#0c0c0e'};box-shadow:0 10px 40px rgba(0,0,0,.08)}
    h1{font-size:1.35rem;margin:0 0 10px}
    p{color:${isLight ? '#64748b' : 'rgba(255,255,255,.55)'};line-height:1.55;margin:0 0 18px;font-size:14px}
    a.btn{display:inline-block;padding:10px 16px;border-radius:10px;background:${isLight ? '#0f172a' : '#fff'};
      color:${isLight ? '#fff' : '#000'};text-decoration:none;font-weight:600;font-size:13px}
  </style>
</head>
<body><div class="card">${body}</div></body>
</html>`;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || '';
  const base = appBaseUrl(request.nextUrl.origin);

  if (!token) {
    return new NextResponse(
      htmlPage('Invalid link', `<h1>Missing token</h1><p>This confirm link is incomplete.</p>
        <a class="btn" href="${base}/tools/whois">Back to WHOIS</a>`),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const watch = await confirmWatch(token);
  if (!watch) {
    return new NextResponse(
      htmlPage(
        'Link expired',
        `<h1>Watch not found</h1><p>This confirm link is invalid or the watch was removed.</p>
         <a class="btn" href="${base}/tools/whois">Back to WHOIS</a>`
      ),
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  return new NextResponse(
    htmlPage(
      'Watch confirmed',
      `<h1>You're watching ${watch.domain}</h1>
       <p>Free status alerts are active for <strong>${watch.email}</strong>.
       We'll email you when RDAP status, expiration, name servers, or availability changes.</p>
       <a class="btn" href="${base}/tools/whois?domain=${encodeURIComponent(watch.domain)}">View WHOIS</a>`
    ),
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
