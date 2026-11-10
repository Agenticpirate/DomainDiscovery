import { legacySocialImageTarget } from '@/lib/legacySocialImages';

describe('legacySocialImageTarget', () => {
  it('maps the old extensionless image addresses to the static PNGs', () => {
    expect(legacySocialImageTarget('/opengraph-image')).toBe('/opengraph-image.png');
    expect(legacySocialImageTarget('/twitter-image')).toBe('/twitter-image.png');
  });

  it('leaves everything else alone, including the PNGs themselves', () => {
    expect(legacySocialImageTarget('/opengraph-image.png')).toBeNull();
    expect(legacySocialImageTarget('/twitter-image.png')).toBeNull();
    expect(legacySocialImageTarget('/')).toBeNull();
    expect(legacySocialImageTarget('/opengraph-image/x')).toBeNull();
    expect(legacySocialImageTarget('/share/whois/example.com/opengraph-image')).toBeNull();
  });
});
