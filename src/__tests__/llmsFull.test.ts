/** @jest-environment node */
import { buildLlmsFullTxt, LLMS_FULL_MAX_CHARS } from '@/lib/llmsMarkdown';

describe('llms-full.txt', () => {
  it('uses the spec layout and stays under the size budget', async () => {
    const text = await buildLlmsFullTxt();
    expect(text.startsWith('# DomainDiscovery - full content\n')).toBe(true);
    expect(text).toMatch(/\nGenerated: \d{4}-\d{2}-\d{2}\n/);
    expect(text).toMatch(/\n---\n<!-- source: https?:\/\/[^ ]+ -->\n# /);
    expect(text.length).toBeLessThan(LLMS_FULL_MAX_CHARS);
  });

  it('states the limits and where the rest lives', async () => {
    const text = await buildLlmsFullTxt();
    expect(text).toMatch(/This file holds \d+ of \d+ guides and \d+ of \d+ TLD pages/);
    expect(text).toContain('/api/md/_catalog');
  });
});
