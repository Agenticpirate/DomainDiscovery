/**
 * Impact.com / Spaceship affiliate creatives.
 * Keep click + impression IDs exact so commissions track correctly.
 *
 * Register CTAs (domain deep-links) → registrars.ts (ad 1859616).
 * Spacemail 320×50 display → ad 3832105.
 * Spacemail 1200×600 (TW/X) display → ad 3832098.
 * Spaceship wide partner 2501×1251 → ad 1825517 (carousel with 3832098).
 * Spacemail 160×600 skyscraper → ad 3832106.
 * Engaged-time interstitial (626×521) → ad 1825514.
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
  /** Layout hint */
  format: 'leaderboard' | 'billboard' | 'interstitial' | 'skyscraper';
};

/** Impact tracking for Spacemail 160×600 skyscraper — ad 3832106 */
const IMPACT_SPACEMAIL_160 = {
  id: '3832106',
  campaignId: '21274',
  accountId: '7521997',
  clickUrl: 'https://spaceship.sjv.io/c/7521997/3832106/21274',
  impressionPixel: 'https://imp.pxf.io/i/7521997/3832106/21274',
  displayAdCdn: 'https://a.impactradius-go.com/display-ad/21274-3832106',
} as const;

/** Engaged-time interstitial — Impact ad 1825514 (non-skippable gate) */
export const SPACESHIP_INTERSTITIAL: AffiliateAdCreative = {
  id: '1825514',
  campaignId: '21274',
  accountId: '7521997',
  clickUrl: 'https://spaceship.sjv.io/c/7521997/1825514/21274',
  impressionPixel: 'https://imp.pxf.io/i/7521997/1825514/21274',
  displayAdCdn: 'https://a.impactradius-go.com/display-ad/21274-1825514',
  localSrc: '/ads/spaceship-interstitial-1825514.png',
  width: 626,
  height: 521,
  alt: 'Spaceship — domains, hosting & email affiliate offer',
  title: 'Power your domains with Spaceship',
  subtitle: 'Register, transfer, and grow — exclusive partner offer',
  ctaLabel: 'Visit Spaceship',
  brand: 'Spaceship',
  format: 'interstitial',
};

/** Engaged-time gate thresholds */
export const INTERSTITIAL_CONFIG = {
  /** Show after this much visible on-site time */
  engagedMs: 5 * 60 * 1000,
  /** Non-skippable wait while modal is open + tab visible */
  dismissWaitSec: 60,
  storageEngaged: 'dd_aff_engaged_ms_v1',
  storageDone: 'dd_aff_interstitial_done_v1',
} as const;

/** Spacemail 320×50 leaderboard — Impact ad 3832105 */
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
  format: 'leaderboard',
};

/**
 * Spacemail 1200×600 TW/X billboard — Impact ad 3832098
 */
export const SPACESHIP_SPACEMAIL_BILLBOARD: AffiliateAdCreative = {
  id: '3832098',
  campaignId: '21274',
  accountId: '7521997',
  clickUrl: 'https://spaceship.sjv.io/c/7521997/3832098/21274',
  impressionPixel: 'https://imp.pxf.io/i/7521997/3832098/21274',
  displayAdCdn: 'https://a.impactradius-go.com/display-ad/21274-3832098',
  localSrc: '/ads/spacemail-banner-1200x630.png',
  width: 1200,
  height: 600,
  alt: 'Spacemail by Spaceship — professional email for your domain',
  title: 'Spacemail by Spaceship',
  subtitle: 'Branded email for your domain — built by Spaceship',
  ctaLabel: 'Get Spacemail',
  brand: 'Spaceship',
  format: 'billboard',
};

/**
 * Spaceship partner wide banner — Impact ad 1825517 (2501×1251)
 * Used in carousel with Spacemail 3832098
 */
export const SPACESHIP_PARTNER_WIDE: AffiliateAdCreative = {
  id: '1825517',
  campaignId: '21274',
  accountId: '7521997',
  clickUrl: 'https://spaceship.sjv.io/c/7521997/1825517/21274',
  impressionPixel: 'https://imp.pxf.io/i/7521997/1825517/21274',
  displayAdCdn: 'https://a.impactradius-go.com/display-ad/21274-1825517',
  localSrc: '/ads/spaceship-banner-1825517.png',
  width: 2501,
  height: 1251,
  alt: 'Spaceship — premium domains, email & more',
  title: 'Spaceship for domain builders',
  subtitle: 'Domains, email & tools — partner offer',
  ctaLabel: 'Explore Spaceship',
  brand: 'Spaceship',
  format: 'billboard',
};

/** Rotating billboard creatives (mid-page / search / bulk / learn / generator) */
export const BILLBOARD_CAROUSEL_ADS: AffiliateAdCreative[] = [
  SPACESHIP_SPACEMAIL_BILLBOARD,
  SPACESHIP_PARTNER_WIDE,
];

/** Auto-advance interval for billboard carousel (ms) */
export const BILLBOARD_CAROUSEL_MS = 6500;

/** Spacemail 160×600 skyscraper — desktop sticky rail */
export const SPACESHIP_SPACEMAIL_SKYSCRAPER: AffiliateAdCreative = {
  id: IMPACT_SPACEMAIL_160.id,
  campaignId: IMPACT_SPACEMAIL_160.campaignId,
  accountId: IMPACT_SPACEMAIL_160.accountId,
  clickUrl: IMPACT_SPACEMAIL_160.clickUrl,
  impressionPixel: IMPACT_SPACEMAIL_160.impressionPixel,
  displayAdCdn: IMPACT_SPACEMAIL_160.displayAdCdn,
  localSrc: '/ads/spacemail-banner-160x600.png',
  width: 160,
  height: 600,
  alt: 'Spacemail by Spaceship — professional email for your domain',
  title: 'Spacemail',
  subtitle: 'Email on your domain',
  ctaLabel: 'Get Spacemail',
  brand: 'Spaceship',
  format: 'skyscraper',
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
  | 'inline'
  | 'skyscraper';

/**
 * Map placement → creative (single unit).
 * Billboard placements prefer carousel via getCarouselAdsForPlacement.
 */
export function getAdForPlacement(placement: AffiliateAdPlacement): AffiliateAdCreative {
  switch (placement) {
    case 'skyscraper':
      return SPACESHIP_SPACEMAIL_SKYSCRAPER;
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

/** Whether this placement should use the multi-ad slide carousel */
export function placementUsesCarousel(placement: AffiliateAdPlacement): boolean {
  return (
    placement === 'home-mid' ||
    placement === 'search' ||
    placement === 'bulk' ||
    placement === 'generator' ||
    placement === 'learn'
  );
}

export function getCarouselAdsForPlacement(
  placement: AffiliateAdPlacement
): AffiliateAdCreative[] {
  if (placementUsesCarousel(placement)) return BILLBOARD_CAROUSEL_ADS;
  return [getAdForPlacement(placement)];
}

/** Suggested visual variant for a placement */
export function getDefaultVariant(
  placement: AffiliateAdPlacement
): 'leaderboard' | 'card' | 'strip' | 'billboard' | 'skyscraper' {
  const ad = getAdForPlacement(placement);
  if (ad.format === 'billboard') return 'billboard';
  if (ad.format === 'skyscraper') return 'skyscraper';
  if (placement === 'home-hero') return 'strip';
  if (placement === 'footer') return 'card';
  return 'card';
}
