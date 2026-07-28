'use client';

import React from 'react';
import Link from 'next/link';
import { SolidPlate, TitleScrim } from '@/components/ui/SolidPlate';
import { AgentToolCatalog } from './AgentToolCatalog';
import { AgentSecuritySection } from './AgentSecuritySection';
import { AgentIntegrationSection } from './AgentIntegrationSection';

function CodeBlock({
  title,
  code,
  isLight,
}: {
  title: string;
  code: string;
  isLight: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  const fill = '#0a0a0c';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };
  return (
    <SolidPlate
      fill={fill}
      className={`rounded-2xl border ${isLight ? 'border-slate-200' : 'border-white/10'}`}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="text-[11px] font-bold text-white/60">{title}</span>
        <button
          type="button"
          onClick={copy}
          className="text-[10px] font-bold uppercase tracking-wide text-white/50 hover:text-white"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-3 text-[11px] sm:text-xs leading-relaxed text-emerald-100/90 overflow-x-auto whitespace-pre-wrap font-mono">
        {code}
      </pre>
    </SolidPlate>
  );
}

export function AgentHowTo({ isLight }: { isLight: boolean }) {
  const base =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5001';

  const curlList = `curl -s -X POST ${base}/api/mcp \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`;

  const curlFind = `curl -s -X POST ${base}/api/mcp \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json' \\
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "find_brand_domains",
      "arguments": {
        "text": "AI scheduling SaaS for dental clinics",
        "count": 8,
        "style": "brandable",
        "maxBudgetUsd": 20,
        "skipAvailability": false
      }
    }
  }'`;

  const curlChat = `curl -s -X POST ${base}/api/ada/chat \\
  -H 'Content-Type: application/json' \\
  -d '{
    "client": "agent",
    "skipIntake": true,
    "maxBudgetUsd": 20,
    "messages": [
      {
        "role": "user",
        "content": "Gym for busy professionals. Extensions: .com .fit. Include: fit, strength. Avoid: cheap. Strategies: radio test, brandable, available first."
      }
    ]
  }'`;

  const curlFindFull = `curl -s -X POST ${base}/api/agent/auto \\
  -H 'Content-Type: application/json' \\
  -d '{
    "text": "Fitness gym for professionals",
    "maxBudgetUsd": 20,
    "brief": {
      "preferredTlds": [".com", ".fit"],
      "mustInclude": ["fit", "strength"],
      "avoid": ["cheap"],
      "strategies": ["available_first", "radio_test", "brandable", "short", "no_hyphen"]
    }
  }'`;

  const curlAuto = `curl -s -X POST ${base}/api/agent/auto \\
  -H 'Content-Type: application/json' \\
  -d '{
    "text": "Eco meal kits for busy families",
    "maxBudgetUsd": 20,
    "brief": { "count": 10, "style": "mixed" }
  }'`;

  const mcpConfig = `{
  "mcpServers": {
    "domaindiscovery": {
      "command": "node",
      "args": ["scripts/mcp-domaindiscovery.mjs"],
      "cwd": "/absolute/path/to/DomainDiscovery"
    }
  }
}`;

  const sectionTitle = isLight ? 'text-slate-900' : 'text-white';
  const muted = isLight ? 'text-slate-500' : 'text-white/55';
  const cardFill = isLight ? '#ffffff' : '#0a0a0c';
  const cardBorder = isLight ? 'border-slate-200' : 'border-white/10';
  const chipFill = isLight ? '#ffffff' : '#121214';

  return (
    <div className="space-y-8">
      <TitleScrim isLight={isLight}>
        <p className={`text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5 ${muted}`}>
          For AI agents
        </p>
        <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${sectionTitle}`}>
          How agents use DomainDiscovery
        </h2>
        <p className={`mt-2 text-sm leading-relaxed max-w-3xl ${muted}`}>
          This page is the <strong className={isLight ? 'text-slate-800' : 'text-white/85'}>Agent Hub</strong> on
          DomainDiscovery: machine-callable tools for domain research. DomainDiscovery is a research toolkit — not a
          registrar. Agents propose and rank names under a budget; humans confirm registration at a registrar that
          supports their workflow.
        </p>
      </TitleScrim>

      <div className="flex flex-wrap gap-2">
        {[
          { href: '#integration', label: 'Integration' },
          { href: '#security', label: 'Security' },
          { href: '/.well-known/agent-card.json', label: 'Agent Card' },
          { href: '/ada/.well-known/agent-card.json', label: 'ADA Agent Card' },
        ].map((l) => (
          <a
            key={l.href}
            href={l.href}
            className={`relative isolate overflow-hidden rounded-full border px-3 py-1 text-[11px] font-bold ${
              isLight ? 'border-slate-200 text-slate-600 hover:border-slate-300' : 'border-white/12 text-white/60 hover:border-white/25'
            }`}
            style={{ backgroundColor: chipFill }}
          >
            {l.label}
          </a>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { t: '1. Connect', d: 'MCP, REST /api/agent/auto, or chat /api/ada/chat' },
          { t: '2. Call tools', d: 'find_brand_domains with brief + maxBudgetUsd' },
          { t: '3. Human confirms', d: 'User registers at registrar — no auto-buy (v1)' },
        ].map((x) => (
          <SolidPlate key={x.t} fill={cardFill} className={`rounded-2xl border p-4 ${cardBorder}`}>
            <p className={`text-sm font-bold ${sectionTitle}`}>{x.t}</p>
            <p className={`mt-1 text-xs ${muted}`}>{x.d}</p>
          </SolidPlate>
        ))}
      </div>

      <div>
        <h3 className={`text-base font-bold mb-2 ${sectionTitle}`}>Tool catalog</h3>
        <AgentToolCatalog isLight={isLight} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <h3 className={`text-base font-bold mb-2 ${sectionTitle}`}>MCP over HTTP (JSON-RPC)</h3>
          <div className="space-y-3">
            <CodeBlock title="tools/list" code={curlList} isLight={isLight} />
            <CodeBlock title="find_brand_domains + $20 budget" code={curlFind} isLight={isLight} />
          </div>
        </div>
        <div>
          <h3 className={`text-base font-bold mb-2 ${sectionTitle}`}>REST auto API</h3>
          <div className="space-y-3">
            <CodeBlock title="POST /api/agent/auto" code={curlAuto} isLight={isLight} />
            <CodeBlock
              title="POST /api/agent/auto (TLDs + include/avoid + strategies)"
              code={curlFindFull}
              isLight={isLight}
            />
            <CodeBlock title="POST /api/ada/chat (conversational agents)" code={curlChat} isLight={isLight} />
            <CodeBlock title="Cursor / Claude Desktop (stdio)" code={mcpConfig} isLight={isLight} />
          </div>
        </div>
      </div>

      <SolidPlate fill={cardFill} className={`rounded-2xl border p-4 sm:p-5 space-y-2 text-sm ${cardBorder}`}>
        <h3 className={`font-bold ${sectionTitle}`}>Endpoints</h3>
        <ul className={`space-y-1 text-xs sm:text-sm font-mono ${muted}`}>
          <li>
            <Link href="/api/mcp" className="underline underline-offset-2">
              /api/mcp
            </Link>{' '}
            — MCP HTTP + JSON-RPC fallback
          </li>
          <li>
            <Link href="/api/agent/auto" className="underline underline-offset-2">
              /api/agent/auto
            </Link>{' '}
            — sync auto shortlist
          </li>
          <li>
            <Link href="/api/agent/manifest" className="underline underline-offset-2">
              /api/agent/manifest
            </Link>{' '}
            — machine-readable capabilities
          </li>
          <li>
            <Link href="/llms.txt" className="underline underline-offset-2">
              /llms.txt
            </Link>{' '}
            — product index for assistants
          </li>
        </ul>
        <p className={`text-xs pt-2 ${muted}`}>
          Optional auth: set <code className="font-mono">AGENT_API_KEY</code> and send{' '}
          <code className="font-mono">Authorization: Bearer …</code>. Local stdio:{' '}
          <code className="font-mono">npm run mcp:server</code>. Full notes:{' '}
          <span className="font-mono">docs/agent/MCP.md</span>.
        </p>
      </SolidPlate>

      <SolidPlate fill={cardFill} className={`rounded-2xl border p-4 sm:p-5 ${cardBorder}`}>
        <h3 className={`font-bold mb-2 ${sectionTitle}`}>Budget contract for agents</h3>
        <p className={`text-xs sm:text-sm leading-relaxed ${muted}`}>
          Pass <code className="font-mono">maxBudgetUsd</code> (e.g. <code className="font-mono">20</code>). Results
          include <code className="font-mono">budgetStatus</code>: <code className="font-mono">within</code> |{' '}
          <code className="font-mono">over</code> | <code className="font-mono">unknown</code>. Prices are research
          snapshots when available — many names have unknown create fees until registrar checkout. Agents must not invent
          prices.
        </p>
      </SolidPlate>

      <SolidPlate fill={cardFill} className={`rounded-2xl border p-4 sm:p-5 ${cardBorder}`}>
        <h3 className={`font-bold mb-2 ${sectionTitle}`}>Product home</h3>
        <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${muted}`}>
          Consumer app &amp; future chat/skills live at{' '}
          <a href="https://www.aidomainassistant.com" className="underline underline-offset-2 font-semibold" target="_blank" rel="noopener noreferrer">
            aidomainassistant.com
          </a>
          . This DomainDiscovery page remains the Agent Hub (MCP + research demo). Local preview:{' '}
          <a href="/ada" className="underline underline-offset-2 font-semibold">
            /ada
          </a>
          .
        </p>
      </SolidPlate>

      <SolidPlate fill={cardFill} className={`rounded-2xl border p-4 sm:p-5 ${cardBorder}`}>
        <h3 className={`font-bold mb-2 ${sectionTitle}`}>Skills, memory &amp; auto-register (roadmap)</h3>
        <ul className={`text-xs sm:text-sm space-y-1.5 ${muted}`}>
          <li>
            · <strong className={isLight ? 'text-slate-800' : 'text-white/80'}>Now:</strong> auto shortlist + rank +
            budget flags + MCP tools (research only).
          </li>
          <li>
            · <strong className={isLight ? 'text-slate-800' : 'text-white/80'}>Next (dedicated Assistant product):</strong>{' '}
            chat UI, brand <em>skills</em>, session memory (liked/rejected names), always-on budget.
          </li>
          <li>
            · <strong className={isLight ? 'text-slate-800' : 'text-white/80'}>Later:</strong> registrar API adapters for
            automated registration + DNS — only after explicit human confirm and hard budget stop, for registrars that
            support full API automation.
          </li>
        </ul>
      </SolidPlate>

      <AgentIntegrationSection isLight={isLight} />
      <AgentSecuritySection isLight={isLight} />

      {/* Safety — fully opaque amber (never bg-amber/5 over ambient dots) */}
      <SolidPlate
        fill={isLight ? '#fffbeb' : '#1a1408'}
        className={`rounded-2xl border p-4 text-xs sm:text-sm leading-relaxed ${
          isLight ? 'border-amber-200 text-amber-950' : 'border-amber-500/30 text-amber-50'
        }`}
      >
        <p className="font-bold mb-1">Safety</p>
        <p>
          DomainDiscovery does not process domain payments or change DNS. Availability and price signals can change.
          Registration and DNS management happen at your registrar (or future connected APIs with confirmation). Not
          trademark legal advice.
        </p>
      </SolidPlate>
    </div>
  );
}
