'use client';

import React from 'react';
import type { AgentAutoResult } from '@/lib/agent/types';
import { DomainRankCard } from './DomainRankCard';

export function RankedResults({
  result,
  isLight,
  saved,
  onSave,
}: {
  result: AgentAutoResult;
  isLight: boolean;
  saved: Set<string>;
  onSave: (domain: string) => void;
}) {
  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-end justify-between gap-3 mb-3">
          <div>
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Shortlist
            </h2>
            <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
              {result.stats.availableCount} available of {result.stats.candidatesChecked || result.stats.candidatesGenerated} checked
              · {result.stats.durationMs}ms
              {result.stats.refineLoops ? ` · ${result.stats.refineLoops} refine` : ''}
              {result.stats.maxBudgetUsd ? ` · budget ≤ $${result.stats.maxBudgetUsd}` : ''}
              {result.stats.withinBudgetCount != null && result.stats.maxBudgetUsd
                ? ` · ${result.stats.withinBudgetCount} in budget`
                : ''}
            </p>
          </div>
        </div>
        <div className="grid gap-2.5 sm:gap-3">
          {result.shortlist.map((item) => (
            <DomainRankCard
              key={item.domain}
              item={item}
              isLight={isLight}
              onSave={onSave}
              isSaved={saved.has(item.domain)}
            />
          ))}
        </div>
      </section>

      {(result.overBudget?.length ?? 0) > 0 && (
        <section>
          <h2 className={`text-sm sm:text-base font-bold mb-2 ${isLight ? 'text-slate-800' : 'text-white/90'}`}>
            Over budget
          </h2>
          <div className="grid gap-2.5 sm:gap-3">
            {(result.overBudget ?? []).slice(0, 4).map((item) => (
              <DomainRankCard
                key={item.domain}
                item={item}
                isLight={isLight}
                onSave={onSave}
                isSaved={saved.has(item.domain)}
              />
            ))}
          </div>
        </section>
      )}

      {result.runnersUp.length > 0 && (
        <section>
          <h2 className={`text-sm sm:text-base font-bold mb-2 ${isLight ? 'text-slate-800' : 'text-white/90'}`}>
            Runners-up
          </h2>
          <div className="grid gap-2.5 sm:gap-3">
            {result.runnersUp.slice(0, 6).map((item) => (
              <DomainRankCard
                key={item.domain}
                item={item}
                isLight={isLight}
                onSave={onSave}
                isSaved={saved.has(item.domain)}
              />
            ))}
          </div>
        </section>
      )}

      {result.nextActions?.length > 0 && (
        <section
          className={`relative isolate overflow-hidden rounded-2xl border p-4 text-xs sm:text-sm ${
            isLight
              ? 'border-slate-200 bg-slate-50 text-slate-600'
              : 'border-white/10 bg-[#0a0a0c] text-white/50'
          }`}
        >
          <p className="font-bold mb-1.5">Next steps</p>
          <ul className="space-y-1">
            {result.nextActions.map((a) => (
              <li key={a}>· {a}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
