'use client';

import React from 'react';
import { EXAMPLE_PROMPTS } from './types';

export function ExamplePrompts({
  isLight,
  onPick,
}: {
  isLight: boolean;
  onPick: (text: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {EXAMPLE_PROMPTS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPick(p)}
          title={p}
          className={`max-w-full truncate text-left text-[12px] sm:text-xs rounded-full border px-3 py-1.5 min-h-9 sm:min-h-0 transition ${
            isLight
              ? 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
              : 'border-white/12 bg-[#111111] text-white/55 hover:border-white/25 hover:text-white/80'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
