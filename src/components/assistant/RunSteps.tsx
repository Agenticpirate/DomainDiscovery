'use client';

import React from 'react';
import type { AgentJobStep } from '@/lib/agent/types';

export function RunSteps({ steps, isLight }: { steps: AgentJobStep[]; isLight: boolean }) {
  if (!steps.length) return null;
  return (
    <ol className="space-y-2">
      {steps.map((s) => {
        const tone =
          s.status === 'done'
            ? isLight
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-emerald-500/30 bg-[#0c1410] text-emerald-200'
            : s.status === 'running'
              ? isLight
                ? 'border-slate-300 bg-white text-slate-800'
                : 'border-white/20 bg-[#0a0a0c] text-white'
              : s.status === 'error'
                ? isLight
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-rose-500/30 bg-[#140a0c] text-rose-200'
                : isLight
                  ? 'border-slate-200 bg-slate-50 text-slate-500'
                  : 'border-white/10 bg-[#0a0a0c] text-white/40';
        return (
          <li
            key={`${s.id}-${s.status}-${s.at}`}
            className={`relative isolate rounded-xl border px-3 py-2 text-xs sm:text-sm ${tone}`}
          >
            <div className="font-semibold flex items-center gap-2">
              <span className="uppercase tracking-wide text-[10px] opacity-70">{s.status}</span>
              {s.label}
            </div>
            {s.detail && <p className="mt-0.5 opacity-80">{s.detail}</p>}
          </li>
        );
      })}
    </ol>
  );
}
