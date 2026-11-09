/** @jest-environment node */
import { buildLlmsTxt, LLMS_TOP_GUIDES } from '@/lib/llmsMarkdown';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

const base = getSiteBaseUrl();
const text = buildLlmsTxt();

describe('llms.txt', () => {
  it('starts with the H1 and a blockquote', () => {
    expect(text.split('\n')[0]).toBe('# DomainDiscovery');
    expect(text).toMatch(/\n> .+/);
  });

  it('has every required section', () => {
    for (const h of [
      'Core pages',
      'Tools',
      'Guides',
      'TLD pages',
      'Alternatives',
      'Industry ideas',
      'Machine-readable',
      'Optional',
    ]) {
      expect(text).toContain(`\n## ${h}\n`);
    }
  });

  it('links are absolute and end in .md or a machine-readable file', () => {
    const urls = Array.from(text.matchAll(/\]\((https?:[^)]+)\)/g)).map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(50);
    for (const url of urls) {
      expect(url.startsWith(base)).toBe(true);
      expect(url).toMatch(/\.(md|txt|xml)$|\/api\/md\/_catalog$/);
    }
  });

  it('caps the guide list and points at the rest', () => {
    const guides = text.split('\n## Guides\n')[1].split('\n## ')[0];
    const items = guides.split('\n').filter((l) => l.startsWith('- '));
    expect(items.length).toBeLessThanOrEqual(LLMS_TOP_GUIDES + 1);
    expect(guides).toContain(`${base}/learn.md`);
  });

  it('keeps the sync comment out of the first line', () => {
    expect(text).toContain('Keep in sync with');
  });
});
