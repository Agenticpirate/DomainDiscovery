/**
 * Shared ADA visual tokens — light mode is first-class (not washed-out gray).
 * Use via useAdaTheme() in client components.
 */

export type AdaThemeTokens = {
  isLight: boolean;
  mounted: boolean;
  /** Page / shell background */
  pageBg: string;
  /** Primary text */
  ink: string;
  /** Secondary body text */
  muted: string;
  /** Labels / captions */
  faint: string;
  /** Hairline borders */
  hair: string;
  /** Card border + fill */
  card: string;
  /** Elevated card (stronger in light) */
  cardRaised: string;
  /** Soft band background (section stripes) */
  band: string;
  /** Pill / chip */
  pill: string;
  /** Primary CTA */
  btnPrimary: string;
  /** Secondary CTA */
  btnSecondary: string;
  /** Ghost / tertiary */
  btnGhost: string;
  /** Header surface */
  header: string;
  /** Input surface */
  input: string;
  /** Icon well */
  iconWell: string;
  /** Ambient hero gradient (CSS) */
  ambientHero: string;
  /** Section band gradient (CSS) */
  ambientBand: string;
};

export function adaTokens(isLight: boolean): AdaThemeTokens {
  if (isLight) {
    return {
      isLight: true,
      mounted: true,
      pageBg: '#f8fafc',
      ink: 'text-slate-900',
      muted: 'text-slate-600',
      faint: 'text-slate-500',
      hair: 'border-slate-200',
      card:
        'border-slate-200/95 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]',
      cardRaised:
        'border-slate-200 bg-white shadow-[0_4px_6px_-2px_rgba(15,23,42,0.05),0_16px_40px_-20px_rgba(15,23,42,0.18)]',
      band: 'bg-slate-50/90 border-slate-200/80',
      pill: 'border-slate-200 bg-white text-slate-700 shadow-sm shadow-slate-900/[0.03]',
      btnPrimary:
        'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/15',
      btnSecondary:
        'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-sm',
      btnGhost: 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-white',
      header: 'bg-white/95 border-slate-200/90 shadow-[0_1px_0_rgba(15,23,42,0.04)]',
      input:
        'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-200',
      iconWell: 'border-slate-200 bg-slate-50 text-slate-800',
      ambientHero:
        'radial-gradient(ellipse 85% 55% at 50% -8%, rgba(15,23,42,0.05), transparent 58%), radial-gradient(ellipse 50% 40% at 100% 0%, rgba(100,116,139,0.06), transparent 50%)',
      ambientBand:
        'linear-gradient(180deg, rgba(248,250,252,0.95) 0%, rgba(241,245,249,0.9) 100%)',
    };
  }

  return {
    isLight: false,
    mounted: true,
    pageBg: '#050505',
    ink: 'text-white',
    muted: 'text-white/55',
    faint: 'text-white/40',
    hair: 'border-white/[0.09]',
    // Solid fills so ambient dots stay behind cards / badges / forms
    card: 'border-white/[0.09] bg-[#0a0a0c]',
    cardRaised: 'border-white/[0.1] bg-[#0c0c0e] shadow-[0_24px_60px_-36px_rgba(0,0,0,0.9)]',
    band: 'bg-[#0a0a0c] border-white/[0.07]',
    pill: 'border-white/12 bg-[#121214] text-white/60',
    btnPrimary: 'bg-white text-black hover:bg-white/95 shadow-lg shadow-white/10',
    btnSecondary:
      'border-white/15 bg-[#0a0a0c] text-white/90 hover:border-white/30 hover:bg-[#121214]',
    btnGhost: 'border-white/12 bg-[#0a0a0c] text-white/55 hover:border-white/25 hover:text-white/85',
    header: 'bg-[#0a0a0c]/95 border-white/[0.08]',
    input:
      'border-white/12 bg-[#121214] text-white placeholder:text-white/30 focus:border-white/25',
    iconWell: 'border-white/10 bg-[#121214] text-white/90',
    ambientHero:
      'radial-gradient(ellipse 80% 55% at 50% -15%, rgba(255,255,255,0.07), transparent 55%)',
    ambientBand: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
  };
}
