'use client';

import React from 'react';
import type { RankedDomain } from '@/lib/agent/types';
import { getPrimaryRegisterAffiliateUrl } from '@/lib/registrars';
import { AdaRegisterPanel } from '@/components/ada/AdaRegisterPanel';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

function statusMeta(r: RankedDomain, isLight: boolean) {
  if (r.available === true) {
    return {
      label: 'Available',
      className: isLight
        ? 'bg-emerald-100 text-emerald-800'
        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30',
    };
  }
  if (r.premium) {
    return {
      label: 'Premium',
      className: isLight
        ? 'bg-amber-100 text-amber-900'
        : 'bg-amber-950 text-amber-200 border border-amber-500/30',
    };
  }
  if (r.available === false) {
    return {
      label: 'Taken',
      className: isLight
        ? 'bg-rose-100 text-rose-800'
        : 'bg-rose-950 text-rose-300 border border-rose-500/30',
    };
  }
  return {
    label: 'Unchecked',
    className: isLight
      ? 'bg-slate-100 text-slate-600'
      : 'bg-[#121214] text-white/50 border border-white/10',
  };
}

export function DomainRankCard({
  item,
  isLight,
  onSave,
  isSaved,
}: {
  item: RankedDomain;
  isLight: boolean;
  onSave: (domain: string) => void;
  isSaved: boolean;
}) {
  const st = statusMeta(item, isLight);
  // Full Spaceship Impact affiliate URL (required for commissions)
  const buyHref = getPrimaryRegisterAffiliateUrl(item.domain);
  // Absolute DD host so WHOIS works from aidomainassistant.com (ADA middleware rewrites relative /tools/*)
  const whoisHref = `${getSiteBaseUrl()}/tools/whois?domain=${encodeURIComponent(item.domain)}`;
  const budgetPill =
    item.budgetStatus === 'within'
      ? {
          label: 'In budget',
          className: isLight
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30',
        }
      : item.budgetStatus === 'over'
        ? {
            label: 'Over budget',
            className: isLight
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-rose-950 text-rose-300 border border-rose-500/30',
          }
        : item.budgetStatus === 'unknown'
          ? {
              label: 'Price ?',
              className: isLight
                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                : 'bg-[#121214] text-white/45 border border-white/10',
            }
          : null;

  return (
    <article
      className={`shine-border relative isolate overflow-hidden rounded-2xl border p-3.5 sm:p-4 ${
        isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-white/10 bg-[#0a0a0c]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`font-mono text-sm sm:text-base font-bold truncate ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {item.domain}
            </h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st.className}`}>
              {st.label}
            </span>
            {budgetPill && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${budgetPill.className}`}>
                {budgetPill.label}
              </span>
            )}
          </div>
          <p className={`mt-1 text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
            Score <span className="font-bold">{item.score}</span>
            {item.priceHint ? ` · ${item.priceHint}` : ''}
            {item.priceUsd != null ? ` · ~$${item.priceUsd}` : ''}
          </p>
        </div>
        <div
          className={`shrink-0 rounded-xl px-2.5 py-1.5 text-center ${
            isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wide opacity-70">Score</div>
          <div className="text-lg font-black leading-none">{item.score}</div>
        </div>
      </div>

      <ul className={`mt-2.5 space-y-1 text-[12px] sm:text-[13px] ${isLight ? 'text-slate-600' : 'text-white/55'}`}>
        {item.reasons.slice(0, 3).map((r) => (
          <li key={r}>· {r}</li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={buyHref}
          target="_blank"
          rel="sponsored noopener noreferrer"
          data-affiliate="spaceship"
          data-placement="assistant-continue"
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            isLight
              ? 'bg-slate-900 text-white hover:bg-slate-800'
              : 'bg-white text-black hover:bg-white/90'
          }`}
        >
          Continue
        </a>
        <a
          href={whoisHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
            isLight
              ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              : 'border-white/15 bg-[#121214] text-white/75 hover:border-white/30'
          }`}
        >
          WHOIS
        </a>
        <button
          type="button"
          onClick={() => onSave(item.domain)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
            isSaved
              ? isLight
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-emerald-500/40 bg-emerald-950 text-emerald-200'
              : isLight
                ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                : 'border-white/15 bg-[#121214] text-white/75 hover:border-white/30'
          }`}
        >
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
      {item.available === true && !item.premium && (
        <div className="mt-2">
          <AdaRegisterPanel domain={item.domain} isLight={isLight} />
        </div>
      )}
    </article>
  );
}
