/** @jest-environment node */
import { isSafeRelPath, readDataJson } from '@/lib/dataFiles';
import { getTldAboutDetail } from '@/lib/tldAboutData';

describe('readDataJson', () => {
  it('only accepts dir/name.json inside the published directories', () => {
    expect(isSafeRelPath('tld-about/ai.json')).toBe(true);
    expect(isSafeRelPath('learn-locales/fr.json')).toBe(true);
    expect(isSafeRelPath('../package.json')).toBe(false);
    expect(isSafeRelPath('tld-about/../../x.json')).toBe(false);
    expect(isSafeRelPath('other/ai.json')).toBe(false);
    expect(isSafeRelPath('tld-about/AI.json')).toBe(false);
  });

  it('reads existing files and returns null for missing ones', async () => {
    const ai = await readDataJson<{ tld: string }>('tld-about/ai.json');
    expect(ai?.tld.replace(/^\./, '')).toBe('ai');
    expect(await readDataJson('tld-about/does-not-exist-zz.json')).toBeNull();
    expect(await readDataJson('../package.json')).toBeNull();
  });

  it('backs getTldAboutDetail', async () => {
    expect((await getTldAboutDetail('com'))?.slug).toBe('com');
    expect(await getTldAboutDetail('not-a-real-tld-zz')).toBeNull();
  });
});
