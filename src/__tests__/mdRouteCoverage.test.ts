/** @jest-environment node */
import fs from 'fs';
import path from 'path';
import { getRegisteredPatterns } from '@/lib/md/registry';
import { MD_SKIP } from '@/lib/md/routes';

const APP_DIR = path.join(process.cwd(), 'src', 'app');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name === 'page.tsx') out.push(full);
  }
  return out;
}

/** src/app/blog/tlds/[slug]/page.tsx → /blog/tlds/[slug] */
function routeOf(file: string): string {
  const rel = path.relative(APP_DIR, path.dirname(file)).split(path.sep);
  const segments = rel.filter((s) => s && !/^\(.*\)$/.test(s));
  return `/${segments.join('/')}`;
}

function isSkipped(route: string): boolean {
  return MD_SKIP.some((s) => (s.path.endsWith('/*') ? route === s.path.slice(0, -2) || route.startsWith(`${s.path.slice(0, -1)}`) : route === s.path));
}

describe('markdown route coverage', () => {
  const routes = walk(APP_DIR).map(routeOf);
  const registered = new Set(getRegisteredPatterns());

  it('finds the page routes', () => {
    expect(routes.length).toBeGreaterThan(30);
  });

  it('gives every skip entry a reason', () => {
    for (const skip of MD_SKIP) expect(skip.reason.trim().length).toBeGreaterThan(5);
  });

  it('has a renderer or a skip entry for every page route', () => {
    const missing = routes.filter((route) => !registered.has(route) && !isSkipped(route));
    expect(missing).toEqual([]);
  });

  it('does not register a skipped route', () => {
    const both = routes.filter((route) => registered.has(route) && isSkipped(route));
    expect(both).toEqual([]);
  });
});
