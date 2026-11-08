import { estimateDomainValue } from '@/lib/domainValue';

describe('estimateDomainValue', () => {
  it('returns an ordered range with a disclaimer', () => {
    const r = estimateDomainValue('example.com');
    expect(r.low).toBeLessThanOrEqual(r.midpoint);
    expect(r.midpoint).toBeLessThanOrEqual(r.high);
    expect(r.disclaimer.toLowerCase()).toContain('not a professional appraisal');
    expect(r.factors.length).toBeGreaterThan(0);
  });

  it('values a short .com above a long hyphenated .xyz', () => {
    expect(estimateDomainValue('shop.com').midpoint).toBeGreaterThan(estimateDomainValue('my-very-long-name-here.xyz').midpoint);
  });

  it('is deterministic and rewards age', () => {
    expect(estimateDomainValue('acme.io')).toEqual(estimateDomainValue('acme.io'));
    expect(estimateDomainValue('acme.io', { ageYears: 10 }).midpoint).toBeGreaterThan(estimateDomainValue('acme.io').midpoint);
  });
});
