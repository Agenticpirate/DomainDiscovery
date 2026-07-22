import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeWatch } from '@/lib/domainWatchStore';
import { appBaseUrl } from '@/lib/emailSender';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function htmlPage(title: string, body: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
      font-family:Inter,system-ui,sans-serif;background:#f8fafc;color:#0f172a}
    .card{max-width:440px;margin:24px;padding:28px;border-radius:18px;border:1px solid #e2e8f0;background:#fff}
    h1{font-size:1.35rem;margin:0 0 10px}
    p{color:#64748b;line-height:1.55;margin:0 0 18px;font-size:14px}
    a.btn{display:inline-block;padding:10px 16px;border-radius:10px;background:#0f172a;color:#fff;text-decoration:none;font-weight:600;font-size:13px}
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
      htmlPage('Invalid link', `<h1>Missing token</h1><p>This unsubscribe link is incomplete.</p>
        <a class="btn" href="${base}/tools/whois">Back to WHOIS</a>`),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const watch = await unsubscribeWatch(token);
  if (!watch) {
    return new NextResponse(
      htmlPage(
        'Already removed',
        `<h1>Watch not found</h1><p>This watch may already be unsubscribed.</p>
         <a class="btn" href="${base}/tools/whois">Back to WHOIS</a>`
      ),
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  return new NextResponse(
    htmlPage(
      'Unsubscribed',
      `<h1>Unsubscribed from ${watch.domain}</h1>
       <p>You will no longer receive free status emails for this domain at ${watch.email}.</p>
       <a class="btn" href="${base}/tools/whois">Back to WHOIS</a>`
    ),
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
