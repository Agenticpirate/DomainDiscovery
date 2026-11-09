/** @jest-environment node */
import { prefersMarkdown } from '@/lib/md/accept';

describe('prefersMarkdown', () => {
  it.each([
    ['text/markdown'],
    ['text/markdown, text/html;q=0.9'],
    ['text/markdown;q=0.9, text/html;q=0.5'],
    ['text/markdown, */*;q=0.1'],
  ])('is true for %s', (accept) => {
    expect(prefersMarkdown(accept)).toBe(true);
  });

  it.each([
    [null],
    [undefined],
    [''],
    ['*/*'],
    ['text/*'],
    ['text/html'],
    ['text/html;q=0.9, text/markdown;q=0.8'],
    ['text/markdown;q=0'],
    ['text/markdown, text/html'],
    ['text/markdown;q=0.5, text/html;q=0.5'],
    ['text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'],
  ])('is false for %s', (accept) => {
    expect(prefersMarkdown(accept)).toBe(false);
  });

  it('ignores a malformed q-value', () => {
    expect(prefersMarkdown('text/markdown;q=abc')).toBe(false);
  });
});
