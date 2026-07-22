'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { FEATURE_FLAGS } from '@/lib/featureFlags';

type WatchEvent = 'status' | 'expiration' | 'nameservers' | 'availability';

const EVENT_OPTIONS: { id: WatchEvent; label: string; hint: string }[] = [
  { id: 'status', label: 'Status codes', hint: 'clientTransferProhibited, hold, etc.' },
  { id: 'expiration', label: 'Expiration date', hint: 'renewals / expiry shifts' },
  { id: 'nameservers', label: 'Name servers', hint: 'DNS host changes' },
  { id: 'availability', label: 'Availability', hint: 'drops / re-registers' },
];

interface DomainWatchPanelProps {
  domain: string;
}

export function DomainWatchPanel({ domain }: DomainWatchPanelProps) {
  // Soft-launch later: flip FEATURE_FLAGS.domainWatch to true.
  if (!FEATURE_FLAGS.domainWatch) {
    return null;
  }
  return <DomainWatchPanelActive domain={domain} />;
}

function DomainWatchPanelActive({ domain }: DomainWatchPanelProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [email, setEmail] = useState('');
  const [events, setEvents] = useState<WatchEvent[]>(['status', 'expiration', 'availability']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [providerNote, setProviderNote] = useState<string | null>(null);

  const toggleEvent = (id: WatchEvent) => {
    setEvents((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  };

  const subscribe = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    setProviderNote(null);
    try {
      const response = await fetch('/api/domains/watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, email, events }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        setError(payload?.error || 'Could not create watch.');
        return;
      }

      if (payload.reason === 'already_watching' && payload.watch?.confirmed) {
        setMessage(`You're already watching ${payload.watch.domain}. Events updated.`);
      } else if (payload.watch?.confirmed) {
        setMessage(`Watch active for ${payload.watch.domain}.`);
      } else {
        setMessage(
          `Confirm your free alerts — we sent a link to ${payload.watch.email}. Watches stay off until you confirm.`
        );
      }
      if (payload.email?.note) setProviderNote(payload.email.note);
    } catch {
      setError('Network error while creating the watch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-xl border p-3.5 sm:p-4 ${
        isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/10 bg-white/[0.03]'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div
            className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
              isLight ? 'text-slate-500' : 'text-white/40'
            }`}
          >
            Free domain watch
          </div>
          <h4 className={`mt-1 text-sm sm:text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Email me when {domain} changes
          </h4>
          <p className={`mt-1 text-[12px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
            Track RDAP status events for free. Confirm once by email, then get free alerts when something moves.
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
            isLight
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
          }`}
        >
          Free
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {EVENT_OPTIONS.map((opt) => {
          const on = events.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleEvent(opt.id)}
              className={`rounded-lg border px-2.5 py-2 text-left transition ${
                on
                  ? isLight
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-white bg-white text-black'
                  : isLight
                    ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    : 'border-white/10 bg-black/20 text-white/70 hover:border-white/20'
              }`}
            >
              <div className="text-[12px] font-semibold">{opt.label}</div>
              <div className={`text-[10px] mt-0.5 ${on ? (isLight ? 'text-white/60' : 'text-black/50') : isLight ? 'text-slate-400' : 'text-white/35'}`}>
                {opt.hint}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && subscribe()}
          placeholder="you@email.com"
          className={`flex-1 border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-400/20'
              : 'bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-white/30 focus:ring-white/10'
          }`}
        />
        <Button
          onClick={subscribe}
          isLoading={loading}
          disabled={!email.trim() || events.length === 0}
          className="w-full sm:w-auto"
        >
          Watch free
        </Button>
      </div>

      {error && (
        <p className={`mt-2.5 text-[12px] ${isLight ? 'text-rose-600' : 'text-rose-300'}`}>{error}</p>
      )}
      {message && (
        <p className={`mt-2.5 text-[12px] leading-relaxed ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>
          {message}
        </p>
      )}
      {providerNote && (
        <p className={`mt-1.5 text-[11px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
          {providerNote}
        </p>
      )}
    </div>
  );
}
