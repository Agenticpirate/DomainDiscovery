/**
 * Renders a shareable WHOIS card as a PNG.
 * Flat card on a quiet dot field — the same idea as the site hero.
 */

export type WhoisShareImageData = {
  domain: string;
  registrar: string;
  status: string;
  registrationDate: string | null;
  expirationDate: string | null;
  updatedDate?: string | null;
  nameServers: string[];
  dnssec?: boolean;
  registrant?: {
    organization?: string | null;
    country?: string | null;
  };
  available?: boolean;
};

const W = 1200;
const H = 675; // 16:9 social-friendly

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) {
    t = t.slice(0, -1);
  }
  return `${t}…`;
}

function drawField(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  label: string,
  value: string
) {
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.font = '600 13px ui-sans-serif, system-ui, -apple-system, sans-serif';
  ctx.fillText(label.toUpperCase(), x, y);

  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = '700 22px ui-sans-serif, system-ui, -apple-system, sans-serif';
  ctx.fillText(truncate(ctx, value || '—', w), x, y + 28);
}

/** Paint a flat WHOIS card on a dot field. */
export function paintWhoisShareCard(
  canvas: HTMLCanvasElement,
  data: WhoisShareImageData
): void {
  const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,255,255,0.34)';
  for (let y = 12; y < H; y += 18) {
    for (let x = 12; x < W; x += 18) {
      ctx.fillRect(x, y, 1.15, 1.15);
    }
  }

  const cardX = 72;
  const cardY = 58;
  const cardW = W - 144;
  const cardH = H - 116;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 16;
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fillStyle = '#111111';
  ctx.fill();
  ctx.restore();

  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Brand header
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.font = '700 14px ui-sans-serif, system-ui, -apple-system, sans-serif';
  ctx.fillText('DOMAINDISCOVERY  ·  WHOIS', cardX + 40, cardY + 48);

  // Domain
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 52px ui-sans-serif, system-ui, -apple-system, sans-serif';
  const domainText = truncate(ctx, data.domain, cardW - 200);
  ctx.fillText(domainText, cardX + 40, cardY + 112);

  // RDAP badge
  const badgeLabel = 'RDAP';
  ctx.font = '700 12px ui-sans-serif, system-ui, sans-serif';
  const badgeW = ctx.measureText(badgeLabel).width + 24;
  const badgeX = cardX + cardW - 40 - badgeW;
  const badgeY = cardY + 36;
  roundRect(ctx, badgeX, badgeY, badgeW, 28, 14);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText(badgeLabel, badgeX + 12, badgeY + 18);

  // Stats grid panel
  const gridX = cardX + 40;
  const gridY = cardY + 148;
  const gridW = cardW - 80;
  const gridH = 250;
  roundRect(ctx, gridX, gridY, gridW, gridH, 18);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const colW = (gridW - 48) / 2;
  const rowH = 72;
  const fields: [string, string][] = [
    ['Status', data.status || '—'],
    ['Registrar', data.registrar || '—'],
    ['Registered', data.registrationDate || '—'],
    ['Expires', data.expirationDate || '—'],
  ];
  if (typeof data.dnssec === 'boolean') {
    fields.push(['DNSSEC', data.dnssec ? 'Signed' : 'Unsigned']);
  }
  if (data.nameServers[0]) {
    fields.push(['Name server', data.nameServers[0]]);
  }

  fields.slice(0, 6).forEach((pair, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const fx = gridX + 24 + col * (colW + 16);
    const fy = gridY + 36 + row * rowH;
    drawField(ctx, fx, fy, colW - 8, pair[0], pair[1]);
  });

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.font = '600 13px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText('Share card  ·  Free public RDAP', cardX + 40, cardY + cardH - 36);

  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.font = '600 12px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText('domaindiscovery', cardX + cardW - 160, cardY + cardH - 36);
}

export async function renderWhoisSharePng(data: WhoisShareImageData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  paintWhoisShareCard(canvas, data);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png', 1)
  );
  if (!blob) {
    throw new Error('Could not encode share image');
  }
  return blob;
}

export function pngFileName(domain: string): string {
  const safe = domain.replace(/[^a-z0-9.-]+/gi, '_').toLowerCase();
  return `whois-${safe}.png`;
}
