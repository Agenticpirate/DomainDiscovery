/**
 * Impact.com / Spaceship affiliate creatives.
 * Keep click + impression IDs exact so commissions track correctly.
 *
 * Register CTAs (domain deep-links) live in registrars.ts (ad 1859616).
 * Display banners use separate ad IDs from Impact media.
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
  /** Impact-hosted creative (fallback / audit) */
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
};

/** Spacemail 320×50 — Impact ad 3832105 */
export const SPACESHIP_SPACEMAIL_BANNER: AffiliateAdCreative = {
  id: '3832105',
  campaignId: '21274',
  accountId: '7521997',
  clickUrl: 'https://spaceship.sjv.io/c/7521997/3832105/21274',
  impressionPixel: 'https://imp.pxf.io/i/7521997/3832105/21274',
  displayAdCdn: 'https://a.impactradius-go.com/display-ad/21274-3832105',
  localSrc: '/ads/spacemail-banner-320x50.png',
  width: 320,
  height: 50,
  alt: 'Spacemail by Spaceship — professional email for your domain',
  title: 'Spacemail by Spaceship',
  subtitle: 'Professional email on your domain — fast setup, modern inbox',
  ctaLabel: 'Get Spacemail',
  brand: 'Spaceship',
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

/** Default creative per placement (add more ads later by swapping here) */
export function getAdForPlacement(_placement: AffiliateAdPlacement): AffiliateAdCreative {
  return SPACESHIP_SPACEMAIL_BANNER;
}
