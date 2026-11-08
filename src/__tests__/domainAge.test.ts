import { summarizeAge } from '@/lib/domainAge';

const now = new Date('2025-01-01T00:00:00Z');

describe('summarizeAge', () => {
  it('computes age and days until expiry', () => {
    const r = summarizeAge({ registrationDateIso: '2015-01-01T00:00:00Z', expirationDateIso: '2025-03-02T00:00:00Z' }, now);
    expect(r.ageYears).toBe(10);
    expect(r.daysUntilExpiry).toBe(60);
    expect(r.status).toContain('Active');
  });

  it('flags soon-to-expire and expired domains', () => {
    expect(summarizeAge({ registrationDateIso: null, expirationDateIso: '2025-01-11T00:00:00Z' }, now).status).toContain('soon');
    const expired = summarizeAge({ registrationDateIso: null, expirationDateIso: '2024-12-22T00:00:00Z' }, now);
    expect(expired.daysUntilExpiry).toBe(-10);
    expect(expired.status).toContain('Expired');
  });

  it('handles missing dates', () => {
    const r = summarizeAge({ registrationDateIso: null, expirationDateIso: null }, now);
    expect(r.ageYears).toBeNull();
    expect(r.daysUntilExpiry).toBeNull();
  });
});
