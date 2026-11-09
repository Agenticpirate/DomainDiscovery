'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Idea = { domain: string; available?: boolean };

/** Fetches live suggestions for a keyword. Static ideas on the page stay visible if this fails. */
export function LiveIdeas({ keyword }: { keyword: string }) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [state, setState] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/domains/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword, count: 12 }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        const data: unknown = await res.json();
        const list = Array.isArray(data)
          ? data.filter((d): d is Idea => typeof d?.domain === 'string')
          : [];
        setIdeas(list.slice(0, 12));
        setState('done');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setState('error');
      }
    })();
    return () => controller.abort();
  }, [keyword]);

  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6" aria-live="polite">
      <h2 className="text-lg font-bold mb-3">Live suggestions</h2>
      {state === 'loading' && (
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          Loading suggestions for “{keyword}”…
        </p>
      )}
      {state === 'error' && (
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          Live suggestions are unavailable right now. Use the sample names above or the{' '}
          <Link href="/generator" className="underline underline-offset-2">
            domain name generator
          </Link>
          .
        </p>
      )}
      {state === 'done' && ideas.length === 0 && (
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          No live suggestions found. Try the{' '}
          <Link href="/generator" className="underline underline-offset-2">
            domain name generator
          </Link>{' '}
          with your own keyword.
        </p>
      )}
      {ideas.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ideas.map((idea) => (
            <li key={idea.domain}>
              <Link
                href={`/search?q=${encodeURIComponent(idea.domain)}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black px-3 py-2 text-[13px] font-mono hover:bg-white/[0.05]"
              >
                <span className="truncate">{idea.domain}</span>
                {typeof idea.available === 'boolean' && (
                  <span className="shrink-0 text-[10px] uppercase tracking-wide text-white/50">
                    {idea.available ? 'Available' : 'Taken'}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
