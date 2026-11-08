'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/** Reads ?domain= (and optional extra params), fetches the API, keeps the URL in sync. */
export function useDomainTool<T>(apiPath: string, extraKeys: string[] = []) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const domain = params.get('domain') || '';
  const extra = extraKeys.map((k) => params.get(k) || '').join('|');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!domain) return;
    const controller = new AbortController();
    const query = new URLSearchParams({ domain });
    extraKeys.forEach((k) => {
      const v = params.get(k);
      if (v) query.set(k, v);
    });
    setLoading(true);
    setError(null);
    fetch(`${apiPath}?${query.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok || !body || body.success === false) {
          throw new Error((body && (body.error?.message || body.error)) || 'Lookup failed. Please try again.');
        }
        setData(body as T);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setData(null);
        setError(err instanceof Error ? err.message : 'Lookup failed. Please try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath, domain, extra]);

  const submit = useCallback(
    (nextDomain: string, nextExtra: Record<string, string> = {}) => {
      const q = new URLSearchParams({ domain: nextDomain, ...nextExtra });
      router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    },
    [router, pathname]
  );

  return { domain, data, error, loading, submit, params };
}
