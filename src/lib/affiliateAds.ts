/**
 * Impact.com / Spaceship affiliate creatives.
 * Keep click + impression IDs exact so commissions track correctly.
 *
 * Register CTAs → registrars.ts (ad 1859616).
 * Leaderboard desktop (ChatGPT wide) → 3832105 / 1825517 tracking family as noted.
 * Leaderboard mobile 668×105 → ad 1825519.
 * Billboard carousel → 3832098 + 1825517.
 * Skyscraper carousel → 3832106 + 1825513.
 * Interstitial → 1825514.
 */

export type AffiliateAdCreative = {
  id: string;
  campaignId: string;
  accountId: string;
  clickUrl: string;
  impressionPixel: string;
  displayAdCdn: string;
  localSrc: string;
  width: number;
  height: number;
  alt: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  brand: string;
  format: 'leaderboard' | 'billboard' | 'interstitial' | 'skyscraper';
};

/** Engaged-time interstitial — Impact ad 1825514 */
export const SPACESHIP_INTERSTITIAL: AffiliateAdCreative = {
  id: '1825514',
  campaignId: '21274',
  accountId: '7521997',
  clickUrl: 'https://spaceship.sjv.io/c/7521997/1825514/21274',
  impressionPixel: 'https://imp.pxf.io/i/7521997/1825514/21274',
  displayAdCdn: 'https://a.impactradius-go.com/display-ad/21274-1825514',
  localSrc: '/ads/spaceship-interstitial-1825514.webp',
  width: 626,
  height: 521,
  alt: 'Spaceship — domains, hosting & email affiliate offer',
  title: 'Power your domains with Spaceship',
  subtitle: 'Register, transfer, and grow — exclusive partner offer',
  ctaLabel: 'Visit Spaceship',
  brand: 'Spaceship',
  format: 'interstitial',
};

export const INTERSTITIAL_CONFIG = {
  /** Visible-tab engaged time before first interstitial (3–5 min range → 4 min) */
  engagedMs: 4 * 60 * 1000,
  /** Non-skippable gate once open (or unlock by clicking the ad) */
  dismissWaitSec: 60,
  // v2 keys: clears stuck v1 "done" flags that blocked the modal after testing
  storageEngaged: 'dd_aff_engaged_ms_v2',
  storageDone: 'dd_aff_interstitial_done_v2',
  storageShown: 'dd_aff_interstitial_shown_v2',
} as const;

/**
 * Hero / footer strip — Impact 1825519 (668×105).
 * Higher-res than 320×50 so it stays sharp when displayed ~full rail width.
 * (320×50 stretched to 700–1000px was the blur source.)
 */
export const SPACESHIP_SPACEMAIL_BANNER: AffiliateAdCreative = {
  id: '1825519',
  campaignId: '21274',
  accountId: '7521997',
  clickUrl: 'https://spaceship.sjv.io/c/7521997/1825519/21274',
  impressionPixel: 'https://imp.pxf.io/i/7521997/1825519/21274',
  displayAdCdn: 'https://a.impactradius-go.com/display-ad/21274-1825519',
  localSrc: '/ads/spacemail-mobile-1825519.webp',
  width: 668,
  height: 105,
  alt: 'Spacemail by Spaceship — professional email for your domain',
  title: 'Spacemail by Spaceship',
  subtitle: 'Professional email on your domain',
  ctaLabel: 'Get Spacemail',
  brand: 'Spaceship',
  format: 'leaderboard',
};

/** Alias — same sharp 668×105 unit (mobile + desktop strip) */
export const SPACESHIP_SPACEMAIL_MOBILE: AffiliateAdCreative = SPACESHIP_SPACEMAIL_BANNER;

/** Strip placements (hero, footer, tools) */
export const STRIP_CAROUSEL_ADS: AffiliateAdCreative[] = [
  SPACESHIP_SPACEMAIL_BANNER,
];

/** Spacemail 1200×600 billboard — Impact 3832098 */
export const SPACESHIP_SPACEMAIL_BILLBOARD: AffiliateAdCreative = {
  id: '3832098',
  campaignId: '21274',
  accountId: '7521997',
  clickUrl: 'https://spaceship.sjv.io/c/7521997/3832098/21274',
  impressionPixel: 'https://imp.pxf.io/i/7521997/3832098/21274',
  displayAdCdn: 'https://a.impactradius-go.com/display-ad/21274-3832098',
  localSrc: '/ads/spacemail-banner-1200x630.webp',
  width: 1200,
  height: 600,
  alt: 'Spacemail by Spaceship — professional email for your domain',
  title: 'Spacemail by Spaceship',
  subtitle: 'Branded email for your domain',
  ctaLabel: 'Get Spacemail',
  brand: 'Spaceship',
  format: 'billboard',
};

