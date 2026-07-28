'use client';

import React from 'react';
import { SolidPlate } from '@/components/ui/SolidPlate';

export function AgentSecuritySection({ isLight }: { isLight: boolean }) {
  const title = isLight ? 'text-slate-900' : 'text-white';
  const muted = isLight ? 'text-slate-500' : 'text-white/55';
  const fill = isLight ? '#ffffff' : '#0a0a0c';

  return (
    <SolidPlate
      as="section"
      id="security"
      fill={fill}
      className={`shine-border scroll-mt-20 rounded-2xl border p-4 sm:p-5 ${
        isLight ? 'border-slate-200' : 'border-white/10'
      }`}
    >
        <h3 className={`text-base sm:text-lg font-black mb-2 ${title}`}>Security</h3>
        <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${muted}`}>
          Agent-facing security model for DomainDiscovery / AI Domain Assistant research tools. Inspired by industry
          patterns (DNS-anchored trust, least privilege) — v1 does <strong>not</strong> register domains or change DNS.
        </p>
        <ul className={`space-y-2 text-xs sm:text-sm ${muted}`}>
          <li>
            <strong className={isLight ? 'text-slate-800' : 'text-white/85'}>Auth:</strong> Optional{' '}
            <code className="font-mono text-[11px]">AGENT_API_KEY</code> via{' '}
            <code className="font-mono text-[11px]">Authorization: Bearer …</code> or{' '}
            <code className="font-mono text-[11px]">x-agent-api-key</code> on MCP/HTTP.
          </li>
          <li>
            <strong className={isLight ? 'text-slate-800' : 'text-white/85'}>Budget hard filter:</strong> Agents should
            send <code className="font-mono text-[11px]">maxBudgetUsd</code>. Results use{' '}
            <code className="font-mono text-[11px]">within</code> / <code className="font-mono text-[11px]">over</code> /{' '}
            <code className="font-mono text-[11px]">unknown</code> — never invent prices.
          </li>
          <li>
            <strong className={isLight ? 'text-slate-800' : 'text-white/85'}>No unattended spend:</strong>{' '}
            <code className="font-mono text-[11px]">registersDomains: false</code>,{' '}
            <code className="font-mono text-[11px]">modifiesDns: false</code>. Future automation requires explicit human
            confirm + re-check of budget.
          </li>
          <li>
            <strong className={isLight ? 'text-slate-800' : 'text-white/85'}>Snapshots:</strong> Availability and prices
            change; re-check at registrar checkout.
          </li>
          <li>
            <strong className={isLight ? 'text-slate-800' : 'text-white/85'}>Idempotent tools:</strong> Safe to retry tool
            calls; use job ids for long runs.
          </li>
          <li>
            <strong className={isLight ? 'text-slate-800' : 'text-white/85'}>Secrets:</strong> Never put registrar API keys
            in browser bundles. Rate-limit agent callers.
          </li>
          <li>
            <strong className={isLight ? 'text-slate-800' : 'text-white/85'}>Industry direction:</strong> GoDaddy Agent Name
            Service (ANS) aims for DNS + certificate + Agent Card discovery. We publish an Agent Card now; full ANS
            registration is optional later.
          </li>
        </ul>
    </SolidPlate>
  );
}
