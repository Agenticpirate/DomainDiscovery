'use client';

import React from 'react';
import Link from 'next/link';
import { AGENT_DISCLAIMER } from '@/lib/agent/types';

export function AssistantDisclaimer({ isLight }: { isLight: boolean }) {
  return (
    <div
      className={`relative isolate overflow-hidden rounded-2xl border p-4 text-xs sm:text-sm leading-relaxed ${
        isLight
          ? 'border-slate-200 bg-slate-50 text-slate-600'
          : 'border-white/10 bg-[#0a0a0c] text-white/45'
      }`}
    >
      <p className="font-bold mb-1">Important</p>
      <p>{AGENT_DISCLAIMER}</p>
      <p className="mt-2">
        Agents can call the same pipeline via{' '}
        <Link href="/api/agent/manifest" className="underline underline-offset-2 font-semibold">
          agent manifest
        </Link>{' '}
        or MCP — see docs/agent/MCP.md.
      </p>
    </div>
  );
}
