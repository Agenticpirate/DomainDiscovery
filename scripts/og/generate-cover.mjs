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

const STATUS = {
  available: { label: 'Available', color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.35)' },
  taken: { label: 'Taken', color: 'rgba(255,255,255,0.45)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)' },
  premium: { label: 'Premium', color: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.32)' },
};

const row = (name, tld, status, price, last = false) => {
  const s = STATUS[status];
  return h(
    'div',
    {
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 22px',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.07)',
    },
    h(
      'div',
      { alignItems: 'baseline', fontSize: 24, fontWeight: 600 },
      h('div', { color: status === 'taken' ? 'rgba(255,255,255,0.45)' : '#fff' }, name),
      h('div', { color: status === 'taken' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.55)' }, tld)
    ),
    h(
      'div',
      { alignItems: 'center', gap: 14 },
      price ? h('div', { fontFamily: 'Geist Mono', fontSize: 17, color: 'rgba(255,255,255,0.5)' }, price) : [],
      h(
        'div',
        {
          alignItems: 'center',
          gap: 7,
          padding: '5px 12px',
          borderRadius: 999,
          fontSize: 15,
          fontWeight: 600,
          color: s.color,
          background: s.bg,
          border: `1px solid ${s.border}`,
        },
        h('div', { width: 7, height: 7, borderRadius: 999, background: s.color }),
        s.label
      )
    )
  );
};

const tree = h(
  'div',
  {
    width: W,
    height: H,
    position: 'relative',
    flexDirection: 'column',
    background: '#000',
    fontFamily: 'Geist',
    color: '#fff',
    overflow: 'hidden',
  },
  // Background: dot grid, spotlights and vignette as one SVG (resvg renders gradients cleanly).
  img(background, W, H, { position: 'absolute', top: 0, left: 0 }),

  // Header
  h(
    'div',
    { position: 'absolute', top: 48, left: 64, right: 64, alignItems: 'center', justifyContent: 'space-between' },
    h(
      'div',
      { alignItems: 'center', gap: 16 },
      h(
        'div',
        {
          width: 58,
          height: 58,
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.18)',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
        },
        img(logo, 58, 58)
      ),
      h(
        'div',
        { flexDirection: 'column' },
        h('div', { fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }, 'DomainDiscovery'),
        h(
          'div',
          { fontFamily: 'Geist Mono', fontSize: 13, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.45)', marginTop: 2 },
          'AI-POWERED'
        )
      )
    ),
    pill('Live across 1,600+ TLDs', '#34d399')
  ),

  // Left: headline
  h(
    'div',
    { position: 'absolute', top: 150, left: 64, width: 600, flexDirection: 'column' },
    h(
      'div',
      { flexDirection: 'column', fontSize: 72, fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 1.02, whiteSpace: 'nowrap' },
      h('div', {}, 'Find your'),
      h('div', {}, 'perfect domain'),
      h(
        'div',
        {
          backgroundImage: 'linear-gradient(90deg, #8f8f8f 0%, #f5f5f5 55%, #a3a3a3 100%)',
          backgroundClip: 'text',
          color: 'transparent',
        },
        'in seconds.'
      )
    ),
    h(
      'div',
      { marginTop: 24, width: 520, fontSize: 23, lineHeight: 1.4, color: 'rgba(255,255,255,0.6)', fontWeight: 400 },
      'Free search, AI name generator, bulk checks, WHOIS and registrar price compare.'
    )
  ),

  // Left bottom: trust pills + URL
  h(
    'div',
    { position: 'absolute', bottom: 50, left: 64, alignItems: 'center', gap: 12 },
    pill('Free'),
    pill('Instant'),
    pill('Private'),
    pill('No signup')
  ),

  // Right: product card
  h(
    'div',
    { position: 'absolute', top: 196, right: 64, width: 450, flexDirection: 'column' },
    // Owl perched on the card
    img(owl, 88, 88, { position: 'absolute', top: -72, left: 30 }),
    h(
      'div',
      {
        flexDirection: 'column',
        borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'linear-gradient(180deg, rgba(28,28,28,0.96), rgba(12,12,12,0.96))',
        boxShadow: '0 30px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03)',
        overflow: 'hidden',
      },
      // Search bar
      h(
        'div',
        {
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: 14,
          padding: '8px 8px 8px 18px',
          borderRadius: 14,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
        },
        h(
          'div',
          { alignItems: 'center', gap: 12 },
          // Magnifier glyph
          h(
            'div',
            { position: 'relative', width: 20, height: 20 },
            h('div', { position: 'absolute', top: 0, left: 0, width: 15, height: 15, borderRadius: 999, border: '2.5px solid rgba(255,255,255,0.5)' }),
            h('div', { position: 'absolute', top: 15, left: 13, width: 8, height: 2.5, borderRadius: 2, background: 'rgba(255,255,255,0.5)', transform: 'rotate(45deg)' })
          ),
          h('div', { fontSize: 23, fontWeight: 500, color: '#fff' }, 'yourbrand'),
          h('div', { width: 2, height: 26, background: 'rgba(255,255,255,0.8)', marginLeft: -8 })
        ),
        h(
          'div',
          {
            alignItems: 'center',
            padding: '10px 18px',
            borderRadius: 10,
            background: '#f5f5f5',
            color: '#000',
            fontSize: 18,
            fontWeight: 600,
          },
          'Search →'
        )
      ),
      row('yourbrand', '.com', 'available', '$9.98'),
      row('yourbrand', '.ai', 'available', '$69.98'),
      row('yourbrand', '.io', 'taken', ''),
      row('yourbrand', '.co', 'premium', '$2,400', true)
    ),
    h(
      'div',
      { marginTop: 18, justifyContent: 'flex-end', fontFamily: 'Geist Mono', fontSize: 18, color: 'rgba(255,255,255,0.5)' },
      'domainsdiscovery.com'
    )
  )
);

await initWasm(readFileSync(require.resolve('@resvg/resvg-wasm/index_bg.wasm')));
const svg = await satori(tree, { width: W, height: H, fonts });
const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();

const alt = 'DomainDiscovery: free domain name search with live availability across 1,600+ TLDs, AI name generator, bulk checks, WHOIS and price compare';
for (const name of ['opengraph-image', 'twitter-image']) {
  writeFileSync(path.join(root, 'src/app', `${name}.png`), png);
  writeFileSync(path.join(root, 'src/app', `${name}.alt.txt`), alt);
}
console.log(`Wrote ${png.length} bytes to src/app/opengraph-image.png and twitter-image.png`);
