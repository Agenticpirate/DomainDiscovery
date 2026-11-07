#!/usr/bin/env node
/**
 * Renders the social cover image (Open Graph + Twitter) to static PNGs:
 *   src/app/opengraph-image.png and src/app/twitter-image.png (1200x630).
 * Static files are served from cache, unlike a per-request edge ImageResponse.
 *
 * Run: node scripts/og/generate-cover.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { initWasm, Resvg } from '@resvg/resvg-wasm';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = 1200;
const H = 630;

const font = (file) => readFileSync(path.join(root, 'node_modules/geist/dist/fonts', file));
const fonts = [
  { name: 'Geist', data: font('geist-sans/Geist-Regular.ttf'), weight: 400, style: 'normal' },
  { name: 'Geist', data: font('geist-sans/Geist-Medium.ttf'), weight: 500, style: 'normal' },
  { name: 'Geist', data: font('geist-sans/Geist-SemiBold.ttf'), weight: 600, style: 'normal' },
  { name: 'Geist', data: font('geist-sans/Geist-Bold.ttf'), weight: 700, style: 'normal' },
  { name: 'Geist', data: font('geist-sans/Geist-Black.ttf'), weight: 900, style: 'normal' },
  { name: 'Geist Mono', data: font('geist-mono/GeistMono-Medium.ttf'), weight: 500, style: 'normal' },
];

const dataUrl = (mime, buf) => `data:${mime};base64,${Buffer.from(buf).toString('base64')}`;
const logo = dataUrl('image/png', readFileSync(path.join(root, 'public/logo-512.png')));

// Mascot from src/components/ui/Owl.tsx, dark-theme colors.
const INK = '#ededed';
const CANVAS = '#0a0a0a';
const owlSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect x="22" y="57" width="7" height="4" rx="2" fill="#f5a623"/><rect x="35" y="57" width="7" height="4" rx="2" fill="#f5a623"/>
<path d="M14 20 L16 6 L27 14 Z" fill="${INK}"/><path d="M50 20 L48 6 L37 14 Z" fill="${INK}"/>
<ellipse cx="32" cy="37" rx="19" ry="21" fill="${INK}"/>
<ellipse cx="32" cy="46" rx="11.5" ry="12" fill="${CANVAS}" opacity="0.16"/>
<path d="M26 44 l3 3 3-3 3 3 3-3 M27 51 l3 3 2-2 2 2 3-3" fill="none" stroke="${CANVAS}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/>
<path d="M13.5 34 C8 40 9 52 17 54 C18 47 17.5 40 13.5 34 Z" fill="${INK}" stroke="${CANVAS}" stroke-opacity="0.28"/>
<path d="M50.5 34 C56 40 55 52 47 54 C46 47 46.5 40 50.5 34 Z" fill="${INK}" stroke="${CANVAS}" stroke-opacity="0.28"/>
<circle cx="24" cy="30" r="8.5" fill="${CANVAS}"/><circle cx="40" cy="30" r="8.5" fill="${CANVAS}"/>
<circle cx="25" cy="31" r="3.8" fill="${INK}"/><circle cx="41" cy="31" r="3.8" fill="${INK}"/>
<circle cx="26.3" cy="29.5" r="1.1" fill="${CANVAS}"/><circle cx="42.3" cy="29.5" r="1.1" fill="${CANVAS}"/>
<path d="M29 35 L35 35 L32 41 Z" fill="#f5a623" stroke="#ab570a" stroke-width="0.6" stroke-linejoin="round"/>
</svg>`;
const owl = dataUrl('image/svg+xml', owlSvg);


const backgroundSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="13" cy="13" r="1.2" fill="#fff" fill-opacity="0.13"/></pattern>
  <radialGradient id="spot" cx="50%" cy="0%" r="65%"><stop offset="0" stop-color="#fff" stop-opacity="0.17"/><stop offset="0.55" stop-color="#fff" stop-opacity="0.04"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <radialGradient id="green" cx="85%" cy="100%" r="45%"><stop offset="0" stop-color="#34d399" stop-opacity="0.16"/><stop offset="1" stop-color="#34d399" stop-opacity="0"/></radialGradient>
  <radialGradient id="fade" cx="50%" cy="42%" r="75%"><stop offset="0.35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.9"/></radialGradient>
</defs>
<rect width="100%" height="100%" fill="#000"/>
<rect width="100%" height="100%" fill="url(#dots)"/>
<rect width="100%" height="100%" fill="url(#fade)"/>
<rect width="100%" height="100%" fill="url(#spot)"/>
<rect width="100%" height="100%" fill="url(#green)"/>
<line x1="0" y1="0.5" x2="${W}" y2="0.5" stroke="#fff" stroke-opacity="0.12"/>
</svg>`;
const background = dataUrl('image/svg+xml', backgroundSvg);

/** Minimal hyperscript for satori's React-element shape. */
const h = (type, style = {}, ...children) => ({
  type,
  props: { style: type === 'img' ? style.style : { display: 'flex', ...style }, ...(type === 'img' ? style.attrs : {}), children: children.flat() },
});
const img = (src, width, height, style = {}) => ({
  type: 'img',
  props: { src, width, height, style },
});

