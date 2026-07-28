'use client';

import React from 'react';
import Link from 'next/link';
import { AGENT_DISCLAIMER } from '@/lib/agent/types';
import { SolidPlate } from '@/components/ui/SolidPlate';

export function AssistantDisclaimer({ isLight }: { isLight: boolean }) {
  return (
    <SolidPlate
      fill={isLight ? '#f8fafc' : '#0a0a0c'}
      className={`rounded-2xl border p-4 text-xs sm:text-sm leading-relaxed ${
        isLight ? 'border-slate-200 text-slate-600' : 'border-white/10 text-white/50'
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
    </SolidPlate>
  );
}
