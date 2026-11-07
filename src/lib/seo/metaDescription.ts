/** Bing flags meta descriptions outside 25–160 characters; Google truncates around 155–160. */
export const META_DESCRIPTION_MAX = 160;

/**
 * Safety net for meta descriptions: returns text unchanged when it fits, otherwise keeps
 * whole sentences up to the limit, otherwise cuts at the last word boundary and adds "…".
 * Counts Unicode code points so CJK / Devanagari / Arabic text is measured like crawlers do.
 */
export function clampMetaDescription(text: string, max = META_DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  const chars = Array.from(clean);
  if (chars.length <= max) return clean;

  // Sentence enders across the site's languages (Latin, CJK, Devanagari, Arabic/Urdu).
  const sentences = clean.match(/[^.!?。！？।۔]+[.!?。！？।۔]+\s*/g) ?? [];
  let kept = '';
  for (const sentence of sentences) {
    const next = kept + sentence;
    if (Array.from(next.trim()).length > max) break;
    kept = next;
  }
  if (Array.from(kept.trim()).length >= 70) return kept.trim();

  const head = chars.slice(0, max - 1).join('');
  const lastSpace = head.lastIndexOf(' ');
  const cut = lastSpace >= 70 ? head.slice(0, lastSpace) : head;
  return `${cut.replace(/[\s,;:—–-]+$/, '')}…`;
}
