'use client';

import React from 'react';
import Link from 'next/link';

export function AgentIntegrationSection({ isLight }: { isLight: boolean }) {
  const title = isLight ? 'text-slate-900' : 'text-white';
  const muted = isLight ? 'text-slate-500' : 'text-white/45';
  const card = isLight
    ? 'border-slate-200 bg-white'
    : 'border-white/10 bg-[#0a0a0c]';
  const inset = isLight
    ? 'border-slate-100 bg-slate-50'
    : 'border-white/10 bg-[#121214]';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5001';

  return (
    <section id="integration" className={`shine-border relative isolate overflow-hidden scroll-mt-20 rounded-2xl border p-4 sm:p-5 space-y-3 ${card}`}>
      <h3 className={`text-base sm:text-lg font-black ${title}`}>Integration</h3>
      <p className={`text-xs sm:text-sm leading-relaxed ${muted}`}>
        How external agents and runtimes connect. Same tools power DomainDiscovery Agent Hub and{' '}
        <a href="https://www.aidomainassistant.com" className="underline underline-offset-2 font-semibold">
          aidomainassistant.com
        </a>
        .
      </p>

      <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm">
        <div className={`shine-border relative isolate rounded-xl border p-3 ${inset}`}>
          <p className={`font-bold mb-1 ${title}`}>1. Agent Card (discovery)</p>
          <p className={muted}>
            Fetch{' '}
            <Link href="/.well-known/agent-card.json" className="font-mono underline underline-offset-2">
              /.well-known/agent-card.json
            </Link>{' '}
            or{' '}
            <Link href="/ada/.well-known/agent-card.json" className="font-mono underline underline-offset-2">
              /ada/.well-known/agent-card.json
            </Link>
            . Lists capabilities, endpoints, constraints.
          </p>
        </div>
        <div className={`shine-border relative isolate rounded-xl border p-3 ${inset}`}>
          <p className={`font-bold mb-1 ${title}`}>2. MCP</p>
          <p className={muted}>
            HTTP: <code className="font-mono">POST {origin}/api/mcp</code> · stdio:{' '}
            <code className="font-mono">npm run mcp:server</code>. Primary tool:{' '}
            <code className="font-mono">find_brand_domains</code>.
          </p>
        </div>
        <div className={`shine-border relative isolate rounded-xl border p-3 ${inset}`}>
          <p className={`font-bold mb-1 ${title}`}>3. REST auto</p>
          <p className={muted}>
            <code className="font-mono">POST /api/agent/auto</code> with{' '}
            <code className="font-mono">text</code> + <code className="font-mono">maxBudgetUsd</code>. Poll{' '}
            <code className="font-mono">/api/agent/jobs/:id</code> if async.
          </p>
        </div>
        <div className={`shine-border relative isolate rounded-xl border p-3 ${inset}`}>
          <p className={`font-bold mb-1 ${title}`}>4. Manifest</p>
          <p className={muted}>
            <Link href="/api/agent/manifest" className="font-mono underline underline-offset-2">
              /api/agent/manifest
            </Link>{' '}
            — tool list + install hints. Also{' '}
            <Link href="/llms.txt" className="font-mono underline underline-offset-2">
              /llms.txt
            </Link>
            .
          </p>
        </div>
      </div>

      <div className={`text-xs leading-relaxed ${muted}`}>
        <p className={`font-bold mb-1 ${title}`}>Partner / registrar automation (later)</p>
        <p>
          Future thin orchestrator (ANS-style): you supply registrar credentials; we validate budget, confirm with a
          human, then call register + DNS APIs (Domain Connect where possible). Async job pattern for propagation.
          Not enabled in v1.
        </p>
      </div>
    </section>
  );
}
