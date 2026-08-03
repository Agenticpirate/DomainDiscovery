/**
 * DESIGN.md (Vercel light) class presets.
 * Colors resolve via dual-theme CSS vars on :root / html.light
 * (see globals.css --ds-* and tailwind `ds.*` colors).
 */

export const ds = {
  /** Page shell */
  page: 'bg-ds-soft text-ds-ink',
  /** Elevated white/dark card */
  card: 'bg-ds-canvas border border-ds-hairline rounded-ds-xl shadow-ds-card',
  cardHover: 'bg-ds-canvas border border-ds-hairline rounded-ds-xl shadow-ds-card hover:shadow-ds-card-hover hover:border-ds-strong transition-shadow',
  /** Soft inset tray */
  inset: 'bg-ds-soft border border-ds-hairline rounded-ds-lg',
  insetDeep: 'bg-ds-inset border border-ds-hairline rounded-ds-lg',
  /** Text */
  ink: 'text-ds-ink',
  body: 'text-ds-body',
  mute: 'text-ds-mute',
  link: 'text-ds-link hover:text-ds-link-deep',
  /** Section eyebrow */
  label: 'ds-label',
  /** Borders */
  hairline: 'border-ds-hairline',
  /** Primary solid CTA (ink on light, white on dark via polarity) */
  /** Polarity CTA: ink fill + soft text (works light + dark) */
  btnPrimary:
    'inline-flex items-center justify-center gap-2 rounded-full bg-ds-ink text-ds-soft font-semibold transition-colors hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed',
  btnSecondary:
    'inline-flex items-center justify-center gap-2 rounded-full bg-ds-canvas text-ds-ink border border-ds-hairline font-semibold transition-colors hover:bg-ds-inset disabled:opacity-45 disabled:cursor-not-allowed',
  btnDisabled:
    'inline-flex items-center justify-center gap-2 rounded-full bg-ds-inset text-ds-mute border border-ds-hairline font-semibold cursor-not-allowed',
  /** Input chrome */
  input:
    'bg-ds-canvas border border-ds-hairline text-ds-ink placeholder:text-ds-mute rounded-ds-sm focus:border-ds-ink outline-none',
  /** Filter / chip control */
  pill: (active: boolean) =>
    active
      ? 'ds-pill ds-pill-active shadow-sm'
      : 'ds-pill',
  /** Marketing badge on soft canvas */
  badge:
    'inline-flex items-center gap-1.5 rounded-full border border-ds-hairline bg-ds-soft text-ds-body text-[10px] sm:text-[11px] font-semibold tracking-wide px-2.5 py-1 shadow-sm',
  /** Ink polarity badge (dark plate) */
  badgeInk:
    'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0a0a0c] text-white/85 text-[10px] sm:text-[11px] font-semibold tracking-wide px-2.5 py-1 shadow-sm',
} as const;
