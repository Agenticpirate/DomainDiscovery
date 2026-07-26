'use client';

/**
 * In-app Porkbun-first register flow (also supports other wired adapters).
 * Keys stay in sessionStorage only. Always dry-run before live confirm.
 */

import React from 'react';

const STORAGE_KEY = 'ada_registrar_byok_v1';

type ProviderId = 'porkbun' | 'namecheap' | 'cloudflare' | 'namesilo' | 'dynadot';

type StoredByok = {
  provider: ProviderId;
  apiKey: string;
  secret?: string;
  accountId?: string;
  clientIp?: string;
  username?: string;
  maxBudgetUsd?: string;
};

const PROVIDERS: { id: ProviderId; label: string; needsSecret?: boolean; needsAccount?: boolean; needsClientIp?: boolean }[] = [
  { id: 'porkbun', label: 'Porkbun (recommended)', needsSecret: true },
  { id: 'namesilo', label: 'NameSilo' },
  { id: 'dynadot', label: 'Dynadot' },
  { id: 'namecheap', label: 'Namecheap', needsSecret: false, needsClientIp: true },
  { id: 'cloudflare', label: 'Cloudflare', needsAccount: true },
];

function loadByok(): StoredByok | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredByok;
  } catch {
    return null;
  }
}

function saveByok(b: StoredByok) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(b));
  } catch {
    /* ignore */
  }
}

