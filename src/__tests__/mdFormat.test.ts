/** @jest-environment node */
import { abs, escapeMd, faqBlock, fmtDate, link, listItem, page, table } from '@/lib/md/format';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

const base = getSiteBaseUrl();

describe('md format helpers', () => {
  it('makes absolute HTML URLs and strips .md', () => {
    expect(abs('/search')).toBe(`${base}/search`);
    expect(abs('/search.md')).toBe(`${base}/search`);
    expect(abs('/index.md')).toBe(`${base}/`);
    expect(abs('https://example.com/a')).toBe('https://example.com/a');
    expect(abs('/search?q=a.md')).toBe(`${base}/search?q=a.md`);
  });

  it('escapes link text and table cells', () => {
    expect(escapeMd('a [b] | c')).toBe('a \\[b\\] \\| c');
    expect(link('A [x]', '/p')).toBe(`[A \\[x\\]](${base}/p)`);
    expect(table(['A', 'B|'], [['1', 'x | y']])).toBe('| A | B\\| |\n| --- | --- |\n| 1 | x \\| y |');
  });

  it('formats list items and FAQ blocks', () => {
    expect(listItem('Title', '/t', 'Some  text')).toBe(`- [Title](${base}/t) - Some text`);
    expect(faqBlock([{ question: 'Q?', answer: 'A.' }])).toBe('### Q?\n\nA.');
  });

  it('formats dates and rejects bad ones', () => {
    expect(fmtDate('2026-07-22')).toBe('2026-07-22');
    expect(fmtDate('nope')).toBeNull();
    expect(fmtDate(undefined)).toBeNull();
  });

  it('builds the page layout and omits an unknown date', () => {
    const out = page({
      title: 'T',
      summary: 'S.',
      path: '/x',
      body: '## Body\n\ntext',
      related: [{ text: 'R', href: '/r.md' }],
    });
    expect(out).toBe(
      `# T\n\n> S.\n\nCanonical: ${base}/x\n\n## Body\n\ntext\n\n## Related\n\n- [R](${base}/r)\n`
    );
    expect(page({ title: 'T', summary: 'S', path: '/x', body: 'b', updated: '2026-01-02' })).toContain(
      'Last updated: 2026-01-02'
    );
  });
});
