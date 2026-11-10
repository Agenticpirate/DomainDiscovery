/**
 * Pages that were removed. Anyone with an old link, bookmark or search result lands on the
 * closest live page instead of a 404. Kept tiny: middleware imports it.
 *
 * `/tools/domain-age` was folded into the WHOIS lookup, which already shows registration age
 * and expiry. Language-prefixed and `.md` addresses are covered too.
 */
const RETIRED: Record<string, string> = {
  '/tools/domain-age': '/tools/whois',
};

const LOCALE_PREFIX = /^\/(?:zh|de|es|ja|fr|pt|hi|ar|ru|bn|ur)(?=\/)/;

/** The replacement path for a removed page (keeping language prefix, `.md` and trailing slash), or null. */
export function retiredPageTarget(pathname: string): string | null {
  const prefix = pathname.match(LOCALE_PREFIX)?.[0] ?? '';
  let rest = pathname.slice(prefix.length);
  const md = rest.endsWith('.md');
  if (md) rest = rest.slice(0, -3);
  if (rest.length > 1 && rest.endsWith('/')) rest = rest.slice(0, -1);
  const target = RETIRED[rest];
  return target ? `${prefix}${target}${md ? '.md' : ''}` : null;
}
