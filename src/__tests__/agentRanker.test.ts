import { parseBusinessBrief } from '@/lib/agent/brief';
import { rankDomains, scoreDomain } from '@/lib/agent/ranker';

describe('agent ranker', () => {
  const brief = parseBusinessBrief(
    'We build an AI scheduling SaaS for clinics and medical offices',
    { style: 'brandable', preferredTlds: ['.com', '.ai'], count: 10 }
  );

  it('parses keywords from a business description', () => {
    expect(brief.keywords.length).toBeGreaterThan(0);
    expect(brief.description.toLowerCase()).toContain('scheduling');
  });

  it('scores available short brandables higher than long hyphenated taken names', () => {
    const good = scoreDomain('clinicflow.com', brief, { available: true });
    const bad = scoreDomain('best-clinic-scheduling-software-online.com', brief, {
      available: false,
    });
    expect(good.score).toBeGreaterThan(bad.score);
    expect(good.available).toBe(true);
  });

  it('flags famous brand lookalikes', () => {
    const r = scoreDomain('googleclinic.com', brief, { available: true });
    expect(r.breakdown.riskFlags.some((f) => f.startsWith('lookalike:'))).toBe(true);
  });

  it('ranks available domains first', () => {
    const ranked = rankDomains(
      [
        { domain: 'takenbrand.com', available: false },
        { domain: 'openbrand.com', available: true },
        { domain: 'midbrand.ai', available: true },
      ],
      brief
    );
    expect(ranked[0].available).toBe(true);
    expect(ranked.map((r) => r.domain)).toContain('openbrand.com');
  });
});

describe('parseBusinessBrief', () => {
  it('requires description', () => {
    expect(() => parseBusinessBrief('')).toThrow(/required/i);
  });

  it('infers geo style for local services', () => {
    const b = parseBusinessBrief('Local plumber serving Austin homes and businesses');
    expect(b.style).toBe('geo');
  });
});
