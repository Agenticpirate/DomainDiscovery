/**
 * Impact.com / Spaceship affiliate creatives.
 * Keep click + impression IDs exact so commissions track correctly.
 *
 * Register CTAs (domain deep-links) live in registrars.ts (ad 1859616).
 * Display banners use Impact media 3832105 (Spacemail) unless a new ad ID is provided.
 */

export type AffiliateAdCreative = {
  /** Impact ad / media ID (also used as link id attribute) */
  id: string;
  /** Campaign ID (Spaceship = 21274) */
  campaignId: string;
  /** Impact account SID */
  accountId: string;
  /** Tracked click URL — never replace with raw spaceship.com */
  clickUrl: string;
  /** 1×1 view pixel — fire once when the unit is shown */
  impressionPixel: string;
  /** Impact-hosted creative (fallback / audit) — empty if local-only */
  displayAdCdn: string;
  /** Local copy under /public for fast LCP + offline reliability */
  localSrc: string;
  width: number;
  height: number;
  alt: string;
  /** Short label for enhanced frame */
  title: string;
  subtitle: string;
  ctaLabel: string;
  brand: string;
  /** Layout hint: leaderboard (320×50) vs billboard (wide social) */
  format: 'leaderboard' | 'billboard';
};

/** Shared Spacemail Impact tracking (ad 3832105) */
const SPACEMAIL_TRACKING = {
  id: '3832105',
  campaignId: '21274',
  accountId: '7521997',
  clickUrl: 'https://spaceship.sjv.io/c/7521997/3832105/21274',
  impressionPixel: 'https://imp.pxf.io/i/7521997/3832105/21274',
  displayAdCdn: 'https://a.impactradius-go.com/display-ad/21274-3832105',
  title: 'Spacemail by Spaceship',
  subtitle: 'Professional email on your domain — fast setup, modern inbox',
  ctaLabel: 'Get Spacemail',
  brand: 'Spaceship',
  alt: 'Spacemail by Spaceship — professional email for your domain',
} as const;

/** Spacemail 320×50 leaderboard */
export const SPACESHIP_SPACEMAIL_BANNER: AffiliateAdCreative = {
  ...SPACEMAIL_TRACKING,
  displayAdCdn: SPACEMAIL_TRACKING.displayAdCdn,
  localSrc: '/ads/spacemail-banner-320x50.png',
  width: 320,
  height: 50,
  format: 'leaderboard',
};

/**
 * Spacemail 1200×630 TW/X creative (file is 1200×600).
 * Same Impact click + impression as 3832105 until a dedicated ad ID is issued.
 */
export const SPACESHIP_SPACEMAIL_BILLBOARD: AffiliateAdCreative = {
  ...SPACEMAIL_TRACKING,
  // Local creative only — Impact CDN is the 320×50 unit
  displayAdCdn: '',
  localSrc: '/ads/spacemail-banner-1200x630.png',
  width: 1200,
  height: 600,
  format: 'billboard',
  subtitle: 'Branded email for your domain — built by Spaceship',
};

/**
 * Placement keys used across the site. Each mount fires its own
 * impression pixel (standard for multi-unit pages).
 */
export type AffiliateAdPlacement =
  | 'footer'
  | 'home-hero'
  | 'home-mid'
  | 'search'
  | 'bulk'
  | 'generator'
  | 'tools'
  | 'learn'
  | 'inline';

/**
 * Map placement → creative.
 * Billboard (large) on high-attention mid pages; leaderboard/card on chrome.
 */
export function getAdForPlacement(placement: AffiliateAdPlacement): AffiliateAdCreative {
  switch (placement) {
    case 'home-mid':
    case 'learn':
    case 'generator':
    case 'search':
    case 'bulk':
      return SPACESHIP_SPACEMAIL_BILLBOARD;
    case 'home-hero':
    case 'footer':
    case 'tools':
    case 'inline':
    default:
      return SPACESHIP_SPACEMAIL_BANNER;
  }
}

/** Suggested visual variant for a placement */
export function getDefaultVariant(
  placement: AffiliateAdPlacement
): 'leaderboard' | 'card' | 'strip' | 'billboard' {
  const ad = getAdForPlacement(placement);
  if (ad.format === 'billboard') return 'billboard';
  if (placement === 'home-hero') return 'strip';
  if (placement === 'footer') return 'card';
  return 'card';
}
