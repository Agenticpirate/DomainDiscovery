/**
 * Old social-card image addresses. The images used to be generated at /opengraph-image and
 * /twitter-image (no extension, with a ?hash). They are static PNGs now, so those addresses
 * 404. Link previews that saved the old address (X, Facebook, LinkedIn, Slack, Discord) would
 * then keep showing the old picture; sending them to the PNG lets them pick up the new one
 * the next time they re-check the image. Kept tiny: middleware imports it.
 */
const LEGACY_SOCIAL_IMAGES: Record<string, string> = {
  '/opengraph-image': '/opengraph-image.png',
  '/twitter-image': '/twitter-image.png',
};

/** The PNG path for an old image address, or null when the path is not an old address. */
export function legacySocialImageTarget(pathname: string): string | null {
  return LEGACY_SOCIAL_IMAGES[pathname] ?? null;
}
