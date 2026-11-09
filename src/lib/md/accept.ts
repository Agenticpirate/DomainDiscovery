/**
 * Accept-header negotiation for Markdown. Markdown is served only when the client ranks
 * text/markdown strictly above every way of asking for HTML. A missing header or a bare
 * wildcard always gets HTML.
 */

type Range = { type: string; q: number };

function parseAccept(accept: string): Range[] {
  const ranges: Range[] = [];
  for (const part of accept.split(',')) {
    const [rawType, ...params] = part.split(';');
    const type = rawType.trim().toLowerCase();
    if (!type) continue;
    let q = 1;
    for (const param of params) {
      const [key, value] = param.split('=').map((s) => s.trim());
      if (key?.toLowerCase() === 'q') {
        const parsed = Number.parseFloat(value ?? '');
        q = Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0;
      }
    }
    ranges.push({ type, q });
  }
  return ranges;
}

/** The q a client gives a type: the most specific matching range wins (RFC 9110). */
function qFor(ranges: Range[], type: string): number {
  const [major] = type.split('/');
  const exact = ranges.find((r) => r.type === type);
  if (exact) return exact.q;
  const partial = ranges.find((r) => r.type === `${major}/*`);
  if (partial) return partial.q;
  const any = ranges.find((r) => r.type === '*/*');
  return any ? any.q : 0;
}

export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false;
  const ranges = parseAccept(accept);
  // Markdown must be asked for by name; wildcards never opt a client into it.
  const markdown = ranges.find((r) => r.type === 'text/markdown');
  if (!markdown || markdown.q <= 0) return false;
  return markdown.q > qFor(ranges, 'text/html');
}
