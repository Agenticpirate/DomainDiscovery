/**
 * Setup verification test
 * This test verifies that Jest is properly configured with TypeScript support
 */

describe('Jest Configuration', () => {
  it('should run TypeScript tests', () => {
    const add = (a: number, b: number): number => a + b;
    expect(add(1, 2)).toBe(3);
  });

  it('should support Jest matchers', () => {
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
    expect([1, 2, 3]).toHaveLength(3);
    expect({ name: 'test' }).toHaveProperty('name');
  });

  it('should support async/await', async () => {
    const asyncFn = async (): Promise<string> => {
      return Promise.resolve('success');
    };
    const result = await asyncFn();
    expect(result).toBe('success');
  });
});

describe('fast-check Integration', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fc = require('fast-check');

  it('should run property-based tests with fast-check', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a: number, b: number) => {
        // Commutative property of addition
        return a + b === b + a;
      }),
      { numRuns: 100 }
    );
  });

  it('should generate arbitrary strings', () => {
    fc.assert(
      fc.property(fc.string(), (s: string) => {
        // String length is always non-negative
        return s.length >= 0;
      }),
      { numRuns: 100 }
    );
  });
});
