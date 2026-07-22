/**
 * Renders a shareable WHOIS template card as a high-res PNG (canvas).
 * Social channels can't play live 3D CSS — this image is the portable visual.
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

/**
 * Paint a sleek dark/silver WHOIS card onto a canvas (with soft 3D shadow).
 */
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

  // Background atmosphere
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#07070a');
  bg.addColorStop(0.45, '#0c0c10');
  bg.addColorStop(1, '#111118');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Soft ambient orbs
  const orb1 = ctx.createRadialGradient(220, 140, 20, 220, 140, 280);
  orb1.addColorStop(0, 'rgba(203,213,225,0.16)');
  orb1.addColorStop(1, 'transparent');
  ctx.fillStyle = orb1;
  ctx.fillRect(0, 0, W, H);

  const orb2 = ctx.createRadialGradient(980, 520, 10, 980, 520, 320);
  orb2.addColorStop(0, 'rgba(148,163,184,0.14)');
  orb2.addColorStop(1, 'transparent');
  ctx.fillStyle = orb2;
  ctx.fillRect(0, 0, W, H);

  // Card drop shadow (3D lift)
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 28;
  roundRect(ctx, 72, 58, W - 144, H - 116, 28);
  ctx.fillStyle = '#0e0e12';
  ctx.fill();
  ctx.restore();

  // Card body with subtle perspective skew via gradient
  const cardX = 72;
  const cardY = 58;
  const cardW = W - 144;
  const cardH = H - 116;

  // Outer silver rim
  const rim = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  rim.addColorStop(0, 'rgba(255,255,255,0.35)');
  rim.addColorStop(0.35, 'rgba(148,163,184,0.2)');
  rim.addColorStop(0.7, 'rgba(255,255,255,0.12)');
  rim.addColorStop(1, 'rgba(100,116,139,0.35)');
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fillStyle = rim;
  ctx.fill();

  // Inner panel
  roundRect(ctx, cardX + 2, cardY + 2, cardW - 4, cardH - 4, 26);
  const panel = ctx.createLinearGradient(cardX, cardY, cardX + cardW * 0.2, cardY + cardH);
  panel.addColorStop(0, '#16161c');
  panel.addColorStop(0.5, '#0f0f14');
  panel.addColorStop(1, '#14141a');
  ctx.fillStyle = panel;
  ctx.fill();

  // Diagonal gloss + dual shine bands (reads as “motion” in a still PNG)
  ctx.save();
  roundRect(ctx, cardX + 2, cardY + 2, cardW - 4, cardH - 4, 26);
  ctx.clip();
  const gloss = ctx.createLinearGradient(cardX, cardY, cardX + cardW * 0.7, cardY + cardH * 0.55);
  gloss.addColorStop(0, 'rgba(255,255,255,0.12)');
  gloss.addColorStop(0.4, 'rgba(255,255,255,0.03)');
  gloss.addColorStop(1, 'transparent');
  ctx.fillStyle = gloss;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // Primary shine band
  ctx.save();
  ctx.translate(cardX + cardW * 0.28, cardY);
  ctx.rotate((-18 * Math.PI) / 180);
  const band = ctx.createLinearGradient(0, 0, 130, 0);
  band.addColorStop(0, 'transparent');
  band.addColorStop(0.45, 'rgba(255,255,255,0.14)');
  band.addColorStop(1, 'transparent');
  ctx.fillStyle = band;
  ctx.fillRect(-40, -40, 150, cardH + 120);
  ctx.restore();

  // Secondary soft band
  ctx.save();
  ctx.translate(cardX + cardW * 0.62, cardY + 20);
  ctx.rotate((-18 * Math.PI) / 180);
  const band2 = ctx.createLinearGradient(0, 0, 90, 0);
  band2.addColorStop(0, 'transparent');
  band2.addColorStop(0.5, 'rgba(203,213,225,0.08)');
  band2.addColorStop(1, 'transparent');
  ctx.fillStyle = band2;
  ctx.fillRect(-20, -40, 100, cardH + 120);
  ctx.restore();

  // Top edge highlight (3D lip)
  const lip = ctx.createLinearGradient(cardX, cardY, cardX, cardY + 40);
  lip.addColorStop(0, 'rgba(255,255,255,0.14)');
  lip.addColorStop(1, 'transparent');
  ctx.fillStyle = lip;
  ctx.fillRect(cardX + 2, cardY + 2, cardW - 4, 40);
  ctx.restore();

  // Brand header
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.font = '700 14px ui-sans-serif, system-ui, -apple-system, sans-serif';
  ctx.fillText('DOMAINDISCOVERY  ·  WHOIS TEMPLATE', cardX + 40, cardY + 48);

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
  ctx.fillText('Free public RDAP  ·  Share-ready card', cardX + 40, cardY + cardH - 36);

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
