/** @jest-environment node */
import { buildRobotsTxt, ROBOTS_ALL_AGENTS } from '@/lib/robotsConfig';

const text = buildRobotsTxt();

describe('robots.txt', () => {
  it('lists the Claude and Perplexity user bots plus the existing AI bots', () => {
    for (const bot of [
      'Claude-SearchBot',
      'Claude-User',
      'Perplexity-User',
      'PerplexityBot',
      'OAI-SearchBot',
      'ChatGPT-User',
      'GPTBot',
      'ClaudeBot',
      'Google-Extended',
      'Applebot-Extended',
      'CCBot',
      'Bytespider',
    ]) {
      expect(text).toContain(`User-agent: ${bot}\n`);
    }
  });

  it('never blocks the whole site and keeps private paths disallowed for every agent', () => {
    expect(text).not.toMatch(/^Disallow: \/\s*$/m);
    const groups = text.split('\n\n').filter((g) => g.includes('User-agent:'));
    expect(groups.length).toBe(ROBOTS_ALL_AGENTS.length + 1);
    for (const g of groups) {
      expect(g).toContain('Disallow: /api/');
      expect(g).toContain('Disallow: /share/');
    }
  });

  it('has Sitemap lines, pointers and the sync comment', () => {
    expect(text).toMatch(/^Sitemap: https?:\/\/.+\/sitemap\.xml$/m);
    expect(text).toContain('/llms.txt');
    expect(text).toContain('/ai.txt');
    expect(text).toMatch(/Keep in sync/);
  });
});