const pill = (label, dot) =>
  h(
    'div',
    {
      alignItems: 'center',
      gap: 10,
      padding: '9px 16px',
      borderRadius: 999,
      border: '1px solid rgba(255,255,255,0.14)',
      background: 'rgba(255,255,255,0.04)',
      color: 'rgba(255,255,255,0.78)',
      fontSize: 19,
      fontWeight: 500,
    },
    dot ? h('div', { width: 9, height: 9, borderRadius: 999, background: dot, boxShadow: `0 0 12px ${dot}` }) : [],
    label
  );

const GREEN = '#34d399';
const AMBER = '#fbbf24';

const icon = (paths) =>
  dataUrl(
    'image/svg+xml',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
  );
const ICONS = {
  search: icon('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>'),
  layers: icon('<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/><path d="m3 17.5 9 5 9-5" opacity="0.5"/>'),
  leads: icon('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18.5 14.8c1.7.8 2.7 2.6 3 5.2"/>'),
};

const badge = (label, color, bg, border) =>
  h(
    'div',
    { alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 13, fontWeight: 600, color, background: bg, border: `1px solid ${border}` },
    h('div', { width: 6, height: 6, borderRadius: 999, background: color }),
    label
  );
const available = (label = 'Available') => badge(label, GREEN, 'rgba(52,211,153,0.12)', 'rgba(52,211,153,0.35)');
const lead = (label) => badge(label, AMBER, 'rgba(251,191,36,0.10)', 'rgba(251,191,36,0.32)');

/** One feature card: icon tile, title + blurb, and a small product visual on the right. */
const card = (n, iconSrc, title, blurb, visual) =>
  h(
    'div',
    {
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 116,
      padding: '0 20px',
      borderRadius: 20,
      border: '1px solid rgba(255,255,255,0.13)',
      background: 'linear-gradient(180deg, rgba(30,30,30,0.95), rgba(12,12,12,0.95))',
      boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
    },
    h(
      'div',
      { alignItems: 'center', gap: 16 },
      h(
        'div',
        {
          width: 50,
          height: 50,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.14)',
        },
        img(iconSrc, 24, 24)
      ),
      h(
        'div',
        { flexDirection: 'column', width: 210 },
        h(
          'div',
          { alignItems: 'center', gap: 8 },
          h('div', { fontFamily: 'Geist Mono', fontSize: 13, color: 'rgba(255,255,255,0.4)' }, n),
          h('div', { fontSize: 23, fontWeight: 700, letterSpacing: '-0.02em' }, title)
        ),
        h('div', { marginTop: 4, fontSize: 15.5, lineHeight: 1.35, color: 'rgba(255,255,255,0.55)' }, blurb)
      )
    ),
    visual
  );

const mono = (text, color = '#fff') => h('div', { fontFamily: 'Geist Mono', fontSize: 14.5, color }, text);
const miniRow = (left, right) => h('div', { alignItems: 'center', justifyContent: 'space-between', gap: 10 }, left, right);
const visualBox = (...children) =>
  h(
    'div',
    {
      flexDirection: 'column',
      gap: 7,
      width: 200,
      padding: '10px 12px',
      borderRadius: 12,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.09)',
    },
    ...children
  );

const findVisual = visualBox(
  miniRow(mono('yourbrand.com'), available('Free')),
  miniRow(mono('yourbrand.ai'), available('Free'))
);

