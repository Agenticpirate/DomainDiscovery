'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';
import { DomainWatchPanel } from '@/components/domain/DomainWatchPanel';
import { WhoisShareCard } from '@/components/domain/WhoisShareCard';
import { FEATURE_FLAGS } from '@/lib/featureFlags';

interface WHOISData {
  domain: string;
  registrar: string;
  registrarIanaId?: string | null;
  registrarUrl?: string | null;
  status: string;
  statuses?: string[];
  registrationDate: string | null;
  updatedDate?: string | null;
  expirationDate: string | null;
  nameServers: string[];
  dnssec?: boolean;
  registrant?: {
    name?: string | null;
    organization?: string | null;
    country?: string | null;
    email?: string | null;
    role?: string | null;
  };
  source?: string;
  available?: boolean;
  latencyMs?: number;
  server?: string;
}

interface WHOISLookupProps {
  domain?: string;
}

const CLIENT_CACHE_KEY = 'whois_cache_v1';
const CLIENT_CACHE_TTL = 15 * 60 * 1000;

function normalizeInput(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split('?')[0]
    .replace(/\.$/, '');
}

function readClientCache(domain: string): WHOISData | null {
  try {
    const raw = sessionStorage.getItem(CLIENT_CACHE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, { expires: number; data: WHOISData }>;
    const hit = map[domain];
    if (!hit || hit.expires < Date.now()) return null;
    return { ...hit.data, latencyMs: 0, server: `${hit.data.server || 'cache'} (browser cache)` };
  } catch {
    return null;
  }
}

function writeClientCache(domain: string, data: WHOISData) {
  try {
    const raw = sessionStorage.getItem(CLIENT_CACHE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, { expires: number; data: WHOISData }>) : {};
    map[domain] = { expires: Date.now() + CLIENT_CACHE_TTL, data };
    // keep last 40
    const keys = Object.keys(map);
    if (keys.length > 40) {
      keys
        .sort((a, b) => (map[a].expires || 0) - (map[b].expires || 0))
        .slice(0, keys.length - 40)
        .forEach((k) => delete map[k]);
    }
    sessionStorage.setItem(CLIENT_CACHE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
}

export function WHOISLookup({ domain: initialDomain }: WHOISLookupProps) {
  const [domain, setDomain] = useState(initialDomain || '');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<WHOISData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lookedUp, setLookedUp] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleLookup = useCallback(async (override?: string) => {
    const query = normalizeInput(override ?? domain);
    if (!query) {
      setError('Enter a domain name to look up.');
      setData(null);
      return;
    }

    // Instant browser cache hit
    const cached = readClientCache(query);
    if (cached && !cached.available) {
      setError(null);
      setData(cached);
      setLookedUp(true);
      setIsLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);
    setData(null);
    setLookedUp(false);

    const t0 = performance.now();

    try {
      const response = await fetch(`/api/domains/whois?domain=${encodeURIComponent(query)}`, {
        cache: 'default',
        signal: controller.signal,
      });
      const payload = await response.json();
      const clientMs = Math.round(performance.now() - t0);

      if (!response.ok || !payload?.success) {
        if (response.status === 404) {
          setError(
            payload?.error ||
              `"${query}" was not found. It may be available to register, or this TLD has no public RDAP data.`
          );
          setData({
            domain: query,
            registrar: '—',
            status: 'Not registered / not in RDAP',
            registrationDate: null,
            expirationDate: null,
            nameServers: [],
            available: true,
            source: 'RDAP',
            latencyMs: payload?.latencyMs ?? clientMs,
          });
        } else {
          setError(payload?.error || 'WHOIS lookup failed. Try again in a moment.');
        }
        setLookedUp(true);
        return;
      }

      const next: WHOISData = {
        domain: payload.domain,
        registrar: payload.registrar,
        registrarIanaId: payload.registrarIanaId,
        registrarUrl: payload.registrarUrl,
        status: payload.status,
        statuses: payload.statuses,
        registrationDate: payload.registrationDate,
        updatedDate: payload.updatedDate,
        expirationDate: payload.expirationDate,
        nameServers: payload.nameServers || [],
        dnssec: payload.dnssec,
        registrant: payload.registrant,
        source: payload.source || 'RDAP',
        latencyMs: payload.latencyMs ?? clientMs,
        server: payload.server,
      };
      setData(next);
      writeClientCache(query, next);
      setLookedUp(true);
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      setError('Network error while contacting the WHOIS service.');
      setLookedUp(true);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [domain]);

  // Auto-lookup when opened with a domain prop
  useEffect(() => {
    if (initialDomain?.trim()) {
      void handleLookup(initialDomain);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDomain]);

  const fieldShell = isLight
    ? 'bg-white border-slate-200 hover:border-slate-300'
    : 'bg-white/[0.02] border-white/10 hover:border-white/20';

  const labelClass = `text-[10px] font-bold uppercase tracking-widest ${
    isLight ? 'text-slate-500' : 'text-white/40'
  } mb-1`;

  return (
    <div
      className={`rounded-2xl border p-3.5 sm:p-5 ${
        isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-white/10 bg-[#0c0c0e]'
      }`}
    >
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`p-2 rounded-lg border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
            }`}
          >
            <Icons.Info />
          </div>
          <div>
            <h3 className="text-lg font-bold">WHOIS Lookup</h3>
            <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
              Instant RDAP from registry servers · free · no API key
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-3">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleLookup()}
          placeholder="example.com"
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          className={`flex-1 border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 transition-all ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-400/20'
              : 'bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-white/30 focus:ring-white/10'
          }`}
        />
        <Button onClick={() => handleLookup()} isLoading={isLoading} className="w-full sm:w-auto">
          Lookup
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {['google.com', 'openai.com', 'github.com', 'example.org'].map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => {
              setDomain(sample);
              void handleLookup(sample);
            }}
            className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition ${
              isLight
                ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                : 'border-white/10 bg-white/[0.03] text-white/55 hover:text-white hover:border-white/20'
            }`}
          >
            {sample}
          </button>
        ))}
      </div>

      {isLoading && (
        <div
          className={`mb-4 rounded-xl border px-3.5 py-3 text-sm flex items-center gap-2 ${
            isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-white/10 bg-white/[0.03] text-white/55'
          }`}
        >
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Querying registry RDAP…
        </div>
      )}

      {error && (
        <div
          className={`mb-4 rounded-xl border px-3.5 py-3 text-sm ${
            isLight
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : 'border-amber-500/20 bg-amber-500/10 text-amber-100'
          }`}
        >
          {error}
        </div>
      )}

      {data && lookedUp && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-base font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {data.domain}
            </span>
            {typeof data.latencyMs === 'number' && (
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                  data.latencyMs < 400
                    ? isLight
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
                    : isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-600'
                      : 'border-white/10 bg-white/[0.04] text-white/50'
                }`}
              >
                {data.latencyMs === 0 ? 'cached' : `${data.latencyMs} ms`}
              </span>
            )}
            {data.source && (
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  isLight
                    ? 'border-slate-200 bg-slate-50 text-slate-600'
                    : 'border-white/10 bg-white/[0.04] text-white/50'
                }`}
              >
                RDAP
              </span>
            )}
            {typeof data.dnssec === 'boolean' && (
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  data.dnssec
                    ? isLight
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
                    : isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-500'
                      : 'border-white/10 bg-white/[0.03] text-white/40'
                }`}
              >
                DNSSEC {data.dnssec ? 'signed' : 'unsigned'}
              </span>
            )}
          </div>

          <div className={`p-3.5 sm:p-4 rounded-xl border ${fieldShell}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <div className={labelClass}>Registrar</div>
                <div className="text-sm font-semibold break-words">
                  {data.registrar}
                  {data.registrarIanaId ? (
                    <span className={`ml-1.5 text-[11px] font-medium ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                      IANA {data.registrarIanaId}
                    </span>
                  ) : null}
                </div>
              </div>
              <div>
                <div className={labelClass}>Status</div>
                <div className="text-sm font-semibold break-words capitalize">{data.status}</div>
              </div>
              <div>
                <div className={labelClass}>Registered</div>
                <div className="text-sm font-semibold">{data.registrationDate || '—'}</div>
              </div>
              <div>
                <div className={labelClass}>Expires</div>
                <div className="text-sm font-semibold">{data.expirationDate || '—'}</div>
              </div>
              {data.updatedDate && (
                <div>
                  <div className={labelClass}>Last updated</div>
                  <div className="text-sm font-semibold">{data.updatedDate}</div>
                </div>
              )}
              {data.registrant?.organization && (
                <div>
                  <div className={labelClass}>Registrant</div>
                  <div className="text-sm font-semibold break-words">
                    {data.registrant.organization}
                    {data.registrant.country ? ` · ${data.registrant.country}` : ''}
                  </div>
                </div>
              )}
            </div>
          </div>

          {data.statuses && data.statuses.length > 1 && (
            <div className={`p-3.5 sm:p-4 rounded-xl border ${fieldShell}`}>
              <div className={labelClass}>All statuses</div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {data.statuses.map((status) => (
                  <span
                    key={status}
                    className={`rounded-md px-2 py-1 text-[11px] font-medium capitalize ${
                      isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/[0.05] text-white/65'
                    }`}
                  >
                    {status}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={`p-3.5 sm:p-4 rounded-xl border ${fieldShell}`}>
            <div className={labelClass}>Name servers</div>
            {data.nameServers.length === 0 ? (
              <div className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/45'}`}>None listed</div>
            ) : (
              <div className="space-y-1 mt-1">
                {data.nameServers.map((ns) => (
                  <div
                    key={ns}
                    className={`text-sm font-mono break-all ${isLight ? 'text-slate-600' : 'text-white/60'}`}
                  >
                    {ns}
                  </div>
                ))}
              </div>
            )}
          </div>

          {FEATURE_FLAGS.domainWatch ? <DomainWatchPanel domain={data.domain} /> : null}

          <WhoisShareCard
            data={{
              domain: data.domain,
              registrar: data.registrar,
              status: data.status,
              statuses: data.statuses,
              registrationDate: data.registrationDate,
              expirationDate: data.expirationDate,
              updatedDate: data.updatedDate,
              nameServers: data.nameServers,
              dnssec: data.dnssec,
              registrant: data.registrant,
              source: data.source,
              available: data.available,
            }}
          />

          <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
            Free public RDAP via IANA bootstrap → registry operators (Verisign, PIR, Identity Digital, Nominet, …).
            No paid WHOIS API. Contact fields are often redacted for privacy.
            {data.server ? ` Server: ${data.server.replace(/^https?:\/\//, '').split('/')[0]}` : ''}
          </p>
        </div>
      )}
    </div>
  );
}
