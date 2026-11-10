import { retiredPageTarget } from '@/lib/retiredPages';

describe('retiredPageTarget', () => {
  it('sends the removed Domain Age page to the WHOIS lookup', () => {
    expect(retiredPageTarget('/tools/domain-age')).toBe('/tools/whois');
    expect(retiredPageTarget('/tools/domain-age/')).toBe('/tools/whois');
  });

  it('keeps the language prefix and the .md form', () => {
    expect(retiredPageTarget('/fr/tools/domain-age')).toBe('/fr/tools/whois');
    expect(retiredPageTarget('/ar/tools/domain-age/')).toBe('/ar/tools/whois');
    expect(retiredPageTarget('/tools/domain-age.md')).toBe('/tools/whois.md');
    expect(retiredPageTarget('/ja/tools/domain-age.md')).toBe('/ja/tools/whois.md');
  });

  it('leaves live pages alone', () => {
    expect(retiredPageTarget('/tools/whois')).toBeNull();
    expect(retiredPageTarget('/tools/value')).toBeNull();
    expect(retiredPageTarget('/tools/domain-age-extra')).toBeNull();
    expect(retiredPageTarget('/learn/domain-age')).toBeNull();
    expect(retiredPageTarget('/xx/tools/domain-age')).toBeNull();
    expect(retiredPageTarget('/')).toBeNull();
  });
});