const bulkVisual = visualBox(
  miniRow(mono('500 names', 'rgba(255,255,255,0.7)'), mono('1 click', GREEN)),
  h(
    'div',
    { height: 7, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
    h('div', { width: '72%', height: 7, borderRadius: 999, background: `linear-gradient(90deg, ${GREEN}, #a7f3d0)` })
  ),
  miniRow(mono('248 available', GREEN), mono('CSV ↓', 'rgba(255,255,255,0.55)'))
);

const leadsVisual = visualBox(
  miniRow(mono('yourbrand.io'), lead('Buyer')),
  miniRow(mono('yourbrand.de'), lead('Buyer'))
);

const tree = h(
  'div',
  { width: W, height: H, position: 'relative', flexDirection: 'column', background: '#000', fontFamily: 'Geist', color: '#fff', overflow: 'hidden' },
  img(background, W, H, { position: 'absolute', top: 0, left: 0 }),

  // Header
  h(
    'div',
    { position: 'absolute', top: 44, left: 64, right: 64, alignItems: 'center', justifyContent: 'space-between' },
    h(
      'div',
      { alignItems: 'center', gap: 16 },
      h(
        'div',
        { width: 58, height: 58, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', background: '#000' },
        img(logo, 58, 58)
      ),
      h(
        'div',
        { flexDirection: 'column' },
        h('div', { fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }, 'DomainDiscovery'),
        h('div', { fontFamily: 'Geist Mono', fontSize: 13, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.45)', marginTop: 2 }, 'AI-POWERED')
      )
    ),
    pill('Live across 1,600+ TLDs', GREEN)
  ),

  // Left: headline built from the three core features
  h(
    'div',
    { position: 'absolute', top: 158, left: 64, width: 500, flexDirection: 'column' },
    h(
      'div',
      { flexDirection: 'column', fontSize: 64, fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 1.04, whiteSpace: 'nowrap' },
      h('div', {}, 'Find domains.'),
      h('div', {}, 'Check in bulk.'),
      h(
        'div',
        { backgroundImage: 'linear-gradient(90deg, #8f8f8f 0%, #f5f5f5 55%, #a3a3a3 100%)', backgroundClip: 'text', color: 'transparent' },
        'Find buyers.'
      )
    ),
    h(
      'div',
      { marginTop: 24, width: 470, fontSize: 22, lineHeight: 1.42, color: 'rgba(255,255,255,0.6)' },
      'Free domain search, bulk availability checks and domain leads, all in one toolkit.'
    )
  ),

  // Left bottom: trust pills
  h(
    'div',
    { position: 'absolute', bottom: 48, left: 64, alignItems: 'center', gap: 12 },
    pill('Free'),
    pill('Instant'),
    pill('No signup')
  ),
  h(
    'div',
    { position: 'absolute', bottom: 58, right: 64, fontFamily: 'Geist Mono', fontSize: 18, color: 'rgba(255,255,255,0.5)' },
    'domainsdiscovery.com'
  ),

  // Right: the three core features
  h(
    'div',
    { position: 'absolute', top: 160, right: 64, width: 560, flexDirection: 'column', gap: 14 },
    img(owl, 70, 70, { position: 'absolute', top: -56, right: 250 }),
    card('01', ICONS.search, 'Find domains', 'Live availability on 1,600+ TLDs, plus AI name ideas.', findVisual),
    card('02', ICONS.layers, 'Bulk search', 'Check hundreds of names at once and export the results.', bulkVisual),
    card('03', ICONS.leads, 'Domain leads', 'See who uses your name on other TLDs and pitch them.', leadsVisual)
  )
);

await initWasm(readFileSync(require.resolve('@resvg/resvg-wasm/index_bg.wasm')));
const svg = await satori(tree, { width: W, height: H, fonts });
const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();

const alt = 'DomainDiscovery: find domains across 1,600+ TLDs, bulk domain search, and domain leads to find buyers';
for (const name of ['opengraph-image', 'twitter-image']) {
  writeFileSync(path.join(root, 'src/app', `${name}.png`), png);
  writeFileSync(path.join(root, 'src/app', `${name}.alt.txt`), alt);
}
console.log(`Wrote ${png.length} bytes to src/app/opengraph-image.png and twitter-image.png`);