function clearByok() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function AdaRegisterPanel({
  domain,
  isLight,
  defaultBudget = 25,
}: {
  domain: string;
  isLight: boolean;
  defaultBudget?: number;
}) {
  const [open, setOpen] = React.useState(false);
  const [provider, setProvider] = React.useState<ProviderId>('porkbun');
  const [apiKey, setApiKey] = React.useState('');
  const [secret, setSecret] = React.useState('');
  const [accountId, setAccountId] = React.useState('');
  const [clientIp, setClientIp] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [maxBudgetUsd, setMaxBudgetUsd] = React.useState(String(defaultBudget));
  const [confirmText, setConfirmText] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [log, setLog] = React.useState<string | null>(null);
  const [lastDryOk, setLastDryOk] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const meta = PROVIDERS.find((p) => p.id === provider)!;
  const ink = isLight ? 'text-slate-900' : 'text-white';
  const muted = isLight ? 'text-slate-600' : 'text-white/55';
  const border = isLight ? 'border-slate-200' : 'border-white/12';
  const inputCls = `w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none ${border} ${
    isLight ? 'bg-white text-slate-900' : 'bg-[#121214] text-white'
  }`;

  React.useEffect(() => {
    const s = loadByok();
    if (!s) return;
    setProvider(s.provider);
    setApiKey(s.apiKey);
    setSecret(s.secret || '');
    setAccountId(s.accountId || '');
    setClientIp(s.clientIp || '');
    setUsername(s.username || '');
    if (s.maxBudgetUsd) setMaxBudgetUsd(s.maxBudgetUsd);
  }, []);

  const persist = () => {
    saveByok({
      provider,
      apiKey,
      secret: secret || undefined,
      accountId: accountId || undefined,
      clientIp: clientIp || undefined,
      username: username || undefined,
      maxBudgetUsd,
    });
  };

  async function run(dryRun: boolean) {
    setBusy(true);
    setError(null);
    setLog(null);
    persist();

    if (!apiKey.trim()) {
      setError('API key required (stored only in this browser session).');
      setBusy(false);
      return;
    }
    if (!dryRun && confirmText.trim().toLowerCase() !== domain.toLowerCase()) {
      setError(`Type the domain exactly (${domain}) to confirm live registration.`);
      setBusy(false);
      return;
    }

    try {
      const res = await fetch('/api/agent/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          domain,
          dryRun,
          maxBudgetUsd: Number(maxBudgetUsd) || undefined,
          humanConfirmToken: dryRun ? undefined : `ui-confirm-${Date.now()}`,
          byok: {
            registrar: {
              provider,
              apiKey: apiKey.trim(),
              secret: secret.trim() || undefined,
              accountId: accountId.trim() || undefined,
              clientIp: clientIp.trim() || undefined,
              username: username.trim() || undefined,
              humanConfirmToken: dryRun ? undefined : `ui-confirm-${Date.now()}`,
            },
            maxBudgetUsd: Number(maxBudgetUsd) || undefined,
          },
        }),
      });
      const data = await res.json();
      const r = data.result || data;
      if (!res.ok || data.success === false || r.ok === false) {
        setLastDryOk(false);
        setError(r.message || data.error || `HTTP ${res.status}`);
        setLog(JSON.stringify(r, null, 2).slice(0, 1200));
      } else {
        if (dryRun) setLastDryOk(true);
        setLog(
          [
            r.message,
            r.priceUsd != null ? `Quoted: ~$${r.priceUsd}` : null,
            r.next ? `Next: ${(r.next as string[]).join(' · ')}` : null,
          ]
            .filter(Boolean)
            .join('\n')
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
      setLastDryOk(false);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${border} ${
          isLight
            ? 'bg-white text-slate-800 hover:border-slate-300'
            : 'bg-[#121214] text-white/80 hover:border-white/25'
        }`}
      >
        Register (BYOK)
      </button>
    );
  }

  return (
    <div
      className={`mt-3 w-full rounded-xl border p-3 space-y-2 ${border}`}
      style={{ backgroundColor: isLight ? '#f8fafc' : '#121214' }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={`text-[11px] font-black ${ink}`}>Register {domain}</p>
        <button type="button" onClick={() => setOpen(false)} className={`text-[10px] font-bold ${muted}`}>
          Close
        </button>
      </div>
      <p className={`text-[10px] leading-snug ${muted}`}>
        Uses <strong>your</strong> registrar API keys (session only). Always dry-run first. Live register needs
        server flag <code className="font-mono">ADA_ENABLE_REGISTRAR_MUTATIONS=true</code> and typing the domain
        to confirm.
      </p>

      <label className={`block text-[10px] font-bold ${muted}`}>
        Registrar
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as ProviderId)}
          className={`${inputCls} mt-0.5`}
        >
          {PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <label className={`block text-[10px] font-bold ${muted}`}>
        API key
        <input
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className={`${inputCls} mt-0.5 font-mono`}
          placeholder="pk1_… / API key"
        />
      </label>

      {meta.needsSecret && (
        <label className={`block text-[10px] font-bold ${muted}`}>
          Secret key
          <input
            type="password"
            autoComplete="off"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className={`${inputCls} mt-0.5 font-mono`}
            placeholder="sk1_…"
          />
        </label>
      )}

      {meta.needsAccount && (
        <label className={`block text-[10px] font-bold ${muted}`}>
          Cloudflare account id
          <input
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className={`${inputCls} mt-0.5 font-mono`}
          />
        </label>
      )}

      {meta.needsClientIp && (
        <>
          <label className={`block text-[10px] font-bold ${muted}`}>
            Client IP (whitelist)
            <input
              value={clientIp}
              onChange={(e) => setClientIp(e.target.value)}
              className={`${inputCls} mt-0.5 font-mono`}
              placeholder="your public IP"
            />
          </label>
          <label className={`block text-[10px] font-bold ${muted}`}>
            API username (optional)
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`${inputCls} mt-0.5 font-mono`}
            />
          </label>
        </>
      )}

      <label className={`block text-[10px] font-bold ${muted}`}>
        Max budget USD
        <input
          type="number"
          min={1}
          value={maxBudgetUsd}
          onChange={(e) => setMaxBudgetUsd(e.target.value)}
          className={`${inputCls} mt-0.5 w-28`}
        />
      </label>

      {lastDryOk && (
        <label className={`block text-[10px] font-bold ${muted}`}>
          Type <span className="font-mono">{domain}</span> to confirm live register
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className={`${inputCls} mt-0.5 font-mono`}
            placeholder={domain}
          />
        </label>
      )}

      <div className="flex flex-wrap gap-1.5 pt-1">
        <button
          type="button"
          disabled={busy}
          onClick={() => run(true)}
          className={`rounded-lg px-3 py-1.5 text-[11px] font-bold disabled:opacity-40 ${
            isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
          }`}
        >
          {busy ? '…' : '1. Dry run'}
        </button>
        <button
          type="button"
          disabled={busy || !lastDryOk}
          onClick={() => run(false)}
          className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold disabled:opacity-40 ${border} ${ink}`}
        >
          2. Register live
        </button>
        <button
          type="button"
          onClick={() => {
            clearByok();
            setApiKey('');
            setSecret('');
            setLastDryOk(false);
            setLog(null);
          }}
          className={`rounded-lg px-2 py-1.5 text-[10px] font-semibold ${muted}`}
        >
          Clear keys
        </button>
      </div>

      {error && <p className="text-[11px] font-semibold text-rose-400 whitespace-pre-wrap">{error}</p>}
      {log && (
        <pre
          className={`text-[10px] font-mono whitespace-pre-wrap rounded-lg border p-2 max-h-40 overflow-auto ${border} ${muted}`}
        >
          {log}
        </pre>
      )}
    </div>
  );
}