/** Wide partner billboard — Impact 1825517 */
export const SPACESHIP_PARTNER_WIDE: AffiliateAdCreative = {
  id: '1825517',
  campaignId: '21274',
  accountId: '7521997',
  clickUrl: 'https://spaceship.sjv.io/c/7521997/1825517/21274',
  impressionPixel: 'https://imp.pxf.io/i/7521997/1825517/21274',
  displayAdCdn: 'https://a.impactradius-go.com/display-ad/21274-1825517',
  localSrc: '/ads/spaceship-banner-1825517.webp',
  width: 2501,
  height: 1251,
  alt: 'Spaceship — premium domains, email & more',
  title: 'Spaceship for domain builders',
  subtitle: 'Domains, email & tools',
  ctaLabel: 'Explore Spaceship',
  brand: 'Spaceship',
  format: 'billboard',
};

export const BILLBOARD_CAROUSEL_ADS: AffiliateAdCreative[] = [
  SPACESHIP_SPACEMAIL_BILLBOARD,
  SPACESHIP_PARTNER_WIDE,
];

export const BILLBOARD_CAROUSEL_MS = 15_000;
export const SKYSCRAPER_CAROUSEL_MS = 15_000;
export const STRIP_CAROUSEL_MS = 15_000;

/** Spacemail skyscraper — Impact 3832106 (true 160×600 local asset) */
export const SPACESHIP_SPACEMAIL_SKYSCRAPER: AffiliateAdCreative = {
  id: '3832106',
  campaignId: '21274',
  accountId: '7521997',
  clickUrl: 'https://spaceship.sjv.io/c/7521997/3832106/21274',
  impressionPixel: 'https://imp.pxf.io/i/7521997/3832106/21274',
  displayAdCdn: 'https://a.impactradius-go.com/display-ad/21274-3832106',
  localSrc: '/ads/spacemail-banner-160x600.webp',
  width: 160,
  height: 600,
  alt: 'Spacemail by Spaceship — professional email for your domain',
  title: 'Spacemail',
  subtitle: 'Email on your domain',
  ctaLabel: 'Get Spacemail',
  brand: 'Spaceship',
  format: 'skyscraper',
};

/** Partner skyscraper — Impact 1825513 */
export const SPACESHIP_PARTNER_SKYSCRAPER: AffiliateAdCreative = {
  id: '1825513',
  campaignId: '21274',
  accountId: '7521997',
  clickUrl: 'https://spaceship.sjv.io/c/7521997/1825513/21274',
  impressionPixel: 'https://imp.pxf.io/i/7521997/1825513/21274',
  displayAdCdn: 'https://a.impactradius-go.com/display-ad/21274-1825513',
  localSrc: '/ads/spaceship-skyscraper-1825513.webp',
  width: 335,
  height: 1251,
  alt: 'Spaceship — domains, email & affiliate programs',
  title: 'Spaceship',
  subtitle: 'Partner offer',
  ctaLabel: 'Visit Spaceship',
  brand: 'Spaceship',
  format: 'skyscraper',
};

/** Side rail order: sky-blue Spaceship first, Spacemail second */
export const SKYSCRAPER_CAROUSEL_ADS: AffiliateAdCreative[] = [
  SPACESHIP_PARTNER_SKYSCRAPER,
  SPACESHIP_SPACEMAIL_SKYSCRAPER,
];

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

export function placementUsesCarousel(placement: AffiliateAdPlacement): boolean {
  return (
    placement === 'home-mid' ||
    placement === 'search' ||
    placement === 'bulk' ||
    placement === 'generator' ||
    placement === 'learn'
  );
}

/** Strip placements use wide ChatGPT creatives (desktop) / mobile unit via component */
export function placementUsesStripCarousel(placement: AffiliateAdPlacement): boolean {
  return (
    placement === 'home-hero' ||
    placement === 'footer' ||
    placement === 'tools' ||
    placement === 'inline'
  );
}

export function getCarouselAdsForPlacement(
  placement: AffiliateAdPlacement
): AffiliateAdCreative[] {
  if (placementUsesCarousel(placement)) return BILLBOARD_CAROUSEL_ADS;
  if (placementUsesStripCarousel(placement)) return STRIP_CAROUSEL_ADS;
  return [getAdForPlacement(placement)];
}

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
