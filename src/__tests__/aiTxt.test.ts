/** @jest-environment node */
import { buildAiTxt } from '@/lib/aiTxt';
import { MD_SKIP } from '@/lib/md/routes';
import { getSiteBaseUrl, SITE_BRAND } from '@/lib/seoSiteFacts';

const text = buildAiTxt(new Date('2026-01-02T00:00:00Z'));

describe('ai.txt', () => {
  it('has every section', () => {
    for (const s of ['identity', 'permissions', 'restrictions', 'attribution', 'scope', 'contact']) {
      expect(text).toContain(`\n[${s}]\n`);
    }
    expect(text).toContain('Last updated: 2026-01-02');
  });

  it('identity matches SITE_BRAND', () => {
    expect(text).toContain(`name: ${SITE_BRAND.name}`);
    expect(text).toContain(`url: ${getSiteBaseUrl()}\n`);
    expect(text).toContain(`description: ${SITE_BRAND.description}`);
  });

  it('excludes the robots disallow list and every skipped page', () => {
    expect(text).toContain('excluded: /api/');
    expect(text).toContain('excluded: /share/');
    for (const s of MD_SKIP) expect(text).toContain(`excluded: ${s.path.replace(/\/\*$/, '/')}`);
  });

  it('covers the restrictions', () => {
    expect(text).toMatch(/fabricate quotes/);
    expect(text).toMatch(/re-checked at the registrar/);
  });
});
